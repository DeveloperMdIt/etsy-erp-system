<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { PlusIcon, ArchiveBoxIcon /*, QrCodeIcon*/ } from '@heroicons/vue/24/outline'

interface StorageLocation {
  id: string
  name: string
  type: string
  description?: string
  // For now we might not have these loaded in the simple list
  _count?: {
      inventoryItems: number
  }
}

const locations = ref<StorageLocation[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)

// Create Form
const newLocation = ref({
    name: '',
    type: 'SHELF',
    description: ''
})

const locationTypes = ['SHELF', 'BIN', 'PALLET', 'OVERFLOW']

const fetchLocations = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/inventory/locations')
    locations.value = res.data
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const createLocation = async () => {
    if(!newLocation.value.name) return
    try {
        // We probably need a POST /api/inventory/locations/create endpoint?
        // Check inventory.routes.ts... I forgot to add a generic CREATE LOCATION route!
        // I only added Add Stock (which creates location if missing).
        // I should add a dedicated create route or just "Add Stock" 0?
        // Better: dedicated create.
        await axios.post('/api/inventory/locations/create', newLocation.value)
        showCreateModal.value = false
        newLocation.value = { name: '', type: 'SHELF', description: '' }
        fetchLocations()
    } catch (e: any) {
        alert('Fehler: ' + (e.response?.data?.error || e.message))
    }
}

onMounted(fetchLocations)

</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Lagerverwaltung</h1>
        <p class="mt-2 text-sm text-gray-700">Verwalte deine Lagerplätze, Regale und Bestände.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-auto sm:flex-none">
        <button
          @click="showCreateModal = true"
          type="button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Lagerplatz erstellen
        </button>
      </div>
    </div>

    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name / Code</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Typ</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Beschreibung</th>
                  <!-- <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Artikel</th> -->
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-if="loading">
                    <td colspan="4" class="text-center py-4 text-sm text-gray-500">Lade Lagerdaten...</td>
                </tr>
                <tr v-else-if="locations.length === 0">
                    <td colspan="4" class="text-center py-4 text-sm text-gray-500">Noch keine Lagerplätze definiert. Fange an, indem du einen erstellst!</td>
                </tr>
                <tr v-for="loc in locations" :key="loc.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div class="flex items-center">
                          <ArchiveBoxIcon class="h-5 w-5 mr-2 text-gray-400"/>
                          {{ loc.name }}
                      </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span class="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                          {{ loc.type }}
                      </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ loc.description || '-' }}</td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <a href="#" class="text-indigo-600 hover:text-indigo-900">Inhalt ansehen</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Neuen Lagerplatz erstellen</h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Name / Code (z.B. A-01-01)</label>
                    <input v-model="newLocation.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="Scan oder Tippen">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Typ</label>
                    <select v-model="newLocation.type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        <option v-for="t in locationTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>

                 <div>
                    <label class="block text-sm font-medium text-gray-700">Beschreibung</label>
                    <input v-model="newLocation.description" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button @click="showCreateModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Abbrechen</button>
                <button @click="createLocation" class="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700">Erstellen</button>
            </div>
        </div>
    </div>

  </div>
</template>
