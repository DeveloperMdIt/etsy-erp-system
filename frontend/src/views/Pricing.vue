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
                <p class="text-gray-600 mt-2">Die faire Abrechnung pro Bestellung. Ohne Grundgebühr, ohne Risiko.</p>
            </div>

            <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div class="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">Pay-per-Order</h3>
                        <p class="text-sm text-gray-500">Dein Sicherheitsnetz für den Start</p>
                    </div>
                    <div class="text-right">
                        <span class="text-3xl font-bold text-gray-900">0 €</span>
                        <span class="text-gray-500 block text-sm">Grundgebühr / Monat</span>
                    </div>
                </div>
                <div class="p-0">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th class="px-8 py-4">Bestellungen / Monat</th>
                                <th class="px-8 py-4 text-right">Preis je Bestellung</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-sm">
                            <tr class="hover:bg-green-50/30 transition-colors">
                                <td class="px-8 py-5 font-medium text-gray-900 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                    0 – 20 Bestellungen
                                </td>
                                <td class="px-8 py-5 text-right font-bold text-green-600">KOSTENLOS</td>
                            </tr>
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-8 py-5 font-medium text-gray-900">21 – 100 Bestellungen</td>
                                <td class="px-8 py-5 text-right font-medium">0,25 €</td>
                            </tr>
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-8 py-5 font-medium text-gray-900">101 – 300 Bestellungen</td>
                                <td class="px-8 py-5 text-right font-medium">0,20 €</td>
                            </tr>
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-8 py-5 font-medium text-gray-900">301 – 1.000 Bestellungen</td>
                                <td class="px-8 py-5 text-right font-medium">0,15 €</td>
                            </tr>
                             <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-8 py-5 font-medium text-gray-900">> 1.000 Bestellungen</td>
                                <td class="px-8 py-5 text-right font-medium text-inventivy-blue">Individuell anfragen</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="p-6 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
                    Jederzeit kündbar. Keine Mindestlaufzeit. Ideal für saisonales Geschäft.
                </div>
            </div>
        </div>

        <!-- Packages -->
        <div>
            <div class="text-center mb-12">
                 <span class="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mb-4">Optional & Flexibel</span>
                <h2 class="text-3xl font-bold text-gray-900">Spar-Pakete</h2>
                <p class="text-gray-600 mt-2">Für wachsende Shops. Buche ein Paket, um deine Kosten zu deckeln.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <!-- Starter -->
                <div class="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 relative overflow-hidden transition-transform hover:-translate-y-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                    <p class="text-gray-500 text-sm mb-6">Für aktive Etsy-Seller</p>
                    <div class="flex items-baseline mb-6">
                        <span class="text-4xl font-extrabold text-gray-900">9,90 €</span>
                        <span class="text-gray-500 ml-2">/ Monat</span>
                    </div>
                    <ul class="space-y-4 mb-8 text-sm">
                        <li class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>Inklusive <strong>200 Bestellungen</strong></span>
                        </li>
                        <li class="flex items-start">
                            <svg class="w-5 h-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                            <span class="text-gray-600">Ø nur 0,05 € / Bestellung</span>
                        </li>
                         <li class="flex items-start">
                             <svg class="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>Etsy & eigener Shop</span>
                        </li>
                    </ul>
                    <router-link to="/register" class="block w-full text-center py-3 px-4 bg-inventivy-blue hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        Wählen
                    </router-link>
                </div>

                <!-- Pro -->
                <div class="bg-white rounded-2xl border-2 border-inventivy-blue shadow-xl p-8 relative overflow-hidden transform scale-105 z-10">
                     <div class="absolute top-0 right-0 bg-inventivy-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BELIEBT</div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                    <p class="text-gray-500 text-sm mb-6">Für wachsende Shops</p>
                    <div class="flex items-baseline mb-6">
                        <span class="text-4xl font-extrabold text-gray-900">19,90 €</span>
                        <span class="text-gray-500 ml-2">/ Monat</span>
                    </div>
                    <ul class="space-y-4 mb-8 text-sm">
                        <li class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>Inklusive <strong>1.000 Bestellungen</strong></span>
                        </li>
                         <li class="flex items-start">
                            <svg class="w-5 h-5 text-blue-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                            <span class="text-gray-600">Ø nur 0,02 € / Bestellung</span>
                        </li>
                        <li class="flex items-start">
                             <svg class="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>Priorisierter Support</span>
                        </li>
                    </ul>
                    <router-link to="/register" class="block w-full text-center py-3 px-4 bg-inventivy-blue hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-200">
                        Jetzt starten
                    </router-link>
                </div>

                <!-- Plus -->
                <div class="bg-gray-50 rounded-2xl border border-gray-200 p-8 relative overflow-hidden transition-transform hover:-translate-y-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Plus</h3>
                    <p class="text-gray-500 text-sm mb-6">Power-Seller & Agenturen</p>
                    <div class="flex items-baseline mb-6">
                        <span class="text-4xl font-extrabold text-gray-900">39,90 €</span>
                        <span class="text-gray-500 ml-2">/ Monat</span>
                    </div>
                    <ul class="space-y-4 mb-8 text-sm">
                        <li class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>Hohe Limits (auf Anfrage)</span>
                        </li>
                         <li class="flex items-start">
                            <svg class="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>3 Etsy-Shops inklusive</span>
                        </li>
                        <li class="flex items-start">
                             <svg class="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>2 Benutzer-Logins</span>
                        </li>
                    </ul>
                    <router-link to="/register" class="block w-full text-center py-3 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                        Kontaktieren
                    </router-link>
                </div>
            </div>
        </div>

        <div class="mt-20 text-center max-w-2xl mx-auto">
            <h3 class="text-xl font-bold mb-4">Häufige Fragen</h3>
            <div class="text-left space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="font-bold">Muss ich mich sofort für ein Paket entscheiden?</p>
                    <p class="text-gray-600 text-sm mt-1">Nein! Du startest immer im Basis-Tarif. Wenn du merkst, dass du mit einem Paket günstiger fährst, kannst du jederzeit mit einem Klick wechseln.</p>
                </div>
                 <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="font-bold">Gibt es eine Mindestlaufzeit?</p>
                    <p class="text-gray-600 text-sm mt-1">Nein. Alle Pakete sind monatlich kündbar. Wir wollen dich durch Leistung binden, nicht durch Verträge.</p>
                </div>
            </div>
        </div>

    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 mt-20">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-base text-gray-400">
          &copy; 2025 Inventivy. Alle Rechte vorbehalten.
          <span class="mx-2">|</span>
          <router-link to="/privacy" class="hover:text-white transition-colors">Datenschutz</router-link>
        </p>
      </div>
    </footer>
  </div>
</template>
