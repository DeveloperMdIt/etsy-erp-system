<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Logo from '../components/Logo.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const shopName = ref('')
const error = ref('')
const loading = ref(false)

const register = async () => {
  if (!email.value || !password.value) {
    error.value = 'Bitte Email und Passwort eingeben'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwörter stimmen nicht überein'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Passwort muss mindestens 8 Zeichen lang sein'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await axios.post('/api/auth/register', {
      email: email.value,
      password: password.value,
      firstName: firstName.value || undefined,
      lastName: lastName.value || undefined,
      shopName: shopName.value || undefined,
    })

    // Store token and user
    localStorage.setItem('authToken', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    // Notify App to update user state
    window.dispatchEvent(new Event('user-login'))

    // Redirect to dashboard
    router.push('/')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Registrierung fehlgeschlagen'
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

      <!-- Register Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Registrieren</h2>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <form @submit.prevent="register" class="space-y-4">
          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Vorname
              </label>
              <input
                v-model="firstName"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                placeholder="Maria"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nachname
              </label>
              <input
                v-model="lastName"
                type="text"
                class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                placeholder="Müller"
              >
            </div>
          </div>

          <!-- Shop Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Shop-Name (optional)
            </label>
            <input
              v-model="shopName"
              type="text"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="z.B. Mein Shop"
            >

          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email *
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
              Passwort *
            </label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="Mindestens 8 Zeichen"
            >
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen *
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
              placeholder="Passwort wiederholen"
            >
          </div>

          <!-- Register Button -->
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
              Registrieren...
            </span>
            <span v-else>Jetzt registrieren</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Bereits registriert?
            <router-link to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
              Zum Login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
