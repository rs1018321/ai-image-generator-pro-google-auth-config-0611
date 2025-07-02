'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import styles from '../../page.module.css'
import ImageModal from '../../../../../components/ui/ImageModal';

const AdultColoringPagesPage = () => {
    // 假设 imgFeatures 数据在这里定义或从其他地方导入
    const imgFeatures = [
        {
            image: "/imgs/categories/adult/adult-coloring-1.png"
        },
        {
            image: "/imgs/categories/adult/adult-coloring-2.png"
        },
        {
            image: "/imgs/categories/adult/adult-coloring-3.png"
        },
        {
            image: "/imgs/categories/adult/adult-coloring-4.png"
        },
        {
            image: "/imgs/categories/adult/adult-coloring-5.png"
        },
        {
            image: "/imgs/categories/adult/adult-coloring-6.png"
        }

    ];


    return (
        <div className={clsx("mt-20",styles.container) }>
            <div>
                <h3 className={styles.accordionTitle}>Adult Coloring Pages</h3>
            </div>

            <div className={styles.gallerySection}>
                <div className={styles.keyFeaturesContainer}>
                    {imgFeatures.map((feature, index) => (
                        <div
                            key={index}
                            style={{
                                // @ts-ignore
                                '--border-width': '5px',
                                '--border-style': 'solid',
                                '--border-color': '#f8e71c',
                                '--border-radius': '8px',
                            }}
                            className={clsx(styles.keyFeatureContentCard, styles.zoomContainer, styles.borderHandDrown)}
                        >
                            <div className={styles.featureContentImageContainer}>
                                <ImageModal
                                    src={feature.image}
                                    alt={`AI Generated Coloring Page ${index + 1}`}
                                    className={styles.featureContentImage}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdultColoringPagesPage; 