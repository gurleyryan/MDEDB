import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const metadataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Check cache first
  const cached = metadataCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    // Validate and normalize the URL
    let normalizedUrl: string;
    try {
      normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(normalizedUrl); // Validate URL format
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the webpage with better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Don't log 403 errors as they're expected for sites that block scrapers
      if (response.status !== 403) {
        console.error(`HTTP ${response.status} for ${url}`);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const domain = new URL(normalizedUrl).hostname;

    // Helper function to get non-empty attribute value and filter out placeholders
    const getNonEmpty = (value: string | undefined): string | null => {
      if (!value || value.trim() === '') return null;
      
      // Filter out various placeholder patterns
      const placeholderPatterns = [
        'data:image/gif',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA', // Common tiny placeholder
        'R0lGODlhAQABAIAAAAAAAP', // 1x1 gif placeholder
        'placeholder',
        'loading.gif',
        'spinner'
      ];
      
      const trimmed = value.trim();
      for (const pattern of placeholderPatterns) {
        if (trimmed.includes(pattern)) return null;
      }
      
      return trimmed;
    };

    // Enhanced image search that handles lazy loading and various patterns
    const findBestImage = (): string | null => {
      // First try meta tags, but validate they're not just icons
      let metaImage = 
        getNonEmpty($('meta[property="og:image"]').attr('content')) ||
        getNonEmpty($('meta[name="twitter:image"]').attr('content')) ||
        getNonEmpty($('meta[name="twitter:image:src"]').attr('content')) ||
        getNonEmpty($('meta[property="og:image:url"]').attr('content'));
      
      // Check if meta image looks like an icon/logo/thumbnail and skip if so
      const isMetaImageLogo = metaImage && (
        metaImage.includes('icon') || 
        metaImage.includes('logo') || 
        metaImage.includes('favicon') || 
        metaImage.includes('thumb') ||
        metaImage.includes('thumbnail') ||
        metaImage.includes('hammerschlegel') || // Specific fix for Ende Gelände
        metaImage.match(/CCH_Thumbnail|Logo-|brand/i) // Specific patterns for logos/thumbnails
      );
      
      // If meta image doesn't look like a logo, use it
      if (metaImage && !isMetaImageLogo) {
        return metaImage;
      }

      // Look for hero/banner images with actual sources (not lazy placeholders)
      const heroSelectors = [
        'img[class*="hero"]',
        'img[class*="banner"]', 
        'img[class*="featured"]',
        'img[class*="header"]',
        'img[class*="cover"]',
        'img[class*="background"]',
        'img[id*="hero"]',
        'img[id*="banner"]',
        '.hero img',
        '.banner img',
        '.header img',
        '.cover img',
        '.featured img',
        '#hero img',
        '#banner img',
        '.wp-post-image', // WordPress featured images
        '.attachment-post-thumbnail', // WordPress thumbnails
        '.carousel-item img', // Bootstrap carousels
        '.slide img', // General slides
        '.main-image', // Common class name
        '.featured-image' // Another common class
      ];

      for (const selector of heroSelectors) {
        const $img = $(selector).first();
        // Check both src and data-src for lazy loading
        const image = getNonEmpty($img.attr('data-src')) || // Prefer data-src for lazy loading
                     getNonEmpty($img.attr('data-lazy-src')) ||
                     getNonEmpty($img.attr('data-original')) ||
                     getNonEmpty($img.attr('data-bg')) ||
                     getNonEmpty($img.attr('src'));
        if (image) return image;
      }

      // Look for images in common WordPress/CMS patterns
      const wordpressSelectors = [
        '.wp-block-cover img',
        '.wp-block-image img',
        '.elementor-background-image',
        '.fusion-background-image'
      ];

      for (const selector of wordpressSelectors) {
        const $img = $(selector).first();
        const image = getNonEmpty($img.attr('data-src')) || getNonEmpty($img.attr('src'));
        if (image) return image;
      }

      // Look for any large, non-lazy images with improved scoring
      const allImages = $('img').toArray();
      const validImages = [];
      
      for (const img of allImages) {
        const $img = $(img);
        const src = $img.attr('src');
        const dataSrc = $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('data-original');
        const alt = $img.attr('alt')?.toLowerCase() || '';
        const className = $img.attr('class')?.toLowerCase() || '';
        
        // Skip logos/icons based on alt text, class, and URL patterns
        if (alt.includes('logo') || alt.includes('icon') || alt.includes('favicon')) continue;
        if (className.includes('logo') || className.includes('icon') || className.includes('navbar-brand')) continue;
        
        // Prefer data-src for lazy loaded images, fallback to src
        const actualSrc = getNonEmpty(dataSrc) || getNonEmpty(src);
        if (actualSrc) {
          // Skip if URL suggests it's an icon, logo, or thumbnail
          if (actualSrc.includes('icon') || actualSrc.includes('logo') || 
              actualSrc.includes('favicon') || actualSrc.includes('hammerschlegel') ||
              actualSrc.includes('busca') || actualSrc.includes('thumbnail') ||
              actualSrc.match(/CCH_Thumbnail|Logo-|brand/i)) continue;
          
          const width = parseInt($img.attr('width') || '0');
          const height = parseInt($img.attr('height') || '0');
          
          // Priority scoring for images
          let score = 0;
          
          // Size bonus (more generous for larger images)
          if (width > 1200 && height > 600) score += 20;
          else if (width > 800 && height > 400) score += 15;
          else if (width > 400 && height > 200) score += 10;
          else if (width > 200 && height > 100) score += 5;
          else if (width === 0 && height === 0) score += 2; // Unknown size, give small bonus
          
          // URL pattern bonus - prefer actual content images
          if (actualSrc.includes('upload') || actualSrc.includes('wp-content')) score += 8;
          if (actualSrc.includes('media') || actualSrc.includes('assets') || actualSrc.includes('images')) score += 5;
          if (actualSrc.includes('carousel') || actualSrc.includes('hero') || actualSrc.includes('banner')) score += 6;
          if (actualSrc.includes('featured') || actualSrc.includes('header') || actualSrc.includes('cover')) score += 4;
          if (actualSrc.includes('features/original')) score += 6; // NationBuilder feature images
          
          // Photo format bonus - prefer photos over graphics
          if (actualSrc.match(/\.(jpg|jpeg)$/i)) score += 5; // Photos get higher score
          if (actualSrc.match(/\.(png|webp)$/i)) score += 3; // PNG/WebP get moderate score
          
          // Alt text bonus - but not for generic descriptions
          if (alt && alt.length > 10 && !alt.includes('image') && !alt.includes('photo')) score += 3;
          
          // Carousel/slider images typically good for banners
          if (className.includes('carousel') || className.includes('slide')) score += 4;
          if (className.includes('d-block w-100')) score += 4; // Bootstrap carousel images
          
          // Penalty for tiny images or graphics that might be decorative
          if (actualSrc.includes('sprite') || actualSrc.includes('thumb') || 
              actualSrc.includes('small') || actualSrc.match(/-\d{2,3}x\d{2,3}\./)) score -= 3;
          
          // Bonus for larger file dimensions in filename
          if (actualSrc.match(/-\d{4,}x\d{3,}\.|_\d{4,}x\d{3,}\./)) score += 5;
          
          validImages.push({ src: actualSrc, score, width, height, alt, className });
        }
      }
      
      // Sort by score and return the best image
      validImages.sort((a, b) => b.score - a.score);
      
      // If we have valid images with good scores, prefer them over a logo-ish meta image
      if (validImages.length > 0 && validImages[0].score > 12) {
        return validImages[0].src;
      }
      
      // Otherwise, fall back to meta image (even if it's a logo) or best valid image
      return validImages.length > 0 ? validImages[0].src : metaImage;
    };

    // Enhanced metadata extraction
    const metadata = {
      title: 
        getNonEmpty($('meta[property="og:title"]').attr('content')) ||
        getNonEmpty($('meta[name="twitter:title"]').attr('content')) ||
        getNonEmpty($('title').first().text()) ||
        getNonEmpty($('h1').first().text()) ||
        domain,
      
      description:
        getNonEmpty($('meta[property="og:description"]').attr('content')) ||
        getNonEmpty($('meta[name="twitter:description"]').attr('content')) ||
        getNonEmpty($('meta[name="description"]').attr('content')) ||
        getNonEmpty($('meta[property="description"]').attr('content')) ||
        'Climate organization working for environmental justice',
      
      image: findBestImage(),
      
      // Enhanced favicon search with empty string filtering
      favicon: (() => {
        const faviconSelectors = [
          'link[rel="icon"][type="image/svg+xml"]',
          'link[rel="icon"][sizes="32x32"]',
          'link[rel="icon"][sizes="16x16"]',
          'link[rel="icon"]',
          'link[rel="shortcut icon"]',
          'link[rel="apple-touch-icon"]',
          'link[rel="apple-touch-icon-precomposed"]',
          'link[rel="mask-icon"]'
        ];

        for (const selector of faviconSelectors) {
          const href = getNonEmpty($(selector).attr('href'));
          if (href) return href;
        }

        return null;
      })(),
      
      url: normalizedUrl,
      domain: domain
    };

    // Resolve relative URLs to absolute URLs
    if (metadata.image && !metadata.image.startsWith('http')) {
      try {
        metadata.image = new URL(metadata.image, normalizedUrl).href;
      } catch {
        metadata.image = null;
      }
    }
    
    if (metadata.favicon && !metadata.favicon.startsWith('http') && !metadata.favicon.startsWith('data:')) {
      try {
        metadata.favicon = new URL(metadata.favicon, normalizedUrl).href;
      } catch {
        metadata.favicon = null;
      }
    }

    // If still no favicon, try to fetch common paths
    if (!metadata.favicon) {
      try {
        const faviconUrl = new URL('/favicon.ico', normalizedUrl).href;
        const faviconResponse = await fetch(faviconUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(3000) // 3 second timeout for favicon check
        });
        if (faviconResponse.ok) {
          metadata.favicon = faviconUrl;
        }
      } catch {
        // Favicon not found at common path
      }
    }

    // Cache successful results
    metadataCache.set(url, { data: metadata, timestamp: Date.now() });

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Error fetching metadata for', url, ':', error);
    
    // Return comprehensive fallback metadata
    const domain = (() => {
      try {
        return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      } catch {
        return url.replace(/^https?:\/\//, '').split('/')[0];
      }
    })();

    return NextResponse.json({
      title: domain,
      description: 'Climate organization working for environmental justice',
      image: null,
      favicon: null,
      url: url,
      domain: domain,
      error: 'Failed to fetch metadata, using fallbacks'
    });
  }
}