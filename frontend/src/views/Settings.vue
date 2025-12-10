<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'

const notifications: any = inject('notifications')

const loading = ref(true)
const saving = ref(false)

interface SettingsData {
    // User
    firstName: string
    lastName: string
    shopName: string

    // Formats
    orderNumberFormat: string
    orderNumberStart: number
    invoiceNumberFormat: string
    invoiceNumberStart: number
    deliveryNoteFormat: string
    deliveryNoteStart: number
    supplierOrderFormat: string
    supplierOrderStart: number
    customerNumberFormat: string
    customerNumberStart: number
    
    // SKU
    skuPrefix: string
}

const form = ref<SettingsData>({
    firstName: '',
    lastName: '',
    shopName: '',
    orderNumberFormat: '',
    orderNumberStart: 1,
    invoiceNumberFormat: '',
    invoiceNumberStart: 1,
    deliveryNoteFormat: '',
    deliveryNoteStart: 1,
    supplierOrderFormat: '',
    supplierOrderStart: 1,
    customerNumberFormat: '',
    customerNumberStart: 1,
    skuPrefix: ''
})

const previews = ref<Record<string, string>>({})

const fetchSettings = async () => {
    try {
        loading.value = true
        const response = await axios.get('/api/settings')
        const { user, settings, previews: fetchedPreviews } = response.data
        
        form.value = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            shopName: user.shopName || '',
            
            orderNumberFormat: settings.orderNumberFormat,
            orderNumberStart: settings.orderNumberStart,
            invoiceNumberFormat: settings.invoiceNumberFormat,
            invoiceNumberStart: settings.invoiceNumberStart,
            deliveryNoteFormat: settings.deliveryNoteFormat,
            deliveryNoteStart: settings.deliveryNoteStart,
            supplierOrderFormat: settings.supplierOrderFormat,
            supplierOrderStart: settings.supplierOrderStart,
            customerNumberFormat: settings.customerNumberFormat || 'KD-{YYYY}-{####}',
            customerNumberStart: settings.customerNumberStart || 1,
            
            skuPrefix: settings.skuPrefix
        }
        
        previews.value = fetchedPreviews
    } catch (error: any) {
        console.error('Error fetching settings:', error)
        notifications.value.show('error', 'Fehler', 'Fehler beim Laden der Einstellungen')
    } finally {
        loading.value = false
    }
}

const saveSettings = async () => {
    try {
        saving.value = true
        await axios.put('/api/settings', form.value)
        // Refresh to get updated previews
        await fetchSettings()
        notifications.value.show('success', 'Erfolg', 'Einstellungen erfolgreich gespeichert.')
    } catch (error: any) {
        console.error('Error saving settings:', error)
        notifications.value.show('error', 'Fehler', 'Fehler beim Speichern: ' + (error.response?.data?.error || error.message))
    } finally {
        saving.value = false
    }
}

onMounted(fetchSettings)
</script>

<template>
  <div class="space-y-6">


    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Nummernkreise</h3>
          <p class="mt-1 text-sm text-gray-500">
            Definieren Sie das Format für automatisch generierte Nummern.<br><br>
            Platzhalter:<br>
            <code>{YYYY}</code> - Jahr (4-stellig)<br>
            <code>{YY}</code> - Jahr (2-stellig)<br>
            <code>{MM}</code> - Monat<br>
            <code>{####}</code> - Zähler (Anzahl # = Stellen)
          </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
            <div class="space-y-6">
                <!-- Orders -->
                <div class="grid grid-cols-6 gap-6 items-end border-b pb-4">
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Bestellnummer Format</label>
                        <input v-model="form.orderNumberFormat" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                         <label class="block text-sm font-medium text-gray-700">Vorschau</label>
                         <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{{ previews.orderNumber }}</p>
                    </div>
                </div>

                <!-- Invoices -->
                <div class="grid grid-cols-6 gap-6 items-end border-b pb-4">
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Rechnungsnummer Format</label>
                        <input v-model="form.invoiceNumberFormat" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                         <label class="block text-sm font-medium text-gray-700">Vorschau</label>
                         <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{{ previews.invoiceNumber }}</p>
                    </div>
                </div>

                <!-- Delivery Notes -->
                <div class="grid grid-cols-6 gap-6 items-end border-b pb-4">
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Lieferschein Format</label>
                        <input v-model="form.deliveryNoteFormat" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                         <label class="block text-sm font-medium text-gray-700">Vorschau</label>
                         <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{{ previews.deliveryNote }}</p>
                    </div>
                </div>
                
                <!-- Customers -->
                 <div class="grid grid-cols-6 gap-6 items-end pb-4">
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Kundennummer Format</label>
                        <input v-model="form.customerNumberFormat" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                         <label class="block text-sm font-medium text-gray-700">Vorschau</label>
                         <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{{ previews.customerNumber }}</p>
                    </div>
                </div>

                 <div class="mt-4">
                    <p class="text-xs text-yellow-600">
                        Hinweis: Änderungen wirken sich nur auf zukünftige Dokumente aus.
                    </p>
                 </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end">
      <button @click="saveSettings" :disabled="saving" type="button" class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        {{ saving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </div>
</template>
