"use client"

import React, {useState, useRef} from "react"
import {Upload, Wand2, Download, Loader2, ChevronDown, ChevronUp, ChevronRight, AlertCircle} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card} from "@/components/ui/card"
import {Textarea} from "@/components/ui/textarea"
import {AspectRatioSelector} from "@/components/ui/aspect-ratio-selector"
import ImageCompare from "@/components/ui/ImageCompare"
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@radix-ui/react-accordion'
import clsx from 'clsx'
import styles from './page.module.css'

import Link from 'next/link';
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
import {getLandingPage} from "@/services/page";

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
        title: 'What is this website about?',
        content: 'This site uses state-of-the-art AI models to turn any photo or text into clean black-and-white coloring pages. It\'s creative, fun, and designed for everyone who loves art and imagination! You can create unique line art in just seconds — no skills needed.'
    },
    {
        id: '2',
        title: 'Who is this tool suitable for?',
        content: 'Our coloring generator is perfect for all ages — from toddlers to grandparents. It\'s also great for parents, teachers, illustrators, designers, and anyone who enjoys coloring or needs line art. Whether you\'re drawing for fun or using it for work, it\'s made to help.'
    },
    {
        id: '3',
        title: 'Is it free to use?',
        content: 'Yes! Our core features are completely free to use and require no login. You can try the image or text-to-line-art features instantly. We believe creativity should be accessible to everyone.'
    },
    {
        id: '4',
        title: 'Is my uploaded image safe?',
        content: 'We respect your privacy. Your images are processed securely and never used for training or shared with anyone. You stay in control of your content. Files are automatically deleted after a short time.'
    },
    {
        id: '5',
        title: 'Can I generate coloring pages just by typing text?',
        content: 'Absolutely! Just describe your scene or character, and our model will turn it into a beautiful black-and-white outline. It\'s that easy. You can even try fun prompts like "a dog flying a spaceship"!'
    },
    {
        id: '6',
        title: 'How accurate is the generation?',
        content: 'Very! Our model is fine-tuned for Ghibli-like features — soft lines, fantasy details, and charm. But results still depend on image quality and your text description clarity. Try uploading a clean portrait or a clear idea for best results.'
    }
];

// 定义图片卡片数据类型
interface ImgFeature {
    image: string;
}

// 关键功能数据（6条，每行3列）
const imgFeatures: ImgFeature[] = [
    {
        image: "/imgs/gallery/coloring-page-1.png"
    },
    {
        image: "/imgs/gallery/coloring-page-2.png"
    },
    {
        image: "/imgs/gallery/coloring-page-3.png"
    },
    {
        image: "/imgs/gallery/coloring-page-4.png"
    },
    {
        image: "/imgs/gallery/coloring-page-5.png"
    },
    {
        image: "/imgs/gallery/coloring-page-6.png"
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
        icon: "/imgs/features/feature-icon-1.png",
        title: "Top-Tier Model, Lightning-Fast Quality",
        description: "Powered by a state-of-the-art generative model, our engine delivers crisp, high-quality line art in seconds."
    },
    {
        icon: "/imgs/features/feature-icon-2.png",
        title: "Prompt-to-Page, Ideas Realized",
        description: "Type a prompt and watch it turn into an original coloring page—no source images required, just pure imagination."
    },
    {
        icon: "/imgs/features/feature-icon-3.png",
        title: "Age-Tailored Outlines, Adjustable Difficulty",
        description: "Choose from simple, moderate, or realistic detail levels, so every age—from preschoolers to adults—gets the perfect coloring challenge."
    },
    {
        icon: "/imgs/features/feature-icon-4.png",
        title: "Free & Sign-Up-Free, Instant Access",
        description: "Enjoy all core features without creating an account. Jump in anytime, anywhere—absolutely free."
    },
    {
        icon: "/imgs/features/feature-icon-5.png",
        title: "Universal Style Support, Accurate Line Art",
        description: "Whether you upload a cartoon, a realistic photo, an oil painting, or a hand-drawn sketch, our AI precisely extracts the main outlines and delivers a crisp black-and-white coloring page."
    },
    {
        icon: "/imgs/features/feature-icon-6.png",
        title: "Instant Share & Download, Joy on the Go",
        description: "Save your page as PNG/JPG or post directly to social media in a single click—spreading coloring fun has never been easier."
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
        avatar: "/imgs/avatars/james-miller-parent.png",
        name: "James Miller",
        title: "Parent",
        rating: 5,
        content: "The coloring page generator is fantastic! It provides endless fun for my kids. My children love choosing their favorite photos and seeing them turn into coloring pages. It's also a great way to spend quality time together on weekends."
    },
    {
        avatar: "/imgs/avatars/emilie-laurent-teacher.png",
        name: "Émilie Laurent",
        title: "Preschool Teacher",
        rating: 5,
        content: "I love this website! The coloring pages are perfect for my class activities. It encourages creativity and helps kids develop fine motor skills. I now use it regularly as part of my art curriculum."
    },
    {
        avatar: "/imgs/avatars/thomas-ricci-designer.png",
        name: "Thomas Ricci",
        title: "Publishing Designer",
        rating: 5,
        content: "Amazing resource for creating unique illustrations for our books! The line art quality is professional and easy to modify if needed. It speeds up our workflow significantly while maintaining high standards."
    },
    {
        avatar: "/imgs/avatars/lisa-thompson-hobbyist.png",
        name: "Lisa Thompson",
        title: "Hobbyist",
        rating: 5,
        content: "An excellent tool for designing custom coloring pages! I've created dozens of designs to print and color at home. The results are always charming and very satisfying to work with."
    },
    {
        avatar: "/imgs/avatars/andrew-okoro-student.png",
        name: "Andrew Okoro",
        title: "Art Student",
        rating: 5,
        content: "The generator is easy to use and offers so many options! It helps me explore different composition and contrast styles. Great for experimenting with outlines and line weight."
    },
    {
        avatar: "/imgs/avatars/ava-jensen-influencer.png",
        name: "Ava Jensen",
        title: "Social Media Influencer",
        rating: 5,
        content: "These coloring pages are a hit with my followers! Highly recommended. I use them in my content and get tons of positive feedback. Super fun, brand-friendly, and engaging for families."
    }
];

//左右滑动图片
// const leftImage = 'imgs/custom/pic-black.png';
// const rightImage = 'imgs/custom/pic-color.png';

export default function LandingPage({page, locale}: LandingPageProps) {
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
    const bookmarkPositionTop = 20; // 距离顶部的距离（单位：px）- 调整到select photo步骤框上方
    const bookmarkPositionRight = 'auto'; // 距离右边的距离（单位：px）
    const bookmarkPositionLeft = "5vw"; // 距离左边的距离，可以是数字或'auto' - 从230减少到180，向左移动50px
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

                let {width, height} = img
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
                headers: {"Content-Type": "application/json"},
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
    const handleBookmark = async () => {
        try {
            // 现代浏览器的收藏API
            if ('bookmarks' in navigator) {
                try {
                    // @ts-ignore - Bookmarks API仍在实验阶段
                    await navigator.bookmarks.create({
                        title: document.title,
                        url: window.location.href
                    });
                    setTooltipMessage("Website successfully added to bookmarks!");
                    setShowTooltip(true);
                    setTimeout(() => setShowTooltip(false), 3000);
                    return;
                } catch (error) {
                    console.log('Bookmarks API unavailable, trying other methods');
                }
            }

            // 检测用户代理并提供适当的指导
            const userAgent = navigator.userAgent.toLowerCase();
            let shortcutKey = '';
            let message = '';

            if (userAgent.includes('mac')) {
                shortcutKey = 'Cmd + D';
                message = `Please press ${shortcutKey} to add this page to bookmarks`;
            } else if (userAgent.includes('windows') || userAgent.includes('linux')) {
                shortcutKey = 'Ctrl + D';
                message = `Please press ${shortcutKey} to add this page to bookmarks`;
            } else if (userAgent.includes('android')) {
                message = 'Please click "Add to Bookmarks" option in your browser menu';
            } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                message = 'Please click the share button, then select "Add to Bookmarks"';
            } else {
                message = 'Please use your browser\'s bookmark feature to add this page to bookmarks';
            }

            // 尝试传统的IE方法（仅限IE浏览器）
            if ((window as any).external && (window as any).external.AddFavorite) {
                try {
                    (window as any).external.AddFavorite(window.location.href, document.title);
                    setTooltipMessage("Website successfully added to bookmarks!");
                    setShowTooltip(true);
                    setTimeout(() => setShowTooltip(false), 3000);
                    return;
                } catch (error) {
                    console.log('IE bookmark method failed');
                }
            }

            // 尝试Firefox的方法
            if (window.sidebar && (window.sidebar as any).addPanel) {
                try {
                    (window.sidebar as any).addPanel(document.title, window.location.href, "");
                    setTooltipMessage("Website successfully added to bookmarks!");
                    setShowTooltip(true);
                    setTimeout(() => setShowTooltip(false), 3000);
                    return;
                } catch (error) {
                    console.log('Firefox bookmark method failed');
                }
            }

            // 如果所有自动方法都失败，显示指导信息
            setTooltipMessage(message);
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 5000);

        } catch (error) {
            console.error('Failed to add bookmark:', error);
            setTooltipMessage("Please use browser shortcut Ctrl+D (Windows) or Cmd+D (Mac) to add bookmark");
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
            <style>{`
        
            .pageMain {
                font-family: "'Comic Sans MS', 'Marker Felt', cursive";
             }
             
            `}
            </style>
            {/* SVG 手绘边框滤镜定义 */}
            <svg width="0" height="0" style={{position: 'absolute'}}>
                <defs>
                    <filter id="hand-drawn">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turbulence"/>
                        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5"/>
                    </filter>
                </defs>
            </svg>


            {/* 标题 - 绝对定位，独立移动不影响其他元素 */}
            <div style={{
                marginTop: "4vh"
            }}>
                <h1 style={{
                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                    color: '#7b6611',
                    margin: '0'
                }} className="text-2xl  lg:text-6xl md:text-4xl font-bold text-center">Create Fun Coloring Pages with AI
                </h1>
            </div>

            {/* 为下面的内容添加固定的上边距，确保不被标题遮挡 */}
            <div style={{marginTop: '2rem'}}>
                {/* 书签按钮 - 独立定位在Text Color按钮右边，Result步骤框上方 */}
                <div className={clsx("")} style={{
                    position: 'absolute',
                    display: 'none',
                    right: `${bookmarkPositionRight}vw`,
                    left: bookmarkPositionLeft,
                    bottom: bookmarkPositionBottom,
                    zIndex: 10
                }}
                >
                    <div
                        onClick={handleBookmark}
                        style={{
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",

                            fontWeight: 'bold',
                            backgroundColor: '#fcf4a3',
                            color: '#6fd4c2',
                            padding: "5px 12px",
                            borderRadius: "25px",
                            border: 'none',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            textAlign: 'center',
                            gap: '2px',
                            paddingTop: '3px'
                        }}
                        className={clsx("text-xs lg:text-xl md:text-sm rounded cursor-pointer hover:text-purple-600 transition-colors")}
                    >
                        <img
                            className={clsx("w-3 lg:w-5 md:w-4 ")}
                            src="/imgs/icons/bookmark-icon.png"
                            alt="Bookmark"
                            style={{

                                objectFit: 'contain',
                                marginTop: '5px'
                            }}
                        />
                        Bookmark
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


                {/* 两个切换按钮和组件显示区域 */}
                <div className=" mx-auto mb-12">
                    {/* 按钮容器 */}
                    <div className={clsx("", styles.flexButtonContainer)}
                         style={{
                             marginBottom: '20px',
                         }}
                    >
                        <button
                            onClick={() => handleComponentChange("photo")}
                            style={{
                                border: "none",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                color: activeComponent === "photo" ? "white" : "#718096",
                                padding: "10px 16px",
                                height: "45px",
                                backgroundColor: activeComponent === "photo" ? '#64bc99' : '#d6f5de',
                                // @ts-ignore
                                '--border-width': '3px',
                                '--border-style': 'solid',
                                '--border-color': activeComponent === "photo" ? '#64bc99' : '#d6f5de',
                                '--border-radius': '0px'
                            }}
                            className={clsx(`
    
      text-sm md:text-xs lg:text-base photo-button flex-1 
      py-6 px-4 font-medium transition-colors duration-200 rounded-t-lg ${
                                activeComponent === "photo" ? "hover:opacity-80" : "hover:opacity-80"
                            }`, styles.buttonBorder, styles.buttonGroup)}
                        >
                            PHOTO TO COLORING PAGE
                        </button>
                        <button
                            onClick={() => handleComponentChange("text")}
                            style={{
                                border: "none",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                color: activeComponent === "text" ? "white" : "#718096",
                                padding: "10px 16px",
                                height: "45px",
                                backgroundColor: activeComponent === "text" ? '#64bc99' : '#d6f5de',
                                // @ts-ignore
                                '--border-width': '3px',
                                '--border-style': 'solid',
                                '--border-color': activeComponent === "text" ? '#64bc99' : '#d6f5de',
                                '--border-radius': '0px'
                            }}
                            className={clsx(`
    

      text-sm md:text-xs lg:text-base
      text-button flex-1 py-6 px-4 font-medium transition-colors duration-200 rounded-t-lg ${
                                activeComponent === "text" ? "hover:opacity-80" : "hover:opacity-80"
                            }`, styles.buttonBorder, styles.buttonGroup)}
                        >
                            TEXT TO COLORING PAGE
                        </button>
                    </div>

                    {/* 组件内容区域 */}
                    <div className=" rounded-lg p-2 transition-all duration-300 animate-fadeIn"
                         style={{
                             width: '100%',
                         }}>
                        {activeComponent === "photo" ? <PhotoColor/> : <TextColor/>}
                    </div>
                    {/*p-2调整滑动按钮和步骤框的间距*/}
                </div>


            </div>

            {/* Gallery of AI-Generated Coloring Pages 标题部份 */}
            <div>
                <h3 className={clsx("lg:mt-[20vh] md:mt-[15vh] mt-[10vh]", styles.accordionTitle)}>Gallery of
                    AI-Generated Coloring Pages</h3>
                <p className={styles.accordionTip}>Explore magical worlds created with AI coloring page generator.</p>
            </div>

            <div className={styles.gallerySection}>
                <div className={clsx("flex flex-row-reverse flex-wrap text-xl", styles.keyFeaturesContainer)}
                >
                    <Link href={`/galleryList`}>
          <span
              style={{
                  fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                  backgroundColor: '#fcf4a3',
                  color: '#6fd4c2',
                  padding: "0px 8px",
                  borderRadius: "25px",
                  cursor: "pointer",

              }}
          >
          see more
        </span></Link></div>

                <div className={styles.keyFeaturesContainer}>

                    {imgFeatures.map((feature, index) => (

                        <div key={index}
                             style={{
                                 // @ts-ignore
                                 '--border-width': '5px',
                                 '--border-style': 'solid',
                                 '--border-color': '#f8e71c',
                                 '--border-radius': '8px'
                             }}
                             className={clsx(styles.keyFeatureCard, styles.zoomContainer, styles.borderHandDrown)}>
                            <div className={styles.featureImageContainer}>
                                <Link href={`/galleryContent`}>
                                    <img
                                        src={feature.image}
                                        alt={`AI Generated Coloring Page ${index + 1}`}
                                        className={styles.featureImage}
                                    />
                                </Link>
                            </div>
                        </div>

                    ))}
                </div>
            </div>

            {/* Key Features of Coloring Page 标题部份 */}
            <div style={{marginTop: '8rem'}}>
                <h3 className={styles.accordionTitle}>Key Features of Coloring Page</h3>
                <p className={styles.accordionTip}>Everything you need to create coloring page artwork for personal or
                    commercial use.</p>
            </div>

            {/* 关键功能区域 */}
            <div className={styles.keyFeaturesSection} id="features">
                <div className={styles.keyFeaturesContainer}>
                    {keyFeatures.map((feature, index) => (
                        <div key={index} style={{
                            // @ts-ignore
                            '--border-width': '5px',
                            '--border-style': 'solid',
                            '--border-color': '#f8e71c',
                            '--border-radius': '8px'
                        }} className={clsx(styles.keyFeatureCard, styles.zoomContainer)}>
                            <div className={styles.featureIconContainer}>
                                <img src={feature.icon} alt={feature.title} className={styles.featureIcon}/>
                            </div>
                            <div className={styles.featureContent}>
                                <h4 className={styles.featureTitle}>{feature.title}</h4>
                                <p className={styles.featureDescription}>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* What Users Say About Coloring Page 标题部份 */}
            <div style={{marginTop: '8rem'}}>
                <h3 className={styles.accordionTitle}>What Users Say About Coloring Page</h3>
                <p className={styles.accordionTip}>Hear from artists, fans, and creators who use our Coloring Page AI
                    generator.</p>
            </div>

            {/* 2列card 部分 */}
            <div className={styles.testimonialsContainer}>
                {testimonials.map((testimonial, index) => (
                    <div key={index}
                         style={{
                             // @ts-ignore
                             '--border-width': '5px',
                             '--border-style': 'solid',
                             '--border-color': '#f8e71c',
                             '--border-radius': '8px'
                         }}
                         className={clsx(styles.testimonialCard, styles.zoomContainer)}>
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
                                    <h4 className={styles.testimonialName}>{testimonial.name}</h4>
                                    <p className={styles.testimonialTitle}>{testimonial.title}</p>
                                </div>
                                <div className={styles.testimonialRating}>
                                    {Array.from({length: 5}).map((_, i) => (
                                        <span
                                            key={i}
                                            className={`${styles.star} ${i < testimonial.rating ? styles.filledStar : ''}`}
                                        >
                      ★
                    </span>
                                    ))}
                                </div>
                                <p className={styles.testimonialContent}>{testimonial.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FAQ 标题部份 */}
            <div id="faq" style={{marginTop: '12rem', marginBottom: '3rem'}}>
                <h3 className={styles.accordionTitle}>Frequently Asked Questions</h3>
                <p className={styles.accordionTip}>Have another question? Contact us on Discord or by email.</p>
            </div>
            {/* FAQ 折叠面板 */}
            {accordionData.map(item => (
                <div key={item.id} className={clsx(styles.accordionContainerWrapper)}>
                    <div style={{
                        // @ts-ignore
                        '--border-width': '5px',
                        '--border-style': 'solid',
                        '--border-color': '#f8e71c',
                        '--border-radius': '8px'
                    }} className={clsx(styles.accordionContainer, styles.zoomContainer)}>
                        <Accordion type="single" collapsible>
                            <AccordionItem key={item.id} value={item.id}>
                                <AccordionTrigger className={styles.trigger}>
                                    <span>{item.title}</span>
                                    {/* 直接使用 data-state 属性判断状态 */}
                                    <span className={styles.arrowContainer}>
                    <ChevronDown className={clsx(styles.arrowIcon, styles.openIcon)}/>
                    <ChevronRight className={clsx(styles.arrowIcon, styles.closedIcon)}/>
                  </span>
                                </AccordionTrigger>
                                <AccordionContent className={styles.content}>
                                    <p>{item.content}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            ))}

            {/* 原本内容继续渲染 */}
            {/* 隐藏pricing部分 */}
            {/* {page.pricing && <Pricing pricing={page.pricing} />} */}
        </div>
    );
}
