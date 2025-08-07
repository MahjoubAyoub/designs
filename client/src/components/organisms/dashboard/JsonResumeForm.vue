<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { convertJsonResumeToPolotno } from '@/utils/jsonResume.js';
import { createJsonResumeTemplate } from '@/api/templates.js';
import { saveDesign } from '@/api/designs.js';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseInput from '@/components/atoms/BaseInput.vue';

const router = useRouter();
const isLoading = ref(false);
const error = ref(null);
const currentStep = ref(1);
const totalSteps = 5; // Added step for layout and styling

// Image upload handling
const profileImage = ref(null);
const profileImageUrl = ref('');
const imageInput = ref(null);

// Section positioning and styling
const sectionStyles = reactive({
  profileImage: {
    position: { x: 450, y: 50 },
    width: 100,
    height: 100
  },
  basics: {
    position: { x: 50, y: 50 },
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 14
  },
  work: {
    position: { x: 50, y: 200 },
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 12
  },
  education: {
    position: { x: 50, y: 350 },
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 12
  },
  skills: {
    position: { x: 50, y: 500 },
    textColor: '#000000',
    backgroundColor: '#ffffff',
    fontSize: 12
  }
});

// Form data structure based on JSON Resume schema
const formData = reactive({
  basics: {
    name: '',
    label: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    image: '',
    location: {
      address: '',
      city: '',
      countryCode: '',
      region: ''
    }
  },
  work: [{
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    summary: ''
  }],
  education: [{
    institution: '',
    area: '',
    studyType: '',
    startDate: '',
    endDate: ''
  }],
  skills: [{
    name: '',
    keywords: ''
  }]
});

const selectedTheme = ref('modern');

// Add new work experience
function addWorkExperience() {
  formData.work.push({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    summary: ''
  });
}

// Remove work experience
function removeWorkExperience(index) {
  if (formData.work.length > 1) {
    formData.work.splice(index, 1);
  }
}

// Add new education
function addEducation() {
  formData.education.push({
    institution: '',
    area: '',
    studyType: '',
    startDate: '',
    endDate: ''
  });
}

// Remove education
function removeEducation(index) {
  if (formData.education.length > 1) {
    formData.education.splice(index, 1);
  }
}

// Add new skill
function addSkill() {
  formData.skills.push({
    name: '',
    keywords: ''
  });
}

// Remove skill
function removeSkill(index) {
  if (formData.skills.length > 1) {
    formData.skills.splice(index, 1);
  }
}

// Image compression utility
function compressImage(file, maxWidth = 300, maxHeight = 300, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Image upload functions
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }
    
    try {
      // Compress the image before storing
      const compressedImage = await compressImage(file, 300, 300, 0.8);
      profileImageUrl.value = compressedImage;
      formData.basics.image = compressedImage;
    } catch (error) {
      console.error('Error compressing image:', error);
      // Fallback to original method if compression fails
      const reader = new FileReader();
      reader.onload = (e) => {
        profileImageUrl.value = e.target.result;
        formData.basics.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}

function removeImage() {
  profileImageUrl.value = '';
  formData.basics.image = '';
  if (imageInput.value) {
    imageInput.value.value = '';
  }
}

// Section positioning functions
function updateSectionPosition(section, axis, value) {
  sectionStyles[section].position[axis] = parseInt(value);
}

function updateSectionStyle(section, property, value) {
  sectionStyles[section][property] = value;
}

// Template refs for draggable elements
const profileImagePreview = ref(null)
const basicsPreview = ref(null)
const workPreview = ref(null)
const educationPreview = ref(null)
const skillsPreview = ref(null)

// Drag state
const dragState = reactive({
  isDragging: false,
  currentSection: null,
  startX: 0,
  startY: 0,
  initialX: 0,
  initialY: 0
})

// Start drag function for Vue event handlers
function startDrag(event, sectionType) {
  dragState.isDragging = true
  dragState.currentSection = sectionType
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.initialX = sectionStyles[sectionType].position.x
  dragState.initialY = sectionStyles[sectionType].position.y
  
  event.target.style.cursor = 'grabbing'
  event.preventDefault()
  event.stopPropagation()
  
  console.log(`Started dragging ${sectionType}`)
}

// Handle mouse move for dragging
function handleMouseMove(event) {
  if (!dragState.isDragging || !dragState.currentSection) return
  
  const deltaX = event.clientX - dragState.startX
  const deltaY = event.clientY - dragState.startY
  
  const newX = Math.max(0, Math.min(595 - 100, dragState.initialX + deltaX))
  const newY = Math.max(0, Math.min(842 - 50, dragState.initialY + deltaY))
  
  updateSectionPosition(dragState.currentSection, 'x', newX)
  updateSectionPosition(dragState.currentSection, 'y', newY)
}

// Handle mouse up to end dragging
function handleMouseUp(event) {
  if (dragState.isDragging) {
    dragState.isDragging = false
    if (event.target) {
      event.target.style.cursor = 'grab'
    }
    console.log(`Stopped dragging ${dragState.currentSection}`)
    dragState.currentSection = null
  }
};

// Add draggable functionality
function makeDraggable(element, sectionType) {
  let isDragging = false;
  let startX, startY, initialX, initialY;
  
  const handleMouseDown = (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = sectionStyles[sectionType].position.x;
    initialY = sectionStyles[sectionType].position.y;
    element.style.cursor = 'grabbing';
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    const newX = Math.max(0, Math.min(595 - 100, initialX + deltaX)); // Constrain to canvas width
    const newY = Math.max(0, Math.min(842 - 50, initialY + deltaY)); // Constrain to canvas height
    
    updateSectionPosition(sectionType, 'x', newX);
    updateSectionPosition(sectionType, 'y', newY);
  };
  
  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = 'grab';
    }
  };
  
  element.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}

// Initialize draggable functionality when step 5 is reached
function initializeDraggable() {
  setTimeout(() => {
    if (profileImagePreview.value) {
      console.log('Initializing drag for profile image');
      makeDraggable(profileImagePreview.value, 'profileImage');
    }
    if (basicsPreview.value) {
      console.log('Initializing drag for basics');
      makeDraggable(basicsPreview.value, 'basics');
    }
    if (workPreview.value) {
      console.log('Initializing drag for work');
      makeDraggable(workPreview.value, 'work');
    }
    if (educationPreview.value) {
      console.log('Initializing drag for education');
      makeDraggable(educationPreview.value, 'education');
    }
    if (skillsPreview.value) {
      console.log('Initializing drag for skills');
      makeDraggable(skillsPreview.value, 'skills');
    }
  }, 200);
}

// Watch for step changes to initialize draggable when reaching step 5
watch(currentStep, (newStep) => {
  if (newStep === 5) {
    initializeDraggable();
  }
});

// Initialize draggable functionality on mount if already on step 5
onMounted(() => {
  // Add global mouse event listeners for dragging
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  if (currentStep.value === 5) {
    initializeDraggable();
  }
});

// Cleanup event listeners on unmount
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// Navigation functions
function nextStep() {
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// Create resume design with user data
async function createResumeDesign() {
  try {
    isLoading.value = true;
    error.value = null;

    // Process form data into JSON Resume format
    const jsonResumeData = {
      basics: {
        ...formData.basics,
        profiles: [] // Can be extended later
      },
      work: formData.work.filter(job => job.company && job.position),
      education: formData.education.filter(edu => edu.institution && edu.area),
      skills: formData.skills
        .filter(skill => skill.name)
        .map(skill => ({
          name: skill.name,
          keywords: skill.keywords ? skill.keywords.split(',').map(k => k.trim()) : []
        })),
      volunteer: [],
      awards: [],
      publications: [],
      languages: [],
      interests: [],
      references: [],
      projects: []
    };

    // Convert to Polotno-compatible format with section positioning
    let polotnoData = convertJsonResumeToPolotno(jsonResumeData, sectionStyles);

    // Get the current user
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('Please log in to create a resume');
      return;
    }

    // Create a design with the user's data including styling and positioning
    let designData = {
      name: `${formData.basics.name || 'My Resume'} - ${selectedTheme.value}`,
      data: {
        pages: [{
          id: 'page-1',
          children: polotnoData.elements,
          width: 595,  // A4 width in points
          height: 842, // A4 height in points
          background: 'white'
        }],
        unit: 'pt',
        dpi: 72
      },
      userId: user.id,
      public: false,
      depuisTemplate: false
    };

    // Check payload size and compress if needed
    const payloadSize = JSON.stringify(designData).length;
    console.log('Payload size:', payloadSize, 'bytes');
    
    // If payload is too large (> 3MB), try without image
    if (payloadSize > 3 * 1024 * 1024) {
      console.warn('Payload too large, creating design without image');
      const jsonResumeDataWithoutImage = {
        ...jsonResumeData,
        basics: { ...jsonResumeData.basics, image: '' }
      };
      polotnoData = convertJsonResumeToPolotno(jsonResumeDataWithoutImage, sectionStyles);
      designData.data.pages[0].children = polotnoData.elements;
    }

    const designResponse = await saveDesign(designData);
    if (designResponse && designResponse.data && designResponse.data.id) {
      // Navigate to the editor with the new design and proper A4 dimensions
      router.push({
        path: `/create/${designResponse.data.id}`,
        query: {
          width: 595,  // A4 width
          height: 842  // A4 height
        }
      });
    }
  } catch (err) {
    console.error('Failed to create resume design:', err);
    
    // If it's a 413 error, try again without the image
    if (err.message.includes('413') || err.message.includes('Payload Too Large')) {
      try {
        console.warn('Retrying without image due to payload size');
        const jsonResumeDataWithoutImage = {
          basics: {
            ...formData.basics,
            image: '',
            profiles: []
          },
          work: formData.work.filter(job => job.company && job.position),
          education: formData.education.filter(edu => edu.institution && edu.area),
          skills: formData.skills
            .filter(skill => skill.name)
            .map(skill => ({
              name: skill.name,
              keywords: skill.keywords ? skill.keywords.split(',').map(k => k.trim()) : []
            })),
          volunteer: [],
          awards: [],
          publications: [],
          languages: [],
          interests: [],
          references: [],
          projects: []
        };
        
        const polotnoDataWithoutImage = convertJsonResumeToPolotno(jsonResumeDataWithoutImage, sectionStyles);
        
        const designDataWithoutImage = {
          name: `${formData.basics.name || 'My Resume'} - ${selectedTheme.value}`,
          data: {
            pages: [{
              id: 'page-1',
              children: polotnoDataWithoutImage.elements,
              width: 595,
              height: 842,
              background: 'white'
            }],
            unit: 'pt',
            dpi: 72
          },
          userId: JSON.parse(localStorage.getItem('user') || '{}').id,
          public: false,
          depuisTemplate: false
        };
        
        const designResponse = await saveDesign(designDataWithoutImage);
        if (designResponse && designResponse.data && designResponse.data.id) {
          router.push({
            path: `/create/${designResponse.data.id}`,
            query: {
              width: 595,
              height: 842
            }
          });
          error.value = 'Design created successfully, but image was too large and was excluded. You can add it manually in the editor.';
        }
      } catch (retryErr) {
        console.error('Retry failed:', retryErr);
        error.value = 'Failed to create resume design. Please try reducing the image size or removing the image.';
      }
    } else {
      error.value = 'Failed to create resume design';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Step {{ currentStep }} of {{ totalSteps }}</span>
        <span class="text-sm text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}% Complete</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: (currentStep / totalSteps) * 100 + '%' }"></div>
      </div>
      
      <!-- Step Indicator -->
      <div class="flex justify-between mt-4 text-xs">
        <div class="flex flex-col items-center" :class="{ 'text-blue-600 font-medium': currentStep === 1, 'text-gray-400': currentStep !== 1 }">
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1" :class="{ 'border-blue-600 bg-blue-600 text-white': currentStep >= 1, 'border-gray-300': currentStep < 1 }">
            1
          </div>
          <span>Basic Info</span>
        </div>
        <div class="flex flex-col items-center" :class="{ 'text-blue-600 font-medium': currentStep === 2, 'text-gray-400': currentStep !== 2 }">
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1" :class="{ 'border-blue-600 bg-blue-600 text-white': currentStep >= 2, 'border-gray-300': currentStep < 2 }">
            2
          </div>
          <span>Work</span>
        </div>
        <div class="flex flex-col items-center" :class="{ 'text-blue-600 font-medium': currentStep === 3, 'text-gray-400': currentStep !== 3 }">
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1" :class="{ 'border-blue-600 bg-blue-600 text-white': currentStep >= 3, 'border-gray-300': currentStep < 3 }">
            3
          </div>
          <span>Education</span>
        </div>
        <div class="flex flex-col items-center" :class="{ 'text-blue-600 font-medium': currentStep === 4, 'text-gray-400': currentStep !== 4 }">
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1" :class="{ 'border-blue-600 bg-blue-600 text-white': currentStep >= 4, 'border-gray-300': currentStep < 4 }">
            4
          </div>
          <span>Skills</span>
        </div>
        <div class="flex flex-col items-center" :class="{ 'text-blue-600 font-medium': currentStep === 5, 'text-gray-400': currentStep !== 5 }">
          <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1" :class="{ 'border-blue-600 bg-blue-600 text-white': currentStep >= 5, 'border-gray-300': currentStep < 5 }">
            5
          </div>
          <span>Preview</span>
        </div>
      </div>
    </div>
  </div>  
    <!-- Step 1: Basic Information -->
    <div v-if="currentStep === 1" class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>
      
      <!-- Profile Image Upload -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Profile Picture</h3>
        <div class="flex items-center space-x-6">
          <div class="relative">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
              <img v-if="profileImageUrl" :src="profileImageUrl" alt="Profile" class="w-full h-full object-cover" />
              <svg v-else class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <button v-if="profileImageUrl" @click="removeImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
              ×
            </button>
          </div>
          <div class="flex-1">
            <input type="file" @change="handleImageUpload" accept="image/*" class="hidden" ref="imageInput" id="profileImageInput" />
            <label for="profileImageInput" class="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors inline-block">
              {{ profileImageUrl ? 'Change Photo' : 'Upload Photo' }}
            </label>
            <p class="text-sm text-gray-500 mt-2">Recommended: Square image, max 5MB</p>
          </div>
        </div>
      </div>
      
      <!-- Section Positioning and Styling -->
      <div class="bg-blue-50 p-6 rounded-lg">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Basic Info Section Styling</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position X</label>
            <input type="number" :value="sectionStyles.basics.position.x" @input="updateSectionPosition('basics', 'x', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
            <input type="number" :value="sectionStyles.basics.position.y" @input="updateSectionPosition('basics', 'y', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <input type="color" :value="sectionStyles.basics.textColor" @input="updateSectionStyle('basics', 'textColor', $event.target.value)" class="w-full h-10 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input type="number" :value="sectionStyles.basics.fontSize" @input="updateSectionStyle('basics', 'fontSize', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" min="8" max="24" />
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <BaseInput v-model="formData.basics.name" name="fullName" placeholder="Your Name" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
          <BaseInput v-model="formData.basics.label" name="jobTitle" placeholder="Exemple Software Developer" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <BaseInput v-model="formData.basics.email" name="email" type="email" placeholder="Your Email" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <BaseInput v-model="formData.basics.phone" name="phone" placeholder="" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <BaseInput v-model="formData.basics.url" name="website" placeholder="" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
          <BaseInput v-model="formData.basics.location.city" name="city" placeholder="La Marsa" />
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
        <textarea 
          v-model="formData.basics.summary" 
          name="summary"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          placeholder="A brief summary of your professional background and key achievements..."
        ></textarea>
      </div>
    </div>

    <!-- Step 2: Work Experience -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Work Experience</h2>
        <BaseButton @click="addWorkExperience" class="bg-green-600 text-white px-4 py-2 rounded-lg">
          + Add Job
        </BaseButton>
      </div>
      
      <!-- Section Positioning and Styling -->
      <div class="bg-green-50 p-6 rounded-lg">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Work Experience Section Styling</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position X</label>
            <input type="number" :value="sectionStyles.work.position.x" @input="updateSectionPosition('work', 'x', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
            <input type="number" :value="sectionStyles.work.position.y" @input="updateSectionPosition('work', 'y', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <input type="color" :value="sectionStyles.work.textColor" @input="updateSectionStyle('work', 'textColor', $event.target.value)" class="w-full h-10 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input type="number" :value="sectionStyles.work.fontSize" @input="updateSectionStyle('work', 'fontSize', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" min="8" max="24" />
          </div>
        </div>
      </div>
      
      <div v-for="(job, index) in formData.work" :key="index" class="border border-gray-200 rounded-lg p-4 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-800">Job {{ index + 1 }}</h3>
          <button 
            v-if="formData.work.length > 1"
            @click="removeWorkExperience(index)"
            class="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Company *</label>
            <BaseInput v-model="job.company" :name="`company_${index}`" placeholder="intuitiv"  />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position *</label>
            <BaseInput v-model="job.position" :name="`position_${index}`"   />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <BaseInput v-model="job.startDate" :name="`startDate_${index}`" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <BaseInput v-model="job.endDate" :name="`endDate_${index}`" type="date" placeholder="Leave empty if current" />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
          <textarea 
            v-model="job.summary" 
            :name="`jobSummary_${index}`"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Describe your responsibilities and achievements..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Step 3: Education -->
    <div v-if="currentStep === 3" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Education</h2>
        <BaseButton @click="addEducation" class="bg-green-600 text-white px-4 py-2 rounded-lg">
          + Add Education
        </BaseButton>
      </div>
      
      <!-- Section Positioning and Styling -->
      <div class="bg-purple-50 p-6 rounded-lg">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Education Section Styling</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position X</label>
            <input type="number" :value="sectionStyles.education.position.x" @input="updateSectionPosition('education', 'x', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
            <input type="number" :value="sectionStyles.education.position.y" @input="updateSectionPosition('education', 'y', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <input type="color" :value="sectionStyles.education.textColor" @input="updateSectionStyle('education', 'textColor', $event.target.value)" class="w-full h-10 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input type="number" :value="sectionStyles.education.fontSize" @input="updateSectionStyle('education', 'fontSize', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" min="8" max="24" />
          </div>
        </div>
      </div>
      
      <div v-for="(edu, index) in formData.education" :key="index" class="border border-gray-200 rounded-lg p-4 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-800">Education {{ index + 1 }}</h3>
          <button 
            v-if="formData.education.length > 1"
            @click="removeEducation(index)"
            class="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
            <BaseInput v-model="edu.institution" :name="`institution_${index}`" placeholder="University Name" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Field of Study *</label>
            <BaseInput v-model="edu.area" :name="`area_${index}`" placeholder="Computer Science" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Degree Type</label>
            <select v-model="edu.studyType" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select Degree</option>
              <option value="Bachelor">Bachelor's</option>
              <option value="Master">Master's</option>
              <option value="PhD">PhD</option>
              <option value="Associate">Associate</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
            <BaseInput v-model="edu.endDate" :name="`graduationDate_${index}`" type="date" />
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Skills -->
    <div v-if="currentStep === 4" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-800">Skills</h2>
        <BaseButton @click="addSkill" class="bg-green-600 text-white px-4 py-2 rounded-lg">
          + Add Skill
        </BaseButton>
      </div>
      
      <!-- Section Positioning and Styling -->
      <div class="bg-yellow-50 p-6 rounded-lg">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Skills Section Styling</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position X</label>
            <input type="number" :value="sectionStyles.skills.position.x" @input="updateSectionPosition('skills', 'x', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
            <input type="number" :value="sectionStyles.skills.position.y" @input="updateSectionPosition('skills', 'y', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
            <input type="color" :value="sectionStyles.skills.textColor" @input="updateSectionStyle('skills', 'textColor', $event.target.value)" class="w-full h-10 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <input type="number" :value="sectionStyles.skills.fontSize" @input="updateSectionStyle('skills', 'fontSize', $event.target.value)" class="w-full p-2 border border-gray-300 rounded-lg" min="8" max="24" />
          </div>
        </div>
      </div>
      
      <div v-for="(skill, index) in formData.skills" :key="index" class="border border-gray-200 rounded-lg p-4 space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-800">Skill {{ index + 1 }}</h3>
          <button 
            v-if="formData.skills.length > 1"
            @click="removeSkill(index)"
            class="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Skill Category *</label>
            <BaseInput v-model="skill.name" :name="`skillName_${index}`" placeholder="Web Development" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Technologies (comma-separated)</label>
            <BaseInput v-model="skill.keywords" :name="`skillKeywords_${index}`" placeholder="HTML, CSS, JavaScript, Vue" />
          </div>
        </div>
      </div>
      
      <!-- Theme Selection -->
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Choose Resume Theme</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            v-for="theme in ['modern', 'minimal']" 
            :key="theme"
            class="cursor-pointer border-2 rounded-lg p-3 text-center transition-colors"
            :class="selectedTheme === theme ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            @click="selectedTheme = theme"
          >
            <div class="w-full h-16 bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-500">
              {{ theme }} Preview
            </div>
            <span class="text-sm font-medium capitalize">{{ theme }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 5: Layout Preview & Final Adjustments -->
    <div v-if="currentStep === 5" class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Layout Preview & Final Adjustments</h2>
      
      <!-- Theme Preview Section -->
      <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Theme Preview</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            v-for="theme in ['modern', 'elegant', 'classic', 'minimal']" 
            :key="theme"
            class="cursor-pointer border-2 rounded-lg p-3 text-center transition-colors"
            :class="selectedTheme === theme ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            @click="selectedTheme = theme"
          >
            <div class="w-full h-20 rounded mb-2 flex flex-col items-center justify-center text-xs overflow-hidden"
                 :class="{
                   'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200': theme === 'modern',
                   'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200': theme === 'elegant',
                   'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300': theme === 'classic',
                   'bg-white border border-gray-200': theme === 'minimal'
                 }">
              <div class="w-full h-2 mb-1"
                   :class="{
                     'bg-blue-500': theme === 'modern',
                     'bg-purple-500': theme === 'elegant', 
                     'bg-gray-700': theme === 'classic',
                     'bg-black': theme === 'minimal'
                   }"></div>
              <div class="text-xs px-2 text-center"
                   :class="{
                     'text-blue-700': theme === 'modern',
                     'text-purple-700': theme === 'elegant',
                     'text-gray-700': theme === 'classic',
                     'text-black': theme === 'minimal'
                   }">{{ theme }} Style</div>
            </div>
            <span class="text-sm font-medium capitalize">{{ theme }}</span>
          </div>
        </div>
        
        <!-- Theme Description -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-800 mb-2">{{ selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1) }} Theme</h4>
          <p class="text-sm text-gray-600">
            <span v-if="selectedTheme === 'modern'">Clean and contemporary design with blue accents and modern typography. Perfect for tech and creative professionals.</span>
            <span v-else-if="selectedTheme === 'elegant'">Sophisticated design with purple accents and refined styling. Ideal for executive and professional roles.</span>
            <span v-else-if="selectedTheme === 'classic'">Traditional and timeless design with neutral colors. Suitable for conservative industries and formal positions.</span>
            <span v-else-if="selectedTheme === 'minimal'">Simple and clean design focusing on content. Great for any industry where clarity is key.</span>
          </p>
        </div>
      </div>
      
      <!-- Layout Preview -->
      <div class="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Layout Preview (A4 Format) - {{ selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1) }} Theme</h3>
        <div class="relative border border-gray-300 mx-auto" 
             :class="{
               'bg-gradient-to-br from-blue-50 to-white': selectedTheme === 'modern',
               'bg-gradient-to-br from-purple-50 to-white': selectedTheme === 'elegant',
               'bg-gray-50': selectedTheme === 'classic',
               'bg-white': selectedTheme === 'minimal'
             }"
             style="height: 842px; width: 595px; transform: scale(0.7); transform-origin: top center;">
          
          <!-- Theme Header Bar -->
          <div class="absolute top-0 left-0 w-full h-8 flex items-center px-4"
               :class="{
                 'bg-blue-500': selectedTheme === 'modern',
                 'bg-purple-500': selectedTheme === 'elegant',
                 'bg-gray-700': selectedTheme === 'classic',
                 'bg-black': selectedTheme === 'minimal'
               }">
            <div class="text-white text-xs font-medium">{{ selectedTheme.toUpperCase() }} THEME</div>
          </div>
          
          <!-- Profile Image Preview -->
          <div v-if="profileImageUrl" class="absolute rounded cursor-grab select-none overflow-hidden" 
                :class="{
                  'border-2 border-blue-300 shadow-lg': selectedTheme === 'modern',
                  'border-2 border-purple-300 shadow-lg': selectedTheme === 'elegant',
                  'border border-gray-400': selectedTheme === 'classic',
                  'border border-gray-300': selectedTheme === 'minimal'
                }"
                :style="{ left: sectionStyles.profileImage.position.x + 'px', top: (sectionStyles.profileImage.position.y + 40) + 'px', width: sectionStyles.profileImage.width + 'px', height: sectionStyles.profileImage.height + 'px' }"
                ref="profileImagePreview"
                @mousedown="startDrag($event, 'profileImage')">
            <div class="text-xs absolute top-0 left-0 px-1 z-10"
                 :class="{
                   'text-blue-700 bg-blue-100': selectedTheme === 'modern',
                   'text-purple-700 bg-purple-100': selectedTheme === 'elegant',
                   'text-gray-700 bg-gray-100': selectedTheme === 'classic',
                   'text-gray-600 bg-white': selectedTheme === 'minimal'
                 }">Profile Image</div>
            <img :src="profileImageUrl" alt="Profile" class="w-full h-full object-cover" />
          </div>
          
          <!-- Basic Info Preview -->
          <div class="absolute p-3 rounded cursor-grab select-none" 
                :class="{
                  'border-2 border-blue-300 bg-blue-50 shadow-md': selectedTheme === 'modern',
                  'border-2 border-purple-300 bg-purple-50 shadow-md': selectedTheme === 'elegant',
                  'border border-gray-400 bg-gray-100': selectedTheme === 'classic',
                  'border border-gray-300 bg-white': selectedTheme === 'minimal'
                }"
                :style="{ left: sectionStyles.basics.position.x + 'px', top: (sectionStyles.basics.position.y + 40) + 'px', fontSize: sectionStyles.basics.fontSize + 'px' }"
                ref="basicsPreview"
                @mousedown="startDrag($event, 'basics')">
            <div class="text-xs mb-1"
                 :class="{
                   'text-blue-700': selectedTheme === 'modern',
                   'text-purple-700': selectedTheme === 'elegant',
                   'text-gray-700': selectedTheme === 'classic',
                   'text-gray-600': selectedTheme === 'minimal'
                 }">Basic Info</div>
            <div class="font-bold"
                 :class="{
                   'text-blue-900': selectedTheme === 'modern',
                   'text-purple-900': selectedTheme === 'elegant',
                   'text-gray-900': selectedTheme === 'classic',
                   'text-black': selectedTheme === 'minimal'
                 }">{{ formData.basics.name || 'Your Name' }}</div>
            <div class="font-medium"
                 :class="{
                   'text-blue-700': selectedTheme === 'modern',
                   'text-purple-700': selectedTheme === 'elegant',
                   'text-gray-700': selectedTheme === 'classic',
                   'text-gray-800': selectedTheme === 'minimal'
                 }">{{ formData.basics.label || 'Job Title' }}</div>
          </div>
          
          <!-- Work Experience Preview -->
          <div class="absolute p-3 rounded cursor-grab select-none" 
                :class="{
                  'border-2 border-blue-200 bg-blue-25': selectedTheme === 'modern',
                  'border-2 border-purple-200 bg-purple-25': selectedTheme === 'elegant',
                  'border border-gray-300 bg-white': selectedTheme === 'classic',
                  'border border-gray-200 bg-gray-50': selectedTheme === 'minimal'
                }"
                :style="{ left: sectionStyles.work.position.x + 'px', top: (sectionStyles.work.position.y + 40) + 'px', fontSize: sectionStyles.work.fontSize + 'px' }"
                ref="workPreview"
                @mousedown="startDrag($event, 'work')">
            <div class="text-xs mb-1"
                 :class="{
                   'text-blue-700': selectedTheme === 'modern',
                   'text-purple-700': selectedTheme === 'elegant',
                   'text-gray-700': selectedTheme === 'classic',
                   'text-gray-600': selectedTheme === 'minimal'
                 }">Work Experience</div>
            <div class="font-semibold"
                 :class="{
                   'text-blue-800': selectedTheme === 'modern',
                   'text-purple-800': selectedTheme === 'elegant',
                   'text-gray-800': selectedTheme === 'classic',
                   'text-black': selectedTheme === 'minimal'
                 }">{{ formData.work[0]?.company || 'Company Name' }}</div>
            <div :class="{
                   'text-blue-600': selectedTheme === 'modern',
                   'text-purple-600': selectedTheme === 'elegant',
                   'text-gray-600': selectedTheme === 'classic',
                   'text-gray-700': selectedTheme === 'minimal'
                 }">{{ formData.work[0]?.position || 'Position' }}</div>
          </div>
          
          <!-- Education Preview -->
          <div class="absolute p-3 rounded cursor-grab select-none" 
                :class="{
                  'border-2 border-blue-200 bg-blue-25': selectedTheme === 'modern',
                  'border-2 border-purple-200 bg-purple-25': selectedTheme === 'elegant',
                  'border border-gray-300 bg-white': selectedTheme === 'classic',
                  'border border-gray-200 bg-gray-50': selectedTheme === 'minimal'
                }"
                :style="{ left: sectionStyles.education.position.x + 'px', top: (sectionStyles.education.position.y + 40) + 'px', fontSize: sectionStyles.education.fontSize + 'px' }"
                ref="educationPreview"
                @mousedown="startDrag($event, 'education')">
            <div class="text-xs mb-1"
                 :class="{
                   'text-blue-700': selectedTheme === 'modern',
                   'text-purple-700': selectedTheme === 'elegant',
                   'text-gray-700': selectedTheme === 'classic',
                   'text-gray-600': selectedTheme === 'minimal'
                 }">Education</div>
            <div class="font-semibold"
                 :class="{
                   'text-blue-800': selectedTheme === 'modern',
                   'text-purple-800': selectedTheme === 'elegant',
                   'text-gray-800': selectedTheme === 'classic',
                   'text-black': selectedTheme === 'minimal'
                 }">{{ formData.education[0]?.institution || 'University' }}</div>
            <div :class="{
                   'text-blue-600': selectedTheme === 'modern',
                   'text-purple-600': selectedTheme === 'elegant',
                   'text-gray-600': selectedTheme === 'classic',
                   'text-gray-700': selectedTheme === 'minimal'
                 }">{{ formData.education[0]?.area || 'Field of Study' }}</div>
          </div>
          
          <!-- Skills Preview -->
          <div class="absolute p-3 rounded cursor-grab select-none" 
                :class="{
                  'border-2 border-blue-200 bg-blue-25': selectedTheme === 'modern',
                  'border-2 border-purple-200 bg-purple-25': selectedTheme === 'elegant',
                  'border border-gray-300 bg-white': selectedTheme === 'classic',
                  'border border-gray-200 bg-gray-50': selectedTheme === 'minimal'
                }"
                :style="{ left: sectionStyles.skills.position.x + 'px', top: (sectionStyles.skills.position.y + 40) + 'px', fontSize: sectionStyles.skills.fontSize + 'px' }"
                ref="skillsPreview"
                @mousedown="startDrag($event, 'skills')">
            <div class="text-xs mb-1"
                 :class="{
                   'text-blue-700': selectedTheme === 'modern',
                   'text-purple-700': selectedTheme === 'elegant',
                   'text-gray-700': selectedTheme === 'classic',
                   'text-gray-600': selectedTheme === 'minimal'
                 }">Skills</div>
            <div class="font-semibold"
                 :class="{
                   'text-blue-800': selectedTheme === 'modern',
                   'text-purple-800': selectedTheme === 'elegant',
                   'text-gray-800': selectedTheme === 'classic',
                   'text-black': selectedTheme === 'minimal'
                 }">{{ formData.skills[0]?.name || 'Skill Category' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Error Display -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="text-red-800">{{ error }}</div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-8">
      <button 
        v-if="currentStep > 1" 
        @click="prevStep" 
        class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        Previous
      </button>
      <div v-else></div>
      
      <button 
        v-if="currentStep < totalSteps" 
        @click="nextStep" 
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        :disabled="currentStep === 1 && (!formData.basics.name || !formData.basics.label || !formData.basics.email)"
      >
        Next
      </button>
      
      <button 
        v-else 
        @click="createResumeDesign" 
        :disabled="isLoading || !formData.basics.name || !formData.basics.label || !formData.basics.email"
        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {{ isLoading ? 'Creating...' : 'Create Resume' }}
      </button>
    </div>
  
</template>

<style scoped>
/* Add any custom styles here */
</style>