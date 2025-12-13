<template>
  <div class="h-full flex flex-col bg-slate-50 relative">
    
    <!-- Background Design -->
     <div class="absolute top-0 left-0 w-full h-48 bg-sidebar-bg z-0"></div>

    <!-- Header -->
    <div class="relative z-10 px-8 pt-8 pb-4">
        <!-- Breadcrumb / Back Link -->
       <div class="mb-4">
             <router-link to="/settings" class="inline-flex items-center text-indigo-100 hover:text-white transition-colors">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                Zurück zur Übersicht
            </router-link>
       </div>

      <div class="flex justify-between items-center">
        <div>
           <h1 class="text-3xl font-bold text-white tracking-tight">Automatisierung</h1>
           <p class="text-indigo-200 mt-1">Regeln für automatische Abläufe erstellen und verwalten.</p>
        </div>
        <button @click="$router.push('/settings/automation/new')" class="btn-success flex items-center shadow-lg transform hover:-translate-y-0.5 transition-all">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Neue Regel
        </button>
      </div>
    </div>

    <!-- Content Card -->
    <div class="flex-1 px-8 pb-8 relative z-10">
        <div class="bg-white rounded-xl shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
             
             <!-- Filter Bar -->
             <div class="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
                 <div class="relative w-64">
                    <input type="text" placeholder="Regeln suchen..." class="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm w-full focus:ring-inventivy-blue focus:border-inventivy-blue">
                    <svg class="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <div class="text-sm text-gray-500">
                     {{ rules.length }} Regeln aktiv
                 </div>
             </div>

            <!-- List -->
            <div class="flex-1 overflow-y-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Aktiv</th>
                            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Name</th>
                            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Auslöser</th>
                            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Aktionen</th>
                            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Optionen</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="rules.length === 0" class="hover:bg-slate-50">
                             <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                                 <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                 Noch keine Regeln erstellt.
                             </td>
                        </tr>
                        <tr v-for="rule in rules" :key="rule.id" class="hover:bg-indigo-50/30 transition-colors group">
                           <td class="px-6 py-4 whitespace-nowrap">
                               <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input type="checkbox" :name="'toggle-' + rule.id" :id="'toggle-' + rule.id" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-inventivy-blue transition-all duration-300" v-model="rule.isActive"/>
                                    <label :for="'toggle-' + rule.id" class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-200 cursor-pointer checked:bg-inventivy-blue"></label>
                               </div>
                           </td>
                           <td class="px-6 py-4">
                               <div class="text-sm font-medium text-slate-800">{{ rule.name }}</div>
                           </td>
                           <td class="px-6 py-4 text-sm text-slate-600">
                               <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                 {{ formatTrigger(rule.trigger) }}
                               </span>
                           </td>
                           <td class="px-6 py-4 text-sm text-slate-600">
                               {{ rule.actions.length }} Aktion(en)
                           </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button @click="$router.push(`/settings/automation/${rule.id}`)" class="text-indigo-600 hover:text-indigo-900 mx-2">Bearbeiten</button>
                                <button @click="deleteRule(rule.id)" class="text-red-500 hover:text-red-700 mx-2">Löschen</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface AutomationRule {
    id: string;
    name: string;
    isActive: boolean;
    trigger: string;
    conditions: any[];
    actions: any[];
}

const rules = ref<AutomationRule[]>([]);

const formatTrigger = (trigger: string) => {
    const map: Record<string, string> = {
        'ORDER_IMPORTED': 'Bestellung importiert',
        'ORDER_PAID': 'Bestellung bezahlt',
        'ORDER_SHIPPED': 'Bestellung versendet',
        'ORDER_CREATED': 'Bestellung erstellt'
    };
    return map[trigger] || trigger;
};

const fetchRules = async () => {
    try {
        const res = await axios.get('/api/automation/rules');
        rules.value = res.data.map((r: any) => ({
             ...r,
             conditions: JSON.parse(r.conditions),
             actions: JSON.parse(r.actions)
        }));
    } catch (e) {
        console.error('Failed to fetch rules', e);
    }
}

const deleteRule = async (id: string) => {
    if(!confirm('Regel wirklich löschen?')) return;
    try {
         await axios.delete(`/api/automation/rules/${id}`);
         rules.value = rules.value.filter(r => r.id !== id);
    } catch(e) {
        console.error('Delete failed', e);
    }
}

onMounted(() => {
    fetchRules();
});
</script>

<style scoped>
.toggle-checkbox:checked {
  right: 0;
  border-color: #2563EB;
}
.toggle-checkbox:checked + .toggle-label {
  background-color: #2563EB;
}
.toggle-checkbox {
    right: auto;
    left: 0;
    transition: all 0.3s ease-in-out;
}
</style>
