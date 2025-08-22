import { createStore } from 'polotno/model/store';
import { svgToURL } from 'polotno/utils/svg';

// Fetch AI-generated image as base64
async function fetchAIImage(src) {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Failed to fetch AI image: ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to fetch AI image:', e);
    return null;
  }
}

// Escape XML for SVG
const escapeXml = str => typeof str === 'string' ? str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;') : '';

// Generate SVG from JSON
async function jsonToSVG(json) {
  if (!json?.pages?.length) throw new Error('Invalid JSON: missing/empty pages');
  const page = json.pages[0];
  const width = (json.width || page.width || 595).toFixed(0);
  const height = (json.height || page.height || 842).toFixed(0);
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="overflow: visible"><rect width="100%" height="100%" fill="white"/>`;

  if (Array.isArray(page.children)) {
    for (const el of page.children) {
      if (!el?.type) continue;
      const x = (el.x || 0).toFixed(2);
      const y = (el.y || 0).toFixed(2);
      const w = (el.width || 100).toFixed(2);
      const h = (el.height || 100).toFixed(2);

      if (el.type === 'text' && el.text) {
        const fontSize = (el.fontSize || 16).toFixed(2);
        const fill = el.fill || 'black';
        const fontFamily = el.fontFamily || 'Arial';
        const lines = el.text.split('\n').map(l => l.length > 50 ? l.substring(0, 50) + '...' : l);
        svg += `<text x="${x}" y="${(parseFloat(y) + parseFloat(fontSize)).toFixed(2)}" font-size="${fontSize}" font-family="${fontFamily}" fill="${fill}">`;
        lines.forEach((line, i) => svg += `<tspan x="${x}" dy="${i ? fontSize : 0}">${escapeXml(line)}</tspan>`);
        svg += '</text>';
      } else if (el.type === 'figure' && el.subType === 'rect') {
        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${el.fill || 'gray'}" stroke="${el.stroke || 'none'}" stroke-width="${(el.strokeWidth || 0).toFixed(2)}"/>`;
      } else if (el.type === 'image' && el.src) {
        const isAI = el.isAIGenerated || el.src.includes('ai-generated');
        let src = el.src;
        if (isAI && !src.startsWith('data:')) src = await fetchAIImage(src) || src;
        if (src.startsWith('data:')) {
          svg += `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${src}" preserveAspectRatio="xMidYMid slice"/>`;
        } else {
          svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e0e0e0" stroke="#ccc" stroke-width="1"/>`;
          svg += `<text x="${(parseFloat(x) + parseFloat(w)/2).toFixed(2)}" y="${(parseFloat(y) + parseFloat(h)/2).toFixed(2)}" text-anchor="middle" font-size="12" fill="#666">AI Image</text>`;
        }
      } else if (el.type === 'figure' && el.subType === 'circle') {
        const r = (Math.min(parseFloat(w), parseFloat(h)) / 2).toFixed(2);
        svg += `<circle cx="${(parseFloat(x) + parseFloat(w)/2).toFixed(2)}" cy="${(parseFloat(y) + parseFloat(h)/2).toFixed(2)}" r="${r}" fill="${el.fill || 'gray'}"/>`;
      } else {
        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f0f0f0" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5"/>`;
      }
    }
  }
  svg += '</svg>';
  return svg;
}

// Generate PNG from JSON
async function jsonToPNG(json, width = 400, height = 300) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const page = json.pages[0];
  const templateWidth = json.width || page.width || 595;
  const templateHeight = json.height || page.height || 842;
  const scale = Math.min(width / templateWidth, height / templateHeight);

  if (Array.isArray(page.children)) {
    for (const el of page.children) {
      if (!el?.type) continue;
      const x = (el.x || 0) * scale;
      const y = (el.y || 0) * scale;
      const w = (el.width || 100) * scale;
      const h = (el.height || 100) * scale;

      ctx.save();
      if (el.type === 'text' && el.text) {
        ctx.fillStyle = el.fill || '#000000';
        ctx.font = `${(el.fontSize || 16) * scale}px ${el.fontFamily || 'Arial'}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        el.text.split('\n').forEach((line, i) => ctx.fillText(line, x, y + (i * (el.fontSize || 16) * scale)));
      } else if (el.type === 'figure' && el.subType === 'rect') {
        ctx.fillStyle = el.fill || '#cccccc';
        ctx.fillRect(x, y, w, h);
      } else if (el.type === 'image' && el.src) {
        const isAI = el.isAIGenerated || el.src.includes('ai-generated');
        let src = el.src;
        if (isAI && !src.startsWith('data:')) src = await fetchAIImage(src) || src;
        if (src.startsWith('data:')) {
          const img = new Image();
          await new Promise(resolve => {
            img.onload = resolve;
            img.onerror = () => { console.warn('Failed to load AI image:', src); resolve(); };
            img.src = src;
          });
          ctx.drawImage(img, x, y, w, h);
        } else {
          ctx.fillStyle = '#e0e0e0';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('AI Image', x + w / 2, y + h / 2);
        }
      }
      ctx.restore();
    }
  }
  return canvas.toDataURL('image/png', 0.8);
}

// Configuration
const CONFIG = {
  CACHE: { MAX_MEMORY_SIZE: 100, MAX_PERSISTENT_SIZE: 50, PERSISTENT_KEY: 'polotno_preview_cache', VERSION: '2.0', EXPIRY_HOURS: 24 },
  STORE_POOL: { MAX_SIZE: 5 },
  PERFORMANCE: { ALERT_THRESHOLD_MS: 5000, SUCCESS_RATE_THRESHOLD: 80 }
};

// State
const state = {
  memoryCache: new Map(),
  storePool: [],
  metrics: { totalGenerations: 0, failedGenerations: 0, totalTime: 0, cacheHits: 0, cacheMisses: 0 }
};

// Cache utilities
const generateCacheKey = (json, width, height, format = 'png', designId = null, timestamp = null) =>
  `${btoa(JSON.stringify(json)).slice(0, 32)}${designId ? `_${designId}` : ''}${timestamp ? `_${timestamp}` : ''}_${width}x${height}_${format}`;

const getPersistentCache = () => {
  try {
    const cached = localStorage.getItem(CONFIG.CACHE.PERSISTENT_KEY);
    if (!cached) return new Map();
    const { version, data, timestamp } = JSON.parse(cached);
    if (version !== CONFIG.CACHE.VERSION || Date.now() - timestamp > CONFIG.CACHE.EXPIRY_HOURS * 3600000) {
      localStorage.removeItem(CONFIG.CACHE.PERSISTENT_KEY);
      return new Map();
    }
    return new Map(data);
  } catch (e) {
    console.warn('Failed to load persistent cache:', e);
    return new Map();
  }
};

const savePersistentCache = cache => {
  try {
    localStorage.setItem(CONFIG.CACHE.PERSISTENT_KEY, JSON.stringify({
      version: CONFIG.CACHE.VERSION,
      data: Array.from(cache.entries()).slice(-CONFIG.CACHE.MAX_PERSISTENT_SIZE),
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to save persistent cache:', e);
  }
};

const getCachedPreview = cacheKey => {
  if (state.memoryCache.has(cacheKey)) {
    state.metrics.cacheHits++;
    return state.memoryCache.get(cacheKey);
  }
  const cache = getPersistentCache();
  if (cache.has(cacheKey)) {
    state.memoryCache.set(cacheKey, cache.get(cacheKey));
    state.metrics.cacheHits++;
    return cache.get(cacheKey);
  }
  state.metrics.cacheMisses++;
  return null;
};

const cachePreview = (cacheKey, dataUrl) => {
  state.memoryCache.set(cacheKey, dataUrl);
  if (state.memoryCache.size > CONFIG.CACHE.MAX_MEMORY_SIZE) {
    Array.from(state.memoryCache.keys()).slice(0, state.memoryCache.size - CONFIG.CACHE.MAX_MEMORY_SIZE).forEach(key => state.memoryCache.delete(key));
  }
  const cache = getPersistentCache();
  cache.set(cacheKey, dataUrl);
  savePersistentCache(cache);
};

// Store utilities
const getStoreFromPool = () => state.storePool.length ? state.storePool.pop() : createStore({ width: 1024, height: 768, unit: 'px' });
const returnStoreToPool = store => {
  if (state.storePool.length < CONFIG.STORE_POOL.MAX_SIZE) {
    store.clear();
    state.storePool.push(store);
  }
};

// JSON utilities
const sanitizePolotnoJson = json => {
  if (!json || typeof json !== 'object') throw new Error('Invalid JSON');
  const sanitized = JSON.parse(JSON.stringify(json));
  const ensureNumeric = (v, d) => (typeof v === 'number' && !isNaN(v) ? v : parseFloat(v) || d);

  sanitized.width = ensureNumeric(sanitized.width, 1024);
  sanitized.height = ensureNumeric(sanitized.height, 768);
  sanitized.pages = sanitized.pages || [];

  sanitized.pages.forEach(page => {
    if (!page || typeof page !== 'object') return;
    page.width = ensureNumeric(page.width, sanitized.width);
    page.height = ensureNumeric(page.height, sanitized.height);
    page.children = (page.children || page.elements || []).map(el => {
      if (!el || typeof el !== 'object') return null;
      const s = { ...el };
      s.width = ensureNumeric(s.width, 100);
      s.height = ensureNumeric(s.height, 100);
      s.x = Math.max(0, ensureNumeric(s.x, 0));
      s.y = Math.max(0, ensureNumeric(s.y, 0));
      s.fontSize = ensureNumeric(s.fontSize, 16);
      if (s.type === 'text' && !s.text) s.text = 'Placeholder Text';
      return s;
    }).filter(el => el);
  });
  return sanitized;
};

const extractPolotnoJson = data => {
  if (!data) throw new Error('No design data');
  let json = typeof data === 'string' ? JSON.parse(data) : data;
  if (json.content?.polotnoData || json.polotnoData || json.content?.data || json.data) {
    return json.content?.polotnoData || json.polotnoData || json.content?.data || json.data;
  }
  if (json.content?.polotnoElements || json.polotnoElements) {
    return {
      pages: [{ id: 'page-1', width: json.content?.width || json.width || 595, height: json.content?.height || json.height || 842, children: json.content?.polotnoElements || json.polotnoElements }],
      width: json.content?.width || json.width || 595,
      height: json.content?.height || json.height || 842,
      unit: 'pt',
      dpi: 72
    };
  }
  return json.pages || json.width || json.height ? json : { pages: [{ id: 'page-1', width: 595, height: 842, children: [] }], width: 595, height: 842, unit: 'pt', dpi: 72 };
};

// Preview generation
export async function generateLightweightThumbnail(json, width = 400, height = 300, { useCache = true, designId = null, forceRefresh = false } = {}) {
  const start = performance.now();
  try {
    if (!json) throw new Error('No JSON data');
    const sanitized = sanitizePolotnoJson(json);
    const cacheKey = useCache ? generateCacheKey(sanitized, width, height, 'svg', designId, forceRefresh ? Date.now() : null) : null;

    if (useCache && !forceRefresh) {
      const cached = getCachedPreview(cacheKey);
      if (cached) return cached;
    }

    const svg = await jsonToSVG(sanitized);
    if (!svg) throw new Error('Failed to generate SVG');
    const dataUrl = svgToURL(svg);
    if (!dataUrl.startsWith('data:image/svg+xml')) throw new Error('Invalid SVG data URL');

    if (useCache && cacheKey) cachePreview(cacheKey, dataUrl);
    state.metrics.totalGenerations++;
    state.metrics.totalTime += performance.now() - start;
    return dataUrl;
  } catch (e) {
    console.warn('SVG generation failed, attempting PNG:', e.message);
    const png = await jsonToPNG(sanitized, width, height);
    if (useCache && cacheKey) cachePreview(cacheKey, png);
    state.metrics.totalGenerations++;
    state.metrics.totalTime += performance.now() - start;
    return png;
  }
}

export async function generatePolotnoPreviewFromStore(json, width = 400, height = 300, { useCache = true, format = 'png', quality = 0.8, forceRefresh = false } = {}) {
  const start = performance.now();
  try {
    const sanitized = sanitizePolotnoJson(json);
    const cacheKey = useCache ? generateCacheKey(sanitized, width, height, format, null, forceRefresh ? Date.now() : null) : null;

    if (useCache && !forceRefresh) {
      const cached = getCachedPreview(cacheKey);
      if (cached) return cached;
    }

    const store = getStoreFromPool();
    try {
      store.loadJSON(sanitized);
      await new Promise(r => setTimeout(r, 100));
      const svg = await jsonToSVG(sanitized);
      if (!svg) throw new Error('Failed to generate SVG');
      const dataUrl = svgToURL(svg);

      if (useCache && cacheKey) cachePreview(cacheKey, dataUrl);
      state.metrics.totalGenerations++;
      state.metrics.totalTime += performance.now() - start;
      return dataUrl;
    } catch (e) {
      console.warn('Store-based SVG failed, attempting PNG:', e.message);
      const png = await jsonToPNG(sanitized, width, height);
      if (useCache && cacheKey) cachePreview(cacheKey, png);
      state.metrics.totalGenerations++;
      state.metrics.totalTime += performance.now() - start;
      return png;
    } finally {
      returnStoreToPool(store);
    }
  } catch (e) {
    state.metrics.failedGenerations++;
    console.error('Failed to generate preview:', e);
    throw e;
  }
}

export async function generatePolotnoPreviewById(designId, width = 400, height = 300, options = {}) {
  try {
    const { getDesignById } = await import('@/api/designs.js');
    const data = await getDesignById(designId);
    if (!data) throw new Error(`Design ID ${designId} not found`);
    return await generatePolotnoPreviewFromData(data, width, height, { ...options, designId });
  } catch (e) {
    console.error(`Failed to generate preview for ID ${designId}:`, e);
    throw e;
  }
}

export async function generatePolotnoPreviewFromData(data, width = 400, height = 300, options = {}) {
  try {
    const json = extractPolotnoJson(data);
    if (!json) throw new Error('Failed to extract Polotno JSON');
    const designId = data?.id || data?._id || null;
    if (width <= 400 && height <= 300) {
      try {
        return await generateLightweightThumbnail(json, width, height, { ...options, designId });
      } catch (e) {
        console.warn('Lightweight generation failed:', e.message);
      }
    }
    return await generatePolotnoPreviewFromStore(json, width, height, { ...options, designId });
  } catch (e) {
    console.error('Failed to generate preview:', e);
    throw e;
  }
}

export async function generateBatchPreviews(designs, onProgress, { concurrency = 3, useCache = true } = {}) {
  const results = [];
  const executing = [];
  let completed = 0;

  for (let i = 0; i < designs.length; i++) {
    const p = generatePolotnoPreviewFromData(designs[i], 400, 300, { useCache })
      .then(preview => ({ success: true, preview, design: designs[i] }))
      .catch(e => ({ success: false, error: e.message, design: designs[i] }))
      .finally(() => {
        completed++;
        if (onProgress) onProgress(completed, designs.length);
      });
    results[i] = p;
    executing.push(p);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(e => e === p), 1);
    }
  }
  return Promise.all(results);
}

export const getPerformanceMetrics = () => {
  const total = state.metrics.cacheHits + state.metrics.cacheMisses;
  return {
    totalGenerations: state.metrics.totalGenerations,
    failedGenerations: state.metrics.failedGenerations,
    successRate: state.metrics.totalGenerations ? ((state.metrics.totalGenerations - state.metrics.failedGenerations) / state.metrics.totalGenerations * 100).toFixed(1) + '%' : '0%',
    averageTime: state.metrics.totalGenerations ? Math.round(state.metrics.totalTime / state.metrics.totalGenerations) : 0,
    cacheHits: state.metrics.cacheHits,
    cacheMisses: state.metrics.cacheMisses,
    cacheSize: state.memoryCache.size,
    cacheHitRate: total ? (state.metrics.cacheHits / total * 100).toFixed(1) + '%' : '0%'
  };
};

export const resetPerformanceMetrics = (keepCache = true) => {
  state.metrics = { totalGenerations: 0, failedGenerations: 0, totalTime: 0, cacheHits: 0, cacheMisses: 0 };
  if (!keepCache) clearPreviewCache();
};

export const clearPreviewCache = (includePersistent = true) => {
  state.memoryCache.clear();
  if (includePersistent) {
    try {
      localStorage.removeItem(CONFIG.CACHE.PERSISTENT_KEY);
    } catch (e) {
      console.warn('Failed to clear persistent cache:', e);
    }
  }
};

export const initializePreviewService = (config = {}) => {
  Object.assign(CONFIG, config);
  const checkPerformance = () => {
    const m = getPerformanceMetrics();
    if (m.averageTime > CONFIG.PERFORMANCE.ALERT_THRESHOLD_MS || parseFloat(m.successRate) < CONFIG.PERFORMANCE.SUCCESS_RATE_THRESHOLD) {
      console.warn('🚨 Performance Alert:', { averageTime: m.averageTime, successRate: m.successRate });
    }
  };
  const interval = setInterval(checkPerformance, 300000);
  return { dispose: () => { clearInterval(interval); state.storePool.forEach(s => s.clear()); state.storePool.length = 0; } };
};

if (typeof window !== 'undefined') initializePreviewService();
