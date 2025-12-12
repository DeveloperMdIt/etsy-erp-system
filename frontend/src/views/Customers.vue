<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import axios from 'axios'

interface Customer {
  id: string
  customerNumber?: string
  firstName: string
  lastName: string
  email: string
  street: string
  addressAddition?: string
  postalCode: string
  city: string
  country: string
  _count?: {
    orders: number
  }
  orders?: any[]
  createdAt: string
}

// ... imports

const customers = ref<Customer[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCustomer = ref<Customer | null>(null)
const editingCustomer = ref<Customer | null>(null)
const viewMode = ref<'grid' | 'list'>('list')
const showOrders = ref(false)
const sortBy = ref('createdAt')
const sortOrder = ref('desc')

// Inject notification
const notifications: any = inject('notifications')

let searchTimeout: any

const fetchCustomers = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/customers', {
        params: {
            search: searchQuery.value,
            sortBy: sortBy.value,
            sortOrder: sortOrder.value
        }
    })
    customers.value = response.data
  } catch (err: any) {
    error.value = err.message
    notifications.value?.show('error', 'Fehler', 'Kunden konnten nicht geladen werden')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchCustomers()
  }, 300)
}

// Removed client-side filtering computed property as we now fetch from server
const filteredCustomers = computed(() => customers.value)

onMounted(() => {
  fetchCustomers()
})

// ...

// Helper Functions
const showDetails = (customer: Customer) => {
  selectedCustomer.value = customer
}

const closeDetails = () => {
  selectedCustomer.value = null
  editingCustomer.value = null
  showOrders.value = false
}

const startEdit = (customer: Customer) => {
  editingCustomer.value = JSON.parse(JSON.stringify(customer))
}

const cancelEdit = () => {
  editingCustomer.value = null
}

const saveCustomer = async () => {
  if (!editingCustomer.value) return
  try {
    await axios.patch(`/api/customers/${editingCustomer.value.id}`, editingCustomer.value)
    // Refresh list but keep modal open? No, close it.
    await fetchCustomers()
    closeDetails()
    notifications.value?.show('success', 'Gespeichert', 'Kundendaten aktualisiert')
  } catch (e: any) {
    notifications.value?.show('error', 'Fehler', e.message)
  }
}

const fetchCustomerOrders = async (customer: Customer) => {
    if (customer.orders && customer.orders.length > 0) return
    try {
        const res = await axios.get('/api/orders', { params: { customerId: customer.id } })
        customer.orders = res.data
    } catch(e) {
        console.error("Failed to load orders", e)
    }
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const toggleOrders = async () => {
  if (!showOrders.value && selectedCustomer.value) {
      await fetchCustomerOrders(selectedCustomer.value)
  }
  showOrders.value = !showOrders.value
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

const translateStatus = (status: string) => {
  const map: Record<string, string> = { 
    'OPEN': 'Offen', 
    'SHIPPED': 'Versendet', 
    'CANCELLED': 'Storniert', 
    'DELIVERED': 'Geliefert',
    'PAID': 'Bezahlt',
    'PENDING': 'Ausstehend'
  }
  return map[status] || status
}

// Order Detail Modal Logic
const selectedOrder = ref<any>(null)
const showOrderModal = ref(false)

const openOrderDetails = (order: any) => {
    selectedOrder.value = order
    showOrderModal.value = true
}

const closeOrderDetails = () => {
    selectedOrder.value = null
    showOrderModal.value = false
}
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sticky top-16 z-30 bg-gray-100 pb-4 pt-4 -mt-4">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Kunden</h1>
          <p class="mt-2 text-sm text-gray-700">Kundenverwaltung mit Bestellhistorie.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button @click="fetchCustomers" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
            Aktualisieren
          </button>
        </div>
      </div>

      <!-- Search and Controls -->
      <div class="mt-4 flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Suche nach Nr., Name, E-Mail..."
          class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
        />
        
        <div class="flex gap-2">
           <select v-model="sortBy" @change="fetchCustomers" class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
            <option value="createdAt">Datum</option>
            <option value="customerNumber">Kundennr.</option>
            <option value="lastName">Nachname</option>
          </select>

          <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; fetchCustomers()" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
            {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>

          <button
            @click="toggleViewMode"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg v-if="viewMode === 'grid'" class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {{ viewMode === 'grid' ? 'Liste' : 'Kacheln' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="mt-8 text-center">
      <p class="text-gray-500">Lade Kunden...</p>
    </div>

    <!-- ... Errors ... -->

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="customer in filteredCustomers" 
        :key="customer.id" 
        @click="showDetails(customer)"
        class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden cursor-pointer p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex justify-between items-start"> 
                <h3 class="text-lg font-semibold text-gray-900">
                {{ customer.firstName }} {{ customer.lastName }}
                </h3>
                <span v-if="customer.customerNumber" class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{{ customer.customerNumber }}</span>
            </div>
            
            <p class="text-sm text-gray-500 mt-1">{{ customer.email }}</p>
            <p class="text-sm text-gray-600 mt-2">
              {{ customer.street }}<br>
              {{ customer.postalCode }} {{ customer.city }}
            </p>
            <p class="text-xs text-indigo-600 mt-3">
              {{ customer._count?.orders || 0 }} Bestellung(en)
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-gray-50">
          <div @click="showDetails(customer)" class="px-4 py-4 sm:px-6 cursor-pointer flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-indigo-600 truncate">
                  {{ customer.firstName }} {{ customer.lastName }}
                </p>
                <p class="text-xs text-gray-500 ml-2">
                  {{ customer._count?.orders || 0 }} Bestellung(en)
                </p>
              </div>
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <p class="truncate">{{ customer.email }}</p>
                <span class="mx-2">•</span>
                <p>{{ customer.city }}</p>
              </div>
            </div>
            <div class="ml-4">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredCustomers.length === 0" class="mt-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Kunden gefunden</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? 'Versuche einen anderen Suchbegriff.' : 'Importiere Bestellungen um Kunden anzulegen.' }}
      </p>
    </div>

    <!-- Detail/Edit Modal -->
    <div v-if="selectedCustomer || editingCustomer" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50" @click="editingCustomer ? null : closeDetails()">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {{ editingCustomer ? 'Kunde bearbeiten' : 'Kundendetails' }}
              </h2>
            </div>
            <button @click="editingCustomer ? cancelEdit() : closeDetails()" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="px-6 py-4 space-y-4">
          <template v-if="editingCustomer">
            <!-- Edit Form -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Vorname</label>
                <input v-model="editingCustomer.firstName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Nachname</label>
                <input v-model="editingCustomer.lastName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">E-Mail</label>
                <input v-model="editingCustomer.email" type="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Straße</label>
                <input v-model="editingCustomer.street" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Adresszusatz</label>
                <input v-model="editingCustomer.addressAddition" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">PLZ</label>
                <input v-model="editingCustomer.postalCode" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Stadt</label>
                <input v-model="editingCustomer.city" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700">Land</label>
                <input v-model="editingCustomer.country" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
              </div>
            </div>
          </template>

          <template v-else-if="selectedCustomer">
            <!-- View Mode -->
            <div class="space-y-6">
              <!-- Grid Layout for Basic Info -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Name</p>
                    <p class="text-lg text-gray-900">{{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">E-Mail</p>
                    <p class="text-lg text-gray-900 break-all">{{ selectedCustomer.email }}</p>
                  </div>
                  <div class="sm:col-span-2">
                    <p class="text-sm font-medium text-gray-500">Adresse</p>
                    <div class="bg-gray-50 p-3 rounded text-gray-900 mt-1">
                      {{ selectedCustomer.street }}<br>
                      <span v-if="selectedCustomer.addressAddition">{{ selectedCustomer.addressAddition }}<br></span>
                      {{ selectedCustomer.postalCode }} {{ selectedCustomer.city }}<br>
                      {{ selectedCustomer.country }}
                    </div>
                  </div>
              </div>

              <!-- Orders Section -->
              <div>
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-medium text-gray-900">Bestellungen</h3>
                    <button 
                        @click="toggleOrders"
                        class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        {{ showOrders ? 'Verbergen' : 'Anzeigen' }} ({{ selectedCustomer.orders?.length || selectedCustomer._count?.orders || 0 }})
                    </button>
                </div>

                <!-- Orders Table -->
                <div v-if="showOrders" class="border rounded-md overflow-hidden">
                    <div v-if="selectedCustomer.orders && selectedCustomer.orders.length > 0" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nr.</th>
                                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betrag</th>
                                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktion</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="order in selectedCustomer.orders" :key="order.id" class="hover:bg-gray-50 transition-colors">
                                    <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{{ order.orderNumber }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.createdAt) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{{ formatPrice(order.totalPrice) }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                        :class="{
                                            'bg-yellow-100 text-yellow-800': order.status === 'OPEN' || order.status === 'pending',
                                            'bg-green-100 text-green-800': order.status === 'SHIPPED' || order.status === 'shipped',
                                            'bg-red-100 text-red-800': order.status === 'CANCELLED' || order.status === 'cancelled'
                                        }">
                                        {{ translateStatus(order.status) }}
                                        </span>
                                    </td>
                                    <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                        <button @click="openOrderDetails(order)" class="text-indigo-600 hover:text-indigo-900">Details</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="p-4 text-center text-sm text-gray-500">
                        Keine Bestellungen geladen oder vorhanden.
                    </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <template v-if="editingCustomer">
            <button @click="cancelEdit" class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
              Abbrechen
            </button>
            <button @click="saveCustomer" class="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
              Speichern
            </button>
          </template>
          <template v-else>
            <button @click="startEdit(selectedCustomer!)" class="flex-1 inline-flex justify-center rounded-md border border-indigo-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
              Bearbeiten
            </button>
            <button @click="closeDetails" class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
              Schließen
            </button>
          </template>
        </div>
      </div>
    </div>
    <!-- Order Detail Modal (Nested) -->
    <div v-if="showOrderModal && selectedOrder" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[60]" @click="closeOrderDetails">
        <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-xl font-bold text-gray-900">Bestellung {{ selectedOrder.orderNumber }}</h3>
                <button @click="closeOrderDetails" class="text-gray-400 hover:text-gray-500">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div class="px-6 py-4 space-y-6">
                <!-- Status & Tracking -->
                <div class="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <span class="text-sm text-gray-500">Status</span>
                        <div class="font-medium mt-1">{{ translateStatus(selectedOrder.status) }}</div>
                    </div>
                     <div>
                        <span class="text-sm text-gray-500">Datum</span>
                        <div class="font-medium mt-1">{{ formatDate(selectedOrder.createdAt) }}</div>
                    </div>
                     <div v-if="selectedOrder.trackingNumber">
                        <span class="text-sm text-gray-500">Tracking</span>
                        <div class="font-medium mt-1">{{ selectedOrder.trackingNumber }}</div>
                    </div>
                </div>

                <!-- Items -->
                <div>
                     <h4 class="text-lg font-medium text-gray-900 mb-2">Artikel</h4>
                     <table class="min-w-full divide-y divide-gray-200 border">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Artikel</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Menge</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Preis</th>
                                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Gesamt</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                             <tr v-for="item in selectedOrder.items" :key="item.id">
                                 <td class="px-4 py-3 text-sm text-gray-900">
                                     <div class="font-medium">{{ item.product.name }}</div>
                                     <div class="text-xs text-gray-500">{{ item.product.sku }}</div>
                                 </td>
                                 <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ item.quantity }}x</td>
                                 <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ formatPrice(item.price) }}</td>
                                 <td class="px-4 py-3 text-sm font-medium text-gray-900 text-right">{{ formatPrice(item.price * item.quantity) }}</td>
                             </tr>
                        </tbody>
                        <tfoot class="bg-gray-50">
                            <tr>
                                <td colspan="3" class="px-4 py-3 text-sm font-bold text-gray-900 text-right">Gesamtsumme</td>
                                <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">{{ formatPrice(selectedOrder.totalPrice) }}</td>
                            </tr>
                        </tfoot>
                     </table>
                </div>
            </div>
             <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button @click="closeOrderDetails" class="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm text-gray-700 hover:bg-gray-50">Schließen</button>
             </div>
        </div>
    </div>
  </div>
</template>
