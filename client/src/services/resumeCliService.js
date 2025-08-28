export const AVAILABLE_THEMES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'A modern theme with contemporary design elements and professional layout',
    package: 'jsonresume-theme-modern'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'A clean, minimalist theme with elegant typography and simple design',
    package: 'jsonresume-theme-minimalist'
  }
];

/**
 * Get list of available themes
 * @returns {Array} Array of theme objects
 */
export function getAvailableThemes() {
  return AVAILABLE_THEMES;
}

/**
 * Create a JSON Resume file from user data (browser version)
 * @param {Object} resumeData - The resume data in JSON Resume format
 * @param {string} filename - The filename to save (default: 'resume.json')
 * @returns {Promise<string>} JSON string representation
 */
export async function createResumeFile(resumeData, filename = 'resume.json') {
  try {
    // In browser environment, return JSON string instead of writing to file
    return JSON.stringify(resumeData, null, 2);
  } catch (error) {
    console.error('Error creating resume file:', error);
    throw new Error('Failed to create resume file');
  }
}

/**
 * Generate HTML from JSON Resume data using a specific theme (browser version)
 * Note: This is a placeholder for browser environment
 * @param {Object} resumeData - The resume data in JSON Resume format
 * @param {string} themeId - The theme ID to use
 * @returns {Promise<string>} Generated HTML content
 */
export async function generateResumeHTML(resumeData, themeId = 'modern') {
  // In browser environment, we can't use resume-cli directly
  // This would need to be implemented with a backend API call
  console.warn('generateResumeHTML: This function requires backend implementation');
  return `<html><body><h1>${resumeData.basics?.name || 'Resume'}</h1><p>Theme: ${themeId}</p></body></html>`;
}

/**
 * Generate PDF from JSON Resume data using a specific theme (browser version)
 * Note: This is a placeholder for browser environment
 * @param {Object} resumeData - The resume data in JSON Resume format
 * @param {string} themeId - The theme ID to use
 * @returns {Promise<Blob>} Generated PDF blob
 */
export async function generateResumePDF(resumeData, themeId = 'modern') {
  // In browser environment, we can't use resume-cli directly
  // This would need to be implemented with a backend API call
  console.warn('generateResumePDF: This function requires backend implementation');
  throw new Error('PDF generation not available in browser environment');
}

/**
 * Validate JSON Resume data against the schema (browser version)
 * @param {Object} resumeData - The resume data to validate
 * @returns {Promise<boolean>} True if valid, throws error if invalid
 */
export async function validateResumeData(resumeData) {
  try {
    // Basic validation - check required fields
    if (!resumeData.basics || !resumeData.basics.name || !resumeData.basics.email) {
      throw new Error('Missing required fields: name and email are required');
    }
    return true;
  } catch (error) {
    console.error('Resume validation failed:', error);
    throw new Error('Resume data is not valid according to JSON Resume schema');
  }
}

/**
 * Convert our internal resume format to JSON Resume format
 * @param {Object} internalData - Our internal resume data format
 * @returns {Object} JSON Resume formatted data
 */
export function convertToJsonResumeFormat(internalData) {
  return {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: internalData.basics?.name || '',
      label: internalData.basics?.label || '',
      image: internalData.basics?.image || '',
      email: internalData.basics?.email || '',
      phone: internalData.basics?.phone || '',
      url: internalData.basics?.url || '',
      summary: internalData.basics?.summary || '',
      location: {
        address: internalData.basics?.location?.address || '',
        postalCode: internalData.basics?.location?.postalCode || '',
        city: internalData.basics?.location?.city || '',
        countryCode: internalData.basics?.location?.countryCode || '',
        region: internalData.basics?.location?.region || ''
      },
      profiles: internalData.basics?.profiles || []
    },
    work: internalData.work?.map(job => ({
      name: job.company || '',
      location: job.location || '',
      description: job.description || '',
      position: job.position || '',
      url: job.url || '',
      startDate: job.startDate || '',
      endDate: job.endDate || '',
      summary: job.summary || '',
      highlights: job.highlights || []
    })) || [],
    volunteer: internalData.volunteer || [],
    education: internalData.education?.map(edu => ({
      institution: edu.institution || '',
      area: edu.area || '',
      studyType: edu.studyType || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa || '',
      courses: edu.courses || []
    })) || [],
    awards: internalData.awards || [],
    publications: internalData.publications || [],
    skills: internalData.skills?.map(skill => ({
      name: skill.name || '',
      level: skill.level || '',
      keywords: Array.isArray(skill.keywords) ? skill.keywords : 
                (skill.keywords ? skill.keywords.split(',').map(k => k.trim()) : [])
    })) || [],
    languages: internalData.languages || [],
    interests: internalData.interests || [],
    references: internalData.references || [],
    projects: internalData.projects || []
  };
}