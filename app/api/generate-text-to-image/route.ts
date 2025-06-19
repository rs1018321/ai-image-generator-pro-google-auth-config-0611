import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { auth } from '@/auth'
import { decreaseCredits, CreditsTransType } from '@/services/credit'

const replicate = new Replicate({
  auth: process.env.REPLICATE_TEXT_API_TOKEN!,  // 使用文生图专用的 API Token
})

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
    console.log("🚀 开始处理文生图请求")

    // 读取 formData
    const formData = await request.formData()
    const userPrompt = formData.get('prompt') as string
    const size = formData.get('size') as string || '1024x1024'
    const style = formData.get('style') as string || 'medium'

    if (!userPrompt) {
      return NextResponse.json({ error: "未提供描述文字" }, { status: 400 })
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

    // Style prompt 映射
    const stylePromptMapping: { [key: string]: string } = {
      "simplified": "Few, thick outlines with very simple shapes. Large open areas for easy coloring. No textures or shading lines.",
      "medium": "A moderate number of lines with more varied shapes. Adds light hatching and simple textures for depth. Still leaves plenty of open space to avoid clutter.",
      "detailed": "Dense, fine linework with abundant realistic textures and details. Highly realistic style with rich shading and tonal variation. Minimal blank areas, offering a challenging coloring experience"
    };

    const stylePrompt = stylePromptMapping[style] || stylePromptMapping["medium"];

    // 构建完整的提示词：用户描述 + style prompt + 固定的黑白线稿要求
    const fullPrompt = `${userPrompt.trim()}, ${stylePrompt}. IMPORTANT: Create ONLY black and white line art coloring book style. NO COLOR, NO SHADING, NO GRADIENTS. Pure black outlines on white background only. Clean coloring book line art for children. Keep only bold, continuous pure-black outlines of the main subject and essential scene elements; remove all color, shading, gradients and fills. Have the characters and scene elements fill the entire canvas, avoiding large blank areas. Background must remain pure white. Centered composition, high-resolution PNG.`

    console.log(`📝 收到文生图请求: ${userPrompt}, 输出尺寸: ${size}, 风格: ${style}`)
    console.log(`📝 Style Prompt: ${stylePrompt}`)
    console.log(`📝 完整提示词: ${fullPrompt}`)

    // 准备 Replicate API 参数 (MiniMax 模型参数)
    const input = {
      prompt: fullPrompt,
      aspect_ratio: size === "1024x1024" ? "1:1" :     // 1:1 正方形
                   size === "832x1248" ? "2:3" :      // 2:3 竖版
                   size === "1248x832" ? "3:2" :      // 3:2 横版
                   "1:1",                              // 默认 1:1
      number_of_images: 1,
      prompt_optimizer: false  // 关闭prompt优化器，确保我们的黑白线稿指令不被修改
    }

    // 重试循环
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 第 ${attempt} 次尝试调用 Replicate API`)
        console.log("🌐 准备调用 Replicate API: minimax/image-01")

        const startTime = Date.now()

        // 调用 MiniMax 模型
        const output = await replicate.run("minimax/image-01", { input }) as any;

        console.log(`📡 Replicate API 调用成功`)
        console.log("🔍 输出类型:", typeof output)
        console.log("🔍 输出内容:", output)

        // 处理 MiniMax 输出（通常是 URL 数组）
        let imageUrl: string
        let imageData: string

        if (Array.isArray(output) && output.length > 0) {
          const firstOutput = output[0]
          
          if (typeof firstOutput === 'string') {
            // minimax/image-01 返回 URL 数组
            imageUrl = firstOutput
            console.log("📎 输出格式: URL 数组")
            
            // 验证 URL 格式
            if (!imageUrl || !imageUrl.startsWith('http')) {
              throw new Error(`无效的图片 URL: ${imageUrl}`)
            }

            // 下载图片并转换为 base64
            const imageResponse = await fetch(imageUrl)
            if (!imageResponse.ok) {
              throw new Error(`下载生成的图片失败: ${imageResponse.status} ${imageResponse.statusText}`)
            }
            
            const imageBuffer = await imageResponse.arrayBuffer()
            imageData = Buffer.from(imageBuffer).toString('base64')
            
          } else if (firstOutput && typeof firstOutput.getReader === 'function') {
            // 如果是 ReadableStream，直接读取为二进制图片数据
            console.log("📎 输出格式: ReadableStream (二进制图片数据)")
            const reader = firstOutput.getReader()
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
              
              // 直接将二进制数据转换为 base64
              imageData = Buffer.from(fullData).toString('base64')
              
            } finally {
              reader.releaseLock()
            }
          } else {
            console.error("❌ 未知的数组元素格式:", firstOutput)
            throw new Error(`不支持的数组元素格式: ${typeof firstOutput}`)
          }
        } else if (typeof output === 'string') {
          // 如果直接返回单个 URL
          imageUrl = output
          console.log("📎 输出格式: 直接 URL 字符串")
          
          // 验证 URL 格式
          if (!imageUrl || !imageUrl.startsWith('http')) {
            throw new Error(`无效的图片 URL: ${imageUrl}`)
          }

          // 下载图片并转换为 base64
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            throw new Error(`下载生成的图片失败: ${imageResponse.status} ${imageResponse.statusText}`)
          }
          
          const imageBuffer = await imageResponse.arrayBuffer()
          imageData = Buffer.from(imageBuffer).toString('base64')
          
        } else {
          console.error("❌ 未知的输出格式:", output)
          throw new Error(`不支持的输出格式: ${typeof output}`)
        }

        console.log("✅ 图片数据处理成功，base64长度:", imageData.length)

        // 返回结果
        const processingTime = Date.now() - startTime
        
        return NextResponse.json({
          success: true,
          image: `data:image/png;base64,${imageData}`,
          processingTime: `${processingTime}ms`,
          model: "minimax/image-01",
          attempt: attempt,
          debug: {
            userPrompt: userPrompt,
            fullPromptLength: fullPrompt.length,
            imageGenerated: true
          }
        })

      } catch (error: any) {
        console.error(`❌ 第 ${attempt} 次尝试失败:`, error)

        if (attempt === maxRetries) {
          console.error("❌ 文生图最终失败:", error.message)
          return NextResponse.json({ 
            error: error.message || "文生图生成失败",
            model: "minimax/image-01",
            attempts: maxRetries,
            suggestion: error.message.includes('rate limit') ? '请稍后再试，API 调用频率限制' :
                       error.message.includes('timeout') ? '请尝试简化描述或稍后重试' :
                       error.message.includes('Unauthorized') || error.message.includes('authentication') ? 'API 认证失败，请检查配置' :
                       error.message.includes('invalid') ? '请检查描述是否符合要求' : 
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
    console.error("❌ 处理文生图请求时发生错误:", error)
    return NextResponse.json({ 
      error: error.message || "请求处理失败",
      suggestion: '请检查描述是否正确'
    }, { status: 500 })
  }
} 