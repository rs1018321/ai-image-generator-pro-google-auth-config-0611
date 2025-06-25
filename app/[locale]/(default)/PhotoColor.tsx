"use client"

import React, {useState, useEffect} from "react";
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
import clsx from 'clsx'
import ImageCompare from "@/components/ui/ImageCompare"

type FormData = {
    size: string;
    age: string[];
    style: string;
};

const PhotoColor: React.FC = () => {
    const {data: session} = useSession();
    const {setShowSignModal, userCredits, setUserCredits, setShowSubscriptionModal} = useAppContext();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [selectedSize, setSelectedSize] = useState<string>("Auto");
    const [selectedStyle, setSelectedStyle] = useState<string>("medium");
    const [imageDimensions, setImageDimensions] = useState<{
        width: number,
        height: number,
        imageWidth: number,
        imageHeight: number
    } | null>(null);
    const [hasWatermark, setHasWatermark] = useState(true);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [subscription, setSubscription] = useState<any | null>(null);
    const [subLoading, setSubLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipMessage, setTooltipMessage] = useState("");
    const [isManuallyCleared, setIsManuallyCleared] = useState(false);

    // 新增：积分相关状态
    const [showCreditConfirmModal, setShowCreditConfirmModal] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

    const defaultImage = "https://picsum.photos/id/237/100/100";
    const clearImage = "/imgs/custom/photo.png"; // 新的默认图片URL
    
    // 默认示例图片 - 在upload虚线框中显示
    const defaultUploadImage = "/imgs/custom/default-upload-example.png"; // 您需要准备这张图片
    
    // 三个Style模式对应的默认结果图片
    const defaultResultImages = {
        simplified: "/imgs/custom/default-result-simplified.png",   // 需要创建
        medium: "/imgs/custom/default-result-medium.png",           // 需要创建  
        detailed: "/imgs/custom/default-result-detailed.png"        // 需要创建
    };
    
    // 预设图片对应的线稿图映射 - 每张预设图对应三个Style的线稿图
    const presetImageResults = {
        "/imgs/custom/photo-cartoon.png": {
            simplified: "/imgs/custom/cartoon-simplified.png",
            medium: "/imgs/custom/cartoon-medium.png",
            detailed: "/imgs/custom/cartoon-detailed.png"
        },
        "/imgs/custom/photo-portrait.png": {
            simplified: "/imgs/custom/portrait-simplified.png",
            medium: "/imgs/custom/portrait-medium.png",
            detailed: "/imgs/custom/portrait-detailed.png"
        },
        "/imgs/custom/photo-landscape.png": {
            simplified: "/imgs/custom/landscape-simplified.png",
            medium: "/imgs/custom/landscape-medium.png",
            detailed: "/imgs/custom/landscape-detailed.png"
        },
        "/imgs/custom/photo-animal.png": {
            simplified: "/imgs/custom/animal-simplified.png",
            medium: "/imgs/custom/animal-medium.png",
            detailed: "/imgs/custom/animal-detailed.png"
        },
        "/imgs/custom/photo-still-life.png": {
            simplified: "/imgs/custom/still-life-simplified.png",
            medium: "/imgs/custom/still-life-medium.png",
            detailed: "/imgs/custom/still-life-detailed.png"
        },
        "/imgs/custom/photo-artistic.png": {
            simplified: "/imgs/custom/artistic-simplified.png",
            medium: "/imgs/custom/artistic-medium.png",
            detailed: "/imgs/custom/artistic-detailed.png"
        }
    };
    
    // 初始化时设置默认图片
    React.useEffect(() => {
        setUploadedImage(defaultUploadImage);
        setGeneratedImage(defaultResultImages.medium); // 默认显示medium模式的线稿图
    }, []);

    // 新增：当Style变化时更新默认结果图片
    React.useEffect(() => {
        if (!isGenerating && !generatedImage?.includes('data:image')) {
            // 检查当前是否选中了预设图片
            if (selectedImage && presetImageResults[selectedImage as keyof typeof presetImageResults]) {
                // 如果选中了预设图片，显示对应的线稿图
                const presetResults = presetImageResults[selectedImage as keyof typeof presetImageResults];
                const newResultImage = presetResults[selectedStyle as keyof typeof presetResults];
                setGeneratedImage(newResultImage);
                console.log(`🎨 切换Style到${selectedStyle}，预设图片${selectedImage}对应的线稿图: ${newResultImage}`);
            } else if (!selectedImage && !uploadedImage && !isManuallyCleared) {
                // 如果没有选中预设图片，并且不是手动清空的，显示默认线稿图
                setGeneratedImage(defaultResultImages[selectedStyle as keyof typeof defaultResultImages] || defaultResultImages.medium);
            }
        }
    }, [selectedStyle, selectedImage, isGenerating, uploadedImage, isManuallyCleared]);

    // 组件挂载后加载订阅信息（仅一次）
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

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        if (!selectedStyle) {
            alert("请选择一个Style选项");
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
        const imageToUse = uploadedImage || selectedImage || defaultImage;
        
        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            // 创建 FormData 对象
            const formData = new FormData();
            
            // 将 Size 选择映射为对应的 API 尺寸参数
            const sizeMapping: { [key: string]: string } = {
                "Auto": "1024x1024",      // 默认正方形
                "1:1": "1024x1024",       // 正方形 1:1
                "4:3": "1248x832",        // 横版 3:2 (接近4:3)
                "3:4": "832x1248",        // 竖版 2:3 (接近3:4)
                "16:9": "1248x832",       // 横版 3:2 (接近16:9)
                "9:16": "832x1248",       // 竖版 2:3 (接近9:16)
            };
            
            const apiSize = sizeMapping[selectedSize] || "1024x1024";
            
            formData.append('size', apiSize);
            
            // 处理图片数据
            if (uploadedImage) {
                // 如果是上传的图片（base64格式），需要转换为 File 对象
                const response = await fetch(uploadedImage);
                const blob = await response.blob();
                const file = new File([blob], 'uploaded-image.png', {type: 'image/png'});
                formData.append('image', file);
            } else if (selectedImage) {
                // 如果是选中的预设图片，需要先下载然后转换为 File 对象
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                const file = new File([blob], 'selected-image.jpg', {type: 'image/jpeg'});
                formData.append('image', file);
            } else {
                // 使用默认图片
                const response = await fetch(defaultImage);
                const blob = await response.blob();
                const file = new File([blob], 'default-image.jpg', {type: 'image/jpeg'});
                formData.append('image', file);
            }
            
            // 添加style参数（后端会进行映射）
            formData.append('style', selectedStyle);
            formData.append('watermark', hasWatermark.toString()); // 新增：水印参数
            
            console.log(`🎯 发送请求到 generate-coloring-book API:`);
            console.log(`📐 Size: ${selectedSize} -> ${apiSize}`);
            console.log(`🎨 Style: ${selectedStyle}`);
            console.log(`💧 Watermark: ${hasWatermark}`); // 新增：水印日志

            const response = await axios.post("/api/generate-coloring-book", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log("✅ API 请求成功，后端返回：", response.data);
            
            // 处理返回的结果，显示生成的图片
            if (response.data.success && response.data.image) {
                console.log("🖼️ 生成的涂色书图片已准备就绪");
                setGeneratedImage(response.data.image);

                // 更新用户积分
                setUserCredits(prev => Math.max(0, prev - 1));
                toast.success("图片生成成功！已消耗1个积分");
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

    // 优化：添加图标和比例值
    const sizeOptions = [
        {value: "Auto", label: "Auto", icon: "🔄", ratio: "auto"},
        {value: "1:1", label: "1:1", icon: "🟥", ratio: "1/1"},
        {value: "4:3", label: "4:3", icon: "📸", ratio: "4/3"},
        {value: "3:4", label: "3:4", icon: "🖼️", ratio: "3/4"},
        {value: "16:9", label: "16:9", icon: "🌆", ratio: "16/9"},
        {value: "9:16", label: "9:16", icon: "📱", ratio: "9/16"},
    ];

    const ageOptions = [
        {value: "1-2", label: "Simplified (for kids)"},
        {value: "3-4", label: "Medium detailed (for kids)"},
        {value: "5-8", label: "Detailed (for adults)"},
    ];

    const photoOptions = [
        {
            imageUrl: "/imgs/custom/photo-cartoon.png", // 您需要准备这张图片
            title: "Cartoon",
        },
        {
            imageUrl: "/imgs/custom/photo-portrait.png", // 您需要准备这张图片
            title: "Portrait",
        },
        {
            imageUrl: "/imgs/custom/photo-landscape.png", // 您需要准备这张图片
            title: "Landscape",
        },
        {
            imageUrl: "/imgs/custom/photo-animal.png", // 您需要准备这张图片
            title: "Animal",
        },
        {
            imageUrl: "/imgs/custom/photo-still-life.png", // 您需要准备这张图片
            title: "Still Life",
        },
        {
            imageUrl: "/imgs/custom/photo-artistic.png", // 您需要准备这张图片
            title: "Artistic Illustration",
        },
    ];

    // 处理图片点击事件
    const handleImageClick = (imageUrl: string) => {
        console.log("🖼️ 图片被点击了！", imageUrl);
        setSelectedImage(imageUrl);
        setUploadedImage(null);
        setIsManuallyCleared(false); // 重置手动清空状态
        
        // 根据选中的预设图片和当前Style显示对应的线稿图
        if (presetImageResults[imageUrl as keyof typeof presetImageResults]) {
            const presetResults = presetImageResults[imageUrl as keyof typeof presetImageResults];
            const resultImage = presetResults[selectedStyle as keyof typeof presetResults];
            setGeneratedImage(resultImage);
            console.log(`🎨 选择预设图片${imageUrl}，当前Style: ${selectedStyle}，显示线稿图: ${resultImage}`);
        } else {
            // 如果不是预设图片，清除生成结果
            setGeneratedImage(null);
        }

        // 计算预设图片尺寸
        const img = new Image();
        img.onload = () => {
            console.log("✅ 图片加载成功，尺寸：", img.width, "x", img.height);
            const maxImageSize = 120; // 图片最大尺寸（减去边距）
            const padding = 10; // 虚线框内边距
            const aspectRatio = img.width / img.height;

            let imageWidth, imageHeight;
            if (aspectRatio > 1) {
                // 横图
                imageWidth = Math.min(maxImageSize, img.width);
                imageHeight = imageWidth / aspectRatio;
            } else {
                // 竖图或正方形
                imageHeight = Math.min(maxImageSize, img.height);
                imageWidth = imageHeight * aspectRatio;
            }

            // 虚线框尺寸 = 图片尺寸 + 内边距
            const containerWidth = imageWidth + padding * 2;
            const containerHeight = imageHeight + padding * 2;

            setImageDimensions({
                width: containerWidth,
                height: containerHeight,
                imageWidth,
                imageHeight
            });
        };
        img.onerror = () => {
            console.error("❌ 图片加载失败：", imageUrl);
        };
        img.src = imageUrl;
    };

    // 新增：处理文件上传
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setUploadedImage(result);
                setSelectedImage(null);
                setGeneratedImage(null); // 清除之前生成的结果图片
                setIsManuallyCleared(false); // 重置手动清空状态

                // 计算图片尺寸
                const img = new Image();
                img.onload = () => {
                    const maxImageSize = 120; // 图片最大尺寸（减去边距）
                    const padding = 10; // 虚线框内边距
                    const aspectRatio = img.width / img.height;

                    let imageWidth, imageHeight;
                    if (aspectRatio > 1) {
                        // 横图
                        imageWidth = Math.min(maxImageSize, img.width);
                        imageHeight = imageWidth / aspectRatio;
                    } else {
                        // 竖图或正方形
                        imageHeight = Math.min(maxImageSize, img.height);
                        imageWidth = imageHeight * aspectRatio;
                    }

                    // 虚线框尺寸 = 图片尺寸 + 内边距
                    const containerWidth = imageWidth + padding * 2;
                    const containerHeight = imageHeight + padding * 2;

                    setImageDimensions({
                        width: containerWidth,
                        height: containerHeight,
                        imageWidth,
                        imageHeight
                    });
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    // 新增：触发文件选择
    const handleCameraClick = () => {
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) {
            // 先清空文件输入框的值，解决重复上传同一文件的缓存问题
            fileInput.value = '';
            fileInput.click();
        }
    };

    // 新增：删除上传的图片
    const handleDeleteImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡，避免触发相机点击事件
        setUploadedImage(null); // 清空上传的图片
        setSelectedImage(null); // 清空选中的预设图片
        setImageDimensions(null); // 重置图片尺寸
        setGeneratedImage(null); // 清空Result框的图片
        setIsManuallyCleared(true); // 标记为手动清空

        // 重置文件输入框的值
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        
        console.log("🗑️ 清空上传框和Result框的图片");
    };

    // 清除选中的图片
    const handleClear = () => {
        setUploadedImage(defaultUploadImage); // 重置为默认上传图片
        setSelectedImage(null); // 清空选中的图片
        setSelectedSize("Auto"); // 重置尺寸选择为 Auto
        setSelectedStyle("medium"); // 重置样式选择为 medium
        setGeneratedImage(defaultResultImages.medium); // 重置为medium对应的默认结果图片
        setImageDimensions(null); // 重置图片尺寸
        
        // 重置文件输入框的值，解决重复上传同一张图片不显示的问题
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        
        console.log("🧹 清空所有选择，重置为默认状态");
    };

    // 处理尺寸选择
    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
    };

    // 处理Style选择
    const handleStyleSelect = (style: string) => {
        setSelectedStyle(style);
        
        // 如果当前显示的是默认示例图片或预设图片的线稿图（不是真实生成的图片），则切换到对应Style的图片
        if (generatedImage && !generatedImage.includes('data:image') && !generatedImage.includes('blob:')) {
            if (selectedImage && presetImageResults[selectedImage as keyof typeof presetImageResults]) {
                // 如果选中了预设图片，显示对应的线稿图
                const presetResults = presetImageResults[selectedImage as keyof typeof presetImageResults];
                const newResultImage = presetResults[style as keyof typeof presetResults];
                setGeneratedImage(newResultImage);
                console.log(`🎨 切换Style到${style}，预设图片${selectedImage}对应的线稿图: ${newResultImage}`);
            } else {
                // 如果没有选中预设图片，显示默认线稿图
                const newResultImage = defaultResultImages[style as keyof typeof defaultResultImages] || defaultResultImages.medium;
                setGeneratedImage(newResultImage);
                console.log(`🎨 切换Style到${style}，更新默认结果图片为: ${newResultImage}`);
            }
        }
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
        link.download = `coloring-book-${selectedStyle}-${selectedSize}-${Date.now()}.png`;
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


    // @ts-ignore
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
                        backgroundColor: "#f4f9c7", // 添加填充颜色
                    }}
                    className={clsx(styles.flexGroup, styles.group1, styles.borderHandDrown)}>
                    <h3 style={{
                        margin: "30px 0 10px 0",
                        fontFamily: "dk_cool_crayonregular",
                        color: "#786312",
                        textAlign: "center",
                        // @ts-ignore
                        fontDisplay:"block",
                    }} className={clsx("lg:text-5xl md:text-3xl text-xl", styles.groupTitle)}>Upload</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className={clsx(styles.groupContent)}>
                        <div style={{padding: "20px"  }} className={clsx(styles.contentItem1)}>
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
                                    className={styles.borderHandDrown}
                                    style={{
                                        // @ts-ignore
                                        '--border-width': '2px',
                                        '--border-style': 'dashed',
                                        '--border-color': '#000',
                                        '--border-radius': '8px',
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        padding: "10px",
                                        // width: '100%',
                                        height: '340px',
                                        // aspectRatio:"1/1"
                                    }}
                                    onClick={handleCameraClick}
                                >
                                    <input
                                        id="photo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{display: "none"}}
                                    />

                                    {uploadedImage ? (
                                        <>
                                            <img
                                                src={uploadedImage}
                                                alt="uploaded"
                                                style={{
                                                    objectFit: "contain",
                                                    borderRadius: "4px",
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                            />
                                            <button
                                                onClick={handleDeleteImage}
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
                                                title="删除图片"
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : selectedImage ? (
                                        <>
                                            <img
                                                src={selectedImage}
                                                alt="selected"
                                                style={{
                                                    objectFit: "contain",
                                                    borderRadius: "4px",
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                            />
                                            <button
                                                onClick={handleDeleteImage}
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
                                                title="删除图片"
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : (

                                        <div >
                                            <img
                                                src={clearImage}
                                                alt="camera"
                                                style={{
                                                    width: "150px",
                                                    height: "150px",
                                                    objectFit: "contain",
                                                    aspectRatio: "1/1",
                                                }}
                                            />
                                        </div>

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

                                    margin: "10px auto 0 auto",
                                    pointerEvents: "none"
                                }}>
                                    <div>No image?</div>
                                    <div>Try one of these:</div>
                                </div>

                                {/* 6张图片一行排列 */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "8px",

                                    margin: "10px auto 0 auto",
                                    position: "relative",
                                    zIndex: 10
                                }}>
                                    {photoOptions.map((photo, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                border: selectedImage === photo.imageUrl ? "2px solid #1890ff" : "2px solid transparent",
                                                borderRadius: "8px",
                                                padding: "2px",
                                                backgroundColor: selectedImage === photo.imageUrl ? "#e6f7ff" : "transparent",
                                                position: "relative",
                                                zIndex: 11
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleImageClick(photo.imageUrl);
                                            }}
                                        >
                                            <img
                                                src={photo.imageUrl}
                                                alt={photo.title}
                                                style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    minWidth: "2.2rem",
                                                    minHeight: "2.2rem",
                                                    objectFit: "contain",
                                                    borderRadius: "6px",
                                                    display: "block",
                                                    pointerEvents: "none"
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{
                            padding: "10px"
                        }} className={clsx(styles.contentItem2)}>
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
                                marginTop: "20px",
                                marginBottom: "15px"
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
                                        gap: "2px"
                                    }}>
                                    <span className={clsx("text-xs lg:text-xl md:text-sm")} style={{

                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        color: "#679fb5",
                                        fontWeight: "bold"
                                    }}>
                                        Remove watermark
                                    </span>
                                        <div className={clsx("text-xs lg:text-sm md:text-sm")} style={{
                                            // fontSize: "12px",
                                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                            backgroundColor: '#f7c863',
                                            borderRadius: '12px',
                                            color: 'white',
                                            padding: '4px 8px',
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

                                            backgroundColor: "#679fb5",
                                            color: "#FFF",
                                            padding: "12px 20px",
                                            fontWeight: "bold",
                                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                            borderRadius: "25px",
                                            border: "none",

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
                        padding: "20px",
                        backgroundColor: "#fbfbca", // 添加填充颜色
                    }}
                    className={clsx(styles.flexGroup, styles.group2, styles.borderHandDrown)}>

                    <h3 style={{
                        margin: "0 0 10px 0",
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
                                    padding: "1rem", // 增加内边距
                                    boxSizing: "border-box" // 确保内边距包含在宽度和高度内
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
                                ) : generatedImage && (uploadedImage || selectedImage) ? (
                                    // 移除多余的wrapper div，让ImageCompare直接成为flex子元素
                                    <ImageCompare
                                        leftImage={uploadedImage || selectedImage || ""}
                                        rightImage={generatedImage || ""}
                                        leftLabel="Original"
                                        rightLabel="Coloring Page"
                                    />
                                ) : generatedImage ? (
                                    // 只有生成图片时显示生成的图片
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
                                marginTop: "40px", // 增加与上方虚线框的距离
                                marginBottom: "10px"
                            }}>
                                <button
                                    className={clsx("text-xs lg:text-sm md:text-xs",styles.borderHandDrown) }
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
            {false && ( <div
            style={{
                display: "flex",
                width: "78vw",
                margin: "0 auto",
                    gap: "0px",
                    flexWrap: "wrap",
            }}
        >
                {/* Select Photo 区域 占比 2 - 暂时隐藏但保留代码 */}
            <div
                style={{

                    // @ts-ignore
                            fontDisplay:"block",
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#fae0b3',
                    '--border-radius': '15px',
                    padding: "10px",
                            // margin: "-10px 5px 5px -55px", // 调整左边距使左边框与"Coloring Page"的"C"对齐
                    flex: "2",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fcf6ca", // 添加填充颜色
                    borderRadius: "15px", // 添加圆角使背景色与边框一致
                    height: "565px", // 设置固定高度，与TextColor的Select Prompt区域一致
                    overflow: "hidden", // 隐藏超出部分
                }}
                className={styles.borderHandDrown}
            >
                <h3 style={{ 
                    textAlign: "center", 
                    margin: "10px auto", 
                    fontSize: "40px",
                            fontFamily: "dk_cool_crayonregular",
                    color: "#f0c46b",
                    lineHeight: "1.1"
                }}>
                            Select Photo
                </h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "35px 5px", /* 第一个值是行间距，第二个值是列间距 */
                                marginTop: "25px" /* 调整Photo选择区域与Upload区域之间的间距 */
                    }}
                >
                    {photoOptions.map((photo, index) => (
                        <div
                            className={styles.borderHandDrown}
                            key={index}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                // @ts-ignore
                                '--border-width': '2px',
                                '--border-style': 'solid',
                                        '--border-color': selectedImage === photo.imageUrl ? 'blue' : 'transparent',
                                '--border-radius': '15px',
                                padding: "3px",
                            }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleImageClick(photo.imageUrl);
                                    }}
                        >
                            <div
                                style={{
                                    width: "95px",
                                    height: "95px",
                                    marginBottom: "5px",
                                    overflow: "hidden",
                                    borderRadius: "8px",
                                }}
                            >
                                <img
                                    src={photo.imageUrl}
                                    alt={photo.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                            <p style={{ 
                                margin: "0", 
                                fontSize: "16px", 
                                color: "#000",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                textAlign: "center"
                            }}>
                                {photo.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

                {/* Upload 区域 - 调整为占据相当于TextColor中Select Prompt + Describe两个区域的空间 */}
            <div
                className={styles.borderHandDrown}
                style={{
                    // @ts-ignore
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#c8f1c5',
                    '--border-radius': '15px',
                    padding: "20px",
                        // margin: "0px 15px 5px -55px", // 增加右边距从5px到15px
                        flex: "5", // flex: "2" + flex: "3" = flex: "5"，占据两个区域的空间
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#f4f9c7", // 添加填充颜色
                    borderRadius: "15px", // 添加圆角使背景色与边框一致
                        // height: "565px", // 设置固定高度，与Select Photo区域一致
                        // overflow: "hidden", // 隐藏超出部分
                }}
            >
                <h3 style={{ 
                        margin: "30px 0 10px 0",
                    fontSize: "40px",
                        fontFamily: "dk_cool_crayonregular",
                    color: "#786312",
                    textAlign: "center"
                }}>Upload</h3>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                        style={{
                            flex: "1",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            paddingTop: "10px"
                        }}
                    >
                        {/* 上半部分：图片上传框 + Size选项 */}
                        <div style={{display: "flex", gap: "20px", marginBottom: "20px", height: "200px"}}>
                            {/* 左侧：图片上传框 */}
                            <div style={{flex: "0.8", position: "relative", zIndex: 1}}>
                        <div
                            className={styles.borderHandDrown}
                            style={{
                                // @ts-ignore
                                '--border-width': '2px',
                                '--border-style': 'dashed',
                                '--border-color': '#000',
                                '--border-radius': '8px',
                                        width: "340px",
                                        height: "340px",/* 调整upload虚线框的大小*/
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                        position: "relative",
                                        margin: "0 auto",
                            }}
                            onClick={handleCameraClick}
                        >
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                        style={{display: "none"}}
                            />
                            
                            {uploadedImage ? (
                                        <>
                                <img
                                                // @ts-ignore
                                    src={uploadedImage}
                                    alt="uploaded"
                                    style={{
                                                    maxWidth: "300px",
                                                    maxHeight: "300px",
                                                    objectFit: "contain",
                                        borderRadius: "4px",
                                    }}
                                />
                                            <button
                                                onClick={handleDeleteImage}
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
                                                title="删除图片"
                                            >
                                                ×
                                            </button>
                                        </>
                            ) : selectedImage ? (
                                        <>
                                <img
                                                // @ts-ignore
                                    src={selectedImage}
                                    alt="selected"
                                    style={{
                                                    maxWidth: "300px",
                                                    maxHeight: "300px",
                                                    objectFit: "contain",
                                        borderRadius: "4px",
                                    }}
                                />
                                            <button
                                                onClick={handleDeleteImage}
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
                                                title="删除图片"
                                            >
                                                ×
                                            </button>
                                        </>
                            ) : (
                                <img
                                    src={clearImage}
                                    alt="camera"
                                    style={{
                                                width: "150px",
                                                height: "150px",
                                        objectFit: "contain",
                                    }}
                                />
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
                                    width: "340px",
                                    margin: "10px auto 0 auto",
                                    pointerEvents: "none"
                                }}>
                                    <div>No image?</div>
                                    <div>Try one of these:</div>
                                </div>

                                {/* 6张图片一行排列 */}
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                    width: "340px",
                                    margin: "10px auto 0 auto",
                                    position: "relative",
                                    zIndex: 10
                                }}>
                                    {photoOptions.map((photo, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                cursor: "pointer",
                                                transition: "all 0.2s",
                                                border: selectedImage === photo.imageUrl ? "2px solid #1890ff" : "2px solid transparent",
                                                borderRadius: "8px",
                                                padding: "2px",
                                                backgroundColor: selectedImage === photo.imageUrl ? "#e6f7ff" : "transparent",
                                                position: "relative",
                                                zIndex: 11
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleImageClick(photo.imageUrl);
                                            }}
                                        >
                                            <img
                                                src={photo.imageUrl}
                                                alt={photo.title}
                                                style={{
                                                    width: "48px",
                                                    height: "48px",
                                                    objectFit: "contain",
                                                    borderRadius: "6px",
                                                    display: "block",
                                                    pointerEvents: "none"
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 右侧：Size选项 */}
                            <div style={{flex: "1", display: "flex", flexDirection: "column"}}>
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
                                            whiteSpace: "nowrap"
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
                        </div>

                        {/* 底部：Generate按钮 - 在第二张龙猫图片正下方 */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                            marginTop: "190px" /*调整generate按钮上下位移*/
                        }}>
                            {/* 左侧空白区域，对应左侧图片上传框的宽度 */}
                            <div style={{flex: "0.8"}}></div>

                            {/* 右侧区域，对应Size和Style区域 */}
                            <div style={{flex: "1", display: "flex", alignItems: "center", gap: "20px"}}>
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
                                        gap: "8px"
                                    }}>
                            <span style={{ 
                                        fontSize: "18px",
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                        color: "#679fb5",
                                        fontWeight: "bold"
                                    }}>
                                        Remove watermark
                            </span>
                                        <div style={{
                                            fontSize: "12px",
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
                                <div style={{flex: "1", display: "flex", justifyContent: "flex-end"}}>
                        <button
                            type="submit"
                                        className={styles.borderHandDrown}
                            style={{
                                            // @ts-ignore
                                            '--border-width': '3px',
                                            '--border-style': 'solid',
                                            '--border-color': '#679fb5',
                                            '--border-radius': '25px',
                                            fontSize: "26px",
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

            {/* Result 区域 占比 3 */}
            <div
                className={styles.borderHandDrown}
                style={{
                    // @ts-ignore
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#f9ef94',
                    '--border-radius': '15px',
                    padding: "20px",
                        margin: "-10px -55px 5px 15px", // 增加左边距从5px到15px
                    flex: "3",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fbfbca", // 添加填充颜色
                    borderRadius: "15px", // 添加圆角使背景色与边框一致
                    height: "565px", // 设置固定高度，与Select Photo区域一致
                    overflow: "hidden", // 隐藏超出部分
                }}
            >
                <h3 style={{ 
                    margin: "0 0 10px 0", 
                    fontSize: "40px",
                        fontFamily: "dk_cool_crayonregular",
                    color: "#786312",
                    textAlign: "center"
                }}>Result</h3>
                <div
                    className={styles.borderHandDrown}
                    style={{
                        // @ts-ignore
                        '--border-width': '2px',
                        '--border-style': 'dashed',
                        '--border-color': '#000',
                        '--border-radius': '15px',
                        width: "80%",
                            height: "400px", // 固定高度，不再因为生成状态而变化
                        margin: "10px auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                            padding: "1rem", // 增加内边距
                            boxSizing: "border-box" // 确保内边距包含在宽度和高度内
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
                        ) : generatedImage && (uploadedImage || selectedImage) ? (
                            // 使用ImageCompare组件显示原图和生成图的对比
                            <ImageCompare
                                leftImage={uploadedImage || selectedImage || ""}
                                rightImage={generatedImage || ""}
                                leftLabel="Original"
                                rightLabel="Coloring Page"
                            />
                    ) : generatedImage ? (
                        <img
                                    // @ts-ignore
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
                        width: "80%",
                        marginTop: "20px", // 增加与上方虚线框的距离
                        marginBottom: "10px"
                    }}>
                    <button  
                        className={styles.borderHandDrown}
                        onClick={handleDownload}
                        style={{
                            // @ts-ignore
                            '--border-width': '3px',
                            '--border-style': 'solid',
                            '--border-color': '#70c09d',
                            '--border-radius': '20px',
                                fontSize: "14px",
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
                            <div style={{
                                fontSize: "20px",
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
            </div> )}

            {/* 登录模态框 */}
            <SignModal/>

            {/* 积分确认模态框 */}
            <CreditConfirmModal
                open={showCreditConfirmModal}
                onOpenChange={setShowCreditConfirmModal}
                onConfirm={handleConfirmGenerate}
                credits={1}
                leftCredits={userCredits}
            />
        </>
    );
};

export default PhotoColor; 
