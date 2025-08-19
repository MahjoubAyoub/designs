<script setup>
import { ref, watch, onMounted } from 'vue';
import { extractJsonResumeData, updateJsonResumeData, isJsonResumeDesign } from "@/services/jsonResumeService";

const props = defineProps({
  designData: {
    type: [Object, String],
    required: true
  },
  onUpdate: {
    type: Function,
    required: true
  }
});

// Reactive state
const jsonResumeData = ref(null);
const activeSection = ref('basics');
const isJsonResume = ref(false);
const showEditor = ref(false);

// Available sections in JSON Resume
const sections = [
  { id: 'basics', label: 'Basic Information' },
  { id: 'work', label: 'Work Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'awards', label: 'Awards' },
  { id: 'publications', label: 'Publications' },
  { id: 'languages', label: 'Languages' },
  { id: 'interests', label: 'Interests' },
  { id: 'references', label: 'References' }
];

// Initialize the component
onMounted(() => {
  checkAndLoadJsonResume();
});

// Watch for changes in designData
watch(() => props.designData, () => {
  checkAndLoadJsonResume();
}, { deep: true });

// Check if the design is a JSON Resume and load the data
function checkAndLoadJsonResume() {
  isJsonResume.value = isJsonResumeDesign(props.designData);
  if (isJsonResume.value) {
    jsonResumeData.value = extractJsonResumeData(props.designData);
  }
}

// Update the JSON Resume data
function updateResume() {
  if (!jsonResumeData.value) return;

  const updatedDesignData = updateJsonResumeData(props.designData, jsonResumeData.value);
  props.onUpdate(updatedDesignData);
}

// Add a new item to an array section
function addItem(section) {
  if (!jsonResumeData.value[section]) {
    jsonResumeData.value[section] = [];
  }

  // Create a new empty item based on the section type
  let newItem = {};

  switch (section) {
    case 'work':
      newItem = {
        company: '',
        position: '',
        website: '',
        startDate: '',
        endDate: '',
        summary: '',
        highlights: []
      };
      break;
    case 'education':
      newItem = {
        institution: '',
        area: '',
        studyType: '',
        startDate: '',
        endDate: '',
        gpa: '',
        courses: []
      };
      break;
    case 'skills':
      newItem = {
        name: '',
        level: '',
        keywords: []
      };
      break;
    case 'projects':
      newItem = {
        name: '',
        description: '',
        highlights: [],
        keywords: [],
        startDate: '',
        endDate: '',
        url: '',
        roles: [],
        entity: '',
        type: ''
      };
      break;
    case 'awards':
      newItem = {
        title: '',
        date: '',
        awarder: '',
        summary: ''
      };
      break;
    case 'publications':
      newItem = {
        name: '',
        publisher: '',
        releaseDate: '',
        website: '',
        summary: ''
      };
      break;
    case 'languages':
      newItem = {
        language: '',
        fluency: ''
      };
      break;
    case 'interests':
      newItem = {
        name: '',
        keywords: []
      };
      break;
    case 'references':
      newItem = {
        name: '',
        reference: ''
      };
      break;
    default:
      break;
  }

  jsonResumeData.value[section].push(newItem);
  updateResume();
}

// Remove an item from an array section
function removeItem(section, index) {
  if (!jsonResumeData.value[section] || index < 0 || index >= jsonResumeData.value[section].length) {
    return;
  }

  jsonResumeData.value[section].splice(index, 1);
  updateResume();
}

// Add a new item to a nested array
function addNestedItem(section, index, field) {
  if (!jsonResumeData.value[section][index][field]) {
    jsonResumeData.value[section][index][field] = [];
  }

  jsonResumeData.value[section][index][field].push('');
  updateResume();
}

// Remove an item from a nested array
function removeNestedItem(section, index, field, nestedIndex) {
  if (!jsonResumeData.value[section][index][field] ||
      nestedIndex < 0 ||
      nestedIndex >= jsonResumeData.value[section][index][field].length) {
    return;
  }

  jsonResumeData.value[section][index][field].splice(nestedIndex, 1);
  updateResume();
}

// Add a new profile to basics.profiles
function addProfile() {
  if (!jsonResumeData.value.basics.profiles) {
    jsonResumeData.value.basics.profiles = [];
  }

  jsonResumeData.value.basics.profiles.push({
    network: '',
    username: '',
    url: ''
  });

  updateResume();
}

// Remove a profile from basics.profiles
function removeProfile(index) {
  if (!jsonResumeData.value.basics.profiles ||
      index < 0 ||
      index >= jsonResumeData.value.basics.profiles.length) {
    return;
  }

  jsonResumeData.value.basics.profiles.splice(index, 1);
  updateResume();
}

// Toggle the editor visibility
function toggleEditor() {
  showEditor.value = !showEditor.value;
}
</script>

<template>
  <div v-if="isJsonResume" class="json-resume-editor">
    <!-- Editor Toggle Button -->
    <button
      @click="toggleEditor"
      class="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
      :class="{ 'bg-red-600 hover:bg-red-700': showEditor }"
    >
      <span v-if="showEditor">Close Editor</span>
      <span v-else>Edit Resume</span>
    </button>

    <!-- Editor Panel -->
    <div
      v-if="showEditor && jsonResumeData"
      class="fixed inset-0 z-40 overflow-hidden flex"
      @click.self="toggleEditor"
    >
      <div
        class="bg-white w-96 h-full shadow-xl overflow-y-auto ml-auto animate-slide-in-right"
        @click.stop
      >
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800">Edit JSON Resume</h2>
          <button
            @click="toggleEditor"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Section Navigation -->
        <div class="p-4 border-b border-gray-200">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="section in sections"
              :key="section.id"
              @click="activeSection = section.id"
              class="px-3 py-1 text-sm rounded-full transition-colors"
              :class="activeSection === section.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              {{ section.label }}
            </button>
          </div>
        </div>

        <!-- Section Content -->
        <div class="p-4">
          <!-- Basics Section -->
          <div v-if="activeSection === 'basics'" class="space-y-4">
            <h3 class="text-md font-medium text-gray-800">Basic Information</h3>

            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  v-model="jsonResumeData.basics.name"
                  @change="updateResume"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Label</label>
                <input
                  v-model="jsonResumeData.basics.label"
                  @change="updateResume"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g. Web Developer"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  v-model="jsonResumeData.basics.email"
                  @change="updateResume"
                  type="email"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  v-model="jsonResumeData.basics.phone"
                  @change="updateResume"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Website</label>
                <input
                  v-model="jsonResumeData.basics.url"
                  @change="updateResume"
                  type="url"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Summary</label>
                <textarea
                  v-model="jsonResumeData.basics.summary"
                  @change="updateResume"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                ></textarea>
              </div>

              <!-- Location -->
              <div class="border-t pt-3 mt-4">
                <h4 class="text-sm font-medium text-gray-800 mb-2">Location</h4>

                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      v-model="jsonResumeData.basics.location.address"
                      @change="updateResume"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">City</label>
                      <input
                        v-model="jsonResumeData.basics.location.city"
                        @change="updateResume"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Region</label>
                      <input
                        v-model="jsonResumeData.basics.location.region"
                        @change="updateResume"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        v-model="jsonResumeData.basics.location.postalCode"
                        @change="updateResume"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Country Code</label>
                      <input
                        v-model="jsonResumeData.basics.location.countryCode"
                        @change="updateResume"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g. US"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Profiles -->
              <div class="border-t pt-3 mt-4">
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-sm font-medium text-gray-800">Profiles</h4>
                  <button
                    @click="addProfile"
                    class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Add Profile
                  </button>
                </div>

                <div
                  v-for="(profile, index) in jsonResumeData.basics.profiles"
                  :key="index"
                  class="border rounded-md p-3 mb-3 relative"
                >
                  <button
                    @click="removeProfile(index)"
                    class="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Network</label>
                      <input
                        v-model="profile.network"
                        @change="updateResume"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g. LinkedIn, GitHub"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        v-model="profile.username"
                        @change="updateResume"
                        type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">URL</label>
                      <input
                        v-model="profile.url"
                        @change="updateResume"
                        type="url"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="https://"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="!jsonResumeData.basics.profiles || jsonResumeData.basics.profiles.length === 0" class="text-center text-gray-500 py-2">
                  No profiles added yet
                </div>
              </div>
            </div>
          </div>

          <!-- Work Experience Section -->
          <div v-if="activeSection === 'work'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-md font-medium text-gray-800">Work Experience</h3>
              <button
                @click="addItem('work')"
                class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Add Job
              </button>
            </div>

            <div
              v-for="(job, index) in jsonResumeData.work"
              :key="index"
              class="border rounded-md p-3 mb-3 relative"
            >
              <button
                @click="removeItem('work', index)"
                class="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    v-model="job.company"
                    @change="updateResume"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    v-model="job.position"
                    @change="updateResume"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    v-model="job.website"
                    @change="updateResume"
                    type="url"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="https://"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      v-model="job.startDate"
                      @change="updateResume"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      v-model="job.endDate"
                      @change="updateResume"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="YYYY-MM-DD or Present"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Summary</label>
                  <textarea
                    v-model="job.summary"
                    @change="updateResume"
                    rows="2"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
                </div>

                <!-- Highlights -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-gray-700">Highlights</label>
                    <button
                      @click="addNestedItem('work', index, 'highlights')"
                      class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div
                    v-for="(highlight, hIndex) in job.highlights"
                    :key="hIndex"
                    class="flex items-center mb-2"
                  >
                    <input
                      v-model="job.highlights[hIndex]"
                      @change="updateResume"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      @click="removeNestedItem('work', index, 'highlights', hIndex)"
                      class="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!jsonResumeData.work || jsonResumeData.work.length === 0" class="text-center text-gray-500 py-4">
              No work experience added yet
            </div>
          </div>

          <!-- Education Section -->
          <div v-if="activeSection === 'education'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-md font-medium text-gray-800">Education</h3>
              <button
                @click="addItem('education')"
                class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Add Education
              </button>
            </div>

            <div
              v-for="(edu, index) in jsonResumeData.education"
              :key="index"
              class="border rounded-md p-3 mb-3 relative"
            >
              <button
                @click="removeItem('education', index)"
                class="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Institution</label>
                  <input
                    v-model="edu.institution"
                    @change="updateResume"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Area</label>
                    <input
                      v-model="edu.area"
                      @change="updateResume"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Study Type</label>
                    <input
                      v-model="edu.studyType"
                      @change="updateResume"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g. Bachelor"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      v-model="edu.startDate"
                      @change="updateResume"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="YYYY-MM-DD"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      v-model="edu.endDate"
                      @change="updateResume"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="YYYY-MM-DD or Present"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">GPA</label>
                  <input
                    v-model="edu.gpa"
                    @change="updateResume"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <!-- Courses -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-gray-700">Courses</label>
                    <button
                      @click="addNestedItem('education', index, 'courses')"
                      class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div
                    v-for="(course, cIndex) in edu.courses"
                    :key="cIndex"
                    class="flex items-center mb-2"
                  >
                    <input
                      v-model="edu.courses[cIndex]"
                      @change="updateResume"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      @click="removeNestedItem('education', index, 'courses', cIndex)"
                      class="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!jsonResumeData.education || jsonResumeData.education.length === 0" class="text-center text-gray-500 py-4">
              No education added yet
            </div>
          </div>

          <!-- Skills Section -->
          <div v-if="activeSection === 'skills'" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-md font-medium text-gray-800">Skills</h3>
              <button
                @click="addItem('skills')"
                class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Add Skill
              </button>
            </div>

            <div
              v-for="(skill, index) in jsonResumeData.skills"
              :key="index"
              class="border rounded-md p-3 mb-3 relative"
            >
              <button
                @click="removeItem('skills', index)"
                class="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    v-model="skill.name"
                    @change="updateResume"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Web Development"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Level</label>
                  <input
                    v-model="skill.level"
                    @change="updateResume"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g. Advanced, Intermediate, Beginner"
                  />
                </div>

                <!-- Keywords -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="block text-sm font-medium text-gray-700">Keywords</label>
                    <button
                      @click="addNestedItem('skills', index, 'keywords')"
                      class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  <div
                    v-for="(keyword, kIndex) in skill.keywords"
                    :key="kIndex"
                    class="flex items-center mb-2"
                  >
                    <input
                      v-model="skill.keywords[kIndex]"
                      @change="updateResume"
                      type="text"
                      class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <button
                      @click="removeNestedItem('skills', index, 'keywords', kIndex)"
                      class="ml-2 text-red-500 hover:text-red-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!jsonResumeData.skills || jsonResumeData.skills.length === 0" class="text-center text-gray-500 py-4">
              No skills added yet
            </div>
          </div>

          <!-- Other sections would be implemented similarly -->
          <!-- For brevity, only the most important sections are shown here -->
          <div v-if="['projects', 'awards', 'publications', 'languages', 'interests', 'references'].includes(activeSection)" class="text-center text-gray-500 py-4">
            <p>This section is available in the full implementation</p>
            <p class="text-sm mt-2">The JSON Resume schema supports additional sections that would be implemented similarly to the ones shown above.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
