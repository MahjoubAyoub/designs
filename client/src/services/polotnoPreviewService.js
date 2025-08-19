import { createStore } from 'polotno/model/store';
import { svgToURL } from 'polotno/utils/svg';

// Fallback SVG generation function
function escapeXml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function jsonToSVG(json) {
  if (!json || !json.pages || !Array.isArray(json.pages) || json.pages.length === 0) {
    throw new Error('Invalid JSON structure: missing or empty pages array');
  }

  const page = json.pages[0];
  const width = (json.width || page.width || 595).toFixed(0);
  const height = (json.height || page.height || 842).toFixed(0);

  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="overflow: visible">`;
  svgContent += `<rect width="100%" height="100%" fill="white"/>`;

  if (page.children && Array.isArray(page.children)) {
    page.children.forEach(element => {
      if (!element || !element.type) return;
      const x = (element.x || 0).toFixed(2);
      const y = (element.y || 0).toFixed(2);
      const width = (element.width || 100).toFixed(2);
      const height = (element.height || 100).toFixed(2);

      if (element.type === 'text' && element.text) {
        const fontSize = (element.fontSize || 16).toFixed(2);
        const fill = element.fill || 'black';
        const fontFamily = element.fontFamily || 'Arial';
        let lines = element.text.split('\n');
        lines = lines.map(line => line.length > 50 ? line.substring(0, 50) + '...' : line);
        svgContent += `<text x="${x}" y="${(parseFloat(y) + parseFloat(fontSize)).toFixed(2)}" font-size="${fontSize}" font-family="${fontFamily}" fill="${fill}">`;
        lines.forEach((line, index) => {
          const dy = index === 0 ? 0 : fontSize;
          svgContent += `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
        });
        svgContent += `</text>`;
      } else if (element.type === 'figure' && element.subType === 'rect') {
        const fill = element.fill || 'gray';
        const stroke = element.stroke || 'none';
        const strokeWidth = (element.strokeWidth || 0).toFixed(2);
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
      } else if (element.type === 'image' && element.src) {
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#e0e0e0" stroke="#ccc" stroke-width="1"/>`;
        svgContent += `<text x="${(parseFloat(x) + parseFloat(width)/2).toFixed(2)}" y="${(parseFloat(y) + parseFloat(height)/2).toFixed(2)}" text-anchor="middle" font-size="12" fill="#666">Image</text>`;
      } else if (element.type === 'figure' && element.subType === 'circle') {
        const fill = element.fill || 'gray';
        const r = (Math.min(parseFloat(width), parseFloat(height)) / 2).toFixed(2);
        svgContent += `<circle cx="${(parseFloat(x) + parseFloat(width)/2).toFixed(2)}" cy="${(parseFloat(y) + parseFloat(height)/2).toFixed(2)}" r="${r}" fill="${fill}"/>`;
      } else {
        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#f0f0f0" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5"/>`;
      }
    });
  }

  svgContent += '</svg>';
  return Promise.resolve(svgContent);
}

// Fallback PNG generation using canvas
async function jsonToPNG(json, width = 400, height = 300) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Set background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const page = json.pages[0];
  const templateWidth = json.width || page.width || 595;
  const templateHeight = json.height || page.height || 842;
  const scaleX = width / templateWidth;
  const scaleY = height / templateHeight;
  const scale = Math.min(scaleX, scaleY);

  if (page.children && Array.isArray(page.children)) {
    page.children.forEach(element => {
      if (!element || !element.type) return;
      const x = (element.x || 0) * scale;
      const y = (element.y || 0) * scale;
      const elWidth = (element.width || 100) * scale;
      const elHeight = (element.height || 100) * scale;

      ctx.save();
      if (element.type === 'text' && element.text) {
        ctx.fillStyle = element.fill || '#000000';
        ctx.font = `${(element.fontSize || 16) * scale}px ${element.fontFamily || 'Arial'}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        element.text.split('\n').forEach((line, index) => {
          ctx.fillText(line, x, y + (index * (element.fontSize || 16) * scale));
        });
      } else if (element.type === 'figure' && element.subType === 'rect') {
        ctx.fillStyle = element.fill || '#cccccc';
        ctx.fillRect(x, y, elWidth, elHeight);
      } else if (element.type === 'image' && element.src) {
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x, y, elWidth, elHeight);
        ctx.fillStyle = '#666';
        ctx.font = `12px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Image', x + elWidth / 2, y + elHeight / 2);
      }
      ctx.restore();
    });
  }

  return canvas.toDataURL('image/png', 0.8);
}

// Configuration constants
const CONFIG = {
  CACHE: {
    MAX_MEMORY_SIZE: 100,
    MAX_PERSISTENT_SIZE: 50,
    PERSISTENT_KEY: 'polotno_preview_cache',
    VERSION: '2.0',
    EXPIRY_HOURS: 24
  },
  STORE_POOL: {
    MAX_SIZE: 5
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000
  },
  PERFORMANCE: {
    ALERT_THRESHOLD_MS: 5000,
    SUCCESS_RATE_THRESHOLD: 80
  }
};

// Global state
const state = {
  memoryCache: new Map(),
  storePool: [],
  metrics: {
    totalGenerations: 0,
    failedGenerations: 0,
    totalTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  }
};

// Utility functions
function generateCacheKey(json, width, height, format = 'png', designId = null, timestamp = null) {
  const jsonString = JSON.stringify(json);
  const hash = btoa(jsonString).slice(0, 32);
  const idPart = designId ? `_${designId}` : '';
  const timePart = timestamp ? `_${timestamp}` : '';
  return `${hash}${idPart}${timePart}_${width}x${height}_${format}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStoreFromPool() {
  if (state.storePool.length > 0) {
    return state.storePool.pop();
  }

  const store = createStore({
    width: 1024,
    height: 768,
    unit: 'px'
  });

  return store;
}

function returnStoreToPool(store) {
  if (state.storePool.length < CONFIG.STORE_POOL.MAX_SIZE) {
    store.clear();
    state.storePool.push(store);
  }
}

function getPersistentCache() {
  try {
    const cached = localStorage.getItem(CONFIG.CACHE.PERSISTENT_KEY);
    if (!cached) return new Map();

    const { version, data, timestamp } = JSON.parse(cached);

    if (version !== CONFIG.CACHE.VERSION) {
      localStorage.removeItem(CONFIG.CACHE.PERSISTENT_KEY);
      return new Map();
    }

    const now = Date.now();
    const expiryTime = CONFIG.CACHE.EXPIRY_HOURS * 60 * 60 * 1000;

    if (now - timestamp > expiryTime) {
      localStorage.removeItem(CONFIG.CACHE.PERSISTENT_KEY);
      return new Map();
    }

    return new Map(data);
  } catch (error) {
    console.warn('Failed to load persistent cache:', error);
    return new Map();
  }
}

function savePersistentCache(cache) {
  try {
    const entries = Array.from(cache.entries());
    const limitedEntries = entries.slice(-CONFIG.CACHE.MAX_PERSISTENT_SIZE);

    const cacheData = {
      version: CONFIG.CACHE.VERSION,
      data: limitedEntries,
      timestamp: Date.now()
    };

    localStorage.setItem(CONFIG.CACHE.PERSISTENT_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save persistent cache:', error);
  }
}

function getCachedPreview(cacheKey) {
  if (state.memoryCache.has(cacheKey)) {
    state.metrics.cacheHits++;
    return state.memoryCache.get(cacheKey);
  }

  const persistentCache = getPersistentCache();
  if (persistentCache.has(cacheKey)) {
    const cachedValue = persistentCache.get(cacheKey);
    state.memoryCache.set(cacheKey, cachedValue);
    state.metrics.cacheHits++;
    return cachedValue;
  }

  state.metrics.cacheMisses++;
  return null;
}

function cachePreview(cacheKey, dataUrl) {
  state.memoryCache.set(cacheKey, dataUrl);

  if (state.memoryCache.size > CONFIG.CACHE.MAX_MEMORY_SIZE) {
    const keysToDelete = Array.from(state.memoryCache.keys()).slice(0, state.memoryCache.size - CONFIG.CACHE.MAX_MEMORY_SIZE);
    keysToDelete.forEach(key => state.memoryCache.delete(key));
  }

  const persistentCache = getPersistentCache();
  persistentCache.set(cacheKey, dataUrl);
  savePersistentCache(persistentCache);
}

function sanitizePolotnoJson(json) {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid JSON data provided');
  }

  const sanitized = JSON.parse(JSON.stringify(json));

  function ensureNumeric(value, defaultValue) {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return defaultValue;
  }

  sanitized.width = ensureNumeric(sanitized.width, 1024);
  sanitized.height = ensureNumeric(sanitized.height, 768);
  if (!sanitized.pages) sanitized.pages = [];

  if (Array.isArray(sanitized.pages)) {
    sanitized.pages.forEach(page => {
      if (page && typeof page === 'object') {
        page.width = ensureNumeric(page.width, sanitized.width);
        page.height = ensureNumeric(page.height, sanitized.height);

        const elements = page.children || page.elements || [];
        if (Array.isArray(elements)) {
          page.children = elements.map(element => {
            if (!element || typeof element !== 'object') return null;
            const sanitizedElement = { ...element };
            if ('width' in sanitizedElement) {
              sanitizedElement.width = ensureNumeric(sanitizedElement.width, 100);
            }
            if ('height' in sanitizedElement) {
              sanitizedElement.height = ensureNumeric(sanitizedElement.height, 100);
            }
            if ('x' in sanitizedElement) {
              sanitizedElement.x = Math.max(0, ensureNumeric(sanitizedElement.x, 0));
            }
            if ('y' in sanitizedElement) {
              sanitizedElement.y = Math.max(0, ensureNumeric(sanitizedElement.y, 0));
            }
            if ('fontSize' in sanitizedElement) {
              sanitizedElement.fontSize = ensureNumeric(sanitizedElement.fontSize, 16);
            }
            if (sanitizedElement.type === 'text' && !sanitizedElement.text) {
              sanitizedElement.text = 'Placeholder Text';
            }
            return sanitizedElement;
          }).filter(el => el !== null);
        }
      }
    });
  }

  return sanitized;
}

function extractPolotnoJson(designData) {
  if (!designData) {
    throw new Error('No design data provided');
  }

  let data = designData;

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON string provided');
    }
  }

  if (data.content?.polotnoData) {
    return data.content.polotnoData;
  }

  if (data.polotnoData) {
    return data.polotnoData;
  }

  if (data.content?.data) {
    return data.content.data;
  }

  if (data.data) {
    return data.data;
  }

  if (data.content?.polotnoElements) {
    const result = {
      pages: [{
        id: 'page-1',
        width: data.content.width || 595,
        height: data.content.height || 842,
        children: data.content.polotnoElements
      }],
      width: data.content.width || 595,
      height: data.content.height || 842,
      unit: 'pt',
      dpi: 72
    };
    return result;
  }

  if (data.polotnoElements) {
    const result = {
      pages: [{
        id: 'page-1',
        width: data.width || 595,
        height: data.height || 842,
        children: data.polotnoElements
      }],
      width: data.width || 595,
      height: data.height || 842,
      unit: 'pt',
      dpi: 72
    };
    return result;
  }

  if (data.pages || data.width || data.height) {
    return data;
  }

  return {
    pages: [{
      id: 'page-1',
      width: 595,
      height: 842,
      children: []
    }],
    width: 595,
    height: 842,
    unit: 'pt',
    dpi: 72
  };
}

export async function generateLightweightThumbnail(json, width = 400, height = 300, options = {}) {
  const startTime = performance.now();
  const { useCache = true, designId = null, forceRefresh = false } = options;

  try {
    if (!json) {
      throw new Error('No JSON data provided to generateLightweightThumbnail');
    }

    const sanitizedJson = sanitizePolotnoJson(json);
    const cacheKey = useCache ? generateCacheKey(sanitizedJson, width, height, 'svg', designId, forceRefresh ? Date.now() : null) : null;

    if (useCache && !forceRefresh) {
      const cachedResult = getCachedPreview(cacheKey);
      if (cachedResult) {
        console.log('Cache hit for thumbnail:', cacheKey);
        return cachedResult;
      }
    }

    if (!sanitizedJson || !sanitizedJson.pages || !Array.isArray(sanitizedJson.pages)) {
      throw new Error('Invalid JSON structure for SVG generation');
    }

    try {
      const svgString = await jsonToSVG(sanitizedJson);
      if (!svgString || typeof svgString !== 'string') {
        throw new Error('Failed to generate SVG string');
      }

      const dataUrl = svgToURL(svgString);
      if (!dataUrl.startsWith('data:image/svg+xml')) {
        throw new Error('Invalid SVG data URL generated');
      }

      if (useCache && cacheKey) {
        cachePreview(cacheKey, dataUrl);
      }

      const generationTime = performance.now() - startTime;
      state.metrics.totalGenerations++;
      state.metrics.totalTime += generationTime;

      return dataUrl;
    } catch (svgError) {
      console.warn('SVG generation failed, attempting PNG fallback:', svgError.message);
      const pngDataUrl = await jsonToPNG(sanitizedJson, width, height);
      if (useCache && cacheKey) {
        cachePreview(cacheKey, pngDataUrl);
      }
      const generationTime = performance.now() - startTime;
      state.metrics.totalGenerations++;
      state.metrics.totalTime += generationTime;
      return pngDataUrl;
    }
  } catch (error) {
    state.metrics.failedGenerations++;
    console.error('Failed to generate lightweight thumbnail:', error);
    throw error;
  }
}

export async function generatePolotnoPreviewFromStore(json, width = 400, height = 300, options = {}) {
  const startTime = performance.now();
  const { useCache = true, format = 'png', quality = 0.8, forceRefresh = false } = options;

  try {
    const sanitizedJson = sanitizePolotnoJson(json);
    const cacheKey = useCache ? generateCacheKey(sanitizedJson, width, height, format, null, forceRefresh ? Date.now() : null) : null;

    if (useCache && !forceRefresh) {
      const cachedResult = getCachedPreview(cacheKey);
      if (cachedResult) {
        state.metrics.cacheHits++;
        return cachedResult;
      }
      state.metrics.cacheMisses++;
    }

    let store = getStoreFromPool();
    if (!store) {
      store = createStore({
        key: 'nFA5H9elEytDyPyvKL7T',
        showCredit: false,
      });
    }

    try {
      store.loadJSON(sanitizedJson);
      await sleep(100);

      const svgString = await jsonToSVG(sanitizedJson);
      if (!svgString || typeof svgString !== 'string') {
        throw new Error('Failed to generate SVG for store-based preview');
      }
      const dataUrl = svgToURL(svgString);

      if (useCache && cacheKey && dataUrl) {
        cachePreview(cacheKey, dataUrl);
      }

      const generationTime = performance.now() - startTime;
      state.metrics.totalGenerations++;
      state.metrics.totalTime += generationTime;

      return dataUrl;
    } catch (svgError) {
      console.warn('Store-based SVG generation failed, attempting PNG fallback:', svgError.message);
      const pngDataUrl = await jsonToPNG(sanitizedJson, width, height);
      if (useCache && cacheKey) {
        cachePreview(cacheKey, pngDataUrl);
      }
      const generationTime = performance.now() - startTime;
      state.metrics.totalGenerations++;
      state.metrics.totalTime += generationTime;
      return pngDataUrl;
    } finally {
      returnStoreToPool(store);
    }
  } catch (error) {
    state.metrics.failedGenerations++;
    console.error('Failed to generate preview from store:', error);
    throw error;
  }
}

export async function generatePolotnoPreviewById(designId, width = 400, height = 300, options = {}) {
  try {
    const { getDesignById } = await import('@/api/designs.js');
    const designData = await getDesignById(designId);

    if (!designData) {
      throw new Error(`Design with ID ${designId} not found`);
    }

    return await generatePolotnoPreviewFromData(designData, width, height, { ...options, designId });
  } catch (error) {
    console.error(`Failed to generate preview for design ID ${designId}:`, error);
    throw error;
  }
}

export async function generatePolotnoPreviewFromData(designData, width = 400, height = 300, options = {}) {
  try {
    const polotnoJson = extractPolotnoJson(designData);

    if (!polotnoJson) {
      throw new Error('Failed to extract Polotno JSON from design data');
    }
    const designId = designData?.id || designData?._id || null;

    if (width <= 400 && height <= 300) {
      try {
        return await generateLightweightThumbnail(polotnoJson, width, height, { ...options, designId });
      } catch (error) {
        console.warn('Lightweight generation failed, falling back to store-based generation:', error.message);
      }
    }

    return await generatePolotnoPreviewFromStore(polotnoJson, width, height, { ...options, designId });
  } catch (error) {
    console.error('Failed to generate preview from design data:', error);
    throw error;
  }
}

export async function generateBatchPreviews(designs, onProgress, options = {}) {
  const { concurrency = 3, useCache = true } = options;
  const results = [];
  const executing = [];
  let completed = 0;

  for (let i = 0; i < designs.length; i++) {
    const promise = generatePolotnoPreviewFromData(designs[i], 400, 300, { useCache })
      .then(preview => ({ success: true, preview, design: designs[i] }))
      .catch(error => ({ success: false, error: error.message, design: designs[i] }))
      .finally(() => {
        completed++;
        if (onProgress) onProgress(completed, designs.length);
      });

    results[i] = promise;
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  return Promise.all(results);
}

export function getPerformanceMetrics() {
  const totalAttempts = state.metrics.cacheHits + state.metrics.cacheMisses;
  const successRate = state.metrics.totalGenerations > 0
    ? ((state.metrics.totalGenerations - state.metrics.failedGenerations) / state.metrics.totalGenerations * 100).toFixed(1)
    : 0;
  const averageTime = state.metrics.totalGenerations > 0
    ? Math.round(state.metrics.totalTime / state.metrics.totalGenerations)
    : 0;

  return {
    totalGenerations: state.metrics.totalGenerations,
    failedGenerations: state.metrics.failedGenerations,
    successRate: successRate + '%',
    averageTime,
    cacheHits: state.metrics.cacheHits,
    cacheMisses: state.metrics.cacheMisses,
    cacheSize: state.memoryCache.size,
    cacheHitRate: totalAttempts > 0 ? (state.metrics.cacheHits / totalAttempts * 100).toFixed(1) + '%' : '0%'
  };
}

export function resetPerformanceMetrics(keepCache = true) {
  state.metrics = {
    totalGenerations: 0,
    failedGenerations: 0,
    totalTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  if (!keepCache) {
    clearPreviewCache();
  }
}

export function clearPreviewCache(includePersistent = true) {
  state.memoryCache.clear();

  if (includePersistent) {
    try {
      localStorage.removeItem(CONFIG.CACHE.PERSISTENT_KEY);
    } catch (error) {
      console.warn('Failed to clear persistent cache:', error);
    }
  }
}

export function initializePreviewService(config = {}) {
  Object.assign(CONFIG, config);

  const checkPerformance = () => {
    const metrics = getPerformanceMetrics();
    if (metrics.averageTime > CONFIG.PERFORMANCE.ALERT_THRESHOLD_MS ||
        parseFloat(metrics.successRate) < CONFIG.PERFORMANCE.SUCCESS_RATE_THRESHOLD) {
      console.warn('🚨 Performance Alert: Preview service needs optimization', {
        averageTime: metrics.averageTime,
        successRate: metrics.successRate
      });
    }
  };

  const performanceInterval = setInterval(checkPerformance, 5 * 60 * 1000);

  return {
    dispose: () => {
      clearInterval(performanceInterval);
      state.storePool.forEach(store => store.clear());
      state.storePool.length = 0;
    }
  };
}

if (typeof window !== 'undefined') {
  initializePreviewService();
}
