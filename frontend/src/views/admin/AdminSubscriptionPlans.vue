<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/vue/24/outline'

const plans = ref<any[]>([])
const isModalOpen = ref(false)
const editingPlan = ref<any>(null)
const formData = ref({
    name: '',
    description: '',
    price: 0,
    interval: 'MONTHLY',
    includedOrders: 0,
    pricePerExtraOrder: 0,
    features: '', // Text area, split by newline
    isActive: true,
    isPopular: false,
    pricingTiers: [] as any[]
})

const fetchPlans = async () => {
    try {
        const res = await axios.get('/api/subscription-plans') // Admin should see all
        plans.value = res.data
    } catch (error) {
        console.error('Fetch plans error', error)
    }
}

const openModal = (plan: any = null) => {
    if (plan) {
        editingPlan.value = plan
        // Ensure tiers is array (it might come as Json object/array from backend)
        let tiers = plan.pricingTiers || []
        if (typeof tiers === 'string') {
             try { tiers = JSON.parse(tiers) } catch(e) {}
        }
        
        formData.value = { 
            ...plan,
            features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features,
            pricingTiers: tiers
        }
    } else {
        editingPlan.value = null
        formData.value = { 
            name: '', description: '', price: 0, interval: 'MONTHLY', 
            includedOrders: 0, pricePerExtraOrder: 0, features: '', 
            isActive: true, isPopular: false,
            pricingTiers: []
        }
    }
    isModalOpen.value = true
}

const addTier = () => {
    formData.value.pricingTiers.push({ from: 0, to: null, price: 0 })
}

const removeTier = (index: number) => {
    formData.value.pricingTiers.splice(index, 1)
}

const savePlan = async () => {
    try {
        const payload = {
            ...formData.value,
             // Clean up tiers
            pricingTiers: formData.value.pricingTiers.map((t: any) => ({
                from: Number(t.from),
                to: t.to === '' || t.to === null ? null : Number(t.to),
                price: Number(t.price)
            })),
            features: formData.value.features.split('\n').filter(f => f.trim() !== '')
        }

        if (editingPlan.value) {
            await axios.put(`/api/subscription-plans/${editingPlan.value.id}`, payload)
        } else {
            await axios.post('/api/subscription-plans', payload)
        }
        isModalOpen.value = false
        fetchPlans()
    } catch (error) {
        alert('Fehler beim Speichern')
    }
}

const deletePlan = async (id: string) => {
    if (!confirm('Plan wirklich löschen?')) return
    try {
        await axios.delete(`/api/subscription-plans/${id}`)
        fetchPlans()
    } catch (error) {
        alert('Fehler beim Löschen')
    }
}

onMounted(fetchPlans)
</script>

<template>
    <div>
        <div class="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">Tarife & Pakete</h3>
                <p class="mt-1 text-sm text-gray-500">Verwalte die Abonnement-Modelle und Konditionen.</p>
            </div>
            <div class="mt-4 sm:mt-0">
                <button 
                    @click="openModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
                    Neues Paket
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div 
                v-for="plan in plans" 
                :key="plan.id" 
                class="bg-white overflow-hidden shadow rounded-lg border border-gray-200 flex flex-col"
                :class="{ 
                    'border-indigo-500 ring-1 ring-indigo-500': plan.isPopular,
                    'opacity-75 border-dashed': !plan.isActive
                }"
            >
                <div class="p-6 flex-1">
                    <div class="flex justify-between items-start">
                         <h4 class="text-xl font-bold text-gray-900">{{ plan.name }}</h4>
                         <span v-if="!plan.isActive" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inaktiv</span>
                         <span v-else-if="plan.isPopular" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">Beliebt</span>
                    </div>
                   
                    <p class="mt-2 text-sm text-gray-500">{{ plan.description }}</p>
                    
                    <div class="mt-4 flex items-baseline">
                        <span class="text-3xl font-extrabold text-gray-900">{{ plan.price.toFixed(2) }} €</span>
                        <span class="ml-1 text-base font-medium text-gray-500">/ {{ plan.interval === 'MONTHLY' ? 'Monat' : 'Jahr' }}</span>
                    </div>
                    
                    <div class="mt-4 border-t border-gray-100 pt-4 space-y-2">
                         <div class="flex items-center text-sm">
                            <span class="font-medium text-gray-900 mr-2">Inkl. Bestellungen:</span>
                            {{ plan.includedOrders }}
                         </div>
                         <div class="flex items-center text-sm">
                             <span class="font-medium text-gray-900 mr-2">Jede weitere:</span>
                             {{ plan.pricePerExtraOrder.toFixed(2) }} €
                         </div>
                    </div>

                    <ul class="mt-6 space-y-3">
                        <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start">
                            <CheckIcon class="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                            <span class="ml-2 text-sm text-gray-500">{{ feature }}</span>
                        </li>
                    </ul>
                </div>

                <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                    <button @click="openModal(plan)" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center">
                        <PencilIcon class="h-4 w-4 mr-1" /> Bearbeiten
                    </button>
                    <button @click="deletePlan(plan.id)" class="text-red-600 hover:text-red-900 text-sm font-medium flex items-center">
                        <TrashIcon class="h-4 w-4 mr-1" /> Löschen
                    </button>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div class="bg-white rounded-lg max-w-lg w-full p-6 my-8">
                <h3 class="text-lg font-medium text-gray-900 mb-4">{{ editingPlan ? 'Paket bearbeiten' : 'Neues Paket' }}</h3>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Name</label>
                            <input v-model="formData.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        </div>
                         <div>
                            <label class="block text-sm font-medium text-gray-700">Intervall</label>
                            <select v-model="formData.interval" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                <option value="MONTHLY">Monatlich</option>
                                <option value="YEARLY">Jährlich</option>
                            </select>
                        </div>
                    </div>

                     <div>
                        <label class="block text-sm font-medium text-gray-700">Beschreibung</label>
                        <input v-model="formData.description" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                         <div>
                            <label class="block text-sm font-medium text-gray-700">Preis (€)</label>
                            <input v-model.number="formData.price" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        </div>
                         <div>
                            <label class="block text-sm font-medium text-gray-700">Inkl. Orders</label>
                            <input v-model.number="formData.includedOrders" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        </div>
                         <div>
                            <label class="block text-sm font-medium text-gray-700">Extra (€)</label>
                            <input v-model.number="formData.pricePerExtraOrder" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Features (Eine pro Zeile)</label>
                        <textarea v-model="formData.features" rows="5" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"></textarea>
                    </div>

                    <!-- Pricing Tiers Editor -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Staffelpreise (Pricing Tiers)</label>
                        <div v-for="(tier, index) in formData.pricingTiers" :key="index" class="flex items-center space-x-2 mb-2">
                             <input v-model.number="tier.from" placeholder="Von" type="number" class="w-20 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2">
                             <span>-</span>
                             <input v-model.number="tier.to" placeholder="Bis (leer=unendlich)" type="number" class="w-20 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2">
                             <span>bei</span>
                             <input v-model.number="tier.price" placeholder="Preis" type="number" step="0.01" class="w-24 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2">
                             <button @click="removeTier(index)" class="text-red-500 hover:text-red-700">
                                 <TrashIcon class="h-5 w-5" />
                             </button>
                        </div>
                        <button @click="addTier" type="button" class="mt-2 text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                            + Staffel hinzufügen
                        </button>
                         <p class="text-xs text-gray-400 mt-1">Definiere ab welcher Bestellmenge welcher Preis gilt. "Bis" leer lassen für "ab X bis unendlich".</p>
                    </div>

                    <div class="flex items-center space-x-4 pt-2">
                        <label class="flex items-center">
                            <input v-model="formData.isActive" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-900">Aktiv</span>
                        </label>
                        <label class="flex items-center">
                            <input v-model="formData.isPopular" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-900">"Beliebt" Badge</span>
                        </label>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button @click="isModalOpen = false" class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Abbrechen</button>
                    <button @click="savePlan" class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm">Speichern</button>
                </div>
            </div>
        </div>
    </div>
</template>
