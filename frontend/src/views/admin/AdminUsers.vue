<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref<any[]>([])
const loading = ref(true)

const fetchUsers = async () => {
    try {
        const res = await axios.get('/api/admin/users')
        users.value = res.data
    } catch (error) {
        console.error('Failed to fetch users', error)
    } finally {
        loading.value = false
    }
}

const toggleBlock = async (user: any) => {
    if (!confirm(`Soll der Nutzer ${user.email} wirklich ${user.isBlocked ? 'entsperrt' : 'gesperrt'} werden?`)) return
    
    try {
        await axios.post(`/api/admin/users/${user.id}/block`, { isBlocked: !user.isBlocked })
        await fetchUsers()
    } catch (error) {
        alert('Fehler beim Ändern des Status')
    }
}

onMounted(fetchUsers)
</script>

<template>
    <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Kundenliste</h3>
        </div>
        
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kunde</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bestellungen</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in users" :key="user.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                                <div class="ml-0">
                                    <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900">{{ user.shopName || '-' }}</div>
                            <div class="text-xs text-gray-500">ID: {{ user.id.substring(0,8) }}...</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {{ user.orderCount }} Orders
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span 
                                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                :class="user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                            >
                                {{ user.isBlocked ? 'Gesperrt' : 'Aktiv' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                                @click="toggleBlock(user)"
                                class="text-indigo-600 hover:text-indigo-900"
                            >
                                {{ user.isBlocked ? 'Entsperren' : 'Sperren' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
