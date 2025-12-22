<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps<{
  show: boolean
  order: any
}>()

const emit = defineEmits(['close', 'saved'])

const trackingNumber = ref('')
const carrier = ref('DHL')
const notifyEtsy = ref(false)
const saving = ref(false)

const carriers = [
  'DHL',
  'Deutsche Post',
  'Hermes',
  'DPD',
  'GLS',
  'UPS',
  'FedEx',
  'Other'
]

watch(() => props.order, (newOrder) => {
  if (newOrder) {
    trackingNumber.value = newOrder.trackingNumber || ''
    carrier.value = newOrder.shippingProvider || 'DHL'
    notifyEtsy.value = newOrder.platform === 'ETSY'
  }
}, { immediate: true })

const save = async () => {
  if (!trackingNumber.value) return

  saving.value = true
  try {
    const response = await axios.put(`/api/orders/${props.order.id}/tracking`, {
      trackingNumber: trackingNumber.value,
      carrier: carrier.value,
      notifyEtsy: true // Always true by default for now, or use a bound variable if UI checkbox exists
    })
    
    if (response.data.warning) {
        alert('Tracking lokal gespeichert, aber Etsy-Sync fehlgeschlagen:\n' + response.data.warning)
    }

    emit('saved')
    emit('close')
  } catch (err: any) {
    alert('Fehler beim Speichern: ' + (err.response?.data?.error || err.message))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full" @click.stop>
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Tracking manuell eingeben</h3>
      </div>
      
      <div class="px-6 py-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Sendungsnummer</label>
          <input 
            v-model="trackingNumber" 
            type="text" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
            placeholder="z.B. 003404341..."
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Versanddienstleister</label>
          <select 
            v-model="carrier" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
          >
            <option v-for="c in carriers" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div v-if="order?.platform === 'ETSY'" class="flex items-center">
          <input 
            id="notify-etsy" 
            v-model="notifyEtsy" 
            type="checkbox" 
            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          >
          <label for="notify-etsy" class="ml-2 block text-sm text-gray-900">
            An Etsy senden und Bestellung als "Versendet" markieren
          </label>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
        <button 
          @click="$emit('close')" 
          type="button" 
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          Abbrechen
        </button>
        <button 
          @click="save" 
          :disabled="saving || !trackingNumber"
          type="button" 
          class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400"
        >
          <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? 'Speichern...' : 'Speichern' }}
        </button>
      </div>
    </div>
  </div>
</template>
