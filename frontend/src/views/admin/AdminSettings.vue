<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useNotifications } from '../../composables/useNotifications'

const { showSuccess, showError } = useNotifications()

const settings = ref<any[]>([])
const loading = ref(true)

// Predefined keys we expect to manage
const knownKeys = [
    { key: 'ETSY_CLIENT_ID', label: 'Etsy Client ID (Global)', desc: 'Für die OAuth App Verbindung' },
    { key: 'ETSY_CLIENT_SECRET', label: 'Etsy Client Secret', desc: 'Geheimschlüssel für OAuth' },
    { key: 'DHL_APP_ID', label: 'DHL App ID', desc: 'Für DHL Geschäftskunden API' },
    { key: 'DHL_APP_SECRET', label: 'DHL App Secret', desc: 'Geheimschlüssel' },
    { key: 'IMPRESSUM_ADDRESS', label: 'Impressum Adresse', desc: 'Wird in Emails/Footer angezeigt' },
    { key: 'SUPPORT_EMAIL', label: 'Support Email', desc: 'Absender für System-Mails' },
]

const formValues = ref<Record<string, string>>({})

const fetchSettings = async () => {
    try {
        const res = await axios.get('/api/admin/settings')
        settings.value = res.data
        
        // Populate form
        knownKeys.forEach(k => {
            const found = settings.value.find(s => s.key === k.key)
            formValues.value[k.key] = found ? found.value : ''
        })
    } catch (error) {
        console.error('Fetch settings error', error)
    } finally {
        loading.value = false
    }
}

const saveSettings = async () => {
    try {
        const payload = Object.keys(formValues.value).map(key => ({
            key,
            value: formValues.value[key]
        }))
        
        await axios.put('/api/admin/settings', { settings: payload })
        showSuccess('Einstellungen gespeichert')
    } catch (error) {
        showError('Fehler beim Speichern')
    }
}

onMounted(fetchSettings)
</script>

<template>
    <div class="bg-white shadow rounded-lg p-6 max-w-3xl">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6">Globale Systemeinstellungen</h3>
        
        <div class="space-y-6">
            <div v-for="item in knownKeys" :key="item.key">
                <label :for="item.key" class="block text-sm font-medium text-gray-700">{{ item.label }}</label>
                <div class="mt-1">
                    <input 
                        v-model="formValues[item.key]" 
                        type="text" 
                        :id="item.key"
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        :placeholder="item.desc"
                    >
                </div>
                <p class="mt-1 text-sm text-gray-500">{{ item.desc }}</p>
            </div>
            
            <div class="pt-4 border-t border-gray-200">
                <button 
                    @click="saveSettings"
                    class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Speichern
                </button>
            </div>
        </div>
    </div>
</template>
