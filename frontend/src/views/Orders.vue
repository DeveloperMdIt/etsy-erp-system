<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

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
  createdAt: string
}

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedOrder = ref<Order | null>(null)
const showLabelModal = ref(false)
const labelOrder = ref<Order | null>(null)
const creatingLabel = ref(false)

// Label creation form
const labelForm = ref({
  productCode: 'BRIEF_KOMPAKT',
  weight: 50
})

// Filters & Sorting
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')

const statusMap: Record<string, string> = {
  'OPEN': 'Offen',
  'SHIPPED': 'Versendet',
  'CANCELLED': 'Storniert'
}

const deutschePostProducts = [
  { code: 'BRIEF_KOMPAKT', name: 'Brief Kompakt', maxWeight: 50 },
  { code: 'BRIEF_GROSS', name: 'Brief Groß', maxWeight: 500 },
  { code: 'BRIEF_MAXI', name: 'Brief Maxi', maxWeight: 1000 },
  { code: 'WARENPOST', name: 'Warenpost', maxWeight: 1000 }
]

let searchTimeout: any

const fetchOrders = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/orders', {
      params: {
        search: searchQuery.value,
        status: statusFilter.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      }
    })
    orders.value = response.data
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchOrders()
  }, 300)
}

const createLabel = async (orderId: string, type: 'DHL_PAKET' | 'DHL_KLEINPAKET') => {
  try {
    await axios.post('/api/shipping/dhl/create-label', {
      orderId,
      productType: type
    })
    await fetchOrders()
  } catch (err: any) {
    alert('Fehler beim Label-Erstellen: ' + (err.response?.data?.message || err.message))
  }
}

const openLabelModal = (order: Order) => {
  labelOrder.value = order
  showLabelModal.value = true
  labelForm.value = {
    productCode: 'BRIEF_KOMPAKT',
    weight: 50
  }
}

const closeLabelModal = () => {
  showLabelModal.value = false
  labelOrder.value = null
}

const createDeutschePostLabel = async () => {
  if (!labelOrder.value) return

  creatingLabel.value = true
  try {
    const response = await axios.post('/api/shipping/label/create', {
      orderId: labelOrder.value.id,
      productCode: labelForm.value.productCode,
      weight: labelForm.value.weight
    })

    alert(`Label erstellt! Tracking: ${response.data.trackingNumber}`)
    closeLabelModal()
    await fetchOrders()
  } catch (err: any) {
    alert('Fehler beim Label-Erstellen: ' + (err.response?.data?.error || err.message))
  } finally {
    creatingLabel.value = false
  }
}

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

onMounted(fetchOrders)
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Bestellungen</h1>
        <p class="mt-2 text-sm text-gray-700">Übersicht aller Bestellungen aus Etsy.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="fetchOrders" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
          Aktualisieren
        </button>
      </div>
    </div>

    <!-- Filters Toolbar -->
    <div class="mt-4 flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
      <div class="flex-1">
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Suche nach Best.-Nr. oder Kunden..." 
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
        >
      </div>
      <div class="flex gap-4">
        <select v-model="statusFilter" @change="fetchOrders" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
          <option value="">Alle Status</option>
          <option value="OPEN">Offen</option>
          <option value="SHIPPED">Versendet</option>
          <option value="CANCELLED">Storniert</option>
        </select>
        
        <select v-model="sortBy" @change="fetchOrders" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
          <option value="createdAt">Datum</option>
          <option value="orderNumber">Bestellnummer</option>
          <option value="totalPrice">Betrag</option>
        </select>

        <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; fetchOrders()" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
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
                    <div>{{ order.customer.firstName }} {{ order.customer.lastName }}</div>
                    <div class="text-xs text-gray-400">{{ order.customer.city }}</div>
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
                    </div>
                    <div v-else @click.stop>
                      <button 
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
                <div v-if="selectedOrder.trackingNumber">
                  <p class="text-sm font-medium text-gray-500">Sendungsnummer</p>
                  <p class="text-sm text-gray-900 font-mono">{{ selectedOrder.trackingNumber }}</p>
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

          <!-- Versandart -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Versandart
            </label>
            <select
              v-model="labelForm.productCode"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="product in deutschePostProducts" :key="product.code" :value="product.code">
                {{ product.name }} (max. {{ product.maxWeight }}g)
              </option>
            </select>
          </div>

          <!-- Gewicht -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Gewicht (g)
            </label>
            <input
              v-model.number="labelForm.weight"
              type="number"
              min="1"
              max="1000"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            @click="createDeutschePostLabel"
            :disabled="creatingLabel"
            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {{ creatingLabel ? 'Erstelle...' : 'Label erstellen & drucken' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
