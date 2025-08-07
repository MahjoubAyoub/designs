import { createCanvas } from 'canvas';

/**
 * Generate a canvas preview from design/template data
 * @param {Object} data - Design or template data
 * @param {number} width - Preview width (default: 200)
 * @param {number} height - Preview height (default: 150)
 * @returns {string|null} - Base64 data URL of the preview image
 */
export function generateCanvasPreview(data, width = 200, height = 150) {
  try {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Add border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // Extract elements from the data
    let elements = [];
    
    if (data && data.content) {
      // Template format
      if (data.content.polotnoElements) {
        elements = data.content.polotnoElements;
      }
    } else if (data && data.data) {
      // Design format
      if (data.data.pages && data.data.pages[0] && data.data.pages[0].children) {
        elements = data.data.pages[0].children;
      } else if (data.data.children) {
        elements = data.data.children;
      } else if (data.data.polotnoElements) {
        elements = data.data.polotnoElements;
      }
    }
    
    // Get original dimensions
    let originalWidth = 1024;
    let originalHeight = 1024;
    
    if (data && data.content) {
      originalWidth = data.content.width || 1024;
      originalHeight = data.content.height || 1024;
    } else if (data && data.data) {
      if (data.data.pages && data.data.pages[0]) {
        originalWidth = data.data.pages[0].width || 1024;
        originalHeight = data.data.pages[0].height || 1024;
      } else {
        originalWidth = data.data.width || 1024;
        originalHeight = data.data.height || 1024;
      }
    }
    
    // Calculate scale to fit preview
    const scaleX = (width - 20) / originalWidth;
    const scaleY = (height - 20) / originalHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Center the content
    const offsetX = (width - originalWidth * scale) / 2;
    const offsetY = (height - originalHeight * scale) / 2;
    
    // Render elements
    if (elements && elements.length > 0) {
      elements.forEach((element, index) => {
        if (index > 15) return; // Limit to first 15 elements for performance
        
        const x = offsetX + (element.x || 0) * scale;
        const y = offsetY + (element.y || 0) * scale;
        const w = (element.width || 100) * scale;
        const h = (element.height || 50) * scale;
        
        ctx.save();
        
        switch (element.type) {
          case 'text':
            ctx.fillStyle = element.fill || '#000000';
            ctx.font = `${Math.max(8, (element.fontSize || 16) * scale)}px Arial`;
            ctx.textAlign = element.align || 'left';
            const text = (element.text || 'Text').substring(0, 50);
            ctx.fillText(text, x, y + h/2);
            break;
            
          case 'rect':
          case 'rectangle':
            ctx.fillStyle = element.fill || '#cccccc';
            ctx.fillRect(x, y, w, h);
            if (element.stroke) {
              ctx.strokeStyle = element.stroke;
              ctx.lineWidth = Math.max(1, (element.strokeWidth || 1) * scale);
              ctx.strokeRect(x, y, w, h);
            }
            break;
            
          case 'circle':
          case 'ellipse':
            ctx.fillStyle = element.fill || '#cccccc';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, 2 * Math.PI);
            ctx.fill();
            if (element.stroke) {
              ctx.strokeStyle = element.stroke;
              ctx.lineWidth = Math.max(1, (element.strokeWidth || 1) * scale);
              ctx.stroke();
            }
            break;
            
          case 'image':
            // Draw a placeholder for images
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
            
            // Draw image icon
            ctx.fillStyle = '#9ca3af';
            ctx.font = `${Math.max(12, Math.min(w, h)/3)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('🖼️', x + w/2, y + h/2 + 5);
            break;
            
          case 'line':
            ctx.strokeStyle = element.stroke || '#000000';
            ctx.lineWidth = Math.max(1, (element.strokeWidth || 1) * scale);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + w, y + h);
            ctx.stroke();
            break;
            
          default:
            // Generic element
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
        }
        
        ctx.restore();
      });
    } else {
      // No elements, show placeholder
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(10, 10, width - 20, height - 20);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Empty Canvas', width/2, height/2);
    }
    
    // Add title overlay
    const name = data.name || 'Untitled';
    if (name) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, height - 25, width, 25);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(name.length > 25 ? name.substring(0, 25) + '...' : name, 5, height - 8);
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error generating canvas preview:', error);
    return null;
  }
}

/**
 * Generate preview for a template
 * @param {Object} templateData - Template data
 * @returns {string|null} - Base64 data URL of the preview image
 */
export function generateTemplatePreview(templateData) {
  return generateCanvasPreview(templateData, 200, 150);
}

/**
 * Generate preview for a design
 * @param {Object} designData - Design data
 * @returns {string|null} - Base64 data URL of the preview image
 */
export function generateDesignPreview(designData) {
  return generateCanvasPreview(designData, 200, 150);
}