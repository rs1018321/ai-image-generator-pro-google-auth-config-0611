import { clsx } from 'clsx';
import styles from '../page.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Printable Coloring Pages – 1,000+ Free PDF Sheets for Kids & Adults',
  description:
    "Download 1,000+ printable coloring pages in PDF. From kids' animals to intricate mandalas—new designs weekly, always free.",
};

const PrintablePage = () => {
  const imgFeatures = [
    {
      image: '/imgs/gallery/coloring-page-1.png',
    },
    {
      image: '/imgs/gallery/coloring-page-2.png',
    },
    {
      image: '/imgs/gallery/coloring-page-3.png',
    },
    {
      image: '/imgs/gallery/coloring-page-4.png',
    },
    {
      image: '/imgs/gallery/coloring-page-5.png',
    },
    {
      image: '/imgs/gallery/coloring-page-6.png',
    },
  ];

  return (
    <div className={clsx('mt-20', styles.container)}>
      <div>
        <h1 className={styles.accordionTitle}>Printable Coloring Pages Library</h1>
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
              className={clsx(
                styles.keyFeatureContentCard,
                styles.zoomContainer,
                styles.borderHandDrown
              )}
            >
              <div className={styles.featureContentImageContainer}>
                <img
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

export default PrintablePage; 