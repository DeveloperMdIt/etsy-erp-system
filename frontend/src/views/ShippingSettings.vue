<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Versandeinstellungen</h1>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'dhl'"
          :class="[
            activeTab === 'dhl'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          DHL Paket
        </button>
        <button
          @click="activeTab = 'deutschepost'"
          :class="[
            activeTab === 'deutschepost'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          Deutsche Post
        </button>
      </nav>
    </div>

    <!-- DHL Paket Tab -->
    <div v-if="activeTab === 'dhl'" class="space-y-8">
      <!-- GKP Connection -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Geschäftskundenportal (GKP)</h2>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-800">
            ℹ️ <strong>Einfache Einrichtung:</strong> Tragen Sie Ihre DHL Geschäftskundenportal-Zugangsdaten ein.
            <br/>
            <a href="https://www.dhl.de/de/geschaeftskunden.html" target="_blank" class="underline">
              Noch kein GKP-Konto? Hier registrieren →
            </a>
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              GKP Benutzername *
            </label>
            <input
              v-model="settings.dhlGkpUsername"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ihr GKP Benutzername"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              GKP Passwort *
            </label>
            <div class="relative">
              <input
                v-model="settings.dhlGkpPassword"
                :type="showDhlPassword ? 'text' : 'password'"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Ihr GKP Passwort"
              />
              <button 
                type="button"
                @click="showDhlPassword = !showDhlPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg v-if="!showDhlPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center space-x-4">
          <button
            @click="testDHLConnection"
            :disabled="testingDHL || !settings.dhlGkpUsername || !settings.dhlGkpPassword"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ testingDHL ? 'Teste...' : 'Verbindung testen' }}
          </button>

          <div v-if="dhlConnectionStatus" class="flex-1">
            <div v-if="dhlConnectionStatus.success" class="bg-green-50 border border-green-200 rounded-lg p-3">
              <p class="text-green-800 text-sm font-medium">✓ Verbindung erfolgreich!</p>
              <p class="text-green-700 text-xs mt-1">
                Sie können jetzt DHL Paket Labels erstellen.
              </p>
            </div>
            <div v-else class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-800 text-sm font-medium">✗ Verbindung fehlgeschlagen</p>
              <p class="text-red-700 text-xs mt-1">{{ dhlConnectionStatus.error }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-bold text-yellow-800">Sandbox-Test</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p class="font-semibold mb-2">Zum Testen können Sie diese Sandbox-Zugangsdaten verwenden:</p>
                <div class="bg-white rounded p-3 border border-yellow-200">
                  <p class="font-mono"><strong>Benutzername:</strong> <span class="text-blue-600 font-bold">user-valid</span></p>
                  <p class="font-mono"><strong>Passwort:</strong> <span class="text-blue-600 font-bold">SandboxPasswort2023!</span></p>
                </div>
                <p class="mt-2 text-xs italic">Diese Zugangsdaten funktionieren nur in der Sandbox-Umgebung zum Testen.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="settings.dhlEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">DHL Paket Integration aktivieren</span>
          </label>
        </div>

        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="settings.etsySyncEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">
              Tracking automatisch an Etsy senden
              <span class="text-gray-500">(Bei IP-Sperre deaktivieren)</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Printer Settings for DHL -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Druckereinstellungen</h2>

        <div class="mb-4">
          <button
            @click="loadPrinters"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Drucker aktualisieren
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              DHL Paket Drucker
            </label>
            <select
              v-model="settings.printerDHL"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Standard-Drucker verwenden</option>
              <option v-for="printer in printers" :key="printer.name" :value="printer.name">
                {{ printer.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="settings.autoPrintEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">
              Label nach Erstellung automatisch drucken
            </span>
          </label>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {{ saving ? 'Speichern...' : 'Einstellungen speichern' }}
        </button>
      </div>
    </div>

    <!-- Deutsche Post Tab -->
    <div v-if="activeTab === 'deutschepost'" class="space-y-8">
      <!-- API Connection -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Portokasse-Verbindung</h2>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-sm text-blue-800">
            ℹ️ <strong>Einfache Einrichtung:</strong> Tragen Sie nur Ihren Portokasse-Benutzernamen und Passwort ein.
            <br/>
            <a href="https://portokasse.deutschepost.de" target="_blank" class="underline">
              Noch kein Portokasse-Konto? Hier registrieren →
            </a>
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Portokasse Benutzername *
            </label>
            <input
              v-model="settings.deutschePostUsername"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ihr Portokasse Benutzername"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Portokasse Passwort *
            </label>
            <div class="relative">
              <input
                v-model="settings.deutschePostPassword"
                :type="showDpPassword ? 'text' : 'password'"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Ihr Portokasse Passwort"
              />
              <button 
                type="button"
                @click="showDpPassword = !showDpPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg v-if="!showDpPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center space-x-4">
          <button
            @click="testConnection"
            :disabled="testing || !settings.deutschePostUsername || !settings.deutschePostPassword"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ testing ? 'Teste...' : 'Verbindung testen' }}
          </button>

          <div v-if="connectionStatus" class="flex-1">
            <div v-if="connectionStatus.success" class="bg-green-50 border border-green-200 rounded-lg p-3">
              <p class="text-green-800 text-sm font-medium">✓ Verbindung erfolgreich!</p>
              <p class="text-green-700 text-xs mt-1">
                Bitte aktivieren Sie jetzt die Geschäftsanwendung in Ihrer Portokasse unter 
                <strong>"Meine Daten" → "Geschäftsanwendungen"</strong>
              </p>
            </div>
            <div v-else class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-800 text-sm font-medium">✗ Verbindung fehlgeschlagen</p>
              <p class="text-red-700 text-xs mt-1">{{ connectionStatus.error }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-sm font-medium text-yellow-800 mb-2">⚠️ Wichtig: Geschäftsanwendung freigeben</p>
          <p class="text-xs text-yellow-700">
            Nach dem ersten Verbindungstest müssen Sie in Ihrer Portokasse unter 
            <strong>"Meine Daten" → "Geschäftsanwendungen"</strong> diese Anwendung freigeben.
            Ohne diese Freigabe funktioniert die Label-Erstellung nicht.
          </p>
        </div>

        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="settings.deutschePostEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Integration aktivieren</span>
          </label>
        </div>

        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="settings.etsySyncEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">
              Tracking automatisch an Etsy senden
              <span class="text-gray-500">(Bei IP-Sperre deaktivieren)</span>
            </span>
          </label>
        </div>
      </div>

      <!-- Label Layout -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Label-Layout</h2>

        <!-- Label Size -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Label-Größe
          </label>
          <div class="flex space-x-4">
            <label v-for="size in labelSizes" :key="size.value" class="flex items-center">
              <input
                v-model="settings.labelSizePreset"
                type="radio"
                :value="size.value"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span class="ml-2 text-sm text-gray-700">{{ size.label }}</span>
            </label>
          </div>
        </div>

        <!-- Custom Size -->
        <div v-if="settings.labelSizePreset === 'CUSTOM'" class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Breite (mm)
            </label>
            <input
              v-model.number="settings.labelCustomWidth"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Höhe (mm)
            </label>
            <input
              v-model.number="settings.labelCustomHeight"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Logo Upload -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
             Firmenlogo
          </label>
          <input
            type="file"
            @change="uploadLogo"
            accept="image/png,image/jpeg,image/jpg"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p class="mt-1 text-xs text-gray-500">PNG oder JPG, max. 2MB</p>
          
          <div v-if="settings.labelLogoPath" class="mt-2">
            <img :src="getLogoUrl()" alt="Logo" class="h-20 border border-gray-300 rounded" />
          </div>
        </div>

        <!-- Company Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Firmenname
            </label>
            <input
              v-model="settings.labelCompanyName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Straße + Hausnummer
            </label>
            <input
              v-model="settings.labelStreet"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              PLZ
            </label>
            <input
              v-model="settings.labelPostalCode"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Stadt
            </label>
            <input
              v-model="settings.labelCity"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Land
            </label>
            <input
              v-model="settings.labelCountry"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Telefon (optional)
            </label>
            <input
              v-model="settings.labelPhone"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Printer Settings -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Druckereinstellungen</h2>

        <div class="mb-4">
          <button
            @click="loadPrinters"
            class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Drucker aktualisieren
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Standard-Drucker
            </label>
            <select
              v-model="settings.defaultPrinter"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Bitte wählen...</option>
              <option v-for="printer in printers" :key="printer.name" :value="printer.name">
                {{ printer.name }} {{ printer.isDefault ? '(Standard)' : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Deutsche Post Drucker
            </label>
            <select
              v-model="settings.printerDeutschePost"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Standard-Drucker verwenden</option>
              <option v-for="printer in printers" :key="printer.name" :value="printer.name">
                {{ printer.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-4">
          <label class="flex items-center">
            <input
              v-model="settings.autoPrintEnabled"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">
              Label nach Erstellung automatisch drucken
            </span>
          </label>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          @click="saveSettings"
          :disabled="saving"
          class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {{ saving ? 'Speichern...' : 'Einstellungen speichern' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useNotifications } from '../composables/useNotifications';

const { showSuccess, showError } = useNotifications();

const activeTab = ref('dhl');
const showDhlPassword = ref(false);
const showDpPassword = ref(false);
const settings = ref({
  // DHL Paket (GKP)
  dhlGkpUsername: '',
  dhlGkpPassword: '',
  dhlEnabled: false,
  
  // Deutsche Post
  deutschePostUsername: '',
  deutschePostPassword: '',
  deutschePostClientId: '',
  deutschePostClientSecret: '',
  deutschePostEnabled: false,
  
  // Shared
  etsySyncEnabled: true,
  labelLogoPath: '',
  labelCompanyName: '',
  labelStreet: '',
  labelPostalCode: '',
  labelCity: '',
  labelCountry: 'Deutschland',
  labelPhone: '',
  labelSizePreset: 'A5',
  labelCustomWidth: null as number | null,
  labelCustomHeight: null as number | null,
  defaultPrinter: '',
  printerDeutschePost: '',
  printerDHL: '',
  autoPrintEnabled: true
});

const labelSizes = [
  { value: 'A5', label: 'DIN A5' },
  { value: 'A6', label: 'DIN A6' },
  { value: '4x6', label: '4x6"' },
  { value: '4x4', label: '4x4"' },
  { value: 'CUSTOM', label: 'Custom' }
];

const printers = ref<Array<{ name: string; isDefault: boolean }>>([]);
const testing = ref(false);
const testingDHL = ref(false);
const saving = ref(false);
const connectionStatus = ref<{ success: boolean; balance?: number; error?: string } | null>(null);
const dhlConnectionStatus = ref<{ success: boolean; error?: string } | null>(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

onMounted(async () => {
  await loadSettings();
  await loadPrinters();
});

async function loadSettings() {
  try {
    const response = await axios.get(`${API_URL}/api/settings`);
    
    Object.assign(settings.value, response.data);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function loadPrinters() {
  try {
    const response = await axios.get(`${API_URL}/api/shipping/printers`);
    
    printers.value = response.data.printers;
  } catch (error) {
    console.error('Failed to load printers:', error);
  }
}

async function testConnection() {
  testing.value = true;
  connectionStatus.value = null;

  try {
    const response = await axios.post(
      `${API_URL}/api/shipping/deutsche-post/test`,
      {
        username: settings.value.deutschePostUsername,
        password: settings.value.deutschePostPassword,
        clientId: settings.value.deutschePostClientId,
        clientSecret: settings.value.deutschePostClientSecret
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );

    connectionStatus.value = response.data;
  } catch (error: any) {
    connectionStatus.value = {
      success: false,
      error: error.response?.data?.error || 'Verbindung fehlgeschlagen'
    };
  } finally {
    testing.value = false;
  }
}

async function testDHLConnection() {
  testingDHL.value = true;
  dhlConnectionStatus.value = null;

  try {
    const response = await axios.post(
      `${API_URL}/api/shipping/dhl/test`,
      {
        gkpUsername: settings.value.dhlGkpUsername,
        gkpPassword: settings.value.dhlGkpPassword
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );

    dhlConnectionStatus.value = response.data;
  } catch (error: any) {
    dhlConnectionStatus.value = {
      success: false,
      error: error.response?.data?.error || 'Verbindung fehlgeschlagen'
    };
  } finally {
    testingDHL.value = false;
  }
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
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    settings.value.labelLogoPath = response.data.logoPath;
    showSuccess('Logo erfolgreich hochgeladen!');
  } catch (error) {
    console.error('Logo upload failed:', error);
    showError('Logo-Upload fehlgeschlagen');
  }
}

function getLogoUrl() {
  if (settings.value.labelLogoPath) {
    const filename = settings.value.labelLogoPath.split(/[\\/]/).pop();
    return `${API_URL}/uploads/logos/${filename}`;
  }
  return '';
}

async function saveSettings() {
  saving.value = true;

  try {
    await axios.put(
      `${API_URL}/api/settings`,
      settings.value,
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` }
      }
    );

    showSuccess('Einstellungen erfolgreich gespeichert!');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showError('Speichern fehlgeschlagen');
  } finally {
    saving.value = false;
  }
}
</script>
