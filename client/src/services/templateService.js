// src/services/templateService.js
// Service for handling template operations with media files

import { uploadTemplateWithMedia, getAllTemplates, getTemplateById } from '@/api/templates.js'

/**
 * Get default width based on template category
 * @param {string} category - Template category
 * @returns {number} Default width
 */
export function getDefaultWidth(category) {
  const defaults = {
    'business-card': 241,
    'card': 241,
    'visit-card': 241,
    'portfolio': 1024,
    'creative': 1024,
    'professional': 595,
    'resume': 595,
    'cv': 595
  }
  return defaults[category] || 595 // A4 width as default
}

/**
 * Get default height based on template category
 * @param {string} category - Template category
 * @returns {number} Default height
 */
export function getDefaultHeight(category) {
  const defaults = {
    'business-card': 156,
    'card': 156,
    'visit-card': 156,
    'portfolio': 768,
    'creative': 768,
    'professional': 842,
    'resume': 842,
    'cv': 842
  }
  return defaults[category] || 842 // A4 height as default
}

/**
 * Upload a custom template with media files
 * @param {Object} templateData - Template information
 * @param {Array} mediaFiles - Array of File objects
 * @param {Object} designData - Optional design JSON data
 * @returns {Promise<Object>} Upload result
 */
export async function uploadCustomTemplate(templateData, mediaFiles = [], designData = null) {
  try {
    // Create FormData for multipart upload
    const formData = new FormData()

    // Add template metadata
    formData.append('name', templateData.name || 'Custom Template')
    formData.append('description', templateData.description || '')
    formData.append('category', templateData.category || 'custom')
    formData.append('type', templateData.type || 'design')
    formData.append('theme', templateData.theme || '')
    formData.append('public', templateData.public || true)

    // Add design data if provided
    if (designData) {
      formData.append('templateData', JSON.stringify(designData))
    }

    // Add media files
    mediaFiles.forEach((file, index) => {
      formData.append('media', file)
    })

    // Upload template
    const result = await uploadTemplateWithMedia(formData)
    return result

  } catch (error) {
    console.error('Template upload error:', error)
    throw new Error(`Failed to upload template: ${error.message}`)
  }
}

/**
 * Get all available templates with optional filtering
 * @param {Object} filters - Optional filters (type, category, public)
 * @returns {Promise<Array>} Array of templates
 */
export async function getAvailableTemplates(filters = {}) {
  try {
    const templates = await getAllTemplates()

    // Apply filters if provided
    let filteredTemplates = templates

    if (filters.type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === filters.type)
    }

    if (filters.category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === filters.category)
    }

    if (filters.public !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.public === filters.public)
    }

    return filteredTemplates

  } catch (error) {
    console.error('Error fetching templates:', error)
    throw new Error(`Failed to fetch templates: ${error.message}`)
  }
}

/**
 * Load a template with its media files
 * @param {number} templateId - Template ID
 * @returns {Promise<Object>} Template data with media URLs
 */
export async function loadTemplateWithMedia(templateId) {
  try {
    const template = await getTemplateById(templateId)

    if (!template) {
      throw new Error('Template not found')
    }

    // Process media files to create accessible URLs
    if (template.content && template.content.mediaFiles) {
      template.content.mediaFiles = template.content.mediaFiles.map(file => ({
        ...file,
        url: `/uploads/${file.filename}`, // Create accessible URL
        previewUrl: file.mimetype.startsWith('image/') ? `/uploads/${file.filename}` : null
      }))
    }

    return template

  } catch (error) {
    console.error('Error loading template:', error)
    throw new Error(`Failed to load template: ${error.message}`)
  }
}

/**
 * Create a design from a template with uploaded media
 * @param {Object} template - Template data
 * @param {Object} customizations - Optional customizations
 * @returns {Object} Design data ready for editor
 */
export function createDesignFromTemplate(template, customizations = {}) {
  try {
    // Handle width and height - convert "auto" to numeric values
    let templateWidth = template.content?.width
    let templateHeight = template.content?.height

    // If width/height are "auto" or invalid, use defaults based on template category
    if (templateWidth === "auto" || !templateWidth || isNaN(Number(templateWidth))) {
      templateWidth = getDefaultWidth(template.category)
    }
    if (templateHeight === "auto" || !templateHeight || isNaN(Number(templateHeight))) {
      templateHeight = getDefaultHeight(template.category)
    }

    const designData = {
      name: customizations.name || `${template.name} - Copy`,
      width: customizations.width || Number(templateWidth) || 595,
      height: customizations.height || Number(templateHeight) || 842,
      elements: [],
      mediaFiles: []
    }

    // Process template content
    if (template.content) {
      // Add template elements with unique identifiers to differentiate from template
      if (template.content.polotnoElements) {
        const elements = Array.isArray(template.content.polotnoElements)
          ? template.content.polotnoElements
          : []

        // Add unique identifiers and timestamp to each element to ensure different previews
        designData.elements = elements.map((element, index) => ({
          ...element,
          id: `design-${Date.now()}-${index}`, // Unique ID based on timestamp
          createdFromTemplate: template.id || template.name, // Track template source
          createdAt: new Date().toISOString() // Creation timestamp
        }))
      }

      // Add media files with accessible URLs
      if (template.content.mediaFiles) {
        designData.mediaFiles = template.content.mediaFiles.map(file => ({
          ...file,
          url: `/uploads/${file.filename}`
        }))
      }

      // Add JSON Resume data if available
      if (template.content.jsonResume) {
        designData.jsonResume = template.content.jsonResume
        designData.theme = template.theme
      }
    }

    return designData

  } catch (error) {
    console.error('Error creating design from template:', error)
    throw new Error(`Failed to create design from template: ${error.message}`)
  }
}

/**
 * Validate uploaded files
 * @param {Array} files - Array of File objects
 * @returns {Object} Validation result
 */
export function validateUploadedFiles(files) {
  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'application/json',
    'text/plain'
  ]

  const validFiles = []
  const errors = []

  files.forEach((file, index) => {
    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File "${file.name}" is too large (max 10MB)`)
      return
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File "${file.name}" has unsupported type (${file.type})`)
      return
    }

    validFiles.push(file)
  })

  return {
    validFiles,
    errors,
    isValid: errors.length === 0
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Generate preview data for a template
 * @param {Object} template - Template data
 * @returns {Object} Preview data
 */


/**
 * Export template data for sharing
 * @param {Object} template - Template data
 * @returns {Object} Exportable template data
 */

/**
 * Import template data
 * @param {Object} templateData - Imported template data
 * @returns {Object} Processed template data
 */
export function importTemplate(templateData) {
  // Validate required fields
  if (!templateData.name) {
    throw new Error('Template name is required')
  }

  if (!templateData.content) {
    throw new Error('Template content is required')
  }

  return {
    name: templateData.name,
    description: templateData.description || '',
    category: templateData.category || 'imported',
    type: templateData.type || 'design',
    theme: templateData.theme || '',
    content: templateData.content,
    public: true // Imported templates are public by default so all users can see them
  }
}
