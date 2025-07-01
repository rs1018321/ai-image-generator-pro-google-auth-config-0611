'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ImageModalProps {
    src: string;
    alt: string;
    className?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, className }) => {
    const openImageInNewWindow = () => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${alt}</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #000;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            overflow: auto;
                        }
                        img {
                            max-width: 100vw;
                            max-height: 100vh;
                            object-fit: contain;
                            display: block;
                        }
                        .close-btn {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            background: rgba(255, 255, 255, 0.8);
                            border: none;
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            font-size: 20px;
                            cursor: pointer;
                            z-index: 1000;
                        }
                        .close-btn:hover {
                            background: rgba(255, 255, 255, 1);
                        }
                    </style>
                </head>
                <body>
                    <button class="close-btn" onclick="window.close()">×</button>
                    <img src="${src}" alt="${alt}" />
                </body>
                </html>
            `);
            newWindow.document.close();
        }
    };

    return (
        <img
            src={src}
            alt={alt}
            className={clsx(className, 'cursor-pointer hover:opacity-80 transition-opacity')}
            onClick={openImageInNewWindow}
        />
    );
};

export default ImageModal; 