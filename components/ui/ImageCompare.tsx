"use client";
import React, { useState, useRef, useEffect } from "react";

interface ImageCompareProps {
    leftImage: string;
    rightImage: string;
    leftLabel?: string;
    rightLabel?: string;
}

const ImageCompare: React.FC<ImageCompareProps> = ({
                                                       leftImage,
                                                       rightImage,
                                                       leftLabel = "线稿",
                                                       rightLabel = "上色后",
                                                   }) => {
    const [sliderPosition, setSliderPosition] = useState(50); // 初始在中间位置
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // 鼠标按下事件
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDragging.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    // 鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;

        // 计算鼠标在容器内的相对位置百分比
        let position = ((e.clientX - containerRect.left) / containerWidth) * 100;

        // 限制在 0-100% 范围内
        position = Math.max(0, Math.min(100, position));

        setSliderPosition(position);
    };

    // 鼠标释放事件
    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    // 触摸事件支持
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        isDragging.current = true;
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;

        // 获取第一个触摸点
        const touch = e.touches[0];
        let position = ((touch.clientX - containerRect.left) / containerWidth) * 100;

        position = Math.max(0, Math.min(100, position));
        setSliderPosition(position);
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
    };

    // 窗口大小变化时重置位置
    useEffect(() => {
        const handleResize = () => {
            setSliderPosition(50); // 重置到中间位置
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto my-8">


            <div
                ref={containerRef}
                className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg border border-gray-200 shadow-md"
            >
                {/* 左侧图片 */}
                <img
                    src={leftImage}
                    alt="Left"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    }}
                />

                {/* 右侧图片 */}
                <img
                    src={rightImage}
                    alt="Right"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{
                        clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                    }}
                />

                {/* 滑块轨道 */}
                <div
                    style={{
                        transform: `translate(-50%, 0%) translateX(calc(${sliderPosition}%))`,
                        zIndex: 20,
                    }}
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                >
                    {/* 滑块竖线 - 关键修复：移除多余的偏移计算 */}
                    <div
                        className="w-1 h-full bg-[#FFF] shadow-md transition-all duration-150"

                    />

                    {/* 滑块手柄 */}
                    <div
                        ref={sliderRef}
                        className="absolute top-1/2 w-12 h-12 bg-white rounded-full shadow-lg border-2 border-[#91B493] flex items-center justify-center cursor-grab transition-transform duration-150 hover:scale-105 active:scale-95"

                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                    >
                        {/* 双向箭头图标 */}
                        <svg viewBox="0 0 24 24" className="text-[#91B493] transition-all duration-300 w-5 h-5"
                             fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12H3M3 12L9 6M3 12L9 18M21 12L15 6M21 12L15 18"></path>
                        </svg>
                    </div>
                </div>
            </div>

            {/* 标签 - 位置和渐隐效果 */}
            <div className="absolute top-10 left-0 right-0 flex justify-between z-20">
                {/* 左侧标签 - 左上角偏下30px */}
                <div className="ml-4">
          <span
              className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-md text-xl font-medium text-gray-800 shadow-md"
              style={{
                  // 当滑块接近最右侧时，左侧标签透明度降低
                  opacity: sliderPosition > 95 ? 0 : 1,
                  transition: 'opacity 0.3s ease',
              }}
          >
            {leftLabel}
          </span>
                </div>

                {/* 右侧标签 - 右上角偏下30px */}
                <div className="mr-4">
          <span
              className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-md text-xl font-medium text-gray-800 shadow-md"
              style={{
                  // 当滑块接近最左侧时，右侧标签透明度降低
                  opacity: sliderPosition < 5 ? 0 : 1,
                  transition: 'opacity 0.3s ease',
              }}
          >
            {rightLabel}
          </span>
                </div>
            </div>
        </div>
    );
};

export default ImageCompare;
