<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import ManualTrackingModal from '../components/ManualTrackingModal.vue'
import SuccessModal from '../components/SuccessModal.vue'
import ConfirmationModal from '../components/ConfirmationModal.vue'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
    sku: string
    imageUrl?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  etsyOrderNumber?: string
  platform?: string
  externalOrderId?: string
  customer: {
    firstName: string
    lastName: string
    email: string
    street: string
    addressAddition?: string
    postalCode: string
    city: string
    country: string
  }
  totalPrice: number
  status: string
  shippingProvider?: string
  trackingNumber?: string
  shippedAt?: string
  items: OrderItem[]
  shippingLabels: { id: string; trackingNumber: string; provider: string }[]
  createdAt: string
  notes?: string
}

// ... existing refs ...

const printingLabel = ref<string | null>(null)

const printLabel = async (labelId: string) => {
    if (!labelId) return
    printingLabel.value = labelId
    try {
        await axios.post('/api/shipping/print', { shippingLabelId: labelId })
        alert('Druckauftrag gesendet! 🖨️')
    } catch (error: any) {
        alert('Fehler beim Drucken: ' + (error.response?.data?.error || error.message))
    } finally {
        printingLabel.value = null
    }
}

const cancelLabel = (labelId: string) => {
    openConfirmModal(
        'Label stornieren?',
        'Möchten Sie dieses Label wirklich stornieren? Der Status der Bestellung wird auf "Offen" zurückgesetzt und die Tracking-Nummer entfernt.',
        async () => {
            try {
                await axios.post('/api/shipping/label/cancel', { shippingLabelId: labelId })
                openSuccessModal('Storniert', 'Das Label wurde storniert. Bestellung ist wieder offen.')
                await fetchOrders()
            } catch (error: any) {
                alert('Fehler beim Stornieren: ' + (error.response?.data?.error || error.message))
            }
        }
    )
}

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedOrder = ref<Order | null>(null)
const showLabelModal = ref(false)

// Success Modal State
const showSuccessModal = ref(false)
const successTitle = ref('')
const successMessage = ref('')
const successTracking = ref('')

const openSuccessModal = (title: string, message: string, tracking?: string) => {
    successTitle.value = title
    successMessage.value = message
    successTracking.value = tracking || ''
    showSuccessModal.value = true
}

// Confirmation Modal State
const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)

const openConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    confirmTitle.value = title
    confirmMessage.value = message
    confirmAction.value = onConfirm
    showConfirmModal.value = true
}

const handleConfirm = () => {
    if (confirmAction.value) confirmAction.value()
    showConfirmModal.value = false
}

const labelOrder = ref<Order | null>(null)
const creatingLabel = ref(false)
const showManualTrackingModal = ref(false)
const manualTrackingOrder = ref<Order | null>(null)

// Sync State
const isSyncing = ref(false)
const syncStatus = ref<any>(null)
let pollInterval: any = null

const startSync = async () => {
  if (isSyncing.value) return
  isSyncing.value = true
  syncStatus.value = { message: 'Starte Synchronisierung...', progress: 0, state: 'PROCESSING' }
  
  try {
    await axios.post('/api/etsy/sync-orders')
    
    // Start polling
    pollInterval = setInterval(async () => {
      try {
        const res = await axios.get('/api/import/status')
        syncStatus.value = res.data
        
        if (res.data.state === 'COMPLETED') {
           clearInterval(pollInterval)
           isSyncing.value = false
           await fetchOrders()
           // Optional: Auto-hide status after 3s
           setTimeout(() => syncStatus.value = null, 5000)
        } else if (res.data.state === 'ERROR') {
           clearInterval(pollInterval)
           isSyncing.value = false
           alert('Fehler bei Synchronisierung: ' + res.data.message)
        }
      } catch (e) { 
        console.error('Poll error', e) 
      }
    }, 1000)
    
  } catch (err: any) {
    isSyncing.value = false
    alert('Fehler beim Starten: ' + err.message)
  }
}

// ... (imports)

interface ShippingMethod {
    id: string
    name: string
    provider: 'DHL' | 'DEUTSCHE_POST'
    productCode: string
    isActive: boolean
}

const shippingMethods = ref<ShippingMethod[]>([])
const selectedShippingMethodId = ref<string>('')

const fetchShippingMethods = async () => {
    try {
        const res = await axios.get('/api/shipping-profiles')
        shippingMethods.value = res.data.filter((m: any) => m.isActive)
    } catch (e) {
        console.error('Error fetching shipping methods', e)
    }
}

// Search & Filter State
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// Label Form State
const labelForm = ref({
    weight: 500,
    productCode: 'V01PAK' 
})
const selectedProvider = ref('DHL') 

// Error Handling
const labelError = ref<string | null>(null)
const labelErrorDetails = ref<string | null>(null)

// Status Map
const statusMap: Record<string, string> = {
    'OPEN': 'Offen',
    'IN_PROGRESS': 'In Bearbeitung',
    'SHIPPED': 'Versendet',
    'CANCELLED': 'Storniert'
}

// Products (Legacy Fallback)
const dhlProducts = [
    { code: 'V01PAK', name: 'DHL Paket (V01PAK)' },
    { code: 'V53WPAK', name: 'DHL Warenpost (V53WPAK)' }
]
const dpProducts = [
    { code: '10', name: 'Standardbrief' },
    { code: '20', name: 'Kompaktbrief' },
    { code: '50', name: 'Maxibrief' }
]

const currentProducts = computed(() => {
    return selectedProvider.value === 'DHL' ? dhlProducts : dpProducts
})

const fetchOrders = async () => {
  loading.value = true
  error.value = null
  try {
    const params: any = {
      sort: sortBy.value,
      order: sortOrder.value
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const response = await axios.get('/api/orders', { params })
    orders.value = response.data

    // Refresh selectedOrder if open, to show new tracking/status immediately
    if (selectedOrder.value) {
        const updated = orders.value.find(o => o.id === selectedOrder.value?.id)
        if (updated) selectedOrder.value = updated
    }
  } catch (err: any) {
    console.error('Error fetching orders:', err)
    error.value = 'Fehler beim Laden der Bestellungen: ' + (err.response?.data?.error || err.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
    // Debounce could be added here
    fetchOrders()
}

const closeLabelModal = () => {
    showLabelModal.value = false
    labelOrder.value = null
    labelError.value = null
    labelErrorDetails.value = null
}

const openManualTracking = (order: Order) => {
    manualTrackingOrder.value = order
    showManualTrackingModal.value = true
}

const onManualTrackingSaved = () => {
    fetchOrders()
}

const openLabelModal = async (order: Order) => {
  labelOrder.value = order
  showLabelModal.value = true
  labelError.value = null
  labelErrorDetails.value = null
  
  // Load methods if empty
  if (shippingMethods.value.length === 0) {
      await fetchShippingMethods()
  }

  // Preselect first method if available
  if (shippingMethods.value.length > 0 && !selectedShippingMethodId.value) {
    const firstMethod = shippingMethods.value[0];
    if (firstMethod) {
      selectedShippingMethodId.value = firstMethod.id
    }
  }
}

// ... 

const handleCreateLabel = async () => {
  if (!labelOrder.value) return

  creatingLabel.value = true
  labelError.value = null
  
  try {
    const selectedMethod = shippingMethods.value.find(m => m.id === selectedShippingMethodId.value)
    
    // Prepare Base Payload
    const payload = {
        orderId: labelOrder.value.id,
        weight: labelForm.value.weight,
        shippingMethodId: selectedMethod?.id
    }

    let response;
    
    // Fallback logic if no method selected (legacy)
    if (!selectedMethod) {
         // Default to DHL Legacy
         if (selectedProvider.value === 'DHL') {
            response = await axios.post('/api/shipping/dhl/create-label', { ...payload, productType: labelForm.value.productCode })
         } else {
            response = await axios.post('/api/shipping/label/create', { ...payload, productCode: labelForm.value.productCode })
         }
    } else {
        // Use Method-based Logic
        // Determine Route based on Provider
        if (selectedMethod.provider === 'DHL') {
             response = await axios.post('/api/shipping/dhl/create-label', payload)
        } else {
             // For Deutsche Post, we might need mapping or update that endpoint too. 
             // Currently assuming standard fields or refactoring that service later.
             // For now, mapping method configs to the payload expected by DP service
             response = await axios.post('/api/shipping/label/create', {
                 ...payload,
                 productCode: selectedMethod.productCode 
             })
        }
    }

    // Success Handling
    const tracking = response.data.shipmentNumber || response.data.trackingNumber
    // alert(`Label erstellt! Tracking: ${tracking}`)
    openSuccessModal('Label erfolgreich erstellt!', 'Das Versandlabel wurde erstellt und die Tracking-Nummer gespeichert.', tracking)

    closeLabelModal()
    await fetchOrders()
  } catch (err: any) {
    // ... (error handling same as before)
    console.error('Label creation error:', err)
    
    // Improved Error Extraction (matching backend service logic)
    const errorResponse = err.response?.data
    let displayError = err.message || 'Ein unbekannter Fehler ist aufgetreten.'

    if (errorResponse) {
        if (typeof errorResponse === 'string') {
             displayError = errorResponse
        } else if (errorResponse.message) {
             displayError = errorResponse.message
        } else if (errorResponse.error) {
             displayError = errorResponse.error
        }
    }
    
    labelError.value = displayError
    
    const details = {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: {
        url: err.config?.url,
        data: err.config?.data ? JSON.parse(err.config?.data) : undefined
      }
    }
    labelErrorDetails.value = JSON.stringify(details, null, 2)
  } finally {
    creatingLabel.value = false
  }
}
// ...


const showDetails = (order: Order) => {
  selectedOrder.value = order
}

const closeDetails = () => {
  selectedOrder.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price)
}

const getTrackingUrl = (provider: string | undefined, tracking: string) => {
  if (!provider || !tracking) return '#'
  // Simple heuristic for DHL/Deutsche Post
  if (provider.toLowerCase().includes('dhl') || provider.toLowerCase().includes('deutsche post')) {
    return `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${tracking}`
  }
  // Fallback for others or google search
  return `https://www.google.com/search?q=${provider} tracking ${tracking}`
}

onMounted(fetchOrders)
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sticky top-0 z-30 bg-gray-50 pb-4 pt-4">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Bestellungen</h1>
          <p class="mt-2 text-sm text-gray-700">Übersicht aller Bestellungen aus Etsy.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          <button 
            @click="startSync" 
            :disabled="isSyncing"
            type="button" 
            class="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="mr-2">
              <svg v-if="isSyncing" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/> <!-- Replacement generic icon if Etsy SVG unavailable, using simple info or sync icon -->
                <path d="M16.24 7.76C15.07 6.59 13.54 6 12 6v6l-4.24-4.24c2.34-2.34 6.14-2.34 8.49 0C18.59 10.11 18.59 13.89 16.24 16.24L14.83 14.83c1.56-1.56 1.56-4.09 0-5.66L12 12V6c1.54 0 3.07.59 4.24 1.76z"/>
              </svg>
            </span>
             <!-- Using a generic sync icon path above for safety, or actually let's use a nice cloud download or refresh variant -->
             <svg v-if="!isSyncing" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
             </svg>
            {{ isSyncing ? 'Synchronisiere...' : 'Mit Etsy synchronisieren' }}
          </button>
          <button @click="fetchOrders" type="button" class="btn-secondary inline-flex items-center">
            <svg class="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Aktualisieren
          </button>
        </div>
      </div>
      
      <!-- Sync Progress Banner -->
      <div v-if="isSyncing && syncStatus" class="mt-4 rounded-md bg-blue-50 p-4">
        <!-- ... content same ... -->
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1 md:flex md:justify-between">
            <p class="text-sm text-blue-700">
               <span class="font-bold">Synchronisierung läuft:</span> {{ syncStatus.message || 'Verarbeite Daten...' }} 
               <span v-if="syncStatus.total > 0">({{ syncStatus.current }}/{{ syncStatus.total }})</span>
            </p>
            <div v-if="syncStatus.total > 0" class="mt-2 md:mt-0 md:ml-6 w-full md:w-48 bg-blue-200 rounded-full h-2.5 self-center">
              <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: syncStatus.progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="mt-4 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div class="flex-1">
          <div class="relative rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
              </svg>
            </div>
            <input 
                v-model="searchQuery" 
                @input="handleSearch"
                type="text" 
                placeholder="Suche nach Best.-Nr. oder Kunden..." 
                class="block w-full rounded-xl border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
          </div>
        </div>
        <div class="flex gap-4">
          <select v-model="statusFilter" @change="fetchOrders" class="rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2 bg-white">
            <option value="">Alle Status</option>
            <option value="OPEN">Offen</option>
            <option value="SHIPPED">Versendet</option>
            <option value="CANCELLED">Storniert</option>
          </select>
          
          <select v-model="sortBy" @change="fetchOrders" class="rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2 bg-white">
            <option value="createdAt">Datum</option>
            <option value="orderNumber">Bestellnummer</option>
            <option value="totalPrice">Betrag</option>
          </select>

          <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; fetchOrders()" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="mt-8 text-center">
      <p class="text-gray-500">Lade Bestellungen...</p>
    </div>

    <div v-else-if="error" class="mt-8 text-center">
      <p class="text-red-500">Fehler: {{ error }}</p>
    </div>

    <div v-else-if="orders.length === 0" class="mt-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Bestellungen gefunden</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? 'Versuche einen anderen Suchbegriff.' : 'Importiere Bestellungen um loszulegen.' }}
      </p>
    </div>

    <div v-else class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Auftragsnr.</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kunde</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Datum</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Betrag</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Versand</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50 cursor-pointer" @click="showDetails(order)">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div class="font-medium text-gray-900">{{ order.orderNumber }}</div>
                    <div v-if="order.etsyOrderNumber" class="text-gray-500 text-xs">Etsy: {{ order.etsyOrderNumber }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div class="text-gray-900 font-medium flex items-center gap-1">
                        {{ order.customer?.firstName }} {{ order.customer?.lastName }}
                        
                        <!-- Warning Icon for Missing Data -->
                        <div v-if="order.customer?.street?.includes('Unknown') || order.notes?.includes('Warnung: Keine Adressdaten')" class="group relative flex items-center">
                            <span class="text-amber-500 cursor-help text-lg">⚠️</span>
                            <!-- Tooltip -->
                            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded p-2 z-50">
                                Adresse fehlt (Etsy Datenschutz).<br>Bitte manuell prüfen oder CSV importieren.
                            </div>
                        </div>
                    </div>
                    <div class="text-gray-500 text-xs">{{ order.customer?.email }}</div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{{ formatPrice(order.totalPrice) }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm">
                    <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" :class="{
                      'bg-green-100 text-green-800': order.status === 'SHIPPED',
                      'bg-yellow-100 text-yellow-800': order.status === 'OPEN',
                      'bg-gray-100 text-gray-800': order.status === 'CANCELLED'
                    }">
                      {{ statusMap[order.status] || order.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div v-if="order.trackingNumber">
                      <div class="font-medium">{{ order.shippingProvider }}</div>
                      <div class="text-xs">{{ order.trackingNumber }}</div>
                      
                      <!-- Print Button if Label Exists -->
                      <div v-if="order.shippingLabels && order.shippingLabels.length > 0" class="mt-1 flex items-center gap-2">
                          <button 
                            @click.stop="printLabel(order.shippingLabels[0]?.id || '')" 
                            :disabled="printingLabel === order.shippingLabels[0]?.id"
                            class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded border border-gray-300 flex items-center"
                            title="Label erneut drucken"
                          >
                             <span v-if="printingLabel === order.shippingLabels[0]?.id" class="mr-1 animate-spin">⌛</span>
                              <span v-else class="mr-1">🖨️</span> Drucken
                          </button>
                          
                          <button 
                            @click.stop="cancelLabel(order.shippingLabels[0]?.id || '')"
                            class="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 flex items-center"
                            title="Label stornieren"
                          >
                             🗑️
                          </button>
                      </div>
                    </div>
                    <div v-else @click.stop>
                      <button 
                        v-if="order.status !== 'CANCELLED'"
                        @click="openLabelModal(order)" 
                        class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium"
                      >
                        📦 Label erstellen
                      </button>
                    </div>
                  </td>
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button @click.stop="showDetails(order)" class="text-indigo-600 hover:text-indigo-900">Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50" @click="closeDetails">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedOrder.orderNumber }}</h2>
              <p class="text-sm text-gray-500 mt-1">Erstellt am {{ formatDate(selectedOrder.createdAt) }}</p>
            </div>
            <button @click="closeDetails" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="px-6 py-4 space-y-6">
          <!-- Kundendaten -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Kundendaten</h3>
            <div class="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Name</p>
                <p class="text-sm text-gray-900">{{ selectedOrder.customer.firstName }} {{ selectedOrder.customer.lastName }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">E-Mail</p>
                <p class="text-sm text-gray-900">{{ selectedOrder.customer.email }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-sm font-medium text-gray-500">Lieferadresse</p>
                <p class="text-sm text-gray-900">
                  {{ selectedOrder.customer.street }}<span v-if="selectedOrder.customer.addressAddition">, {{ selectedOrder.customer.addressAddition }}</span><br>
                  {{ selectedOrder.customer.postalCode }} {{ selectedOrder.customer.city }}<br>
                  {{ selectedOrder.customer.country }}
                </p>
              </div>
            </div>
          </div>

          <!-- Artikel -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Bestellte Artikel</h3>
            <div class="bg-gray-50 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bild</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Artikel</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Menge</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Preis</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Gesamt</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td class="px-4 py-3 text-sm text-gray-900">
                      <img v-if="item.product.imageUrl" :src="item.product.imageUrl" alt="Product Image" class="h-10 w-10 object-cover rounded" />
                      <div v-else class="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.product.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ item.product.sku }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ item.quantity }}x</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ formatPrice(item.price) }}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">{{ formatPrice(item.price * item.quantity) }}</td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-100">
                  <tr>
                    <td colspan="4" class="px-4 py-3 text-sm font-medium text-gray-900 text-right">Gesamtsumme:</td>
                    <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">{{ formatPrice(selectedOrder.totalPrice) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Versand -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Versandinformationen</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <p class="text-sm text-gray-900">{{ statusMap[selectedOrder.status] || selectedOrder.status }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Sendungsnummer</p>
                  <div v-if="selectedOrder.trackingNumber" class="flex items-center gap-2">
                      <a :href="getTrackingUrl(selectedOrder.shippingProvider, selectedOrder.trackingNumber)" target="_blank" class="text-sm text-blue-600 hover:underline font-mono">
                          {{ selectedOrder.trackingNumber }}
                      </a>
                      <button @click="openManualTracking(selectedOrder)" class="text-xs text-gray-500 hover:text-gray-700 underline">
                          Bearbeiten
                      </button>
                  </div>
                  <div v-else>
                      <button @click="openManualTracking(selectedOrder)" class="text-sm text-blue-600 hover:underline">
                          + Hinzufügen
                      </button>
                  </div>
                </div>
                <div v-if="selectedOrder.shippingProvider">
                  <p class="text-sm font-medium text-gray-500">Versanddienstleister</p>
                  <p class="text-sm text-gray-900">{{ selectedOrder.shippingProvider }}</p>
                </div>
                <div v-if="selectedOrder.shippedAt">
                  <p class="text-sm font-medium text-gray-500">Versanddatum</p>
                  <p class="text-sm text-gray-900">{{ formatDate(selectedOrder.shippedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button @click="closeDetails" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
            Schließen
          </button>
        </div>
      </div>
    </div>

    <!-- Label Creation Modal -->
    <div v-if="showLabelModal && labelOrder" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50" @click="closeLabelModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Versandlabel erstellen</h2>
              <p class="text-sm text-gray-500 mt-1">{{ labelOrder.orderNumber }}</p>
            </div>
            <button @click="closeLabelModal" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="px-6 py-4 space-y-4">
          <!-- Empfänger -->
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs font-medium text-gray-500 mb-1">Empfänger:</p>
            <p class="text-sm font-medium">{{ labelOrder.customer.firstName }} {{ labelOrder.customer.lastName }}</p>
            <p class="text-xs text-gray-600">{{ labelOrder.customer.street }}</p>
            <p class="text-xs text-gray-600">{{ labelOrder.customer.postalCode }} {{ labelOrder.customer.city }}</p>
          </div>

          <!-- Shipping Method Selection (JTL Style) -->
          <div v-if="shippingMethods.length > 0" class="mb-4">
             <label class="block text-sm font-medium text-gray-700 mb-2">
               Versandart
             </label>
             <select
               v-model="selectedShippingMethodId"
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
               <option v-for="method in shippingMethods" :key="method.id" :value="method.id">
                 {{ method.name }} ({{ method.provider }})
               </option>
             </select>
          </div>

          <!-- Fallback: Legacy Selection if no methods defined -->
          <div v-else class="mb-4 border-l-4 border-yellow-400 pl-4 bg-yellow-50 p-2">
            <p class="text-xs text-yellow-700 mb-2">Keine Versandarten konfiguriert via Settings. Nutze Standard-Auswahl:</p>
            
            <label class="block text-sm font-medium text-gray-700 mb-2">Anbieter</label>
            <div class="flex space-x-4 mb-2">
               <label class="inline-flex items-center">
                 <input type="radio" v-model="selectedProvider" value="DEUTSCHE_POST" class="form-radio text-blue-600">
                 <span class="ml-2">Deutsche Post</span>
               </label>
               <label class="inline-flex items-center">
                 <input type="radio" v-model="selectedProvider" value="DHL" class="form-radio text-blue-600">
                 <span class="ml-2">DHL</span>
               </label>
            </div>
            
             <label class="block text-sm font-medium text-gray-700 mb-2">Produkt</label>
             <select
               v-model="labelForm.productCode"
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             >
               <option v-for="product in currentProducts" :key="product.code" :value="product.code">
                 {{ product.name }}
               </option>
             </select>
          </div>

          <!-- Gewicht -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Gewicht (g)
            </label>
            <input
              v-model.number="labelForm.weight"
              type="number"
              min="1"
              max="31500"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Error Message -->
          <div 
            v-if="labelError" 
            class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-xs text-red-800 font-medium">
                  Fehler: {{ labelError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-xs text-blue-800">
              ℹ️ Das Label wird automatisch gedruckt und die Tracking-Nummer wird gespeichert.
              <span v-if="labelOrder.platform === 'ETSY'">
                Die Tracking-Nummer wird automatisch an Etsy gesendet.
              </span>
            </p>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button
            @click="closeLabelModal"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            @click="handleCreateLabel"
            :disabled="creatingLabel"
            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ creatingLabel ? 'Erstelle...' : 'Label erstellen & drucken' }}
          </button>
        </div>
      </div>
    </div>
    <ManualTrackingModal 
      :show="showManualTrackingModal" 
      :order="manualTrackingOrder" 
      @close="showManualTrackingModal = false" 
      @saved="onManualTrackingSaved" 
    />
    <SuccessModal 
      :show="showSuccessModal"
      :title="successTitle"
      :message="successMessage"
      :tracking-number="successTracking"
      @close="showSuccessModal = false"
    />
    <ConfirmationModal
      :show="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      confirm-text="Stornieren"
      @close="showConfirmModal = false"
      @confirm="handleConfirm"
    />
  </div>
</template>
