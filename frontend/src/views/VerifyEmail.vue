<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
    const token = route.query.token as string
    const email = route.query.email as string

    if (!token || !email) {
        status.value = 'error'
        message.value = 'Ungültiger Link.'
        return
    }

    try {
        await axios.post('/api/auth/verify-email', { token, email })
        status.value = 'success'
        setTimeout(() => {
            router.push('/login')
        }, 3000)
    } catch (error: any) {
        status.value = 'error'
        message.value = error.response?.data?.error || 'Verifizierung fehlgeschlagen.'
    }
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Email Verifizierung
            </h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                <div v-if="status === 'loading'">
                    <svg class="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="mt-4 text-gray-600">Verifiziere...</p>
                </div>
                
                <div v-else-if="status === 'success'">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">Erfolgreich!</h3>
                    <p class="mt-2 text-sm text-gray-500">Deine Email wurde bestätigt. Du wirst gleich weitergeleitet.</p>
                </div>

                <div v-else>
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">Fehler</h3>
                    <p class="mt-2 text-sm text-red-600">{{ message }}</p>
                    <div class="mt-4">
                        <router-link to="/login" class="text-indigo-600 hover:text-indigo-500">Zum Login</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
