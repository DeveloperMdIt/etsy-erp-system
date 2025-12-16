<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useNotifications } from '../composables/useNotifications'

const { showSuccess, showError } = useNotifications()
const loading = ref(true)
const saving = ref(false)

const form = ref({
    firstName: '',
    lastName: '',
    shopName: ''
})

const fetchProfile = async () => {
    try {
        loading.value = true
        const response = await axios.get('/api/settings')
        const { user } = response.data
        
        form.value = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            shopName: user.shopName || ''
        }
    } catch (error: any) {
        console.error('Error fetching profile:', error)
        showError('Fehler', 'Fehler beim Laden des Profils')
    } finally {
        loading.value = false
    }
}

const saveProfile = async () => {
    try {
        saving.value = true
        await axios.put('/api/settings', {
            ...form.value
        })
        
        const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}')
        const updatedUser = { ...currentUser, ...form.value }
        sessionStorage.setItem('user', JSON.stringify(updatedUser))
        window.dispatchEvent(new Event('user-login'))

        showSuccess('Erfolg', 'Profil erfolgreich gespeichert.')
    } catch (error: any) {
        console.error('Error saving profile:', error)
        showError('Fehler', 'Fehler beim Speichern: ' + (error.response?.data?.error || error.message))
    } finally {
        saving.value = false
    }
}

onMounted(fetchProfile)
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Profil & Shop</h3>
          <p class="mt-1 text-sm text-gray-500">Allgemeine Einstellungen zu Ihrem Account.</p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
          <div class="grid grid-cols-6 gap-6">
            <div class="col-span-6 sm:col-span-3">
              <label for="first-name" class="block text-sm font-medium text-gray-700">Vorname</label>
              <input v-model="form.firstName" type="text" name="first-name" id="first-name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            </div>

            <div class="col-span-6 sm:col-span-3">
              <label for="last-name" class="block text-sm font-medium text-gray-700">Nachname</label>
              <input v-model="form.lastName" type="text" name="last-name" id="last-name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            </div>

            <div class="col-span-6">
              <label for="shop-name" class="block text-sm font-medium text-gray-700">Shop Name</label>
              <input v-model="form.shopName" type="text" name="shop-name" id="shop-name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end">
      <button @click="saveProfile" :disabled="saving" type="button" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        {{ saving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </div>
</template>
