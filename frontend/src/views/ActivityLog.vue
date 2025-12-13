
<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Aktivitätenprotokoll</h1>
        <p class="mt-2 text-sm text-gray-700">Eine Liste aller Ereignisse, Synchronisierungen und Systemmeldungen.</p>
      </div>
    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3 flex items-center">
        <!-- Filter Type -->
        <select v-model="selectedType" @change="fetchLogs" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            <option value="">Alle Typen</option>
            <option value="SUCCESS">Erfolg</option>
            <option value="ERROR">Fehler</option>
            <option value="WARNING">Warnung</option>
            <option value="INFO">Info</option>
        </select>

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
                <tr 
                    v-for="log in logs" 
                    :key="log.id" 
                    class="hover:bg-gray-50 cursor-pointer transition-colors"
                    @click="openDetails(log)"
                >
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">{{ formatDate(log.createdAt) }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span :class="getTypeClass(log.type)" class="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
                      {{ log.type }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ log.action }}</td>
                  <td class="px-3 py-4 text-sm text-gray-500 max-w-md truncate" :title="log.details">{{ getShortDetails(log.details) }}</td>
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

    <!-- Details Modal -->
    <div v-if="selectedLog" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto" @click="closeDetails">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full flex flex-col max-h-[90vh]" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Protokoll Details</h3>
            <p class="text-sm text-gray-500">{{ formatDate(selectedLog.createdAt) }} - {{ selectedLog.action }}</p>
          </div>
           <span :class="getTypeClass(selectedLog.type)" class="inline-flex rounded-full px-3 py-1 text-xs font-bold">
              {{ selectedLog.type }}
           </span>
        </div>
        
        <div class="p-6 overflow-y-auto font-mono text-xs bg-slate-50">
            <div class="mb-4">
                <span class="block font-semibold text-gray-700 mb-1">Raw Details:</span>
                <pre class="bg-white p-3 border rounded overflow-x-auto whitespace-pre-wrap break-words">{{ formatDetails(selectedLog.details) }}</pre>
            </div>
            <div>
                <span class="block font-semibold text-gray-700 mb-1">Full Object:</span>
                <pre class="bg-white p-3 border rounded overflow-x-auto">{{ JSON.stringify(selectedLog, null, 2) }}</pre>
            </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-white flex justify-end rounded-b-lg">
          <button 
            @click="closeDetails"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm border border-gray-300"
          >
            Schließen
          </button>
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
const selectedType = ref('');
const selectedLog = ref<ActivityLog | null>(null);

const getTypeClass = (type: string) => {
    switch (type) {
        case 'SUCCESS': return 'bg-green-100 text-green-800';
        case 'ERROR': return 'bg-red-100 text-red-800';
        case 'WARNING': return 'bg-yellow-100 text-yellow-800';
        case 'INFO': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('de-DE');
};

const fetchLogs = async () => {
    try {
        const params: any = {};
        if (selectedType.value) params.type = selectedType.value;
        
        const response = await axios.get('/api/logs', { params });
        logs.value = response.data;
    } catch (e) {
        console.error('Failed to fetch logs', e);
    }
};

const openDetails = (log: ActivityLog) => {
    selectedLog.value = log;
}

const closeDetails = () => {
    selectedLog.value = null;
}

const getShortDetails = (details: string) => {
    if (!details) return '-';
    // If it's a JSON string, try to parse just the message/title?
    // For now, just truncate
    return details.length > 80 ? details.substring(0, 80) + '...' : details;
}

const formatDetails = (details: string) => {
    try {
        const parsed = JSON.parse(details);
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        return details;
    }
}

onMounted(() => {
    fetchLogs();
});
</script>
