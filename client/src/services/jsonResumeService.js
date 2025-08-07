// src/services/jsonResumeService.js
// Service for handling JSON Resume data in the editor

import { getSampleJsonResume, convertJsonResumeToPolotno } from '@/utils/jsonResume.js';
import { getJsonResumeTemplateById } from '@/api/templates.js';

/**
 * Extracts JSON Resume data from a design's data
 * @param {Object} designData - The design data object
 * @returns {Object|null} - The JSON Resume data or null if not found
 */
export function extractJsonResumeData(designData) {
  if (!designData) return null;
  
  try {
    // If the data is a string, parse it
    const data = typeof designData === 'string' ? JSON.parse(designData) : designData;
    
    // Check if this is a JSON Resume design
    if (data.jsonResume) {
      return data.jsonResume;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting JSON Resume data:', error);
    return null;
  }
}

/**
 * Updates JSON Resume data in a design
 * @param {Object} designData - The design data object
 * @param {Object} jsonResumeData - The updated JSON Resume data
 * @returns {Object} - The updated design data
 */
export function updateJsonResumeData(designData, jsonResumeData) {
  if (!designData) return null;
  
  try {
    // If the data is a string, parse it
    const data = typeof designData === 'string' ? JSON.parse(designData) : designData;
    
    // Check if this is a JSON Resume design
    if (data.jsonResume) {
      // Update the JSON Resume data
      data.jsonResume = jsonResumeData;
      
      // Update the Polotno elements based on the new data
      const polotnoData = convertJsonResumeToPolotno(jsonResumeData);
      data.polotnoElements = polotnoData.elements;
      
      return data;
    }
    
    return designData;
  } catch (error) {
    console.error('Error updating JSON Resume data:', error);
    return designData;
  }
}

/**
 * Creates a new design with JSON Resume data
 * @param {string} themeName - The name of the JSON Resume theme
 * @returns {Object} - A new design object with JSON Resume data
 */
export function createJsonResumeDesign(jsonResumeData = null, themeName = 'modern') {
  // Use provided data or fall back to sample data
  const resumeData = jsonResumeData || getSampleJsonResume();
  
  // Convert to Polotno-compatible format
  const polotnoData = convertJsonResumeToPolotno(resumeData);
  
  // Create a design with the JSON Resume data
  return {
    jsonResume: resumeData,
    polotnoElements: polotnoData.elements,
    theme: themeName
  };
}

/**
 * Checks if a design is a JSON Resume design
 * @param {Object} designData - The design data object
 * @returns {boolean} - True if the design is a JSON Resume design
 */
export function isJsonResumeDesign(designData) {
  return extractJsonResumeData(designData) !== null;
}

/**
 * Gets the theme of a JSON Resume design
 * @param {Object} designData - The design data object
 * @returns {string|null} - The theme name or null if not found
 */
export function getJsonResumeTheme(designData) {
  if (!designData) return null;
  
  try {
    // If the data is a string, parse it
    const data = typeof designData === 'string' ? JSON.parse(designData) : designData;
    
    // Check if this is a JSON Resume design
    if (data.jsonResume && data.theme) {
      return data.theme;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting JSON Resume theme:', error);
    return null;
  }
}

/**
 * Gets JSON Resume template data by ID
 * @param {number} templateId - The template ID
 * @returns {Promise<Object|null>} - The template data or null if not found
 */
export async function getJsonResumeTemplateData(templateId) {
  try {
    const template = await getJsonResumeTemplateById(templateId);
    if (template && template.content) {
      return template.content;
    }
    return null;
  } catch (error) {
    console.error('Error fetching JSON Resume template:', error);
    return null;
  }
}

/**
 * Creates a design from a JSON Resume template
 * @param {number} templateId - The template ID
 * @returns {Promise<Object|null>} - The design data or null if failed
 */
export async function createDesignFromJsonResumeTemplate(templateId) {
  try {
    const templateData = await getJsonResumeTemplateData(templateId);
    if (!templateData) {
      throw new Error('Template not found');
    }
    
    return {
      jsonResume: templateData.jsonResume,
      polotnoElements: templateData.polotnoElements,
      theme: templateData.theme,
      templateId: templateId
    };
  } catch (error) {
    console.error('Error creating design from JSON Resume template:', error);
    return null;
  }
}