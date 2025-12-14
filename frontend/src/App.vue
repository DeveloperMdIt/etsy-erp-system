<script setup lang="ts">
import { ref, provide, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Notifications from './components/Notifications.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import Breadcrumbs from './components/Breadcrumbs.vue'
import Sidebar from './components/Sidebar.vue'
import CookieBanner from './components/CookieBanner.vue'

const router = useRouter()
const route = useRoute()
const notificationsRef = ref()
const confirmDialogRef = ref()
const isMenuOpen = ref(false)

// Provide to all child components
provide('notifications', notificationsRef)
provide('confirmDialog', confirmDialogRef)

const isAuthenticated = ref(!!localStorage.getItem('authToken'))

const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'))

const updateCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  currentUser.value = userStr ? JSON.parse(userStr) : null
  isAuthenticated.value = !!localStorage.getItem('authToken')
}

// Watch for route changes to update auth state (fallback)
watch(
  () => route.path,
  () => {
    updateCurrentUser()
    isMenuOpen.value = false
  }
)

// Listen for custom login event
window.addEventListener('user-login', updateCurrentUser)

const isPublicRoute = computed(() => {
  return route.meta.public === true
})

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  currentUser.value = null
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex font-sans text-gray-900">
    
    <!-- Sidebar (Left) -->
    <Sidebar v-if="isAuthenticated && !isPublicRoute" 
        :user="currentUser" 
        :collapsed="false" 
        @logout="logout" 
        class="z-50"
    />

    <!-- Main Content (Right) -->
    <div class="flex-1 flex flex-col transition-all duration-300" :class="(isAuthenticated && !isPublicRoute) ? 'ml-64' : ''">
        
        <!-- Top Header / Breadcrumbs Area -->
        <header v-if="isAuthenticated && !isPublicRoute" class="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 shadow-sm">
            <!-- Breadcrumbs -->
            <Breadcrumbs />

            <!-- Right Side Header Actions (Notification / User fallback) -->
             <div class="flex items-center space-x-4">
                 <!-- Notification Icon (Placeholder or Real) -->
                  <button class="text-gray-400 hover:text-gray-500 relative">
                     <span class="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" v-if="false"></span>
                     <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </button>
             </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6">
             <router-view></router-view>
        </main>

    </div>

    <!-- Global Components -->
    <Notifications ref="notificationsRef" />
    <ConfirmDialog ref="confirmDialogRef" />
    <CookieBanner />
  </div>
</template>
