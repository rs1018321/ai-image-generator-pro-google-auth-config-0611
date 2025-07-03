import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.coloring-pages.app';
  const currentDate = new Date();
  const lastModified = new Date('2025-01-15'); // 最近更新日期
  
  // 只支持英文
  const locales = ['en'];
  
  // 静态页面路径（移除custom相关页面）
  const staticPages = [
    '', // 首页
    'pricing',
    'posts',
    'printable',
    'printable/coloring-pages-for-kids',
    'printable/adult-coloring-pages',
    'printable/cute-coloring-pages',
    'printable/christmas-coloring-pages',
    'printable/halloween-coloring-pages',
    'printable/bluey-coloring-pages',
  ];

  // 为每种语言和每个页面生成 sitemap 条目
  const sitemapEntries: MetadataRoute.Sitemap = [];

  locales.forEach(locale => {
    staticPages.forEach(page => {
      const url = page === '' 
        ? `${baseUrl}/${locale}` 
        : `${baseUrl}/${locale}/${page}`;
      
      // 根据页面类型设置不同的优先级和更新频率
      let priority = 0.7;
      let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly';
      
      if (page === '') {
        // 首页
        priority = 1.0;
        changeFrequency = 'weekly';
      } else if (page === 'pricing') {
        priority = 0.9;
        changeFrequency = 'monthly';
      } else if (page.startsWith('printable/')) {
        // 涂色页面
        priority = 0.8;
        changeFrequency = 'weekly';
      } else if (page === 'posts') {
        // 博客页面
        priority = 0.7;
        changeFrequency = 'weekly';
      } else if (page.includes('privacy-policy') || page.includes('terms-of-service')) {
        // 法律页面
        priority = 0.5;
        changeFrequency = 'yearly';
      }

      sitemapEntries.push({
        url,
        lastModified: page === '' ? currentDate : lastModified,
        changeFrequency,
        priority,
      });
    });
  });

  // 添加根路径重定向到英文版本
  sitemapEntries.push({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  return sitemapEntries;
} 