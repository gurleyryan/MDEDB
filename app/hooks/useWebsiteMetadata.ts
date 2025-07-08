import { useState, useEffect } from 'react';
import { OrgWithScore } from '@/models/orgWithScore';

// Website metadata interface
export interface WebsiteMetadata {
  image?: string;
  favicon?: string;
  title?: string;
  description?: string;
}

export function useWebsiteMetadata() {
  const [websiteMetadata, setWebsiteMetadata] = useState<Record<string, WebsiteMetadata>>({});
  const [loadingMetadata, setLoadingMetadata] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});

  // Enhanced function with retry logic
  const getWebsiteMetadata = async (url: string, retryCount = 0): Promise<WebsiteMetadata> => {
    const MAX_RETRIES = 2;
    
    try {
      // Validate URL first
      let validUrl: string;
      try {
        validUrl = url.startsWith('http') ? url : `https://${url}`;
        new URL(validUrl);
      } catch (urlError) {
        console.error('Invalid URL:', url);
        return {
          title: url,
          description: 'Invalid URL format',
          image: `https://via.placeholder.com/1200x630/666666/ffffff?text=Invalid+URL`,
          favicon: 'https://via.placeholder.com/64x64/666666/ffffff?text=?',
        };
      }

      // Call our API route with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // Reset retry count on success
      setRetryAttempts(prev => {
        const newAttempts = { ...prev };
        delete newAttempts[url];
        return newAttempts;
      });
      
      return {
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        favicon: metadata.favicon,
      };
      
    } catch (error) {
      console.error('Error fetching metadata:', error);
      
      // Retry logic
      const currentAttempts = retryAttempts[url] || 0;
      if (retryCount < MAX_RETRIES && currentAttempts < MAX_RETRIES) {
        setRetryAttempts(prev => ({ ...prev, [url]: currentAttempts + 1 }));
        console.log(`Retrying metadata fetch for ${url} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Exponential backoff: wait 1s, then 2s, then 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return getWebsiteMetadata(url, retryCount + 1);
      }
      
      // Return fallback metadata after all retries exhausted
      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
      return {
        title: domain,
        description: 'Climate organization working for environmental justice',
        image: `https://via.placeholder.com/1200x630/059669/ffffff?text=${encodeURIComponent(domain)}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
    }
  };

  // Enhanced batch fetching with progressive loading
  const fetchMetadataForOrgs = async (orgs: OrgWithScore[]) => {
    if (orgs.length === 0) return;

    const orgsWithWebsites = orgs.filter(org => 
      org.website && !websiteMetadata[org.id] && !loadingMetadata[org.id]
    );
    
    if (orgsWithWebsites.length === 0) return;

    // Set loading state for all orgs
    const loadingState = orgsWithWebsites.reduce((acc, org) => {
      acc[org.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setLoadingMetadata(prev => ({ ...prev, ...loadingState }));

    // Process in smaller batches to avoid overwhelming the API
    const BATCH_SIZE = 3;
    const batches = [];
    for (let i = 0; i < orgsWithWebsites.length; i += BATCH_SIZE) {
      batches.push(orgsWithWebsites.slice(i, i + BATCH_SIZE));
    }

    try {
      // Process batches sequentially with delay between batches
      for (const [batchIndex, batch] of batches.entries()) {
        console.log(`Processing metadata batch ${batchIndex + 1}/${batches.length} (${batch.length} orgs)`);
        
        const batchPromises = batch.map(async (org) => {
          try {
            const metadata = await getWebsiteMetadata(org.website!);
            return { id: org.id, metadata, success: true };
          } catch (error) {
            console.error(`Failed to fetch metadata for ${org.org_name}:`, error);
            return { 
              id: org.id, 
              metadata: null, 
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Update metadata as each batch completes
        batchResults.forEach((result, index) => {
          const org = batch[index];
          
          if (result.status === 'fulfilled' && result.value.success && result.value.metadata) {
            setWebsiteMetadata(prev => ({
              ...prev,
              [result.value.id]: result.value.metadata!
            }));
          }
          
          // Clear loading state for this org
          setLoadingMetadata(prev => {
            const newState = { ...prev };
            delete newState[org.id];
            return newState;
          });
        });
        
        // Small delay between batches to be respectful to the API
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error in batch metadata fetching:', err);
      setError('Failed to fetch some website metadata');
      
      // Clear loading state for all orgs in case of error
      const clearedLoadingState = orgsWithWebsites.reduce((acc, org) => {
        acc[org.id] = false;
        return acc;
      }, {} as Record<string, boolean>);
      setLoadingMetadata(prev => ({ ...prev, ...clearedLoadingState }));
    }
  };

  // Fetch metadata for a single organization
  const fetchMetadataForOrg = async (org: OrgWithScore) => {
    if (!org.website) return;

    setLoadingMetadata(prev => ({ ...prev, [org.id]: true }));
    
    try {
      const metadata = await getWebsiteMetadata(org.website);
      
      // Debug log for specific organizations if needed
      if (org.org_name.includes('350 Canada')) {
        console.log('350 Canada metadata:', metadata);
      }
      
      setWebsiteMetadata(prev => ({
        ...prev,
        [org.id]: metadata
      }));
      
      setError(null);
    } catch (err) {
      console.error(`Error fetching metadata for ${org.org_name}:`, err);
      setError(`Failed to fetch metadata for ${org.org_name}`);
    } finally {
      setLoadingMetadata(prev => ({ ...prev, [org.id]: false }));
    }
  };

  // Refresh metadata for a specific organization
  const refreshMetadata = async (org: OrgWithScore) => {
    if (!org.website) return;

    // Clear existing metadata
    setWebsiteMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[org.id];
      return newMetadata;
    });

    // Fetch fresh metadata
    await fetchMetadataForOrg(org);
  };

  // Clear metadata for a specific organization
  const clearMetadata = (orgId: string) => {
    setWebsiteMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[orgId];
      return newMetadata;
    });
    
    setLoadingMetadata(prev => {
      const newLoading = { ...prev };
      delete newLoading[orgId];
      return newLoading;
    });
  };

  // Clear all metadata
  const clearAllMetadata = () => {
    setWebsiteMetadata({});
    setLoadingMetadata({});
  };

  // Get metadata for a specific organization
  const getMetadata = (orgId: string): WebsiteMetadata | undefined => {
    return websiteMetadata[orgId];
  };

  // Check if metadata is loading for a specific organization
  const isLoadingMetadata = (orgId: string): boolean => {
    return loadingMetadata[orgId] || false;
  };

  // Check if metadata exists for a specific organization
  const hasMetadata = (orgId: string): boolean => {
    return !!websiteMetadata[orgId];
  };

  // Get metadata with fallback for missing data
  const getMetadataWithFallback = (orgId: string, orgName: string, website?: string): WebsiteMetadata => {
    const existing = websiteMetadata[orgId];
    
    if (existing) return existing;
    
    // Return fallback metadata
    const domain = website ? website.replace(/^https?:\/\//, '').split('/')[0] : orgName;
    return {
      title: orgName,
      description: 'Climate organization working for environmental justice',
      image: `https://via.placeholder.com/1200x630/059669/ffffff?text=${encodeURIComponent(orgName)}`,
      favicon: website ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : 'https://via.placeholder.com/64x64/666666/ffffff?text=?',
    };
  };

  // Utility to validate if an image URL is a placeholder
  const isPlaceholderImage = (imageUrl?: string): boolean => {
    if (!imageUrl) return true;
    return imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder.com');
  };

  // Utility to validate if a favicon URL is a placeholder
  const isPlaceholderFavicon = (faviconUrl?: string): boolean => {
    if (!faviconUrl) return true;
    return faviconUrl.includes('placeholder') || faviconUrl.includes('via.placeholder.com');
  };

  // Get favicon URL with fallback
  const getFaviconUrl = (orgId: string, website?: string): string => {
    const metadata = websiteMetadata[orgId];
    
    // Use existing favicon if available and not a placeholder
    if (metadata?.favicon && !isPlaceholderFavicon(metadata.favicon)) {
      return metadata.favicon;
    }
    
    // Fallback to Google favicon service
    if (website) {
      try {
        const domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch {
        const domain = website.replace(/^https?:\/\//, '').split('/')[0];
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      }
    }
    
    return 'https://via.placeholder.com/64x64/666666/ffffff?text=?';
  };

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // State
    websiteMetadata,
    loadingMetadata,
    error,
    retryAttempts,
    
    // Actions
    fetchMetadataForOrg,
    fetchMetadataForOrgs,
    refreshMetadata,
    clearMetadata,
    clearAllMetadata,
    
    // Utilities
    getMetadata,
    getMetadataWithFallback,
    getFaviconUrl,
    isLoadingMetadata,
    hasMetadata,
    isPlaceholderImage,
    isPlaceholderFavicon,
    
    // Error handling
    setError,
  };
}

// Hook to automatically fetch metadata when organizations change
export function useAutoWebsiteMetadata(orgs: OrgWithScore[]) {
  const metadataHook = useWebsiteMetadata();
  
  // Auto-fetch metadata when orgs change
  useEffect(() => {
    if (orgs.length > 0) {
      metadataHook.fetchMetadataForOrgs(orgs);
    }
  }, [orgs.length]); // Only trigger when the number of orgs changes
  
  return metadataHook;
}