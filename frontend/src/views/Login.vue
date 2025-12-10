<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const notifications: any = inject('notifications') // Inject
const router = useRouter()
const email = ref('')
const password = ref('')
// const error = ref('') // Use notification instead? Or keep for form? Keep for inline, but maybe notify too.
const error = ref('')
const loading = ref(false)

const login = async () => {
  if (!email.value || !password.value) {
    // error.value = 'Bitte Email und Passwort eingeben'
    notifications.value.show('warning', 'Fehlende Daten', 'Bitte Email und Passwort eingeben')
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await axios.post('/api/auth/login', {
      email: email.value,
      password: password.value,
    })

    // Store token and user
    localStorage.setItem('authToken', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    // Notify App to update user state
    window.dispatchEvent(new Event('user-login'))

    notifications.value.show('success', 'Willkommen', `Willkommen zurück, ${response.data.user.firstName || 'Benutzer'}!`)

    // Redirect to dashboard (setup check disabled for now)
    router.push('/')
  } catch (err: any) {
    const msg = err.response?.data?.error || 'Login fehlgeschlagen'
    error.value = msg
    notifications.value.show('error', 'Fehler', msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🛍️ Etsy ERP</h1>
        <p class="text-gray-600">Shop-Verwaltungssystem</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Anmelden</h2>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <form @submit.prevent="login" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="ihre-email@beispiel.de"
            >
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="••••••••"
            >
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Anmelden...
            </span>
            <span v-else>Anmelden</span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Noch kein Konto?
            <router-link to="/register" class="text-blue-600 hover:text-blue-700 font-medium">
              Jetzt registrieren
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
