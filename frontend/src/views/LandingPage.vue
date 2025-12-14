<script setup lang="ts">
import { ref } from 'vue'
import PublicHeader from '../components/PublicHeader.vue'
import PublicFooter from '../components/PublicFooter.vue'
import BackToTop from '../components/BackToTop.vue'

const moduleCategories = [
  {
    title: 'Auftragsabwicklung',
    icon: '📦',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    features: [
      'Auftragsdokumente (Rechnung, Lieferschein)',
      'Versandlabels (DHL, Deutsche Post)',
      'Kundenportal',
      'Mahnwesen',
      'Retourenmanagement',
      'Stornierung & Gutschriften',
      'Zahlungsabgleich'
    ]
  },
  {
    title: 'Artikelverwaltung',
    icon: '🏷️',
    color: 'text-green-600',
    bg: 'bg-green-50',
    features: [
      'Bestandsabgleich (Multi-Channel)',
      'Lagerverwaltung',
      'Stücklisten & Sets',
      'Digitale Artikel',
      'Bildspeicher',
      'Seriennummern',
      'Preiskalkulation'
    ]
  },
  {
    title: 'Automatisierung',
    icon: '⚡',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    features: [
      'Automatische Rechnungsstellung',
      'Automatischer E-Mail Versand',
      'Regelbasierte Aktionen',
      'Zeitgesteuerte Aufgaben',
      'Bestellstatus-Updates',
      'Export-Automatisierung'
    ]
  },
  {
    title: 'Finanzen & Buchhaltung',
    icon: '💰',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    features: [
      'DATEV-Export',
      'Umsatzberichte',
      'Lexoffice Schnittstelle',
      'SevDesk Anbindung',
      'OSS-Verfahren (One Stop Shop)',
      'Währungsumrechnung'
    ]
  }
]
</script>

<template>
  <div class="bg-white">
    <!-- Navigation -->
    <PublicHeader />

    <!-- Hero Section -->
    <div class="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-8">
            <span class="block">Deine Warenwirtschaft.</span>
            <span class="block text-inventivy-blue">Flexibel wie dein Business.</span>
          </h1>
          <p class="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Starte mit dem Kernsystem und buche Module einfach dazu, wenn du sie brauchst.
            Professionelle Funktionen für E-Commerce – ohne Ballast, ohne versteckte Kosten.
          </p>
          <div class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center gap-4">
            <router-link to="/register" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-inventivy-blue hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-xl shadow-blue-200 transition-all hover:scale-105">
              Kostenlos starten
            </router-link>
            <a href="#features" class="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all hover:scale-105">
              Funktionen entdecken
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

    <!-- Core Value Proposition: Modular System -->
    <div class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-base text-inventivy-blue font-semibold tracking-wide uppercase">Das Prinzip</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Zahle nur, was du nutzt
          </p>
          <p class="mt-4 max-w-3xl text-xl text-gray-500 mx-auto">
            Inventivy ist modular aufgebaut. Das Basis-System ist kostenlos. 
            Spezielle Funktionen und Erweiterungen (Module) kannst du flexibel hinzubuchen – genau dann, wenn dein Business sie erfordert.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                <div class="text-4xl mb-4">🌱</div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Für Starter</h3>
                <p class="text-gray-600">Nutze alle Grundfunktionen kostenlos. Perfekt für den Start ohne Risiko und Fixkosten.</p>
            </div>
            <div class="bg-inventivy-blue/5 rounded-2xl p-8 border border-inventivy-blue/20 text-center relative overflow-hidden">
                 <div class="absolute top-0 right-0 bg-inventivy-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Empfohlen</div>
                <div class="text-4xl mb-4">🚀</div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Für Wachstumsphasen</h3>
                <p class="text-gray-600">Buche Automatisierung und erweiterte Schnittstellen dazu, um Zeit zu sparen.</p>
            </div>
            <div class="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
                <div class="text-4xl mb-4">🏢</div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Für Profis</h3>
                <p class="text-gray-600">Volle Power mit Multi-Lager, Mitarbeiter-Accounts und Premium-Support.</p>
            </div>
        </div>
      </div>
    </div>

    <!-- Modular Feature Grid -->
    <div id="features" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-base text-inventivy-blue font-semibold tracking-wide uppercase">Alle Module</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Ein Baukasten für deinen Erfolg
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Wähle aus über 50 Funktionen die Bausteine, die zu deinem Workflow passen.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div v-for="category in moduleCategories" :key="category.title" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-6 border-b border-gray-50 flex items-center justify-between" :class="category.bg">
                <div class="flex items-center space-x-4">
                    <span class="text-3xl">{{ category.icon }}</span>
                    <h3 class="text-xl font-bold text-gray-900">{{ category.title }}</h3>
                </div>
            </div>
            <div class="p-6">
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <li v-for="feature in category.features" :key="feature" class="flex items-start text-gray-600">
                        <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span class="text-sm font-medium">{{ feature }}</span>
                    </li>
                     <!-- Placeholder for 'more' -->
                     <li class="flex items-start text-inventivy-blue opacity-75">
                        <svg class="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span class="text-sm font-medium italic">... und vieles mehr</span>
                    </li>
                </ul>
            </div>
          </div>
        </div>
        
        <div class="mt-12 text-center">
             <router-link to="/register" class="inline-flex items-center text-inventivy-blue font-bold hover:text-blue-700">
                Alle Funktionen im Detail ansehen
                <svg class="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
             </router-link>
        </div>

      </div>
    </div>

    <!-- About Teaser -->
    <div class="py-20 bg-white border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          Warenwirtschaft aus der Praxis
        </h2>
        <p class="mt-4 max-w-3xl mx-auto text-xl text-gray-500 leading-relaxed">
          Inventivy ist eine praxisnahe Warenwirtschaft für den professionellen Onlinehandel.
          Entstanden aus eigener Erfahrung im E-Commerce, entwickelt für Händler, die leistungsfähige Funktionen benötigen, ohne sich an hohe Fixkosten oder überdimensionierte Systeme zu binden.
        </p>
        <p class="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
          Unser Fokus liegt auf klaren Prozessen, verständlicher Bedienung und einem fairen Kosten-Nutzen-Verhältnis. Inventivy wächst modular mit den Anforderungen seiner Nutzer.
        </p>
        <div class="mt-8">
          <router-link to="/about" class="text-inventivy-blue font-medium hover:text-blue-700 underline text-lg">
            Mehr über uns erfahren →
          </router-link>
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
          Keine Kreditkarte erforderlich. 30 Tage kostenlos testen.
        </p>
        <router-link to="/register" class="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-inventivy-blue bg-white hover:bg-blue-50 sm:w-auto">
          Jetzt loslegen
        </router-link>
      </div>
    </div>

    <!-- Footer -->
    <PublicFooter />
    
    <BackToTop />
  </div>
</template>

<style scoped>
/* Optional specific styles if needed */
</style>
