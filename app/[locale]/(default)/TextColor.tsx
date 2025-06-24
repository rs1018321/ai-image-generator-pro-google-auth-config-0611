"use client"

import React, {useState, useRef, useEffect} from "react";
import {useForm, SubmitHandler} from "react-hook-form";
import axios from "axios";
import styles from "./page.module.css";
import {TwitterLogoIcon} from '@radix-ui/react-icons';
import {FaFacebookF, FaLinkedinIn, FaWhatsapp} from 'react-icons/fa';
import {Switch} from "@/components/ui/switch";
import {useSession} from "next-auth/react";
import SignModal from "@/components/sign/modal";
import CreditConfirmModal from "@/components/ui/credit-confirm-modal";
import {toast} from "sonner";
import {useAppContext} from "@/contexts/app";
import clsx from "clsx";
import ImageCompare from "@/components/ui/ImageCompare";

type FormData = {
    size: string;
    age: string[];
    pages: string[];
    prompt: string; // 文本框字段
};

const TextColor: React.FC = () => {
    const {data: session} = useSession();
    const {setShowSignModal, userCredits, setUserCredits, setShowSubscriptionModal} = useAppContext();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedPrompt, setSelectedPrompt] = useState<string>(""); // 存储选中的提示文本
    const [selectedSize, setSelectedSize] = useState<string>("Auto");
    const [selectedStyle, setSelectedStyle] = useState<string>("medium"); // 默认选择Medium detailed
    const [isCleared, setIsCleared] = useState<boolean>(false); // 跟踪是否已被清除
    const [generatedImage, setGeneratedImage] = useState<string | null>(null); // 添加生成图片状态
    const [isGenerating, setIsGenerating] = useState<boolean>(false); // 添加生成中状态
    const [promptValue, setPromptValue] = useState<string>(""); // 新增：跟踪文本框内容
    const [hasWatermark, setHasWatermark] = useState(true); // 默认显示水印

    // 新增：积分相关状态
    const [showCreditConfirmModal, setShowCreditConfirmModal] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [subscription, setSubscription] = useState<any | null>(null);
    const [subLoading, setSubLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipMessage, setTooltipMessage] = useState("");

    const defaultImage = "https://picsum.photos/id/1015/300/200";
    const clearImage = "/imgs/custom/photo.png";

    // 默认结果图片 - 在 result 虚线框中显示
    const defaultResultImage = "/imgs/custom/textcolor-default-result.png"; // 您需要准备这张图片

    // 初始化时设置默认结果图片
    React.useEffect(() => {
        setGeneratedImage(defaultResultImage);
    }, []);

    // 设置表单默认值
    const defaultFormValues = {
        size: "Auto",
        age: [],
        pages: [],
        prompt: "A little boy flying with balloons over a peaceful village, with a few birds in the sky and soft clouds around. Whimsical and lighthearted, in a crayon-style illustration." // 更新文本框默认值
    };

    const {
        register,
        handleSubmit,
        formState: {errors},
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: defaultFormValues // 应用默认值
    });

    // 监听prompt字段的变化
    const watchedPrompt = watch("prompt");

    // 更新promptValue状态
    React.useEffect(() => {
        setPromptValue(watchedPrompt || "");
    }, [watchedPrompt]);

    // 选项与图片的映射关系
    const promptImageMap = {
        "A cheerful animal parade with elephants, bunnies, and bears holding balloons and playing instruments. Colorful and playful, in storybook style.": "https://picsum.photos/id/1005/300/200",
        "A dreamy treehouse floating in the clouds, with glowing stars, candy ladders, and friendly animals reading books. Soft pastel colors, magical feel.": "https://picsum.photos/id/1015/300/200",
        "Kids in bright raincoats jumping in puddles, with smiling frogs, paper boats, and a rainbow in the sky. Crayon-style, full of joy.": "https://picsum.photos/id/1062/300/200"
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        if (!selectedStyle) {
            alert("请选择一个Style选项");
            return;
        }

        if (!data.prompt.trim()) {
            alert("请输入描述文字");
            return;
        }

        // 检查用户是否已登录
        if (!session) {
            setShowSignModal(true);
            return;
        }

        // 如果用户已登录，显示积分确认弹窗
        setPendingFormData(data);
        setShowCreditConfirmModal(true);
    };

    // 处理积分确认后的实际生成逻辑
    const handleConfirmGenerate = async () => {
        if (!pendingFormData) return;

        const data = pendingFormData;
        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            // 创建 FormData 对象
            const formData = new FormData();

            // 将 Size 比例值映射为 API 期望的像素尺寸
            const sizeMapping: { [key: string]: string } = {
                "Auto": "1024x1024",      // 默认正方形
                "1:1": "1024x1024",       // 正方形 1:1
                "4:3": "1248x832",        // 横版 3:2 (接近4:3)
                "3:4": "832x1248",        // 竖版 2:3 (接近3:4)
                "16:9": "1248x832",       // 横版 3:2 (接近16:9)
                "9:16": "832x1248",       // 竖版 2:3 (接近9:16)
            };

            const apiSize = sizeMapping[selectedSize] || "1024x1024";

            // 直接传递用户输入的描述，固定的黑白线稿 prompt 在 API 中处理
            formData.append('prompt', data.prompt.trim());
            formData.append('size', apiSize);
            formData.append('style', selectedStyle);
            formData.append('watermark', hasWatermark.toString()); // 新增：水印参数

            console.log(`🎯 发送请求到 generate-text-to-image API:`);
            console.log(`📝 用户描述: ${data.prompt.trim()}`);
            console.log(`📐 Size: ${selectedSize} -> ${apiSize}`);
            console.log(`🎨 Style: ${selectedStyle}`);
            console.log(`💧 Watermark: ${hasWatermark}`); // 新增：水印日志

            const response = await axios.post("/api/generate-text-to-image", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("✅ API 请求成功，后端返回：", response.data);

            // 处理返回的结果，显示生成的图片
            if (response.data.success && response.data.image) {
                console.log("🖼️ 生成的涂色书图片已准备就绪");
                setGeneratedImage(response.data.image);
                setIsCleared(false); // 重置清除状态，确保显示生成的图片

                // 更新用户积分
                setUserCredits(prev => Math.max(0, prev - 2));
                toast.success("图片生成成功！已消耗2个积分");
            } else {
                alert("生成失败：未收到有效的图片数据");
            }

        } catch (error: any) {
            console.error("❌ API 请求失败：", error);
            alert(`生成失败: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsGenerating(false);
            setPendingFormData(null);
        }
    };

    const sizeOptions = [
        {value: "Auto", label: "Auto", ratio: "auto"},
        {value: "1:1", label: "1:1", ratio: "1/1"},
        {value: "4:3", label: "4:3", ratio: "4/3"},
        {value: "3:4", label: "3:4", ratio: "3/4"},
        {value: "16:9", label: "16:9", ratio: "16/9"},
        {value: "9:16", label: "9:16", ratio: "9/16"},
    ];

    const ageOptions = [
        {value: "1-2", label: "1-2"},
        {value: "3-4", label: "3-4"},
        {value: "5-8", label: "5-8"},
    ];
    const pagesOptions = [
        {value: "1", label: "1"},
        {value: "2", label: "2"},
        {value: "4", label: "4"},
    ];

    const photoOptions = [
        {
            id: 1,
            title: "A cheerful animal parade with elephants, bunnies, and bears holding balloons and playing instruments. Colorful and playful, in storybook style.",
            image: "https://picsum.photos/id/1005/300/200"
        },
        {
            id: 2,
            title: "A dreamy treehouse floating in the clouds, with glowing stars, candy ladders, and friendly animals reading books. Soft pastel colors, magical feel.",
            image: "https://picsum.photos/id/1015/300/200"
        },
        {
            id: 3,
            title: "Kids in bright raincoats jumping in puddles, with smiling frogs, paper boats, and a rainbow in the sky. Crayon-style, full of joy.",
            image: "https://picsum.photos/id/1062/300/200"
        }
    ];

    const handleImageClick = (option: { title: string; image: string }) => {
        setSelectedPrompt(option.title);
        setSelectedImage(option.image);
        setValue("prompt", option.title); // 使用setValue更新表单值
        setPromptValue(option.title); // 同步更新promptValue状态
    };

    const handleClear = () => {
        setSelectedPrompt("");
        setSelectedImage(clearImage);
        setSelectedStyle("simplified"); // 重置为 simplified
        setSelectedSize("Auto"); // 重置尺寸为 Auto
        setValue("prompt", ""); // 清空文本框
        setPromptValue(""); // 同步更新promptValue状态
        setGeneratedImage(null); // 清除所有图片（包括默认图片和生成的图片）
        setIsCleared(true); // 设置清除状态为true
    };

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
    };

    const handleStyleSelect = (style: string) => {
        setSelectedStyle(style);
    };

    // 新增：清空描述文本框的函数
    const handleClearDescribe = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡
        setValue("prompt", ""); // 清空文本框
        setSelectedPrompt(""); // 清空选中的prompt状态
        setPromptValue(""); // 同步更新promptValue状态
    };

    // 新增：处理图片下载
    const handleDownload = () => {
        if (!generatedImage) {
            alert("没有可下载的图片，请先生成涂色书");
            return;
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `text-coloring-book-${selectedStyle}-${selectedSize}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleWatermarkToggle = (checked: boolean) => {
        // 如果用户未登录，显示登录模态框
        if (!session?.user) {
            setShowSignModal(true);
            return;
        }

        if (!checked) {
            // 关闭水印，直接设置
            setHasWatermark(true);
        } else {
            // 开启水印，需要检查订阅状态
            if (subscription) {
                // 有订阅（无论是否已取消，只要还在有效期内），可以去除水印
                setHasWatermark(false);
            } else {
                // 无订阅，显示订阅模态框
                setShowSubscriptionModal(true);
            }
        }
    };

    // 加载订阅一次
    useEffect(() => {
        async function loadSub() {
            try {
                setSubLoading(true);
                const resp = await fetch("/api/get-user-subscription");
                if (resp.ok) {
                    const data = await resp.json();
                    setSubscription(data.subscription);
                }
            } finally {
                setSubLoading(false);
            }
        }

        loadSub();
    }, []);

    // 新增：监听订阅状态变化，自动设置水印状态
    useEffect(() => {
        if (subscription) {
            // 如果用户有订阅（无论是否已取消，只要还在有效期内），就自动关闭水印
            setHasWatermark(false);
            console.log("🎯 用户有有效订阅，自动关闭水印");
        } else if (subscription === null && !subLoading) {
            // 如果明确没有订阅且不在加载中，则显示水印
            setHasWatermark(true);
            console.log("🎯 用户无有效订阅，显示水印");
        }
    }, [subscription, subLoading]);

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


    return (
        <>
            <div className={clsx(styles.flexColorContainer)}>
                <div
                    style={{
                        // @ts-ignore
                        '--border-width': '7px',
                        '--border-style': 'solid',
                        '--border-color': '#c8f1c5',
                        '--border-radius': '15px',
                        // padding: "20px",
                        backgroundColor: "#f4f9c7", // 添加填充颜色
                        borderRadius: "15px", // 添加圆角以匹配边框
                    }}
                    className={clsx(styles.flexGroup, styles.group1, styles.borderHandDrown)}>
                    <h3 style={{
                        margin: "30px 0 10px 0", // 增加上边距，与左侧对齐
                        fontFamily: "dk_cool_crayonregular",
                        color: "#786312",
                        textAlign: "center"
                    }} className={clsx("lg:text-5xl md:text-3xl text-xl", styles.groupTitle)}>Describe</h3>
                    <form
                          onSubmit={handleSubmit(onSubmit)} className={clsx(styles.groupContent)}>
                        <div style={{padding: "20px"  }} className={clsx(styles.contentItem1)}>
                            {/* 左侧：文本框 */}
                            <div >
                                <div className={clsx("")} style={{

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
                                            paddingTop: '3px',
                                            width:"120px",
                                            marginBottom: '10px',
                                            marginTop:"-30px"
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

                                <div
                                    className={clsx("", styles.borderHandDrown)}
                                    style={{
                                        // @ts-ignore
                                        '--border-width': '2px',
                                        '--border-style': 'dashed',
                                        '--border-color': '#000',
                                        '--border-radius': '8px',

                                        minWidth:"250px",
                                        height: "160px", /*调整describe文本框的高度*/
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        margin: "0 auto",
                                    }}
                                >
                                <textarea
                                    {...register("prompt", {required: true})}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        padding: "12px",
                                        fontSize: "14px",
                                        color: "#806a18",
                                        border: "none",
                                        outline: "none",
                                        resize: "none",
                                        backgroundColor: "transparent",
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        textAlign: "justify",
                                        lineHeight: "1.4"
                                    }}
                                    placeholder="Enter description text..."
                                />
                                    {/* 添加清空按钮 - 只在有内容时显示 */}
                                    {promptValue && promptValue.trim() && (
                                        <button
                                            onClick={handleClearDescribe}
                                            type="button"
                                            style={{
                                                position: "absolute",
                                                top: "5px",
                                                right: "5px",
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                backgroundColor: "rgba(255, 0, 0, 0.8)",
                                                color: "white",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                zIndex: 1,
                                                lineHeight: "1",
                                            }}
                                            title="清空文本"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {/* 在虚线框下方添加提示文字 */}
                                <div style={{
                                    marginTop: "10px",
                                    textAlign: "left",
                                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                    fontSize: "16px",
                                    color: "#70c09d",
                                    lineHeight: "1.2",
                                    // width: "340px",
                                    margin: "10px auto 0 auto",
                                    pointerEvents: "none"
                                }}>
                                    <div>Need inspiration?</div>
                                    <div>Try one of these examples:</div>
                                </div>

                                {/* 3个示例文本链接纵向排列 */}
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "5px",
                                    // width: "340px",
                                    margin: "10px auto 0 auto",
                                    position: "relative",
                                    zIndex: 10
                                }}>
                                    {photoOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            className={styles.borderHandDrown}
                                            style={{
                                                // @ts-ignore
                                                '--border-width': '2px',
                                                '--border-style': 'solid',
                                                '--border-color': selectedPrompt === option.title ? '#1890ff' : '#c8f1c5',
                                                '--border-radius': '8px',
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                padding: "8px 12px",
                                                backgroundColor: selectedPrompt === option.title ? "#e6f7ff" : "transparent",
                                                position: "relative",
                                                zIndex: 11,
                                                borderRadius: "8px"
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleImageClick(option);
                                            }}
                                        >
                                            <div style={{
                                                fontSize: "14px",
                                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                                color: "#666",
                                                lineHeight: "1.2",
                                                pointerEvents: "none",
                                                textAlign: "justify"
                                            }}>
                                                {option.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Style必填项错误提示 */}
                            {!selectedStyle && (
                                <span style={{
                                    color: "red",
                                    fontSize: "12px",
                                    marginTop: "-15px",
                                    marginBottom: "15px",
                                    display: "block",
                                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                                }}>
                            Style 是必填项
                        </span>
                            )}

                            {errors.prompt && (
                                <span style={{color: "red", fontSize: "12px", marginLeft: "25px"}}>
                            描述文字是必填项
                        </span>
                            )}

                        </div>
                        <div style={{
                            padding: "10px"
                        }}
                             className={clsx(styles.contentItem2)}>
                            <div style={{}}>
                                <label style={{
                                    fontSize: "18px",
                                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                    backgroundColor: '#f7c863',
                                    borderRadius: '25px',
                                    color: 'white',
                                    padding: '8px 16px',
                                    display: 'inline-block',
                                    alignSelf: 'flex-start',
                                    marginBottom: '15px'
                                }}>Size</label>

                                {/* Size选项按钮 - 改为一行排列 */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "5px",
                                    marginBottom: "20px"
                                }}>
                                    {sizeOptions.map((option) => (
                                        <div key={option.value} style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            flex: "1"
                                        }}>
                                            <div
                                                className={styles.borderHandDrown}
                                                onClick={() => handleSizeSelect(option.value)}
                                                style={{
                                                    // @ts-ignore
                                                    '--border-width': '2px',
                                                    '--border-style': 'dashed',
                                                    '--border-color': '#000',
                                                    '--border-radius': '8px',
                                                    width: option.value === "Auto" ? "42px" :
                                                        option.value === "1:1" ? "42px" :
                                                            option.value === "4:3" ? "56px" :
                                                                option.value === "3:4" ? "42px" :
                                                                    option.value === "16:9" ? "65px" :
                                                                        option.value === "9:16" ? "39px" : "42px",
                                                    height: option.value === "Auto" ? "42px" :
                                                        option.value === "1:1" ? "42px" :
                                                            option.value === "4:3" ? "42px" :
                                                                option.value === "3:4" ? "56px" :
                                                                    option.value === "16:9" ? "39px" :
                                                                        option.value === "9:16" ? "65px" : "42px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    backgroundColor: selectedSize === option.value ? "#e6f7ff" : "transparent",
                                                    transition: "all 0.2s",
                                                    flexShrink: 0,
                                                    minWidth: "unset",
                                                    minHeight: "unset",
                                                    padding: "0",
                                                    boxSizing: "border-box",
                                                    marginBottom: "5px"
                                                }}
                                            >
                                            </div>
                                            <div style={{
                                                fontSize: "12px",
                                                marginTop: "3px",
                                                textAlign: "center",
                                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                                whiteSpace: "nowrap",
                                                color:"black"
                                            }}>
                                                {option.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Style区域移到Size区域内部 */}
                                <div style={{display: "flex", flexDirection: "column"}}>
                                    <label style={{
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        fontSize: "18px",
                                        backgroundColor: '#f7c863',
                                        borderRadius: '25px',
                                        color: 'white',
                                        padding: '8px 16px',
                                        display: 'inline-block',
                                        alignSelf: 'flex-start',
                                        marginBottom: '15px'
                                    }}>Style</label>

                                    {/* Style选项区域 - 三个龙猫图片水平排列 */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "10px"
                                    }}>
                                        {/* Simplified (for kids) */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                flex: "1",
                                                cursor: "pointer",
                                                padding: "8px",
                                                borderRadius: "8px",
                                                backgroundColor: selectedStyle === "simplified" ? "#e6f7ff" : "transparent",
                                                transition: "all 0.2s",
                                                border: selectedStyle === "simplified" ? "2px solid #1890ff" : "2px solid transparent"
                                            }}
                                            onClick={() => handleStyleSelect("simplified")}
                                        >
                                            <img
                                                src="/imgs/custom/totoro-simple.png"
                                                alt="Simplified style"
                                                style={{
                                                    width: "150px",
                                                    height: "150px",
                                                    objectFit: "contain",
                                                    marginBottom: "8px"
                                                }}
                                            />
                                            <div style={{
                                                fontSize: "10px",
                                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                                textAlign: "center",
                                                lineHeight: "1.2",
                                                color: "#000"
                                            }}>
                                                Simplified (for kids)
                                            </div>
                                        </div>

                                        {/* Medium detailed (for kids) */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                flex: "1",
                                                cursor: "pointer",
                                                padding: "8px",
                                                borderRadius: "8px",
                                                backgroundColor: selectedStyle === "medium" ? "#e6f7ff" : "transparent",
                                                transition: "all 0.2s",
                                                border: selectedStyle === "medium" ? "2px solid #1890ff" : "2px solid transparent"
                                            }}
                                            onClick={() => handleStyleSelect("medium")}
                                        >
                                            <img
                                                src="/imgs/custom/totoro-medium.png"
                                                alt="Medium detailed style"
                                                style={{
                                                    width: "150px",
                                                    height: "150px",
                                                    objectFit: "contain",
                                                    marginBottom: "8px"
                                                }}
                                            />
                                            <div style={{
                                                fontSize: "10px",
                                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                                textAlign: "center",
                                                lineHeight: "1.2",
                                                color: "#000"
                                            }}>
                                                Medium detailed (for kids)
                                            </div>
                                        </div>

                                        {/* Detailed (for adults) */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                flex: "1",
                                                cursor: "pointer",
                                                padding: "8px",
                                                borderRadius: "8px",
                                                backgroundColor: selectedStyle === "detailed" ? "#e6f7ff" : "transparent",
                                                transition: "all 0.2s",
                                                border: selectedStyle === "detailed" ? "2px solid #1890ff" : "2px solid transparent"
                                            }}
                                            onClick={() => handleStyleSelect("detailed")}
                                        >
                                            <img
                                                src="/imgs/custom/totoro-detailed.png"
                                                alt="Detailed style"
                                                style={{
                                                    width: "150px",
                                                    height: "150px",
                                                    objectFit: "contain",
                                                    marginBottom: "8px"
                                                }}
                                            />
                                            <div style={{
                                                fontSize: "10px",
                                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                                textAlign: "center",
                                                lineHeight: "1.2",
                                                color: "#000"
                                            }}>
                                                Detailed (for adults)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                display: "flex",
                                flexDirection:"row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "30px",
                                marginBottom: "10px"
                            }}>
                                {/* 水印控制开关 - 与style按钮左边垂直对齐 */}
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                    fontSize: "16px",
                                    color: "#679fb5"
                                }}>
                                    <Switch
                                        checked={!hasWatermark}
                                        onCheckedChange={handleWatermarkToggle}
                                        className="data-[state=checked]:bg-[#679fb5]"
                                    />
                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        gap: "5px"
                                    }}>
                                    <span className={clsx("text-xs lg:text-xl md:text-sm")} style={{
                                        // fontSize: "18px",
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        color: "#679fb5",
                                        fontWeight: "bold",
                                        whiteSpace: "nowrap",
                                    }}>
                                        Remove watermark
                                    </span>
                                        <div className={clsx("text-xs lg:text-sm md:text-sm")} style={{
                                            // fontSize: "12px",
                                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                            backgroundColor: '#f7c863',
                                            borderRadius: '12px',
                                            color: 'white',
                                            padding: '4px 12px',
                                            display: 'inline-block',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            Members only feature
                                        </div>
                                    </div>
                                </div>

                                {/* Generate按钮 - 与第三张style图片右边框对齐 */}
                                <div style={{
                                    paddingRight: "10px",
                                }}>
                                    <button
                                        type="submit"
                                        className={clsx("text-xs lg:text-xl md:text-sm",styles.borderHandDrown) }
                                        style={{
                                            // @ts-ignore
                                            '--border-width': '3px',
                                            '--border-style': 'solid',
                                            '--border-color': '#679fb5',
                                            '--border-radius': '25px',
                                            // fontSize: "26px",
                                            backgroundColor: "#679fb5",
                                            color: "#FFF",
                                            padding: "12px 20px",
                                            fontWeight: "bold",
                                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                            borderRadius: "25px",
                                            border: "none"
                                        }}
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </div>


                    </form>


                </div>
                <div
                    style={{
                        // @ts-ignore
                        '--border-width': '7px',
                        '--border-style': 'solid',
                        '--border-color': '#f9ef94',
                        '--border-radius': '15px',
                        padding: "0px 20px 20px 20px", // 调整内边距，减少顶部空间
                        backgroundColor: "#fbfbca", // 添加填充颜色
                    }}
                    className={clsx(styles.flexGroup, styles.group2, styles.borderHandDrown)}>

                    <h3 style={{
                        margin: "30px 0 10px 0", // 增加上边距，与左侧对齐
                        fontFamily: "dk_cool_crayonregular",
                        color: "#786312",
                        textAlign: "center"
                    }} className={clsx("lg:text-5xl md:text-3xl text-xl", styles.groupTitle)}>Result</h3>
                    <div className={clsx(styles.groupContent)}>
                        <div className={clsx(styles.contentItem)}>
                            <div
                                className={styles.borderHandDrown}
                                style={{
                                    // @ts-ignore
                                    '--border-width': '2px',
                                    '--border-style': 'dashed',
                                    '--border-color': '#000',
                                    '--border-radius': '15px',
                                    width: "100%",
                                    height: "400px", // 固定高度
                                    margin: "10px auto",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    position: "relative",
                                    overflow: "hidden",
                                    padding: "1.5rem", // 增加内边距，让图片看起来在框内
                                    boxSizing: "border-box" // 确保内边距在内部计算
                                }}
                            >
                                {isGenerating ? (
                                    <div style={{
                                        color: "#666",
                                        fontSize: "18px",
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                                    }}>
                                        Generating...
                                    </div>
                                ) : generatedImage && !isCleared ? (
                                    <img
                                        src={generatedImage}
                                        alt="Generated Coloring Book"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        color: "#666",
                                        fontSize: "14px",
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        textAlign: "center"
                                    }}>
                                        Click Generate to show the result
                                    </div>
                                )}
                            </div>
                            <div style={{
                                display: "flex",
                                gap: "5px",
                                justifyContent: "space-between",
                                width: "100%",
                                marginTop: "40px", // 减少上边距，以抵消整体下移
                                marginBottom: "10px"
                            }}>
                                <button
                                    className={clsx("text-xs lg:text-sm md:text-xs",styles.borderHandDrown)}
                                    onClick={handleDownload}
                                    style={{
                                        // @ts-ignore
                                        '--border-width': '3px',
                                        '--border-style': 'solid',
                                        '--border-color': '#70c09d',
                                        '--border-radius': '20px',

                                        backgroundColor: "#70c09d",
                                        color: "#fff",
                                        padding: "8px 12px",
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        borderRadius: "20px",
                                        border: "none",
                                        cursor: generatedImage ? "pointer" : "not-allowed",
                                        opacity: generatedImage ? 1 : 0.5
                                    }}>
                                    Download Image
                                </button>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "15px"
                                }}>
                                    <div className={clsx("text-xs lg:text-xl md:text-sm")} style={{

                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        color: "#786312",
                                        textAlign: "center",
                                        margin: "0"
                                    }}>
                                        Share To
                                    </div>
                                    <div style={{display: "flex", gap: "10px", justifyContent: "center", alignItems: "center"}}>
                                        {/* Twitter Logo */}
                                        <div style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            backgroundColor: "#1DA1F2",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            transition: "transform 0.2s"
                                        }}>
                                            <TwitterLogoIcon style={{color: "white", fontSize: "14px"}}/>
                                        </div>

                                        {/* Facebook Logo */}
                                        <div style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            backgroundColor: "#4267B2",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            transition: "transform 0.2s"
                                        }}>
                                            <FaFacebookF style={{color: "white", fontSize: "14px"}}/>
                                        </div>

                                        {/* LinkedIn Logo */}
                                        <div style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            backgroundColor: "#0077B5",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            transition: "transform 0.2s"
                                        }}>
                                            <FaLinkedinIn style={{color: "white", fontSize: "14px"}}/>
                                        </div>

                                        {/* WhatsApp Logo */}
                                        <div style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            backgroundColor: "#25D366",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            transition: "transform 0.2s"
                                        }}>
                                            <FaWhatsapp style={{color: "white", fontSize: "14px"}}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* 登录模态框 */}
            <SignModal/>

            {/* 积分确认模态框 */}
            <CreditConfirmModal
                open={showCreditConfirmModal}
                onOpenChange={setShowCreditConfirmModal}
                onConfirm={handleConfirmGenerate}
                credits={2}
                leftCredits={userCredits}
            />
        </>
    );
};

export default TextColor;
