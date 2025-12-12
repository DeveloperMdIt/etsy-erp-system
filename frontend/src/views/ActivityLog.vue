
<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Aktivitätenprotokoll</h1>
        <p class="mt-2 text-sm text-gray-700">Eine Liste aller Ereignisse, Synchronisierungen und Systemmeldungen.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button type="button" @click="fetchLogs" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">Aktualisieren</button>
      </div>
    </div>
    
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Zeitpunkt</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Typ</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aktion</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="log in logs" :key="log.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">{{ formatDate(log.createdAt) }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span :class="getTypeClass(log.type)" class="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
                      {{ log.type }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ log.action }}</td>
                  <td class="px-3 py-4 text-sm text-gray-500 max-w-md truncate" :title="log.details">{{ log.details }}</td>
                </tr>
                <tr v-if="logs.length === 0">
                    <td colspan="4" class="text-center py-4 text-gray-500">Keine Protokolleinträge gefunden.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface ActivityLog {
    id: string;
    createdAt: string;
    type: string;
    action: string;
    details: string;
}

const logs = ref<ActivityLog[]>([]);

const getTypeClass = (type: string) => {
    switch (type) {
        case 'SUCCESS': return 'bg-green-100 text-green-800';
        case 'ERROR': return 'bg-red-100 text-red-800';
        case 'WARNING': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('de-DE');
};

const fetchLogs = async () => {
    try {
        // Need to add API endpoint for getting logs.
        // Assuming GET /api/activity-logs exists or we add it to auth/me?
        // Or create new routes file. I will add to etsy.routes.ts for now or create generic route.
        // Implementation Plan said "Helper...".
        // I will add a simple route in index.ts or new file.
        // For now, let's assume /api/logs
        const updatedLogs = await axios.get('/api/logs'); // Need to implement this backend route!
        logs.value = updatedLogs.data;
    } catch (e) {
        console.error('Failed to fetch logs', e);
        // Mock data for UI dev if backend fails
        /*
        logs.value = [
            { id: '1', createdAt: new Date().toISOString(), type: 'SUCCESS', action: 'LOGIN', details: 'User logged in' },
            { id: '2', createdAt: new Date().toISOString(), type: 'INFO', action: 'ETSY_SYNC', details: 'Started auto sync' },
            { id: '3', createdAt: new Date().toISOString(), type: 'ERROR', action: 'IMPORT_ORDERS', details: 'API Error 500' }
        ];
        */
    }
};

onMounted(() => {
    fetchLogs();
});
</script>
