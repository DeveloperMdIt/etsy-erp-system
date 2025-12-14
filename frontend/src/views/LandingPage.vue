<script setup lang="ts">
// import { useRouter } from 'vue-router'

// const router = useRouter()

const features = [
  {
    title: 'Multi-Channel Vertrieb',
    description: 'Verwalte deine Bestellungen von Etsy, eBay und eigenem Shop an einem Ort.',
    icon: '🌐'
  },
  {
    title: 'Automatisierter Versand',
    description: 'Erstelle Versandlabels für DHL, Deutsche Post und mehr mit einem Klick.',
    icon: '📦'
  },
  {
    title: 'Rechnungsstellung',
    description: 'Automatische Erstellung und Versand von Rechnungen & Lieferscheinen.',
    icon: '📄'
  },
  {
    title: 'Bestandsmanagement',
    description: 'Synchronisiere deinen Warenbestand über alle Kanäle hinweg.',
    icon: '📊'
  }
]
import Logo from '../components/Logo.vue'
</script>

<template>
  <div class="bg-white">
    <!-- Navigation -->
    <nav class="absolute w-full z-10 top-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center">
             <Logo logoClass="h-10" />
          </div>
          <div class="hidden md:flex space-x-8">
            <a href="#features" class="text-gray-600 hover:text-inventivy-blue font-medium">Funktionen</a>
            <router-link to="/pricing" class="text-gray-600 hover:text-inventivy-blue font-medium">Preise</router-link>
            <a href="#about" class="text-gray-600 hover:text-inventivy-blue font-medium">Über uns</a>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/login" class="text-gray-600 hover:text-inventivy-blue font-medium">Login</router-link>
            <router-link to="/register" class="bg-inventivy-blue text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Kostenlos testen
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-8">
            <span class="block">Der einfache Weg zum</span>
            <span class="block text-inventivy-blue">E-Commerce Erfolg</span>
          </h1>
          <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Verbinde deine Shops, automatisiere deinen Versand und behalte den Überblick.
            Alles in einer modernen, intuitiven Plattform.
          </p>
          <div class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center gap-4">
            <router-link to="/register" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-inventivy-blue hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-xl shadow-blue-200 transition-all hover:scale-105">
              Jetzt starten
            </router-link>
            <a href="#demo" class="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all hover:scale-105">
              Demo ansehen
            </a>
          </div>
        </div>
      </div>
      
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl"></div>
      </div>
    </div>

    <!-- UI Mockup Section -->
    <div class="relative -mt-12 lg:-mt-24 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div class="absolute top-0 w-full h-8 bg-gray-50 border-b flex items-center px-4 gap-2">
            <div class="w-3 h-3 rounded-full bg-red-400"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div class="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div class="p-2 pt-10">
            <!-- Simplified Dashboard Mockup -->
             <div class="grid grid-cols-4 gap-4 p-4 text-left">
                <div class="col-span-1 bg-gray-50 p-4 rounded-lg hidden md:block">
                   <div class="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                   <div class="space-y-2">
                      <div class="h-8 w-full bg-indigo-50 text-indigo-700 rounded flex items-center px-2" translate="no">Dashboard</div>
                      <div class="h-8 w-full hover:bg-gray-100 rounded flex items-center px-2">Bestellungen</div>
                      <div class="h-8 w-full hover:bg-gray-100 rounded flex items-center px-2">Produkte</div>
                   </div>
                </div>
                <div class="col-span-4 md:col-span-3">
                   <div class="flex justify-between mb-6">
                      <div class="h-8 w-48 bg-gray-200 rounded"></div>
                      <div class="h-8 w-24 bg-indigo-600 rounded"></div>
                   </div>
                   <div class="grid grid-cols-3 gap-4 mb-6">
                      <div class="bg-white border rounded-lg p-4 shadow-sm">
                         <div class="text-sm text-gray-500">Umsatz heute</div>
                         <div class="text-2xl font-bold mt-1">452,00 €</div>
                      </div>
                      <div class="bg-white border rounded-lg p-4 shadow-sm">
                         <div class="text-sm text-gray-500">Offene Bestellungen</div>
                         <div class="text-2xl font-bold mt-1 text-orange-500">12</div>
                      </div>
                      <div class="bg-white border rounded-lg p-4 shadow-sm">
                         <div class="text-sm text-gray-500">Versendet</div>
                         <div class="text-2xl font-bold mt-1 text-green-600">28</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-base text-inventivy-blue font-semibold tracking-wide uppercase">Features</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Alles was du brauchst in einer App
          </p>
        </div>

        <div class="mt-20">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="feature in features" :key="feature.title" class="pt-6">
              <div class="flow-root bg-white rounded-xl px-6 pb-8 h-full shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div class="-mt-6">
                  <div>
                    <span class="inline-flex items-center justify-center p-3 bg-inventivy-blue rounded-xl shadow-lg text-white">
                      <span class="text-2xl">{{ feature.icon }}</span>
                    </span>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">{{ feature.title }}</h3>
                  <p class="mt-5 text-base text-gray-500">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-inventivy-blue">
      <div class="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl">
          <span class="block">Bereit dein Business zu skalieren?</span>
          <span class="block text-blue-200">Starte heute kostenlos.</span>
        </h2>
        <p class="mt-4 text-lg leading-6 text-blue-100">
          Keine Kreditkarte erforderlich. 14 Tage kostenlos testen.
        </p>
        <router-link to="/register" class="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-inventivy-blue bg-white hover:bg-blue-50 sm:w-auto">
          Jetzt loslegen
        </router-link>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-base text-gray-400">
          &copy; 2025 Inventivy. Alle Rechte vorbehalten. 
          <span class="mx-2">|</span>
          <router-link to="/privacy" class="hover:text-white transition-colors">Datenschutz</router-link>
          <span class="mx-2">|</span>
          <router-link to="/terms" class="hover:text-white transition-colors">AGB</router-link>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Optional specific styles if needed */
</style>
