<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import axios from 'axios'
import { useNotifications } from '../composables/useNotifications'
import LabelDesigner from '../components/LabelDesigner.vue'
import ShippingMethodsTable from '../components/ShippingMethodsTable.vue'

const { showSuccess, showError } = useNotifications()

const loading = ref(true)
const saving = ref(false)

interface LabelProfile {
    id?: string
    name: string
    printerName: string
    format: string // A6, A4, 4x6
    layoutJson?: string
}

interface SettingsData {
    // DHL
    dhlEnabled: boolean
    dhlGkpUsername: string
    dhlGkpPassword?: string // Optional/Masked
    dhlEkp: string
    dhlProcedure: string
    dhlParticipation: string
    dhlBillingNrPaket: string
    dhlBillingNrKleinpaket: string
    
    // User
    firstName: string
    lastName: string
    shopName: string

    // Label Profiles
    labelProfiles: LabelProfile[]

    // Global Label Settings
    labelLogoPath?: string
    labelCompanyName?: string
    labelStreet?: string
    labelPostalCode?: string
    labelCity?: string
    labelCountry?: string
    labelPhone?: string

    // Formats & Counters
    orderNumberFormat: string
    orderNumberCurrent: number
    invoiceNumberFormat: string
    invoiceNumberCurrent: number
    deliveryNoteFormat: string
    deliveryNoteCurrent: number
    supplierOrderFormat: string
    supplierOrderCurrent: number
    customerNumberFormat: string
    customerNumberCurrent: number
    
    // SKU
    skuPrefix: string
    nextProductId: number

    // Printers
    printerInvoice: string
    formatInvoice: string
    printerDeliveryNote: string
    formatDeliveryNote: string
}

const printers = ref<string[]>([])
const showDesigner = ref(false)
const currentDesignerProfileIndex = ref<number | null>(null)

const currentDesignerProfile = computed(() => {
    if (currentDesignerProfileIndex.value !== null && form.value.labelProfiles[currentDesignerProfileIndex.value]) {
        return form.value.labelProfiles[currentDesignerProfileIndex.value]
    }
    return null
})

const form = ref<SettingsData>({
    dhlEnabled: false,
    dhlGkpUsername: '',
    dhlGkpPassword: '',
    dhlEkp: '',
    dhlProcedure: '01', // Default
    dhlParticipation: '01', // Default
    dhlBillingNrPaket: '',
    dhlBillingNrKleinpaket: '',

    firstName: '',
    lastName: '',
    shopName: '',
    labelProfiles: [],
    
    labelCompanyName: '',
    labelStreet: '',
    labelPostalCode: '',
    labelCity: '',
    labelCountry: 'Deutschland',
    labelPhone: '',
    
    orderNumberFormat: '',
    orderNumberCurrent: 1,
    invoiceNumberFormat: '',
    invoiceNumberCurrent: 1,
    deliveryNoteFormat: '',
    deliveryNoteCurrent: 1,
    supplierOrderFormat: '',
    supplierOrderCurrent: 1,
    customerNumberFormat: '',
    customerNumberCurrent: 1,
    
    skuPrefix: '',
    nextProductId: 1,

    printerInvoice: '',
    formatInvoice: 'A4',
    printerDeliveryNote: '',
    formatDeliveryNote: 'A4',
})

const previews = ref<Record<string, string>>({})

const fetchSettings = async () => {
    try {
        loading.value = true
        const response = await axios.get('/api/settings')
        const { user, settings, previews: fetchedPreviews } = response.data
        
        form.value = {
            dhlEnabled: settings.dhlEnabled || false,
            dhlGkpUsername: settings.dhlGkpUsername || '',
            dhlGkpPassword: settings.dhlGkpPassword || '', // Will be masked by backend hopefully or empty
            dhlEkp: settings.dhlEkp || '',
            dhlProcedure: settings.dhlProcedure || '01',
            dhlParticipation: settings.dhlParticipation || '01',
            dhlBillingNrPaket: settings.dhlBillingNrPaket || '',
            dhlBillingNrKleinpaket: settings.dhlBillingNrKleinpaket || '',

            firstName: user.firstName || '',
            lastName: user.lastName || '',
            shopName: user.shopName || '',
            labelProfiles: user.labelProfiles || [],

            // Restore global label settings
            labelLogoPath: settings.labelLogoPath || '',
            labelCompanyName: settings.labelCompanyName || '',
            labelStreet: settings.labelStreet || '',
            labelPostalCode: settings.labelPostalCode || '',
            labelCity: settings.labelCity || '',
            labelCountry: settings.labelCountry || 'Deutschland',
            labelPhone: settings.labelPhone || '',
            
            orderNumberFormat: settings.orderNumberFormat,
            orderNumberCurrent: settings.orderNumberCurrent || 1,
            invoiceNumberFormat: settings.invoiceNumberFormat,
            invoiceNumberCurrent: settings.invoiceNumberCurrent || 1,
            deliveryNoteFormat: settings.deliveryNoteFormat,
            deliveryNoteCurrent: settings.deliveryNoteCurrent || 1,
            supplierOrderFormat: settings.supplierOrderFormat,
            supplierOrderCurrent: settings.supplierOrderCurrent || 1,
            customerNumberFormat: settings.customerNumberFormat || 'KD-{YYYY}-{####}',
            customerNumberCurrent: settings.customerNumberCurrent || 1,
            
            skuPrefix: settings.skuPrefix,
            nextProductId: settings.nextProductId || 1,

            printerInvoice: settings.printerInvoice || '',
            formatInvoice: settings.formatInvoice || 'A4',
            printerDeliveryNote: settings.printerDeliveryNote || '',
            formatDeliveryNote: settings.formatDeliveryNote || 'A4',
        }
        
        previews.value = fetchedPreviews
    } catch (error: any) {
        console.error('Error fetching settings:', error)
        showError('Fehler beim Laden der Einstellungen')
    } finally {
        loading.value = false
    }
}

const saveSettings = async () => {
    try {
        saving.value = true
        
        // Remove empty profiles
        const cleanForm = { ...form.value }
        cleanForm.labelProfiles = cleanForm.labelProfiles.filter(p => p.name && p.printerName)

        await axios.put('/api/settings', cleanForm)
        // Refresh to get updated previews
        await fetchSettings()
        showSuccess('Einstellungen erfolgreich gespeichert.')
    } catch (error: any) {
        console.error('Error saving settings:', error)
        showError('Fehler beim Speichern: ' + (error.response?.data?.error || error.message))
    } finally {
        saving.value = false
    }
}

const fetchPrinters = async () => {
    try {
        const response = await axios.get('/api/settings/printers')
        printers.value = response.data
    } catch (error) {
        console.error('Error fetching printers:', error)
    }
}

const addLabelProfile = () => {
    form.value.labelProfiles.push({
        name: '',
        printerName: '',
        format: 'A6'
    })
}

const removeLabelProfile = (index: number) => {
    form.value.labelProfiles.splice(index, 1)
}

const openDesigner = (index: number) => {
    currentDesignerProfileIndex.value = index
    showDesigner.value = true
}

const saveLayout = (json: string) => {
    const idx = currentDesignerProfileIndex.value
    if (idx !== null && form.value.labelProfiles[idx]) {
        form.value.labelProfiles[idx].layoutJson = json
        showDesigner.value = false
        showSuccess('Layout gespeichert (vergessen Sie nicht, die Einstellungen zu speichern)')
    }
}

onMounted(() => {
    fetchSettings()
    fetchPrinters()
})
</script>

<template>
  <div class="space-y-6">

    <!-- Shipping Methods (New) -->
    <div class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
       <ShippingMethodsTable />
    </div>

    <!-- DHL Integration -->
    <div id="dhl" class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">DHL Geschäftskundenversand</h3>
          <p class="mt-1 text-sm text-gray-500">
            Hinterlegen Sie hier Ihre EKP und Zugangsdaten, um Labels direkt über Ihren Vertrag zu erstellen.
          </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
            <div class="space-y-6">
                <!-- Toggle -->
                <div class="flex items-start">
                    <div class="flex items-center h-5">
                        <input id="dhlEnabled" v-model="form.dhlEnabled" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                    </div>
                    <div class="ml-3 text-sm">
                        <label for="dhlEnabled" class="font-medium text-gray-700">DHL Integration aktivieren</label>
                        <p class="text-gray-500">Aktiviert den DHL-Versand im Bestellprozess.</p>
                    </div>
                </div>

                <div v-if="form.dhlEnabled" class="grid grid-cols-6 gap-6 border-t pt-4">
                     <!-- EKP -->
                     <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">EKP (Ihre Kundennummer)</label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                            <input v-model="form.dhlEkp" type="text" maxlength="10" placeholder="z.B. 5000000000" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        </div>
                        <p class="mt-1 text-xs text-gray-500">Die 10-stellige Nummer Ihres DHL Vertrags.</p>
                    </div>

                    <!-- GKP Credentials -->
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">GKP Benutzername</label>
                        <input v-model="form.dhlGkpUsername" type="text" autocomplete="off" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">GKP Passwort / Signatur</label>
                        <input v-model="form.dhlGkpPassword" type="password" autocomplete="new-password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>

                    <!-- Defaults -->
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Verfahren & Teilnahme</label>
                        <div class="flex space-x-2">
                             <input v-model="form.dhlProcedure" type="text" title="Verfahren (meist 01)" maxlength="2" class="mt-1 block w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-center">
                             <input v-model="form.dhlParticipation" type="text" title="Teilnahme (meist 01)" maxlength="2" class="mt-1 block w-16 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-center">
                        </div>
                    </div>

                    <!-- Billing Numbers -->
                    <div class="col-span-6">
                        <h4 class="text-sm font-medium text-gray-900 mt-2 mb-2">Abrechnungsnummern</h4>
                        <p class="text-xs text-gray-500 mb-2">Optional 14-stellig. Wenn leer, wird automatisch EKP + Verfahren + Teilnahme (0101) verwendet.</p>
                    </div>
                    
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Abrechnungsnr. Paket</label>
                        <input v-model="form.dhlBillingNrPaket" type="text" maxlength="14" placeholder="50xxxxxxxx0101" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Abrechnungsnr. Kleinpaket (Warenpost)</label>
                        <input v-model="form.dhlBillingNrKleinpaket" type="text" maxlength="14" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Printer Settings -->
    <div id="printers" class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <h3 class="text-lg font-medium leading-6 text-gray-900">Druckereinstellungen</h3>
          <p class="mt-1 text-sm text-gray-500">
            Wählen Sie für jede Dokumentenart den gewünschten Drucker und das Format.
          </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
            <div class="space-y-6">
                
                <!-- Invoice Printer -->
                <div class="grid grid-cols-6 gap-6 border-b pb-4">
                    <div class="col-span-6 sm:col-span-4">
                        <label class="block text-sm font-medium text-gray-700">Drucker für Rechnungen</label>
                        <select v-model="form.printerInvoice" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option value="">(Kein Drucker / Standard)</option>
                            <option v-for="p in printers" :key="p" :value="p">{{ p }}</option>
                        </select>
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Format</label>
                         <select v-model="form.formatInvoice" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option value="A4">A4</option>
                            <option value="A5">A5</option>
                        </select>
                    </div>
                </div>

                <!-- Delivery Note Printer -->
                <div class="grid grid-cols-6 gap-6 border-b pb-4">
                    <div class="col-span-6 sm:col-span-4">
                        <label class="block text-sm font-medium text-gray-700">Drucker für Lieferscheine</label>
                        <select v-model="form.printerDeliveryNote" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option value="">(Kein Drucker / Standard)</option>
                            <option v-for="p in printers" :key="p" :value="p">{{ p }}</option>
                        </select>
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                         <label class="block text-sm font-medium text-gray-700">Format</label>
                         <select v-model="form.formatDeliveryNote" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option value="A4">A4</option>
                            <option value="A5">A5</option>
                        </select>
                    </div>
                </div>

                <!-- Global Label Data (Logo & Co) -->
                 <div class="grid grid-cols-6 gap-6 border-b pb-4">
                    <div class="col-span-6">
                        <h4 class="text-sm font-medium text-gray-900">Allgemeine Absenderdaten & Logo</h4>
                        <p class="text-xs text-gray-500">Diese Daten werden für den "Absender-Block" in Ihren Labels verwendet.</p>
                    </div>
                    <div class="col-span-6">
                        <label class="block text-sm font-medium text-gray-700">Firmenlogo (Pfad)</label>
                        <input v-model="form.labelLogoPath" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="/path/to/logo.png">
                    </div>
                     <div class="col-span-6 sm:col-span-6">
                        <label class="block text-sm font-medium text-gray-700">Firmenname</label>
                        <input v-model="form.labelCompanyName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-4">
                        <label class="block text-sm font-medium text-gray-700">Straße & Nr.</label>
                        <input v-model="form.labelStreet" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">PLZ</label>
                        <input v-model="form.labelPostalCode" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Stadt</label>
                        <input v-model="form.labelCity" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                     <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Land</label>
                        <input v-model="form.labelCountry" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                </div>

                <!-- Label Profiles (Dynamic) -->
                <div class="pb-4">
                    <div class="flex justify-between items-center mb-4">
                        <label class="block text-sm font-medium text-gray-700">Versandlabel Profile</label>
                        <button @click="addLabelProfile" type="button" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            + Profil hinzufügen
                        </button>
                    </div>
                    
                    <div v-if="form.labelProfiles.length === 0" class="text-sm text-gray-500 italic mb-4">
                        Keine Profile definiert. Klicken Sie auf "+", um (z.B. DHL, Deutsche Post) hinzuzufügen.
                    </div>

                    <div v-for="(profile, index) in form.labelProfiles" :key="index" class="grid grid-cols-12 gap-4 items-end mb-4 bg-gray-50 p-3 rounded-md relative">
                        <!-- Profile Name -->
                         <div class="col-span-12 sm:col-span-3">
                            <label class="block text-xs font-medium text-gray-500">Name (z.B. DHL)</label>
                            <input v-model="profile.name" type="text" placeholder="Bezeichnung" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        </div>

                        <!-- Printer -->
                         <div class="col-span-12 sm:col-span-5">
                            <label class="block text-xs font-medium text-gray-500">Drucker</label>
                            <select v-model="profile.printerName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                <option value="">(Wählen)</option>
                                <option v-for="p in printers" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>

                         <!-- Format -->
                         <div class="col-span-12 sm:col-span-3">
                            <label class="block text-xs font-medium text-gray-500">Format</label>
                             <select v-model="profile.format" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                <option value="A6">A6 (105x148mm)</option>
                                <option value="4x6">4x6 Zoll (100x150mm)</option>
                                <option value="A5">A5</option>
                                <option value="A4">A4</option>
                            </select>
                        </div>
                        
                        <!-- Actions -->
                        <div class="col-span-12 sm:col-span-1 flex justify-end items-end space-x-2">
                            <button @click="openDesigner(index)" type="button" class="text-indigo-600 hover:text-indigo-900 p-2" title="Design bearbeiten">
                                🎨
                            </button>
                            <button @click="removeLabelProfile(index)" type="button" class="text-red-600 hover:text-red-800 p-2" title="Entfernen">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>

    <!-- Label Designer Modal -->
    <LabelDesigner 
        v-if="showDesigner && currentDesignerProfile"
        :modelValue="currentDesignerProfile.layoutJson"
        :format="currentDesignerProfile.format"
        :logo-url="form.labelLogoPath ? `/api/settings/logo-preview?path=${encodeURIComponent(form.labelLogoPath)}` : null"
        @close="showDesigner = false"
        @save="saveLayout"
    />

    <!-- Counters Section (Unchanged) -->
    <div id="numbers" class="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
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
                    <div class="col-span-6 sm:col-span-1">
                        <label class="block text-sm font-medium text-gray-700">Nächste Nr.</label>
                        <input v-model="form.orderNumberCurrent" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-2">
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
                    <div class="col-span-6 sm:col-span-1">
                        <label class="block text-sm font-medium text-gray-700">Nächste Nr.</label>
                        <input v-model="form.invoiceNumberCurrent" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-2">
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
                    <div class="col-span-6 sm:col-span-1">
                        <label class="block text-sm font-medium text-gray-700">Nächste Nr.</label>
                        <input v-model="form.deliveryNoteCurrent" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                         <label class="block text-sm font-medium text-gray-700">Vorschau</label>
                         <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{{ previews.deliveryNote }}</p>
                    </div>
                </div>
                
                <!-- Customers -->
                 <div class="grid grid-cols-6 gap-6 items-end border-b pb-4">
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">Kundennummer Format</label>
                        <input v-model="form.customerNumberFormat" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-1">
                        <label class="block text-sm font-medium text-gray-700">Nächste Nr.</label>
                        <input v-model="form.customerNumberCurrent" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                         <label class="block text-sm font-medium text-gray-700">Vorschau</label>
                         <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{{ previews.customerNumber }}</p>
                    </div>
                </div>

                <!-- SKU / Articles -->
                 <div class="grid grid-cols-6 gap-6 items-end pb-4">
                    <div class="col-span-6">
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Artikel-Nummern (SKU)</h4>
                        <p class="text-xs text-gray-500 mb-4">Wird für importierte Artikel verwendet, die keine SKU aus Etsy haben.</p>
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700">SKU Präfix</label>
                        <input v-model="form.skuPrefix" type="text" placeholder="z.B. 10 oder ART-" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-1">
                        <label class="block text-sm font-medium text-gray-700">Nächste Nr.</label>
                        <input v-model="form.nextProductId" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="col-span-6 sm:col-span-2">
                         <label class="block text-sm font-medium text-gray-700">Vorschau</label>
                         <p class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">{{ form.skuPrefix }}{{ form.nextProductId?.toString().padStart(3, '0') }}</p>
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
