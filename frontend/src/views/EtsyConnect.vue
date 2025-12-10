<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const notifications: any = inject('notifications')
const route = useRoute()
const loading = ref(true)
const isConnected = ref(false)
const shopName = ref('')

const checkConnection = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/etsy/status')
    isConnected.value = response.data.isConnected
    shopName.value = response.data.shopName
  } catch (error) {
    console.error('Status check failed', error)
  } finally {
    loading.value = false
  }
}

const connectEtsy = async () => {
    try {
        // Fetch the auth URL from backend (authenticated request)
        const response = await axios.get('/api/etsy/connect')
        // Redirect browser to the returned URL
        window.location.href = response.data.url
    } catch (error) {
        console.error('Failed to init Etsy auth', error)
        notifications.value.show('error', 'Fehler', 'Verbindung konnte nicht gestartet werden')
    }
}

const disconnectEtsy = async () => {
    if(!confirm('Verbindung wirklich trennen?')) return
    try {
        await axios.post('/api/etsy/disconnect')
        isConnected.value = false
        shopName.value = ''
        notifications.value.show('success', 'Getrennt', 'Verbindung aufgehoben')
    } catch(e) {
        notifications.value.show('error', 'Fehler', 'Konnte nicht trennen')
    }
}

onMounted(async () => {
    // Check if we returned from a callback
    if (route.query.success === 'true') {
        notifications.value.show('success', 'Verbunden', 'Etsy erfolgreich verknüpft!')
    }
    if (route.query.error) {
         notifications.value.show('error', 'Fehler', 'Verbindung fehlgeschlagen: ' + route.query.error)
    }
    
    await checkConnection()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Etsy Integration</h3>
          <p class="mt-1 text-sm text-gray-500">Verbinden Sie Ihren Etsy Shop, um Bestellungen und Produkte automatisch zu importieren.</p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
            
            <div v-if="loading" class="text-gray-500">
                Laden...
            </div>

            <div v-else-if="isConnected" class="bg-green-50 border border-green-200 rounded-md p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm leading-5 font-medium text-green-800">
                            Verbunden mit: <strong>{{ shopName }}</strong>
                        </h3>
                        <div class="mt-2 text-sm leading-5 text-green-700">
                            <p>Die Synchronisation ist aktiv.</p>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                     <button @click="disconnectEtsy" class="text-sm text-red-600 hover:text-red-800 underline">Verbindung trennen</button>
                </div>
            </div>

            <div v-else class="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                 <p class="text-gray-600 mb-4">Noch kein Shop verbunden.</p>
                 <button @click="connectEtsy" type="button" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#F1641E] hover:bg-[#d65615] focus:outline-none">
                    <span class="mr-2">E</span> Mit Etsy verbinden
                 </button>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>
