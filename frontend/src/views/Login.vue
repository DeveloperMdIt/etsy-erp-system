<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useNotifications } from '../composables/useNotifications'
import Logo from '../components/Logo.vue'

const { showSuccess, showError, showWarning } = useNotifications()
const router = useRouter()
const email = ref('')
const password = ref('')
// const error = ref('') // Use notification instead? Or keep for form? Keep for inline, but maybe notify too.
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const route = useRoute()

// Check for registration success
if (route.query.registered === 'true') {
  showSuccess('Registrierung erfolgreich! Bitte bestätige deine Email-Adresse um dich einzuloggen.')
}

const login = async () => {
  if (!email.value || !password.value) {
    // error.value = 'Bitte Email und Passwort eingeben'
    showWarning('Bitte Email und Passwort eingeben')
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await axios.post('/api/auth/login', {
      email: email.value,
      password: password.value,
    })

    // Store token and user (Session only)
    sessionStorage.setItem('authToken', response.data.token)
    sessionStorage.setItem('user', JSON.stringify(response.data.user))

    // Notify App to update user state
    window.dispatchEvent(new Event('user-login'))

    showSuccess(`Willkommen zurück, ${response.data.user.firstName || 'Benutzer'}!`)

    // Redirect to dashboard (setup check disabled for now)
    router.push('/')
  } catch (err: any) {
    const msg = err.response?.data?.error || 'Login fehlgeschlagen'
    const details = err.response?.data?.details || ''
    const stack = err.response?.data?.stack || ''
    
    if (details) {
        alert(`LOGIN ERROR:\n${msg}\n\nDETAILS:\n${details}\n\nSTACK:\n${stack.substring(0, 200)}...`)
    }

    error.value = msg
    showError(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo/Header -->
      <div class="text-center mb-8 flex flex-col items-center">
        <router-link to="/">
          <Logo 
            containerClass="mb-2 hover:opacity-90 transition-opacity" 
            logoClass="h-20"
          />
        </router-link>
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
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 pr-10"
                placeholder="••••••••"
              >
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg v-if="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
