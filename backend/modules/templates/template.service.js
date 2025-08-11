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
      
      const sampleTemplates = [
        {
          name: 'Modern Resume',
          description: 'A clean and modern resume template',
          category: 'resume',
          content: null,
          preview: {
            width: 794,
            height: 1123,
            polotnoElements: [
              {
                type: 'text',
                x: 50,
                y: 50,
                width: 300,
                height: 40,
                text: 'John Doe',
                fontSize: 32,
                fontFamily: 'Arial',
                fill: '#2c3e50',
                fontWeight: 'bold'
              },
              {
                type: 'text',
                x: 50,
                y: 100,
                width: 300,
                height: 20,
                text: 'Software Developer',
                fontSize: 18,
                fontFamily: 'Arial',
                fill: '#7f8c8d'
              },
              {
                type: 'text',
                x: 50,
                y: 150,
                width: 500,
                height: 100,
                text: 'Experienced software developer with expertise in web technologies and modern frameworks.',
                fontSize: 14,
                fontFamily: 'Arial',
                fill: '#34495e'
              }
            ]
          },
          isPublic: true
        },
        {
          name: 'Minimalist Resume',
          description: 'A simple and elegant resume template',
          category: 'resume',
          content: {
            width: 794,
            height: 1123,
            polotnoElements: [
              {
                type: 'text',
                x: 100,
                y: 100,
                width: 400,
                height: 30,
                text: 'Jane Smith',
                fontSize: 28,
                fontFamily: 'Helvetica',
                fill: '#000000'
              },
              {
                type: 'text',
                x: 100,
                y: 140,
                width: 400,
                height: 20,
                text: 'UX Designer',
                fontSize: 16,
                fontFamily: 'Helvetica',
                fill: '#666666'
              },
              {
                type: 'line',
                x: 100,
                y: 170,
                width: 400,
                height: 1,
                fill: '#cccccc'
              }
            ]
          },
          isPublic: true
        },
        {
          name: 'Business Card',
          description: 'Professional business card template',
          category: 'business',
          content: {
            width: 350,
            height: 200,
            polotnoElements: [
              {
                type: 'text',
                x: 20,
                y: 20,
                width: 200,
                height: 25,
                text: 'Your Name',
                fontSize: 20,
                fontFamily: 'Arial',
                fill: '#2c3e50',
                fontWeight: 'bold'
              },
              {
                type: 'text',
                x: 20,
                y: 50,
                width: 200,
                height: 18,
                text: 'Your Title',
                fontSize: 14,
                fontFamily: 'Arial',
                fill: '#7f8c8d'
              },
              {
                type: 'text',
                x: 20,
                y: 120,
                width: 200,
                height: 15,
                text: 'email@example.com',
                fontSize: 12,
                fontFamily: 'Arial',
                fill: '#34495e'
              }
            ]
          },
          isPublic: true
        }
      ];
      
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