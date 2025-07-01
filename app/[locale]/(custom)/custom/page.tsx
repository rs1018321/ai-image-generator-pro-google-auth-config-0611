"use client";

import React, { useState } from "react";
import ImageCompare from "@/components/ui/ImageCompare"

import styles from './page.module.css';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion';
import { ChevronDown, ChevronUp,ChevronRight, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// 导入同级目录下的两个组件
import PhotoColor from "./PhotoColor";
import TextColor from "./TextColor";

//左右滑动图片
const leftImage = 'imgs/custom/pic-black.png';
const rightImage = 'imgs/custom/pic-color.png';


// 定义折叠面板数据数组
const accordionData = [
    {
        id: '1',
        title: 'What is Ghibli Any？',
        content: 'Ghibli Any is an AI image generator that creates artwork in the distinctive style of Studio Ghibli films. It uses advanced AI models trained on the aesthetic of Miyazaki\'s works to transform your text descriptions into beautiful Ghibli-style images.'
    },
    {
        id: '2',
        title: 'How accurate is the Ghibli style？',
        content: 'Our AI has been specifically trained to capture the unique artistic elements of Studio Ghibli films, including their distinctive color palettes, lighting, character design, and environmental details. While AI-generated art has its limitations, users consistently praise the authentic Ghibli feel of our images.'
    },
    {
        id: '3',
        title: 'Which Ghibli film styles are available?',
        content: 'We offer styles based on multiple Studio Ghibli films including Spirited Away, My Neighbor Totoro, Howl\'s Moving Castle, Princess Mononoke, Kiki\'s Delivery Service, Castle in the Sky, Ponyo, and more. Each style captures the unique visual elements of its respective film.'
    },
    {
        id: '4',
        title: 'Can I use the generated images commercially?',
        content: 'Yes, with our Creator and Professional plans, you receive a license to use the generated images for commercial purposes. The Free plan is limited to personal, non-commercial use only.'
    },
    {
        id: '5',
        title: 'How many images can I create?',
        content: 'The Free plan includes 3 images. The Creator plan includes 100 images per month. The Professional plan offers unlimited image generation.'
    },
    {
        id: '6',
        title: 'What resolution are the generated images?',
        content: '\n' +
            'The Free plan generates images at 1024×1024 pixels. The Creator plan offers 2048×2048 resolution. The Professional plan provides ultra-high-definition 4096×4096 pixel images, suitable for large prints and professional applications.'
    }
];

// 定义图片卡片数据类型（
interface ImgFeature {
    image: string;
}

// 关键功能数据（6条，每行3列，使用指定图片URL）
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
    icon: string; // 图标URL
    title: string;
    description: string;
}
// 关键功能数据（6条，每行3列）
const keyFeatures: KeyFeature[] = [
    {
        icon: "https://picsum.photos/id/237/64/64",
        title: "Multiple Ghibli Styles",
        description: "Choose from various Ghibli film aesthetics including Spirited Away, Howl's Moving Castle, Princess Mononoke, and more."
    },
    {
        icon: "https://picsum.photos/id/237/64/64",
        title: "High-Resolution Output",
        description: "Generate images up to 4K resolution, perfect for prints, posters, and professional projects."
    },
    {
        icon: "https://picsum.photos/id/237/64/64",
        title: "Style Customization",
        description: "Fine-tune your images with adjustments for color palette, lighting, weather effects, and more."
    },
    {
        icon: "https://picsum.photos/id/237/64/64",
        title: "Batch Generation",
        description: "Create multiple variations of your concept at once to explore different interpretations."
    },
    {
        icon: "https://picsum.photos/id/237/64/64",
        title: "Commercial License",
        description: "Premium plans include commercial usage rights for your generated images."
    },
    {
        icon: "https://picsum.photos/id/237/64/64",
        title: "Prompt Library",
        description: "Access a collection of optimized prompts to help you create the perfect Ghibli-style scenes."
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
        name: "Yuki Tanaka",
        title: "Illustrator & Ghibli Fan",
        rating: 5,
        content: "Ghibli Any captures the essence of Miyazaki's art style perfectly. I use it for concept art and inspiration for my illustrations. The Totoro-style images are especially magical!"
    },
    {
        avatar: "https://picsum.photos/id/64/100/100",
        name: "Emma Wilson",
        title: "Children's Book Author",
        rating: 5,
        content: "I've used these images as inspiration for my children's books. The whimsical Kiki's Delivery Service style is perfect for creating enchanting scenes that captivate young readers."
    },
    {
        avatar: "https://picsum.photos/id/64/100/100",
        name: "Hiroshi Nakamura",
        title: "Game Developer",
        rating: 4,
        content: "The Studio Ghibli style integration in our game prototypes has been seamless. The AI understands the emotional depth and visual storytelling that makes Ghibli films so special."
    },
    {
        avatar: "https://picsum.photos/id/64/100/100",
        name: "Sophie Laurent",
        title: "Graphic Designer",
        rating: 5,
        content: "The color palettes and atmospheric lighting in these AI-generated images are breathtaking. They've become an essential part of my creative workflow."
    },
    {
        avatar: "https://picsum.photos/id/64/100/100",
        name: "David Chen",
        title: "Animator",
        rating: 4,
        content: "As an animator, I appreciate the attention to detail in character design and environmental elements. It's a great tool for pre-visualization and storyboarding."
    },
    {
        avatar: "https://picsum.photos/id/64/100/100",
        name: "Aiko Matsumoto",
        title: "Film Student",
        rating: 5,
        content: "The AI perfectly mimics the dreamlike quality of Studio Ghibli films. I've used it for my thesis project and received numerous compliments on the visuals."
    }
];



export default function CustomPage() {

    // 状态管理
    const [activeComponent, setActiveComponent] = useState<string>("photo");
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipMessage, setTooltipMessage] = useState("");

    // 🎯 Bookmark按钮位置调整变量 - 您可以修改这些数值来调整按钮位置
    const bookmarkPositionTop = 215; // 距离顶部的距离（单位：px）- 调整到与滑动按钮对齐
    const bookmarkPositionRight = 100; // 距离右边的距离（单位：px）- 从50增加到100，向左移动50px
    const bookmarkPositionLeft = 'auto'; // 距离左边的距离，可以是数字或'auto'
    const bookmarkPositionBottom = 'auto'; // 距离底部的距离，可以是数字或'auto'

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
                    alert("Website successfully added to bookmarks!");
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
                    alert("Website successfully added to bookmarks!");
                    return;
                } catch (error) {
                    console.log('IE bookmark method failed');
                }
            }

            // 尝试Firefox的方法
            if (window.sidebar && (window.sidebar as any).addPanel) {
                try {
                    (window.sidebar as any).addPanel(document.title, window.location.href, "");
                    alert("Website successfully added to bookmarks!");
                    return;
                } catch (error) {
                    console.log('Firefox bookmark method failed');
                }
            }

            // 如果所有自动方法都失败，显示指导信息
            alert(message);

        } catch (error) {
            console.error("Failed to add bookmark:", error);
            alert('Please use browser shortcut Ctrl+D (Windows) or Cmd+D (Mac) to add bookmark');
        }
    };


    // 切换活动组件
    const handleComponentChange = (componentId: string) => {
        setActiveComponent(componentId);

    };



    // @ts-ignore
    return (
        <div>
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
            </div>

            {/* 标题 - 绝对定位，独立移动不影响其他元素 */}
            <div style={{
                position: 'absolute',
                top: '80px',
                left: '0',
                width: '100vw',
                textAlign: 'center',
                zIndex: 5
            }}>
                <h1 style={{
                    fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                    color: '#7b6611',
                    margin: '0'
                }} className="text-4xl font-bold text-center">Generate Printable Coloring Pages with AI in Seconds
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
                            fontSize: "22px",
                            color: activeComponent === "photo" ? "white" : "#718096",
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
                        PHOTO TO COLORING PAGE
                    </button>
                    <button
                        onClick={() => handleComponentChange("text")}

                        style={{
                            border: "none",
                            fontFamily: "'Comic Sans MS', 'Marker Felt', cursive",
                            fontSize: "22px",
                            color: activeComponent === "text" ? "white" : "#718096",
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
                        TEXT TO COLORING PAGE
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



            {/* Gallery of Ghibli-Style AI Creations 标题部份 */}
            <div>
                <h3 className={styles.accordionTitle}>Gallery of Ghibli-Style AI Creations</h3>
                <p className={styles.accordionTip}>Explore magical worlds created with Ghibli Any.</p>
            </div>

            <div className={styles.keyFeaturesSection}>
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
                             className={clsx(styles.keyFeatureCard, styles.zoomContainer)}>
                            <div className={styles.featureImageContainer}>
                                <img
                                    src={feature.image}
                                    alt={`Ghibli Style Image ${index + 1}`}
                                    className={styles.featureImage}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>




            {/* Key Features of Coloring-Pages.app 标题部份 */}
            <div style={{ marginTop: '8rem' }}>
                <h3 className={styles.accordionTitle}>Key Features of Coloring-Pages.app</h3>
                <p className={styles.accordionTip}>Everything you need to create coloring page artwork for personal or commercial use.</p>
            </div>

            {/* Key Features 一行三列卡片 */}
            <div className={styles.keyFeaturesSection}>
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
                                <img src={feature.icon} alt={feature.title} className={styles.featureIcon} />
                            </div>
                            <div className={styles.featureContent}>
                                <h4 className={styles.featureTitle}>{feature.title}</h4>
                                <p className={styles.featureDescription}>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



            {/* What Users Say About Coloring-Pages.app 标题部份 */}
            <div>
                <h3 className={styles.accordionTitle}>What Users Say About Coloring-Pages.app</h3>
                <p className={styles.accordionTip}>Hear from artists, fans, and creators who use our Coloring-Pages.app AI generator.</p>
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

                         className={clsx(styles.testimonialCard,styles.zoomContainer)} >
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
                                    {Array.from({ length: 5 }).map((_, i) => (
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
            <div>
                <h3 className={styles.accordionTitle}>Frequently Asked Questions</h3>
                <p className={styles.accordionTip}>Have another question? Contact us on Discord or by email.</p>
            </div>
            {/* FAQ 折叠面板 */}
            {accordionData.map(item => (
            <div className={clsx(styles.accordionContainerWrapper)}>
                <div   style={{
                    // @ts-ignore
                    '--border-width': '5px',
                    '--border-style': 'solid',
                    '--border-color': '#f8e71c',
                    '--border-radius': '8px'
                }} className={clsx(styles.accordionContainer,styles.zoomContainer)}>

                    <Accordion type="single" collapsible>
                        <AccordionItem key={item.id} value={item.id} >
                            <AccordionTrigger className={styles.trigger}>
                                <span>{item.title}</span>
                                {/* 直接使用 data-state 属性判断状态 */}
                                <span className={styles.arrowContainer}>
                  <ChevronDown className={clsx(styles.arrowIcon, styles.openIcon)} />
                  <ChevronRight className={clsx(styles.arrowIcon, styles.closedIcon)} />
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


            {/* 手绘边框滤镜定义 */}
            <svg height="0" xmlns="http://www.w3.org/2000/svg">
                <filter id="hand-drawn">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="turbulence"/>
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" />
                </filter>
            </svg>
            
            </div> {/* 关闭内容容器 */}
        </div>
    );
}
