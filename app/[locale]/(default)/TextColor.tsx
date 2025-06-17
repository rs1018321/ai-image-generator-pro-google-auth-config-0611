import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import styles from "./page.module.css";
import { TwitterLogoIcon } from '@radix-ui/react-icons';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

type FormData = {
    size: string;
    age: string[];
    pages: string[];
    prompt: string; // 文本框字段
};

const TextColor: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedPrompt, setSelectedPrompt] = useState<string>(""); // 存储选中的提示文本
    const [selectedSize, setSelectedSize] = useState<string>("Auto");
    const [selectedStyle, setSelectedStyle] = useState<string>("medium"); // 默认选择Medium detailed
    const [isCleared, setIsCleared] = useState<boolean>(false); // 跟踪是否已被清除
    const [generatedImage, setGeneratedImage] = useState<string | null>(null); // 添加生成图片状态
    const [isGenerating, setIsGenerating] = useState<boolean>(false); // 添加生成中状态
    const [promptValue, setPromptValue] = useState<string>(""); // 新增：跟踪文本框内容
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
        formState: { errors },
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
            
            console.log(`🎯 发送请求到 generate-text-to-image API:`);
            console.log(`📝 用户描述: ${data.prompt.trim()}`);
            console.log(`📐 Size: ${selectedSize} -> ${apiSize}`);
            console.log(`🎨 Style: ${selectedStyle}`);

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

    const sizeOptions = [
        { value: "Auto", label: "Auto", ratio: "auto" },
        { value: "1:1", label: "1:1", ratio: "1/1" },
        { value: "4:3", label: "4:3", ratio: "4/3" },
        { value: "3:4", label: "3:4", ratio: "3/4" },
        { value: "16:9", label: "16:9", ratio: "16/9" },
        { value: "9:16", label: "9:16", ratio: "9/16" },
    ];

    const ageOptions = [
        { value: "1-2", label: "1-2" },
        { value: "3-4", label: "3-4" },
        { value: "5-8", label: "5-8" },
    ];
    const pagesOptions = [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "4", label: "4" },
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

    return (
        <div
            style={{
                display: "flex",
                width: "78vw",
                margin: "0 auto",
            }}
        >
            {/* Select Prompt 区域 */}
            <div
                style={{
                    // @ts-ignore
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#fae0b3',
                    '--border-radius': '15px',
                    padding: "10px",
                    margin: "-10px 5px 5px -55px",
                    flex: "2",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fcf6ca",
                    borderRadius: "15px",
                    height: "565px",
                    overflow: "hidden",
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
                    Select Prompt
                </h3>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "0",
                        maxWidth: "300px",
                        margin: "0 auto",
                        height: "calc(100% - 80px)", // 减去标题的高度
                        paddingBottom: "10px" // 给底部留一点空间
                    }}
                >
                    {photoOptions.map((photo, index) => (
                        <div
                            className={styles.borderHandDrown}
                            key={index}
                            style={{
                                // @ts-ignore
                                '--border-width': '2px',
                                '--border-style': selectedPrompt === photo.title? 'solid':'dotted',
                                '--border-color': selectedPrompt === photo.title? 'blue':'#000',
                                '--border-radius': '4px',
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "left",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                                // border: selectedPrompt === photo.title ? "2px solid blue" : "2px dotted #000",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                backgroundColor: selectedPrompt === photo.title ? "#e6f7ff" : "transparent",

                            }}
                            onClick={() => handleImageClick(photo)}
                        >
                            <div style={{ 
                                width: "100%", 
                                fontWeight: "bold",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                            }}>
                                Case {photo.id}:
                            </div>
                            <p style={{ 
                                margin: "0", 
                                fontSize: "14px", 
                                color: "#806a18",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                                textAlign: "justify",
                                lineHeight: "1.4"
                            }}>
                                {photo.title}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Describe 区域 */}
            <div
                className={styles.borderHandDrown}
                style={{
                    // @ts-ignore
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#c8f1c5',
                    '--border-radius': '15px',
                    padding: "20px",
                    margin: "-10px 25px 5px 25px",
                    flex: "3",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#f4f9c7",
                    borderRadius: "15px",
                    height: "565px",
                    overflow: "hidden",
                }}
            >
                <h3 style={{ 
                    margin: "0 0 10px 0", 
                    fontSize: "40px",
                    fontFamily: "dk_cool_crayonregular",
                    color: "#786312",
                    textAlign: "center"
                }}>Describe</h3>
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
                                width: "350px", /* 修改输入框宽度，从400px改为300px */
                                height: "100px",
                                margin: "10px auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                padding: "0",
                                boxSizing: "border-box",
                                position: "relative", // 添加相对定位，为清空按钮做准备
                            }}
                        >
                            <textarea
                                {...register("prompt", { required: true })}
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

                        {/* Size选择区域，与PhotoColor一致 */}
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
                                    paddingRight: "50px",
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
                                top: '5px'
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
                    {errors.prompt && (
                        <span style={{ color: "red", fontSize: "12px", marginLeft: "25px" }}>
                            描述文字是必填项
                        </span>
                    )}
                    <div style={{ display: "flex", gap: "40px", marginTop: "-10px", marginBottom: "0px", marginLeft: "20%" }}>
                        <button
                            type="button"
                            className={styles.borderHandDrown}
                            style={{
                                // @ts-ignore
                                '--border-width': '3px',
                                '--border-style': 'solid',
                                '--border-color': '#d0f4da',
                                '--border-radius': '25px',
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
                            className={styles.borderHandDrown}
                            style={{
                                // @ts-ignore
                                '--border-width': '3px',
                                '--border-style': 'solid',
                                '--border-color': '#679fb5',
                                '--border-radius': '25px',
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

            {/* Result 区域 */}
            <div
                className={styles.borderHandDrown}
                style={{
                    // @ts-ignore
                    '--border-width': '7px',
                    '--border-style': 'solid',
                    '--border-color': '#f9ef94',
                    '--border-radius': '15px',
                    padding: "20px",
                    margin: "-10px -55px 5px 5px",
                    flex: "3",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fbfbca",
                    borderRadius: "15px",
                    height: "565px",
                    overflow: "hidden",
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
                        display: "flex", justifyContent: "center", alignItems: "center",
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

export default TextColor;