<template>
    <div class="px-4 py-6 sm:px-0">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <!-- Onboarding Alerts -->
        <div v-if="setupStep === 'SUBSCRIPTION'" class="mb-8 bg-blue-50 border-1-4 border-blue-400 p-4 rounded-md shadow-sm">
            <div class="flex">
                <div class="flex-shrink-0">
                     <ExclamationTriangleIcon class="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">Willkommen bei Inventivy!</h3>
                    <div class="mt-2 text-sm text-blue-700">
                        <p class="mb-2">Um zu starten, wählen Sie bitte zuerst Ihr gewünschtes Paket aus.</p>
                        <router-link to="/subscription" class="font-bold underline hover:text-blue-600">
                            Jetzt Paket wählen &rarr;
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="setupStep === 'connect_channel'" class="mb-8 bg-amber-50 border-1-4 border-amber-400 p-4 rounded-md shadow-sm">
            <div class="flex">
                <div class="flex-shrink-0">
                     <PlusCircleIcon class="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-amber-800">Verbinden Sie Ihren ersten Shop</h3>
                    <div class="mt-2 text-sm text-amber-700">
                        <p class="mb-2">Es wurden noch keine Produkte gefunden. Verbinden Sie Etsy, um Produkte zu importieren.</p>
                        <router-link to="/settings/channels" class="font-bold underline hover:text-amber-600">
                            Etsy verbinden &rarr;
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <!-- Cards unchanged -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <ShoppingBagIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Offene Bestellungen</dt>
                                <dd class="text-lg font-medium text-gray-900">{{ stats.openOrders }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <span class="text-gray-400 text-2xl">€</span>
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Umsatz heute</dt>
                                <dd class="text-lg font-medium text-gray-900">{{ stats.revenueToday.toFixed(2) }} €</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                         <div class="flex-shrink-0">
                            <ArrowPathIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Produkte</dt>
                                <dd class="text-lg font-medium text-gray-900">{{ stats.productsCount }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

             <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-5">
                    <div class="flex items-center">
                         <div class="flex-shrink-0">
                            <TruckIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
                        </div>
                        <div class="ml-5 w-0 flex-1">
                            <dl>
                                <dt class="text-sm font-medium text-gray-500 truncate">Pakete versendet</dt>
                                <dd class="text-lg font-medium text-gray-900">{{ stats.packagesSent }}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Letzte Bestellungen</h3>
            </div>
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="order in recentOrders" :key="order.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div class="flex items-center justify-between">
                         <p class="text-sm font-medium text-indigo-600 truncate">{{ order.orderNumber }}</p>
                         <div class="ml-2 flex-shrink-0 flex">
                            <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {{ order.status }}
                            </p>
                         </div>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                        <div class="sm:flex">
                            <p class="flex items-center text-sm text-gray-500">
                                {{ order.customer?.firstName }} {{ order.customer?.lastName }}
                            </p>
                        </div>
                         <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                                {{ new Date(order.createdAt).toLocaleDateString() }}
                            </p>
                        </div>
                    </div>
                </li>
                 <li v-if="recentOrders.length === 0" class="px-4 py-8 text-center text-gray-500">
                    Keine Bestellungen vorhanden.
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { 
    ShoppingBagIcon, 
    TruckIcon, 
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    PlusCircleIcon
} from '@heroicons/vue/24/outline'

const stats = ref({
    openOrders: 0,
    revenueToday: 0,
    productsCount: 0,
    packagesSent: 0
})

const recentOrders = ref([])
const modules = ref<string[]>([])
const loading = ref(true)

// Onboarding State
const setupStep = computed(() => {
    // 1. Subscription/Modules
    if (modules.value.length === 0) return 'SUBSCRIPTION'
    
    // 2. Etsy Connection (assuming we check if products/orders exist or key setting)
    // For now, simpler check: if no products, suggest connecting channel
    if (stats.value.productsCount === 0) return 'connect_channel'
    
    return 'DONE'
})

const fetchDashboard = async () => {
    try {
        const res = await axios.get('/api/dashboard')
        stats.value = res.data.stats
        recentOrders.value = res.data.recentOrders
        
        // Modules check
        const userStr = localStorage.getItem('user')
        if (userStr) {
            const user = JSON.parse(userStr)
            modules.value = user.modules || [] // Note: user object might need refresh
        }
        
    } catch (e) {
        console.error('Fetch dashboard failed', e)
    } finally {
        loading.value = false
    }
}

onMounted(fetchDashboard)
</script>
