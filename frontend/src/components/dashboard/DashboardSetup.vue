<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <!-- Header -->
    <div class="p-6 pb-4 flex justify-between items-center border-b border-gray-100">
        <div>
            <h3 class="text-lg font-medium leading-6 text-gray-900">Richte deinen Account ein</h3>
            <p class="mt-1 text-sm text-gray-500">Führe folgende Schritte durch, um deinen Account vollständig nutzen zu können:</p>
        </div>
        <span v-if="!isComplete" class="text-red-500 bg-red-50 p-2 rounded-full">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </span>
    </div>
    
    <!-- Accordion List -->
    <div class="divide-y divide-gray-100">
        
       <!-- 1. Settings -->
       <div class="bg-white">
          <button @click="toggle('settings')" class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus:outline-none">
              <span class="font-medium text-gray-700">Grundlegende Einstellungen festlegen</span>
              <div class="flex items-center space-x-3">
                  <span v-if="setup.hasSettings" class="text-green-600"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></span>
                  <span v-else class="text-gray-400"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                  
                  <svg :class="{'rotate-180': openItem === 'settings'}" class="h-5 w-5 text-gray-400 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
          </button>
          <div v-show="openItem === 'settings'" class="bg-gray-50 px-4 pb-4 pt-2 border-t border-gray-100">
              <p class="text-sm text-gray-600 mb-4">Richte grundlegende Einstellungen z.B. Rechnungsnummern und Absenderdaten ein.</p>
              <div class="flex justify-end">
                  <router-link to="/settings" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none">
                      → Jetzt festlegen
                  </router-link>
              </div>
          </div>
       </div>

       <!-- 2. Shop -->
       <div class="bg-white">
          <button @click="toggle('shop')" class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus:outline-none">
              <span class="font-medium text-gray-700">Shop hinzufügen</span>
              <div class="flex items-center space-x-3">
                  <span v-if="setup.hasEtsy" class="text-green-600"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></span>
                  <span v-else class="text-gray-400"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                  
                   <svg :class="{'rotate-180': openItem === 'shop'}" class="h-5 w-5 text-gray-400 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
          </button>
          <div v-show="openItem === 'shop'" class="bg-gray-50 px-4 pb-4 pt-2 border-t border-gray-100">
              <p class="text-sm text-gray-600 mb-4">Verbinde einen Shop, um Bestellungen automatisch zu importieren.</p>
              <div class="flex justify-end">
                  <router-link to="/etsy-connect" class="inline-flex items-center btn-success focus:outline-none">
                      → Zu den Shops
                  </router-link>
              </div>
          </div>
       </div>

       <!-- 3. Shipping -->
       <div class="bg-white">
          <button @click="toggle('shipping')" class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus:outline-none">
              <span class="font-medium text-gray-700">Versandwege einrichten</span>
              <div class="flex items-center space-x-3">
                  <span v-if="setup.hasShipping" class="text-green-600"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></span>
                  <span v-else class="text-gray-400"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                  
                   <svg :class="{'rotate-180': openItem === 'shipping'}" class="h-5 w-5 text-gray-400 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
          </button>
          <div v-show="openItem === 'shipping'" class="bg-gray-50 px-4 pb-4 pt-2 border-t border-gray-100">
              <p class="text-sm text-gray-600 mb-4">Konfiguriere DHL und Deutsche Post für den Versand.</p>
              <div class="flex justify-end">
                  <router-link to="/settings/shipping" class="inline-flex items-center btn-success focus:outline-none">
                      → Zu den Versandwegen
                  </router-link>
              </div>
          </div>
       </div>

       <!-- 4. Layouts -->
       <div class="bg-white">
          <button @click="toggle('layout')" class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus:outline-none">
              <span class="font-medium text-gray-700">Rechnungslayout festlegen</span>
              <div class="flex items-center space-x-3">
                  <span v-if="setup.hasLayout" class="text-green-600"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></span>
                  <span v-else class="text-gray-400"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                  
                   <svg :class="{'rotate-180': openItem === 'layout'}" class="h-5 w-5 text-gray-400 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
          </button>
           <div v-show="openItem === 'layout'" class="bg-gray-50 px-4 pb-4 pt-2 border-t border-gray-100">
              <p class="text-sm text-gray-600 mb-4">Lade ein Logo hoch und passe dein Rechnungsdesign an.</p>
              <div class="flex justify-end">
                  <router-link to="/settings/config" class="inline-flex items-center btn-success focus:outline-none">
                      → Zum Layout
                  </router-link>
              </div>
          </div>
       </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  setup: {
    hasSettings: boolean
    hasShop: boolean
    hasEtsy: boolean
    hasShipping: boolean
    hasLayout: boolean
  }
}>()

const openItem = ref<string | null>(null);

const toggle = (item: string) => {
    openItem.value = openItem.value === item ? null : item;
}

const isComplete = computed(() => {
    return props.setup.hasSettings && props.setup.hasEtsy && props.setup.hasShipping && props.setup.hasLayout
})

// Auto-open first incomplete item on mount could be nice, but maybe annoying.
// Let's keep closed by default or open the first one?
// Logic: If incomplete, maybe helpful to see what to do.
</script>
