<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const stats = ref([
    { name: 'Kunden gesamt', value: '0', change: '+0%', changeType: 'neutral' },
    { name: 'Module aktiv', value: '0', change: '', changeType: 'neutral' },
    { name: 'Umsatz (Monat)', value: '€0,00', change: '+0%', changeType: 'increase' }, // Fake for now
    { name: 'Status', value: 'Online', change: '', changeType: 'increase' }
])

const loading = ref(true)

onMounted(async () => {
    try {
        const usersRes = await axios.get('/api/admin/users')
        const users = usersRes.data
        
        stats.value[0].value = users.length.toString()
        const newUsers = users.filter((u: any) => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
        stats.value[0].change = `+${newUsers} letzte 7 Tage`
        stats.value[0].changeType = newUsers > 0 ? 'increase' : 'neutral'

        const modulesRes = await axios.get('/api/admin/modules')
        const activeModules = modulesRes.data.filter((m: any) => m.isActive).length
        stats.value[1].value = activeModules.toString()

    } catch (error) {
        console.error('Dashboard Stats Error:', error)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-5">System Übersicht</h3>
        
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="item in stats" :key="item.name" class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">{{ item.name }}</dt>
                                <dd>
                                    <div class="text-lg font-medium text-gray-900">{{ item.value }}</div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-5 py-3">
                    <div class="text-sm">
                        <span 
                            v-if="item.change"
                            class="font-medium" 
                            :class="{
                                'text-green-600': item.changeType === 'increase',
                                'text-red-600': item.changeType === 'decrease',
                                'text-gray-500': item.changeType === 'neutral',
                            }"
                        >
                            {{ item.change }}
                        </span>
                        <span v-else class="text-gray-500">System läuft</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-8 bg-white shadow rounded-lg p-6">
            <h4 class="text-base font-medium text-gray-900 mb-4">Schnellzugriff</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <router-link to="/admin/modules" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                    <span class="block text-sm font-medium text-gray-900">Module bearbeiten</span>
                    <span class="block text-xs text-gray-500 mt-1">Preise & Sichtbarkeit</span>
                </router-link>
                <router-link to="/admin/content" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                    <span class="block text-sm font-medium text-gray-900">Rechtstexte</span>
                    <span class="block text-xs text-gray-500 mt-1">AGB & Datenschutz</span>
                </router-link>
                <router-link to="/admin/settings" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                    <span class="block text-sm font-medium text-gray-900">API Keys</span>
                    <span class="block text-xs text-gray-500 mt-1">Global Config</span>
                </router-link>
            </div>
        </div>
    </div>
</template>
