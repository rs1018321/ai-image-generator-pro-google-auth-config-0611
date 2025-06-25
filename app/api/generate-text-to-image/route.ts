import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { auth } from '@/auth'
import { decreaseCredits, CreditsTransType } from '@/services/credit'
import sharp from 'sharp'

const replicate = new Replicate({
  auth: process.env.REPLICATE_TEXT_API_TOKEN!,  // 使用文生图专用的 API Token
})

// 添加水印函数 - 优化 Vercel 环境兼容性
async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log("🎨 开始添加水印到生成的图片");
    
    // 获取图片信息
    const { width, height } = await sharp(imageBuffer).metadata();
    if (!width || !height) {
      throw new Error("无法获取图片尺寸信息");
    }
    
    console.log(`📐 图片尺寸: ${width}x${height}`);
    
    // 水印设置 - 简化版本，避免字体问题
    const borderPx = 15; // 边框厚度 15px
    const fontSize = Math.max(20, Math.min(width * 0.03, 36)); // 减小字体大小
    const text = "coloring page";
    const textPaddingHorizontal = 16;
    const textPaddingVertical = 6;
    
    // 计算文本宽度（保守估算）
    const textWidth = text.length * fontSize * 0.5;
    
    // 计算裁剪区域的尺寸和位置
    const cutoutWidth = textWidth + textPaddingHorizontal * 2;
    const cutoutHeight = Math.max(fontSize + textPaddingVertical * 2, borderPx + textPaddingVertical);
    const cutoutX = Math.max(0, (width - cutoutWidth) / 2);
    const cutoutY = Math.max(0, height - cutoutHeight);
    
    // 创建简化的 SVG 水印 - 避免字体配置问题
    const svgWatermark = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- 黑色边框 -->
        <rect x="0" y="0" width="${width}" height="${borderPx}" fill="black"/>
        <rect x="0" y="${height - borderPx}" width="${width}" height="${borderPx}" fill="black"/>
        <rect x="0" y="0" width="${borderPx}" height="${height}" fill="black"/>
        <rect x="${width - borderPx}" y="0" width="${borderPx}" height="${height}" fill="black"/>
        
        <!-- 底部文字区域的白色背景 -->
        <rect x="${cutoutX}" y="${cutoutY}" width="${cutoutWidth}" height="${cutoutHeight}" fill="white" stroke="black" stroke-width="1"/>
        
        <!-- 居中文字 - 使用系统默认字体 -->
        <text x="${width / 2}" y="${height - textPaddingVertical - 2}" 
              font-family="monospace, sans-serif" 
              font-size="${fontSize}" 
              font-weight="normal"
              fill="black" 
              text-anchor="middle" 
              dominant-baseline="text-bottom">
          ${text}
        </text>
      </svg>
    `;
    
    console.log("🖼️ SVG水印创建完成");
    
    // 使用更安全的 Sharp 配置
    const watermarkedImage = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          top: 0,
          left: 0,
        }
      ])
      .png({
        // 优化 PNG 输出
        compressionLevel: 6,
        adaptiveFiltering: false
      })
      .toBuffer();
    
    console.log("✅ 水印添加成功");
    return watermarkedImage;
    
  } catch (error) {
    console.error("❌ 添加水印失败:", error);
    // 如果水印添加失败，返回原图而不是抛出错误
    console.log("⚠️ 水印添加失败，返回原图");
    return imageBuffer;
  }
}

export async function POST(request: NextRequest) {
  const maxRetries = 3
  const baseDelay = 5000

  // 检查 API token
  if (!process.env.REPLICATE_TEXT_API_TOKEN) {
    console.error("❌ REPLICATE_TEXT_API_TOKEN 环境变量未进行设置")
    return NextResponse.json({ error: "API 配置错误，请联系管理员" }, { status: 500 })
  }

  // 检查用户认证
  const session = await auth()
  if (!session?.user?.uuid) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }

  try {
    console.log("开始处理文生图请求")

    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const size = formData.get('size') as string || '1024x1024'
    const style = formData.get('style') as string || 'medium'
    const hasWatermark = formData.get('watermark') === 'true'
    console.log(`💧 水印设置: ${hasWatermark ? '需要水印' : '无需水印'}`)

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: "请提供描述内容" }, { status: 400 })
    }

    console.log(`收到文字描述: ${prompt}, 输出尺寸: ${size}`)
    console.log(`Style: ${style}`)

    // Style prompt 映射
    const stylePromptMapping: { [key: string]: string } = {
      "simplified": "Few, thick outlines with very simple shapes. Large open areas for easy coloring. No textures or shading lines.",
      "medium": "A moderate number of lines with more varied shapes. Adds light hatching and simple textures for depth. Still leaves plenty of open space to avoid clutter.",
      "detailed": "Dense, fine linework with abundant realistic textures and details. Highly realistic style with rich shading and tonal variation. Minimal blank areas, offering a challenging coloring experience"
    };

    const stylePrompt = stylePromptMapping[style] || stylePromptMapping["medium"];

    console.log(`Style Prompt: ${stylePrompt}`)

    // 构建完整的提示词：用户描述 + 转换要求 + style prompt
    const basePrompt = "Convert this description into clean black-and-white coloring-book line art. Draw bold, continuous pure-black strokes for outlines only. Remove all color, shading, gradients and fills, leaving crisp, simple contours. Output as a high-resolution PNG."
    
    const fullPrompt = `${prompt}. ${basePrompt} ${stylePrompt}`;

    // 准备 MiniMax API 参数 - 与 generate-text-sketch 保持一致
    const input = {
      prompt: fullPrompt,
      aspect_ratio: size === "1024x1024" ? "1:1" :     // 1:1 正方形
                   size === "832x1248" ? "2:3" :      // 2:3 竖版
                   size === "1248x832" ? "3:2" :      // 3:2 横版
                   "1:1",                              // 默认 1:1
      seed: Math.floor(Math.random() * 1000000)
    }

    console.log(`完整提示词: ${fullPrompt}`)

    // 重试循环（只重试 API 调用部分）
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`第 ${attempt} 次尝试调用 MiniMax API`)
        console.log("准备调用 Replicate API: minimax/image-01")
        console.log("API Token 已设置:", process.env.REPLICATE_TEXT_API_TOKEN ? '是' : '否')

        const startTime = Date.now()

        // 调用 MiniMax API
        const output = await replicate.run("minimax/image-01", { input }) as any;

        console.log(`MiniMax API 调用成功`)
        console.log("输出类型:", typeof output)
        console.log("输出构造函数:", output?.constructor?.name)

        // 处理 MiniMax 模型的输出 - 通常返回 URL 数组
        let imageUrl: string | null = null
        let isReadableStream = false

        if (Array.isArray(output) && output.length > 0) {
          // 检查数组第一个元素的类型
          const firstElement = output[0]
          
          if (typeof firstElement === 'string' && firstElement.startsWith('http')) {
            // MiniMax 返回 URL 数组
            imageUrl = firstElement
            console.log("输出格式: MiniMax URL 数组")
          } else if (firstElement && typeof firstElement.getReader === 'function') {
            // MiniMax 返回 ReadableStream 数组
            console.log("输出格式: MiniMax ReadableStream 数组")
            isReadableStream = true
            
            // 处理 ReadableStream
            const reader = firstElement.getReader()
            const chunks = []
            
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                chunks.push(value)
              }
              
              // 将 chunks 合并为完整的图片数据
              const fullData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
              let offset = 0
              for (const chunk of chunks) {
                fullData.set(chunk, offset)
                offset += chunk.length
              }
              
              console.log("获取到图片数据，大小:", fullData.length, "bytes")
              
              // 创建 Buffer 并检查是否需要添加水印
              let bufferData: Buffer = Buffer.from(fullData);
              if (hasWatermark) {
                console.log("添加水印中...")
                bufferData = await addWatermark(bufferData);
                console.log("水印添加完成")
              } else {
                console.log("跳过水印添加")
              }

              const imageData = bufferData.toString('base64');

              console.log("图片数据转换为 base64 成功，长度:", imageData.length)

              // 🎯 图片生成成功后扣除积分
              try {
                await decreaseCredits({
                  user_uuid: session.user.uuid,
                  trans_type: CreditsTransType.GenerateImage,
                  credits: 1
                })
                console.log("✅ 图片生成成功，积分扣除完成")
              } catch (error: any) {
                console.error("⚠️ 积分扣除失败，但图片已生成:", error)
                // 积分扣除失败不影响图片返回，只记录日志
              }

              // 直接返回结果，不需要下载步骤
              const processingTime = Date.now() - startTime

              return NextResponse.json({
                success: true,
                image: `data:image/png;base64,${imageData}`,
                processingTime: `${processingTime}ms`,
                model: "minimax/image-01",
                attempt: attempt,
                format: "ReadableStream Array"
              })
              
            } finally {
              reader.releaseLock()
            }
          } else {
            console.error("数组第一个元素类型未知:", typeof firstElement, firstElement)
            throw new Error(`数组第一个元素类型不支持: ${typeof firstElement}`)
          }
        } else if (typeof output === 'string') {
          // 直接返回 URL 字符串
          imageUrl = output
          console.log("输出格式: 直接 URL 字符串")
        } else if (output && typeof output.getReader === 'function') {
          // 如果是 ReadableStream，直接读取为二进制图片数据
          console.log("输出格式: ReadableStream (二进制图片数据)")
          isReadableStream = true
          
          const reader = output.getReader()
          const chunks = []
          
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              chunks.push(value)
            }
            
            // 将 chunks 合并为完整的图片数据
            const fullData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
            let offset = 0
            for (const chunk of chunks) {
              fullData.set(chunk, offset)
              offset += chunk.length
            }
            
            console.log("获取到图片数据，大小:", fullData.length, "bytes")
            
            // 创建 Buffer 并检查是否需要添加水印
            let bufferData: Buffer = Buffer.from(fullData);
            if (hasWatermark) {
              console.log("添加水印中...")
              bufferData = await addWatermark(bufferData);
              console.log("水印添加完成")
            } else {
              console.log("跳过水印添加")
            }

            const imageData = bufferData.toString('base64');

            console.log("图片数据转换为 base64 成功，长度:", imageData.length)

            // 🎯 图片生成成功后扣除积分
            try {
              await decreaseCredits({
                user_uuid: session.user.uuid,
                trans_type: CreditsTransType.GenerateImage,
                credits: 1
              })
              console.log("✅ 图片生成成功，积分扣除完成")
            } catch (error: any) {
              console.error("⚠️ 积分扣除失败，但图片已生成:", error)
              // 积分扣除失败不影响图片返回，只记录日志
            }

            // 直接返回结果，不需要下载步骤
            const processingTime = Date.now() - startTime

            return NextResponse.json({
              success: true,
              image: `data:image/png;base64,${imageData}`,
              processingTime: `${processingTime}ms`,
              model: "minimax/image-01",
              attempt: attempt,
              format: "ReadableStream"
            })
            
          } finally {
            reader.releaseLock()
          }
        } else if (output && output.url) {
          // 如果是包含 url 属性的对象
          imageUrl = typeof output.url === 'function' ? output.url() : output.url
          console.log("输出格式: URL 对象")
        } else {
          console.error("未知的输出格式:", output)
          console.error("输出详细信息:", JSON.stringify(output, null, 2))
          throw new Error(`不支持的输出格式: ${typeof output}, constructor: ${output?.constructor?.name}`)
        }

        // 如果已经通过 ReadableStream 处理完成，上面的代码已经返回了
        // 下面的代码只处理 URL 的情况
        if (!isReadableStream && imageUrl) {
          console.log("解析得到的图片 URL:", imageUrl)

          // 验证 URL 格式
          if (!imageUrl || !imageUrl.startsWith('http')) {
            throw new Error(`无效的图片 URL: ${imageUrl}`)
          }

          // 下载图片并转换为 base64
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            throw new Error(`下载生成的图片失败: ${imageResponse.status} ${imageResponse.statusText}`)
          }
          
          let imageBuffer: Buffer = Buffer.from(await imageResponse.arrayBuffer())
          
          // 如果需要，添加水印
          if (hasWatermark) {
            console.log("添加水印中...")
            imageBuffer = await addWatermark(imageBuffer);
            console.log("水印添加完成")
          } else {
            console.log("跳过水印添加")
          }

          const imageData = imageBuffer.toString('base64')

          console.log("图片转换为 base64 成功，长度:", imageData.length)

          // 🎯 图片生成成功后扣除积分
          try {
            await decreaseCredits({
              user_uuid: session.user.uuid,
              trans_type: CreditsTransType.GenerateImage,
              credits: 1
            })
            console.log("✅ 图片生成成功，积分扣除完成")
          } catch (error: any) {
            console.error("⚠️ 积分扣除失败，但图片已生成:", error)
            // 积分扣除失败不影响图片返回，只记录日志
          }

          // 如果成功，返回结果
          const processingTime = Date.now() - startTime
          
          return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${imageData}`,
            processingTime: `${processingTime}ms`,
            model: "minimax/image-01",
            attempt: attempt,
            format: "URL"
          })
        }

        // 如果既不是 ReadableStream 也没有有效的 URL，抛出错误
        throw new Error("无法处理 MiniMax 模型的输出格式")

      } catch (error: any) {
        console.error(`第 ${attempt} 次尝试失败:`, error)

        if (attempt === maxRetries) {
          console.error("图片生成最终失败:", error.message)
          console.log("❌ 图片生成失败，不扣除积分")
          return NextResponse.json({ 
            error: error.message || "图片生成失败",
            model: "minimax/image-01",
            attempts: maxRetries,
            suggestion: error.message.includes('rate limit') ? '请稍后再试，API 调用频率限制' :
                       error.message.includes('timeout') ? '请尝试使用更简单的描述' :
                       error.message.includes('Unauthorized') || error.message.includes('authentication') ? 'API 认证失败，请检查配置' :
                       error.message.includes('invalid') ? '请检查描述内容是否合适' : 
                       '请检查网络连接或稍后重试'
          }, { status: 500 })
        }

        // 等待后重试
        const delay = baseDelay * attempt
        console.log(`等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

  } catch (error: any) {
    console.error("请求处理失败:", error)
    console.log("❌ 请求处理失败，不扣除积分")
    return NextResponse.json({ 
      error: error.message || "请求处理失败",
      suggestion: '请检查输入内容是否正确'
    }, { status: 500 })
  }
} 