<template>
  <div v-if="loading" class="flex justify-center items-center h-64">
     <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>

  <div v-else class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">Dashboard</h2>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        
        <!-- Left Column -->
        <div class="space-y-6">
            <DashboardActions :stats="dashboardData.stats" />
            <DashboardErrors :errors="dashboardData.recentErrors" />
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
             <DashboardSetup :setup="dashboardData.setupStatus" />
             <DashboardChart :data="dashboardData.revenue" />
        </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useNotifications } from '../composables/useNotifications';

import DashboardActions from '../components/dashboard/DashboardActions.vue';
import DashboardSetup from '../components/dashboard/DashboardSetup.vue';
import DashboardChart from '../components/dashboard/DashboardChart.vue';
import DashboardErrors from '../components/dashboard/DashboardErrors.vue';

const { showError } = useNotifications();
const loading = ref(true);
const dashboardData = ref({
    setupStatus: {
        hasSettings: false,
        hasShop: false,
        hasEtsy: false,
        hasShipping: false,
        hasLayout: false
    },
    stats: {
        openOrders: 0,
        totalOrders: 0
    },
    revenue: [] as { date: string, amount: number }[],
    recentErrors: [] as any[]
});

const fetchDashboardData = async () => {
    try {
        const response = await axios.get('/api/dashboard');
        dashboardData.value = response.data;
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showError('Dashboard-Daten konnten nicht geladen werden.');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchDashboardData();
});
</script>
