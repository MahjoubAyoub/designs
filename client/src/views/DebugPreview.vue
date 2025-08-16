<template>
  <div class="debug-preview">
    <h1>Preview Generation Debug</h1>
    <div class="debug-output">
      <h2>Debug Output:</h2>
      <pre ref="debugOutput">{{ debugLog }}</pre>
    </div>
    <button @click="runDebug" :disabled="isRunning">
      {{ isRunning ? 'Running...' : 'Run Debug' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { debugPreviewGeneration } from '@/debug/previewDebug.js';

const debugLog = ref('Waiting for debug to run...');
const isRunning = ref(false);

// Override console.log to capture output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const captureConsole = () => {
  const logs = [];
  
  console.log = (...args) => {
    logs.push('[LOG] ' + args.join(' '));
    debugLog.value = logs.join('\n');
    originalConsoleLog(...args);
  };
  
  console.error = (...args) => {
    logs.push('[ERROR] ' + args.join(' '));
    debugLog.value = logs.join('\n');
    originalConsoleError(...args);
  };
  
  console.warn = (...args) => {
    logs.push('[WARN] ' + args.join(' '));
    debugLog.value = logs.join('\n');
    originalConsoleWarn(...args);
  };
  
  return () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  };
};

const runDebug = async () => {
  isRunning.value = true;
  debugLog.value = 'Starting debug...';
  
  const restoreConsole = captureConsole();
  
  try {
    await debugPreviewGeneration();
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    restoreConsole();
    isRunning.value = false;
  }
};

onMounted(() => {
  // Auto-run debug after 1 second
  setTimeout(runDebug, 1000);
});
</script>

<style scoped>
.debug-preview {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-output {
  margin: 20px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}

.debug-output pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 500px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>