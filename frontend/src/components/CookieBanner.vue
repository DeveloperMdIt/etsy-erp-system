<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showBanner = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('cookieConsent')
  if (!consent) {
    showBanner.value = true
  }
})

const acceptAll = () => {
  localStorage.setItem('cookieConsent', 'all')
  showBanner.value = false
}

const acceptEssential = () => {
  localStorage.setItem('cookieConsent', 'essential')
  showBanner.value = false
}
</script>

<template>
  <div v-if="showBanner" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-slide-up">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex-1">
        <h3 class="font-bold text-gray-900 mb-1">Wir verwenden Cookies</h3>
        <p class="text-sm text-gray-600">
          Wir nutzen Cookies, um dir die bestmögliche Erfahrung auf unserer Website zu bieten. 
          Einige sind essenziell, andere helfen uns, unser Angebot zu verbessern.
          <a href="#" class="underline text-inventivy-blue hover:text-blue-700">Datenschutzerklärung</a>
        </p>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button @click="acceptEssential" class="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors whitespace-nowrap">
          Nur notwendige
        </button>
        <button @click="acceptAll" class="flex-1 md:flex-none px-4 py-2 bg-inventivy-blue text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors whitespace-nowrap shadow-sm shadow-blue-200">
          Alle akzeptieren
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
