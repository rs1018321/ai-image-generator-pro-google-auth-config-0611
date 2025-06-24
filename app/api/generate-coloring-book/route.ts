import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { auth } from '@/auth'
import { decreaseCredits, CreditsTransType } from '@/services/credit'
import sharp from 'sharp'

// ------ 更新：水印处理函数 ------
async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  console.log("🖨️ [addWatermark] 开始添加水印，buffer 大小:", imageBuffer.length);
  const borderPx = 25;
  const text = "coloring page";
  const textColor = "#000000"; // Black text
  const borderColor = "#000000"; // Black border
  const cutoutBackgroundColor = "#FFFFFF"; // White background for text cutout

  const image = sharp(imageBuffer);
  const meta = await image.metadata();
  const imageWidth = meta.width!;
  const imageHeight = meta.height!;

  console.log("🖨️ [addWatermark] 原图尺寸:", imageWidth, imageHeight);

  const finalWidth = imageWidth + borderPx * 2;
  const finalHeight = imageHeight + borderPx * 2;

  console.log("🖨️ [addWatermark] 最终图尺寸:", finalWidth, finalHeight);

  const fontSize = Math.round(imageWidth * 0.030); // 调整字体大小
  const textPaddingHorizontal = Math.round(fontSize * 0.8);

  // 使用 SVG 和 Sharp 动态计算文本宽度
  const probeSvg = `<svg><text font-size="${fontSize}" font-family="sans-serif" font-weight="bold">${text}</text></svg>`;
  const textMetadata = await sharp(Buffer.from(probeSvg)).metadata();
  const textWidth = textMetadata.width!;

  console.log("🖨️ [addWatermark] textWidth:", textWidth);

  const cutoutWidth = textWidth + textPaddingHorizontal * 2;
  const cutoutHeight = borderPx;
  const cutoutX = Math.round((finalWidth - cutoutWidth) / 2);
  const cutoutY = finalHeight - borderPx;

  // 创建文字 SVG
  const textSvg = `
    <svg width="${cutoutWidth}" height="${cutoutHeight}">
      <style>
        .title { 
          font-family: sans-serif;
          font-size: ${fontSize}px; 
          fill: ${textColor}; 
          font-weight: bold;
          text-anchor: middle;
        }
      </style>
      <text x="50%" y="50%" dy="0.35em" class="title">${text}</text>
    </svg>
  `;

  // 使用 sharp 的 composite 功能合成图片
  return sharp({
      create: {
        width: finalWidth,
        height: finalHeight,
        channels: 4, // 使用4通道以支持透明度
        background: borderColor
      }
    })
    .composite([
      // 1. 将原图置于中心
      { input: imageBuffer, top: borderPx, left: borderPx },
      // 2. 在底部边框创建白色镂空背景
      { 
        input: {
          create: {
            width: cutoutWidth,
            height: cutoutHeight,
            channels: 3,
            background: cutoutBackgroundColor
          }
        },
        top: cutoutY,
        left: cutoutX
      },
      // 3. 在白色背景上放置文字
      {
        input: Buffer.from(textSvg),
        top: cutoutY,
        left: cutoutX
      }
    ])
    .png()
    .toBuffer();
}
// --------------------------------


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  const maxRetries = 3
  const baseDelay = 5000

  // 检查 API token
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("❌ REPLICATE_API_TOKEN 环境变量未进行设置")
    return NextResponse.json({ error: "API 配置错误，请联系管理员" }, { status: 500 })
  }

  // 检查用户认证
  const session = await auth()
  if (!session?.user?.uuid) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }

  try {
    console.log("🚀 开始处理涂色书生成请求")

    const formData = await request.formData()
    const file = formData.get('image') as File
    const size = formData.get('size') as string || '1024x1024'
    const style = formData.get('style') as string || 'medium'
    // ⚠️ 前端字段 "watermark" = 'true' 表示需要水印，'false' 表示不要水印
    const hasWatermark = formData.get('watermark') === 'true'
    console.log("💧 前端是否需要水印:", hasWatermark)

    if (!file) {
      return NextResponse.json({ error: "未提供图片文件" }, { status: 400 })
    }

    // 扣除积分
    try {
      await decreaseCredits({
        user_uuid: session.user.uuid,
        trans_type: CreditsTransType.GenerateImage, // 使用专门的生成图片类型
        credits: 2
      })
      console.log("✅ 积分扣除成功")
    } catch (error: any) {
      console.error("❌ 积分扣除失败:", error)
      return NextResponse.json({ 
        error: error.message || "积分不足或扣除失败" 
      }, { status: 400 })
    }

    // 转换图片为 base64（只需要做一次）
    const bytes = await file.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')
    const imageDataUrl = `data:${file.type};base64,${base64Image}`

    console.log(`📁 收到图片文件: ${file.name}, 大小: ${file.size} bytes, 输出尺寸: ${size}`)
    console.log(`🎨 Style: ${style}`)

    // Style prompt 映射（与文生图API保持一致）
    const stylePromptMapping: { [key: string]: string } = {
      "simplified": "Few, thick outlines with very simple shapes. Large open areas for easy coloring. No textures or shading lines.",
      "medium": "A moderate number of lines with more varied shapes. Adds light hatching and simple textures for depth. Still leaves plenty of open space to avoid clutter.",
      "detailed": "Dense, fine linework with abundant realistic textures and details. Highly realistic style with rich shading and tonal variation. Minimal blank areas, offering a challenging coloring experience"
    };

    const stylePrompt = stylePromptMapping[style] || stylePromptMapping["medium"];

    console.log(`📝 Style Prompt: ${stylePrompt}`)

    // 构建完整的提示词：基础要求 + style prompt
    const basePrompt = "Convert this colored illustration into clean black-and-white coloring-book line art. CRITICAL REQUIREMENT: The ENTIRE original image must be preserved completely - DO NOT crop, cut, trim, or remove ANY portion of the original image. ALL elements from edge to edge of the original image must remain visible and intact. Create a larger canvas with the target aspect ratio and place the complete, unmodified original image in the center. Fill the extra space around the original image with pure white background. Think of this as putting a complete postcard into a larger picture frame - the postcard (original image) stays exactly the same size and shape, you just add a white border around it. Draw bold, continuous pure-black strokes for outlines only. Remove all color, shading, gradients and fills, leaving crisp, simple contours. Output as a high-resolution PNG."
    
    const fullPrompt = `${basePrompt} ${stylePrompt}`;

    // 准备 Replicate API 参数
    const input = {
      //image: imageDataUrl,
      input_image: imageDataUrl,  
      prompt: fullPrompt,
      guidance_scale: 2.5,
      num_inference_steps: 28,
      aspect_ratio: size === "1024x1024" ? "1:1" :     // 1:1 正方形
                   size === "832x1248" ? "2:3" :      // 2:3 竖版
                   size === "1248x832" ? "3:2" :      // 3:2 横版
                   "1:1",                              // 默认 1:1
      seed: Math.floor(Math.random() * 1000000)
    }

    console.log(`📝 完整提示词: ${fullPrompt}`)

    // 重试循环（只重试 API 调用部分）
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 第 ${attempt} 次尝试调用 Replicate API`)
        console.log("🌐 准备调用 Replicate API: black-forest-labs/flux-kontext-pro")
        console.log("🔑 API Token 已设置:", process.env.REPLICATE_API_TOKEN ? '是' : '否')

        const startTime = Date.now()

        // 调用 Replicate API
        // 原来：
        //const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input }) 

        // 改成：
        
        
        //const MODEL = `black-forest-labs/flux-kontext-pro:${latest}`;
        const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input }) as any;


        //const output = await replicate.run(MODEL, { input });
        


        


        console.log(`📡 Replicate API 调用成功`)
        console.log("🔍 输出类型:", typeof output)
        console.log("🔍 输出构造函数:", output?.constructor?.name)

        // 处理不同类型的 Replicate 输出
        let imageUrl: string

        if (typeof output === 'string') {
          // 直接返回 URL 字符串
          imageUrl = output
          console.log("📎 输出格式: 直接 URL 字符串")
        } else if (Array.isArray(output) && output.length > 0) {
          // 如果返回数组，取第一个元素
          imageUrl = output[0]
          console.log("📎 输出格式: URL 数组")
          
        } else if (output && typeof output.getReader === 'function') {
          // 如果是 ReadableStream，直接读取为二进制图片数据
          console.log("📎 输出格式: ReadableStream (二进制图片数据)")
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
            
            console.log("📄 获取到图片数据，大小:", fullData.length, "bytes")
            console.log("📄 文件头:", fullData.slice(0, 8))
            
            let bufferData: Buffer = Buffer.from(fullData);
            // 如果需要，添加水印
            if (hasWatermark) {
              console.log("💧 添加水印 (ReadableStream)...")
              bufferData = await addWatermark(bufferData);
              console.log("✅ 水印添加成功 (ReadableStream)")
            } else {
              console.log("✅ 无需水印，直接返回原图 (ReadableStream)");
            }

            const imageData = bufferData.toString('base64');

            console.log("✅ 图片数据转换为 base64 成功，长度:", imageData.length)

            // 直接返回结果，不需要下载步骤
            const processingTime = Date.now() - startTime

            return NextResponse.json({
              success: true,
              image: `data:image/png;base64,${imageData}`,
              processingTime: `${processingTime}ms`,
              model: "flux-kontext-pro",
              attempt: attempt,
              format: "ReadableStream"
            })
            
          } finally {
            reader.releaseLock()
          }
        } else if (output && output.url) {
          // 如果是包含 url 属性的对象
          imageUrl = typeof output.url === 'function' ? output.url() : output.url
          console.log("📎 输出格式: URL 对象")
        } else {
          console.error("❌ 未知的输出格式:", output)
          console.error("❌ 输出详细信息:", JSON.stringify(output, null, 2))
          throw new Error(`不支持的输出格式: ${typeof output}, constructor: ${output?.constructor?.name}`)
        }

        console.log("🔗 解析得到的图片 URL:", imageUrl)

        // 验证 URL 格式
        if (!imageUrl || !imageUrl.startsWith('http')) {
          throw new Error(`无效的图片 URL: ${imageUrl}`)
        }

        // 下载图片并转换为 buffer
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          throw new Error(`下载生成的图片失败: ${imageResponse.status} ${imageResponse.statusText}`)
        }
        
        const imageBuffer = await imageResponse.arrayBuffer()
        let imageData: string;

        // 如果需要，添加水印
        if (hasWatermark) {
          console.log("💧 添加水印...")
          const watermarkedBuffer = await addWatermark(Buffer.from(imageBuffer));
          imageData = watermarkedBuffer.toString('base64');
          console.log("✅ 水印添加成功")
        } else {
          imageData = Buffer.from(imageBuffer).toString('base64')
          console.log("✅ 无需水印，直接返回原图")
        }

        console.log("✅ 图片转换为 base64 成功，长度:", imageData.length)

        // 如果成功，返回结果
        const processingTime = Date.now() - startTime
        
        return NextResponse.json({
          success: true,
          image: `data:image/png;base64,${imageData}`,
          processingTime: `${processingTime}ms`,
          model: "flux-kontext-pro",
          attempt: attempt
        })

      } catch (error: any) {
        console.error(`❌ 第 ${attempt} 次尝试失败:`, error)

        if (attempt === maxRetries) {
          console.error("❌ 图片生成最终失败:", error.message)
          return NextResponse.json({ 
            error: error.message || "图片生成失败",
            model: "flux-kontext-pro",
            attempts: maxRetries,
            suggestion: error.message.includes('rate limit') ? '请稍后再试，API 调用频率限制' :
                       error.message.includes('timeout') ? '请尝试使用更小的图片或降低质量' :
                       error.message.includes('Unauthorized') || error.message.includes('authentication') ? 'API 认证失败，请检查配置' :
                       error.message.includes('invalid') ? '请检查图片格式是否正确' : 
                       '请检查网络连接或稍后重试'
          }, { status: 500 })
        }

        // 等待后重试
        const delay = baseDelay * attempt
        console.log(`⏳ 等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

  } catch (error: any) {
    console.error("❌ 请求处理失败:", error)
    return NextResponse.json({ 
      error: error.message || "请求处理失败",
      suggestion: '请检查上传的图片格式是否正确'
    }, { status: 500 })
  }
}