// src/services/previewService.js
// Enhanced service for generating and managing design previews

/**
 * Generate a canvas-based preview from design data
 * @param {Object} designData - The design data object
 * @param {number} width - Preview width (default: 300)
 * @param {number} height - Preview height (default: 200)
 * @returns {string|null} - Data URL of the preview image
 */
export function generateDesignPreview(designData, width = 300, height = 200) {
  try {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Add border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Extract elements from the design data
    let elements = [];
    let originalWidth = 1024;
    let originalHeight = 1024;
    
    // Parse design data structure
    if (designData) {
      // Handle different data structures
      if (typeof designData === 'string') {
        try {
          designData = JSON.parse(designData);
        } catch (e) {
          console.error('Failed to parse design data:', e);
          return generateFallbackPreview(width, height, 'Invalid Data');
        }
      }
      
      // Extract elements and dimensions
      if (designData.data) {
        // New format with data wrapper
        const data = designData.data;
        if (data.pages && data.pages[0]) {
          elements = data.pages[0].children || [];
          originalWidth = data.pages[0].width || 1024;
          originalHeight = data.pages[0].height || 1024;
        } else if (data.children) {
          elements = data.children;
          originalWidth = data.width || 1024;
          originalHeight = data.height || 1024;
        }
      } else if (designData.pages && designData.pages[0]) {
        // Direct pages format
        elements = designData.pages[0].children || [];
        originalWidth = designData.pages[0].width || 1024;
        originalHeight = designData.pages[0].height || 1024;
      } else if (designData.children) {
        // Direct children format
        elements = designData.children;
        originalWidth = designData.width || 1024;
        originalHeight = designData.height || 1024;
      } else if (designData.polotnoElements) {
        // Polotno format
        elements = designData.polotnoElements;
        originalWidth = designData.width || 1024;
        originalHeight = designData.height || 1024;
      }
    }
    
    // Calculate scale to fit preview
    const padding = 20;
    const scaleX = (width - padding) / originalWidth;
    const scaleY = (height - padding) / originalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Center the content
    const offsetX = (width - originalWidth * scale) / 2;
    const offsetY = (height - originalHeight * scale) / 2;
    
    // Render elements
    if (elements && elements.length > 0) {
      elements.forEach((element, index) => {
        if (index > 15) return; // Limit elements for performance
        
        renderElement(ctx, element, scale, offsetX, offsetY);
      });
    } else {
      // No elements, show placeholder
      return generateFallbackPreview(width, height, 'Empty Canvas');
    }
    
    // Add design name overlay if available
    const designName = designData.name || (designData.data && designData.data.name);
    if (designName) {
      addNameOverlay(ctx, designName, width, height);
    }
    
    return canvas.toDataURL('image/png');
    
  } catch (error) {
    console.error('Error generating design preview:', error);
    return generateFallbackPreview(width, height, 'Error');
  }
}

/**
 * Render a single element on the canvas
 */
function renderElement(ctx, element, scale, offsetX, offsetY) {
  if (!element) return;
  
  const x = offsetX + (element.x || 0) * scale;
  const y = offsetY + (element.y || 0) * scale;
  const w = Math.max(1, (element.width || 100) * scale);
  const h = Math.max(1, (element.height || 50) * scale);
  
  ctx.save();
  
  // Apply rotation if present
  if (element.rotation) {
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-(x + w/2), -(y + h/2));
  }
  
  // Apply opacity if present
  if (element.opacity !== undefined) {
    ctx.globalAlpha = element.opacity;
  }
  
  switch (element.type) {
    case 'text':
      renderTextElement(ctx, element, x, y, w, h, scale);
      break;
      
    case 'rect':
    case 'rectangle':
      renderRectElement(ctx, element, x, y, w, h);
      break;
      
    case 'circle':
    case 'ellipse':
      renderCircleElement(ctx, element, x, y, w, h);
      break;
      
    case 'image':
    case 'svg':
      renderImageElement(ctx, element, x, y, w, h);
      break;
      
    case 'line':
      renderLineElement(ctx, element, x, y, w, h, scale);
      break;
      
    default:
      // Generic element
      renderGenericElement(ctx, element, x, y, w, h);
  }
  
  ctx.restore();
}

function renderTextElement(ctx, element, x, y, w, h, scale) {
  const fontSize = Math.max(8, (element.fontSize || 16) * scale);
  const fontFamily = element.fontFamily || 'Arial';
  const fontWeight = element.fontWeight || 'normal';
  
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = element.fill || element.color || '#000000';
  ctx.textAlign = element.textAlign || 'left';
  ctx.textBaseline = 'top';
  
  const text = (element.text || 'Text').substring(0, 50); // Limit text length
  const lines = text.split('\n');
  
  lines.forEach((line, index) => {
    const lineY = y + (fontSize * index * 1.2);
    if (lineY < y + h) { // Only render if within bounds
      ctx.fillText(line, x, lineY);
    }
  });
}

function renderRectElement(ctx, element, x, y, w, h) {
  // Fill
  if (element.fill && element.fill !== 'transparent') {
    ctx.fillStyle = element.fill;
    if (element.rx || element.ry) {
      drawRoundedRect(ctx, x, y, w, h, element.rx || element.ry || 0);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, w, h);
    }
  }
  
  // Stroke
  if (element.stroke && element.stroke !== 'transparent') {
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = (element.strokeWidth || 1);
    if (element.rx || element.ry) {
      drawRoundedRect(ctx, x, y, w, h, element.rx || element.ry || 0);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, w, h);
    }
  }
}

function renderCircleElement(ctx, element, x, y, w, h) {
  ctx.beginPath();
  ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, 2 * Math.PI);
  
  if (element.fill && element.fill !== 'transparent') {
    ctx.fillStyle = element.fill;
    ctx.fill();
  }
  
  if (element.stroke && element.stroke !== 'transparent') {
    ctx.strokeStyle = element.stroke;
    ctx.lineWidth = element.strokeWidth || 1;
    ctx.stroke();
  }
}

function renderImageElement(ctx, element, x, y, w, h) {
  // Draw placeholder for images
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  
  // Draw image icon
  ctx.fillStyle = '#9ca3af';
  ctx.font = `${Math.max(12, Math.min(w, h)/3)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🖼️', x + w/2, y + h/2);
}

function renderLineElement(ctx, element, x, y, w, h, scale) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h);
  ctx.strokeStyle = element.stroke || element.fill || '#000000';
  ctx.lineWidth = (element.strokeWidth || 2) * scale;
  ctx.stroke();
}

function renderGenericElement(ctx, element, x, y, w, h) {
  ctx.fillStyle = element.fill || '#e5e7eb';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function addNameOverlay(ctx, name, width, height) {
  const overlayHeight = 30;
  
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, height - overlayHeight, width, overlayHeight);
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const truncatedName = name.length > 25 ? name.substring(0, 25) + '...' : name;
  ctx.fillText(truncatedName, 8, height - overlayHeight/2);
}

/**
 * Generate a fallback preview when design data is unavailable
 */
function generateFallbackPreview(width = 300, height = 200, message = 'No Preview') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width-2, height-2);
  
  // Icon
  ctx.fillStyle = '#9ca3af';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📄', width/2, height/2 - 15);
  
  // Message
  ctx.font = '14px Arial';
  ctx.fillText(message, width/2, height/2 + 15);
  
  return canvas.toDataURL('image/png');
}

/**
 * Generate preview from template data
 */
export function generateTemplatePreview(template, width = 300, height = 200) {
  if (!template) return generateFallbackPreview(width, height, 'No Template');
  
  try {
    // Use template content for preview generation
    const designData = {
      data: {
        pages: [{
          children: template.content?.polotnoElements || [],
          width: template.content?.width || 1024,
          height: template.content?.height || 1024
        }]
      },
      name: template.name
    };
    
    return generateDesignPreview(designData, width, height);
  } catch (error) {
    console.error('Error generating template preview:', error);
    return generateFallbackPreview(width, height, 'Template Error');
  }
}

/**
 * Update design with generated preview
 * @param {Object} design - Design object
 * @returns {Object} - Design with updated imageUrl
 */
export function updateDesignPreview(design) {
  try {
    const preview = generateDesignPreview(design, 400, 300);
    return {
      ...design,
      imageUrl: preview
    };
  } catch (error) {
    console.error('Error updating design preview:', error);
    return design;
  }
}

/**
 * Batch update previews for multiple designs
 * @param {Array} designs - Array of design objects
 * @returns {Array} - Designs with updated previews
 */
export function batchUpdatePreviews(designs) {
  return designs.map(design => {
    try {
      return updateDesignPreview(design);
    } catch (error) {
      console.error(`Error updating preview for design ${design.id}:`, error);
      return design;
    }
  });
}