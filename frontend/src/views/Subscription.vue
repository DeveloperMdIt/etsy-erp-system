<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'

interface Module {
  id: string
  key: string
  name: string
  description: string
  price: number
  isActive: boolean
  isPlanned: boolean
  category: string
}

interface UserModule {
  moduleId: string
  isActive: boolean
  expiresAt: string | null
}

const availableModules = ref<Module[]>([])
const myModules = ref<UserModule[]>([])
const loading = ref(true)

const fetchModules = async () => {
    try {
        const [resAll, resMine] = await Promise.all([
            axios.get('/api/subscription/modules'),
            axios.get('/api/subscription/my-modules')
        ])
        availableModules.value = resAll.data
        myModules.value = resMine.data
    } catch (error) {
        console.error('Failed to fetch modules', error)
    } finally {
        loading.value = false
    }
}

const isBooked = (moduleId: string) => {
    return myModules.value.some(m => m.moduleId === moduleId && m.isActive)
}

const bookModule = async (module: Module) => {
    const formattedPrice = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(module.price)
    if (!confirm(`Möchtest du das Modul "${module.name}" für ${formattedPrice} buchen?`)) return

    try {
        await axios.post('/api/subscription/book', { moduleId: module.id })
        alert('Modul erfolgreich gebucht! 🎉')
        fetchModules() // Refresh
    } catch (error: any) {
        alert('Fehler beim Buchen: ' + (error.response?.data?.error || 'Unbekannt'))
    }
}

onMounted(fetchModules)
</script>

<template>
  <div class="space-y-6">
      <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Dein Abo & Module</h1>
      </div>

      <!-- Module Grid -->
      <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="module in availableModules" :key="module.id" 
               class="bg-white overflow-hidden shadow rounded-lg border flex flex-col items-start p-6 transition hover:shadow-md h-full relative"
               :class="{'border-indigo-500 ring-1 ring-indigo-500': isBooked(module.id)}"
          >
              <div v-if="module.isPlanned" class="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-bl-lg font-bold">
                  BALD VERFÜGBAR
              </div>
              <div v-else-if="isBooked(module.id)" class="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-bl-lg font-bold flex items-center">
                  <CheckCircleIcon class="w-3 h-3 mr-1"/> AKTIV
              </div>

              <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900">{{ module.name }}</h3>
                  <p class="text-sm text-gray-500 mb-2">{{ module.category }}</p>
                  <p class="text-gray-600 text-sm mt-2">{{ module.description }}</p>
              </div>

              <div class="mt-4 w-full pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span class="text-2xl font-bold text-gray-900">{{ new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(module.price) }} <span class="text-sm font-normal text-gray-500">/ Monat</span></span>
                  
                  <button 
                      v-if="!isBooked(module.id) && !module.isPlanned"
                      @click="bookModule(module)"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                      Buchen
                  </button>
                  <button 
                      v-else-if="module.isPlanned"
                      disabled
                      class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                      Vormerken
                  </button>
                  <span v-else class="text-green-600 font-medium flex items-center">
                      <CheckCircleIcon class="w-5 h-5 mr-1"/> Gebucht
                  </span>
              </div>
          </div>
      </div>
  </div>
</template>
