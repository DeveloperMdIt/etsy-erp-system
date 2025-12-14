<script setup lang="ts">
import { ref } from 'vue'
import Logo from './Logo.vue'

defineProps<{
  // Optional props if needed in future
}>()

const isMobileMenuOpen = ref(false)
</script>

<template>
    <nav class="absolute w-full z-10 top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/">
             <Logo logoClass="h-10" />
            </router-link>
          </div>
          
          <!-- Desktop Navigation -->
          <div class="hidden md:flex space-x-8">
            <router-link to="/#features" class="text-gray-600 hover:text-inventivy-blue font-medium">Funktionen</router-link>
            <router-link to="/pricing" class="text-gray-600 hover:text-inventivy-blue font-medium">Preise</router-link>
            <router-link to="/#about" class="text-gray-600 hover:text-inventivy-blue font-medium">Über uns</router-link>
          </div>

          <!-- Actions -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link to="/login" class="text-gray-600 hover:text-inventivy-blue font-medium">Login</router-link>
            <router-link to="/register" class="bg-inventivy-blue text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Kostenlos testen
            </router-link>
          </div>

           <!-- Mobile menu button -->
           <div class="md:hidden flex items-center">
            <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-inventivy-blue">
              <span class="sr-only">Open main menu</span>
              <!-- Menu icon -->
              <svg v-if="!isMobileMenuOpen" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Close icon -->
              <svg v-else class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

       <!-- Mobile Menu -->
       <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-t border-gray-100">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link to="/#features" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Funktionen</router-link>
          <router-link to="/pricing" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Preise</router-link>
          <router-link to="/#about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Über uns</router-link>
          <router-link to="/login" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Login</router-link>
          <router-link to="/register" class="block w-full text-center px-4 py-2 mt-4 border border-transparent text-base font-medium rounded-md text-white bg-inventivy-blue hover:bg-blue-700">Kostenlos testen</router-link>
        </div>
      </div>
    </nav>
</template>
