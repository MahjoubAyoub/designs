<template>
  <BuilderHeader
    v-model:name="designName"
    :public="isPublic.value"
    :onSave="saveDesignHandler"
    @update:public="handlePublicChange"
  />
  <div ref="container" class="w-full h-screen" />
  <JsonResumeEditor
    v-if="designData"
    :designData="designData"
    :onUpdate="handleJsonResumeUpdate"
  />
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { renderPolotnoEditor } from './renderPolotnoEditor.js'
import { saveDesign, getDesignById } from '@/api/designs.js'
import BuilderHeader from './BuilderHeader.vue'
import JsonResumeEditor from '@/components/organisms/builder/JsonResumeEditor.vue'
import { generatePolotnoPreviewById } from '@/services/polotnoPreviewService.js'

const container = ref(null)
const route = useRoute()
const designName = ref('Untitled Design')
const isPublic = ref(false)
// If a name is provided in the query (from NewTemplates), use it as initial value
if (route.query.name) {
  designName.value = route.query.name;
}
// If public is provided in the query, use it
if (route.query.public !== undefined) {
  isPublic.value = route.query.public === 'true' || route.query.public === true;
}
// Handle public/private switcher
import { setDesignPublic } from '@/api/designs.js'
async function handlePublicChange(val) {
  isPublic.value = val;
  if (designId) {
    try {
      await setDesignPublic(designId, val);
    } catch (e) {
      alert('Failed to update public status');
    }
  }
}

let polotnoStore = null
let designId = null // Track the current design id for updates
const designData = ref(null) // Store the current design data for JsonResumeEditor

// Data sanitization utility to fix null values in Polotno data
function sanitizePolotnoData(data) {
  if (!data || typeof data !== 'object') return data;

  // Deep clone to avoid mutating original data
  const sanitized = JSON.parse(JSON.stringify(data));

  // Sanitize pages and their children
  if (sanitized.pages && Array.isArray(sanitized.pages)) {
    sanitized.pages.forEach(page => {
      if (page.children && Array.isArray(page.children)) {
        page.children.forEach(child => {
          // Fix common null value issues
          if (child.text === null || child.text === undefined) {
            child.text = '';
          }
          if (child.fontFamily === null || child.fontFamily === undefined) {
            child.fontFamily = 'Arial';
          }
          if (child.fill === null || child.fill === undefined) {
            child.fill = '#000000';
          }
          if (child.src === null || child.src === undefined) {
            delete child.src; // Remove null src properties
          }
          // Ensure numeric properties are numbers, not null or strings
          ['x', 'y', 'width', 'height', 'fontSize', 'rotation', 'scaleX', 'scaleY'].forEach(prop => {
            if (child[prop] === null || child[prop] === undefined) {
              if (prop === 'fontSize') child[prop] = 16;
              else if (['scaleX', 'scaleY'].includes(prop)) child[prop] = 1;
              else if (prop === 'rotation') child[prop] = 0;
              else child[prop] = 0;
            } else if (typeof child[prop] === 'string') {
              // Convert string to number
              const numValue = parseFloat(child[prop]);
              if (!isNaN(numValue)) {
                child[prop] = numValue;
              } else {
                // Fallback to default values if string is not a valid number
                if (prop === 'fontSize') child[prop] = 16;
                else if (['scaleX', 'scaleY'].includes(prop)) child[prop] = 1;
                else if (prop === 'rotation') child[prop] = 0;
                else child[prop] = 0;
              }
            } else if (isNaN(child[prop])) {
              // Handle other non-numeric values
              if (prop === 'fontSize') child[prop] = 16;
              else if (['scaleX', 'scaleY'].includes(prop)) child[prop] = 1;
              else if (prop === 'rotation') child[prop] = 0;
              else child[prop] = 0;
            }
          });
        });
      }
    });
  }

  return sanitized;
}

// Image compression utility for large payloads
function compressImageInElements(elements, maxWidth = 200, maxHeight = 200, quality = 0.5) {
  return elements.map(element => {
    if (element.type === 'image' && element.src && element.src.startsWith('data:')) {
      // Check if this is a very large base64 image (likely AI-generated)
      const isLargeImage = element.src.length > 500000; // 500KB base64 string

      // Use more aggressive compression for large images
      const targetMaxWidth = isLargeImage ? 150 : maxWidth;
      const targetMaxHeight = isLargeImage ? 150 : maxHeight;
      const targetQuality = isLargeImage ? 0.3 : quality;

      // Create a canvas to compress the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          let { width, height } = img;

          // More aggressive compression for large images
          if (width > height) {
            if (width > targetMaxWidth) {
              height = (height * targetMaxWidth) / width;
              width = targetMaxWidth;
            }
          } else {
            if (height > targetMaxHeight) {
              width = (width * targetMaxHeight) / height;
              height = targetMaxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const compressedSrc = canvas.toDataURL('image/jpeg', targetQuality);
          console.log(`Compressed image from ${element.src.length} to ${compressedSrc.length} bytes`);
          resolve({ ...element, src: compressedSrc });
        };

        img.onerror = () => {
          // If image fails to load, return element without src
          console.warn('Failed to load image for compression, removing src');
          resolve({ ...element, src: '' });
        };

        img.src = element.src;
      });
    }
    return Promise.resolve(element);
  });
}

// Save Design button handler: sends JSON to backend /api/designs/save
async function saveDesignHandler() {
  if (!polotnoStore) return;
  console.log('💾 Manual save triggered for design:', designName.value);

  try {
    const json = polotnoStore.toJSON();
    console.log('💾 Manual save - polotno JSON:', json);
    console.log('💾 Manual save - JSON structure:', JSON.stringify(json, null, 2));

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Prepare the data for saving - create a deep copy to avoid read-only property errors
    let dataToSave = JSON.parse(JSON.stringify(json));

    // If this is a JSON Resume design
    if (designData.value && designData.value.jsonResume) {
      // Update the polotnoElements in the existing data
      dataToSave = {
        ...JSON.parse(JSON.stringify(designData.value)),
        polotnoElements: JSON.parse(JSON.stringify(json))
      };
    }

    let payload = {
      id: designId,
      name: designName.value,
      data: dataToSave,
      userId: user.id,
    };

    // Proactively compress AI-generated images before size check
    const hasLargeImages = (elements) => {
      return elements.some(el => el.type === 'image' && el.src && el.src.startsWith('data:') && el.src.length > 500000);
    };

    let needsCompression = false;
    if (dataToSave.pages && dataToSave.pages[0] && dataToSave.pages[0].children) {
      needsCompression = hasLargeImages(dataToSave.pages[0].children);
    } else if (dataToSave.children) {
      needsCompression = hasLargeImages(dataToSave.children);
    }

    // Compress large images proactively
    if (needsCompression) {
      console.warn('Large AI-generated images detected, compressing proactively');
      if (dataToSave.pages && dataToSave.pages[0] && dataToSave.pages[0].children) {
        const compressedElements = await Promise.all(
          compressImageInElements(dataToSave.pages[0].children, 150, 150, 0.3)
        );
        dataToSave.pages[0].children = compressedElements;
      } else if (dataToSave.children) {
        const compressedElements = await Promise.all(
          compressImageInElements(dataToSave.children, 150, 150, 0.3)
        );
        dataToSave.children = compressedElements;
      }
      payload.data = dataToSave;
    }

    // Check payload size and optimize if needed
     const payloadSize = JSON.stringify(payload).length;
     console.log('Payload size:', payloadSize, 'bytes');

     // If payload is still too large (> 10MB), try to compress images further
     if (payloadSize > 10 * 1024 * 1024) {
       console.warn('Payload still too large, attempting additional compression');

       // Find and compress images in the design
       if (dataToSave.pages && dataToSave.pages[0] && dataToSave.pages[0].children) {
         const compressedElements = await Promise.all(
           compressImageInElements(dataToSave.pages[0].children)
         );
         dataToSave.pages[0].children = compressedElements;
       } else if (dataToSave.children) {
         const compressedElements = await Promise.all(
           compressImageInElements(dataToSave.children)
         );
         dataToSave.children = compressedElements;
       }

       payload.data = dataToSave;

       const newPayloadSize = JSON.stringify(payload).length;
       console.log('Compressed payload size:', newPayloadSize, 'bytes');

       // If still too large after compression, remove images entirely
       if (newPayloadSize > 10 * 1024 * 1024) {
         console.warn('Still too large after compression, removing all images');
         if (dataToSave.pages && dataToSave.pages[0] && dataToSave.pages[0].children) {
           dataToSave.pages[0].children = dataToSave.pages[0].children.filter(el => el.type !== 'image');
         } else if (dataToSave.children) {
           dataToSave.children = dataToSave.children.filter(el => el.type !== 'image');
         }
         payload.data = dataToSave;
         console.log('Final payload size without images:', JSON.stringify(payload).length, 'bytes');
       }
     }

    const res = await saveDesign(payload);
    if (res && res.data && res.data.id) {
      designId = res.data.id;
      
      // Generate preview for the saved design
      try {
        const previewDataUrl = await generatePolotnoPreviewById(res.data.id, 400, 300);
        if (previewDataUrl) {
          // Update the design with the generated preview
          const updateData = {
            id: res.data.id,
            name: designName.value,
            data: dataToSave,
            imageUrl: previewDataUrl,
            userId: payload.userId
          };
          await saveDesign(updateData);
          console.log(`✓ Preview generated for design: ${designName.value}`);
        }
      } catch (previewError) {
        console.error('Failed to generate preview for saved design:', previewError);
        // Don't block the save process if preview generation fails
      }
    }

    // Update designData for JsonResumeEditor
     designData.value = dataToSave;

     // Check if images were removed and notify user
     const finalPayloadSize = JSON.stringify(payload).length;
     if (payloadSize > 10 * 1024 * 1024 && finalPayloadSize < payloadSize * 0.8) {
       alert('Design saved! Note: Some images were compressed or removed due to size limitations.');
     } else {
       alert('Design saved!');
     }
  } catch (err) {
    console.error('Failed to save design:', err);

    // If it's a 413 error, try removing images entirely
    if (err.message.includes('413') || err.message.includes('Payload Too Large')) {
      try {
        console.warn('Retrying without images due to payload size');

        const json = polotnoStore.toJSON();
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Remove all images from the design - create a deep copy to avoid read-only property errors
        let dataToSave = JSON.parse(JSON.stringify(json));
        if (dataToSave.pages && dataToSave.pages[0] && dataToSave.pages[0].children) {
          dataToSave.pages[0].children = dataToSave.pages[0].children.filter(el => el.type !== 'image');
        } else if (dataToSave.children) {
          dataToSave.children = dataToSave.children.filter(el => el.type !== 'image');
        }

        const payload = {
          id: designId,
          name: designName.value,
          data: dataToSave,
          userId: user.id,
        };

        const res = await saveDesign(payload);
        if (res && res.data && res.data.id) {
          designId = res.data.id;
        }

        designData.value = dataToSave;
        alert('Design saved successfully, but images were too large and were removed. You can add them back manually.');
      } catch (retryErr) {
        console.error('Retry failed:', retryErr);
        alert('Failed to save design. Please try reducing image sizes or removing images.');
      }
    } else {
      alert('Failed to save design. Please try again.');
    }
  }
}

// Autosave handler: also uses /api/designs/save
async function autoSaveDesign(json) {
  console.log('🔄 AutoSave triggered with data:', json);
  console.log('🔄 JSON structure:', JSON.stringify(json, null, 2));

  // Check if we have actual content to save
  const hasContent = json && json.pages && json.pages[0] && json.pages[0].children && json.pages[0].children.length > 0;
  console.log('🔄 Has content to save:', hasContent);

  if (!hasContent) {
    console.log('⚠️ No content to save, skipping autosave');
    return;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Prepare the data for saving - create a deep copy to avoid read-only property errors
  let dataToSave = JSON.parse(JSON.stringify(json));

  // If this is a JSON Resume design and we're saving from the Polotno store
  if (designData.value && designData.value.jsonResume && typeof json !== 'object') {
    // We're saving from the Polotno store, so update the polotnoElements in the existing data
    dataToSave = {
      ...JSON.parse(JSON.stringify(designData.value)),
      polotnoElements: JSON.parse(JSON.stringify(json))
    };
  }

  const payload = {
    id: designId,
    name: designName.value,
    data: dataToSave,
    userId: user.id,
  };

  console.log('💾 Saving payload:', JSON.stringify(payload, null, 2));

  const res = await saveDesign(payload);
  if (res && res.data && res.data.id) {
    const isNewDesign = !designId; // Check if this is a new design
    designId = res.data.id;
    
    // Generate preview only for new designs to avoid generating on every autosave
    if (isNewDesign) {
      try {
        const previewDataUrl = await generatePolotnoPreviewById(res.data.id, 400, 300);
        if (previewDataUrl) {
          // Update the design with the generated preview
          const updateData = {
            id: res.data.id,
            name: designName.value,
            data: dataToSave,
            imageUrl: previewDataUrl,
            userId: payload.userId
          };
          await saveDesign(updateData);
          console.log(`✓ Preview generated for new design: ${designName.value}`);
        }
      } catch (previewError) {
        console.error('Failed to generate preview for new design:', previewError);
        // Don't block the autosave process if preview generation fails
      }
    }
  }

  // Update designData for JsonResumeEditor
  designData.value = dataToSave;
}

// Handle updates from JsonResumeEditor
function handleJsonResumeUpdate(updatedData) {
  if (!polotnoStore) return;

  // Update the design data
  designData.value = updatedData;

  // Load the updated Polotno elements into the store
  if (updatedData && updatedData.polotnoElements) {
    // Create a proper structure for the Polotno store
    const polotnoData = {
      pages: [
        {
          id: 'page-1',
          width: parseInt(route.query.width) || 1024,
          height: parseInt(route.query.height) || 1024,
          elements: Array.isArray(updatedData.polotnoElements) ? updatedData.polotnoElements : []
        }
      ]
    };
    polotnoStore.loadJSON(polotnoData);
  } else {
    // Fallback for regular data
    polotnoStore.loadJSON(updatedData);
  }

  // Trigger autosave
  autoSaveDesign(updatedData);
}


onMounted(async () => {
  const width = parseInt(route.query.width) || 1024
  const height = parseInt(route.query.height) || 1024

  // Get designId from route if available
  const currentDesignId = route.params.id || null
  designId = currentDesignId

  polotnoStore = await renderPolotnoEditor(container.value, width, height, { onAutoSave: autoSaveDesign, designId: currentDesignId })

  // If there is a jsonResume query parameter, load it
    if (route.query.jsonResume) {
      try {
        console.log('Found jsonResume query parameter:', route.query.jsonResume);
        const jsonResumeData = JSON.parse(route.query.jsonResume);
        console.log('Parsed jsonResume data:', jsonResumeData);
        designData.value = jsonResumeData;

        // If there are polotnoElements, load them into the store
        if (jsonResumeData.polotnoElements) {
          console.log('Found polotnoElements:', jsonResumeData.polotnoElements);
          console.log('Elements count:', jsonResumeData.polotnoElements.length);
          const polotnoData = {
            pages: [
              {
                id: 'page-1',
                width: width,
                height: height,
                elements: Array.isArray(jsonResumeData.polotnoElements) ? jsonResumeData.polotnoElements : []
              }
            ]
          };
          console.log('Loading polotno data:', polotnoData);

           // Try loading with loadJSON first
           polotnoStore.loadJSON(polotnoData);

           // Add a delay to check if elements are loaded, and if not, add them directly
           setTimeout(() => {
             console.log('After loading - Store pages:', polotnoStore.pages.length);
             console.log('After loading - Active page elements:', polotnoStore.activePage?.children?.length || 0);

             // If loadJSON didn't work, try adding elements directly
             if (polotnoStore.activePage && polotnoStore.activePage.children.length === 0) {
               console.log('loadJSON failed, adding elements directly');
               jsonResumeData.polotnoElements.forEach((element, index) => {
                 console.log(`Adding element ${index}:`, element);
                 try {
                   polotnoStore.activePage.addElement(element);
                 } catch (err) {
                   console.error(`Failed to add element ${index}:`, err);
                 }
               });

               // Check again after direct addition
               setTimeout(() => {
                 console.log('After direct addition - Active page elements:', polotnoStore.activePage?.children?.length || 0);
               }, 500);
             }
           }, 1000);
        } else {
          console.log('No polotnoElements found in jsonResume data');
        }
      } catch (e) {
        console.error('Failed to parse jsonResume query parameter:', e);
      }
    }
  // If there is a design id in the route, fetch and load it
  else if (route.params.id) {
    try {
      const design = await getDesignById(route.params.id);
      if (design && design.data) {
        // Parse the design data if it's a string, with error handling for corrupted data
        let parsedData;
        if (typeof design.data === 'string') {
          try {
            parsedData = JSON.parse(design.data);
          } catch (parseError) {
            console.error('Failed to parse design data JSON, using empty design:', parseError);
            // If JSON parsing fails, create an empty design structure compatible with Polotno
            parsedData = {
              width: 800,
              height: 600,
              pages: [{
                id: 'page-1',
                width: 800,
                height: 600,
                children: []
              }]
            };
          }
        } else {
          parsedData = design.data;
        }

        // Check if this is a JSON Resume design with polotnoElements
        if (parsedData.polotnoElements) {
          console.log('Loading JSON Resume design with polotnoElements:', parsedData.polotnoElements);
          console.log('Elements array length:', parsedData.polotnoElements.length);
          console.log('First element:', parsedData.polotnoElements[0]);

          // The polotnoElements should be an array, but the store expects an object with pages
          // Create a proper structure for the Polotno store
          const polotnoData = {
            pages: [
              {
                id: 'page-1',
                width: width,
                height: height,
                elements: Array.isArray(parsedData.polotnoElements) ? parsedData.polotnoElements : []
              }
            ]
          };
          console.log('Loading polotno data:', polotnoData);
          console.log('Page elements:', polotnoData.pages[0].elements);
          polotnoStore.loadJSON(polotnoData);

          // Add a delay to check if elements are loaded
          setTimeout(() => {
            console.log('After loading - Store pages:', polotnoStore.pages.length);
            console.log('After loading - Active page elements:', polotnoStore.activePage?.children?.length || 0);
            if (polotnoStore.activePage) {
              console.log('Active page children:', polotnoStore.activePage.children.map(child => ({
                type: child.type,
                text: child.text,
                x: child.x,
                y: child.y
              })));
            }
          }, 1000);

           // Try adding elements directly if loadJSON didn't work
           setTimeout(() => {
             console.log('Checking if elements loaded, if not, adding them directly...');
             if (polotnoStore.activePage && polotnoStore.activePage.children.length === 0) {
               console.log('No elements found, adding them directly from polotnoElements');
               if (parsedData.polotnoElements && Array.isArray(parsedData.polotnoElements)) {
                 parsedData.polotnoElements.forEach(element => {
                   console.log('Adding element directly:', element);
                   polotnoStore.activePage.addElement(element);
                 });
               }
             } else {
               console.log('Elements already loaded:', polotnoStore.activePage.children.length);
             }
           }, 2000);

            // Add a small delay and check if elements were loaded
            setTimeout(() => {
            console.log('Store pages after loading:', polotnoStore.pages.length);
            console.log('Store elements after loading:', polotnoStore.pages[0]?.children?.length || 0);
          }, 500);
        } else {
          // Regular design data
          console.log('🔄 Loading regular design data:', parsedData);
          console.log('🔄 Data structure:', {
            hasPages: !!parsedData.pages,
            pagesCount: parsedData.pages?.length || 0,
            hasChildren: !!(parsedData.pages?.[0]?.children),
            childrenCount: parsedData.pages?.[0]?.children?.length || 0,
            dataKeys: Object.keys(parsedData)
          });

          // Sanitize data before loading to fix null values
          const sanitizedData = sanitizePolotnoData(parsedData);
          console.log('🧹 Sanitized data:', sanitizedData);
          polotnoStore.loadJSON(sanitizedData);

          // Add debugging to check if data was loaded correctly
           setTimeout(() => {
             console.log('🔍 After loading regular design:');
             console.log('Store pages:', polotnoStore.pages.length);
             console.log('Active page elements:', polotnoStore.activePage?.children?.length || 0);
             if (polotnoStore.activePage && polotnoStore.activePage.children.length > 0) {
               console.log('Elements loaded successfully:', polotnoStore.activePage.children.map(child => ({
                 type: child.type,
                 text: child.text || child.src || 'no text/src',
                 x: child.x,
                 y: child.y
               })));
               // Test the toJSON method to see what it returns
               const testJson = polotnoStore.toJSON();
               console.log('🧪 Test toJSON result:', testJson);
               console.log('🧪 Test toJSON children count:', testJson.pages?.[0]?.children?.length || 0);
             } else {
               console.warn('⚠️ No elements found in active page after loading!');
               // Still test toJSON even if no elements visible
               const testJson = polotnoStore.toJSON();
               console.log('🧪 Test toJSON result (no elements):', testJson);
             }
           }, 1000);
        }

        designName.value = design.name || 'Untitled Design';
        isPublic.value = !!design.public;
        designId = design.id;

        // Set the design data for JsonResumeEditor
        designData.value = parsedData;
      }
    } catch (e) {
      console.error('Failed to load design:', e);
    }
  }
})
</script>
