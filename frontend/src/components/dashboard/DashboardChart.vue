<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Umsatz 30 Tage (€)</h3>
        <span class="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded">Summe: {{ totalRevenue.toFixed(2) }} €</span>
    </div>

    <!-- Simple SVG Bar Chart -->
    <div class="h-64 w-full flex items-end space-x-1">
        <div v-for="(day, index) in data" :key="index" class="flex-1 flex flex-col items-center group relative">
            
            <!-- Tooltip -->
             <div class="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-black text-white text-xs rounded py-1 px-2 pointer-events-none z-10 whitespace-nowrap">
                {{ day.date }}: {{ day.amount.toFixed(2) }} €
            </div>

            <!-- Bar -->
            <div 
                class="w-full bg-green-200 hover:bg-green-400 transition-all rounded-t"
                :style="{ height: `${(day.amount / maxAmount) * 100}%`, minHeight: '4px' }"
            ></div>
            
            <!-- X-Axis Label (every 5 days) -->
            <span v-if="index % 5 === 0" class="text-[10px] text-gray-400 mt-1">{{ formatDate(day.date) }}</span>
        </div>
    </div>
     <div class="border-t border-gray-100 mt-2 w-full"></div>
     <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>0 €</span>
        <span>{{ maxAmount.toFixed(0) }} €</span>
     </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: { date: string, amount: number }[]
}>()

const maxAmount = computed(() => {
    if (props.data.length === 0) return 100
    const max = Math.max(...props.data.map(d => d.amount))
    return max > 0 ? max : 100
})

const totalRevenue = computed(() => {
    return props.data.reduce((sum, d) => sum + d.amount, 0)
})

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getDate()}.${d.getMonth()+1}.`
}
</script>
