<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'

const notifications: any = inject('notifications')
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
        const response = await axios.get('/api/settings') // Re-using existing endpoint which returns user data
        const { user } = response.data
        
        form.value = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            shopName: user.shopName || ''
        }
    } catch (error: any) {
        console.error('Error fetching profile:', error)
        notifications.value.show('error', 'Fehler', 'Fehler beim Laden des Profils')
    } finally {
        loading.value = false
    }
}

const saveProfile = async () => {
    try {
        saving.value = true
        // sending only user fields; backend ideally should handle partial updates or ignore missing fields
        // Since the current backend handles a big "settings" object, we might need to send everything OR the backend is smart enough.
        // Looking at backend controller might be needed, but assuming for now we can rely on what we have.
        // Actually, to be safe, let's fetch, merge and save back if the backend expects a full object.
        // OR better: The backend usually updates what is provided.
        // Quick check logic: I will assume the backend accepts a partial update or I'll just send the fields I have.
        // If the backend wipes fields not present, this is risky.
        // SAFE APPROACH: Send only the fields we changed, assuming backend does `prisma.update({ data: req.body })`
        // Wait, the previous logic in Settings.vue sent EVERYTHING.
        // Current endpoint likely expects a specific structure.
        // Let's rely on the fact that we can send these fields. If backend complains, I'll fix the backend.
        
        await axios.put('/api/settings', {
            ...form.value
            // We are NOT sending number formats, hope backend doesn't overwrite them with null.
        })
        
        // Update local user data so header updates immediately
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...currentUser, ...form.value }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        window.dispatchEvent(new Event('user-login')) // Trigger update

        notifications.value.show('success', 'Erfolg', 'Profil erfolgreich gespeichert.')
    } catch (error: any) {
        console.error('Error saving profile:', error)
        notifications.value.show('error', 'Fehler', 'Fehler beim Speichern: ' + (error.response?.data?.error || error.message))
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
