<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const notifications: any = inject('notifications')

// Current step (1-5)
const currentStep = ref(1)
const loading = ref(false)

// Configuration state
const config = ref({
  // Data source
  useEtsy: false,
  useCsv: true,
  
  // Number ranges
  orderNumberFormat: 'BO-{YYYY}-{####}',
  orderNumberStart: 1,
  invoiceNumberFormat: 'RE-{YYYY}-{####}',
  invoiceNumberStart: 1,
  deliveryNoteFormat: 'LS-{YYYY}-{####}',
  deliveryNoteStart: 1,
  supplierOrderFormat: 'LB-{YYYY}-{####}',
  supplierOrderStart: 1,
  
  // SKU settings
  skuPrefix: '10',
  nextProductId: 1
})

// Etsy connection status (will be enabled later)
const etsyAvailable = ref(false)
const etsyConnected = ref(false)

// Preview examples
const orderExample = computed(() => {
  return config.value.orderNumberFormat
    .replace('{YYYY}', new Date().getFullYear().toString())
    .replace('{MM}', '01')
    .replace('{####}', String(config.value.orderNumberStart).padStart(4, '0'))
})

const invoiceExample = computed(() => {
  return config.value.invoiceNumberFormat
    .replace('{YYYY}', new Date().getFullYear().toString())
    .replace('{MM}', '01')
    .replace('{####}', String(config.value.invoiceNumberStart).padStart(4, '0'))
})

const deliveryExample = computed(() => {
  return config.value.deliveryNoteFormat
    .replace('{YYYY}', new Date().getFullYear().toString())
    .replace('{MM}', '01')
    .replace('{####}', String(config.value.deliveryNoteStart).padStart(4, '0'))
})

const skuExample = computed(() => {
  return config.value.skuPrefix + String(config.value.nextProductId).padStart(3, '0')
})

// Navigation
const nextStep = () => {
  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const skipEtsyConnection = () => {
  config.value.useEtsy = false
  config.value.useCsv = true
  nextStep()
}

// Complete setup
const completeSetup = async () => {
  try {
    loading.value = true
    
    await axios.post('/api/setup/complete', {
      orderNumberFormat: config.value.orderNumberFormat,
      orderNumberStart: config.value.orderNumberStart,
      invoiceNumberFormat: config.value.invoiceNumberFormat,
      invoiceNumberStart: config.value.invoiceNumberStart,
      deliveryNoteFormat: config.value.deliveryNoteFormat,
      deliveryNoteStart: config.value.deliveryNoteStart,
      supplierOrderFormat: config.value.supplierOrderFormat,
      supplierOrderStart: config.value.supplierOrderStart,
      skuPrefix: config.value.skuPrefix,
      nextProductId: config.value.nextProductId
    })
    
    notifications.value?.show('success', 'Setup abgeschlossen!', 'Willkommen bei Etsy ERP')
    router.push('/')
  } catch (err: any) {
    notifications.value?.show('error', 'Fehler', 'Setup konnte nicht abgeschlossen werden')
    console.error('Setup error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-3xl w-full">
      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div v-for="step in 5" :key="step" class="flex-1">
            <div class="flex items-center">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all"
                :class="currentStep >= step ? 'bg-inventivy-blue text-white' : 'bg-gray-200 text-gray-600'"
              >
                {{ step }}
              </div>
              <div v-if="step < 5" class="flex-1 h-1 mx-2" :class="currentStep > step ? 'bg-inventivy-blue' : 'bg-gray-200'"></div>
            </div>
          </div>
        </div>
        <div class="flex justify-between mt-2 text-xs text-gray-600">
          <span>Start</span>
          <span>Daten</span>
          <span>Nummern</span>
          <span>SKU</span>
          <span>Fertig</span>
        </div>
      </div>

      <!-- Content Card -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Step 1: Welcome -->
        <div v-if="currentStep === 1" class="p-8">
          <div class="text-center">
            <div class="mx-auto w-auto flex justify-center mb-8">
               <svg class="h-16 w-auto text-inventivy-blue" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Icon Part (Cube) -->
                    <path class="text-inventivy-blue fill-current" d="M40 10 L70 25 L70 60 L40 75 L10 60 L10 25 Z" opacity="0.9"/>
                    <path class="text-inventivy-dark-blue fill-current" d="M40 10 L70 25 L40 40 L10 25 Z" opacity="0.8"/>
                    <path class="text-white fill-current" d="M40 40 L70 25 L70 60 L40 75 Z" opacity="0.2"/> 
                    
                    <!-- Text: Inventivy -->
                    <text x="90" y="55" font-family="Inter, sans-serif" font-weight="700" font-size="48" class="text-gray-900 fill-current">Inventivy</text>
                    
                    <!-- Text: Etsy ERP -->
                    <text x="90" y="85" font-family="Inter, sans-serif" font-weight="400" font-size="20" class="text-gray-500 fill-current" letter-spacing="0.1em">ETSY ERP SYSTEM</text>
                </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Willkommen!</h1>
            <p class="text-lg text-gray-600 mb-8">Richten wir Ihr System in wenigen Schritten ein.</p>
            
            <div class="bg-indigo-50 rounded-lg p-6 mb-8 text-left">
              <h3 class="font-semibold text-gray-900 mb-4">Was wir jetzt konfigurieren:</h3>
              <ul class="space-y-3">
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-inventivy-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700"><strong>Datenquelle:</strong> Etsy-Integration oder CSV-Import</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-inventivy-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700"><strong>Nummernkreise:</strong> Bestellungen, Rechnungen, Lieferscheine</span>
                </li>
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-inventivy-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-700"><strong>SKU-Verwaltung:</strong> Automatische Produktnummern</span>
                </li>
              </ul>
            </div>

            <button 
              @click="nextStep"
              class="btn-primary inline-flex items-center"
            >
              Los geht's
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Step 2: Data Source -->
        <div v-if="currentStep === 2" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Datenquelle wählen</h2>
          <p class="text-gray-600 mb-6">Wie möchten Sie Ihre Bestellungen importieren?</p>

          <div class="space-y-4">
            <!-- Etsy OAuth (Disabled) -->
            <div class="border-2 rounded-lg p-6 relative" :class="etsyAvailable ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-60'">
              <div v-if="!etsyAvailable" class="absolute top-4 right-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  API-Zugang ausstehend
                </span>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4 flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">🔗 Etsy-Shop verbinden</h3>
                  <p class="text-sm text-gray-600 mb-4">Automatischer Import alle 15 Minuten. Keine manuelle Arbeit mehr!</p>
                  
                  <div class="space-y-2 mb-4">
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Automatischer Order-Sync
                    </div>
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Echtzeit-Daten
                    </div>
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Versandstatus-Synchronisation
                    </div>
                  </div>

                  <button 
                    :disabled="!etsyAvailable"
                    class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Mit Etsy verbinden
                  </button>
                </div>
              </div>
            </div>

            <!-- CSV Import (Active) -->
            <div class="border-2 border-inventivy-blue rounded-lg p-6 bg-white">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4 flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">📁 CSV-Import nutzen</h3>
                  <p class="text-sm text-gray-600 mb-4">Manueller Import von Etsy-CSV-Dateien über die Import-Seite.</p>
                  
                  <div class="space-y-2 mb-4">
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Funktioniert sofort
                    </div>
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Keine API-Konfiguration nötig
                    </div>
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Volle Kontrolle über Daten
                    </div>
                  </div>

                  <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p class="text-xs text-blue-800">
                      <strong>Empfohlen:</strong> Nutzen Sie CSV-Import bis Ihr Etsy API-Zugang genehmigt ist.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-between">
            <button 
              @click="prevStep"
              class="btn-secondary"
            >
              ← Zurück
            </button>
            <button 
              @click="skipEtsyConnection"
              class="btn-primary"
            >
              Weiter mit CSV-Import →
            </button>
          </div>
        </div>

        <!-- Step 3: Number Ranges -->
        <div v-if="currentStep === 3" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Nummernkreise konfigurieren</h2>
          <p class="text-gray-600 mb-6">Definieren Sie Ihre internen Nummernkreise für Dokumente.</p>

          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p class="text-sm text-blue-800">
              <strong>💡 Platzhalter:</strong> {YYYY} = Jahr • {MM} = Monat • {####} = Laufnummer
            </p>
          </div>

          <div class="space-y-6">
            <!-- Orders -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">📦 Bestellnummern</label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <input 
                    v-model="config.orderNumberFormat"
                    type="text" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="BO-{YYYY}-{####}"
                  >
                </div>
                <div>
                  <input 
                    v-model.number="config.orderNumberStart"
                    type="number" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="1"
                  >
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">Beispiel: <span class="font-mono font-semibold">{{ orderExample }}</span></p>
            </div>

            <!-- Invoices -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">📄 Rechnungsnummern</label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <input 
                    v-model="config.invoiceNumberFormat"
                    type="text" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="RE-{YYYY}-{####}"
                  >
                </div>
                <div>
                  <input 
                    v-model.number="config.invoiceNumberStart"
                    type="number" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="1"
                  >
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">Beispiel: <span class="font-mono font-semibold">{{ invoiceExample }}</span></p>
            </div>

            <!-- Delivery Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">📋 Lieferscheinnummern</label>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <input 
                    v-model="config.deliveryNoteFormat"
                    type="text" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="LS-{YYYY}-{####}"
                  >
                </div>
                <div>
                  <input 
                    v-model.number="config.deliveryNoteStart"
                    type="number" 
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="1"
                  >
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">Beispiel: <span class="font-mono font-semibold">{{ deliveryExample }}</span></p>
            </div>
          </div>

          <div class="mt-8 flex justify-between">
            <button 
              @click="prevStep"
              class="btn-secondary"
            >
              ← Zurück
            </button>
            <button 
              @click="nextStep"
              class="btn-primary"
            >
              Weiter →
            </button>
          </div>
        </div>

        <!-- Step 4: SKU Settings -->
        <div v-if="currentStep === 4" class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">SKU-Verwaltung</h2>
          <p class="text-gray-600 mb-6">Konfigurieren Sie die automatische Produktnummern-Generierung.</p>

          <div class="bg-white border-2 border-inventivy-blue/20 rounded-lg p-6">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">🔢 SKU-Präfix</label>
                <input 
                  v-model="config.skuPrefix"
                  type="text" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="10"
                >
                <p class="mt-1 text-xs text-gray-500">Ihre SKUs beginnen mit diesem Präfix</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">📊 Nächste Produkt-ID</label>
                <input 
                  v-model.number="config.nextProductId"
                  type="number" 
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="1"
                >
                <p class="mt-1 text-xs text-gray-500">Startnummer für neue Produkte</p>
              </div>

              <div class="bg-blue-50 rounded-lg p-4">
                <p class="text-sm text-gray-700 mb-2"><strong>Beispiel SKU:</strong></p>
                <p class="text-2xl font-mono font-bold text-inventivy-blue">{{ skuExample }}</p>
              </div>

              <div class="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 class="text-sm font-semibold text-green-900 mb-2">✓ Automatische Funktionen</h4>
                <ul class="space-y-1 text-sm text-green-800">
                  <li>• SKU-Duplikat-Prüfung beim Import</li>
                  <li>• Auto-Increment bei Kollisionen</li>
                  <li>• Fortlaufende Nummerierung</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="mt-8 flex justify-between">
            <button 
              @click="prevStep"
              class="btn-secondary"
            >
              ← Zurück
            </button>
            <button 
              @click="nextStep"
              class="btn-primary"
            >
              Weiter →
            </button>
          </div>
        </div>

        <!-- Step 5: Complete -->
        <div v-if="currentStep === 5" class="p-8">
          <div class="text-center">
            <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Setup abgeschlossen!</h2>
            <p class="text-lg text-gray-600 mb-8">Ihre Einstellungen werden gespeichert...</p>

            <div class="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
              <h3 class="font-semibold text-gray-900 mb-4">📋 Ihre Konfiguration:</h3>
              <dl class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <dt class="text-gray-600">Datenquelle:</dt>
                  <dd class="font-medium text-gray-900">CSV-Import</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">Bestellnummern:</dt>
                  <dd class="font-mono font-medium text-gray-900">{{ orderExample }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">Rechnungen:</dt>
                  <dd class="font-mono font-medium text-gray-900">{{ invoiceExample }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-600">SKU-Start:</dt>
                  <dd class="font-mono font-medium text-gray-900">{{ skuExample }}</dd>
                </div>
              </dl>
            </div>

            <button 
              @click="completeSetup"
              :disabled="loading"
              class="btn-primary inline-flex items-center disabled:bg-gray-400"
            >
              <span v-if="!loading">Zum Dashboard</span>
              <span v-else>Speichere...</span>
              <svg v-if="!loading" class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
