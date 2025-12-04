<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Order {
  id: string
  orderNumber: string
  customer: {
    firstName: string
    lastName: string
  }
  totalPrice: number
  status: string
  shippingProvider?: string
  trackingNumber?: string
}

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchOrders = async () => {
  try {
    const response = await axios.get('/api/orders')
    orders.value = response.data
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const createLabel = async (orderId: string, type: 'DHL_PAKET' | 'DHL_KLEINPAKET') => {
  try {
    await axios.post('/api/shipping/dhl/create-label', {
      orderId,
      productType: type
    })
    await fetchOrders() // Refresh
  } catch (err: any) {
    alert('Fehler beim Label-Erstellen: ' + (err.response?.data?.message || err.message))
  }
}

onMounted(fetchOrders)
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-xl font-semibold text-gray-900">Bestellungen</h1>
        <p class="mt-2 text-sm text-gray-700">Eine Liste aller Bestellungen aus Etsy.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button @click="fetchOrders" type="button" class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
          Aktualisieren
        </button>
      </div>
    </div>
    <div class="mt-8 flex flex-col">
      <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Bestell-Nr.</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kunde</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Betrag</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Versand</th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="order in orders" :key="order.id">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ order.orderNumber }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ order.customer.firstName }} {{ order.customer.lastName }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ order.totalPrice }} €</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" :class="{
                      'bg-green-100 text-green-800': order.status === 'SHIPPED',
                      'bg-yellow-100 text-yellow-800': order.status === 'OPEN'
                    }">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div v-if="order.trackingNumber">
                      {{ order.shippingProvider }}<br>
                      <span class="text-xs">{{ order.trackingNumber }}</span>
                    </div>
                    <div v-else class="space-x-2">
                      <button @click="createLabel(order.id, 'DHL_KLEINPAKET')" class="text-indigo-600 hover:text-indigo-900 text-xs">Kleinpaket</button>
                      <button @click="createLabel(order.id, 'DHL_PAKET')" class="text-indigo-600 hover:text-indigo-900 text-xs">Paket</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
