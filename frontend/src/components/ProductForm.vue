<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps<{
  initialData?: any
  isEditing?: boolean
}>()

const emit = defineEmits(['save', 'cancel'])

const productTypes = [
  { value: 'SIMPLE', label: 'Einfacher Artikel' },
  { value: 'VARIATION', label: 'Artikel mit Varianten' },
  { value: 'BUNDLE', label: 'Stückliste / Bundle' }
]

const form = ref({
  type: 'SIMPLE',
  sku: '',
  name: '',
  description: '',
  price: '0,00',
  stockQuantity: 0,
  weight: 0,
  imageUrl: '',
  gtin: '',
  showInShop: true
})

// For Variations - select existing products
const selectedVariantProducts = ref<any[]>([])
const variantSearchQuery = ref('')
const variantAttribute1 = ref('Farbe')

// For Bundles
const selectedComponents = ref<any[]>([])
const bundleSearchQuery = ref('')

// Available products for both variants and bundles
const availableProducts = ref<any[]>([])

onMounted(async () => {
  if (props.initialData) {
    const d = props.initialData
    form.value = {
        type: d.type || 'SIMPLE',
        sku: d.sku || '',
        name: d.name || '',
        description: d.description || '',
        price: d.price ? d.price.toString().replace('.', ',') : '0,00',
        stockQuantity: d.stockQuantity || 0,
        weight: d.weight || 0,
        imageUrl: d.imageUrl || '',
        gtin: d.gtin || '',
        showInShop: d.showInShop !== undefined ? d.showInShop : true
    }
    
    if (d.variations && d.type === 'VARIATION') {
        selectedVariantProducts.value = d.variations.map((v: any) => ({
            id: v.childProductId,
            product: v.childProduct,
            variantValue: v.value1,
            variantName: v.name1
        }))
    }
    
    if (d.components && d.type === 'BUNDLE') {
        selectedComponents.value = d.components.map((c: any) => ({
            id: c.childProductId,
            product: c.childProduct,
            quantity: c.quantity
        }))
    }
  }

  // Load available products
  try {
      const res = await axios.get('/api/products?status=active')
      availableProducts.value = res.data
  } catch (e) {
      console.error('Failed to load products', e)
  }
})

// Modal for variant value input
const showVariantModal = ref(false)
const pendingVariantProduct = ref<any>(null)
const variantValueInput = ref('')

const addVariantProduct = (product: any) => {
    if (selectedVariantProducts.value.find(v => v.id === product.id)) {
        return
    }
    
    // Show modal instead of prompt
    pendingVariantProduct.value = product
    variantValueInput.value = ''
    showVariantModal.value = true
}

const confirmVariantValue = () => {
    if (!variantValueInput.value.trim()) return
    
    selectedVariantProducts.value.push({
        id: pendingVariantProduct.value.id,
        product: pendingVariantProduct.value,
        variantValue: variantValueInput.value.trim(),
        variantName: variantAttribute1.value
    })
    
    showVariantModal.value = false
    pendingVariantProduct.value = null
    variantValueInput.value = ''
    variantSearchQuery.value = ''
}

const cancelVariantModal = () => {
    showVariantModal.value = false
    pendingVariantProduct.value = null
    variantValueInput.value = ''
}

const removeVariantProduct = (index: number) => {
    selectedVariantProducts.value.splice(index, 1)
}

const addBundleComponent = (product: any) => {
    const existing = selectedComponents.value.find(c => c.id === product.id)
    if (existing) {
        existing.quantity++
    } else {
        selectedComponents.value.push({
            id: product.id,
            product: product,
            quantity: 1
        })
    }
    bundleSearchQuery.value = ''
}

const removeBundleComponent = (index: number) => {
    selectedComponents.value.splice(index, 1)
}

const save = () => {
    const payload: any = {
        ...form.value,
        price: parseFloat(form.value.price.replace(',', '.'))
    }
    
    if (payload.type === 'VARIATION') {
        payload.variations = selectedVariantProducts.value.map(v => ({
            childProductId: v.id,
            sku: v.product.sku,
            name1: v.variantName,
            value1: v.variantValue,
            price: v.product.price,
            stockQuantity: v.product.stockQuantity
        }))
    }
    
    if (payload.type === 'BUNDLE') {
        payload.components = selectedComponents.value.map(c => ({
            childProductId: c.id,
            quantity: c.quantity
        }))
    }

    emit('save', payload)
}

const filteredVariantProducts = computed(() => {
    if (!variantSearchQuery.value) return []
    const q = variantSearchQuery.value.toLowerCase()
    return availableProducts.value.filter(p => 
        p.id !== props.initialData?.id &&
        (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    ).slice(0, 5)
})

const filteredBundleProducts = computed(() => {
    if (!bundleSearchQuery.value) return []
    const q = bundleSearchQuery.value.toLowerCase()
    return availableProducts.value.filter(p => 
        p.id !== props.initialData?.id &&
        (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    ).slice(0, 5)
})

</script>

<template>
  <div class="space-y-6">
    
    <!-- Help Box at Top -->
    <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
      <h3 class="font-bold text-blue-900 mb-2">📋 Anleitung zur Artikelanlage</h3>
      <div class="text-sm text-blue-800 space-y-1">
        <p><strong>Einfacher Artikel:</strong> Normale Produkte wie "Mutmonster Grün (SKU: 10005)"</p>
        <p><strong>Artikel mit Varianten:</strong> Ein Eltern-Artikel der mehrere bestehende Artikel zusammenfasst (z.B. "Mutmonster" enthält 10005 Grün, 10006 Blau, 10007 Rot)</p>
        <p><strong>Stückliste/Bundle:</strong> Ein Set aus mehreren Artikeln (z.B. "3er Mutmonster Set" = 1x Grün + 1x Blau + 1x Rot)</p>
      </div>
    </div>

    <!-- Type Selection -->
    <div v-if="!isEditing" class="flex gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
        <label v-for="t in productTypes" :key="t.value" class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="form.type" :value="t.value" name="ptype">
            <span class="font-medium">{{ t.label }}</span>
        </label>
    </div>

    <!-- Base Data -->
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              SKU / Artikelnummer
              <span class="text-xs text-gray-500">(z.B. 10010 für Eltern-Artikel)</span>
            </label>
            <input v-model="form.sku" type="text" class="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-2 border-gray-400 px-3 py-2">
        </div>
         <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">GTIN / EAN</label>
            <input v-model="form.gtin" type="text" class="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-2 border-gray-400 px-3 py-2">
        </div>
        <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Artikelname
              <span class="text-xs text-gray-500">(z.B. "Mutmonster" für Variationsartikel)</span>
            </label>
            <input v-model="form.name" type="text" class="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-2 border-gray-400 px-3 py-2">
        </div>
         <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea v-model="form.description" rows="3" class="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-2 border-gray-400 px-3 py-2"></textarea>
        </div>
         <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Preis (€)</label>
            <input v-model="form.price" type="text" class="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-2 border-gray-400 px-3 py-2">
        </div>
         <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Lagerbestand</label>
            <input v-model.number="form.stockQuantity" type="number" :disabled="form.type === 'BUNDLE' || form.type === 'VARIATION'" class="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 border-2 border-gray-400 px-3 py-2 disabled:bg-gray-100">
            <p v-if="form.type === 'BUNDLE' || form.type === 'VARIATION'" class="text-xs text-gray-500 mt-1">Wird automatisch berechnet</p>
        </div>
        
        <!-- Shop Visibility Toggle -->
        <div class="col-span-2 bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-900 mb-1">
                🛍️ Im Shop veröffentlichen
              </label>
              <p class="text-xs text-gray-600">
                <span v-if="form.type === 'VARIATION'">Deaktivieren Sie dies bei Einzelartikeln, die nur über einen Variationsartikel verkauft werden sollen</span>
                <span v-else-if="form.type === 'BUNDLE'">Steuert, ob das Bundle im Shop sichtbar ist</span>
                <span v-else>Deaktivieren, wenn dieser Artikel nur als Komponente verwendet werden soll</span>
              </p>
            </div>
            <button 
              type="button"
              @click="form.showInShop = !form.showInShop"
              :class="form.showInShop ? 'bg-green-600' : 'bg-gray-300'"
              class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4"
            >
              <span 
                :class="form.showInShop ? 'translate-x-7' : 'translate-x-1'"
                class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
              />
            </button>
          </div>
          <div class="mt-2 flex items-center gap-2">
            <span v-if="form.showInShop" class="text-sm font-bold text-green-700">✓ Sichtbar im Shop</span>
            <span v-else class="text-sm font-bold text-gray-600">✕ Nicht im Shop (nur intern)</span>
          </div>
        </div>
    </div>

    <!-- Variation Builder NEW DESIGN -->
    <div v-if="form.type === 'VARIATION'" class="border-2 border-blue-400 p-4 rounded-md bg-blue-50">
        <div class="bg-white border-2 border-blue-300 rounded p-3 mb-4">
          <p class="text-sm text-blue-900"><strong>💡 So geht's:</strong></p>
          <ol class="text-sm text-blue-800 list-decimal ml-5 space-y-1">
            <li>Geben Sie oben bei "Variationstyp" ein: <strong>Farbe</strong></li>
            <li>Suchen Sie im Suchfeld nach bestehenden Artikeln (z.B. "Mutmonster" oder "10005")</li>
            <li>Klicken Sie auf einen Artikel → Ein Modal öffnet sich</li>
            <li>Tragen Sie die Farbe ein (z.B. "Grün", "Blau", "Rot")</li>
            <li>Wiederholen Sie das für alle Farben</li>
          </ol>
        </div>
        
        <h3 class="font-bold mb-4 text-lg">Varianten aus bestehenden Artikeln auswählen</h3>
        
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Variationstyp</label>
            <input v-model="variantAttribute1" placeholder="z.B. Farbe" class="w-full border-2 border-gray-400 rounded px-3 py-2">
        </div>
        
        <div class="mb-4 relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Artikel hinzufügen</label>
            <input v-model="variantSearchQuery" placeholder="Artikel suchen (SKU oder Name)..." class="w-full rounded border-2 border-gray-400 px-3 py-2">
            
            <div v-if="variantSearchQuery && filteredVariantProducts.length > 0" class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border-2 border-gray-400 max-h-60 overflow-y-auto">
                <ul>
                    <li v-for="p in filteredVariantProducts" :key="p.id" @click="addVariantProduct(p)" class="px-4 py-3 hover:bg-blue-100 cursor-pointer border-b border-gray-200 last:border-0">
                        <div class="font-medium">{{ p.name }}</div>
                        <div class="text-sm text-gray-600">SKU: {{ p.sku }} | Preis: {{ p.price }} € | Bestand: {{ p.stockQuantity }}</div>
                    </li>
                </ul>
            </div>
        </div>

        <div v-if="selectedVariantProducts.length > 0" class="space-y-2">
            <h4 class="font-bold text-sm">Ausgewählte Varianten:</h4>
            <div v-for="(v, idx) in selectedVariantProducts" :key="idx" class="flex items-center gap-3 bg-white p-3 rounded border-2 border-gray-300">
                <div class="flex-1">
                    <div class="font-medium">{{ v.product.name }}</div>
                    <div class="text-sm text-gray-600">SKU: {{ v.product.sku }}</div>
                </div>
                <div class="px-3 py-1 bg-blue-100 rounded border border-blue-300 font-medium">
                    {{ v.variantName }}: {{ v.variantValue }}
                </div>
                <button @click="removeVariantProduct(idx)" class="text-red-600 hover:text-red-900 font-bold px-2">✕</button>
            </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
            Keine Varianten ausgewählt. Suchen Sie Artikel oben.
        </div>
    </div>

    <!-- Bundle Builder -->
    <div v-if="form.type === 'BUNDLE'" class="border-2 border-green-400 p-4 rounded-md bg-green-50">
        <div class="bg-white border-2 border-green-300 rounded p-3 mb-4">
          <p class="text-sm text-green-900"><strong>💡 So geht's:</strong></p>
          <ol class="text-sm text-green-800 list-decimal ml-5 space-y-1">
            <li>Suchen Sie im Suchfeld nach Artikeln (z.B. "Mutmonster")</li>
            <li>Klicken Sie auf einen Artikel → Er wird hinzugefügt</li>
            <li>Passen Sie die Menge an (z.B. 10 Stück = 10er Set)</li>
            <li>Fügen Sie weitere Artikel hinzu für Kombinations-Sets</li>
          </ol>
        </div>
        
        <h3 class="font-bold mb-4 text-lg">Stückliste / Bundle Inhalt</h3>
        
        <div class="mb-4 relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">Artikel hinzufügen</label>
            <input v-model="bundleSearchQuery" placeholder="Artikel suchen (SKU oder Name)..." class="w-full rounded border-2 border-gray-400 px-3 py-2">
            
            <div v-if="bundleSearchQuery && filteredBundleProducts.length > 0" class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border-2 border-gray-400 max-h-60 overflow-y-auto">
                <ul>
                    <li v-for="p in filteredBundleProducts" :key="p.id" @click="addBundleComponent(p)" class="px-4 py-3 hover:bg-green-100 cursor-pointer border-b border-gray-200 last:border-0">
                        <div class="font-medium">{{ p.name }}</div>
                        <div class="text-sm text-gray-600">SKU: {{ p.sku }} | Preis: {{ p.price }} € | Bestand: {{ p.stockQuantity }}</div>
                    </li>
                </ul>
            </div>
        </div>

        <div v-if="selectedComponents.length > 0">
            <table class="min-w-full divide-y divide-gray-300 border-2 border-gray-300">
                 <thead class="bg-gray-100">
                    <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Artikel</th>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-300">Menge</th>
                        <th class="px-3 py-2"></th>
                    </tr>
                </thead>
                 <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="(c, idx) in selectedComponents" :key="idx">
                        <td class="px-3 py-2 border-r border-gray-200">
                            <div class="font-medium">{{ c.product?.name || 'Lade...' }}</div>
                            <div class="text-xs text-gray-500">{{ c.product?.sku }}</div>
                        </td>
                        <td class="px-3 py-2 border-r border-gray-200">
                             <input v-model.number="c.quantity" type="number" min="1" class="w-20 border-2 border-gray-400 rounded px-2 py-1">
                        </td>
                         <td class="px-3 py-2 text-right">
                             <button @click="removeBundleComponent(idx)" class="text-red-600 hover:text-red-900 font-bold">✕</button>
                        </td>
                    </tr>
                 </tbody>
            </table>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
            Noch keine Artikel zur Stückliste hinzugefügt.
        </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-6 border-t-2 border-gray-300">
        <button @click="emit('cancel')" type="button" class="px-4 py-2 bg-white border-2 border-gray-400 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Abbrechen</button>
         <button @click="save" type="button" class="px-4 py-2 bg-blue-600 border-2 border-blue-700 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">Speichern</button>
    </div>
    
    <!-- Variant Value Input Modal -->
    <div v-if="showVariantModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="cancelVariantModal">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border-4 border-blue-500" @click.stop>
        <h3 class="text-xl font-bold mb-4 text-blue-900">Variantenwert eingeben</h3>
        
        <div class="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded">
          <p class="text-sm font-medium text-blue-900">Ausgewählter Artikel:</p>
          <p class="font-bold">{{ pendingVariantProduct?.name }}</p>
          <p class="text-sm text-gray-600">SKU: {{ pendingVariantProduct?.sku }}</p>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ variantAttribute1 }} für diesen Artikel
            <span class="text-xs text-gray-500">(z.B. "Grün", "Blau", "Rot")</span>
          </label>
          <input 
            v-model="variantValueInput" 
            type="text" 
            placeholder="z.B. Grün"
            class="w-full border-2 border-gray-400 rounded px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            @keyup.enter="confirmVariantValue"
            autofocus
          >
        </div>
        
        <div class="flex justify-end gap-3">
          <button @click="cancelVariantModal" class="px-4 py-2 border-2 border-gray-400 rounded text-gray-700 hover:bg-gray-100">
            Abbrechen
          </button>
          <button @click="confirmVariantValue" :disabled="!variantValueInput.trim()" class="px-4 py-2 bg-blue-600 text-white rounded border-2 border-blue-700 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
