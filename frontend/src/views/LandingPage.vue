<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

// Types
interface Feature {
  name: string
  status: 'active' | 'planned'
  description?: string
  price?: number
}



const modules = ref<any[]>([])

const categoryConfig: Record<string, { icon: string, color: string, bg: string }> = {
  'Auftragsabwicklung': { icon: '📦', color: 'text-blue-600', bg: 'bg-blue-50' },
  'Artikelverwaltung': { icon: '🏷️', color: 'text-green-600', bg: 'bg-green-50' },
  'Automatisierung': { icon: '⚡', color: 'text-purple-600', bg: 'bg-purple-50' },
  'Finanzen & Buchhaltung': { icon: '💰', color: 'text-orange-600', bg: 'bg-orange-50' },
  'Sonstiges': { icon: '🔧', color: 'text-gray-600', bg: 'bg-gray-50' }
}

const moduleCategories = computed(() => {
    const grouped: Record<string, Feature[]> = {}
    
    modules.value.forEach(m => {
        const cat = m.category || 'Sonstiges'
        if (!grouped[cat]) grouped[cat] = []
        grouped[cat].push({
            name: m.name,
            status: m.isPlanned ? 'planned' : 'active',
            description: m.description,
            price: m.price
        })
    })

    return Object.keys(grouped).map(title => {
const config = categoryConfig[title] || categoryConfig['Sonstiges']!
        return {
            title,
            icon: config.icon,
            color: config.color,
            bg: config.bg,
            features: grouped[title]
        }
    })
})

onMounted(async () => {
    try {
        const res = await axios.get('/api/public/modules')
        modules.value = res.data
    } catch (error) {
        console.error('Failed to fetch modules', error)
        // Fallback or empty state could be handled here
    }
})
</script>

<template>
  <div class="bg-white overflow-x-hidden">
    <!-- Navigation -->
    <PublicHeader />

    <!-- Hero Section -->
    <div class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <!-- Headline: Full Width -->
        <div class="text-center max-w-5xl mx-auto mb-12 lg:mb-16">
            <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl break-words leading-tight">
                <span class="block">Deine Warenwirtschaft.</span>
                <span class="block text-inventivy-blue">Flexibel wie dein Business.</span>
            </h1>
        </div>

        <div class="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            <!-- Left Column: Text & Buttons -->
            <div class="lg:col-span-5 text-center lg:text-left mb-12 lg:mb-0">
                <p class="text-lg sm:text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
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
            <div class="lg:col-span-7 relative flex justify-center lg:justify-end">
                 <!-- Increased max-w to lg, but reduced height by removing content -->
                 <div class="relative w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 bg-white transition-transform duration-500">
                    <!-- Dashboard Mockup Header -->
                    <div class="h-8 bg-gray-50 border-b flex items-center px-4 gap-2 rounded-t-xl">
                        <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        <div class="ml-4 h-3 w-32 bg-gray-200 rounded-sm"></div>
                    </div>
                    
                    <!-- Dashboard Content -->
                    <div class="p-4 bg-gray-50">
                        <div class="flex justify-between items-center mb-4">
                            <div class="h-4 w-24 bg-gray-800 rounded"></div>
                            <div class="h-6 w-6 bg-white rounded-full border"></div>
                        </div>

                        <!-- Info Cards (Stats) -->
                        <div class="grid grid-cols-2 gap-3 mb-4">
                             <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                 <div class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Umsatz heute</div>
                                 <div class="text-xl font-bold text-gray-900 truncate">452,50 €</div>
                                 <div class="text-[10px] text-green-500">▲ +12%</div>
                             </div>
                             <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                 <div class="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Bestellungen</div>
                                 <div class="text-xl font-bold text-gray-900">12</div>
                                 <div class="text-[10px] text-orange-500">⚡ 3 Express</div>
                             </div>
                        </div>

                        <!-- Chart Area (Reduced Height) -->
                        <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                             <div class="flex justify-between items-center mb-2">
                                <div class="h-3 w-16 bg-gray-200 rounded"></div>
                                <div class="h-4 w-12 bg-gray-50 rounded"></div>
                             </div>
                             <div class="h-20 flex items-end space-x-2">
                                 <div class="w-1/6 bg-blue-50 h-[40%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-100 h-[60%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-200 h-[30%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-500 h-[80%] rounded-t shadow-lg shadow-blue-200"></div>
                                 <div class="w-1/6 bg-blue-300 h-[50%] rounded-t"></div>
                                 <div class="w-1/6 bg-blue-100 h-[45%] rounded-t"></div>
                             </div>
                        </div>
                        
                        <!-- Floating Badge -->
                        <div class="absolute -right-4 top-8 bg-white p-2 rounded-lg shadow-xl border border-gray-100 animate-bounce delay-1000 hidden sm:block scale-90">
                            <div class="flex items-center space-x-2">
                                <div class="bg-green-100 p-1.5 rounded-full">
                                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div>
                                    <div class="text-[10px] text-gray-500 leading-none">Status</div>
                                    <div class="text-xs font-bold text-gray-900 leading-tight">Aktuell</div>
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
