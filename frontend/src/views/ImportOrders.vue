<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

const handleFileUpload = async () => {
  const file = fileInput.value?.files?.[0]
  if (!file) return

  uploading.value = true
  error.value = null
  result.value = null

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await axios.post('/api/import/etsy', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    result.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || err.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="bg-white shadow sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Etsy Bestellungen importieren</h3>
      <div class="mt-2 max-w-xl text-sm text-gray-500">
        <p>Lade hier deine Etsy Bestell-CSV Datei hoch.</p>
      </div>
      <div class="mt-5 sm:flex sm:items-center">
        <div class="w-full sm:max-w-xs">
          <input type="file" ref="fileInput" accept=".csv" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
        </div>
        <button @click="handleFileUpload" :disabled="uploading" type="button" class="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          {{ uploading ? 'Wird hochgeladen...' : 'Importieren' }}
        </button>
      </div>

      <!-- Results -->
      <div v-if="result" class="mt-6 p-4 bg-green-50 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">Import erfolgreich</h3>
            <div class="mt-2 text-sm text-green-700">
              <p>{{ result.ordersCreated }} Bestellungen neu angelegt.</p>
              <p>{{ result.ordersUpdated }} Bestellungen aktualisiert.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mt-6 p-4 bg-red-50 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
</template>
