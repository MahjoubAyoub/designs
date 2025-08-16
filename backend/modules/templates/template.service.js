import { AppDataSource } from '../../config/data-source.js';
import Template from './template.entity.js';

/**
 * Initialize sample templates if none exist
 */
export async function initializeSampleTemplates() {
  try {
    const templateRepo = AppDataSource.getRepository(Template);
    const existingTemplates = await templateRepo.count();
    
    if (existingTemplates === 0) {
      console.log('🎨 Creating sample templates...');
      
      
      
      for (const templateData of sampleTemplates) {
        const template = templateRepo.create(templateData);
        await templateRepo.save(template);
      }
      
      console.log(`✅ Created ${sampleTemplates.length} sample templates`);
    } else {
      console.log(`ℹ️ Found ${existingTemplates} existing templates, skipping initialization`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize sample templates:', error);
  }
}