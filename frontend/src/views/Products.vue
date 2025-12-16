<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import axios from 'axios'
import ProductForm from '../components/ProductForm.vue'

interface Product {
  id: string
  sku: string
  name: string
  description?: string
  price: number
  weight: number
  imageUrl?: string
  stockQuantity: number
  tags?: string
  materials?: string
  variationType1?: string
  variationName1?: string
  variationValue1?: string
  variationType2?: string
  variationName2?: string
  variationValue2?: string
  createdAt: string
  isActive: boolean
  gtin?: string
  type?: string
  variations?: any[]
  components?: any[]
}

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedProduct = ref<Product | null>(null)
const editingProduct = ref<any | null>(null)
const showProductForm = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const sortOrder = ref<'asc' | 'desc'>('asc')
const filterStatus = ref<'active' | 'inactive' | 'all'>('active')
const saving = ref(false)
const syncing = ref(false)

const handleSync = async () => {
  try {
    syncing.value = true
    if (notifications && notifications.show) notifications.show('info', 'Sync Gestartet', 'Lade Produktdaten von Etsy...')
    
    // Trigger Background Sync
    await axios.post('/api/etsy/sync-products')
    
    // Wait a moment for backend to process some items (simple UX hack)
    // Ideally we would poll status, but for now 2s delay + refresh is better than nothing
    setTimeout(async () => {
      await fetchProducts()
      syncing.value = false
      if (notifications && notifications.show) notifications.show('success', 'Fertig', 'Produktliste aktualisiert')
    }, 2500)

  } catch (err: any) {
    syncing.value = false
    console.error('Sync ERROR:', err)
    if (notifications && notifications.show) notifications.show('error', 'Fehler', 'Synchronisation fehlgeschlagen')
  }
}

// Inject notification and confirm dialog
const notifications: any = inject('notifications')
const confirmDialog: any = inject('confirmDialog')


const fetchProducts = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/products', {
      params: {
        status: filterStatus.value
      }
    })
    products.value = response.data
  } catch (err: any) {
    error.value = err.message
    if (notifications && notifications.show) {
        notifications.show('error', 'Fehler', 'Produkte konnten nicht geladen werden')
    }
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingProduct.value = null
  showProductForm.value = true
}

const openEditModalNew = async (product: Product) => {
  try {
    const res = await axios.get(`/api/products/${product.id}`)
    editingProduct.value = res.data
    showProductForm.value = true
  } catch (err: any) {
    if (notifications && notifications.show) notifications.show('error', 'Fehler', 'Produkt konnte nicht geladen werden')
  }
}

const handleProductSave = async (productData: any) => {
  try {
    saving.value = true
    const tenantId = 'default-tenant'
    
    if (editingProduct.value?.id) {
      // Update
      await axios.put(`/api/products/${editingProduct.value.id}`, productData)
      if (notifications && notifications.show) notifications.show('success', 'Erfolgreich', 'Produkt wurde aktualisiert')
    } else {
      // Create
      await axios.post('/api/products', { ...productData, tenantId })
      if (notifications && notifications.show) notifications.show('success', 'Erfolgreich', 'Produkt wurde erstellt')
    }
    
    showProductForm.value = false
    editingProduct.value = null
    await fetchProducts()
  } catch (err: any) {
    if (notifications && notifications.show) notifications.show('error', 'Fehler', err.response?.data?.error || 'Speichern fehlgeschlagen')
  } finally {
    saving.value = false
  }
}

const handleProductCancel = () => {
  showProductForm.value = false
  editingProduct.value = null
}

const deleteProduct = async (productId: string) => {
  const product = products.value.find(p => p.id === productId)
  if (!product) return

  const isHardDelete = !product.isActive
  
  const confirmed = await confirmDialog.value?.show({
    title: isHardDelete ? 'Produkt endgültig löschen?' : 'Produkt deaktivieren?',
    message: isHardDelete 
      ? 'Möchtest du dieses Produkt wirklich endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
      : 'Möchtest du dieses Produkt deaktivieren? Es wird in den "Inaktiv"-Status verschoben.',
    confirmText: isHardDelete ? 'Endgültig löschen' : 'Deaktivieren',
    cancelText: 'Abbrechen',
    type: 'danger'
  })

  if (!confirmed) return

  try {
    const url = isHardDelete ? `/api/products/${productId}?force=true` : `/api/products/${productId}`
    await axios.delete(url)
    if (notifications && notifications.show) notifications.show('success', 'Erfolgreich', isHardDelete ? 'Produkt wurde endgültig gelöscht' : 'Produkt wurde deaktiviert')
    await fetchProducts()
    if (selectedProduct.value?.id === productId) {
      selectedProduct.value = null
    }
  } catch (err: any) {
    if (notifications && notifications.show) notifications.show('error', 'Fehler', err.response?.data?.message || 'Produkt konnte nicht gelöscht werden')
  }
}

const saveProduct = async () => {
  if (!editingProduct.value) return

  try {
    saving.value = true
    
    // Convert German formats back to numbers
    const payload = JSON.parse(JSON.stringify(editingProduct.value))
    
    // Fix main price
    if (typeof payload.price === 'string') {
      payload.price = parseFloat(payload.price.replace(',', '.'))
    }
    
    // Fix variation prices
    if (payload.variations) {
      payload.variations.forEach((v: any) => {
        if (typeof v.price === 'string') {
          v.price = parseFloat(v.price.replace(',', '.'))
        }
        if (typeof v.stockQuantity === 'string') {
           v.stockQuantity = parseInt(v.stockQuantity)
        }
      })
    }

    await axios.patch(`/api/products/${editingProduct.value.id}`, payload)
    if (notifications && notifications.show) notifications.show('success', 'Erfolgreich', 'Produkt wurde aktualisiert')
    editingProduct.value = null
    await fetchProducts()
  } catch (err: any) {
    console.error(err)
    if (notifications && notifications.show) notifications.show('error', 'Fehler', err.response?.data?.error || 'Produkt konnte nicht gespeichert werden')
  } finally {
    saving.value = false
  }
}

const toggleProductStatus = async (product: Product) => {
  try {
    await axios.patch(`/api/products/${product.id}`, {
      isActive: !product.isActive
    })
    if (notifications && notifications.show) notifications.show('success', 'Erfolgreich', `Produkt ist jetzt ${!product.isActive ? 'aktiv' : 'inaktiv'}`)
    await fetchProducts()
  } catch (err: any) {
    if (notifications && notifications.show) notifications.show('error', 'Fehler', 'Status konnte nicht geändert werden')
  }
}

const openEditModal = (product: Product) => {
  const copy = JSON.parse(JSON.stringify(product))
  
  // Convert numbers to German string format for editing
  copy.price = copy.price.toString().replace('.', ',')
  
  if (copy.variations) {
    copy.variations.forEach((v: any) => {
      v.price = v.price.toString().replace('.', ',')
    })
  }
  
  editingProduct.value = copy
}

const filteredAndSortedProducts = computed(() => {
  let result = products.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(product => 
      product.sku.toLowerCase().includes(query) ||
      product.name.toLowerCase().includes(query)
    )
  }

  result = [...result].sort((a, b) => {
    const skuA = parseInt(a.sku) || 0
    const skuB = parseInt(b.sku) || 0
    return sortOrder.value === 'asc' ? skuA - skuB : skuB - skuA
  })

  return result
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const showDetails = (product: Product) => {
  selectedProduct.value = product
}

const closeDetails = () => {
  selectedProduct.value = null
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const parent = img.parentElement
  if (parent) {
    img.style.display = 'none'
    const placeholder = parent.querySelector('svg')
    if (placeholder) {
      placeholder.classList.remove('hidden')
    }
  }
}

onMounted(fetchProducts)
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sticky top-0 z-30 bg-gray-50 pb-4 pt-4">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Produkte</h1>
          <p class="mt-2 text-sm text-gray-700">Produktkatalog mit allen Details aus Etsy.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 flex gap-3">
          <button @click="openCreateModal" type="button" class="btn-primary inline-flex items-center">
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Neues Produkt
          </button>
          <button 
            @click="handleSync" 
            :disabled="loading || syncing"
            type="button" 
            class="btn-secondary inline-flex items-center"
          >
             <svg 
               class="h-5 w-5 mr-2 text-gray-500" 
               :class="{ 'animate-spin': syncing }" 
               fill="none" 
               stroke="currentColor" 
               viewBox="0 0 24 24"
             >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ syncing ? 'Etsy Sync...' : 'Aktualisieren' }}
          </button>
        </div>
      </div>

      <!-- Search and Controls -->
      <div class="mt-4 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div class="flex-1 relative rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Suche nach SKU oder Titel..."
              class="block w-full rounded-xl border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
            />
        </div>

        <select
          v-model="filterStatus"
          @change="fetchProducts"
          class="rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white"
        >
          <option value="all">Alle anzeigen</option>
          <option value="active">Nur Aktive</option>
          <option value="inactive">Nur Inaktive</option>
        </select>
        
        <div class="flex gap-2">
          <button
            @click="toggleViewMode"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg v-if="viewMode === 'grid'" class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {{ viewMode === 'grid' ? 'Liste' : 'Kacheln' }}
          </button>

          <button
            @click="toggleSortOrder"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="sortOrder === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            SKU {{ sortOrder === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="mt-8 text-center">
      <p class="text-gray-500">Lade Produkte...</p>
    </div>

    <div v-else-if="error" class="mt-8 text-center">
      <p class="text-red-500">Fehler: {{ error }}</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div 
        v-for="product in filteredAndSortedProducts" 
        :key="product.id" 
        class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden flex flex-col h-full"
      >
        <div @click="showDetails(product)" class="cursor-pointer flex-grow">
          <div class="w-full h-48 bg-gray-100 flex items-center justify-center relative">
            <img 
              v-if="product.imageUrl" 
              :src="product.imageUrl" 
              :alt="product.name" 
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <svg class="h-16 w-16 text-gray-300" :class="{ 'hidden': product.imageUrl }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{{ product.sku }}</span>
              <span class="text-xs font-medium" :class="{
                'text-green-600': product.stockQuantity > 10,
                'text-yellow-600': product.stockQuantity > 0 && product.stockQuantity <= 10,
                'text-red-600': product.stockQuantity === 0
              }">
                {{ product.stockQuantity }} Stk.
              </span>
            </div>

            <h3 class="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
              {{ product.name }}
            </h3>

            <div class="flex justify-between items-center">
              <span class="text-lg font-bold text-gray-900">{{ formatPrice(product.price) }}</span>
            </div>
          </div>
        </div>
        
        <div class="px-4 pb-4 flex gap-2">
          <button
            @click.stop="openEditModalNew(product)"
            class="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Bearbeiten
          </button>
          
          <button
            @click.stop="toggleProductStatus(product)"
            class="inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="product.isActive ? 'text-green-700 focus:ring-green-500' : 'text-gray-500 focus:ring-gray-500'"
            :title="product.isActive ? 'Deaktivieren' : 'Aktivieren'"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="product.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path v-if="product.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>

          <button
            @click.stop="deleteProduct(product.id)"
            class="inline-flex justify-center items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title="Löschen"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="product in filteredAndSortedProducts" :key="product.id" class="hover:bg-gray-50">
          <div @click="showDetails(product)" class="px-4 py-4 sm:px-6 cursor-pointer flex items-center gap-4">
            <div class="flex-shrink-0 h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
              <img 
                v-if="product.imageUrl" 
                :src="product.imageUrl" 
                :alt="product.name" 
                class="h-16 w-16 object-cover rounded"
                @error="handleImageError"
              />
              <svg v-else class="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
                  <p class="text-xs text-gray-500 mt-1">SKU: {{ product.sku }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm font-medium" :class="{
                    'text-green-600': product.stockQuantity > 10,
                    'text-yellow-600': product.stockQuantity > 0 && product.stockQuantity <= 10,
                    'text-red-600': product.stockQuantity === 0
                  }">
                    {{ product.stockQuantity }} Stk.
                  </span>
                  <span class="text-lg font-bold text-gray-900">{{ formatPrice(product.price) }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click.stop="openEditModalNew(product)"
                class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Bearbeiten"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                @click.stop="toggleProductStatus(product)"
                class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="product.isActive ? 'text-green-700 focus:ring-green-500' : 'text-gray-500 focus:ring-gray-500'"
                :title="product.isActive ? 'Deaktivieren' : 'Aktivieren'"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="product.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path v-if="product.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>

              <button
                @click.stop="deleteProduct(product.id)"
                class="flex-shrink-0 inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                title="Löschen"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredAndSortedProducts.length === 0" class="mt-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Keine Produkte gefunden</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? 'Versuche einen anderen Suchbegriff.' : 'Importiere eine Produktkatalog-CSV um zu beginnen.' }}
      </p>
    </div>

    <!-- Product Form Modal (Create/Edit) -->
    <div v-if="showProductForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900">{{ editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt erstellen' }}</h2>
          <button @click="handleProductCancel" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <ProductForm 
            :initial-data="editingProduct" 
            :is-editing="!!editingProduct"
            @save="handleProductSave"
            @cancel="handleProductCancel"
          />
        </div>
      </div>
    </div>

    <!-- Old Edit Modal (Legacy - can be removed) -->
    <div v-if="false && editingProduct" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900">Produkt bearbeiten</h2>
          <button @click="editingProduct = null" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">SKU</label>
              <input v-model="editingProduct.sku" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">GTIN / EAN</label>
              <input v-model="editingProduct.gtin" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="editingProduct.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Beschreibung</label>
            <textarea v-model="editingProduct.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"></textarea>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Preis (€)</label>
              <input v-model="editingProduct.price" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Bestand</label>
              <input v-model.number="editingProduct.stockQuantity" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Gewicht (g)</label>
              <input v-model.number="editingProduct.weight" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Bild URL</label>
            <input v-model="editingProduct.imageUrl" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2">
          </div>

          <!-- Variations Section -->
          <div v-if="editingProduct.variations && editingProduct.variations.length > 0" class="mt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Variationen</h3>
            <div class="overflow-x-auto border border-gray-200 rounded-md">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation</th>
                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bestand</th>
                    <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(variant, index) in editingProduct.variations" :key="variant.id || index">
                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {{ variant.sku }}
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {{ variant.value1 }} <span v-if="variant.value2">/ {{ variant.value2 }}</span>
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <input v-model.number="variant.stockQuantity" type="number" class="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs border px-2 py-1">
                    </td>
                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <input v-model="variant.price" type="text" class="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs border px-2 py-1">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button @click="editingProduct = null" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Abbrechen
          </button>
          <button 
            @click="saveProduct" 
            :disabled="saving"
            class="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Speichert...' : 'Speichern' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedProduct" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50" @click="closeDetails">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ selectedProduct.name }}</h2>
              <p class="text-sm text-gray-500 mt-1">SKU: {{ selectedProduct.sku }}</p>
            </div>
            <button @click="closeDetails" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="px-6 py-4 space-y-6">
          <div v-if="selectedProduct.imageUrl" class="w-full bg-gray-100 rounded-lg overflow-hidden">
            <img 
              :src="selectedProduct.imageUrl" 
              :alt="selectedProduct.name" 
              class="w-full h-auto max-h-96 object-contain"
              @error="handleImageError"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Preis</p>
              <p class="text-xl font-bold text-gray-900">{{ formatPrice(selectedProduct.price) }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Lagerbestand</p>
              <p class="text-xl font-bold" :class="{
                'text-green-600': selectedProduct.stockQuantity > 10,
                'text-yellow-600': selectedProduct.stockQuantity > 0 && selectedProduct.stockQuantity <= 10,
                'text-red-600': selectedProduct.stockQuantity === 0
              }">
                {{ selectedProduct.stockQuantity }} Stück
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Gewicht</p>
              <p class="text-lg text-gray-900">{{ selectedProduct.weight }} g</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Erstellt am</p>
              <p class="text-lg text-gray-900">{{ formatDate(selectedProduct.createdAt) }}</p>
            </div>
          </div>

          <div v-if="selectedProduct.description">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Beschreibung</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-700 whitespace-pre-line">{{ selectedProduct.description }}</p>
            </div>
          </div>

          <div v-if="selectedProduct.tags">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in selectedProduct.tags.split(',')" :key="tag" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {{ tag.trim() }}
              </span>
            </div>
          </div>

          <div v-if="selectedProduct.materials">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Materialien</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-700">{{ selectedProduct.materials }}</p>
            </div>
          </div>

          <div v-if="selectedProduct.variationValue1 || selectedProduct.variationValue2">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Variationen</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div v-if="selectedProduct.variationValue1" class="flex items-start">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">
                    {{ selectedProduct.variationName1 || selectedProduct.variationType1 || 'Variation 1' }}
                  </p>
                  <p class="text-sm text-gray-700">{{ selectedProduct.variationValue1 }}</p>
                </div>
              </div>
              <div v-if="selectedProduct.variationValue2" class="flex items-start border-t border-gray-200 pt-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">
                    {{ selectedProduct.variationName2 || selectedProduct.variationType2 || 'Variation 2' }}
                  </p>
                  <p class="text-sm text-gray-700">{{ selectedProduct.variationValue2 }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" :class="{
                  'text-green-500': selectedProduct.stockQuantity > 0,
                  'text-red-500': selectedProduct.stockQuantity === 0
                }" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium" :class="{
                  'text-green-700': selectedProduct.stockQuantity > 0,
                  'text-red-700': selectedProduct.stockQuantity === 0
                }">
                  {{ selectedProduct.stockQuantity > 0 ? 'Auf Lager' : 'Nicht verfügbar' }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                 <button
                  @click="openEditModal(selectedProduct); closeDetails()"
                  class="inline-flex justify-center items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bearbeiten
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button 
            @click="deleteProduct(selectedProduct.id)" 
            class="flex-1 inline-flex justify-center items-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
          >
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Löschen
          </button>
          <button @click="closeDetails" class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
            Schließen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
