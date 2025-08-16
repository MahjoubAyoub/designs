// Debug script to test preview generation
import { generatePolotnoPreviewFromData, generatePolotnoPreviewById } from '@/services/polotnoPreviewService.js';
import { getAllDesigns } from '@/api/designs.js';
import { getAllTemplates } from '@/api/templates.js';

/**
 * Test preview generation with actual data from the database
 */
export async function debugPreviewGeneration() {
  console.log('🔧 Starting preview generation debug...');
  
  try {
    // Test with designs
    console.log('📋 Fetching designs...');
    const designs = await getAllDesigns();
    console.log('📋 Found', designs.length, 'designs');
    
    if (designs.length > 0) {
      const firstDesign = designs[0];
      console.log('🎯 Testing with first design:', firstDesign.name);
      
      try {
        const preview = await generatePolotnoPreviewById(firstDesign.id);
        console.log('✅ Design preview generated successfully');
      } catch (error) {
        console.error('❌ Design preview failed:', error);
      }
    }
    
    // Test with templates
    console.log('📄 Fetching templates...');
    const templates = await getAllTemplates();
    console.log('📄 Found', templates.length, 'templates');
    
    if (templates.length > 0) {
      const firstTemplate = templates[0];
      console.log('🎨 Testing with first template:', firstTemplate.name);
      
      try {
        const preview = await generatePolotnoPreviewFromData(firstTemplate);
        console.log('✅ Template preview generated successfully');
      } catch (error) {
        console.error('❌ Template preview failed:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Auto-run debug when this module is imported
if (typeof window !== 'undefined') {
  window.debugPreviewGeneration = debugPreviewGeneration;
  console.log('🔧 Preview debug function available as window.debugPreviewGeneration()');
}