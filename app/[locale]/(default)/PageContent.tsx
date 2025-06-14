"use client"

import React, { useState, useRef } from "react"
import { Upload, Wand2, Download, Loader2, ChevronDown, ChevronUp, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AspectRatioSelector } from "@/components/ui/aspect-ratio-selector"
import ImageCompare from "@/components/ui/ImageCompare"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion'
import clsx from 'clsx'
import styles from './page.module.css'

// 导入新的组件
import PhotoColor from "./PhotoColor"
import TextColor from "./TextColor"

import Branding from "@/components/blocks/branding";
import CTA from "@/components/blocks/cta";
import FAQ from "@/components/blocks/faq";
import Feature from "@/components/blocks/feature";
import Feature1 from "@/components/blocks/feature1";
import Feature2 from "@/components/blocks/feature2";
import Feature3 from "@/components/blocks/feature3";
import Hero from "@/components/blocks/hero";
import Pricing from "@/components/blocks/pricing";
import Showcase from "@/components/blocks/showcase";
import Stats from "@/components/blocks/stats";
import Testimonial from "@/components/blocks/testimonial";
import { getLandingPage } from "@/services/page";

interface GenerationResult {
  originalImage: string
  generatedImage: string
  timestamp: number
}

interface LandingPageProps {
  page: Awaited<ReturnType<typeof getLandingPage>>
  locale: string
}

// 定义折叠面板数据数组
const accordionData = [
  {
    id: '1',
    title: '什么是AI涂色页生成器？',
    content: 'AI涂色页生成器是一个使用先进人工智能技术的工具，可以将您的照片或文字描述转换为精美的线稿涂色页。它使用专门训练的AI模型来创建适合儿童和成人的涂色图案。'
  },
  {
    id: '2',
    title: '生成的涂色页质量如何？',
    content: '我们的AI经过专门训练，能够捕捉图像的关键轮廓和细节，生成清晰、适合涂色的线稿图。用户一致称赞我们生成的涂色页具有专业品质和艺术美感。'
  },
  {
    id: '3',
    title: '支持哪些图片格式和尺寸？',
    content: '我们支持常见的图片格式如JPG、PNG等，并提供多种尺寸比例选择，包括1:1正方形、4:3横版、3:4竖版、16:9宽屏和9:16竖屏格式，满足不同需求。'
  },
  {
    id: '4',
    title: '可以商业使用生成的图片吗？',
    content: '是的，通过我们的付费计划，您可以获得商业使用许可。免费计划仅限个人非商业用途。'
  },
  {
    id: '5',
    title: '每天可以生成多少张图片？',
    content: '免费计划每天可生成3张图片。创作者计划每月100张图片。专业计划提供无限制的图片生成服务。'
  },
  {
    id: '6',
    title: '生成的图片分辨率是多少？',
    content: '免费计划生成1024×1024像素的图片。创作者计划提供2048×2048分辨率。专业计划提供超高清4096×4096像素图片，适合大幅打印和专业应用。'
  }
];

// 定义图片卡片数据类型
interface ImgFeature {
  image: string;
}

// 关键功能数据（6条，每行3列）
const imgFeatures: ImgFeature[] = [
  {
    image: "http://mms0.baidu.com/it/u=3137921165,1134579774&fm=253&app=138&f=JPEG?w=712&h=469"
  },
  {
    image: "http://mms0.baidu.com/it/u=3137921165,1134579774&fm=253&app=138&f=JPEG?w=712&h=469"
  },
  {
    image: "http://mms0.baidu.com/it/u=3137921165,1134579774&fm=253&app=138&f=JPEG?w=712&h=469"
  },
  {
    image: "http://mms0.baidu.com/it/u=3137921165,1134579774&fm=253&app=138&f=JPEG?w=712&h=469"
  },
  {
    image: "http://mms0.baidu.com/it/u=3137921165,1134579774&fm=253&app=138&f=JPEG?w=712&h=469"
  },
  {
    image: "http://mms0.baidu.com/it/u=3137921165,1134579774&fm=253&app=138&f=JPEG?w=712&h=469"
  }
];

// 定义关键功能卡片数据类型
interface KeyFeature {
  icon: string;
  title: string;
  description: string;
}

// 关键功能数据（6条，每行3列）
const keyFeatures: KeyFeature[] = [
  {
    icon: "https://picsum.photos/id/237/64/64",
    title: "多种涂色风格",
    description: "选择各种涂色风格，包括简单线条、中等细节和复杂图案，适合不同年龄段的用户。"
  },
  {
    icon: "https://picsum.photos/id/237/64/64",
    title: "高分辨率输出",
    description: "生成高达4K分辨率的图片，完美适用于打印、海报和专业项目。"
  },
  {
    icon: "https://picsum.photos/id/237/64/64",
    title: "智能线稿转换",
    description: "AI智能识别图像轮廓，自动调整线条粗细和细节程度，生成最适合涂色的线稿。"
  },
  {
    icon: "https://picsum.photos/id/237/64/64",
    title: "批量生成",
    description: "一次创建多个变体，探索同一概念的不同表现形式。"
  },
  {
    icon: "https://picsum.photos/id/237/64/64",
    title: "商业许可",
    description: "高级计划包含商业使用权限，可用于商业项目。"
  },
  {
    icon: "https://picsum.photos/id/237/64/64",
    title: "提示词库",
    description: "访问优化的提示词集合，帮助您创建完美的涂色页面。"
  }
];

// 定义评价数据类型
interface Testimonial {
  avatar: string;
  name: string;
  title: string;
  rating: number;
  content: string;
}

// 评价数据
const testimonials: Testimonial[] = [
  {
    avatar: "https://picsum.photos/id/64/100/100",
    name: "张小明",
    title: "插画师 & 涂色爱好者",
    rating: 5,
    content: "AI涂色页生成器完美捕捉了图像的精髓。我用它来创作概念艺术和插画灵感。生成的线稿特别适合涂色！"
  },
  {
    avatar: "https://picsum.photos/id/64/100/100",
    name: "李老师",
    title: "儿童读物作者",
    rating: 5,
    content: "我用这些图片作为儿童读物的灵感来源。生成的涂色页风格非常适合创造吸引年轻读者的魅力场景。"
  },
  {
    avatar: "https://picsum.photos/id/64/100/100",
    name: "王开发",
    title: "游戏开发者",
    rating: 4,
    content: "在我们的游戏原型中集成涂色页风格非常顺畅。AI理解了涂色页所需的情感深度和视觉叙事。"
  },
  {
    avatar: "https://picsum.photos/id/64/100/100",
    name: "陈设计",
    title: "平面设计师",
    rating: 5,
    content: "这些AI生成图像的色彩搭配和氛围光效令人惊叹。它们已经成为我创意工作流程的重要组成部分。"
  },
  {
    avatar: "https://picsum.photos/id/64/100/100",
    name: "刘动画",
    title: "动画师",
    rating: 4,
    content: "作为动画师，我很欣赏角色设计和环境元素的细节关注。这是预可视化和故事板制作的绝佳工具。"
  },
  {
    avatar: "https://picsum.photos/id/64/100/100",
    name: "赵学生",
    title: "电影学生",
    rating: 5,
    content: "AI完美模仿了涂色页的梦幻品质。我在毕业论文项目中使用了它，收到了无数关于视觉效果的赞美。"
  }
];

//左右滑动图片
const leftImage = 'imgs/custom/pic-black.png';
const rightImage = 'imgs/custom/pic-color.png';

export default function LandingPage({ page, locale }: LandingPageProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [promptText, setPromptText] = useState<string>("")
  const [textGeneratedImage, setTextGeneratedImage] = useState<string | null>(null)
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [textError, setTextError] = useState<string | null>(null)

  // 添加尺寸比例状态
  const [imageAspectRatio, setImageAspectRatio] = useState<string>("1:1")
  const [textAspectRatio, setTextAspectRatio] = useState<string>("1:1")

  // 状态管理
  const [activeComponent, setActiveComponent] = useState<string>("photo");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState("");

  // 🎯 Bookmark按钮位置调整变量 - 您可以修改这些数值来调整按钮位置
  const bookmarkPositionTop = 215; // 距离顶部的距离（单位：px）- 调整到与滑动按钮对齐
  const bookmarkPositionRight = 50; // 距离右边的距离（单位：px）
  const bookmarkPositionLeft = 'auto'; // 距离左边的距离，可以是数字或'auto'
  const bookmarkPositionBottom = 'auto'; // 距离底部的距离，可以是数字或'auto'

  // 将比例转换为具体尺寸
  const getImageSize = (aspectRatio: string): string => {
    switch (aspectRatio) {
      case "1:1":
        return "1024x1024"
      case "2:3":
        return "832x1248"
      case "3:2":
        return "1248x832"
      default:
        return "1024x1024"
    }
  }

  // 从localStorage加载历史记录
  const loadHistory = (): GenerationResult[] => {
    try {
      const history = localStorage.getItem("coloring-book-history")
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error("Failed to load history:", error)
      return []
    }
  }

  // 保存到localStorage
  const saveToHistory = (result: GenerationResult) => {
    try {
      const history = loadHistory()
      history.unshift(result)
      const limitedHistory = history.slice(0, 5)

      const historyString = JSON.stringify(limitedHistory)
      if (historyString.length > 1024 * 1024) {
        console.warn("历史记录过大，清理旧记录")
        const minimalHistory = limitedHistory.slice(0, 2)
        localStorage.setItem("coloring-book-history", JSON.stringify(minimalHistory))
      } else {
        localStorage.setItem("coloring-book-history", historyString)
      }
    } catch (error) {
      console.error("Failed to save to history:", error)
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          localStorage.removeItem("coloring-book-history")
          const newHistory = [result]
          localStorage.setItem("coloring-book-history", JSON.stringify(newHistory))
          console.log("清理历史记录后重新保存成功")
        } catch (retryError) {
          console.error("重试保存也失败了:", retryError)
        }
      }
    }
  }

  const compressImage = (base64: string, quality: number, maxWidth: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("无法创建canvas上下文"))
          return
        }

        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedBase64)
      }
      img.onerror = () => reject(new Error("图片加载失败"))
      img.src = base64
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("请选择一个有效的图片文件")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("图片文件大小不能超过5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const result = e.target?.result as string

      let processedImage = result
      if (file.size > 1024 * 1024) {
        try {
          processedImage = await compressImage(result, 0.8, 1024)
          setDebugInfo(`图片已压缩: ${file.name}, 原始大小: ${(file.size / 1024).toFixed(2)}KB`)
        } catch (error) {
          console.error("图片压缩失败:", error)
          setDebugInfo(`图片上传成功: ${file.name}, 大小: ${(file.size / 1024).toFixed(2)}KB (未压缩)`)
        }
      } else {
        setDebugInfo(`图片上传成功: ${file.name}, 大小: ${(file.size / 1024).toFixed(2)}KB`)
      }

      setOriginalImage(processedImage)
      setGeneratedImage(null)
      setError(null)
    }
    reader.onerror = () => {
      setError("图片读取失败，请重试")
    }
    reader.readAsDataURL(file)
  }

  const generateColoringBook = async () => {
    if (!originalImage) {
      setError("请先上传一张图片")
      return
    }

    setIsGenerating(true)
    setError(null)
    setDebugInfo("开始生成线稿图，使用 Flux Kontext Pro 模型...")

    try {
      const response = await fetch(originalImage)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append("image", blob, "image.png")
      formData.append("size", getImageSize(imageAspectRatio))

      setDebugInfo("正在调用 Replicate API...")

      const apiResponse = await fetch("/api/generate-coloring-book", {
        method: "POST",
        body: formData,
      })

      const result = await apiResponse.json()

      if (!apiResponse.ok) {
        throw new Error(result.error || `API调用失败: ${apiResponse.status}`)
      }

      if (result.success && result.image) {
        console.log('result: ', result.image)
        let generatedImageData = result.image
        const base64Prefix = "data:image/png;base64,"
        if (!generatedImageData.startsWith(base64Prefix)) {
          generatedImageData = base64Prefix + generatedImageData
        }
        setGeneratedImage(generatedImageData)

        saveToHistory({
          originalImage,
          generatedImage: generatedImageData,
          timestamp: Date.now(),
        })

        setDebugInfo(`生成成功! 使用 Flux Kontext Pro 模型，耗时: ${result.processingTime}ms`)
      } else {
        throw new Error(result.error || "生成失败")
      }
    } catch (error) {
      console.error("Generation error:", error)

      let errorMessage = "生成失败，请重试"
      let debugDetails = ""

      if (error instanceof Error) {
        errorMessage = error.message
        debugDetails = `错误类型: ${error.constructor.name}\n错误信息: ${error.message}\n时间: ${new Date().toISOString()}`

        if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
          debugDetails += "\n建议: 图片处理超时，请尝试使用更小的图片或稍后重试"
        } else if (error.message.includes("fetch")) {
          debugDetails += "\n可能的原因: 网络连接问题或API服务不可用"
        } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
          debugDetails += "\n建议: API 调用限额已达上限，请稍后重试"
        }
      }

      setError(errorMessage)
      setDebugInfo(debugDetails)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `coloring-book-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const generateFromText = async () => {
    if (!promptText.trim()) {
      setTextError("请输入描述")
      return
    }
    setIsGeneratingText(true)
    setTextError(null)
    setDebugInfo("使用 Minimax Image-01 模型生成线稿中，这可能需要30-60秒，请耐心等待...")
    try {
      const response = await fetch("/api/generate-text-sketch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          size: getImageSize(textAspectRatio)
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        const errorMessage = result.error || `API调用失败: ${response.status}`
        const suggestion = result.suggestion || "请稍后重试"
        throw new Error(`${errorMessage}。建议：${suggestion}`)
      }
      if (result.success && result.image) {
        let textImageData = result.image
        const base64Prefix = "data:image/png;base64,"
        if (!textImageData.startsWith(base64Prefix)) {
          textImageData = base64Prefix + textImageData
        }
        setTextGeneratedImage(textImageData)
        setDebugInfo(`Minimax Image-01 生成成功! 处理时间: ${result.processingTime}, 尝试次数: ${result.attempt}`)
      } else {
        throw new Error(result.error || "生成失败")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setTextError(errorMessage)
      setDebugInfo("")

      if (errorMessage.includes('认证失败')) {
        setTextError("API 认证失败，请联系管理员检查配置")
      } else if (errorMessage.includes('频率限制')) {
        setTextError("API 调用频率限制，请稍后再试")
      } else if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
        setTextError("请求超时，请尝试简化描述或稍后重试")
      }
    } finally {
      setIsGeneratingText(false)
    }
  }

  // 处理添加书签的函数
  const handleBookmark = () => {
    try {
      if (window.sidebar && (window.sidebar as any).addPanel) {
        (window.sidebar as any).addPanel(window.location.href, document.title, "");
      } else if ((window as any).external && (window as any).external.AddFavorite) {
        (window as any).external.AddFavorite(location.href, document.title);
      } else {
        setTooltipMessage("请使用 Ctrl+D (Windows) 或 Cmd+D (Mac) 来添加书签");
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }
    } catch (error) {
      setTooltipMessage("请使用 Ctrl+D (Windows) 或 Cmd+D (Mac) 来添加书签");
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  // 处理组件切换的函数
  const handleComponentChange = (componentId: string) => {
    setActiveComponent(componentId);
  };

  return (
    <div className={styles.pageMain}>
      {/* SVG 手绘边框滤镜定义 */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="hand-drawn">
            <feTurbulence baseFrequency="0.04" numOctaves="3" result="noise" seed="1" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
          </filter>
        </defs>
      </svg>

      {/* 书签按钮 - 独立定位在Text Color按钮右边，Result步骤框上方 */}
      <div style={{
        position: 'absolute',
        top: `${bookmarkPositionTop}px`,
        right: `${bookmarkPositionRight}px`,
        left: bookmarkPositionLeft,
        bottom: bookmarkPositionBottom,
        zIndex: 10
      }}>
        <div
          onClick={handleBookmark}
          style={{
            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
            fontSize: '23px',
            fontWeight: 'bold',
            backgroundColor: '#fcf4a3',
            color: '#69b08b',
            padding: "5px 12px",
            borderRadius: "25px",
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
          className={clsx("rounded cursor-pointer hover:text-purple-600 transition-colors")}
        >
          🌟 Bookmark
        </div>
        {showTooltip && (
          <div style={{
            position: 'absolute',
            top: '70px',
            right: '0',
            backgroundColor: '#333',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            zIndex: 1000
          }}>
            {tooltipMessage}
          </div>
        )}
      </div>

      {/* 标题 - 绝对定位，独立移动不影响其他元素 */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '0',
        width: '100vw',
        textAlign: 'center',
        zIndex: 5
      }}>
        <h1 style={{
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
          color: '#7b6611',
          margin: '0'
        }} className="text-6xl font-bold text-center">Create Fun Coloring Pages with AI
        </h1>
      </div>

      {/* 为下面的内容添加固定的上边距，确保不被标题遮挡 */}
      <div style={{ marginTop: '100px' }}>

        {/* 两个切换按钮和组件显示区域 */}
        <div className=" mx-auto mb-12">
          {/* 按钮容器 */}
          <div className="max-w-4xl mx-auto flex mb-6">
            <button
              onClick={() => handleComponentChange("photo")}
              style={{
                border: "none",
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "28px",
                color: activeComponent === "photo" ? "white" : "white",
                padding: "0 8px",
                height: "45px",
                backgroundColor: activeComponent === "photo" ? '#64bc99' : '#d6f5de',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // @ts-ignore
                '--border-width': '3px',
                '--border-style': 'solid',
                '--border-color':  activeComponent === "photo"
                  ? '#64bc99' : '#d6f5de',
                '--border-radius': '0px'
              }}
              className={clsx(`photo-button flex-1 py-6 px-4 font-medium transition-colors duration-200 rounded-t-lg ${
                activeComponent === "photo"
                  ? "hover:opacity-80"
                  : "hover:opacity-80"
              }`,styles.borderHandDrown)}
            >
              Photo Color
            </button>
            <button
              onClick={() => handleComponentChange("text")}

              style={{
                border: "none",
                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                fontSize: "28px",
                color: activeComponent === "text" ? "white" : "white",
                padding: "0 16px",
                height: "45px",
                backgroundColor: activeComponent === "text" ? '#64bc99' : '#d6f5de',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // @ts-ignore
                '--border-width': '3px',
                '--border-style': 'solid',
                '--border-color':  activeComponent === "text"
                  ? '#64bc99' : '#d6f5de',
                '--border-radius': '0px'
              }}

              className={clsx(`text-button flex-1 py-6 px-4 font-medium transition-colors duration-200 rounded-t-lg ${
                activeComponent === "text"
                  ? "hover:opacity-80"
                  : "hover:opacity-80"
              }`,styles.buttonBorder)}
            >
              Text Color 
            </button>
          </div>

          {/* 组件内容区域 */}
          <div className=" rounded-lg p-2 transition-all duration-300 animate-fadeIn"
            style={{
              width:'100%',
            }}>
            {activeComponent === "photo" ? <PhotoColor /> : <TextColor />}
          </div>  {/*p-2调整滑动按钮和步骤框的间距*/}
        </div> 

        <div className={clsx("bg-[#f9f3e8] max-w-5xl rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl",styles.zoomContainer)}
             style={{
               // width:`75vw`,
               margin:`0 auto 8rem auto`
            }}>
          {/* 卡片头部 - 标题单行居中 */}
          <div className="bg-[#f9f3e8] text-center"
            style={{
              paddingTop: "3rem",
            }}>
            <h1 style={{
              fontFamily: 'dk_crayonistaregular'
            }} className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
              Drag the slider left and right to view the front and back comparison effect
            </h1>
          </div>

          {/* 卡片内容 */}
          <div className="">
            <ImageCompare
              leftImage={leftImage}
              rightImage={rightImage}
              leftLabel="Original cityscape"
              rightLabel="Ghibli-style transformation"
            />
          </div>
        </div>

      </div>

      {/* 展示图片网格 */}
      <div className={styles.imageContainer}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          width: '75vw',
          margin: '0 auto'
        }}>
          {imgFeatures.map((feature, index) => (
            <div key={index} className={styles.zoomContainer}>
              <img
                src={feature.image}
                alt={`示例 ${index + 1}`}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 关键功能区域 */}
      <div className={styles.keyFeaturesSection} id="features">
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#2d3748',
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
        }}>
          核心功能
        </h2>
        <div className={styles.keyFeaturesContainer}>
          {keyFeatures.map((feature, index) => (
            <div key={index} className={clsx(styles.keyFeatureCard, styles.zoomContainer)}>
              <div className={styles.featureImageContainer}>
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className={styles.featureImage}
                />
              </div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 用户评价区域 */}
      <div style={{ margin: '60px 0' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#2d3748',
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
        }}>
          用户评价
        </h2>
        <div className={styles.testimonialsContainer}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={clsx(styles.testimonialCard, styles.zoomContainer)}>
              <div className={styles.testimonialContentWrapper}>
                <div className={styles.testimonialAvatarContainer}>
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className={styles.testimonialAvatar}
                  />
                </div>
                <div className={styles.testimonialTextContainer}>
                  <div className={styles.testimonialInfo}>
                    <div className={styles.testimonialName}>{testimonial.name}</div>
                    <div className={styles.testimonialTitle}>{testimonial.title}</div>
                  </div>
                  <div className={styles.testimonialRating}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={clsx(styles.star, {
                        [styles.filledStar]: i < testimonial.rating
                      })}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className={styles.testimonialContent}>"{testimonial.content}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ 区域 */}
      <div className={styles.accordionContainerWrapper}>
        <h2 className={styles.accordionTitle}>常见问题</h2>
        <p className={styles.accordionTip}>以下是用户最常问的问题和答案</p>
        
        <div className={styles.accordionContainer}>
          <Accordion type="single" collapsible>
            {accordionData.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className={styles.trigger}>
                  <span>{item.title}</span>
                  <div className={styles.arrowContainer}>
                    <ChevronDown className={clsx(styles.arrowIcon, styles.openIcon)} />
                    <ChevronUp className={clsx(styles.arrowIcon, styles.closedIcon)} />
                  </div>
                </AccordionTrigger>
                <AccordionContent className={styles.content}>
                  <p>{item.content}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* 原本内容继续渲染 */}
      {page.branding && <Branding section={page.branding} />}
      {page.introduce && <Feature1 section={page.introduce} />}
      {page.benefit && <Feature2 section={page.benefit} />}
      {page.usage && <Feature3 section={page.usage} />}
      {page.feature && <Feature section={page.feature} />}
      {page.showcase && <Showcase section={page.showcase} />}
      {page.stats && <Stats section={page.stats} />}
      {page.pricing && <Pricing pricing={page.pricing} />}
      {page.testimonial && <Testimonial section={page.testimonial} />}
      {page.faq && <FAQ section={page.faq} />}
      {page.cta && <CTA section={page.cta} />}
    </div>
  );
}
