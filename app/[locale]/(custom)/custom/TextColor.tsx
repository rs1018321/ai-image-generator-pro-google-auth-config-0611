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
    const defaultImage = "https://picsum.photos/id/1015/300/200";
    const clearImage = "/imgs/custom/photo.png";

    // 设置表单默认值
    const defaultFormValues = {
        size: "Auto",
        age: [],
        pages: [],
        prompt: "Use very minimal, bold outlines with large open spaces and almost no interior texture; suitable for very young children" // 文本框默认值
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FormData>({
        defaultValues: defaultFormValues // 应用默认值
    });

    // 选项与图片的映射关系
    const promptImageMap = {
        "Use very minimal, bold outlines with large open spaces and almost no interior texture; suitable for very young children": "https://picsum.photos/id/1005/300/200",
        "Use simple shapes and primary colors with clear contrast": "https://picsum.photos/id/1015/300/200",
        "Incorporate soft pastels and rounded edges for a gentle aesthetic": "https://picsum.photos/id/1062/300/200"
    };

    const onSubmit: SubmitHandler<FormData> = (data) => {
        axios
            .post("/your-backend-api-url", {
                size: selectedSize,
                age: data.age,
                prompt: data.prompt,
                selectedImage: selectedImage || defaultImage,
            })
            .then((response) => {
                console.log("文字颜色处理请求成功，后端返回：", response.data);
            })
            .catch((error) => {
                console.error("请求失败：", error);
            });
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
            title: "Use very minimal, bold outlines with large open spaces and almost no interior texture; suitable for very young children",
            image: "https://picsum.photos/id/1005/300/200"
        },
        {
            id: 2,
            title: "Use simple shapes and primary colors with clear contrast",
            image: "https://picsum.photos/id/1015/300/200"
        },
        {
            id: 3,
            title: "Incorporate soft pastels and rounded edges for a gentle aesthetic",
            image: "https://picsum.photos/id/1062/300/200"
        }
    ];

    const handleImageClick = (option: { title: string; image: string }) => {
        setSelectedPrompt(option.title);
        setSelectedImage(option.image);
        setValue("prompt", option.title); // 使用setValue更新表单值
    };

    const handleClear = () => {
        setSelectedPrompt("");
        setSelectedImage(clearImage);
        setValue("prompt", ""); // 清空文本框
    };

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size);
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
                    paddingBottom: "150px",
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
                    Select<br />Prompt
                </h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "10px",
                        maxWidth: "300px",
                        margin: "0 auto",
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
                                fontSize: "18px", 
                                color: "#000",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
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
                    paddingBottom: "40px",
                }}
            >
                <h3 style={{ 
                    margin: "0 0 10px 0", 
                    fontSize: "40px",
                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                    color: "#786312",
                    textAlign: "center"
                }}>Describe</h3>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ width: "100%", display: "flex", flexDirection: "column" }}
                >
                    <div
                        className={styles.borderHandDrown}
                        style={{
                            // @ts-ignore
                            '--border-width': '2px',
                            '--border-style': 'dashed',
                            '--border-color': '#000',
                            '--border-radius': '8px',
                            width: "80%",
                            height: "160px",
                            margin: "10px auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                    >
                        <textarea
                            {...register("prompt", { required: true })}
                            style={{
                                width: "100%",
                                height: "100%",
                                padding: "10px",
                                fontSize: "18px",
                                border: "none",
                                outline: "none",
                                resize: "none",
                                backgroundColor: "transparent",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                            }}
                            placeholder="输入描述文字..."
                        />
                    </div>

                    <div style={{ marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                        <label style={{ 
                            fontSize: "18px", 
                            marginBottom: "2px",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                        }}>Size</label>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                gap: "20px",
                                paddingBottom: "4px",
                                scrollbarWidth: "none",
                                width: "100%"
                            }}
                            onWheel={(e) => e.preventDefault()}
                        >
                            {sizeOptions.map((option) => (
                                <div key={option.value} style={{ display: "flex", flexDirection: "column" }}>
                                    <div
                                        className={styles.borderHandDrown}
                                        onClick={() => handleSizeSelect(option.value)}
                                        style={{
                                            // @ts-ignore
                                            '--border-width': '2px',
                                            '--border-style': 'dashed',
                                            '--border-color': '#000',
                                            '--border-radius': '8px',
                                            width: "40px",
                                            minHeight: "40px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            backgroundColor: selectedSize === option.value ? "#e6f7ff" : "transparent",
                                            transition: "all 0.2s",
                                            aspectRatio: option.ratio, // 核心：按比例设置宽高比
                                        }}
                                        data-ratio={option.ratio}
                                    >
                                    </div>
                                    <div style={{ 
                                        fontSize: "20px", 
                                        marginTop: "2px", 
                                        textAlign: "center",
                                        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
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

                    <div style={{ marginBottom: "10px" }}>
                        <label style={{
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                        }}>Age</label>
                        {ageOptions.map((option) => (
                            <label key={option.value} style={{ 
                                marginRight: "10px", 
                                marginLeft: "25px", 
                                fontSize: "28px",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                            }}>
                                <input
                                    className={styles.borderHandDrown}
                                    style={{
                                        border: "none",
                                        // @ts-ignore
                                        '--border-width': '2px',
                                        '--border-style': 'solid',
                                        '--border-color': '#000',
                                        '--border-radius': '0px',

                                    }}
                                    type="checkbox"
                                    {...register("age", { required: true })}
                                    value={option.value}
                                />
                                {option.label}
                            </label>
                        ))}
                        {errors.age && (
                            <span style={{ 
                                color: "red", 
                                fontSize: "12px",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                            }}>Age 是必填项</span>
                        )}
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <label style={{
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                        }}>Pages</label>
                        {pagesOptions.map((option) => (
                            <label key={option.value} style={{ 
                                marginRight: "10px", 
                                marginLeft: "20px", 
                                fontSize: "28px",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                            }}>
                                <input
                                    className={styles.borderHandDrown}
                                    style={{
                                        border: "none",
                                        // @ts-ignore
                                        '--border-width': '2px',
                                        '--border-style': 'solid',
                                        '--border-color': '#000',
                                        '--border-radius': '0px',

                                    }}
                                    type="checkbox"
                                    {...register("pages", { required: true })}
                                    value={option.value}
                                />
                                {option.label}
                            </label>
                        ))}
                        {errors.pages && (
                            <span style={{ 
                                color: "red", 
                                fontSize: "12px",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                            }}>Pages 是必填项</span>
                        )}
                    </div>
                    {errors.prompt && (
                        <span style={{ color: "red", fontSize: "12px", marginLeft: "25px" }}>
                            描述文字是必填项
                        </span>
                    )}
                    <div style={{ display: "flex", gap: "40px", marginTop: "auto", marginLeft: "20%" }}>
                        <button
                            className={styles.borderHandDrown}
                            type="button"
                            style={{
                                border: "none",
                                // @ts-ignore
                                '--border-width': '8px',
                                '--border-style': 'solid',
                                '--border-color': '#D9D9D9',
                                '--border-radius': '0px',
                                fontSize: "22px",
                                backgroundColor: "#D9D9D9",
                                color: "#FFF",
                                padding: "8px 25px",
                                fontWeight: "bold",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                            }}
                            onClick={handleClear}
                        >
                            clear
                        </button>
                        <button
                            className={styles.borderHandDrown}
                            type="submit"
                            style={{
                                // @ts-ignore
                                '--border-width': '8px',
                                '--border-style': 'dashed',
                                '--border-color': '#0070C0',
                                '--border-radius': '8px',
                                fontSize: "22px",
                                backgroundColor: "#0070C0",
                                color: "#FFF",
                                padding: "0 25px",
                                fontWeight: "bold",
                                fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
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
                    paddingBottom: "40px",
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
                        '--border-radius': '5px',
                        width: "80%",
                        height: "180px",
                        margin: "10px auto",
                        display: "flex", justifyContent: "center", alignItems: "center",
                    }}
                >
                    {selectedImage && selectedImage !== clearImage ? (
                        <img
                            src={selectedImage}
                            alt="result"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: "grayscale(100%)",
                            }}
                        />
                    ) : selectedImage === clearImage ? (
                        <div style={{ 
                            color: "#666", 
                            fontSize: "14px",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                        }}>
                            选择提示文字后将显示对应图片
                        </div>
                    ) : (
                        <img
                            src={defaultImage}
                            alt="result"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                filter: "grayscale(100%)",
                            }}
                        />
                    )}
                </div>
                <div style={{ display: "flex", gap: "5px", marginBottom: "10px", marginTop: "60px", marginLeft: "15px" }}>
                    <button
                        className={styles.borderHandDrown}
                        style={{
                            // @ts-ignore
                            '--border-width': '8px',
                            '--border-style': 'dashed',
                            '--border-color': '#000',
                            '--border-radius': '15px',
                            fontSize: "14px", 
                            backgroundColor: "black", 
                            color: "#fff", 
                            padding: "8px 15px",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                        }}>
                        Use as Reference
                    </button>
                    <button  className={styles.borderHandDrown}
                             style={{
                                 // @ts-ignore
                                 '--border-width': '8px',
                                 '--border-style': 'dashed',
                                 '--border-color': '#000',
                                 '--border-radius': '15px',
                                 fontSize: "14px", 
                                 backgroundColor: "black", 
                                 color: "#fff", 
                                 padding: "8px 15px",
                                 fontFamily: "'Comic Sans MS', 'Marker Felt', cursive"
                             }}>
                        Download
                    </button>
                </div>
                <div style={{ display: "flex", flexDirection: "row", paddingTop: "30px", alignItems: "center", marginLeft: "15px" }}>
                    <span style={{ fontSize: "18px", marginBottom: "5px", marginRight: "20px" }}>Share To</span>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <TwitterLogoIcon fontSize={24} />
                        <FaFacebookF size={24} />
                        <FaLinkedinIn size={24} />
                        <FaWhatsapp size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextColor;
