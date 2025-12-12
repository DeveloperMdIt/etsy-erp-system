<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Etsy Verbindung</h1>
        <p class="mt-2 text-sm text-gray-700">Verwalten Sie Ihre Verbindung zu Etsy und die Synchronisierungseinstellungen.</p>
      </div>
    </div>

    <div class="mt-8 bg-white overflow-hidden shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Status</h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
          <p v-if="isConnected">Verbunden mit Shop: <strong>{{ shopName }}</strong></p>
          <p v-else>Nicht verbunden.</p>
        </div>
        <div class="mt-5">
          <button v-if="!isConnected" @click="connectEtsy" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
            Mit Etsy verbinden
          </button>
          <button v-else @click="showDisconnectModal = true" type="button" class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
            Trennen
          </button>
        </div>
      </div>
    </div>

    <div v-if="isConnected" class="mt-8 bg-white overflow-hidden shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Synchronisierung</h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
          <p>Starten Sie manuell einen Import der neuesten Bestellungen oder Produkte, oder konfigurieren Sie den automatischen Abgleich.</p>
        </div>
        
        <div class="mt-5 flex gap-4 flex-wrap">
            <button @click="triggerSync('orders')" :disabled="isSyncing" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50">
               <span v-if="isSyncing && syncType === 'orders'">Synchronisiere...</span>
               <span v-else>Bestellungen synchronisieren</span>
            </button>
            
            <button @click="triggerSync('products')" :disabled="isSyncing" class="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">
               <span v-if="isSyncing && syncType === 'products'">Synchronisiere...</span>
               <span v-else>Produkte synchronisieren</span>
            </button>
        </div>
      </div>
    </div>

    <!-- Sync Modal -->
    <div v-if="showSyncModal" class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <div :class="syncStatus === 'error' ? 'bg-red-100' : syncStatus === 'success' ? 'bg-green-100' : 'bg-blue-100'" class="mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                <!-- Loading Icon -->
                <svg v-if="syncStatus === 'loading'" class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <!-- Success Icon -->
                <svg v-else-if="syncStatus === 'success'" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <!-- Error Icon -->
                <svg v-else-if="syncStatus === 'error'" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                  {{ syncModalTitle }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">{{ syncModalMessage }}</p>
                  <div v-if="syncDetails" class="mt-3 text-left bg-gray-50 rounded p-3 text-xs font-mono text-gray-700 max-h-48 overflow-y-auto">
                    {{ syncDetails }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6">
              <button v-if="syncStatus !== 'loading'" type="button" @click="closeSyncModal" class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Schließen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Disconnect Modal -->
    <div v-if="showDisconnectModal" class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Etsy-Verbindung trennen?</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Möchten Sie die Verbindung zu Ihrem Etsy-Shop wirklich trennen? Sie müssen sich erneut verbinden, um Bestellungen und Produkte zu synchronisieren.</p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button type="button" @click="disconnectEtsy" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:col-start-2">
                Trennen
              </button>
              <button type="button" @click="showDisconnectModal = false" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const isConnected = ref(false);
const shopName = ref('');
const isSyncing = ref(false);
const syncType = ref<'orders' | 'products' | null>(null);

// Sync Modal State
const showSyncModal = ref(false);
const syncStatus = ref<'loading' | 'success' | 'error' | null>(null);
const syncModalTitle = ref('');
const syncModalMessage = ref('');
const syncDetails = ref('');

onMounted(async () => {
  await checkStatus();
  
  if (route.query.success) {
      // Wait a bit for tokens to be saved, then reload status
      setTimeout(async () => {
          await checkStatus();
      }, 500);
      window.history.replaceState({}, document.title, window.location.pathname);
  } else if (route.query.error) {
      const error = route.query.error;
      const details = route.query.details ? JSON.parse(decodeURIComponent(route.query.details as string)) : '';
      
      alert(`Verbindung fehlgeschlagen: ${error}\n${details}`);
      console.error('Callback Error:', error, details);
      window.history.replaceState({}, document.title, window.location.pathname);
  }
});

const checkStatus = async () => {
    try {
        const res = await axios.get('/api/etsy/status');
        isConnected.value = res.data.isConnected;
        shopName.value = res.data.shopName;
    } catch (e) {
        console.error('Status check failed', e);
    }
};

const connectEtsy = async () => {
    try {
        console.log('Starting Etsy OAuth connection...');
        const res = await axios.get('/api/etsy/connect');
        console.log('Got authorization URL:', res.data.url);
        
        if (res.data.url) {
            console.log('Redirecting to Etsy...');
            // Use window.location.replace to force navigation
            setTimeout(() => {
                window.location.replace(res.data.url);
            }, 100);
        } else {
            console.error('No URL received from server');
            alert('Fehler: Keine Etsy-URL erhalten');
        }
    } catch (e) {
        console.error('Connect failed', e);
        alert('Fehler beim Verbinden mit Etsy: ' + e);
    }
};

// Disconnect Modal State
const showDisconnectModal = ref(false);

const disconnectEtsy = async () => {
    showDisconnectModal.value = false;
    try {
        await axios.post('/api/etsy/disconnect');
        isConnected.value = false;
        shopName.value = '';
    } catch (e) {
        console.error('Disconnect failed', e);
    }
};

const triggerSync = async (type: 'orders' | 'products') => {
    isSyncing.value = true;
    syncType.value = type;
    showSyncModal.value = true;
    syncStatus.value = 'loading';
    syncModalTitle.value = type === 'orders' ? 'Bestellungen werden synchronisiert' : 'Produkte werden synchronisiert';
    syncModalMessage.value = 'Bitte warten Sie, während die Daten von Etsy abgerufen werden... Das kann einen Moment dauern.';
    syncDetails.value = 'Starte Synchronisation...';
    
    const startTime = new Date();
    
    try {
        const endpoint = type === 'orders' ? '/api/etsy/sync-orders' : '/api/etsy/sync-products';
        await axios.post(endpoint);
        
        // Start Polling for Result
        const pollInterval = setInterval(async () => {
             if (!showSyncModal.value) {
                 clearInterval(pollInterval);
                 return;
             }

             try {
                 const logsRes = await axios.get('/api/logs?limit=10');
                 const logs = logsRes.data.logs || [];
                 
                 // Look for relevant logs after start time
                 const recentLogs = logs.filter((l: any) => new Date(l.createdAt) >= startTime);
                 
                 // Check for Completion Signals
                 const successLog = recentLogs.find((l: any) => 
                    (type === 'orders' && (l.action === 'IMPORT_ORDERS' || l.action === 'SYNC_ORDERS_SUCCESS')) ||
                    (type === 'products' && (l.action === 'IMPORT_PRODUCTS' || l.action === 'SYNC_PRODUCTS_SUCCESS'))
                 );
                 
                 const errorLog = recentLogs.find((l: any) => 
                    l.action === 'SYNC_ORDERS_FAILED' || l.action === 'SYNC_PRODUCTS_FAILED' || l.type === 'ERROR'
                 );

                 // Update progress with latest relevant log if not finished
                 if (!successLog && !errorLog && recentLogs.length > 0) {
                     // Since logs are likely sorted desc by default (check API), the first one is newest
                     const latestLog = recentLogs[0];
                     if (latestLog && latestLog.details) {
                         syncModalMessage.value = latestLog.details;
                     }
                 }

                 if (successLog) {
                     clearInterval(pollInterval);
                     syncStatus.value = 'success';
                     syncModalTitle.value = 'Synchronisation erfolgreich';
                     syncModalMessage.value = successLog.details;
                     syncDetails.value = JSON.stringify(successLog.metadata || {}, null, 2);
                     isSyncing.value = false;
                 } else if (errorLog) {
                     clearInterval(pollInterval);
                     syncStatus.value = 'error';
                     syncModalTitle.value = 'Synchronisation fehlgeschlagen';
                     syncModalMessage.value = errorLog.details;
                     syncDetails.value = JSON.stringify(errorLog.metadata || {}, null, 2);
                     isSyncing.value = false;
                 } else {
                     // Update info if any intermediate logs (optional)
                     // syncDetails.value = 'Warte auf Ergebnis...';
                 }
             } catch (e) {
                 console.error('Polling error', e);
             }
        }, 2000);

        // Timeout after 60s
        setTimeout(() => {
            if (isSyncing.value) {
                clearInterval(pollInterval);
                isSyncing.value = false;
                syncStatus.value = 'success'; // Assume success or just timeout
                syncModalTitle.value = 'Synchronisation läuft im Hintergrund';
                syncModalMessage.value = 'Die Synchronisation dauert länger als erwartet. Bitte prüfen Sie später das Ereignis-Protokoll.';
            }
        }, 60000);

    } catch (e: any) {
        console.error('Sync trigger failed', e);
        syncStatus.value = 'error';
        syncModalTitle.value = 'Fehler beim Starten';
        syncModalMessage.value = e.message;
        isSyncing.value = false;
    }
};

const closeSyncModal = () => {
    showSyncModal.value = false;
    syncStatus.value = null;
    syncDetails.value = '';
};
</script>
