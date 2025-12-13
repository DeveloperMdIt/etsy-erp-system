<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Letzte Fehlerereignisse</h3>
        <router-link to="/activity-log" class="text-sm text-indigo-600 hover:text-indigo-800">Alle Ereignisse →</router-link>
    </div>

    <div v-if="errors.length > 0" class="overflow-hidden">
        <ul role="list" class="-my-5 divide-y divide-gray-200">
            <li v-for="error in errors" :key="error.id" class="py-4">
                <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-900">{{ error.action }}</p>
                        <p class="truncate text-sm text-gray-500">{{ error.details || 'Keine Details' }}</p>
                    </div>
                    <div>
                        <span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {{ formatDate(error.createdAt) }}
                        </span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
    <div v-else class="text-sm text-gray-500 py-4 text-center">
        Keine kritischen Fehler gefunden. 🎉
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  errors: any[]
}>()

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('de-DE', { month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})
}
</script>
