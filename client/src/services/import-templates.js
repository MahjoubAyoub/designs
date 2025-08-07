// Script to import template JSON files into the database
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/templates';

// Template files to import
const templateFiles = [
  'Modern Resume.json',
  'Minimalist Resume.json',
  'Modern.json',
  'Minimalist.json'
];

// Function to create a template via API
async function createTemplate(templateData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

// Function to import a single template file
async function importTemplateFile(filename) {
  try {
    console.log(`Importing ${filename}...`);
    
    // Read the JSON file
    const filePath = path.join(process.cwd(), filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Extract template name from filename
    const templateName = filename.replace('.json', '');
    
    // Prepare template data
    const templateData = {
      name: templateName,
      description: `Professional ${templateName.toLowerCase()} template`,
      category: 'professional',
      type: 'design',
      theme: '',
      public: true,
      content: {
        polotnoElements: jsonData.pages?.[0]?.children || jsonData.children || [],
        width: jsonData.pages?.[0]?.width || jsonData.width || 595,
        height: jsonData.pages?.[0]?.height || jsonData.height || 842,
        jsonResume: jsonData.jsonResume || null
      },
      userId: 17 // Using the existing user ID from the API response
    };
    
    // Create the template
    const result = await createTemplate(templateData);
    console.log(`✅ Successfully imported ${filename} with ID: ${result.id}`);
    
  } catch (error) {
    console.error(`❌ Failed to import ${filename}:`, error.message);
  }
}

// Main function to import all templates
async function importAllTemplates() {
  console.log('Starting template import process...');
  
  for (const filename of templateFiles) {
    await importTemplateFile(filename);
    // Add a small delay between imports
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Template import process completed!');
}

// Run the import
importAllTemplates().catch(console.error);