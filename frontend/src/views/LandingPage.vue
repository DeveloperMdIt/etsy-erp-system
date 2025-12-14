<script setup lang="ts">
import PublicHeader from '../components/PublicHeader.vue'
import PublicFooter from '../components/PublicFooter.vue'
import BackToTop from '../components/BackToTop.vue'

// Types
interface Feature {
  name: string
  status: 'active' | 'planned'
}

interface Category {
  title: string
  icon: string
  color: string
  bg: string
  features: Feature[]
}

const moduleCategories: Category[] = [
  {
    title: 'Auftragsabwicklung',
    icon: '📦',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    features: [
      { name: 'Auftragsdokumente (Rechnung, Lieferschein)', status: 'active' },
      { name: 'Versandlabels (DHL, Deutsche Post)', status: 'active' },
      { name: 'Kundenportal', status: 'planned' },
      { name: 'Mahnwesen', status: 'planned' },
      { name: 'Retourenmanagement', status: 'planned' },
      { name: 'Stornierung & Gutschriften', status: 'active' },
      { name: 'Zahlungsabgleich', status: 'planned' }
    ]
  },
  {
    title: 'Artikelverwaltung',
    icon: '🏷️',
    color: 'text-green-600',
    bg: 'bg-green-50',
    features: [
      { name: 'Bestandsabgleich (Multi-Channel)', status: 'active' },
      { name: 'Lagerverwaltung', status: 'planned' },
      { name: 'Stücklisten & Sets', status: 'active' },
      { name: 'Digitale Artikel', status: 'planned' },
      { name: 'Bildspeicher', status: 'active' },
      { name: 'Seriennummern', status: 'planned' },
      { name: 'Preiskalkulation', status: 'active' }
    ]
  },
  {
    title: 'Automatisierung',
    icon: '⚡',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    features: [
      { name: 'Automatische Rechnungsstellung', status: 'active' },
      { name: 'Automatischer E-Mail Versand', status: 'active' },
      { name: 'Regelbasierte Aktionen', status: 'active' },
      { name: 'Zeitgesteuerte Aufgaben', status: 'planned' },
      { name: 'Bestellstatus-Updates', status: 'active' },
      { name: 'Export-Automatisierung', status: 'planned' }
    ]
  },
  {
    title: 'Finanzen & Buchhaltung',
    icon: '💰',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    features: [
      { name: 'DATEV-Export', status: 'planned' },
      { name: 'Umsatzberichte', status: 'active' },
      { name: 'Lexoffice Schnittstelle', status: 'planned' },
      { name: 'SevDesk Anbindung', status: 'planned' },
      { name: 'OSS-Verfahren (One Stop Shop)', status: 'active' },
      { name: 'Währungsumrechnung', status: 'active' }
    ]
  }
]
</script>

<template>
  <div class="bg-white overflow-x-hidden">
    <!-- Navigation -->
    <PublicHeader />

    <!-- Hero Section -->
    <div class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div class="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            <!-- Left Column: Text -->
            <div class="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
                <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6 leading-tight">
                    <span class="block">Deine Warenwirtschaft.</span>
                    <span class="block text-inventivy-blue">Flexibel wie dein Business.</span>
                </h1>
                <p class="mt-4 text-lg text-gray-500 max-w-lg mx-auto lg:mx-0">
                    Starte mit dem Kernsystem und buche Module einfach dazu, wenn du sie brauchst.
                    Professionelle Funktionen für E-Commerce – ohne Ballast, ohne versteckte Kosten.
                </p>
                <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <router-link to="/register" class="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-inventivy-blue hover:bg-blue-700 md:py-4 md:text-lg shadow-xl shadow-blue-200 transition-all hover:scale-105">
                        Kostenlos starten
                    </router-link>
                    <a href="#features" class="flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg transition-all hover:scale-105">
                        Funktionen
                    </a>
                </div>
            </div>

            <!-- Right Column: Mockup -->
            <div class="lg:col-span-6 relative">
                 <div class="relative rounded-xl shadow-2xl border border-gray-200 bg-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <!-- Dashboard Mockup Header -->
                    <div class="h-10 bg-gray-50 border-b flex items-center px-4 gap-2 rounded-t-xl">
                        <div class="w-3 h-3 rounded-full bg-red-400"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div class="w-3 h-3 rounded-full bg-green-400"></div>
                        <div class="ml-4 h-4 w-32 bg-gray-200 rounded-sm"></div>
                    </div>
                    
                    <!-- Dashboard Content -->
                    <div class="p-6 bg-gray-50 min-h-[400px]">
                        <div class="flex justify-between items-center mb-6">
                            <div class="h-6 w-32 bg-gray-800 rounded"></div>
                            <div class="h-8 w-8 bg-white rounded-full border"></div>
                        </div>

                        <!-- Info Cards (Stats) -->
                        <div class="grid grid-cols-2 gap-4 mb-6">
                             <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                 <div class="text-xs text-gray-400 uppercase font-semibold mb-1">Umsatz heute</div>
                                 <div class="text-2xl font-bold text-gray-900">452,50 €</div>
                                 <div class="text-xs text-green-500 mt-1">▲ +12% vs. gestern</div>
                             </div>
                             <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                 <div class="text-xs text-gray-400 uppercase font-semibold mb-1">Offene Bestellungen</div>
                                 <div class="text-2xl font-bold text-gray-900">12</div>
                                 <div class="text-xs text-orange-500 mt-1">⚡ 3 Express</div>
                             </div>
                        </div>

                        <!-- Chart Area -->
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                             <div class="flex justify-between items-center mb-4">
                                <div class="h-4 w-24 bg-gray-200 rounded"></div>
                                <div class="h-6 w-16 bg-gray-50 rounded"></div>
                             </div>
                             <div class="h-32 flex items-end space-x-2">
                                 <div class="w-1/6 bg-blue-50 h-[40%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-100 h-[60%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-200 h-[30%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-500 h-[80%] rounded-t shadow-lg shadow-blue-200"></div>
                                 <div class="w-1/6 bg-blue-300 h-[50%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-100 h-[45%] rounded-t"></div>
                             </div>
                        </div>

                        <!-- Recent Orders Table -->
                        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                             <div class="px-4 py-3 border-b border-gray-50">
                                 <div class="h-4 w-24 bg-gray-800 rounded"></div>
                             </div>
                             <div class="p-4 space-y-3">
                                 <div class="flex justify-between items-center">
                                     <div class="h-3 w-8 bg-gray-200 rounded"></div>
                                     <div class="h-3 w-24 bg-gray-100 rounded"></div>
                                     <div class="h-3 w-12 bg-green-100 text-green-600 text-[10px] px-1 rounded text-center">Bezahlt</div>
                                 </div>
                                 <div class="flex justify-between items-center">
                                     <div class="h-3 w-8 bg-gray-200 rounded"></div>
                                     <div class="h-3 w-20 bg-gray-100 rounded"></div>
                                     <div class="h-3 w-12 bg-orange-100 text-orange-600 text-[10px] px-1 rounded text-center">Offen</div>
                                 </div>
                                 <div class="flex justify-between items-center">
                                     <div class="h-3 w-8 bg-gray-200 rounded"></div>
                                     <div class="h-3 w-22 bg-gray-100 rounded"></div>
                                     <div class="h-3 w-12 bg-green-100 text-green-600 text-[10px] px-1 rounded text-center">Versendet</div>
                                 </div>
                             </div>
                        </div>
                        
                        <!-- Floating Badge -->
                        <div class="absolute -right-6 top-10 bg-white p-3 rounded-lg shadow-xl border border-gray-100 animate-bounce delay-1000 hidden lg:block">
                            <div class="flex items-center space-x-3">
                                <div class="bg-green-100 p-2 rounded-full">
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500">Sync Status</div>
                                    <div class="text-sm font-bold text-gray-900">Alles aktuell</div>
                                </div>
                            </div>
                        </div>

                    </div>
                 </div>
                 
                 <!-- Background Blur -->
                 <div class="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-50 blur-2xl -z-10"></div>
            </div>

        </div>

      </div>
      
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-3xl"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-3xl"></div>
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
          <p class="mt-4 max-w-3xl text-xl text-gray-500 mx-auto px-2">
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
          <p class="mt-4 max-w-2xl text-xl text-gray-500 mx-auto px-2">
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
                    <li v-for="feature in category.features" :key="feature.name" class="flex items-start text-gray-600">
                        <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <div class="flex flex-col">
                          <span class="text-sm font-medium">{{ feature.name }}</span>
                          <span v-if="feature.status === 'planned'" class="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm self-start mt-0.5">
                            Bald verfügbar
                          </span>
                        </div>
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
        <p class="mt-4 max-w-3xl mx-auto text-xl text-gray-500 leading-relaxed px-2">
          Inventivy ist eine praxisnahe Warenwirtschaft für den professionellen Onlinehandel.
          Entstanden aus eigener Erfahrung im E-Commerce, entwickelt für Händler, die leistungsfähige Funktionen benötigen, ohne sich an hohe Fixkosten oder überdimensionierte Systeme zu binden.
        </p>
        <p class="mt-4 max-w-3xl mx-auto text-lg text-gray-500 px-2">
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
