<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

const modules = ref<any[]>([])
const isModalOpen = ref(false)
const editingModule = ref<any>(null)
const formData = ref({
    key: '',
    name: '',
    description: '',
    price: 0,
    isActive: true,
    isPlanned: false,
    category: 'Auftragsabwicklung'
})

const fetchModules = async () => {
    try {
        const res = await axios.get('/api/admin/modules')
        modules.value = res.data
    } catch (error) {
        console.error('Fetch modules error', error)
    }
}

const openModal = (module: any = null) => {
    if (module) {
        editingModule.value = module
        formData.value = { ...module }
    } else {
        editingModule.value = null
        formData.value = { key: '', name: '', description: '', price: 0, isActive: true, isPlanned: false, category: 'Auftragsabwicklung' }
    }
    isModalOpen.value = true
}

const saveModule = async () => {
    try {
        if (editingModule.value) {
            await axios.put(`/api/admin/modules/${editingModule.value.id}`, formData.value)
        } else {
            await axios.post('/api/admin/modules', formData.value)
        }
        isModalOpen.value = false
        fetchModules()
    } catch (error) {
        alert('Fehler beim Speichern')
    }
}

const deleteModule = async (id: string) => {
    if (!confirm('Modul wirklich löschen?')) return
    try {
        await axios.delete(`/api/admin/modules/${id}`)
        fetchModules()
    } catch (error) {
        alert('Fehler beim Löschen')
    }
}

onMounted(fetchModules)
</script>

<template>
    <div>
        <div class="sm:flex sm:items-center sm:justify-between mb-6">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">Module & Features</h3>
                <p class="mt-1 text-sm text-gray-500">Verwalte Preise und Sichtbarkeit der Module auf der Landing Page.</p>
            </div>
            <div class="mt-4 sm:mt-0">
                <button 
                    @click="openModal()"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <PlusIcon class="-ml-1 mr-2 h-5 w-5" />
                    Neues Modul
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div 
                v-for="module in modules" 
                :key="module.id" 
                class="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
                :class="{ 'opacity-75 border-dashed': !module.isActive }"
            >
                <div class="px-4 py-5 sm:p-6">
                    <div class="flex justify-between items-start">
                        <h4 class="text-lg font-medium text-gray-900">{{ module.name }}</h4>
                        <span v-if="module.isPlanned" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Geplant</span>
                        <span v-else-if="!module.isActive" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inaktiv</span>
                        <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>
                    </div>
                    <div class="mt-2 text-sm text-gray-500 min-h-[40px]">{{ module.description }}</div>
                    <div class="mt-4 flex items-baseline">
                        <span class="text-2xl font-semibold text-gray-900">{{ module.price > 0 ? module.price.toFixed(2) + ' €' : 'Kostenlos' }}</span>
                        <span class="ml-1 text-sm text-gray-500">/ Monat</span>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                        <button @click="openModal(module)" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center">
                            <PencilIcon class="h-4 w-4 mr-1" /> Bearbeiten
                        </button>
                        <button @click="deleteModule(module.id)" class="text-red-600 hover:text-red-900 text-sm font-medium flex items-center">
                            <TrashIcon class="h-4 w-4 mr-1" /> Löschen
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">{{ editingModule ? 'Modul bearbeiten' : 'Neues Modul' }}</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Key (Intern)</label>
                        <input v-model="formData.key" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" :disabled="!!editingModule">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input v-model="formData.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-700">Kategorie</label>
                        <select v-model="formData.category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                            <option>Auftragsabwicklung</option>
                            <option>Artikelverwaltung</option>
                            <option>Automatisierung</option>
                            <option>Finanzen & Buchhaltung</option>
                            <option>Sonstiges</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Beschreibung</label>
                        <textarea v-model="formData.description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Preis (€)</label>
                        <input v-model.number="formData.price" type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                    </div>
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center">
                            <input v-model="formData.isActive" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-900">Aktiv (Buchbar/Sichtbar)</span>
                        </label>
                        <label class="flex items-center">
                            <input v-model="formData.isPlanned" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-900">Geplant (Coming Soon)</span>
                        </label>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button @click="isModalOpen = false" class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Abbrechen</button>
                    <button @click="saveModule" class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm">Speichern</button>
                </div>
            </div>
        </div>
    </div>
</template>
