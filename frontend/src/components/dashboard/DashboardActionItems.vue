<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Was ist heute zu tun</h3>
    
    <div class="space-y-4">
      <!-- Open Orders (Import) -->
      <div v-if="stats.openOrders === 0" class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3">
            <h4 class="text-sm font-medium text-gray-900">Bestellungen einlesen</h4>
            <p class="mt-1 text-sm text-gray-500">Du hast noch keine offenen Bestellungen.</p>
            <div class="mt-2">
                <router-link to="/orders" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Jetzt importieren &rarr;
                </router-link>
            </div>
        </div>
      </div>
      
      <!-- Open Orders (To Process) -->
      <div v-else class="flex items-start">
         <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div class="ml-3">
             <h4 class="text-sm font-medium text-gray-900">{{ stats.openOrders }} offene Bestellungen</h4>
             <p class="mt-1 text-sm text-gray-500">Diese warten darauf, bearbeitet und versendet zu werden.</p>
              <div class="mt-2">
                <router-link to="/orders" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Zur Bearbeitung &rarr;
                </router-link>
            </div>
        </div>
      </div>

       <!-- Connect Etsy (if no products) -->
       <div v-if="stats.productsCount === 0" class="flex items-start border-t border-gray-100 pt-4">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div class="ml-3">
            <h4 class="text-sm font-medium text-gray-900">Shop verbinden</h4>
            <p class="mt-1 text-sm text-gray-500">Es wurden noch keine Produkte importiert.</p>
            <div class="mt-2">
                <router-link to="/settings/channels" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Verbindung prüfen &rarr;
                </router-link>
            </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
    stats: {
        openOrders: number
        productsCount: number
    }
}>()
</script>
