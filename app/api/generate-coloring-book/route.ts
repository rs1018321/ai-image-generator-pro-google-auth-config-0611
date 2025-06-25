import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { auth } from '@/auth'
import { decreaseCredits, CreditsTransType } from '@/services/credit'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

// -- 字体加载 --
// 在模块加载时只执行一次，避免重复读取文件
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans.ttf');
let fontBase64 = '';
try {
  const fontBuffer = fs.readFileSync(fontPath);
  fontBase64 = fontBuffer.toString('base64');
  console.log("✅ [Watermark] 字体文件加载成功。");
} catch (error) {
  console.error("❌ [Watermark] 无法加载字体文件，文字水印将不可用:", error);
}
// --

// ------ 更新：水印处理函数 ------
async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log("🖨️ [addWatermark] 开始添加水印，buffer 大小:", imageBuffer.length);
    const borderPx = 5;
    const text = "coloring page";
    const textColor = "#000000"; // Black text

    const image = sharp(imageBuffer);
    const meta = await image.metadata();
    const imageWidth = meta.width!;
    const imageHeight = meta.height!;

    console.log("🖨️ [addWatermark] 原图尺寸:", imageWidth, imageHeight);

    const finalWidth = imageWidth + borderPx * 2;
    const finalHeight = imageHeight + borderPx * 2;

    console.log("🖨️ [addWatermark] 最终图尺寸:", finalWidth, finalHeight);

    const fontSize = Math.round(imageWidth * 0.025); // 减小字体大小避免问题
    const textPaddingHorizontal = Math.round(fontSize * 0.8);
    const textPaddingVertical = Math.round(fontSize * 0.2); // 垂直内边距

    // 简化文本宽度计算，避免 SVG 字体问题
    const textWidth = text.length * fontSize * 0.6; // 保守估算

    console.log("🖨️ [addWatermark] textWidth:", textWidth);

    const cutoutWidth = Math.round(textWidth + textPaddingHorizontal * 2);
    const cutoutHeight = Math.round(Math.max(borderPx, fontSize + textPaddingVertical * 2));
    const cutoutX = Math.round((finalWidth - cutoutWidth) / 2);
    // 将镂空矩形顶端放在距底部 cutoutHeight 位置
    const cutoutY = finalHeight - cutoutHeight;

    console.log("🖨️ [addWatermark] cutoutWidth:", cutoutWidth, "cutoutHeight:", cutoutHeight);

    // 1. 创建仅包含文字的SVG, 并嵌入字体
    let textBuffer: Buffer | null = null;
    if (fontBase64) {
      const textSvg = `
        <svg width="${cutoutWidth}" height="${cutoutHeight}" xmlns="http://www.w3.org/2000/svg">
          <style>
            @font-face {
              font-family: 'DejaVu Sans';
              src: url('data:font/ttf;base64,${fontBase64}');
            }
          </style>
          <text x="50%" y="50%"
                font-family="DejaVu Sans, sans-serif"
                font-size="${fontSize}"
                fill="${textColor}"
                text-anchor="middle"
                dominant-baseline="central">
              ${text}
          </text>
        </svg>
      `;
      // 2. 将文字SVG转换为PNG Buffer
      textBuffer = await sharp(Buffer.from(textSvg)).png().toBuffer();
      console.log("🖨️ [addWatermark] 文字水印 Buffer 创建成功");
    } else {
      console.log("⚠️ [addWatermark] 字体未加载，跳过文字水印。");
    }

    // 3. 创建白色背景的 Buffer
    const whiteBackground = await sharp({
      create: {
        width: cutoutWidth,
        height: cutoutHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();

    console.log("🖨️ [addWatermark] 白色背景创建成功");
    
    // 4. 合成图层
    const compositeLayers = [
      // 图层1: 将原图置于中心
      { input: imageBuffer, top: borderPx, left: borderPx },
      // 图层2: 在底部边框创建白色镂空背景
      { 
        input: whiteBackground,
        top: cutoutY,
        left: cutoutX
      },
    ];

    // 图层3: 如果文字buffer成功创建，则添加文字
    if (textBuffer) {
      compositeLayers.push({
        input: textBuffer,
        top: cutoutY,
        left: cutoutX
      });
    }

    // 5. 使用 sharp 的 composite 功能合成最终图片
    return await sharp({
        create: {
          width: finalWidth,
          height: finalHeight,
          channels: 4, // 使用4通道以支持透明度
          background: { r: 0, g: 0, b: 0, alpha: 1 } // 黑色边框
        }
      })
      .composite(compositeLayers)
      .png({
        compressionLevel: 6,
        adaptiveFiltering: false
      })
      .toBuffer();
      
  } catch (error) {
    console.error("❌ [addWatermark] 添加水印失败:", error);
    // 如果水印添加失败，返回原图而不是抛出错误
    console.log("⚠️ [addWatermark] 水印添加失败，返回原图");
    return imageBuffer;
  }
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
    console.log("开始处理涂色书生成请求")

    const formData = await request.formData()
    const file = formData.get('image') as File
    const size = formData.get('size') as string || '1024x1024'
    const style = formData.get('style') as string || 'medium'
    // ⚠️ 前端字段 "watermark" = 'true' 表示需要水印，'false' 表示不要水印
    const hasWatermark = formData.get('watermark') === 'true'
    console.log("前端是否需要水印:", hasWatermark)

    if (!file) {
      return NextResponse.json({ error: "未提供图片文件" }, { status: 400 })
    }

    // 转换图片为 base64（只需要做一次）
    const bytes = await file.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString('base64')
    const imageDataUrl = `data:${file.type};base64,${base64Image}`

    console.log(`收到图片文件: ${file.name}, 大小: ${file.size} bytes, 输出尺寸: ${size}`)
    console.log(`Style: ${style}`)

    // Style prompt 映射（与文生图API保持一致）
    const stylePromptMapping: { [key: string]: string } = {
      "simplified": "Few, thick outlines with very simple shapes. Large open areas for easy coloring. No textures or shading lines.",
      "medium": "A moderate number of lines with more varied shapes. Adds light hatching and simple textures for depth. Still leaves plenty of open space to avoid clutter.",
      "detailed": "Dense, fine linework with abundant realistic textures and details. Highly realistic style with rich shading and tonal variation. Minimal blank areas, offering a challenging coloring experience"
    };

    const stylePrompt = stylePromptMapping[style] || stylePromptMapping["medium"];

    console.log(`Style Prompt: ${stylePrompt}`)

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

    console.log(`完整提示词: ${fullPrompt}`)

    // 重试循环（只重试 API 调用部分）
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`第 ${attempt} 次尝试调用 Replicate API`)
        console.log("准备调用 Replicate API: black-forest-labs/flux-kontext-pro")
        console.log("API Token 已设置:", process.env.REPLICATE_API_TOKEN ? '是' : '否')

        const startTime = Date.now()

        // 调用 Replicate API
        // 原来：
        //const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input }) 

        // 改成：
        
        
        //const MODEL = `black-forest-labs/flux-kontext-pro:${latest}`;
        const output = await replicate.run("black-forest-labs/flux-kontext-pro", { input }) as any;


        //const output = await replicate.run(MODEL, { input });
        


        


        console.log(`Replicate API 调用成功`)
        console.log("输出类型:", typeof output)
        console.log("输出构造函数:", output?.constructor?.name)

        // 处理不同类型的 Replicate 输出
        let imageUrl: string

        if (typeof output === 'string') {
          // 直接返回 URL 字符串
          imageUrl = output
          console.log("输出格式: 直接 URL 字符串")
        } else if (Array.isArray(output) && output.length > 0) {
          // 如果返回数组，取第一个元素
          imageUrl = output[0]
          console.log("输出格式: URL 数组")
          
        } else if (output && typeof output.getReader === 'function') {
          // 如果是 ReadableStream，直接读取为二进制图片数据
          console.log("输出格式: ReadableStream (二进制图片数据)")
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
            console.log("文件头:", fullData.slice(0, 8))
            
            let bufferData: Buffer = Buffer.from(fullData);
            // 如果需要，添加水印
            if (hasWatermark) {
              console.log("添加水印 (ReadableStream)...")
              bufferData = await addWatermark(bufferData);
              console.log("水印添加成功 (ReadableStream)")
            } else {
              console.log("无需水印，直接返回原图 (ReadableStream)");
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
          console.log("输出格式: URL 对象")
        } else {
          console.error("未知的输出格式:", output)
          console.error("输出详细信息:", JSON.stringify(output, null, 2))
          throw new Error(`不支持的输出格式: ${typeof output}, constructor: ${output?.constructor?.name}`)
        }

        console.log("解析得到的图片 URL:", imageUrl)

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
          console.log("添加水印...")
          const watermarkedBuffer = await addWatermark(Buffer.from(imageBuffer));
          imageData = watermarkedBuffer.toString('base64');
          console.log("水印添加成功")
        } else {
          imageData = Buffer.from(imageBuffer).toString('base64')
          console.log("无需水印，直接返回原图")
        }

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
          model: "flux-kontext-pro",
          attempt: attempt
        })

      } catch (error: any) {
        console.error(`第 ${attempt} 次尝试失败:`, error)

        if (attempt === maxRetries) {
          console.error("图片生成最终失败:", error.message)
          console.log("❌ 图片生成失败，不扣除积分")
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
        console.log(`等待 ${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

  } catch (error: any) {
    console.error("请求处理失败:", error)
    console.log("❌ 请求处理失败，不扣除积分")
    return NextResponse.json({ 
      error: error.message || "请求处理失败",
      suggestion: '请检查上传的图片格式是否正确'
    }, { status: 500 })
  }
}