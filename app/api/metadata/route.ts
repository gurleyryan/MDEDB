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
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const domain = new URL(normalizedUrl).hostname;

    // Extract metadata with better fallbacks
    const metadata = {
      title: 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').first().text().trim() ||
        $('h1').first().text().trim() ||
        domain,
      
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        $('meta[property="description"]').attr('content') ||
        'Climate organization working for environmental justice',
      
      image:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[name="twitter:image:src"]').attr('content') ||
        $('meta[property="og:image:url"]').attr('content') ||
        null,
      
      favicon:
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') ||
        $('link[rel="apple-touch-icon-precomposed"]').attr('href') ||
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      
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
        metadata.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      }
    }

    // Fallback image if none found
    if (!metadata.image) {
      metadata.image = `https://via.placeholder.com/1200x630/059669/ffffff?text=${encodeURIComponent(domain)}`;
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
      image: `https://via.placeholder.com/1200x630/059669/ffffff?text=${encodeURIComponent(domain)}`,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      url: url,
      domain: domain,
      error: 'Failed to fetch metadata, using fallbacks'
    });
  }
}