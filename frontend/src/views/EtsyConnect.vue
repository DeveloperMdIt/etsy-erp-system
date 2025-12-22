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
        <div class="mt-2 text-sm text-gray-500">
          <p v-if="isConnected">Verbunden mit Shop: <strong>{{ shopName }}</strong></p>
          <p v-else>Nicht verbunden.</p>

          <div v-if="isConnected && scopes.length > 0" class="mt-4">
             <p class="mb-2 font-medium text-gray-700">Aktive Berechtigungen (Scopes):</p>
             <div class="flex flex-wrap gap-2">
                <span 
                  v-for="scope in allExpectedScopes" 
                  :key="scope"
                  :class="[
                    scopes.includes(scope) 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-50 text-red-800 border-red-200',
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border'
                  ]"
                >
                  <span v-if="scopes.includes(scope)" class="mr-1">✓</span>
                  <span v-else class="mr-1">✕</span>
                  {{ scope }}
                </span>
             </div>
             
             <!-- Dynamic Warning for Critical Scopes -->
             <div v-if="!scopes.includes('address_r') || !scopes.includes('email_r') || !scopes.includes('billing_r')" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 class="text-sm font-bold text-red-800 flex items-center">
                    <span class="mr-2">⚠️</span> Fehlende Berechtigungen
                </h4>
                <p class="mt-1 text-sm text-red-700">
                    Folgende wichtige Berechtigungen fehlen noch:
                    <strong class="font-mono ml-1">
                        {{ [
                            !scopes.includes('address_r') ? 'address_r' : '',
                            !scopes.includes('email_r') ? 'email_r' : '',
                            !scopes.includes('billing_r') ? 'billing_r' : ''
                        ].filter(Boolean).join(', ') }}
                    </strong>
                </p>
                <div class="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded">
                    <strong>Lösung:</strong>
                    <ol class="list-decimal ml-4 mt-1 space-y-1">
                        <li>Klicken Sie unten auf <b>"Trennen"</b>.</li>
                        <li>Gehen Sie auf <a href="https://www.etsy.com/your/account/apps" target="_blank" class="underline text-blue-700">Etsy.com -> Konto -> Apps</a>.</li>
                        <li>Suchen Sie diese App und klicken Sie auf <b>"Zugriff entfernen" (Revoke/X)</b>. <br/>(Das ist ZWINGEND notwendig, damit Etsy die neuen Rechte abfragt!)</li>
                        <li>Verbinden Sie die App hier erneut.</li>
                    </ol>
                </div>
                
             </div>

             <!-- Always Visible Technical Details -->
             <div class="mt-4 pt-4 border-t border-gray-100">
                 <button @click="showDebug = !showDebug" class="text-xs text-gray-500 underline hover:text-gray-700">
                     {{ showDebug ? 'Technische Details ausblenden' : 'Technische Diagnose-Daten anzeigen' }}
                 </button>
                 <div v-if="showDebug" class="mt-2">
                     <p class="text-xs font-semibold text-gray-600">Server Probe Log:</p>
                     <pre class="bg-slate-50 p-2 rounded border border-gray-200 text-xs overflow-x-auto mt-1 text-gray-600 font-mono">{{ debugInfo?.probeLog || 'Keine Logs verfügbar' }}</pre>
                     
                     <div class="flex gap-4 mt-2">
                         <div>
                             <p class="text-xs font-semibold text-gray-600">API Version:</p>
                             <span class="text-xs font-mono bg-slate-100 px-1 rounded">{{ debugInfo?.version || 'Unknown' }}</span>
                         </div>
                         <div>
                             <p class="text-xs font-semibold text-gray-600">Error Code:</p>
                             <span class="text-xs font-mono bg-slate-100 px-1 rounded">{{ debugInfo?.error || 'None' }}</span>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
          <div v-if="isConnected && scopes.length === 0" class="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
             <h4 class="text-sm font-bold text-yellow-800 mb-1">Diagnose-Informationen</h4>
             <p class="text-xs text-yellow-700">Es konnten keine Berechtigungen (Scopes) ermittelt werden.</p>
             <p class="text-xs text-yellow-700 mt-1">Backend Debug Info:</p>
             <pre class="text-xs mt-1 p-2 bg-white rounded border border-gray-200 overflow-x-auto">{{ debugInfo }}</pre>
          </div>

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

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div>
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Verbindung erfolgreich!</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Ihr Etsy-Shop "<strong>{{ shopName }}</strong>" wurde erfolgreich verbunden.
                  </p>
                  <p class="mt-2 text-sm text-gray-500">
                    Wir empfehlen, jetzt einmalig Ihre Produkte und Bestellungen zu importieren.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button type="button" @click="closeSuccessModal(); triggerSync('orders')" class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2">
                Jetzt Synchronisieren
              </button>
              <button type="button" @click="closeSuccessModal" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">
                Später
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
      showSuccessModal.value = true;
      // Clear URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Wait a bit for tokens to be saved, then reload status
      setTimeout(async () => {
          await checkStatus();
      }, 500);
  } else if (route.query.error) {
      const error = route.query.error;
      const details = route.query.details ? JSON.parse(decodeURIComponent(route.query.details as string)) : '';
      
      alert(`Verbindung fehlgeschlagen: ${error}\n${details}`);
      console.error('Callback Error:', error, details);
      window.history.replaceState({}, document.title, window.location.pathname);
  }
});

const scopes = ref<string[]>([]);
const debugInfo = ref<any>(null);
const showDebug = ref(false);

const allExpectedScopes = [
  'listings_r', 'listings_w',
  'transactions_r', 'transactions_w',
  'shops_r', 'shops_w',
  'address_r', 'email_r',
  'billing_r', 'profile_r',
  'favorites_r'
];

const checkStatus = async () => {
    try {
const res = await axios.get(`/api/etsy/status?t=${Date.now()}`);
        isConnected.value = res.data.isConnected;
        shopName.value = res.data.shopName;
        scopes.value = res.data.scopes || [];
        debugInfo.value = res.data.debugInfo || null;
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

// Success Modal
const showSuccessModal = ref(false);

const closeSuccessModal = () => {
    showSuccessModal.value = false;
};

const triggerSync = async (type: 'orders' | 'products') => {
    isSyncing.value = true;
    syncType.value = type;
    showSyncModal.value = true;
    syncStatus.value = 'loading';
    syncModalTitle.value = type === 'orders' ? 'Bestellungen werden synchronisiert' : 'Produkte werden synchronisiert';
    syncModalMessage.value = 'Initialisiere Synchronisation...';
    syncDetails.value = '';
    
    try {
        const endpoint = type === 'orders' ? '/api/etsy/sync-orders' : '/api/etsy/sync-products';
        await axios.post(endpoint);
        
        let pollCount = 0;
        
        // Start Polling /api/import/status
        const pollInterval = setInterval(async () => {
             if (!showSyncModal.value) {
                 clearInterval(pollInterval);
                 return;
             }
             
             pollCount++;

             try {
                 const statusRes = await axios.get('/api/import/status');
                 const status = statusRes.data;
                 
                 // Update UI with current status
                 if (status.message) {
                     syncModalMessage.value = status.message;
                 }
                 
                 // Show progress bar or text? For now just text details
                 if (status.state === 'PROCESSING') {
                     syncDetails.value = `Fortschritt: ${status.progress}% (${status.current}/${status.total})`;
                 }

                 if (status.state === 'COMPLETED') {
                     clearInterval(pollInterval);
                     syncStatus.value = 'success';
                     syncModalTitle.value = 'Synchronisation erfolgreich';
                     syncModalMessage.value = status.message || 'Vorgang abgeschlossen.';
                     syncDetails.value = '';
                     isSyncing.value = false;
                     
                     // Refresh page or data after short delay
                 } else if (status.state === 'ERROR') {
                     clearInterval(pollInterval);
                     syncStatus.value = 'error';
                     syncModalTitle.value = 'Synchronisation fehlgeschlagen';
                     syncModalMessage.value = status.message || status.error || 'Ein unbekannter Fehler ist aufgetreten.';
                     syncDetails.value = status.error || '';
                     isSyncing.value = false;
                 } else if (status.state === 'IDLE' && pollCount > 5) {
                     // If it goes back to IDLE quickly or was never started?
                     // Usually IDLE means not running. If we just started it, it should be PROCESSING.
                     // But maybe it finished very fast?
                     // Or maybe backend didn't set it?
                     // Lets give it a few polls before assuming finished if IDLE.
                     // Actually, if we just triggered it, it might take a ms to switch to PROCESSING.
                     // If it stays IDLE for 5 seconds, maybe it failed to start?
                 }
                 
             } catch (e) {
                 console.error('Polling error', e);
             }
        }, 1000);

        // Timeout after 120s
        setTimeout(() => {
            if (isSyncing.value) {
                clearInterval(pollInterval);
                isSyncing.value = false;
                // Don't show success if we timed out
                syncStatus.value = 'error'; 
                syncModalTitle.value = 'Zeitüberschreitung';
                syncModalMessage.value = 'Die Synchronisation antwortet nicht mehr. Bitte prüfen Sie das Ereignis-Protokoll.';
            }
        }, 120000);

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
