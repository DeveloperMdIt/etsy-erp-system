<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Versandeinstellungen</h1>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-8">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'providers'"
          :class="[
            activeTab === 'providers'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Versandwege
        </button>
        <button
          @click="activeTab = 'general'"
          :class="[
            activeTab === 'general'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Drucker & Layout
        </button>
      </nav>
    </div>

    <!-- PROVIDERS TAB -->
    <div v-if="activeTab === 'providers'" class="space-y-6">
      
      <!-- Provider List -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- DHL Card -->
        <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-red-600 text-xl">DHL</div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">DHL Paket</h3>
                  <p class="text-sm text-gray-500">Geschäftskundenversand V3</p>
                </div>
              </div>
              <span v-if="isDhlConfigured" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktiv
              </span>
              <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Nicht eingerichtet
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-6">
              Verbinden Sie Ihr DHL Geschäftskundenportal (GKP) um Labels zu erstellen und Sendungen zu verwalten.
            </p>

            <div class="flex space-x-3">
              <button 
                v-if="!isDhlConfigured"
                @click="openSetup('dhl')"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Einrichten
              </button>
              <template v-else>
                 <button 
                  @click="openSetup('dhl')"
                  class="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Bearbeiten
                </button>
                <button 
                  @click="disconnectProvider('dhl')"
                  class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium"
                >
                  Trennen
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Deutsche Post Card -->
        <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black text-xl">DP</div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">Deutsche Post</h3>
                  <p class="text-sm text-gray-500">Internetmarke / Portokasse</p>
                </div>
              </div>
              <span v-if="isDpConfigured" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktiv
              </span>
              <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Nicht eingerichtet
              </span>
            </div>
            
            <p class="text-sm text-gray-600 mb-6">
              Verbinden Sie Ihre Portokasse für Briefprodukte, Warenpost und Einschreiben.
            </p>

            <div class="flex space-x-3">
               <button 
                v-if="!isDpConfigured"
                @click="openSetup('deutschepost')"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Einrichten
              </button>
              <template v-else>
                 <button 
                  @click="openSetup('deutschepost')"
                  class="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Bearbeiten
                </button>
                <button 
                  @click="disconnectProvider('deutschepost')"
                  class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium"
                >
                  Trennen
                </button>
              </template>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- GENERAL SETTINGS TAB -->
    <div v-if="activeTab === 'general'" class="max-w-4xl space-y-8">
      
      <!-- Logo Settings -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Label Branding</h2>
        <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Firmenlogo (für DHL Label)</label>
              <div class="flex items-center space-x-4">
                 <div v-if="settings.labelLogoPath" class="h-16 w-16 border rounded flex items-center justify-center overflow-hidden bg-gray-50">
                    <img :src="getLogoUrl()" class="max-h-full max-w-full" />
                 </div>
                 <input
                  type="file"
                  @change="uploadLogo"
                  accept="image/png,image/jpeg"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
             <!-- Address fields for label -->
             <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                   <label class="block text-sm font-medium text-gray-700">Firmenname</label>
                   <input v-model="settings.labelCompanyName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                </div>
                 <div class="col-span-2">
                   <label class="block text-sm font-medium text-gray-700">Straße & Nr.</label>
                   <input v-model="settings.labelStreet" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                </div>
                <div>
                   <label class="block text-sm font-medium text-gray-700">PLZ</label>
                   <input v-model="settings.labelPostalCode" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-700">Stadt</label>
                   <input v-model="settings.labelCity" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                </div>
             </div>
        </div>
      </div>
      
      <!-- Printer Settings -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">Druckerzuordnung</h2>
            <button @click="loadPrinters" class="text-sm text-blue-600 hover:text-blue-500">Liste aktualisieren</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Standard Drucker</label>
              <select v-model="settings.defaultPrinter" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                <option value="">Keiner gewählt</option>
                <option v-for="p in printers" :key="p.name" :value="p.name">{{ p.name }}</option>
              </select>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">DHL Paket Drucker</label>
              <select v-model="settings.printerDHL" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                 <option value="">Wie Standard</option>
                 <option v-for="p in printers" :key="p.name" :value="p.name">{{ p.name }}</option>
              </select>
            </div>
             <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Deutsche Post Drucker</label>
              <select v-model="settings.printerDeutschePost" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border">
                  <option value="">Wie Standard</option>
                 <option v-for="p in printers" :key="p.name" :value="p.name">{{ p.name }}</option>
              </select>
            </div>
        </div>

        <div class="mt-6">
            <label class="flex items-center">
                <input v-model="settings.autoPrintEnabled" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                <span class="ml-2 text-sm text-gray-900">Labels nach Erstellung automatisch drucken</span>
            </label>
        </div>
      </div>

       <div class="flex justify-end">
          <button @click="saveGeneralSettings" :disabled="saving" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
             {{ saving ? 'Speichern...' : 'Einstellungen speichern' }}
          </button>
       </div>

    </div>

    <!-- SETUP MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          
          <!-- Header -->
          <div class="sm:flex sm:items-start mb-6">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ currentSetup === 'dhl' ? 'DHL Paket verbinden' : 'Deutsche Post verbinden' }}
              </h3>
              <div class="mt-2">
                 <!-- DHL Content -->
                 <div v-if="currentSetup === 'dhl'" class="space-y-4">
                    <div class="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
                      Bitte geben Sie Ihre Zugangsdaten für das DHL Geschäftskundenportal (GKP) ein.
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">GKP Benutzername</label>
                      <input v-model="setupData.dhlGkpUsername" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">GKP Passwort</label>
                      <input v-model="setupData.dhlGkpPassword" type="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Abrechnungsnummer (14-stellig)</label>
                      <input v-model="setupData.dhlBillingNrPaket" type="text" placeholder="z.B. 33333333330101" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                      <p class="text-xs text-gray-500 mt-1">Setzt sich zusammen aus EKP (10 Stellen) + Verfahren (01) + Teilnahme (01).</p>
                    </div>

                    <!-- Advanced Toggle -->
                    <div class="pt-2">
                        <button type="button" @click="showAdvanced = !showAdvanced" class="text-xs text-blue-600 hover:text-blue-800 flex items-center underline">
                            <span class="mr-1">{{ showAdvanced ? '▼' : '▶' }}</span> Erweiterte Einstellungen (Produktionsmodus / Eigene App ID)
                        </button>
                        
                        <div v-if="showAdvanced" class="mt-3 p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                            <p class="mb-2 text-xs text-gray-600">Falls Sie eigene DHL Developer App Credentials haben:</p>
                            <div class="mb-2">
                                <label class="block text-xs font-medium mb-1">App ID (Client ID)</label>
                                <input v-model="setupData.dhlAppId" type="text" class="w-full border rounded px-2 py-1 text-xs" />
                            </div>
                            <div>
                                <label class="block text-xs font-medium mb-1">App Secret (Client Secret)</label>
                                <input v-model="setupData.dhlAppSecret" type="password" class="w-full border rounded px-2 py-1 text-xs" />
                            </div>
                        </div>
                    </div>

                    <!-- Test Result -->
                    <div v-if="testResult" :class="testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'" class="p-4 rounded-md text-sm mt-4">
                        <div class="font-bold">{{ testResult.success ? 'Verbindung erfolgreich' : 'Verbindung fehlgeschlagen' }}</div>
                        <div v-if="!testResult.success" class="mt-1">{{ testResult.error }}</div>
                        <div v-else class="mt-1">Zugangsdaten sind gültig.</div>
                    </div>
                 </div>

                 <!-- DP Content -->
                 <div v-if="currentSetup === 'deutschepost'" class="space-y-4">
                     <div class="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
                      Nutzen Sie Ihre Portokasse Zugangsdaten.
                    </div>
                     <div>
                      <label class="block text-sm font-medium text-gray-700">Portokasse E-Mail / User</label>
                      <input v-model="setupData.deutschePostUsername" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Passwort</label>
                      <input v-model="setupData.deutschePostPassword" type="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                     <!-- Test Result -->
                    <div v-if="testResult" :class="testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'" class="p-4 rounded-md text-sm mt-4">
                        <div class="font-bold">{{ testResult.success ? 'Verbindung erfolgreich' : 'Verbindung fehlgeschlagen' }}</div>
                        <div v-if="!testResult.success" class="mt-1">{{ testResult.error }}</div>
                         <div v-else class="mt-1">
                             Zugangsdaten gültig. Wallet: {{ (testResult.balance / 100).toFixed(2) }} €
                         </div>
                    </div>

                    <div v-if="testResult?.success" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                      <p class="text-sm text-yellow-700">
                        <strong>Wichtig:</strong> Bitte geben Sie in der Portokasse unter "Meine Daten" -> "Geschäftsanwendungen" diese Applikation frei.
                      </p>
                    </div>
                 </div>

              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-4 mt-6">
            
            <!-- Step 1: Check Connection -->
            <button 
                v-if="!testResult?.success"
                @click="testConnection" 
                :disabled="testing"
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ testing ? 'Verbinde...' : 'Verbindung prüfen' }}
            </button>

            <!-- Step 2: Save -->
             <button 
                v-else
                @click="saveProvider" 
                :disabled="saving"
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ saving ? 'Speichern...' : 'Verbindung speichern' }}
            </button>

            <button 
                @click="closeModal" 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import axios from 'axios';

// --- State ---
const activeTab = ref('providers');
const showModal = ref(false);
const currentSetup = ref<'dhl' | 'deutschepost' | null>(null);
const testing = ref(false);
const saving = ref(false);
const testResult = ref<any>(null);
const printers = ref<Array<{name: string}>>([]);
const showAdvanced = ref(false);

const notifications = inject<any>('notifications');

// The main settings object backed by DB
const settings = ref<any>({
    dhlGkpUsername: '',
    dhlGkpPassword: '',
    dhlEnabled: false,
    deutschePostUsername: '',
    deutschePostPassword: '',
    deutschePostEnabled: false,
    labelLogoPath: '',
    labelCompanyName: '',
    labelStreet: '',
    labelPostalCode: '',
    labelCity: '',
    defaultPrinter: '',
    printerDHL: '',
    printerDeutschePost: '',
    autoPrintEnabled: false
});

// Temporary data for the modal inputs
const setupData = ref<any>({});

const API_URL = import.meta.env.VITE_API_URL || '';

// --- Computed ---
const isDhlConfigured = computed(() => !!settings.value.dhlGkpUsername && settings.value.dhlEnabled);
const isDpConfigured = computed(() => !!settings.value.deutschePostUsername && settings.value.deutschePostEnabled);

// --- Methods ---

onMounted(async () => {
    await fetchSettings();
    await loadPrinters();
});

async function fetchSettings() {
    try {
        const res = await axios.get(`${API_URL}/api/settings`);
        // The backend returns { settings: { ... }, user: { ... } }
        // We need to merge settings object specifically
        if (res.data.settings) {
            Object.assign(settings.value, res.data.settings);
        }
        // If we needed user data (like shopName) we would assign that too, but this view focuses on UserSettings fields

    } catch (e) {
        console.error("Failed to load settings", e);
    }
}

async function loadPrinters() {
    try {
        const res = await axios.get(`${API_URL}/api/shipping/printers`);
        printers.value = res.data.printers || [];
        if (printers.value.length === 0) {
            printers.value = [{name: 'Keine Drucker gefunden (Server)'}];
        }
    } catch (e) {
        console.error("Failed to load printers", e);
        printers.value = [{name: 'Fehler beim Laden der Drucker'}];
    }
}

function openSetup(provider: 'dhl' | 'deutschepost') {
    currentSetup.value = provider;
    showModal.value = true;
    showAdvanced.value = false;

    // Pre-fill with existing if editing
    if (provider === 'dhl') {
        setupData.value = {
            dhlGkpUsername: settings.value.dhlGkpUsername,
            dhlGkpPassword: settings.value.dhlGkpPassword,
            dhlBillingNrPaket: settings.value.dhlBillingNrPaket, // Load existing
            dhlAppId: settings.value.dhlAppId,
            dhlAppSecret: settings.value.dhlAppSecret
        };
    } else {
        setupData.value = {
            deutschePostUsername: settings.value.deutschePostUsername,
            deutschePostPassword: settings.value.deutschePostPassword
        };
    }
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
    currentSetup.value = null;
    setupData.value = {};
    testResult.value = null;
}

// 1. Test Connection
async function testConnection() {
    testing.value = true;
    testResult.value = null;
    try {
        if (currentSetup.value === 'dhl') {
            const res = await axios.post(`${API_URL}/api/shipping/dhl/test`, {
                gkpUsername: setupData.value.dhlGkpUsername,
                gkpPassword: setupData.value.dhlGkpPassword,
                appId: setupData.value.dhlAppId,
                appSecret: setupData.value.dhlAppSecret
            });
            if (res.data.success) {
                testResult.value = { success: true };
            } else {
                testResult.value = { success: false, error: res.data.error || 'Unbekannter Fehler' };
            }
        } else if (currentSetup.value === 'deutschepost') {
            const res = await axios.post(`${API_URL}/api/shipping/deutsche-post/test`, {
                username: setupData.value.deutschePostUsername,
                password: setupData.value.deutschePostPassword
            });
             if (res.data.success) {
                testResult.value = { success: true, balance: res.data.balance };
            } else {
                testResult.value = { success: false, error: res.data.error || 'Unbekannter Fehler' };
            }
        }
    } catch (e: any) {
        testResult.value = { success: false, error: e.response?.data?.error || e.message };
    } finally {
        testing.value = false;
    }
}

// 2. Save Provider
async function saveProvider() {
    saving.value = true;
    try {
        // Merge setup data into main settings
        if (currentSetup.value === 'dhl') {
            settings.value.dhlGkpUsername = setupData.value.dhlGkpUsername;
            settings.value.dhlGkpPassword = setupData.value.dhlGkpPassword;
            settings.value.dhlBillingNrPaket = setupData.value.dhlBillingNrPaket; // Save Billing Number
            settings.value.dhlAppId = setupData.value.dhlAppId;
            settings.value.dhlAppSecret = setupData.value.dhlAppSecret;
            settings.value.dhlEnabled = true; // Auto-enable
        } else if (currentSetup.value === 'deutschepost') {
             settings.value.deutschePostUsername = setupData.value.deutschePostUsername;
             settings.value.deutschePostPassword = setupData.value.deutschePostPassword;
             settings.value.deutschePostEnabled = true; // Auto-enable
        }

        // Persist to DB
        await axios.put(`${API_URL}/api/settings`, settings.value);
        
        notifySuccess('Einstellungen gespeichert');
        closeModal();
    } catch (e) {
        console.error(e);
        notifyError('Fehler beim Speichern');
    } finally {
        saving.value = false;
    }
}

// 3. Disconnect
async function disconnectProvider(provider: 'dhl' | 'deutschepost') {
    if(!confirm('Möchten Sie diesen Versandweg wirklich entfernen?')) return;
    
    try {
        if (provider === 'dhl') {
            settings.value.dhlGkpUsername = '';
            settings.value.dhlGkpPassword = '';
            settings.value.dhlEnabled = false;
        } else {
            settings.value.deutschePostUsername = '';
            settings.value.deutschePostPassword = '';
            settings.value.deutschePostEnabled = false;
        }
        await axios.put(`${API_URL}/api/settings`, settings.value);
        notifySuccess('Versandweg entfernt');
    } catch(e) {
        notifyError('Fehler beim Löschen');
    }
}

// 4. Save General Settings
async function saveGeneralSettings() {
    saving.value = true;
    try {
        await axios.put(`${API_URL}/api/settings`, settings.value);
        notifySuccess('Gespeichert');
    } catch (e) {
         notifyError('Fehler beim Speichern');
    } finally {
        saving.value = false;
    }
}

// --- Helpers ---

function getLogoUrl() {
  if (settings.value.labelLogoPath) {
    const filename = settings.value.labelLogoPath.split(/[\\/]/).pop();
    return `${API_URL}/uploads/logos/${filename}`;
  }
  return '';
}

async function uploadLogo(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('logo', file);

  try {
    const response = await axios.post(
      `${API_URL}/api/shipping/logo/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    settings.value.labelLogoPath = response.data.logoPath;
    // Auto-save settings to link logo
    await saveGeneralSettings();
  } catch (error) {
    notifyError('Logo Upload fehlgeschlagen');
  }
}

function notifySuccess(msg: string) {
    if(notifications?.value?.show) notifications.value.show('success', 'Erfolgreich', msg);
}
function notifyError(msg: string) {
    if(notifications?.value?.show) notifications.value.show('error', 'Fehler', msg);
}

</script>
