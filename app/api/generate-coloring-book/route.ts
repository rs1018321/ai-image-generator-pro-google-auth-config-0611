import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { auth } from '@/auth'
import { decreaseCredits, CreditsTransType } from '@/services/credit'
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

// 在文件顶部声明 runtime
export const runtime = 'nodejs'

// --- 新增：将水印图片内嵌为Base64常量 ---
const WATERMARK_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAPoAAAAeCAYAAAAFOQOpAAAABmJLR0QA/wD/AP+gvaeTAAAGhUlEQVR4nO2baWxVRRSAP6QiQoUiTxAwSMCqiAqi0bih/jBxJzGauMW4EOWHxl8Y1KiJiYhiJahIMIagsURFI0tRxKACSuoSFdHEhaWSshgWFSko1F5/nDN5t+M8ufP6Svvs+ZLmvpl7Zu6ZuXPmzJy5ha7NUiABepa43je13mNLXK9hFMVhHa2AYRhGe9NeHr0K8eY2kRqdgoqOVuB/ym8drYBhpCk3j9MPeBpYD+wDfgKeBPp4cgOA54FNwH6gEZgNDM7wjKxl64AGYJzqsxd4Xe/5e/QFwDZgBPAGsFPlVwOXBXQYDtRqmT3IymMU8C1Qn6EN7pk7gDOA5UATsB14DTghID8amKft3Q/8DqwExrdRv77ANGAD8JfWPxM4xpM7DHgIWKO6/qp6X56tuVFtiOmb2H402kgOWIcY0ArE4JdpehXQQ+WGIi/ayc1AXlACbEEGqcNfuseUrQN2IUZbr7o8pvdChr4H+AV4B5gATEIGUDMwJlXvcMSAWoDFiFGsRwb+duIM/U9gNzAXuAC4AZnAtgPVKdlzkIlnN/AKYphvAQdUj0uL1K8K+E77YiXwFDLRNSOGPzAlO13lPkIm71lI/7YAV2Rob0wbYvomRtYoAS8iA2Gylz9D82/S9GJN3+PJTdT85ak839BjytZp3ssBXUOGngBzPLkrNX9mKu9tzbs5lVeJGEpCnKEnyGBPczLiWRek8pYhxnCmJ3t9QO8Y/WZr3sNevddo/jxNH4kY5Aee3Kmq17t+4wLEtCGmb2JkjTZSgXiMBqCbd28IMAWZafsjL/uzAvXUIy9tmKbThh5b1hn6RQHZQoZ+nidXpfnvabof4u1Cxnw2xRm6P/ABFiGG1U/T44E7AnL9tY66IvTrgSxzGwhvEVerDpWIoTcjKzb/SHI4+dXaf5G1DRDXNzGynZZyCcYNRYzCLdXTbAYe1N+XIBPBigL1rEKWeKORAZjm9CLLrjuY8ik2euk9enUDeSzQnbAhfY7sO2NIgLWB/LXA1cBpiCdeqPlHa94I4BRk8kR1itVvJNAL8XqPBOR7IuNvFPApsiy+E1kSf4JMwkuQfX8WsrbBkbVvYmU7JeVi6G7G3H0QOReUKyS3Ra+9S1i26SA6pTlQIN+tUnJ63RaQSbz8q4CpAbmx5A1uF+HJYZ9e++p1KFADXEve+zaSn9yK0a9KrycCjwbkHe7dTgS+QYz9Yv2bigTn7qLwSsuRtQ2OrH0TK9spKRdDd57vqAL3eyMG94emC0XX3aDaGbjXlrKlwk0yhQZOH2Cr/q5CvKFPeplcqekWT8ZFvHcgnm4p4oFnIcGytUg7BwI3Fqmfe2e1wC0F5NM0A8/q3xAkeHYdEsdYAhyPBNtCxLTBkaVvipE12kAFYsgbAvdywN9IpDWHvIw1/HsGB4noJsjsD6336LFl3R69KiBbaI+e8+QqyEeaUfkW4MNAnSdR3B79rMC9rxBv1BvxdgnSFz4X0jqGEKNfL8QLbiTsUO5DjtP6IvvwKYhR+yzUescG7jli2gDZ+yZW1igBcwhHxGs0/1ZNOwO815O7jfyxmcOPuseUbQ9DB/FeCeLNHD1Tz4s19OVIsMtxu+bP1fQY8keUaSqBj/VeOhoeo1+t5j3u1T0O8eA/IJPqYGQC+RI4IiVXoXnNyPcNIN47R+t+j21D1r6JlTVKwADEOyRIUG4a8vIS5PjFeeFhSIDOvZwa8ga9ldbnnr6hx5RtL0OvJn9+vAh4DvgeObNNkEBVFtwzd2j56cB8rXc9+TPs7ogxOY84GflGYROy/G5CVjnF6DcQWYW5CaAGeBUJ0O0lHygDeEbl1iFHpjXI8jvR3w5n1F+n8mLbkLVvYmWNEjEAOXNuRAJbPwNP0HqmBRiE7NUakUHVgAxI/+gm9K171rLtZeggZ7QLkE9pmxAvOlJl3w88L4R75mgtvxeZxF4g7x0dg5HvATar3I/IVqgaWTq3AMcVqV8OMY6N5L+Mm49EqtN0B+4GvkCOUpuQSP4EWm+lQoYe24aYvomRNYzMVAOHB/IHEf7ophCFJpe2Uir9OpKYvmmvfjyklNu37l2BemTv6v9H3SS9hgJhh5LOrp8RoFyO17oSLwH3I/vTJcgW5VzgfMSIajtONaDz62cYZUE35FPOeiTo1YQY1QNk+xTU0V5LzlLp15F0uaW7YRiGYRiGYRiGYRiGYRiGYRiGYRiGYRiGYRiGYRiGYZQZ/wCESq1xc8KjbgAAAABJRU5ErkJggg==";

// ------ 更新：水印处理函数 ------
async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log("🖨️ [addWatermark] 使用内嵌图片水印最终方案");

    // --- 配置 ---
    const top_left_right_border = 5; // 上、左、右边框宽度
    const bottom_margin = 25; // 底部包含水印的区域总高度

    // 1. 从Base64常量加载水印文字图片
    const watermarkTextBuffer = Buffer.from(WATERMARK_IMAGE_BASE64, 'base64');
    
    const image = sharp(imageBuffer);
    const meta = await image.metadata();
    const imageWidth = meta.width!;
    const imageHeight = meta.height!;

    // 2. 计算最终图片的尺寸
    const finalWidth = imageWidth + top_left_right_border * 2;
    const finalHeight = imageHeight + top_left_right_border + bottom_margin;

    // 3. 动态缩放水印文字图片以适应底部区域
    const watermarkText = sharp(watermarkTextBuffer);
    const targetWatermarkHeight = Math.round(bottom_margin * 0.5); // 文字高度占底部区域的50%
    const resizedWatermarkTextBuffer = await watermarkText
      .resize({ height: targetWatermarkHeight })
      .toBuffer();
    const resizedWatermarkTextMeta = await sharp(resizedWatermarkTextBuffer).metadata();
    const watermarkWidth = resizedWatermarkTextMeta.width!;

    // 4. 为水印文字创建白色背景板
    const whiteBoxPadding = 4; // 白色背景板的内边距
    const whiteBoxWidth = watermarkWidth + whiteBoxPadding * 2;
    const whiteBoxHeight = targetWatermarkHeight + whiteBoxPadding * 2;
    const whiteBoxBuffer = await sharp({
      create: {
        width: whiteBoxWidth,
        height: whiteBoxHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 } // 白色
      }
    }).png().toBuffer();

    // 5. 计算各元素的位置
    // 白色背景板的位置 (在底部区域内水平和垂直居中)
    const whiteBoxX = Math.round((finalWidth - whiteBoxWidth) / 2);
    const whiteBoxY = imageHeight + top_left_right_border + Math.round((bottom_margin - whiteBoxHeight) / 2);
    
    // 水印文字的位置 (在白色背景板内部)
    const textX = whiteBoxX + whiteBoxPadding;
    const textY = whiteBoxY + whiteBoxPadding;

    // 6. 合成最终图片
    return await sharp({
        create: {
          width: finalWidth,
          height: finalHeight,
          channels: 3,
          background: { r: 0, g: 0, b: 0 } // 黑色背景作为边框
        }
      })
      .composite([
        // 第1层: 原图
        { input: imageBuffer, top: top_left_right_border, left: top_left_right_border },
        // 第2层: 白色背景板
        { input: whiteBoxBuffer, top: whiteBoxY, left: whiteBoxX },
        // 第3层: 水印文字图片
        { input: resizedWatermarkTextBuffer, top: textY, left: textX },
      ])
      .png({
        compressionLevel: 6,
        adaptiveFiltering: false
      })
      .toBuffer();

  } catch (error) {
    console.error("❌ [addWatermark] 添加图片水印失败:", error);
    // 如果失败，返回原图，保证功能可用
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

    // Style prompt 映射 - 使用新的完整prompt
    const stylePromptMapping: { [key: string]: string } = {
      "simplified": "Convert this illustration into an ultra-simple black-and-white coloring-book line drawing. Retain only the outer silhouette of each primary foreground subject. Remove interior markings, textures, small accessories, and all secondary or background elements such as signage, text, floor patterns, or distant scenery. Use clean medium-weight strokes, leave large blank areas, and add no shading, hatching, or textures.",
      "medium": "Convert this illustration into a medium-detailed black-and-white coloring-book line drawing for children. Preserve the outline of every object already present in the original scene and keep simple interior details inside the primary subjects. Do not invent or add any new objects that are not present in the source image. Maintain moderate line density so blank areas remain for coloring, and avoid heavy shading or intricate textures",
      "detailed": "Convert this illustration into an intricate black-and-white coloring-book line drawing for advanced colorists. Translate every colour area into visible line work: apply tightly spaced cross-hatching, parallel strokes or stippling in dark or saturated zones; use medium spacing in mid-tones; even the lightest regions should receive subtle texture with fine strokes—no large blank spaces should remain. Draw contour lines to express form and volume, and preserve all existing surface patterns such as fabric folds, foliage, wood grain or bricks. Represent every tonal difference solely through variations in line weight, spacing and orientation, avoiding solid fills. The final page should feel richly textured across its entire surface while staying clean and printable"
    };

    const stylePrompt = stylePromptMapping[style] || stylePromptMapping["medium"];

    console.log(`Style Prompt: ${stylePrompt}`)

    // 直接使用style prompt，移除原有的共通prompt
    const fullPrompt = stylePrompt;

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
            if (hasWatermark) {
              console.log("添加水印 (ReadableStream)...")
              bufferData = await addWatermark(bufferData);
              console.log("水印添加成功 (ReadableStream)")
            } else {
              console.log("未勾选水印开关，直接返回原图 (ReadableStream)");
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

        if (hasWatermark) {
          console.log("添加水印...")
          const watermarkedBuffer = await addWatermark(Buffer.from(imageBuffer));
          imageData = watermarkedBuffer.toString('base64');
          console.log("水印添加成功")
        } else {
          imageData = Buffer.from(imageBuffer).toString('base64');
          console.log("未勾选水印开关，直接返回原图")
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}