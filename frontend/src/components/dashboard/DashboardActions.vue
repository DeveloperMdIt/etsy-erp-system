<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Was ist heute zu tun</h3>
    
    <div class="space-y-4">
      <!-- Import Action -->
      <div v-if="stats.totalOrders === 0" class="flex items-start space-x-3 text-sm">
         <span class="text-yellow-500 mt-0.5">
           <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </span>
         <div>
            <p class="font-medium text-gray-900">Bestellungen einlesen</p>
            <p class="text-gray-500">Du hast noch keine Bestellungen. <router-link to="/import" class="text-inventivy-blue font-medium hover:underline">Jetzt importieren</router-link></p>
         </div>
      </div>

      <!-- Open Orders Action -->
      <div v-else-if="stats.openOrders > 0" class="flex items-start space-x-3 text-sm">
         <span class="text-green-500 mt-0.5">
           <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
         </span>
         <div>
            <p class="font-medium text-gray-900">Bestellungen versenden</p>
            <p class="text-gray-500">Du hast <strong>{{ stats.openOrders }}</strong> offene, bezahlte Bestellungen. <router-link to="/orders" class="text-inventivy-blue font-medium hover:underline">Jetzt bearbeiten</router-link></p>
         </div>
      </div>

       <div v-else class="flex items-start space-x-3 text-sm">
         <span class="text-green-500 mt-0.5">
           <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </span>
         <div>
            <p class="font-medium text-gray-900">Alles erledigt!</p>
            <p class="text-gray-500">Aktuell gibt es keine offenen To-Dos.</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    openOrders: number
    totalOrders: number
  }
}>()
</script>
