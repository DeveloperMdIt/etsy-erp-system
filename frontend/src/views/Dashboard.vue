<template>
    <div class="px-4 py-6 sm:px-0">
        <div class="mb-8 flex justify-between items-center">
             <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
             <!-- Maybe a refresh button here? -->
        </div>

        <!-- 1. Stats Grid (Top) -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                                <dd class="text-lg font-medium text-gray-900">{{ (stats.revenueToday || 0).toFixed(2) }} €</dd>
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

        <!-- 2. Main Content 2-Col Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Left Column -->
            <div class="space-y-8">
                <!-- Action Items -->
                <DashboardActionItems :stats="stats" />

                <!-- Recent Orders -->
                <div class="bg-white shadow rounded-lg">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Letzte Bestellungen</h3>
                         <router-link to="/orders" class="text-sm text-indigo-600 hover:text-indigo-500">Alle anzeigen &rarr;</router-link>
                    </div>
                    <ul role="list" class="divide-y divide-gray-200">
                        <li v-for="order in recentOrders" :key="order.id" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <router-link :to="`/orders/${order.id}`" class="block">
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
                            </router-link>
                        </li>
                         <li v-if="recentOrders.length === 0" class="px-4 py-8 text-center text-gray-500">
                            Keine Bestellungen vorhanden.
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-8">
                 <!-- Setup Checklist -->
                 <DashboardSetup :setup="setupStatus" />

                 <!-- Revenue Chart -->
                 <DashboardChart :data="revenueData" />
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { 
    ShoppingBagIcon, 
    TruckIcon, 
    ArrowPathIcon,
} from '@heroicons/vue/24/outline'

// Components
import DashboardChart from '../components/dashboard/DashboardChart.vue'
import DashboardSetup from '../components/dashboard/DashboardSetup.vue'
import DashboardActionItems from '../components/dashboard/DashboardActionItems.vue'

const stats = ref({
    openOrders: 0,
    revenueToday: 0,
    productsCount: 0,
    packagesSent: 0
})

const setupStatus = ref({
    hasSettings: false,
    hasShop: false,
    hasEtsy: false,
    hasShipping: false,
    hasLayout: false
})

const recentOrders = ref<any[]>([])
const revenueData = ref<any[]>([])
const loading = ref(true)


const fetchDashboard = async () => {
    try {
        const res = await axios.get('/api/dashboard')
        // Safe assignments
        if (res.data.stats) stats.value = res.data.stats
        if (res.data.setupStatus) setupStatus.value = res.data.setupStatus
        if (res.data.recentOrders) recentOrders.value = res.data.recentOrders
        if (res.data.revenue) revenueData.value = res.data.revenue
        
    } catch (e) {
        console.error('Fetch dashboard failed', e)
    } finally {
        loading.value = false
    }
}

onMounted(fetchDashboard)
</script>
