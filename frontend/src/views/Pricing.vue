<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import PublicHeader from '../components/PublicHeader.vue'
import PublicFooter from '../components/PublicFooter.vue'
import BackToTop from '../components/BackToTop.vue'
import { CheckIcon } from '@heroicons/vue/24/solid'

const plans = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  window.scrollTo(0, 0)
  try {
      const res = await axios.get('/api/subscription-plans?activeOnly=true')
      plans.value = res.data
  } catch (e) {
      console.error('Failed to fetch plans', e)
  } finally {
      loading.value = false
  }
})

const sortedPlans = computed(() => {
    return [...plans.value].sort((a, b) => a.price - b.price)
})

const openFaq = ref<number | null>(null)

const faqs = [
  {
    question: 'Wie lange dauert die Testphase?',
    answer: 'Du kannst Inventivy 30 Tage lang uneingeschränkt und völlig kostenlos testen. Es ist keine Kreditkarte erforderlich.'
  },
  {
    question: 'Muss ich Zahlungsdaten hinterlegen?',
    answer: 'Nein, für die Testphase und das Basis-Paket sind keine Zahlungsdaten notwendig.'
  },
  {
     question: 'Kann ich jederzeit kündigen?',
     answer: 'Ja, unsere kostenpflichtigen Pakete sind monatlich kündbar. Es gibt keine langen Vertragslaufzeiten.'
  },
  {
      question: 'Was passiert nach der Testphase?',
      answer: 'Dein Account wird automatisch in das kostenlose Basis-Paket umgestellt. Du musst nichts tun, wenn du kein Upgrade möchtest.'
  }
]

const toggleFaq = (index: number) => {
  if (openFaq.value === index) {
    openFaq.value = null
  } else {
    openFaq.value = index
  }
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price).replace('€', '').trim()
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Navigation -->
    <PublicHeader />

    <!-- Header -->
    <div class="pt-32 pb-12 bg-gradient-to-b from-gray-50 to-white text-center px-4">
      <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
        Fair, transparent & <span class="text-inventivy-blue">flexibel</span>
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Starte kostenlos und zahle nur, wenn du Umsatz machst. Oder wähle ein Paket für Planungssicherheit.
        Bei uns gibt es keine versteckten Kosten.
      </p>
    </div>

    <!-- Pricing Toggle / Explanation -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        
        <!-- Basis Model -->
        <div class="mb-20">
            <div class="text-center mb-10">
                <span class="inline-block py-1 px-3 rounded-full bg-green-100 text-green-800 font-semibold text-sm mb-4">Für ALLE Nutzer aktiv</span>
                <h2 class="text-3xl font-bold text-gray-900">Das Basis-Modell</h2>
        <div class="text-center">
          <h2 class="text-base text-inventivy-blue font-semibold tracking-wide uppercase">Preise</h2>
          <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Faire Preise für jede Phase deines Business
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Starte kostenlos und wähle später den Plan, der zu deinem Wachstum passt. 
            Keine versteckten Kosten.
          </p>
        </div>

        <!-- Pricing Tiers -->
        <div v-if="loading" class="text-center py-20 text-gray-500">Lade Preise...</div>
        <div v-else class="mt-16 grid gap-8 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
            
            <div 
                v-for="plan in sortedPlans" 
                :key="plan.id"
                class="bg-white rounded-2xl shadow-lg border flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
                :class="plan.isPopular ? 'border-inventivy-blue border-2 scale-105 z-10' : 'border-gray-100'"
            >
                <!-- Popular Badge -->
                <div v-if="plan.isPopular" class="absolute top-0 w-full h-8 bg-inventivy-blue text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center">
                    Beliebt
                </div>
                <!-- Color Bar for non-popular -->
                <div v-else class="absolute top-0 w-full h-2" :class="plan.price === 0 ? 'bg-gray-400' : 'bg-purple-500'"></div>

                <div class="p-8 flex-grow" :class="{ 'pt-12': plan.isPopular }">
                    <h3 class="text-xl font-semibold text-gray-900">{{ plan.name }}</h3>
                    <p class="mt-4 text-gray-500 text-sm min-h-[40px]">{{ plan.description }}</p>
                    
                    <div class="mt-6 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">{{ formatPrice(plan.price) }} €</span>
                        <span class="ml-1 text-xl font-medium text-gray-500">/ {{ plan.interval === 'DAILY' ? 'Tag' : (plan.interval === 'YEARLY' ? 'Jahr' : 'Monat') }}</span>
                    </div>
                    
                    <!-- Overage Pricing Display -->
                    <div v-if="plan.pricingTiers && plan.pricingTiers.length > 0" class="mt-2 text-xs text-gray-500">
                         <p class="font-medium mb-1">Zusätzliche Bestellungen:</p>
                         <ul class="space-y-0.5">
                             <li v-for="(tier, idx) in plan.pricingTiers" :key="idx">
                                 Ab {{ tier.from }}: {{ formatPrice(tier.price) }} €
                             </li>
                         </ul>
                    </div>
                    <div v-else-if="plan.pricePerExtraOrder > 0" class="mt-2 text-xs text-gray-500">
                        + {{ formatPrice(plan.pricePerExtraOrder) }} € pro weiterer Bestellung
                    </div>

                    <ul class="mt-6 space-y-4">
                        <li class="flex items-start">
                             <CheckIcon class="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                            <span class="text-gray-600"><strong>Inkl. {{ plan.includedOrders }} Bestellungen</strong></span>
                        </li>
                        <li v-for="(feature, fIdx) in plan.features" :key="fIdx" class="flex items-start">
                            <CheckIcon class="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                            <span class="text-gray-600">{{ feature }}</span>
                        </li>
                    </ul>
                </div>

                <div class="p-8 bg-gray-50 border-t border-gray-100 mt-auto">
                     <router-link 
                        to="/register" 
                        class="block w-full text-center px-6 py-3 border rounded-lg text-base font-medium transition-colors"
                        :class="plan.isPopular 
                            ? 'bg-inventivy-blue border-transparent text-white hover:bg-blue-700 shadow-lg shadow-blue-200' 
                            : 'border-gray-300 text-gray-700 hover:bg-white'"
                     >
                        {{ plan.price === 0 ? 'Kostenlos starten' : '14 Tage testen' }}
                    </router-link>
                </div>
            </div>

        </div>
        </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
             <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-12">Häufig gestellte Fragen</h2>
             <div class="space-y-4 max-w-3xl mx-auto">
                 <div v-for="(faq, index) in faqs" :key="index" class="border rounded-lg bg-white overflow-hidden shadow-sm">
                     <button @click="toggleFaq(index)" class="w-full flex justify-between items-center p-4 text-left focus:outline-none">
                         <span class="font-medium text-gray-900 text-lg">{{ faq.question }}</span>
                         <span class="transform transition-transform duration-200 text-inventivy-blue" :class="{'rotate-180': openFaq === index}">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                              </svg>
                         </span>
                     </button>
                      <div v-show="openFaq === index" class="p-4 pt-0 text-gray-600 bg-gray-50 border-t border-gray-100">
                         {{ faq.answer }}
                     </div>
                 </div>
             </div>
        </div>

    </div>
    <!-- Footer -->
    <PublicFooter />
    
    <BackToTop />
  </div>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
