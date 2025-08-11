import { getDesignById } from '@/api/designs.js'

/**
 * Vite-based preview service for generating design previews
 * Uses design ID to fetch data and render canvas elements
 */

/**
 * Generate a preview using design ID
 * @param {number|string} designId - Design ID to fetch and preview
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @returns {Promise<string>} - Base64 data URL of the preview
 */
export async function generateVitePreviewById(designId, width = 400, height = 300) {
  try {
    console.log('🎨 Generating Vite preview for design ID:', designId)
    
    // Fetch design data by ID
    const designData = await getDesignById(designId)
    console.log('📊 Fetched design data:', designData)
    
    return await generateVitePreview(designData, width, height)
  } catch (error) {
    console.error('❌ Failed to generate preview by ID:', error)
    throw error
  }
}

/**
 * Generate a preview using design data object
 * @param {Object} designData - Design data to preview
 * @param {number} width - Preview width
 * @param {number} height - Preview height
 * @returns {Promise<string>} - Base64 data URL of the preview
 */
export async function generateVitePreview(designData, width = 400, height = 300) {
  try {
    console.log('🎨 Generating Vite preview for design:', designData?.name || 'Unknown')
    console.log('📊 Design data structure:', {
      hasData: !!designData?.data,
      hasCanvasData: !!designData?.canvasData,
      dataType: typeof designData?.data,
      dataKeys: designData?.data ? Object.keys(designData.data) : [],
      hasPages: !!designData?.data?.pages,
      pagesLength: designData?.data?.pages?.length || 0,
      hasChildren: !!designData?.data?.children
    })
    
    // Create a canvas element
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    // Set background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    // Add border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, width, height)
    
    // Extract design elements from canvas data
    let elements = []
    let canvasWidth = 1024
    let canvasHeight = 1024
    
    // Handle direct template structure (templates imported from JSON)
    if (designData?.pages?.[0]?.children) {
      elements = designData.pages[0].children
      canvasWidth = designData.width || 1024
      canvasHeight = designData.height || 1024
      console.log('✅ Found elements in pages[0].children:', elements.length)
    } else if (designData?.children) {
      elements = designData.children
      canvasWidth = designData.width || 1024
      canvasHeight = designData.height || 1024
      console.log('✅ Found elements in children:', elements.length)
    }
    // Handle design data structure (designs)
    else if (designData?.data?.pages?.[0]?.children) {
      elements = designData.data.pages[0].children
      canvasWidth = designData.data.width || 1024
      canvasHeight = designData.data.height || 1024
      console.log('✅ Found elements in data.pages[0].children:', elements.length)
    } else if (designData?.data?.children) {
      elements = designData.data.children
      canvasWidth = designData.data.width || 1024
      canvasHeight = designData.data.height || 1024
      console.log('✅ Found elements in data.children:', elements.length)
    } 
    // Handle template data structure (templates)
    else if (designData?.content?.polotnoElements) {
      elements = designData.content.polotnoElements
      canvasWidth = designData.content.width || 1024
      canvasHeight = designData.content.height || 1024
      console.log('✅ Found elements in content.polotnoElements:', elements.length)
    }
    // Handle canvas data structure (alternative)
    else if (designData?.canvasData?.pages?.[0]?.children) {
      elements = designData.canvasData.pages[0].children
      canvasWidth = designData.canvasData.width || 1024
      canvasHeight = designData.canvasData.height || 1024
      console.log('✅ Found elements in canvasData.pages[0].children:', elements.length)
    } else if (designData?.canvasData?.children) {
      elements = designData.canvasData.children
      canvasWidth = designData.canvasData.width || 1024
      canvasHeight = designData.canvasData.height || 1024
      console.log('✅ Found elements in canvasData.children:', elements.length)
    } else {
      console.log('⚠️ No canvas elements found in design data')
    }
    
    // Calculate scale to fit preview
    const scaleX = width / canvasWidth
    const scaleY = height / canvasHeight
    const scale = Math.min(scaleX, scaleY)
    
    // Center the content
    const offsetX = (width - canvasWidth * scale) / 2
    const offsetY = (height - canvasHeight * scale) / 2
    
    // Render canvas elements
    if (elements && elements.length > 0) {
      console.log('🎯 Rendering', elements.length, 'canvas elements')
      for (const element of elements) {
        await renderCanvasElement(ctx, element, scale, offsetX, offsetY)
      }
    } else {
      // Show placeholder for empty canvas
      ctx.fillStyle = '#f9fafb'
      ctx.fillRect(20, 20, width - 40, height - 40)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 2
      ctx.strokeRect(20, 20, width - 40, height - 40)
      
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('No Canvas Elements', width / 2, height / 2)
    }
    
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/png')
    console.log('✅ Preview generated successfully')
    return dataUrl
    
  } catch (error) {
    console.error('❌ Error generating Vite preview:', error)
    throw error
  }
}

/**
 * Render a single canvas element
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} element - Canvas element to render
 * @param {number} scale - Scale factor
 * @param {number} offsetX - X offset
 * @param {number} offsetY - Y offset
 */
async function renderCanvasElement(ctx, element, scale, offsetX, offsetY) {
  if (!element.visible) return
  
  const x = (element.x || 0) * scale + offsetX
  const y = (element.y || 0) * scale + offsetY
  const width = (element.width || 0) * scale
  const height = (element.height || 0) * scale
  
  ctx.save()
  
  // Apply opacity
  if (element.opacity !== undefined) {
    ctx.globalAlpha = element.opacity
  }
  
  // Apply rotation
  if (element.rotation) {
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate((element.rotation * Math.PI) / 180)
    ctx.translate(-width / 2, -height / 2)
  } else {
    ctx.translate(x, y)
  }
  
  try {
    switch (element.type) {
      case 'text':
        await renderTextElement(ctx, element, width, height)
        break
      case 'image':
      case 'svg':
        await renderImageElement(ctx, element, width, height)
        break
      case 'figure':
        if (element.subType === 'rect') {
          renderRectangleElement(ctx, element, width, height)
        } else if (element.subType === 'circle') {
          renderCircleElement(ctx, element, width, height)
        }
        break
      case 'line':
        renderLineElement(ctx, element, width, height)
        break
      default:
        console.log('🔶 Unknown element type:', element.type)
    }
  } catch (error) {
    console.error('Error rendering element:', element.type, error)
  }
  
  ctx.restore()
}

/**
 * Render text element
 */
async function renderTextElement(ctx, element, width, height) {
  const text = element.text || 'Text'
  const fontSize = (element.fontSize || 16) * 0.8
  const fontFamily = element.fontFamily || 'Arial'
  
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = element.fill || '#000000'
  ctx.textAlign = element.align || 'left'
  
  const lines = wrapText(ctx, text, width)
  const lineHeight = fontSize * 1.2
  
  lines.forEach((line, index) => {
    ctx.fillText(line, 0, fontSize + index * lineHeight)
  })
}

/**
 * Render image/svg element
 */
async function renderImageElement(ctx, element, width, height) {
  if (!element.src) return
  
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = element.src
    })
    
    ctx.drawImage(img, 0, 0, width, height)
  } catch (error) {
    // Fallback for failed images
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#d1d5db'
    ctx.strokeRect(0, 0, width, height)
    
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Image', width / 2, height / 2)
  }
}

/**
 * Render rectangle element
 */
function renderRectangleElement(ctx, element, width, height) {
  if (element.fill) {
    ctx.fillStyle = element.fill
    if (element.cornerRadius) {
      roundRect(ctx, 0, 0, width, height, element.cornerRadius)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, width, height)
    }
  }
  
  if (element.stroke && element.strokeWidth > 0) {
    ctx.strokeStyle = element.stroke
    ctx.lineWidth = element.strokeWidth
    if (element.cornerRadius) {
      roundRect(ctx, 0, 0, width, height, element.cornerRadius)
      ctx.stroke()
    } else {
      ctx.strokeRect(0, 0, width, height)
    }
  }
}

/**
 * Render circle element
 */
function renderCircleElement(ctx, element, width, height) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2
  
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  
  if (element.fill) {
    ctx.fillStyle = element.fill
    ctx.fill()
  }
  
  if (element.stroke && element.strokeWidth > 0) {
    ctx.strokeStyle = element.stroke
    ctx.lineWidth = element.strokeWidth
    ctx.stroke()
  }
}

/**
 * Render line element
 */
function renderLineElement(ctx, element, width, height) {
  ctx.beginPath()
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  
  ctx.strokeStyle = element.color || element.stroke || '#000000'
  ctx.lineWidth = element.strokeWidth || 1
  ctx.stroke()
}

/**
 * Helper function to wrap text
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let currentLine = words[0]
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}

/**
 * Helper function to draw rounded rectangle
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Generate preview for multiple designs in batch
 * @param {Array} designs - Array of design objects
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of preview data URLs
 */
export async function generateBatchPreviews(designs, onProgress) {
  const results = []
  
  for (let i = 0; i < designs.length; i++) {
    const design = designs[i]
    try {
      const preview = await generateVitePreview(design)
      results.push({ id: design.id, preview })
      
      if (onProgress) {
        onProgress(i + 1, designs.length, design.name)
      }
    } catch (error) {
      console.error(`Failed to generate preview for design ${design.name}:`, error)
      results.push({ id: design.id, preview: null })
    }
    
    // Small delay to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  return results
}

/**
 * Generate batch previews by design IDs
 * @param {Array} designIds - Array of design IDs
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} - Array of preview data URLs
 */
export async function generateBatchPreviewsByIds(designIds, onProgress) {
  const results = []
  
  for (let i = 0; i < designIds.length; i++) {
    const designId = designIds[i]
    try {
      const preview = await generateVitePreviewById(designId)
      results.push({ id: designId, preview })
      
      if (onProgress) {
        onProgress(i + 1, designIds.length, `Design ${designId}`)
      }
    } catch (error) {
      console.error(`Failed to generate preview for design ID ${designId}:`, error)
      results.push({ id: designId, preview: null })
    }
    
    // Small delay to prevent blocking
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  return results
}