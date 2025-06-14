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
            
            // 将 Size 比例值映射为 API 期望的像素尺寸
            const sizeMapping: { [key: string]: string } = {
                "Auto": "1024x1024",      // 默认正方形
                "1:1": "1024x1024",       // 正方形 1:1
                "4:3": "1248x832",        // 横版 3:2 (接近4:3)
                "3:4": "832x1248",        // 竖版 2:3 (接近3:4)
                "16:9": "1248x832",       // 横版 3:2 (接近16:9)
                "9:16": "832x1248",       // 竖版 2:3 (接近9:16)
            };
            
            // 将 Style 选择映射为对应的文字 prompt
            const stylePromptMapping: { [key: string]: string } = {
                "simplified": "Few, thick outlines with very simple shapes. Large open areas for easy coloring. No textures or shading lines.",
                "medium": "A moderate number of lines with more varied shapes. Adds light. hatching and simple textures for depth. Still leaves plenty of open space to avoid clutter.", 
                "detailed": "Dense, fine linework with abundant realistic textures and details. Highly realistic style with rich shading and tonal variation. Minimal blank areas, offering a challenging coloring experience"
            };
            
            const apiSize = sizeMapping[selectedSize] || "1024x1024";
            const stylePrompt = stylePromptMapping[selectedStyle] || "";
            
            formData.append('size', apiSize);
            formData.append('style_prompt', stylePrompt);
            
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
            
            // 添加其他参数（可选）
            formData.append('style', selectedStyle);
            
            console.log(`🎯 发送请求到 generate-coloring-book API:`);
            console.log(`📐 Size: ${selectedSize} -> ${apiSize}`);
            console.log(`🎨 Style: ${selectedStyle}`);
            console.log(`📝 Style Prompt: ${stylePrompt}`);

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
        setSelectedImage(imageUrl);
        setUploadedImage(null);
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
            };
            reader.readAsDataURL(file);
        }
    };

    // 新增：触发文件选择
    const handleCameraClick = () => {
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        fileInput?.click();
    };

    // 清除选中的图片
    const handleClear = () => {
        setSelectedImage(null);
        setUploadedImage(null); // 完全清空上传图片，不显示默认图片
        setSelectedSize("Auto"); // 重置尺寸选择为 Auto
        setSelectedStyle("simplified"); // 重置样式选择为 simplified
        setGeneratedImage(null); // 完全清空生成的结果图片
        
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
            {/* Select Photo 区域 占比 2 */}
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
                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                    color: "#f0c46b",
                    lineHeight: "1.1"
                }}>
                    Select<br />Photo
                </h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "15px",
                        marginTop: "3px"
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

            {/* Upload 区域 占比 3 */}
            <div
                className={styles.borderHandDrown}
                style={{
                    // @ts-ignore
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#c8f1c5',
                    '--border-radius': '15px',
                    padding: "20px",
                    margin: "-10px 25px 5px 25px", // 增加左右边距使区域变窄
                    flex: "3",
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
                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                    color: "#786312",
                    textAlign: "center"
                }}>Upload</h3>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                    <div>
                        <div
                            className={styles.borderHandDrown}
                            style={{
                                // @ts-ignore
                                '--border-width': '2px',
                                '--border-style': 'dashed',
                                '--border-color': '#000',
                                '--border-radius': '8px',
                                width: "140px",
                                height: "140px",
                                margin: "10px auto -40px auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                padding: "0", // 确保没有内边距
                                boxSizing: "border-box", // 确保边框不占用额外空间
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
                                <img
                                    src={uploadedImage}
                                    alt="uploaded"
                                    style={{
                                        width: "95%",
                                        height: "95%",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                    }}
                                />
                            ) : selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt="selected"
                                    style={{
                                        width: "95%",
                                        height: "95%",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                    }}
                                />
                            ) : (
                                <img
                                    src={clearImage}
                                    alt="camera"
                                    style={{
                                        width: "90px",
                                        height: "90px",
                                        objectFit: "contain",
                                    }}
                                />
                            )}
                        </div>

                        {/* 优化后的Size选择区域，按比例绘制边框 */}
                        <div style={{ marginBottom: "5px", marginTop: "35px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                            <div style={{ position: "relative", width: "100%", height: "32px" }}>
                                <label style={{ 
                                    fontSize: "18px", 
                                    marginBottom: "2px",
                                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                    backgroundColor: '#f7c863',
                                    borderRadius: '25px',
                                    color: 'white',
                                    padding: '4px 16px',
                                    display: 'inline-block',
                                    height: '32px',
                                    lineHeight: '22px',
                                    alignSelf: 'flex-start',
                                    position: 'absolute',
                                    top: '-30px',
                                    left: 0
                                }}>Size</label>
                            </div>
                            <div
                                style={{
                                    marginTop: "-20px",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    paddingBottom: "4px",
                                    paddingLeft: "50px",
                                    paddingRight: "50px",   /*调整Size选项框的左右间距*/
                                    scrollbarWidth: "none",
                                    flexWrap: "nowrap",
                                    width: "100%",
                                    gap: "8px"
                                }}
                                onWheel={(e) => e.preventDefault()}
                            >
                                {sizeOptions.map((option) => (
                                    <div key={option.value} style={{ 
                                        display: "flex", 
                                        flexDirection: "column", 
                                        alignItems: "center",
                                        flexShrink: 0
                                    }}>
                                        {/* 尺寸选项框，按比例绘制边框 */}
                                        <div
                                            className={styles.borderHandDrown}
                                            onClick={() => handleSizeSelect(option.value)}
                                            style={{
                                                // @ts-ignore
                                                '--border-width': '2px',
                                                '--border-style': 'dashed',
                                                '--border-color': '#000',
                                                '--border-radius': '8px',
                                                width: option.value === "Auto" ? "28px" : 
                                                       option.value === "1:1" ? "28px" :
                                                       option.value === "4:3" ? "37px" :
                                                       option.value === "3:4" ? "28px" :
                                                       option.value === "16:9" ? "43px" :
                                                       option.value === "9:16" ? "26px" : "28px",
                                                height: option.value === "Auto" ? "28px" :
                                                        option.value === "1:1" ? "28px" :
                                                        option.value === "4:3" ? "28px" :
                                                        option.value === "3:4" ? "37px" :
                                                        option.value === "16:9" ? "26px" :
                                                        option.value === "9:16" ? "43px" : "28px",
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
                                                boxSizing: "border-box"
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
                            {errors.size && (
                                <span style={{ 
                                    color: "red", 
                                    fontSize: "12px", 
                                    marginTop: "4px", 
                                    display: "block",
                                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                                }}>
                    Size 是必填项
                  </span>
                            )}
                        </div>

                        <div style={{ marginBottom: "8px", display: "flex", alignItems: "flex-start", gap: "20px" }}>
                            <label style={{
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                fontSize: "18px",
                                marginTop: "-8px",
                                backgroundColor: '#f7c863',
                                borderRadius: '25px',
                                color: 'white',
                                padding: '8px 16px',
                                display: 'inline-block',
                                position: 'relative',
                                top: '5px' // 更改style小框位置。从-10px改为-5px，让Style标签下移5px
                            }}>Style</label>
                        </div>

                        {/* Style选项区域 - 三个龙猫图片 */}
                        <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            gap: "10px", 
                            marginTop: "8px",
                            marginBottom: "15px"
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
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "contain",
                                        marginBottom: "8px"
                                    }}
                                />
                                <div style={{
                                    fontSize: "12px",
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
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "contain",
                                        marginBottom: "8px"
                                    }}
                                />
                                <div style={{
                                    fontSize: "12px",
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
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "contain",
                                        marginBottom: "8px"
                                    }}
                                />
                                <div style={{
                                    fontSize: "12px",
                                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                    textAlign: "center",
                                    lineHeight: "1.2",
                                    color: "#000"
                                }}>
                                    Detailed (for adults)
                                </div>
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
                    </div>

                    <div style={{ display: "flex", gap: "40px", marginTop: "-10px", marginBottom: "0px", marginLeft: "20%" }}>
                        <button
                            type="button"
                            style={{
                                border: "none",
                                fontSize: "22px",
                                backgroundColor: "#d0f4da",
                                color: "#39785d",
                                padding: "8px 25px",
                                fontWeight: "bold",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                borderRadius: "25px"
                            }}
                            onClick={handleClear}
                        >
                            clear
                        </button>
                        <button
                            type="submit"
                            style={{
                                fontSize: "22px",
                                backgroundColor: "#679fb5",
                                color: "#FFF",
                                padding: "0 25px",
                                fontWeight: "bold",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                borderRadius: "25px",
                                border: "none"
                            }}
                        >
                            generate
                        </button>
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
                    margin: "-10px -55px 5px 5px", // 调整右边距使右边框向右延伸
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
                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
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
                            点击Generate后将显示处理效果
                        </div>
                    )}
                </div>
                <div style={{ display: "flex", gap: "5px", marginBottom: "10px", marginTop: "1px", justifyContent: "space-between", width: "80%", margin: "1px auto 10px auto" }}>
                    <button
                        className={styles.borderHandDrown}
                        style={{
                            // @ts-ignore
                            '--border-width': '3px',
                            '--border-style': 'solid',
                            '--border-color': '#f4bb56',
                            '--border-radius': '20px',
                            fontSize: "22px",
                            backgroundColor: "#f4bb56", 
                            color: "#fff", 
                            padding: "12px 18px",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                            borderRadius: "20px",
                            border: "none"
                        }}>
                        Use as Reference
                    </button>
                    <button  
                        className={styles.borderHandDrown}
                        onClick={handleDownload}
                        style={{
                            // @ts-ignore
                            '--border-width': '3px',
                            '--border-style': 'solid',
                            '--border-color': '#70c09d',
                            '--border-radius': '20px',
                            fontSize: "22px",
                            backgroundColor: "#70c09d", 
                            color: "#fff", 
                            padding: "12px 20px",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                            borderRadius: "20px",
                            border: "none",
                            cursor: generatedImage ? "pointer" : "not-allowed",
                            opacity: generatedImage ? 1 : 0.5
                        }}>
                        Download Image
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: "5px", gap: "20px" }}>
                    <div style={{ 
                        fontSize: "28px",
                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                        color: "#786312",
                        textAlign: "center",
                        margin: "0"
                    }}>
                        Share To
                    </div>
                    <div style={{ display: "flex", gap: "15px", justifyContent: "center", alignItems: "center" }}>
                        {/* Twitter Logo */}
                        <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            backgroundColor: "#1DA1F2", 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "transform 0.2s"
                        }}>
                            <TwitterLogoIcon style={{ color: "white", fontSize: "16px" }} />
                        </div>
                        
                        {/* Facebook Logo */}
                        <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            backgroundColor: "#4267B2", 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "transform 0.2s"
                        }}>
                            <FaFacebookF style={{ color: "white", fontSize: "16px" }} />
                        </div>
                        
                        {/* LinkedIn Logo */}
                        <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            backgroundColor: "#0077B5", 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "transform 0.2s"
                        }}>
                            <FaLinkedinIn style={{ color: "white", fontSize: "16px" }} />
                        </div>
                        
                        {/* WhatsApp Logo */}
                        <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            backgroundColor: "#25D366", 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center",
                            cursor: "pointer",
                            transition: "transform 0.2s"
                        }}>
                            <FaWhatsapp style={{ color: "white", fontSize: "16px" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoColor; 