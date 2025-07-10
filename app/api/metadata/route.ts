import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const metadataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Add to app/api/metadata/route.ts - Enhanced retry mechanism
async function fetchWithFallbacks(url: string): Promise<Response> {
  const attempts = [
    { url: url.startsWith('http') ? url : `https://${url}`, protocol: 'HTTPS' },
    { url: url.replace('https://', 'http://'), protocol: 'HTTP' },
    { url: `https://${url.replace(/^https?:\/\//, '')}`, protocol: 'HTTPS Alt' }
  ];

  for (const attempt of attempts) {
    try {
      console.log(`Trying ${attempt.protocol} for ${attempt.url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(attempt.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log(`✅ Success with ${attempt.protocol} for ${attempt.url}`);
        return response;
      }
    } catch (error: any) {
      console.log(`❌ ${attempt.protocol} failed for ${attempt.url}:`, error.code || error.message);
      continue;
    }
  }

  throw new Error('All connection attempts failed');
}

// Update app/api/metadata/route.ts - Enhanced debugging for failing sites

// Add this debugging function at the top
async function debugFailingSite(url: string) {
  console.log(`🔍 DEBUGGING FAILING SITE: ${url}`);
  
  const attempts = [
    `https://${url.replace(/^https?:\/\//, '')}`,
    `http://${url.replace(/^https?:\/\//, '')}`,
    `https://www.${url.replace(/^https?:\/\/(www\.)?/, '')}`,
    `http://www.${url.replace(/^https?:\/\/(www\.)?/, '')}`
  ];

  for (const attempt of attempts) {
    try {
      console.log(`  Testing: ${attempt}`);
      const response = await fetch(attempt, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(`  ✅ ${attempt} responded with ${response.status}`);
      return attempt;
    } catch (error: any) {
      console.log(`  ❌ ${attempt} failed: ${error.message}`);
    }
  }
  
  return null;
}

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

  // Special handling for problematic sites
  if (url.includes('amigosdaterrabrasil.org.br') || url.includes('climaesociedade.org')) {
    console.log(`🚨 SPECIAL HANDLING for ${url}`);
    const workingUrl = await debugFailingSite(url);
    if (workingUrl) {
      console.log(`🎯 Found working URL: ${workingUrl}`);
    }
  }

  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(normalizedUrl).hostname;

    let response;
    try {
      response = await fetchWithFallbacks(normalizedUrl);
    } catch (fetchError: any) {
      console.error(`📍 Primary fetch failed for ${url}:`, fetchError.code || fetchError.message);
      
      // Enhanced fallback for specific failing sites
      if (url.includes('climaesociedade.org')) {
        // Try alternative domains/paths for Instituto Clima e Sociedade
        const alternatives = [
          'http://climaesociedade.org',
          'https://climaesociedade.org',
          'http://www.climaesociedade.org',
          'https://instituto.climaesociedade.org'
        ];
        
        for (const alt of alternatives) {
          try {
            console.log(`🔄 Trying alternative for climaesociedade: ${alt}`);
            response = await fetchWithFallbacks(alt);
            if (response.ok) {
              console.log(`✅ Success with alternative: ${alt}`);
              break;
            }
          } catch (altError) {
            console.log(`❌ Alternative failed: ${alt}`);
            continue;
          }
        }
      }
      
      if (!response) {
        throw fetchError;
      }
    }

    if (!response || !response.ok) {
      console.error(`📍 Response not OK for ${url}: ${response?.status}`);
      
      // Return enhanced fallback with Brazilian Portuguese support
      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
      const isBrazilian = domain.includes('.br') || domain.includes('brasil');
      
      return NextResponse.json({
        title: isBrazilian ? 'Organização Climática Brasileira' : domain,
        description: isBrazilian 
          ? 'Organização brasileira trabalhando pela justiça climática e sustentabilidade ambiental'
          : 'Climate organization working for environmental justice',
        image: `https://via.placeholder.com/1200x630/059669/ffffff?text=${encodeURIComponent(domain)}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        url: url,
        domain: domain,
        error: `HTTP ${response?.status || 'connection failed'}`
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

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
        // Use the actual response URL (which might be HTTP after fallback)
        const baseUrl = response.url || normalizedUrl;
        metadata.image = new URL(metadata.image, baseUrl).href;
      } catch {
        metadata.image = null;
      }
    }
    
    if (metadata.favicon && !metadata.favicon.startsWith('http') && !metadata.favicon.startsWith('data:')) {
      try {
        // Use the actual response URL (which might be HTTP after fallback)
        const baseUrl = response.url || normalizedUrl;
        metadata.favicon = new URL(metadata.favicon, baseUrl).href;
      } catch {
        metadata.favicon = null;
      }
    }

    // Convert HTTPS URLs to HTTP if the site only works via HTTP
    if (response.url && response.url.startsWith('http://')) {
      if (metadata.image && metadata.image.startsWith('https://')) {
        // Check if the image domain matches the site domain
        try {
          const imageUrl = new URL(metadata.image);
          const siteUrl = new URL(response.url);
          if (imageUrl.hostname === siteUrl.hostname) {
            metadata.image = metadata.image.replace('https://', 'http://');
          }
        } catch {
          // Keep original URL if parsing fails
        }
      }
      
      if (metadata.favicon && metadata.favicon.startsWith('https://')) {
        try {
          const faviconUrl = new URL(metadata.favicon);
          const siteUrl = new URL(response.url);
          if (faviconUrl.hostname === siteUrl.hostname) {
            metadata.favicon = metadata.favicon.replace('https://', 'http://');
          }
        } catch {
          // Keep original URL if parsing fails
        }
      }
    }

    // If still no favicon, try to fetch common paths using the correct protocol
    if (!metadata.favicon) {
      try {
        const baseUrl = response.url || normalizedUrl;
        const faviconUrl = new URL('/favicon.ico', baseUrl).href;
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

    console.log(`🔍 Metadata for ${url}:`, {
      title: metadata.title,
      hasImage: !!metadata.image,
      imageUrl: metadata.image
        ? metadata.image.substring(0, 100) + (metadata.image.length > 100 ? '...' : '')
        : null,
      hasFavicon: !!metadata.favicon,
      faviconUrl: metadata.favicon
        ? metadata.favicon.substring(0, 100) + (metadata.favicon.length > 100 ? '...' : '')
        : null,
      responseUrl: response.url
    });

    return NextResponse.json(metadata);

  } catch (error: any) {
    console.error(`Error fetching metadata for ${url}:`, error.message);
    
    // Return graceful fallback for TLS errors
    if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID' || 
        error.message?.includes('certificate')) {
      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
      return NextResponse.json({
        title: domain,
        description: 'Climate organization (TLS certificate issue - content not accessible)',
        image: `https://via.placeholder.com/1200x630/dc2626/ffffff?text=TLS+Error`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        error: 'TLS certificate configuration issue on target website'
      });
    }

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