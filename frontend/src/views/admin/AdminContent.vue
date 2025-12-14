<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const pages = ref<any[]>([])
const selectedSlug = ref('')
const currentContent = ref('')
const currentTitle = ref('')
const isPublished = ref(true)
const loading = ref(true)

const availablePages = [
    { slug: 'privacy-policy', label: 'Datenschutzerklärung' },
    { slug: 'terms', label: 'AGB' },
    { slug: 'imprint', label: 'Impressum' }, // Added Imprint
    { slug: 'dpa', label: 'AVV' }
]

const fetchPages = async () => {
    try {
        const res = await axios.get('/api/admin/content')
        pages.value = res.data
    } catch (error) {
        console.error('Fetch pages error', error)
    } finally {
        loading.value = false
    }
}

watch(selectedSlug, (newSlug) => {
    if (!newSlug) return
    const found = pages.value.find(p => p.slug === newSlug)
    if (found) {
        currentContent.value = found.content
        currentTitle.value = found.title
        isPublished.value = found.isPublished
    } else {
        // Default template or empty
        currentContent.value = ''
        currentTitle.value = availablePages.find(p => p.slug === newSlug)?.label || ''
        isPublished.value = true
    }
})

const savePage = async () => {
    if (!selectedSlug.value) return
    
    try {
        await axios.put(`/api/admin/content/${selectedSlug.value}`, {
            title: currentTitle.value,
            content: currentContent.value,
            isPublished: isPublished.value
        })
        alert('Seite gespeichert')
        fetchPages()
    } catch (error) {
        alert('Fehler beim Speichern')
    }
}

onMounted(fetchPages)
</script>

<template>
    <div class="flex h-full gap-6">
        <!-- Sidebar List -->
        <div class="w-64 bg-white shadow rounded-lg p-4 flex-shrink-0">
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Seiten</h3>
            <div class="space-y-2">
                <button 
                    v-for="page in availablePages" 
                    :key="page.slug"
                    @click="selectedSlug = page.slug"
                    class="w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    :class="selectedSlug === page.slug ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'"
                >
                    {{ page.label }}
                    <span v-if="pages.find(p => p.slug === page.slug)" class="float-right text-xs text-green-500">Edit</span>
                </button>
            </div>
        </div>

        <!-- Editor Area -->
        <div class="flex-1 bg-white shadow rounded-lg p-6 flex flex-col" v-if="selectedSlug">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ availablePages.find(p => p.slug === selectedSlug)?.label }} bearbeiten</h3>
                <div class="flex items-center space-x-3">
                     <label class="flex items-center">
                        <input v-model="isPublished" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                        <span class="ml-2 text-sm text-gray-900">Veröffentlicht</span>
                    </label>
                    <button 
                        @click="savePage"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Speichern
                    </button>
                </div>
            </div>

            <div class="mb-4">
                 <label class="block text-sm font-medium text-gray-700">Titel</label>
                 <input v-model="currentTitle" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            </div>

            <div class="flex-1 flex flex-col">
                <label class="block text-sm font-medium text-gray-700 mb-1">Inhalt (HTML/Markdown)</label>
                <textarea 
                    v-model="currentContent" 
                    class="flex-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
                    placeholder="<h1>Ihr Text hier...</h1>"
                ></textarea>
                <p class="mt-1 text-xs text-gray-500">Tipp: Du kannst HTML Tags verwenden.</p>
            </div>
        </div>
        
        <div v-else class="flex-1 bg-white shadow rounded-lg p-6 flex items-center justify-center text-gray-400">
            Wähle eine Seite aus der Liste links.
        </div>
    </div>
</template>
