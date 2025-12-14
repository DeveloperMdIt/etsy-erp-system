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
    <div class="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl mb-8 break-words leading-tight">
            <span class="block">Deine Warenwirtschaft.</span>
            <span class="block text-inventivy-blue">Flexibel wie dein Business.</span>
          </h1>
          <p class="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 px-2">
            Starte mit dem Kernsystem und buche Module einfach dazu, wenn du sie brauchst.
            Professionelle Funktionen für E-Commerce – ohne Ballast, ohne versteckte Kosten.
          </p>
          <div class="mt-10 max-w-sm mx-auto sm:max-w-none flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            <router-link to="/register" class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-inventivy-blue hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-xl shadow-blue-200 transition-all hover:scale-105">
              Kostenlos starten
            </router-link>
            <a href="#features" class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all hover:scale-105">
              Funktionen entdecken
            </a>
          </div>
        </div>
        
        <!-- Laptop Mockup -->
        <div class="mt-16 sm:mt-24 relative">
             <div class="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-50">
                 <!-- Use the generated image or a placeholder if not ready, for now using a clean div approach or the image user might expect -->
                 <!-- Since I cannot put the actual generated file path directly if it's not served, I will use an img tag pointing to a relative path assuming it gets copied or I can stick to a CSS mockup if preferred. User asked for "images like this". Integrating the generated one. -->
                 <!-- For production deployment I would need to put the asset in public. For now, I will use a high quality CSS mockup or similar structure if I can't guarantee the asset link. 
                 Wait, I can create a CSS laptop Frame! Or I can rely on the fact that I can't easily push the generated image to the user's repo without complex moves. 
                 User asked "Do we get images like this". I will simulate it with a placeholder that represents the structure for now, or just use a nice CSS representation.
                 Actually, sticky to the previous CSS code structure but refined is safer, or try to reference a placeholder. 
                 Let's stay with the CSS mockup structure but make it responsive and clean. -->
                 
                  <div class="relative bg-gray-900 rounded-[1rem] shadow-xl ring-1 ring-gray-900/5 sm:rounded-[2rem]">
                      <!-- Screen bezel -->
                      <div class="rounded-[1rem] overflow-hidden bg-white aspect-[16/10] sm:rounded-[2rem] border-[8px] sm:border-[16px] border-gray-800 relative">
                          <!-- Camera dot -->
                           <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-[6px] sm:-mt-[12px] w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-700 rounded-full z-20"></div>

                           <!-- Actual Content (Dashboard Preview) -->
                            <div class="w-full h-full bg-gray-50 overflow-hidden flex flex-col">
                                <!-- Top Bar -->
                                <div class="h-8 sm:h-12 bg-white border-b flex items-center px-4 justify-between shrink-0">
                                     <div class="w-20 h-3 bg-gray-200 rounded"></div>
                                      <div class="flex space-x-2">
                                          <div class="w-6 h-6 rounded-full bg-gray-200"></div>
                                          <div class="w-6 h-6 rounded-full bg-gray-200"></div>
                                      </div>
                                </div>
                                <div class="flex flex-1 overflow-hidden">
                                     <!-- Sidebar -->
                                     <div class="w-16 sm:w-48 bg-white border-r hidden sm:block p-4 space-y-3 shrink-0">
                                          <div class="h-8 bg-inventivy-blue/10 text-inventivy-blue rounded flex items-center px-3 font-medium text-xs sm:text-sm">Dashboard</div>
                                          <div class="h-8 hover:bg-gray-50 rounded flex items-center px-3 text-gray-600 text-xs sm:text-sm">Bestellungen</div>
                                          <div class="h-8 hover:bg-gray-50 rounded flex items-center px-3 text-gray-600 text-xs sm:text-sm">Produkte</div>
                                          <div class="h-8 hover:bg-gray-50 rounded flex items-center px-3 text-gray-600 text-xs sm:text-sm">Kunden</div>
                                     </div>
                                      <!-- Main Content -->
                                      <div class="flex-1 p-4 sm:p-8 overflow-y-auto">
                                          <div class="flex justify-between items-end mb-6">
                                              <div>
                                                  <div class="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                                  <div class="h-8 w-48 bg-gray-800 rounded"></div>
                                              </div>
                                              <div class="h-8 w-24 bg-inventivy-blue rounded hidden sm:block"></div>
                                          </div>
                                          
                                          <!-- Stats Grid -->
                                          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                              <div class="bg-white p-4 rounded-lg shadow-sm border">
                                                  <div class="h-3 w-16 bg-gray-100 rounded mb-2"></div>
                                                  <div class="h-6 w-24 bg-gray-800 rounded"></div>
                                              </div>
                                              <div class="bg-white p-4 rounded-lg shadow-sm border">
                                                  <div class="h-3 w-16 bg-gray-100 rounded mb-2"></div>
                                                  <div class="h-6 w-24 bg-green-500 rounded"></div>
                                              </div>
                                              <div class="bg-white p-4 rounded-lg shadow-sm border">
                                                  <div class="h-3 w-16 bg-gray-100 rounded mb-2"></div>
                                                  <div class="h-6 w-24 bg-gray-800 rounded"></div>
                                              </div>
                                               <div class="bg-white p-4 rounded-lg shadow-sm border">
                                                  <div class="h-3 w-16 bg-gray-100 rounded mb-2"></div>
                                                  <div class="h-6 w-24 bg-purple-500 rounded"></div>
                                              </div>
                                          </div>

                                          <!-- Table Mockup -->
                                          <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                                              <div class="h-10 border-b bg-gray-50"></div>
                                              <div class="p-4 space-y-3">
                                                  <div class="h-4 w-full bg-gray-100 rounded"></div>
                                                  <div class="h-4 w-full bg-gray-100 rounded"></div>
                                                  <div class="h-4 w-full bg-gray-100 rounded"></div>
                                              </div>
                                          </div>
                                      </div>
                                </div>
                            </div>
                      </div>
                      <div class="relative bg-gray-800 mx-auto h-3 sm:h-4 w-[120%] -ml-[10%] rounded-b-xl shadow-2xl opacity-50 blur-xl top-[-2px]"></div>
                  </div>
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
