import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const metadataCache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.log(`❌ ${attempt.protocol} failed for ${attempt.url}:`, err.code || err.message);
      continue;
    }
  }

  throw new Error('All connection attempts failed');
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

  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(normalizedUrl).hostname;

    let response: Response | undefined;
    try {
      response = await fetchWithFallbacks(normalizedUrl);
    } catch (fetchError) {
      const err = fetchError as { code?: string; message?: string };
      console.error(`📍 Primary fetch failed for ${url}:`, err.code || err.message);
      if (!response) {
        throw fetchError;
      }
    }

    if (!response || !response.ok) {
      console.error(`📍 Response not OK for ${url}: ${response?.status}`);
      const fallbackDomain = url.replace(/^https?:\/\//, '').split('/')[0];
      const isBrazilian = fallbackDomain.includes('.br') || fallbackDomain.includes('brasil');
      
      return NextResponse.json({
        title: isBrazilian ? 'Organização Climática Brasileira' : fallbackDomain,
        description: isBrazilian 
          ? 'Organização brasileira trabalhando pela justiça climática e sustentabilidade ambiental'
          : 'Climate organization working for environmental justice',
        image: `https://via.placeholder.com/1200x630/059669/ffffff?text=${encodeURIComponent(fallbackDomain)}`,
        favicon: `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=64`,
        url: url,
        domain: fallbackDomain,
        error: `HTTP ${response?.status || 'connection failed'}`
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getNonEmpty = (value: string | undefined): string | null => {
      if (!value || value.trim() === '') return null;
      const placeholderPatterns = [
        'data:image/gif',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA',
        'R0lGODlhAQABAIAAAAAAAP',
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

    const findBestImage = (): string | null => {
      const metaImage = 
        getNonEmpty($('meta[property="og:image"]').attr('content')) ||
        getNonEmpty($('meta[name="twitter:image"]').attr('content')) ||
        getNonEmpty($('meta[name="twitter:image:src"]').attr('content')) ||
        getNonEmpty($('meta[property="og:image:url"]').attr('content'));
      const isMetaImageLogo = metaImage && (
        metaImage.includes('icon') || 
        metaImage.includes('logo') || 
        metaImage.includes('favicon') || 
        metaImage.includes('thumb') ||
        metaImage.includes('thumbnail') ||
        metaImage.includes('hammerschlegel') ||
        metaImage.match(/CCH_Thumbnail|Logo-|brand/i)
      );
      if (metaImage && !isMetaImageLogo) {
        return metaImage;
      }
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
        '.wp-post-image',
        '.attachment-post-thumbnail',
        '.carousel-item img',
        '.slide img',
        '.main-image',
        '.featured-image'
      ];
      for (const selector of heroSelectors) {
        const $img = $(selector).first();
        const image = getNonEmpty($img.attr('data-src')) ||
                     getNonEmpty($img.attr('data-lazy-src')) ||
                     getNonEmpty($img.attr('data-original')) ||
                     getNonEmpty($img.attr('data-bg')) ||
                     getNonEmpty($img.attr('src'));
        if (image) return image;
      }
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
      const allImages = $('img').toArray();
      const validImages: Array<{
        src: string;
        score: number;
        width: number;
        height: number;
        alt: string;
        className: string;
      }> = [];
      for (const img of allImages) {
        const $img = $(img);
        const src = $img.attr('src');
        const dataSrc = $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('data-original');
        const alt = $img.attr('alt')?.toLowerCase() || '';
        const className = $img.attr('class')?.toLowerCase() || '';
        if (alt.includes('logo') || alt.includes('icon') || alt.includes('favicon')) continue;
        if (className.includes('logo') || className.includes('icon') || className.includes('navbar-brand')) continue;
        const actualSrc = getNonEmpty(dataSrc) || getNonEmpty(src);
        if (actualSrc) {
          if (actualSrc.includes('icon') || actualSrc.includes('logo') || 
              actualSrc.includes('favicon') || actualSrc.includes('hammerschlegel') ||
              actualSrc.includes('busca') || actualSrc.includes('thumbnail') ||
              actualSrc.match(/CCH_Thumbnail|Logo-|brand/i)) continue;
          const width = parseInt($img.attr('width') || '0');
          const height = parseInt($img.attr('height') || '0');
          let score = 0;
          if (width > 1200 && height > 600) score += 20;
          else if (width > 800 && height > 400) score += 15;
          else if (width > 400 && height > 200) score += 10;
          else if (width > 200 && height > 100) score += 5;
          else if (width === 0 && height === 0) score += 2;
          if (actualSrc.includes('upload') || actualSrc.includes('wp-content')) score += 8;
          if (actualSrc.includes('media') || actualSrc.includes('assets') || actualSrc.includes('images')) score += 5;
          if (actualSrc.includes('carousel') || actualSrc.includes('hero') || actualSrc.includes('banner')) score += 6;
          if (actualSrc.includes('featured') || actualSrc.includes('header') || actualSrc.includes('cover')) score += 4;
          if (actualSrc.includes('features/original')) score += 6;
          if (actualSrc.match(/\.(jpg|jpeg)$/i)) score += 5;
          if (actualSrc.match(/\.(png|webp)$/i)) score += 3;
          if (alt && alt.length > 10 && !alt.includes('image') && !alt.includes('photo')) score += 3;
          if (className.includes('carousel') || className.includes('slide')) score += 4;
          if (className.includes('d-block w-100')) score += 4;
          if (actualSrc.includes('sprite') || actualSrc.includes('thumb') || 
              actualSrc.includes('small') || actualSrc.match(/-\d{2,3}x\d{2,3}\./)) score -= 3;
          if (actualSrc.match(/-\d{4,}x\d{3,}\.|_\d{4,}x\d{3,}\./)) score += 5;
          validImages.push({ src: actualSrc, score, width, height, alt, className });
        }
      }
      validImages.sort((a, b) => b.score - a.score);
      if (validImages.length > 0 && validImages[0].score > 12) {
        return validImages[0].src;
      }
      return validImages.length > 0 ? validImages[0].src : metaImage;
    };

    const metadata: Record<string, unknown> = {
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

    if (metadata.image && typeof metadata.image === 'string' && !metadata.image.startsWith('http')) {
      try {
        const baseUrl = response.url || normalizedUrl;
        metadata.image = new URL(metadata.image, baseUrl).href;
      } catch {
        metadata.image = null;
      }
    }
    if (metadata.favicon && typeof metadata.favicon === 'string' && !metadata.favicon.startsWith('http') && !metadata.favicon.startsWith('data:')) {
      try {
        const baseUrl = response.url || normalizedUrl;
        metadata.favicon = new URL(metadata.favicon, baseUrl).href;
      } catch {
        metadata.favicon = null;
      }
    }
    if (response.url && response.url.startsWith('http://')) {
      if (metadata.image && typeof metadata.image === 'string' && metadata.image.startsWith('https://')) {
        try {
          const imageUrl = new URL(metadata.image);
          const siteUrl = new URL(response.url);
          if (imageUrl.hostname === siteUrl.hostname) {
            metadata.image = metadata.image.replace('https://', 'http://');
          }
        } catch {
          // ignore error
        }
      }
      if (metadata.favicon && typeof metadata.favicon === 'string' && metadata.favicon.startsWith('https://')) {
        try {
          const faviconUrl = new URL(metadata.favicon);
          const siteUrl = new URL(response.url);
          if (faviconUrl.hostname === siteUrl.hostname) {
            metadata.favicon = metadata.favicon.replace('https://', 'http://');
          }
        } catch {
          // ignore error
        }
      }
    }
    if (!metadata.favicon) {
      try {
        const baseUrl = response.url || normalizedUrl;
        const faviconUrl = new URL('/favicon.ico', baseUrl).href;
        const faviconResponse = await fetch(faviconUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        });
        if (faviconResponse.ok) {
          metadata.favicon = faviconUrl;
        }
      } catch {
        // ignore error
      }
    }
    metadataCache.set(url, { data: metadata, timestamp: Date.now() });

    console.log(`🔍 Metadata for ${url}:`, {
      title: metadata.title,
      hasImage: !!metadata.image,
      imageUrl: typeof metadata.image === 'string'
        ? metadata.image.substring(0, 100) + (metadata.image.length > 100 ? '...' : '')
        : null,
      hasFavicon: !!metadata.favicon,
      faviconUrl: typeof metadata.favicon === 'string'
        ? metadata.favicon.substring(0, 100) + (metadata.favicon.length > 100 ? '...' : '')
        : null,
      responseUrl: response.url
    });

    return NextResponse.json(metadata);

  } catch (error) {
    const err = error as { code?: string; message?: string };
    console.error(`Error fetching metadata for ${url}:`, err.message);
    if (err.code === 'ERR_TLS_CERT_ALTNAME_INVALID' || 
        err.message?.includes('certificate')) {
      const fallbackDomain = url.replace(/^https?:\/\//, '').split('/')[0];
      return NextResponse.json({
        title: fallbackDomain,
        description: 'Climate organization (TLS certificate issue - content not accessible)',
        image: `https://via.placeholder.com/1200x630/dc2626/ffffff?text=TLS+Error`,
        favicon: `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=64`,
        error: 'TLS certificate configuration issue on target website'
      });
    }
    const fallbackDomain = (() => {
      try {
        return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      } catch {
        return url.replace(/^https?:\/\//, '').split('/')[0];
      }
    })();
    return NextResponse.json({
      title: fallbackDomain,
      description: 'Climate organization working for environmental justice',
      image: null,
      favicon: null,
      url: url,
      domain: fallbackDomain,
      error: 'Failed to fetch metadata, using fallbacks'
    });
  }
}