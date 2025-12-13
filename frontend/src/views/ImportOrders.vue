<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const selectedFile = ref<File | null>(null)
const importType = ref<'orders' | 'products'>('orders')
const uploading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)
const importStatus = ref<any>(null)
let pollInterval: any = null

const startPolling = () => {
  importStatus.value = { progress: 0, message: 'Starte Import...' }
  pollInterval = setInterval(async () => {
    try {
      const res = await axios.get('/api/import/status')
      importStatus.value = res.data
      if (res.data.state === 'COMPLETED' || res.data.state === 'ERROR') {
        clearInterval(pollInterval)
      }
    } catch (e) {
      console.error('Status poll error', e)
    }
  }, 1000)
}

const stopPolling = () => {
  if (pollInterval) clearInterval(pollInterval)
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]!
    result.value = null
    error.value = null
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    error.value = 'Bitte wähle eine CSV-Datei aus'
    return
  }

  uploading.value = true
  error.value = null
  result.value = null
  startPolling()

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const endpoint = importType.value === 'orders' 
      ? '/api/import/etsy-orders' 
      : '/api/import/etsy-products'
    
    // Increase timeout for large imports
    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000 // 5 minutes
    })
    result.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message
  } finally {
    uploading.value = false
    stopPolling()
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Etsy CSV importieren
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
          <p>Lade hier deine Etsy CSV-Datei hoch.</p>
        </div>

        <!-- Import Type Selection -->
        <div class="mt-5">
          <label class="text-sm font-medium text-gray-700">Import-Typ:</label>
          <div class="mt-2 space-x-4">
            <label class="inline-flex items-center">
              <input type="radio" v-model="importType" value="orders" class="form-radio h-4 w-4 text-indigo-600">
              <span class="ml-2 text-sm text-gray-700">Bestellungen-CSV</span>
            </label>
            <label class="inline-flex items-center">
              <input type="radio" v-model="importType" value="products" class="form-radio h-4 w-4 text-indigo-600">
              <span class="ml-2 text-sm text-gray-700">Produktkatalog-CSV</span>
            </label>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            <span v-if="importType === 'orders'">Etsy Bestellungen-Export (mit Kundendaten und Artikeln)</span>
            <span v-else>Etsy Produktkatalog-Export (TITEL, BESCHREIBUNG, PREIS...)</span>
          </p>
        </div>

        <!-- File Input -->
        <div class="mt-5">
          <input
            type="file"
            accept=".csv"
            @change="handleFileChange"
            class="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
          />
        </div>

        <!-- Upload Button -->
        <div class="mt-5">
          <button
            @click="handleUpload"
            :disabled="!selectedFile || uploading"
            type="button"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="uploading">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verarbeite...
            </span>
            <span v-else>Importieren</span>
          </button>
        </div>

        <!-- Progress Bar -->
        <div v-if="uploading && importStatus" class="mt-6">
            <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-indigo-700">{{ importStatus.message }}</span>
                <span class="text-sm font-medium text-gray-500">{{ importStatus.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" :style="{ width: importStatus.progress + '%' }"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Bitte Fenster nicht schließen.</p>
        </div>

        <!-- Success Result -->
        <div v-if="result" class="mt-5 rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Import erfolgreich</h3>
              <div class="mt-2 text-sm text-green-700">
                <p v-if="importType === 'orders'">
                  {{ result.ordersCreated }} Bestellung(en) angelegt<br>
                  {{ result.ordersUpdated }} Bestellung(en) aktualisiert
                </p>
                <p v-else>
                  {{ result.productsCreated }} Produkt(e) angelegt<br>
                  {{ result.productsUpdated }} Produkt(e) aktualisiert
                </p>
                <p v-if="result.errors && result.errors.length > 0" class="mt-2">
                  <span class="font-medium">Fehler:</span><br>
                  <span v-for="(err, index) in result.errors" :key="index" class="block">{{ err }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-5 rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Fehler beim Import</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
