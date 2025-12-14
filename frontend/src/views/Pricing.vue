<script setup lang="ts">
import Logo from '../components/Logo.vue'
</script>

<template>
  <div class="bg-white">
    <!-- Navigation -->
    <nav class="absolute w-full z-10 top-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center">
             <router-link to="/">
                <Logo logoClass="h-10" />
             </router-link>
          </div>
          <div class="hidden md:flex space-x-8">
            <router-link to="/#features" class="text-gray-600 hover:text-inventivy-blue font-medium">Funktionen</router-link>
            <router-link to="/pricing" class="text-inventivy-blue font-semibold">Preise</router-link>
            <router-link to="/#about" class="text-gray-600 hover:text-inventivy-blue font-medium">Über uns</router-link>
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
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
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
        <div class="mt-16 grid gap-8 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
            <!-- Free / Basic Tier -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
               <div class="absolute top-0 w-full h-2 bg-gray-400"></div>
                <div class="p-8 flex-grow">
                    <h3 class="text-xl font-semibold text-gray-900">Basis</h3>
                    <p class="mt-4 text-gray-500 text-sm">Ideal für den Start und kleine Shops.</p>
                    <div class="mt-6 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">0 €</span>
                        <span class="ml-1 text-xl font-medium text-gray-500">/Monat</span>
                    </div>
                    <ul class="mt-6 space-y-4">
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Bis zu 20 Bestellungen/Monat</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Alle Grundfunktionen</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Community Support</span>
                        </li>
                    </ul>
                </div>
                 <div class="p-8 bg-gray-50 border-t border-gray-100">
                    <router-link to="/register" class="block w-full text-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-white transition-colors">
                        Kostenlos starten
                    </router-link>
                </div>
            </div>

            <!-- Starter Tier -->
            <div class="bg-white rounded-2xl shadow-lg border-inventivy-blue border-2 flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 scale-105 z-10">
                <div class="absolute top-0 w-full h-8 bg-inventivy-blue text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center">
                    Beliebt
                </div>
                 <div class="p-8 pt-12 flex-grow">
                    <h3 class="text-xl font-semibold text-gray-900">Starter</h3>
                    <p class="mt-4 text-gray-500 text-sm">Für wachsende Shops mit mehr Volumen.</p>
                    <div class="mt-6 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">10 €</span> <!-- Example Price -->
                        <span class="ml-1 text-xl font-medium text-gray-500">/Monat</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">+ 0,07 € pro weiterer Bestellung</p>

                    <ul class="mt-6 space-y-4">
                        <li class="flex items-start">
                             <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600"><strong>Inkl. 100 Bestellungen</strong></span>
                        </li>
                         <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Alles aus Basis</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">E-Mail Support</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Automatisierung (5 Regeln)</span>
                        </li>
                    </ul>
                </div>
                <div class="p-8 bg-gray-50 border-t border-gray-100">
                     <router-link to="/register" class="block w-full text-center px-6 py-3 bg-inventivy-blue border border-transparent rounded-lg text-base font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                        14 Tage testen
                    </router-link>
                </div>
            </div>

            <!-- Pro Tier -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
               <div class="absolute top-0 w-full h-2 bg-purple-500"></div>
                <div class="p-8 flex-grow">
                    <h3 class="text-xl font-semibold text-gray-900">Pro</h3>
                    <p class="mt-4 text-gray-500 text-sm">Für professionelle Verkäufer.</p>
                    <div class="mt-6 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">29 €</span>
                        <span class="ml-1 text-xl font-medium text-gray-500">/Monat</span>
                    </div>
                     <p class="text-xs text-gray-400 mt-1">+ 0,05 € pro weiterer Bestellung</p>
                    <ul class="mt-6 space-y-4">
                         <li class="flex items-start">
                             <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600"><strong>Inkl. 500 Bestellungen</strong></span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Priorisierter Support</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Unbegrenzte Automatisierung</span>
                        </li>
                    </ul>
                </div>
                <div class="p-8 bg-gray-50 border-t border-gray-100">
                     <router-link to="/register" class="block w-full text-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-white transition-colors">
                        14 Tage testen
                    </router-link>
                </div>
            </div>

            <!-- Enterprise Tier -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
               <div class="absolute top-0 w-full h-2 bg-gray-900"></div>
                <div class="p-8 flex-grow">
                    <h3 class="text-xl font-semibold text-gray-900">Plus</h3>
                    <p class="mt-4 text-gray-500 text-sm">High Volume & Brands.</p>
                    <div class="mt-6 flex items-baseline">
                        <span class="text-4xl font-extrabold text-gray-900">49 €</span>
                        <span class="ml-1 text-xl font-medium text-gray-500">/Monat</span>
                    </div>
                     <p class="text-xs text-gray-400 mt-1">+ 0,04 € pro weiterer Bestellung</p>
                    <ul class="mt-6 space-y-4">
                        <li class="flex items-start">
                             <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600"><strong>Inkl. 1000 Bestellungen</strong></span>
                        </li>
                         <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Premium Support (Tel.)</span>
                        </li>
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span class="text-gray-600">Dediziertes Onboarding</span>
                        </li>
                    </ul>
                </div>
                <div class="p-8 bg-gray-50 border-t border-gray-100">
                     <router-link to="/register" class="block w-full text-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-white transition-colors">
                        14 Tage testen
                    </router-link>
                </div>
            </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-24">
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
    </div>

    <!-- Footer -->
    <PublicFooter />
    
    <BackToTop />
  </div>
</template>
