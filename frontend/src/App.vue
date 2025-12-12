<script setup lang="ts">
import { ref, provide, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Notifications from './components/Notifications.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

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
  <div class="min-h-screen bg-gray-100 font-sans text-gray-900">
    <!-- Navigation - Only show when authenticated -->
    <nav v-if="isAuthenticated && !isPublicRoute" class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-indigo-600">🛍️ Etsy ERP</span>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link to="/" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </router-link>
              <router-link to="/orders" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Bestellungen
              </router-link>
              <router-link to="/products" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Produkte
              </router-link>
              <router-link to="/customers" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Kunden
              </router-link>
              <router-link to="/import" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Import
              </router-link>
              <router-link to="/activity-log" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Ereignisse
              </router-link>
            </div>
          </div>
          
          <!-- User Dropdown Menu -->
          <div class="flex items-center gap-4 relative">
             <div class="relative">
                <button 
                  @click="isMenuOpen = !isMenuOpen"
                  class="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div class="flex flex-col items-end mr-2">
                     <span class="font-bold">{{ currentUser?.firstName || currentUser?.email }}</span>
                     <span v-if="currentUser?.shopName" class="text-xs text-gray-500">{{ currentUser.shopName }}</span>
                  </div>
                  <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                    {{ (currentUser?.firstName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase() }}
                  </div>
                  <svg class="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Dropdown -->
                <div 
                  v-if="isMenuOpen" 
                  class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transform origin-top-right"
                >
                  <div class="py-1" role="menu" aria-orientation="vertical">
                    
                    <div class="px-4 py-3 border-b border-gray-100">
                      <p class="text-sm">Angemeldet als</p>
                      <p class="text-sm font-medium text-gray-900 truncate">{{ currentUser?.email }}</p>
                    </div>

                    <router-link to="/profile" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Profil</router-link>
                    <router-link to="/etsy-connect" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Etsy Zugang</router-link>
                    <router-link to="/settings" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Dokumenten Einstellungen</router-link>
                    <router-link to="/settings/shipping" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Versandeinstellungen</router-link>
                    
                    <div class="border-t border-gray-100"></div>
                    
                    <button 
                      @click="logout"
                      class="w-full text-left block px-4 py-2 text-sm text-red-700 hover:bg-gray-100" 
                      role="menuitem"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
                
                <!-- Overlay to close -->
                <div v-if="isMenuOpen" @click="isMenuOpen = false" class="fixed inset-0 z-40" style="cursor: default;"></div>
             </div>
          </div>
        </div>
      </div>
    </nav>

    <main :class="isPublicRoute ? '' : 'py-10'">
      <div :class="isPublicRoute ? '' : 'max-w-7xl mx-auto sm:px-6 lg:px-8'">
        <router-view></router-view>
      </div>
    </main>

    <!-- Global Components -->
    <Notifications ref="notificationsRef" />
    <ConfirmDialog ref="confirmDialogRef" />
  </div>
</template>
