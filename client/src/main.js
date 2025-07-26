import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import VueKonva from 'vue-konva'

// Components
import Icon from '@/components/atoms/BaseIcon.vue'
import Button from '@/components/atoms/BaseButton.vue'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

// Modules
import 'preline/dist/index.js'

// Create App
const app = createApp(App)

// Router
app.use(router)

//Konva
app.use(VueKonva)

// Global Components
app.component('BaseIcon', Icon)
app.component('BaseButton', Button)
app.component('EasyDataTable', Vue3EasyDataTable)

// Mount
app.mount('#app')
