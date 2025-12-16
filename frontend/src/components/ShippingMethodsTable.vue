<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useNotifications } from '../composables/useNotifications'

const { showSuccess, showError } = useNotifications()

interface ShippingMethod {
    id: string
    name: string
    provider: 'DHL' | 'DEUTSCHE_POST'
    productCode: string
    billingNumber?: string
    printerName?: string
    isActive: boolean
}

const methods = ref<ShippingMethod[]>([])
const loading = ref(false)
const showModal = ref(false)
const printers = ref<string[]>([])

// Form Data
const editedItem = ref<Partial<ShippingMethod>>({
    name: '',
    provider: 'DHL',
    productCode: '',
    billingNumber: '',
    printerName: '',
    isActive: true
})

const isEditing = ref(false)

// Provider Options
const providers = [
    { value: 'DHL', label: 'DHL Paket' },
    { value: 'DEUTSCHE_POST', label: 'Deutsche Post' }
]

// Product Options (Simplified for now)
const dhlProducts = [
    { value: 'V01PAK', label: 'DHL Paket (V01PAK)' },
    { value: 'V53WPAK', label: 'DHL Warenpost (V53WPAK)' },
    { value: 'V06PAK', label: 'DHL Kleinpaket (V06PAK)' }
]

const dpProducts = [
    { value: '10', label: 'Standardbrief' },
    { value: '20', label: 'Kompaktbrief' },
    { value: '25', label: 'Großbrief' },
    { value: '50', label: 'Maxibrief' },
    { value: '55', label: 'Maxibrief Plus' } // Example
]

const currentProducts = computed(() => {
    return editedItem.value.provider === 'DHL' ? dhlProducts : dpProducts
})

const fetchMethods = async () => {
    try {
        loading.value = true
        const response = await axios.get('/api/shipping-profiles')
        methods.value = response.data
    } catch (error) {
        console.error('Error fetching shipping methods:', error)
    } finally {
        loading.value = false
    }
}

const fetchPrinters = async () => {
    try {
        const response = await axios.get('/api/shipping/printers')
        if (response.data.printers) {
            printers.value = response.data.printers
        }
    } catch (error) {
        console.error('Error fetching printers:', error)
    }
}

const openAddModal = () => {
    isEditing.value = false
    editedItem.value = {
        name: '',
        provider: 'DHL',
        productCode: 'V01PAK',
        billingNumber: '',
        printerName: '',
        isActive: true
    }
    showModal.value = true
}

const editMethod = (method: ShippingMethod) => {
    isEditing.value = true
    editedItem.value = { ...method }
    showModal.value = true
}

const saveMethod = async () => {
    try {
        if (!editedItem.value.name || !editedItem.value.productCode) {
            showError('Bitte Name und Produkt wählen.')
            return
        }

        if (isEditing.value && editedItem.value.id) {
            await axios.put(`/api/shipping-profiles/${editedItem.value.id}`, editedItem.value)
            showSuccess('Versandart aktualisiert')
        } else {
            await axios.post('/api/shipping-profiles', editedItem.value)
            showSuccess('Versandart angelegt')
        }
        showModal.value = false
        fetchMethods()
    } catch (error: any) {
        showError('Fehler beim Speichern: ' + (error.response?.data?.error || error.message))
    }
}

const deleteMethod = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return
    try {
        await axios.delete(`/api/shipping-profiles/${id}`)
        showSuccess('Versandart gelöscht')
        fetchMethods()
    } catch (error: any) {
        showError('Fehler beim Löschen')
    }
}

onMounted(() => {
    fetchMethods()
    fetchPrinters()
})
</script>

<template>
    <div class="mt-6">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h3 class="text-base font-semibold leading-6 text-gray-900">Versandarten Konfiguration</h3>
                <p class="mt-2 text-sm text-gray-700">Legen Sie hier Ihre Versandarten an (z.B. "DHL Paket", "Warenpost") und verknüpfen Sie diese mit den entsprechenden DHL-Produkten und Abrechnungsnummern.</p>
            </div>
            <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button @click="openAddModal" type="button" class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Versandart hinzufügen
                </button>
            </div>
        </div>
        
        <div class="mt-8 flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table class="min-w-full divide-y divide-gray-300">
                        <thead>
                            <tr>
                                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Anbieter / Produkt</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Abrechnungsnr.</th>
                                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Drucker</th>
                                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span class="sr-only">Aktionen</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <tr v-if="methods.length === 0">
                                <td colspan="5" class="py-4 text-center text-gray-500 text-sm">Keine Versandarten angelegt.</td>
                            </tr>
                            <tr v-for="method in methods" :key="method.id">
                                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                    {{ method.name }}
                                    <span v-if="!method.isActive" class="ml-2 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Inaktiv</span>
                                </td>
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {{ method.provider }} - {{ method.productCode }}
                                </td>
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ method.billingNumber || '-' }}</td>
                                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ method.printerName || 'Standard' }}</td>
                                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                    <button @click="editMethod(method)" class="text-indigo-600 hover:text-indigo-900 mr-4">Bearbeiten</button>
                                    <button @click="deleteMethod(method.id)" class="text-red-600 hover:text-red-900">Löschen</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showModal" class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                        <div class="mt-3 text-center sm:mt-5 sm:text-left">
                            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                                {{ isEditing ? 'Versandart bearbeiten' : 'Neue Versandart' }}
                            </h3>
                            <div class="mt-4 space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Bezeichnung</label>
                                    <input v-model="editedItem.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="z.B. DHL Paket Klein">
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Anbieter</label>
                                        <select v-model="editedItem.provider" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                            <option v-for="p in providers" :key="p.value" :value="p.value">{{ p.label }}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700">Produkt</label>
                                        <select v-model="editedItem.productCode" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                            <option v-for="p in currentProducts" :key="p.value" :value="p.value">{{ p.label }}</option>
                                        </select>
                                    </div>
                                </div>

                                <div v-if="editedItem.provider === 'DHL'">
                                    <label class="block text-sm font-medium text-gray-700">Abrechnungsnummer (14-stellig)</label>
                                    <input v-model="editedItem.billingNumber" type="text" maxlength="14" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" placeholder="z.B. 50xxxxxxxx0101">
                                    <p class="text-xs text-gray-500 mt-1">Wenn leer, wird der Standard aus den DHL Einstellungen genutzt.</p>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Drucker (Optional)</label>
                                    <select v-model="editedItem.printerName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                        <option value="">(Standard verwenden)</option>
                                        <option v-for="p in printers" :key="p" :value="p">{{ p }}</option>
                                    </select>
                                </div>

                                <div class="flex items-center">
                                    <input id="isActive" v-model="editedItem.isActive" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                                    <label for="isActive" class="ml-2 block text-sm text-gray-900">Aktiv</label>
                                </div>
                            </div>
                        </div>
                        <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button @click="saveMethod" type="button" class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2">Speichern</button>
                            <button @click="showModal = false" type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">Abbrechen</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
