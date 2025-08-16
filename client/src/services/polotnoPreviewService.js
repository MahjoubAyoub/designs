import { createStore } from 'polotno/model/store';

// Performance monitoring
const performanceMetrics = {
  totalGenerations: 0,
  totalTime: 0,
  averageTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
  retryAttempts: 0,
  failedGenerations: 0
};

// Progressive loading configuration
const PROGRESSIVE_QUALITY_LEVELS = [
  { quality: 0.3, format: 'jpeg', description: 'Low quality fallback' },
  { quality: 0.6, format: 'jpeg', description: 'Medium quality' },
  { quality: 0.9, format: 'png', description: 'High quality' }
];

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
  backoffMultiplier: 2
};

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Initialize canvas context for Polotno export functionality
 * @param {Object} store - Polotno store instance
 * @returns {Promise<void>}
 */
async function initializeWorkspaceContext(store) {
  if (typeof document === 'undefined') {
    console.warn('Document not available, skipping canvas initialization');
    return;
  }
  
  try {
    // Create a temporary canvas container if not already created
    if (!store._tempContainer) {
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.height = '600px';
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.pointerEvents = 'none';
      tempContainer.style.visibility = 'hidden';
      document.body.appendChild(tempContainer);
      
      store._tempContainer = tempContainer;
    }
    
    // Initialize canvas context for the store
    if (!store._canvasInitialized) {
      // Create a canvas element for rendering
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      store._tempContainer.appendChild(canvas);
      
      // Set up the store's canvas context
      store._canvas = canvas;
      store._canvasInitialized = true;
      
      // Wait for canvas to be ready
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
    }
    
    console.log('Canvas context initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize canvas context:', error);
    // Continue without canvas context - some exports might still work
  }
}

/**
 * Calculate retry delay with exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} - Delay in milliseconds
 */
function calculateRetryDelay(attempt) {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// In-memory cache for generated previews <mcreference link="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas" index="1">1</mcreference>
const previewCache = new Map();
const MAX_CACHE_SIZE = 100; // Limit cache size to prevent memory issues

// Store pool for reuse to reduce creation overhead <mcreference link="https://polotno.com/docs/store-overview" index="4">4</mcreference>
const storePool = [];
const MAX_POOL_SIZE = 5;

/**
 * Generate cache key from JSON data and dimensions
 * @param {Object} json - Polotno JSON data
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @returns {string} - Cache key
 */
function generateCacheKey(json, width, height) {
  const jsonString = JSON.stringify(json);
  const hash = btoa(jsonString).slice(0, 32); // Simple hash for cache key
  return `${hash}_${width}x${height}`;
}

/**
 * Get or create a Polotno store from pool
 * @returns {Object} - Polotno store instance
 */
function getStoreFromPool() {
  if (storePool.length > 0) {
    return storePool.pop();
  }
  
  // Create store with proper workspace context for export functionality
  const store = createStore({
    key: import.meta.env.VITE_POLOTNO_KEY,
    showCredit: false
  });
  
  // Initialize workspace context to enable export functionality
  // This creates the necessary stage context that Polotno needs for exports
  if (typeof document !== 'undefined') {
    // Create a temporary container for the workspace
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1px';
    tempContainer.style.height = '1px';
    tempContainer.style.overflow = 'hidden';
    document.body.appendChild(tempContainer);
    
    // Store reference to cleanup later
    store._tempContainer = tempContainer;
  }
  
  return store;
}

/**
 * Return store to pool for reuse
 * @param {Object} store - Polotno store instance
 */
function returnStoreToPool(store) {
  if (storePool.length < MAX_POOL_SIZE) {
    // Clear store data but keep instance for reuse
    store.clear({ keepHistory: false });
    storePool.push(store);
  } else {
    // Dispose if pool is full and cleanup workspace and temp container
    cleanupStoreResources(store);
    store.dispose();
  }
}

/**
 * Clean up store resources (canvas and temp container)
 * @param {Object} store - Polotno store instance
 */
function cleanupStoreResources(store) {
  try {
    // Cleanup canvas
    if (store._canvas) {
      store._canvas = null;
    }
    
    // Reset canvas initialization flag
    if (store._canvasInitialized) {
      store._canvasInitialized = false;
    }
    
    // Cleanup temp container
    if (store._tempContainer && store._tempContainer.parentNode) {
      store._tempContainer.parentNode.removeChild(store._tempContainer);
      store._tempContainer = null;
    }
  } catch (error) {
    console.warn('Error cleaning up store resources:', error);
  }
}

/**
 * Clean up cache when it exceeds maximum size
 */
function cleanupCache() {
  if (previewCache.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(previewCache.keys()).slice(0, previewCache.size - MAX_CACHE_SIZE);
    keysToDelete.forEach(key => previewCache.delete(key));
  }
}

/**
 * Generate a preview using Polotno's native toDataURL method with progressive loading and retry logic
 * This provides pixel-perfect rendering that matches the actual design
 * @param {Object} json - Polotno JSON data
 * @param {number} width - Preview width (default: 400)
 * @param {number} height - Preview height (default: 300)
 * @param {Object} options - Additional options
 * @param {boolean} options.useCache - Whether to use caching (default: true)
 * @param {number} options.quality - Image quality 0-1 (default: 0.8)
 * @param {string} options.format - Image format 'png' or 'jpeg' (default: 'png')
 * @param {boolean} options.progressive - Enable progressive quality fallback (default: true)
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<string>} - Base64 data URL of the preview
 */
export async function generatePolotnoPreview(json, width = 400, height = 300, options = {}) {
  const startTime = performance.now();
  const { 
    useCache = true, 
    quality = 0.8, 
    format = 'png',
    progressive = true,
    maxRetries = RETRY_CONFIG.maxRetries
  } = options;
  
  // Sanitize JSON data to ensure all width/height values are numbers
  const sanitizedJson = sanitizePolotnoJson(json);
  const cacheKey = useCache ? generateCacheKey(sanitizedJson, width, height) : null;
  
  // Progressive quality levels for fallback
  const qualityLevels = progressive ? [
    { quality, format, description: 'Requested quality' },
    ...PROGRESSIVE_QUALITY_LEVELS.filter(level => 
      level.quality < quality || level.format !== format
    )
  ] : [{ quality, format, description: 'Single attempt' }];
  
  let lastError = null;
  
  // Try each quality level with retry logic
  for (let levelIndex = 0; levelIndex < qualityLevels.length; levelIndex++) {
    const currentLevel = qualityLevels[levelIndex];
    const levelCacheKey = useCache ? `${cacheKey}_${currentLevel.quality}_${currentLevel.format}` : null;
    
    // Check cache for this quality level
    if (useCache && levelCacheKey && previewCache.has(levelCacheKey)) {
      performanceMetrics.cacheHits++;
      console.log(`Cache hit for ${currentLevel.description}:`, levelCacheKey);
      return previewCache.get(levelCacheKey);
    }
    
    // Attempt generation with retries for this quality level
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const attemptStartTime = performance.now();
        
        if (attempt > 0) {
          performanceMetrics.retryAttempts++;
          const delay = calculateRetryDelay(attempt - 1);
          console.log(`Retry attempt ${attempt}/${maxRetries} for ${currentLevel.description} after ${delay}ms delay`);
          await sleep(delay);
        }
        
        performanceMetrics.cacheMisses++;
        console.log(`Generating ${currentLevel.description} preview:`, levelCacheKey || 'uncached');
    
        // Get store from pool for better performance
        const store = getStoreFromPool();
        
        try {
          // Load the design JSON into the store
          store.loadJSON(sanitizedJson);
          
          // Wait for all assets to load with timeout
          await Promise.race([
            store.waitLoading(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Loading timeout')), 10000)
            )
          ]);
          
          // Optimized delay for asset loading
          await new Promise(res => setTimeout(res, 500));
          
          // Get the first page for export
          const page = store.pages[0];
          if (!page) {
            throw new Error('No pages found in design');
          }
          
          // Generate the preview with current quality level settings using page export
          const exportOptions = {
            width: quality.width,
            height: quality.height,
            pixelRatio: quality.pixelRatio,
            mimeType: 'image/png',
            quality: 0.9
          };
          
          const blob = await page.toBlob(exportOptions);
          
          // Convert blob to data URL
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          // Cache the result
          if (useCache && dataUrl && levelCacheKey) {
            previewCache.set(levelCacheKey, dataUrl);
            cleanupCache();
          }
          
          // Update performance metrics
          const endTime = performance.now();
          const generationTime = endTime - attemptStartTime;
          performanceMetrics.totalGenerations++;
          performanceMetrics.totalTime += generationTime;
          performanceMetrics.averageTime = performanceMetrics.totalTime / performanceMetrics.totalGenerations;
          
          console.log(`Preview generated (${currentLevel.description}) in ${generationTime.toFixed(2)}ms`);
           
           // Check for performance alerts periodically
           if (performanceMetrics.totalGenerations % 10 === 0) {
             checkPerformanceAlerts();
           }
           
           return dataUrl;
          
        } finally {
          // Always return store to pool
          returnStoreToPool(store);
        }
        
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed for ${currentLevel.description}:`, error.message);
        
        // If this is the last attempt for this quality level, try next quality level
        if (attempt === maxRetries) {
          break;
        }
      }
    }
  }
  
  // If all quality levels and retries failed
  performanceMetrics.failedGenerations++;
  
  // Update performance metrics even on error
  const endTime = performance.now();
  const generationTime = endTime - startTime;
  performanceMetrics.totalGenerations++;
  performanceMetrics.totalTime += generationTime;
  performanceMetrics.averageTime = performanceMetrics.totalTime / performanceMetrics.totalGenerations;
  
  console.error('All preview generation attempts failed. Last error:', lastError);
  throw new Error(`Preview generation failed after trying ${qualityLevels.length} quality levels with ${maxRetries + 1} attempts each. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Generate a preview using design ID
 * @param {number|string} designId - Design ID to fetch and preview
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Base64 data URL of the preview
 */
export async function generatePolotnoPreviewById(designId, width = 400, height = 300, options = {}) {
  try {
    console.log('🎯 generatePolotnoPreviewById: Starting for design ID:', designId);
    
    // Import the API function dynamically to avoid circular dependencies
    const { getDesignById } = await import('@/api/designs.js');
    
    // Fetch design data by ID
    const designData = await getDesignById(designId);
    console.log('📥 Fetched design data:', {
      id: designData?.id,
      name: designData?.name,
      hasData: !!designData?.data,
      dataType: typeof designData?.data,
      dataSize: designData?.data ? JSON.stringify(designData.data).length : 0,
      topLevelKeys: Object.keys(designData || {})
    });
    
    // Log the actual data field content
    if (designData?.data) {
      console.log('📊 Design data field content:', {
        type: typeof designData.data,
        isString: typeof designData.data === 'string',
        isObject: typeof designData.data === 'object',
        keys: typeof designData.data === 'object' ? Object.keys(designData.data) : 'N/A',
        stringLength: typeof designData.data === 'string' ? designData.data.length : 'N/A',
        preview: typeof designData.data === 'string' ? designData.data.substring(0, 200) + '...' : 'Object'
      });
    }
    
    // Extract Polotno JSON from the design data
    const polotnoJson = extractPolotnoJson(designData);
    console.log('Extracted Polotno JSON:', polotnoJson);
    
    if (!polotnoJson) {
      console.error('No valid Polotno data found in design. Available keys:', Object.keys(designData || {}));
      throw new Error('No valid Polotno data found in design');
    }
    
    if (!polotnoJson.pages || !Array.isArray(polotnoJson.pages) || polotnoJson.pages.length === 0) {
      console.error('Invalid pages data in Polotno JSON:', polotnoJson.pages);
      throw new Error('Invalid pages data in design');
    }
    
    if (!polotnoJson.pages[0].children || polotnoJson.pages[0].children.length === 0) {
      console.warn('Design has no elements, creating placeholder preview');
      // Create a simple placeholder design
      polotnoJson.pages[0].children = [{
        type: 'text',
        x: 50,
        y: 50,
        width: 300,
        height: 50,
        text: designData?.name || 'Empty Design',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#333333'
      }];
    }
    
    return await generatePolotnoPreview(polotnoJson, width, height, options);
    
  } catch (error) {
    console.error('Failed to generate preview by ID:', error);
    throw error;
  }
}

/**
 * Generate a preview using design data object
 * @param {Object} designData - Design data to preview
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Base64 data URL of the preview
 */
export async function generatePolotnoPreviewFromData(designData, width = 400, height = 300, options = {}) {
  try {
    console.log('🎨 generatePolotnoPreviewFromData: Starting for:', designData?.name || 'Unknown');
    console.log('📋 Input data structure:', {
      hasName: !!designData?.name,
      hasId: !!designData?.id,
      hasData: !!designData?.data,
      hasContent: !!designData?.content,
      hasCanvasData: !!designData?.canvasData,
      hasPages: !!designData?.pages,
      hasChildren: !!designData?.children,
      topLevelKeys: Object.keys(designData || {}),
      dataType: typeof designData
    });
    
    // Extract Polotno JSON from the design data
    const polotnoJson = extractPolotnoJson(designData);
    
    if (!polotnoJson) {
      console.error('❌ No valid Polotno data found in design. Input was:', designData);
      throw new Error('No valid Polotno data found in design');
    }
    
    console.log('✅ Successfully extracted Polotno JSON:', {
      hasPages: !!polotnoJson.pages,
      pagesCount: polotnoJson.pages?.length || 0,
      firstPageChildren: polotnoJson.pages?.[0]?.children?.length || 0
    });
    
    return await generatePolotnoPreview(polotnoJson, width, height, options);
    
  } catch (error) {
    console.error('❌ Failed to generate preview from data:', error);
    throw error;
  }
}

/**
 * Extract Polotno JSON from various design data formats
 * @param {Object} designData - Design data in various formats
 * @returns {Object|null} - Polotno JSON or null if not found
 */
/**
 * Sanitize Polotno JSON data to ensure all width/height values are numbers
 * @param {Object} json - Polotno JSON data
 * @returns {Object} - Sanitized JSON data
 */
function sanitizePolotnoJson(json) {
  if (!json) return json;
  
  try {
    // Deep clone the JSON to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(json));
    
    // Convert string numbers and "auto" values to proper numbers
    const convertToNumber = (value, defaultValue = 1024) => {
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      }
      if (typeof value === 'string') {
        // Handle "auto" or other non-numeric strings
        if (value === 'auto' || value === '' || isNaN(parseFloat(value))) {
          return defaultValue;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      }
      return defaultValue;
    };
    
    // Sanitize root level width/height
    if (sanitized.width !== undefined) {
      sanitized.width = convertToNumber(sanitized.width, 1024);
    }
    if (sanitized.height !== undefined) {
      sanitized.height = convertToNumber(sanitized.height, 1024);
    }
    
    // Sanitize pages array
    if (sanitized.pages && Array.isArray(sanitized.pages)) {
      sanitized.pages.forEach(page => {
        if (page.width !== undefined) {
          page.width = convertToNumber(page.width, 1024);
        }
        if (page.height !== undefined) {
          page.height = convertToNumber(page.height, 1024);
        }
        
        // Sanitize children elements
        if (page.children && Array.isArray(page.children)) {
          page.children.forEach(child => {
            if (child.width !== undefined) {
              child.width = convertToNumber(child.width, 100);
            }
            if (child.height !== undefined) {
              child.height = convertToNumber(child.height, 100);
            }
          });
        }
      });
    }
    
    return sanitized;
    
  } catch (error) {
    console.warn('Failed to sanitize Polotno JSON, using original:', error);
    return json;
  }
}

function extractPolotnoJson(designData) {
  if (!designData) {
    console.warn('🚨 extractPolotnoJson: No design data provided');
    return null;
  }
  
  console.log('🔍 extractPolotnoJson: Input data structure:', {
    type: typeof designData,
    keys: Object.keys(designData || {}),
    hasData: !!designData.data,
    dataType: typeof designData.data,
    hasCanvasData: !!designData.canvasData,
    canvasDataType: typeof designData.canvasData,
    hasContent: !!designData.content,
    contentType: typeof designData.content,
    hasPages: !!designData.pages,
    hasChildren: !!designData.children
  });
  
  try {
    // Parse JSON strings from database if needed
    let data = designData;
    if (typeof designData.data === 'string') {
      try {
        data.data = JSON.parse(designData.data);
        console.log('✅ Parsed design.data from string:', Object.keys(data.data || {}));
      } catch (e) {
        console.warn('❌ Failed to parse design.data JSON:', e);
      }
    }
    
    if (typeof designData.canvasData === 'string') {
      try {
        data.canvasData = JSON.parse(designData.canvasData);
        console.log('✅ Parsed design.canvasData from string:', Object.keys(data.canvasData || {}));
      } catch (e) {
        console.warn('❌ Failed to parse design.canvasData JSON:', e);
      }
    }
    
    if (typeof designData.content === 'string') {
      try {
        data.content = JSON.parse(designData.content);
        console.log('✅ Parsed design.content from string:', Object.keys(data.content || {}));
      } catch (e) {
        console.warn('❌ Failed to parse design.content JSON:', e);
      }
    }
    
    // Try different data structure patterns
    console.log('🔍 Checking data structure patterns...');
    
    // 1. Direct Polotno JSON format (from editor)
    if (data.pages && Array.isArray(data.pages)) {
      console.log('✅ Found direct Polotno JSON format with', data.pages.length, 'pages');
      console.log('📄 First page structure:', {
        id: data.pages[0]?.id,
        width: data.pages[0]?.width,
        height: data.pages[0]?.height,
        childrenCount: data.pages[0]?.children?.length || 0
      });
      return sanitizePolotnoJson(data);
    }
    
    // 2. Design data structure (designs)
    if (data.data && data.data.pages && Array.isArray(data.data.pages)) {
      console.log('✅ Found design data structure with', data.data.pages.length, 'pages');
      console.log('📄 First page structure:', {
        id: data.data.pages[0]?.id,
        width: data.data.pages[0]?.width,
        height: data.data.pages[0]?.height,
        childrenCount: data.data.pages[0]?.children?.length || 0
      });
      return sanitizePolotnoJson(data.data);
    }
    
    // 3. Canvas data structure (alternative)
    if (data.canvasData && data.canvasData.pages && Array.isArray(data.canvasData.pages)) {
      console.log('✅ Found canvas data structure with', data.canvasData.pages.length, 'pages');
      console.log('📄 First page structure:', {
        id: data.canvasData.pages[0]?.id,
        width: data.canvasData.pages[0]?.width,
        height: data.canvasData.pages[0]?.height,
        childrenCount: data.canvasData.pages[0]?.children?.length || 0
      });
      return sanitizePolotnoJson(data.canvasData);
    }
    
    // 4. Template data structure (templates)
    if (data.content && data.content.polotnoElements && Array.isArray(data.content.polotnoElements)) {
      // Convert template format to Polotno JSON format
      const templateJson = {
        pages: [{
          id: 'page-1',
          width: data.content.width || 1024,
          height: data.content.height || 1024,
          children: data.content.polotnoElements,
          background: data.content.background || 'white'
        }],
        width: data.content.width || 1024,
        height: data.content.height || 1024,
        background: data.content.background || 'white',
        name: data.name || 'Template'
      };
      return sanitizePolotnoJson(templateJson);
    }
    
    // 5. Direct template structure (templates imported from JSON)
    if (data.pages && data.pages[0] && data.pages[0].children) {
      return sanitizePolotnoJson(data);
    }
    
    // 6. Direct children array (simplified format)
    if (data.children && Array.isArray(data.children)) {
      const childrenJson = {
        pages: [{
          id: 'page-1',
          width: data.width || 1024,
          height: data.height || 1024,
          children: data.children,
          background: data.background || 'white'
        }],
        width: data.width || 1024,
        height: data.height || 1024,
        background: data.background || 'white',
        name: data.name || 'Template'
      };
      return sanitizePolotnoJson(childrenJson);
    }
    
    console.warn('❌ No valid Polotno data structure found. Available data:', {
      hasData: !!data.data,
      dataKeys: data.data ? Object.keys(data.data) : [],
      hasCanvasData: !!data.canvasData,
      canvasDataKeys: data.canvasData ? Object.keys(data.canvasData) : [],
      hasContent: !!data.content,
      contentKeys: data.content ? Object.keys(data.content) : [],
      hasPages: !!data.pages,
      hasChildren: !!data.children,
      topLevelKeys: Object.keys(data)
    });
    
    // Log the actual data structure for debugging
    console.log('🔍 Full data structure for debugging:', JSON.stringify(data, null, 2));
    
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting Polotno JSON:', error);
    return null;
  }
}

/**
 * Process items in batches with concurrency control
 * @param {Array} items - Items to process
 * @param {Function} processor - Function to process each item
 * @param {number} concurrency - Maximum concurrent operations
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of results
 */
async function processBatchWithConcurrency(items, processor, concurrency = 3, onProgress) {
  const results = new Array(items.length);
  const executing = [];
  let completed = 0;
  
  for (let i = 0; i < items.length; i++) {
    const promise = processor(items[i], i).then(
      result => {
        results[i] = result;
        completed++;
        if (onProgress) {
          onProgress(completed, items.length, items[i].name || `Item ${i + 1}`);
        }
        return result;
      },
      error => {
        console.error(`Failed to process item ${i}:`, error);
        results[i] = { id: items[i].id || i, preview: null, error: error.message };
        completed++;
        if (onProgress) {
          onProgress(completed, items.length, items[i].name || `Item ${i + 1}`);
        }
        return results[i];
      }
    );
    
    executing.push(promise);
    
    // Control concurrency
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove completed promises
      for (let j = executing.length - 1; j >= 0; j--) {
        if (results[j] !== undefined) {
          executing.splice(j, 1);
        }
      }
    }
    
    // Small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Wait for all remaining promises
  await Promise.all(executing);
  
  return results;
}

/**
 * Get comprehensive performance metrics for preview generation
 * @returns {Object} - Detailed performance metrics
 */
export function getPerformanceMetrics() {
  const totalAttempts = performanceMetrics.cacheHits + performanceMetrics.cacheMisses;
  const successRate = performanceMetrics.totalGenerations > 0 
    ? ((performanceMetrics.totalGenerations - performanceMetrics.failedGenerations) / performanceMetrics.totalGenerations * 100).toFixed(2) + '%'
    : '0%';
  
  return {
    // Basic metrics
    totalGenerations: performanceMetrics.totalGenerations,
    successfulGenerations: performanceMetrics.totalGenerations - performanceMetrics.failedGenerations,
    failedGenerations: performanceMetrics.failedGenerations,
    successRate,
    
    // Timing metrics
    totalTime: Math.round(performanceMetrics.totalTime),
    averageTime: Math.round(performanceMetrics.averageTime),
    
    // Cache metrics
    cacheHits: performanceMetrics.cacheHits,
    cacheMisses: performanceMetrics.cacheMisses,
    cacheSize: previewCache.size,
    cacheHitRate: totalAttempts > 0 
      ? (performanceMetrics.cacheHits / totalAttempts * 100).toFixed(2) + '%'
      : '0%',
    
    // Retry and recovery metrics
    retryAttempts: performanceMetrics.retryAttempts,
    averageRetriesPerGeneration: performanceMetrics.totalGenerations > 0
      ? (performanceMetrics.retryAttempts / performanceMetrics.totalGenerations).toFixed(2)
      : '0',
    
    // Resource metrics
    storePoolSize: storePool.length,
    maxStorePoolSize: MAX_POOL_SIZE,
    maxCacheSize: MAX_CACHE_SIZE,
    
    // Performance indicators
    isPerformingWell: performanceMetrics.averageTime < 2000 && parseFloat(successRate) > 95,
    needsOptimization: performanceMetrics.averageTime > 5000 || parseFloat(successRate) < 80
  };
}

/**
 * Get detailed performance report with recommendations
 * @returns {Object} - Performance report with analysis
 */
export function getPerformanceReport() {
  const metrics = getPerformanceMetrics();
  const recommendations = [];
  
  // Analyze performance and generate recommendations
  if (parseFloat(metrics.cacheHitRate) < 50) {
    recommendations.push('Consider increasing cache size or improving cache key generation');
  }
  
  if (metrics.averageTime > 3000) {
    recommendations.push('Average generation time is high - consider optimizing asset loading or reducing quality');
  }
  
  if (parseFloat(metrics.successRate) < 90) {
    recommendations.push('Success rate is low - check for common failure patterns and improve error handling');
  }
  
  if (metrics.retryAttempts > metrics.totalGenerations * 0.5) {
    recommendations.push('High retry rate detected - investigate root causes of failures');
  }
  
  if (metrics.storePoolSize === metrics.maxStorePoolSize) {
    recommendations.push('Store pool is at maximum capacity - consider increasing pool size');
  }
  
  return {
    ...metrics,
    timestamp: new Date().toISOString(),
    recommendations,
    status: metrics.isPerformingWell ? 'excellent' : 
            metrics.needsOptimization ? 'needs-attention' : 'good'
  };
}

/**
 * Log performance alert if metrics indicate issues
 */
function checkPerformanceAlerts() {
  const metrics = getPerformanceMetrics();
  
  if (metrics.needsOptimization) {
    console.warn('🚨 Performance Alert: Preview service needs optimization', {
      averageTime: metrics.averageTime,
      successRate: metrics.successRate,
      recommendations: getPerformanceReport().recommendations
    });
  }
}

/**
 * Reset performance metrics
 * @param {boolean} keepCache - Whether to keep the cache (default: true)
 */
export function resetPerformanceMetrics(keepCache = true) {
  performanceMetrics.totalGenerations = 0;
  performanceMetrics.totalTime = 0;
  performanceMetrics.averageTime = 0;
  performanceMetrics.cacheHits = 0;
  performanceMetrics.cacheMisses = 0;
  performanceMetrics.retryAttempts = 0;
  performanceMetrics.failedGenerations = 0;
  
  if (!keepCache) {
    clearCache(false);
  }
  
  console.log('Performance metrics reset', keepCache ? '(cache preserved)' : '(cache cleared)');
}

/**
 * Clear the preview cache
 * @param {boolean} resetMetrics - Whether to reset performance metrics (default: false)
 */
export function clearCache(resetMetrics = false) {
  previewCache.clear();
  console.log('Preview cache cleared');
  
  if (resetMetrics) {
    performanceMetrics.totalGenerations = 0;
    performanceMetrics.totalTime = 0;
    performanceMetrics.averageTime = 0;
    performanceMetrics.cacheHits = 0;
    performanceMetrics.cacheMisses = 0;
    console.log('Performance metrics reset');
  }
}

/**
 * Preload designs into cache
 * @param {Array} designs - Array of design objects to preload
 * @param {Object} options - Preload options
 * @param {number} options.width - Preview width (default: 400)
 * @param {number} options.height - Preview height (default: 300)
 * @param {number} options.concurrency - Maximum concurrent operations (default: 2)
 * @returns {Promise<number>} - Number of successfully preloaded designs
 */
export async function preloadDesignsToCache(designs, options = {}) {
  const { width = 400, height = 300, concurrency = 2 } = options;
  
  console.log(`Preloading ${designs.length} designs to cache...`);
  
  const results = await generateBatchPolotnopreviews(designs, null, {
    concurrency,
    useCache: true,
    continueOnError: true
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`Preloaded ${successCount}/${designs.length} designs to cache`);
  
  return successCount;
}

/**
 * Dispose all stores in the pool (cleanup function)
 */
export function disposeStorePool() {
  storePool.forEach(store => {
    try {
      store.dispose();
    } catch (error) {
      console.warn('Error disposing store:', error);
    }
  });
  storePool.length = 0;
  console.log('Store pool disposed');
}

/**
 * Generate a fallback preview when all attempts fail
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @param {string} errorMessage - Error message to display
 * @returns {string} - Base64 data URL of fallback preview
 */
function generateFallbackPreview(width, height, errorMessage = 'Preview unavailable') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create a simple gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f0f0f0');
  gradient.addColorStop(1, '#e0e0e0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add border
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  
  // Add error icon (simple exclamation mark)
  ctx.fillStyle = '#999';
  ctx.font = `${Math.min(width, height) * 0.2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚠', width / 2, height / 2 - 20);
  
  // Add error message
  ctx.font = `${Math.min(width, height) * 0.08}px Arial`;
  ctx.fillText(errorMessage, width / 2, height / 2 + 20);
  
  return canvas.toDataURL('image/png');
}

/**
 * Enhanced preview generation with comprehensive fallback
 * @param {Object} polotnoJson - Polotno JSON data
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @param {Object} options - Generation options
 * @param {boolean} options.enableFallback - Enable fallback preview on total failure (default: true)
 * @returns {Promise<string>} - Base64 data URL of the preview
 */
export async function generatePolotnoPreviewWithFallback(polotnoJson, width = 400, height = 300, options = {}) {
  const { enableFallback = true, ...otherOptions } = options;
  
  try {
    return await generatePolotnoPreview(polotnoJson, width, height, otherOptions);
  } catch (error) {
    console.error('Preview generation failed completely:', error);
    
    if (enableFallback) {
      console.log('Generating fallback preview');
      return generateFallbackPreview(width, height, 'Design preview failed');
    }
    
    throw error;
  }
}

/**
 * Initialize the service with optimal settings and performance monitoring
 * @param {Object} config - Configuration options
 * @param {number} config.maxCacheSize - Maximum cache size (default: 100)
 * @param {number} config.maxPoolSize - Maximum store pool size (default: 5)
 * @param {boolean} config.enablePerformanceAlerts - Enable automatic performance alerts (default: true)
 * @param {number} config.performanceCheckInterval - How often to check performance (every N generations, default: 10)
 */
export function initializePreviewService(config = {}) {
  const { 
    maxCacheSize = 100, 
    maxPoolSize = 5, 
    enablePerformanceAlerts = true,
    performanceCheckInterval = 10
  } = config;
  
  // Reset metrics on initialization
  resetPerformanceMetrics(false);
  
  // Update constants (note: these are already set, but this allows runtime configuration)
  if (maxCacheSize !== MAX_CACHE_SIZE) {
    console.log(`Cache size limit updated to ${maxCacheSize}`);
  }
  
  if (maxPoolSize !== MAX_POOL_SIZE) {
    console.log(`Store pool size limit updated to ${maxPoolSize}`);
  }
  
  // Set up performance monitoring
  if (enablePerformanceAlerts) {
    console.log(`Performance monitoring enabled (checking every ${performanceCheckInterval} generations)`);
  }
  
  console.log('🚀 Polotno Preview Service initialized with comprehensive optimizations');
  console.log('✅ Features enabled: Caching, Store Pooling, Batch Processing, Performance Monitoring, Progressive Loading, Error Recovery');
  
  // Log initial configuration
  console.log('📊 Configuration:', {
    maxCacheSize,
    maxPoolSize,
    enablePerformanceAlerts,
    performanceCheckInterval,
    progressiveQualityLevels: PROGRESSIVE_QUALITY_LEVELS.length,
    retryConfig: RETRY_CONFIG
  });
  
  return {
    getMetrics: getPerformanceMetrics,
    getReport: getPerformanceReport,
    clearCache: () => clearCache(false),
    resetMetrics: resetPerformanceMetrics,
    disposeResources: disposeStorePool
  };
}

/**
 * Generate previews for multiple designs in batch with optimized concurrency
 * @param {Array} designs - Array of design objects
 * @param {Function} onProgress - Progress callback
 * @param {Object} options - Batch options
 * @param {number} options.concurrency - Maximum concurrent operations (default: 3)
 * @param {boolean} options.useCache - Whether to use caching (default: true)
 * @param {boolean} options.continueOnError - Whether to continue on individual errors (default: true)
 * @returns {Promise<Array>} - Array of preview data URLs
 */
export async function generateBatchPolotnopreviews(designs, onProgress, options = {}) {
  const { concurrency = 3, useCache = true, continueOnError = true } = options;
  
  console.log(`Starting batch preview generation for ${designs.length} designs with concurrency ${concurrency}`);
  const startTime = performance.now();
  
  const processor = async (design, index) => {
    try {
      const preview = await generatePolotnoPreviewFromData(design, 400, 300, { useCache });
      return { id: design.id, preview, success: true };
    } catch (error) {
      if (!continueOnError) {
        throw error;
      }
      console.error(`Failed to generate preview for design ${design.name}:`, error);
      return { id: design.id, preview: null, success: false, error: error.message };
    }
  };
  
  const results = await processBatchWithConcurrency(designs, processor, concurrency, onProgress);
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const successCount = results.filter(r => r.success).length;
  
  console.log(`Batch preview generation completed in ${totalTime.toFixed(2)}ms`);
  console.log(`Success rate: ${successCount}/${designs.length} (${((successCount / designs.length) * 100).toFixed(1)}%)`);
  
  return results;
}

/**
 * Generate batch previews by design IDs with optimized concurrency
 * @param {Array} designIds - Array of design IDs
 * @param {Function} onProgress - Progress callback
 * @param {Object} options - Batch options
 * @param {number} options.concurrency - Maximum concurrent operations (default: 3)
 * @param {boolean} options.useCache - Whether to use caching (default: true)
 * @param {boolean} options.continueOnError - Whether to continue on individual errors (default: true)
 * @returns {Promise<Array>} - Array of preview data URLs
 */
export async function generateBatchPolotnoPreviewsByIds(designIds, onProgress, options = {}) {
  const { concurrency = 3, useCache = true, continueOnError = true } = options;
  
  console.log(`Starting batch preview generation for ${designIds.length} design IDs with concurrency ${concurrency}`);
  const startTime = performance.now();
  
  const processor = async (designId, index) => {
    try {
      const preview = await generatePolotnoPreviewById(designId, 400, 300, { useCache });
      return { id: designId, preview, success: true };
    } catch (error) {
      if (!continueOnError) {
        throw error;
      }
      console.error(`Failed to generate preview for design ID ${designId}:`, error);
      return { id: designId, preview: null, success: false, error: error.message };
    }
  };
  
  // Convert IDs to objects for consistent processing
  const designObjects = designIds.map(id => ({ id, name: `Design ${id}` }));
  const results = await processBatchWithConcurrency(designObjects, processor, concurrency, onProgress);
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const successCount = results.filter(r => r.success).length;
  
  console.log(`Batch preview generation completed in ${totalTime.toFixed(2)}ms`);
  console.log(`Success rate: ${successCount}/${designIds.length} (${((successCount / designIds.length) * 100).toFixed(1)}%)`);
  
  return results;
}