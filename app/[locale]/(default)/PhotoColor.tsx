import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import styles from "./page.module.css";
import { TwitterLogoIcon } from '@radix-ui/react-icons';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

type FormData = {
    size: string;
    age: string[];
    style: string;
};

const PhotoColor: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [selectedSize, setSelectedSize] = useState<string>("Auto");
    const [selectedStyle, setSelectedStyle] = useState<string>("medium");
    const [imageDimensions, setImageDimensions] = useState<{width: number, height: number, imageWidth: number, imageHeight: number} | null>(null);
    const defaultImage = "https://picsum.photos/id/237/100/100";
    const clearImage = "/imgs/custom/photo.png"; // 新的默认图片URL
    
    // 默认示例图片 - 在upload虚线框中显示
    const defaultUploadImage = "/imgs/custom/default-upload-example.png"; // 您需要准备这张图片
    
    // 默认结果图片 - 在result虚线框中显示
    const defaultResultImage = "/imgs/custom/default-result-example.png"; // 您需要准备这张图片
    
    // 初始化时设置默认图片
    React.useEffect(() => {
        setUploadedImage(defaultUploadImage);
        setGeneratedImage(defaultResultImage);
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        if (!selectedStyle) {
            alert("请选择一个Style选项");
            return;
        }

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
                const file = new File([blob], 'uploaded-image.png', { type: 'image/png' });
                formData.append('image', file);
            } else if (selectedImage) {
                // 如果是选中的预设图片，需要先下载然后转换为 File 对象
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                const file = new File([blob], 'selected-image.jpg', { type: 'image/jpeg' });
                formData.append('image', file);
            } else {
                // 使用默认图片
                const response = await fetch(defaultImage);
                const blob = await response.blob();
                const file = new File([blob], 'default-image.jpg', { type: 'image/jpeg' });
                formData.append('image', file);
            }
            
            // 添加style参数（后端会进行映射）
            formData.append('style', selectedStyle);
            
            console.log(`🎯 发送请求到 generate-coloring-book API:`);
            console.log(`📐 Size: ${selectedSize} -> ${apiSize}`);
            console.log(`🎨 Style: ${selectedStyle}`);

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
            } else {
                alert("生成失败：未收到有效的图片数据");
            }
            
        } catch (error: any) {
            console.error("❌ API 请求失败：", error);
            alert(`生成失败: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // 优化：添加图标和比例值
    const sizeOptions = [
        { value: "Auto", label: "Auto", icon: "🔄", ratio: "auto" },
        { value: "1:1", label: "1:1", icon: "🟥", ratio: "1/1" },
        { value: "4:3", label: "4:3", icon: "📸", ratio: "4/3" },
        { value: "3:4", label: "3:4", icon: "🖼️", ratio: "3/4" },
        { value: "16:9", label: "16:9", icon: "🌆", ratio: "16/9" },
        { value: "9:16", label: "9:16", icon: "📱", ratio: "9/16" },
    ];

    const ageOptions = [
        { value: "1-2", label: "Simplified (for kids)" },
        { value: "3-4", label: "Medium detailed (for kids)" },
        { value: "5-8", label: "Detailed (for adults)" },
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
        setUploadedImage(null);
        setSelectedImage(null);
        setImageDimensions(null); // 重置图片尺寸
        
        // 重置文件输入框的值
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // 清除选中的图片
    const handleClear = () => {
        setSelectedImage(null);
        setUploadedImage(null); // 完全清空上传图片，不显示默认图片
        setSelectedSize("Auto"); // 重置尺寸选择为 Auto
        setSelectedStyle("simplified"); // 重置样式选择为 simplified
        setGeneratedImage(null); // 完全清空生成的结果图片
        setImageDimensions(null); // 重置图片尺寸
        
        // 重置文件输入框的值，解决重复上传同一张图片不显示的问题
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // 处理尺寸选择
    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
    };

    // 处理Style选择
    const handleStyleSelect = (style: string) => {
        setSelectedStyle(style);
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

    return (
        <div
            style={{
                display: "flex",
                width: "78vw",
                margin: "0 auto",
            }}
        >
            {/* Select Photo 区域 占比 2 - 暂时隐藏但保留代码 */}
            {false && (
            <div
                style={{
                    // @ts-ignore
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#fae0b3',
                    '--border-radius': '15px',
                    padding: "10px",
                    margin: "-10px 5px 5px -55px", // 调整左边距使左边框与"Coloring Page"的"C"对齐
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
                                '--border-color': selectedImage === photo.imageUrl?'blue':'transparent',
                                '--border-radius': '15px',
                                padding: "3px",
                            }}
                            onClick={() => handleImageClick(photo.imageUrl)}
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
            )}

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
                    margin: "-10px 15px 5px -55px", // 增加右边距从5px到15px
                    flex: "5", // flex: "2" + flex: "3" = flex: "5"，占据两个区域的空间
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#f4f9c7", // 添加填充颜色
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
                }}>Upload</h3>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ flex: "1", display: "flex", flexDirection: "column", height: "100%", paddingTop: "10px" }}
                >
                    {/* 上半部分：图片上传框 + Size选项 */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px", height: "200px" }}>
                        {/* 左侧：图片上传框 */}
                        <div style={{ flex: "0.8", position: "relative", zIndex: 1 }}>
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
                                    style={{ display: "none" }}
                                />
                                
                                {uploadedImage ? (
                                    <>
                                        <img
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
                                            console.log("🎯 点击了图片：", photo.title);
                                            console.log("🖼️ 图片URL：", photo.imageUrl);
                                            setSelectedImage(photo.imageUrl);
                                            setUploadedImage(null);
                                            console.log("✅ 状态已更新");
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
                        <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
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
                            <div style={{ display: "flex", flexDirection: "column" }}>
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
                        marginTop: "190px" /*调整generate按钮上下位移*/
                    }}>
                        {/* 左侧空白区域，对应左侧图片上传框的宽度 */}
                        <div style={{ flex: "0.8" }}></div>
                        
                        {/* 右侧区域，对应Size和Style区域 */}
                        <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
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
                                    padding: "12px 40px",
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
                        height: "650px",
                        margin: "10px auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {isGenerating ? (
                        <div style={{ 
                            color: "#666", 
                            fontSize: "14px",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                        }}>
                            生成中...
                        </div>
                    ) : generatedImage ? (
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
                <div style={{ display: "flex", gap: "5px", marginBottom: "10px", marginTop: "1px", justifyContent: "space-between", width: "80%", margin: "1px auto 10px auto" }}>
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
                    
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "15px" }}>
                        <div style={{ 
                            fontSize: "20px",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                            color: "#786312",
                            textAlign: "center",
                            margin: "0"
                        }}>
                            Share To
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
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
                                <TwitterLogoIcon style={{ color: "white", fontSize: "14px" }} />
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
                                <FaFacebookF style={{ color: "white", fontSize: "14px" }} />
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
                                <FaLinkedinIn style={{ color: "white", fontSize: "14px" }} />
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
                                <FaWhatsapp style={{ color: "white", fontSize: "14px" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoColor; 