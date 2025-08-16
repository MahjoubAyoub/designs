<template>
  <div class="simple-debug">
    <h1>Simple Preview Debug</h1>
    <button @click="testPreview" :disabled="isRunning">
      {{ isRunning ? 'Testing...' : 'Test Preview Generation' }}
    </button>
    <div class="results" v-if="results.length > 0">
      <h2>Results:</h2>
      <div v-for="(result, index) in results" :key="index" class="result-item">
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { generatePolotnoPreviewById } from '@/services/polotnoPreviewService.js';
import { getAllDesigns } from '@/api/designs.js';

const isRunning = ref(false);
const results = ref([]);

const testPreview = async () => {
  isRunning.value = true;
  results.value = [];
  
  // Capture console logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  const captureLog = (level, ...args) => {
    results.value.push(`[${level.toUpperCase()}] ${args.join(' ')}`);
  };
  
  console.log = (...args) => {
    originalConsoleLog(...args);
    captureLog('log', ...args);
  };
  
  console.error = (...args) => {
    originalConsoleError(...args);
    captureLog('error', ...args);
  };
  
  console.warn = (...args) => {
    originalConsoleWarn(...args);
    captureLog('warn', ...args);
  };
  
  try {
    results.value.push('🔧 Starting simple preview test...');
    
    // Check environment
    results.value.push(`🔑 Polotno Key: ${import.meta.env.VITE_POLOTNO_KEY ? 'SET' : 'NOT SET'}`);
    
    // Fetch designs
    results.value.push('📋 Fetching designs...');
    const designs = await getAllDesigns();
    results.value.push(`📋 Found ${designs.length} designs`);
    
    if (designs.length > 0) {
      const firstDesign = designs[0];
      results.value.push(`🎯 Testing with design: ${firstDesign.name} (ID: ${firstDesign.id})`);
      
      // Log design structure
      results.value.push(`📊 Design structure: ${JSON.stringify({
        id: firstDesign.id,
        name: firstDesign.name,
        hasData: !!firstDesign.data,
        dataType: typeof firstDesign.data,
        hasImageUrl: !!firstDesign.imageUrl,
        imageUrl: firstDesign.imageUrl
      }, null, 2)}`);
      
      try {
        results.value.push('🚀 Generating preview...');
        const preview = await generatePolotnoPreviewById(firstDesign.id);
        results.value.push('✅ Preview generated successfully!');
        results.value.push(`📸 Preview URL length: ${preview ? preview.length : 'null'}`);
        results.value.push(`📸 Preview starts with: ${preview ? preview.substring(0, 50) + '...' : 'null'}`);
      } catch (error) {
        results.value.push(`❌ Preview generation failed: ${error.message}`);
        results.value.push(`🔍 Error stack: ${error.stack}`);
        results.value.push(`🔍 Error name: ${error.name}`);
      }
    } else {
      results.value.push('❌ No designs found in database');
    }
    
  } catch (error) {
    results.value.push(`❌ Test failed: ${error.message}`);
    results.value.push(`🔍 Error stack: ${error.stack}`);
  } finally {
    // Restore console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    isRunning.value = false;
  }
};

// Auto-run test when component mounts
onMounted(() => {
  setTimeout(() => {
    testPreview();
  }, 1000); // Wait 1 second for component to fully load
});
</script>

<style scoped>
.simple-debug {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.results {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}

.result-item {
  margin-bottom: 10px;
  padding: 5px;
  background-color: white;
  border-radius: 3px;
}

.result-item pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
</style>