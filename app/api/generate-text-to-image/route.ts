import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { auth } from '@/auth'
import { decreaseCredits, CreditsTransType } from '@/services/credit'
import sharp from 'sharp'
import { getRecommendedModel } from '@/lib/language-detector'
import path from 'path'
import fs from 'fs/promises'

const replicate = new Replicate({
  auth: process.env.REPLICATE_TEXT_API_TOKEN!,  // 使用文生图专用的 API Token
})

// Flux 模型需要的 Replicate 实例（使用不同的 token）
const fluxReplicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,  // 使用图生图的 API Token
})

// 添加水印函数 - 使用lib/assets/watermark-text.png图片
async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log("🎨 使用lib/assets/watermark-text.png图片水印");
    
    // 获取图片信息
    const { width, height } = await sharp(imageBuffer).metadata();
    if (!width || !height) {
      throw new Error("无法获取图片尺寸信息");
    }
    
    console.log(`📐 图片尺寸: ${width}x${height}`);
    
    // 水印设置
    const bottomHeight = 30; // 底部水印区域高度，与图生图保持一致
    
    // 读取水印图片文件 - 修改为lib/assets路径
    const watermarkPath = path.join(process.cwd(), 'lib', 'assets', 'watermark-text.png');
    console.log(`🔍 读取水印图片: ${watermarkPath}`);
    
    const watermarkBuffer = await fs.readFile(watermarkPath);
    console.log(`✅ 水印图片读取成功，大小: ${watermarkBuffer.length} bytes`);

    // 获取水印图片信息并调整大小
    const watermarkMeta = await sharp(watermarkBuffer).metadata();
    const targetHeight = Math.round(bottomHeight * 0.7); // 水印高度为底部区域的70%
    
    const resizedWatermarkBuffer = await sharp(watermarkBuffer)
      .resize({ height: targetHeight })
      .toBuffer();
    
    const resizedMeta = await sharp(resizedWatermarkBuffer).metadata();
    console.log(`🎨 水印调整后尺寸: ${resizedMeta.width}x${resizedMeta.height}`);

    // 计算最终图片尺寸（去掉边框，只增加底部高度）
    const finalWidth = width;
    const finalHeight = height + bottomHeight;
    
    // 计算水印位置 (底部居中)
    const watermarkX = Math.round((finalWidth - resizedMeta.width!) / 2);
    const watermarkY = height + Math.round((bottomHeight - resizedMeta.height!) / 2);
    
    console.log(`🖨️ 最终尺寸: ${finalWidth}x${finalHeight}`);
    console.log(`🖨️ 水印位置: x=${watermarkX}, y=${watermarkY}`);
    
    console.log("🖼️ 创建简洁水印（无边框）");
    
    // 使用Sharp合成
    const watermarkedImage = await sharp({
        create: {
          width: finalWidth,
          height: finalHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 } // 白色背景
        }
      })
      .composite([
        // 第1层: 原图
        {
          input: imageBuffer,
          top: 0,
          left: 0,
        },
        // 第2层: 水印图片（直接在白色底部区域显示）
        {
          input: resizedWatermarkBuffer,
          top: watermarkY,
          left: watermarkX,
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

  // 检查用户认证
  const session = await auth()
  if (!session?.user?.uuid) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 })
  }

  try {
    console.log("🚀 开始处理智能文生图请求")

    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const size = formData.get('size') as string || '1024x1024'
    const style = formData.get('style') as string || 'medium'
    const hasWatermark = formData.get('watermark') === 'true'

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: "请提供描述内容" }, { status: 400 })
    }

    console.log(`📝 收到文字描述: ${prompt}`)
    console.log(`📐 输出尺寸: ${size}`)
    console.log(`🎨 Style: ${style}`)
    console.log(`💧 水印设置: ${hasWatermark ? '需要水印' : '无需水印'}`)

    // 🎯 核心功能：根据语言自动选择模型
    const recommendedModel = getRecommendedModel(prompt);
    const useFlux = recommendedModel === 'flux';
    
    console.log(`🤖 根据语言检测选择模型: ${useFlux ? 'Flux (英语)' : 'MiniMax (非英语)'}`);

    // 检查对应的 API token
    if (useFlux && !process.env.REPLICATE_API_TOKEN) {
      console.error("❌ REPLICATE_API_TOKEN 环境变量未设置 (Flux模型需要)")
      return NextResponse.json({ error: "Flux API 配置错误，请联系管理员" }, { status: 500 })
    }
    
    if (!useFlux && !process.env.REPLICATE_TEXT_API_TOKEN) {
      console.error("❌ REPLICATE_TEXT_API_TOKEN 环境变量未设置 (MiniMax模型需要)")
      return NextResponse.json({ error: "MiniMax API 配置错误，请联系管理员" }, { status: 500 })
    }

    // Style prompt 映射 - 使用新的完整prompt
    const stylePromptMapping: { [key: string]: string } = {
      "simplified": "create an ultra-simple black-and-white coloring-book line drawing. Use only pure black lines on a pure white background—no gray, no colour. Draw two to four large, easily recognisable shapes (characters, objects, or icons) evenly distributed across the page so the composition feels balanced. Outline each shape with widely spaced, clean medium-weight strokes and leave its interior mostly empty. Outside the shapes, keep some white space but avoid huge uninterrupted blanks. Add no interior details, textures, accessories, text, background scenery, shading, hatching, stippling or solid fills. The overall theme and imagery must follow a familiar Western style. no any colors!",
      "medium": "Create a medium-detailed black-and-white coloring-book line drawing for children. Only black lines on white—no colour. Draw every described object plus essential background shapes in a clear Western aesthetic. Add simple interior lines (faces, folds, basic textures). Keep roughly one-third to one-half of the page blank. Use moderately dense line work with light, widely spaced hatching or stippling for gentle shading. Do not invent objects that are not requested.. The overall theme and imagery must follow a familiar Western style. no any colors!",
      "detailed": "Create an intricate black-and-white coloring-book line drawing for advanced hobbyists. Strictly monochrome—no colour. Cover at least 90 % of the canvas with line art in a realistic Western-style scene. Convert every tonal difference into line work: dense cross-hatching, parallel strokes or stippling in dark areas; medium spacing in mid-tones; subtle texture even in highlights—no large blank regions. Outline all forms and include rich surface details such as fabric folds, foliage, wood grain and bricks. Use variations in line weight, spacing and orientation only; avoid solid fills. The overall theme and imagery must follow a familiar Western style. no any colors!"
    };

    const stylePrompt = stylePromptMapping[style] || stylePromptMapping["medium"];
    console.log(`🎨 Style Prompt: ${stylePrompt}`);

    let fullPrompt: string;
    let modelName: string;
    let input: any;

    if (useFlux) {
      // 🔥 Flux 模型（英语输入）
      modelName = "black-forest-labs/flux-kontext-pro";
      // 直接使用用户描述 + style prompt，移除原有的共通prompt
      fullPrompt = `${prompt}. ${stylePrompt}`;
      
      input = {
        prompt: fullPrompt,
        guidance_scale: 2.5,
        num_inference_steps: 28,
        aspect_ratio: size === "1024x1024" ? "1:1" :
                     size === "832x1248" ? "2:3" :
                     size === "1248x832" ? "3:2" :
                     "1:1",
        seed: Math.floor(Math.random() * 1000000)
      };
    } else {
      // 🔥 MiniMax 模型（非英语输入）
      modelName = "minimax/image-01";
      // 直接使用用户描述 + style prompt，移除原有的共通prompt
      fullPrompt = `${prompt}. ${stylePrompt}`;
      
      input = {
        prompt: fullPrompt,
        aspect_ratio: size === "1024x1024" ? "1:1" :
                     size === "832x1248" ? "2:3" :
                     size === "1248x832" ? "3:2" :
                     "1:1",
        seed: Math.floor(Math.random() * 1000000)
      };
    }

    console.log(`🎯 完整提示词: ${fullPrompt}`);
    console.log(`🚀 使用模型: ${modelName}`);

    // 重试循环（只重试 API 调用部分）
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📡 第 ${attempt} 次尝试调用 ${useFlux ? 'Flux' : 'MiniMax'} API`);
        console.log(`🔑 API Token 已设置: ${useFlux ? (process.env.REPLICATE_API_TOKEN ? '是' : '否') : (process.env.REPLICATE_TEXT_API_TOKEN ? '是' : '否')}`);

        const startTime = Date.now()

        // 根据模型选择对应的 Replicate 实例
        const replicateInstance = useFlux ? fluxReplicate : replicate;
        const output = await replicateInstance.run(modelName as any, { input }) as any;

        console.log(`✅ ${useFlux ? 'Flux' : 'MiniMax'} API 调用成功`);
        console.log("📋 输出类型:", typeof output);
        console.log("📋 输出构造函数:", output?.constructor?.name);

        // 处理不同模型的输出格式
        let imageUrl: string | null = null
        let isReadableStream = false

        if (Array.isArray(output) && output.length > 0) {
          const firstElement = output[0]
          
          if (typeof firstElement === 'string' && firstElement.startsWith('http')) {
            imageUrl = firstElement
            console.log(`📎 ${useFlux ? 'Flux' : 'MiniMax'} 输出格式: URL 数组`);
          } else if (firstElement && typeof firstElement.getReader === 'function') {
            console.log(`📎 ${useFlux ? 'Flux' : 'MiniMax'} 输出格式: ReadableStream 数组`);
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
              
              const fullData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
              let offset = 0
              for (const chunk of chunks) {
                fullData.set(chunk, offset)
                offset += chunk.length
              }
              
              console.log("📄 获取到图片数据，大小:", fullData.length, "bytes")
              
              let bufferData: Buffer = Buffer.from(fullData);
              if (hasWatermark) {
                console.log("🎨 添加水印中...")
                bufferData = await addWatermark(bufferData);
                console.log("✅ 水印添加完成")
              } else {
                console.log("⏭️ 跳过水印添加")
              }

              const imageData = bufferData.toString('base64');
              console.log("✅ 图片数据转换为 base64 成功，长度:", imageData.length)

              // 扣除积分
              try {
                await decreaseCredits({
                  user_uuid: session.user.uuid,
                  trans_type: CreditsTransType.GenerateImage,
                  credits: 1
                })
                console.log("💰 图片生成成功，积分扣除完成")
              } catch (error: any) {
                console.error("⚠️ 积分扣除失败，但图片已生成:", error)
              }

              const processingTime = Date.now() - startTime
              return NextResponse.json({
                success: true,
                image: `data:image/png;base64,${imageData}`,
                processingTime: `${processingTime}ms`,
                model: modelName,
                modelType: useFlux ? 'flux' : 'minimax',
                language: useFlux ? 'english' : 'non-english',
                attempt: attempt,
                format: "ReadableStream Array"
              })
              
            } finally {
              reader.releaseLock()
            }
          } else {
            console.error("❌ 数组第一个元素类型未知:", typeof firstElement, firstElement)
            throw new Error(`数组第一个元素类型不支持: ${typeof firstElement}`)
          }
        } else if (typeof output === 'string') {
          imageUrl = output
          console.log(`📎 ${useFlux ? 'Flux' : 'MiniMax'} 输出格式: 直接 URL 字符串`);
        } else if (output && typeof output.getReader === 'function') {
          console.log(`📎 ${useFlux ? 'Flux' : 'MiniMax'} 输出格式: ReadableStream (二进制图片数据)`);
          isReadableStream = true
          
          const reader = output.getReader()
          const chunks = []
          
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              chunks.push(value)
            }
            
            const fullData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
            let offset = 0
            for (const chunk of chunks) {
              fullData.set(chunk, offset)
              offset += chunk.length
            }
            
            console.log("📄 获取到图片数据，大小:", fullData.length, "bytes")
            
            let bufferData: Buffer = Buffer.from(fullData);
            if (hasWatermark) {
              console.log("🎨 添加水印中...")
              bufferData = await addWatermark(bufferData);
              console.log("✅ 水印添加完成")
            } else {
              console.log("⏭️ 跳过水印添加")
            }

            const imageData = bufferData.toString('base64');
            console.log("✅ 图片数据转换为 base64 成功，长度:", imageData.length)

            // 扣除积分
            try {
              await decreaseCredits({
                user_uuid: session.user.uuid,
                trans_type: CreditsTransType.GenerateImage,
                credits: 1
              })
              console.log("💰 图片生成成功，积分扣除完成")
            } catch (error: any) {
              console.error("⚠️ 积分扣除失败，但图片已生成:", error)
            }

            const processingTime = Date.now() - startTime
            return NextResponse.json({
              success: true,
              image: `data:image/png;base64,${imageData}`,
              processingTime: `${processingTime}ms`,
              model: modelName,
              modelType: useFlux ? 'flux' : 'minimax',
              language: useFlux ? 'english' : 'non-english',
              attempt: attempt,
              format: "ReadableStream"
            })
            
          } finally {
            reader.releaseLock()
          }
        } else if (output && output.url) {
          imageUrl = typeof output.url === 'function' ? output.url() : output.url
          console.log(`📎 ${useFlux ? 'Flux' : 'MiniMax'} 输出格式: URL 对象`);
        } else {
          console.error("❌ 未知的输出格式:", output)
          console.error("❌ 输出详细信息:", JSON.stringify(output, null, 2))
          throw new Error(`不支持的输出格式: ${typeof output}, constructor: ${output?.constructor?.name}`)
        }

        // 如果已经通过 ReadableStream 处理完成，上面的代码已经返回了
        // 下面的代码只处理 URL 的情况
        if (!isReadableStream && imageUrl) {
          console.log("🔗 解析得到的图片 URL:", imageUrl)

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
            console.log("🎨 添加水印中...")
            imageBuffer = await addWatermark(imageBuffer);
            console.log("✅ 水印添加完成")
          } else {
            console.log("⏭️ 跳过水印添加")
          }

          const imageData = imageBuffer.toString('base64')
          console.log("✅ 图片转换为 base64 成功，长度:", imageData.length)

          // 扣除积分
          try {
            await decreaseCredits({
              user_uuid: session.user.uuid,
              trans_type: CreditsTransType.GenerateImage,
              credits: 1
            })
            console.log("💰 图片生成成功，积分扣除完成")
          } catch (error: any) {
            console.error("⚠️ 积分扣除失败，但图片已生成:", error)
          }

          const processingTime = Date.now() - startTime
          return NextResponse.json({
            success: true,
            image: `data:image/png;base64,${imageData}`,
            processingTime: `${processingTime}ms`,
            model: modelName,
            modelType: useFlux ? 'flux' : 'minimax',
            language: useFlux ? 'english' : 'non-english',
            attempt: attempt,
            format: "URL"
          })
        }

        // 如果既不是 ReadableStream 也没有有效的 URL，抛出错误
        throw new Error(`无法处理 ${useFlux ? 'Flux' : 'MiniMax'} 模型的输出格式`)

      } catch (error: any) {
        console.error(`❌ 第 ${attempt} 次尝试失败:`, error)

        if (attempt === maxRetries) {
          console.error("❌ 图片生成最终失败:", error.message)
          console.log("❌ 图片生成失败，不扣除积分")
          return NextResponse.json({ 
            error: error.message || "图片生成失败",
            model: modelName,
            modelType: useFlux ? 'flux' : 'minimax',
            language: useFlux ? 'english' : 'non-english',
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
        console.log(`⏳ 等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

  } catch (error: any) {
    console.error("❌ 请求处理失败:", error)
    console.log("❌ 请求处理失败，不扣除积分")
    return NextResponse.json({ 
      error: error.message || "请求处理失败",
      suggestion: '请检查输入内容是否正确'
    }, { status: 500 })
  }
} 