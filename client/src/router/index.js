import { createRouter, createWebHistory } from 'vue-router'
// Landing
import HomeView from '@/views/HomeView.vue'
import ContactView from '@/views/ContactView.vue'
import AboutView from '@/views/AboutView.vue'
// Login/Signup
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import ForgetPassword from '@/views/ForgetPassword.vue'
// Dashboard
import DashboardView from '@/views/DashboardView.vue'
import DashboardArchive from '@/components/organisms/dashboard/TableApp.vue'
import DashboardSettings from '@/components/organisms/dashboard/UserProfile.vue'
import DashboardPublic from '@/components/organisms/dashboard/PublicTemplates.vue'
import DashboardNew from '@/components/organisms/dashboard/NewTemplates.vue'
// Design
import DesignView from '@/views/DesignView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/About',
      name: 'About',
      component: AboutView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'Signup',
      component: SignupView,
    },
    {
      path: '/reset',
      name: 'Reset',
      component: ForgetPassword,
    },
    {
      path: '/dashboard',
      component: DashboardView,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: DashboardArchive,
        },
        {
          path: 'public',
          name: 'Public',
          component: DashboardPublic,
        },
        {
          path: 'settings',
          name: 'Settings',
          component: DashboardSettings,
        },
        {
          path: 'templates',
          name: 'Templates',
          component: DashboardNew,
        },
      ],
    },
    {
      path: '/create',
      name: 'Create',
      component: DesignView,
    },
  ],
})

// Preline reinitialization helper
router.afterEach(async (to, from, failure) => {
  if (!failure) setTimeout(() => window.HSStaticMethods.autoInit(), 100)
})

export default router
