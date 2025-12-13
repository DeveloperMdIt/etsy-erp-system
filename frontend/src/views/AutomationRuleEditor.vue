<template>
  <div class="h-full flex flex-col bg-slate-50 relative">
     <div class="absolute top-0 left-0 w-full h-48 bg-sidebar-bg z-0"></div>

    <!-- Header -->
    <div class="relative z-10 px-8 pt-8 pb-4">
       <div class="mb-4">
             <router-link to="/settings/automation" class="inline-flex items-center text-indigo-100 hover:text-white transition-colors">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                Zurück zur Liste
            </router-link>
       </div>

      <div class="flex justify-between items-center">
        <div>
           <h1 class="text-3xl font-bold text-white tracking-tight">{{ isEdit ? 'Regel bearbeiten' : 'Neue Regel erstellen' }}</h1>
           <p class="text-indigo-200 mt-1">Definieren Sie Auslöser, Bedingungen und Aktionen.</p>
        </div>
        <div class="flex space-x-3">
             <button @click="saveRule" :disabled="saving" class="btn-success flex items-center shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50">
                <span v-if="saving">Speichere...</span>
                <span v-else class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    Speichern
                </span>
            </button>
        </div>
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 px-8 pb-8 relative z-10 overflow-y-auto">
        <div class="max-w-4xl mx-auto space-y-6">

            <!-- Basic Info -->
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Basisdaten</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Bezeichnung der Regel</label>
                        <input v-model="rule.name" type="text" class="input-field w-full rounded-md border-gray-300" placeholder="z.B. Rechnung bei Zahlung senden">
                    </div>
                    <div>
                         <label class="block text-sm font-medium text-gray-700 mb-2">Aktiv</label>
                         <div class="flex items-center mt-2">
                            <input v-model="rule.isActive" type="checkbox" class="h-5 w-5 text-inventivy-blue focus:ring-inventivy-blue border-gray-300 rounded">
                            <span class="ml-2 text-sm text-gray-600">Regel ist aktiv</span>
                         </div>
                    </div>
                </div>
            </div>

            <!-- Trigger -->
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                 <h3 class="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Auslöser</h3>
                 <p class="text-sm text-gray-500 mb-4">Wann soll diese Regel ausgeführt werden?</p>
                 
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div v-for="trigger in availableTriggers" :key="trigger.value" 
                          @click="rule.trigger = trigger.value"
                          class="cursor-pointer border-2 rounded-lg p-4 transition-all"
                          :class="rule.trigger === trigger.value ? 'border-inventivy-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                         <div class="flex items-center">
                             <div class="h-4 w-4 rounded-full border flex items-center justify-center mr-3"
                                  :class="rule.trigger === trigger.value ? 'border-inventivy-blue bg-inventivy-blue' : 'border-gray-400'">
                                  <div v-if="rule.trigger === trigger.value" class="h-2 w-2 rounded-full bg-white"></div>
                             </div>
                             <span class="font-medium" :class="rule.trigger === trigger.value ? 'text-inventivy-blue' : 'text-gray-700'">{{ trigger.label }}</span>
                         </div>
                     </div>
                 </div>
            </div>

            <!-- Conditions -->
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                 <div class="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 class="text-lg font-semibold text-gray-900">Bedingungen (Optional)</h3>
                    <button @click="addCondition" class="text-sm text-inventivy-blue hover:text-blue-700 font-medium flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        Bedingung hinzufügen
                    </button>
                 </div>
                 
                 <div v-if="rule.conditions.length === 0" class="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                     Diese Regel wird immer ausgeführt, wenn der Auslöser feuert.
                 </div>

                 <div v-else class="space-y-3">
                     <div v-for="(cond, idx) in rule.conditions" :key="idx" class="flex items-center space-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                         <select v-model="cond.field" class="text-sm border-gray-300 rounded-md shadow-sm focus:ring-inventivy-blue focus:border-inventivy-blue">
                             <option value="totalPrice">Gesamtsumme</option>
                             <option value="customer.country">Lieferland</option>
                             <option value="status">Bestellstatus</option>
                             <option value="items.length">Anzahl Artikel</option>
                         </select>
                         
                         <select v-model="cond.operator" class="text-sm border-gray-300 rounded-md shadow-sm focus:ring-inventivy-blue focus:border-inventivy-blue w-32">
                             <option value="equals">gleich (=)</option>
                             <option value="gt">größer als (>)</option>
                             <option value="lt">kleiner als (<)</option>
                             <option value="contains">enthält</option>
                         </select>

                         <input v-model="cond.value" type="text" class="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-inventivy-blue focus:border-inventivy-blue" placeholder="Wert...">

                         <button @click="removeCondition(idx)" class="text-gray-400 hover:text-red-500">
                             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                     </div>
                 </div>
            </div>

            <!-- Actions -->
            <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                 <div class="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 class="text-lg font-semibold text-gray-900">Aktionen</h3>
                    <button @click="addAction" class="text-sm text-inventivy-blue hover:text-blue-700 font-medium flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                        Aktion hinzufügen
                    </button>
                 </div>

                 <div v-if="rule.actions.length === 0" class="text-center py-8 text-red-500 text-sm bg-red-50 rounded-lg border border-dashed border-red-300">
                     Bitte fügen Sie mindestens eine Aktion hinzu.
                 </div>

                 <div v-else class="space-y-4">
                      <div v-for="(action, idx) in rule.actions" :key="idx" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div class="flex justify-between items-start mb-3">
                              <select v-model="action.type" class="font-medium text-sm border-gray-300 rounded-md shadow-sm focus:ring-inventivy-blue focus:border-inventivy-blue bg-white">
                                 <option value="SEND_EMAIL">E-Mail senden</option>
                                 <option value="GENERATE_INVOICE">Rechnung erstellen</option>
                                 <option value="ADD_TAG">Tag hinzufügen</option>
                              </select>
                              <button @click="removeAction(idx)" class="text-gray-400 hover:text-red-500">
                                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                          </div>

                          <!-- Action Params: Send Email -->
                          <div v-if="action.type === 'SEND_EMAIL'" class="space-y-3 pl-4 border-l-2 border-indigo-200">
                               <div>
                                   <label class="block text-xs font-medium text-gray-500 uppercase">Betreff</label>
                                   <input v-model="action.params.subject" type="text" class="mt-1 block w-full text-sm border-gray-300 rounded-md" placeholder="Betreff der E-Mail">
                               </div>
                               <div>
                                   <label class="block text-xs font-medium text-gray-500 uppercase">Nachricht</label>
                                   <textarea v-model="action.params.body" rows="3" class="mt-1 block w-full text-sm border-gray-300 rounded-md" placeholder="Hallo {Firstname}, ..."></textarea>
                               </div>
                          </div>

                          <!-- Action Params: Generate Invoice -->
                           <div v-if="action.type === 'GENERATE_INVOICE'" class="pl-4 border-l-2 border-indigo-200 text-sm text-gray-600">
                               Erstellt automatisch eine Rechnung (PDF) und speichert sie zur Bestellung.
                           </div>

                             <!-- Action Params: Add Tag -->
                           <div v-if="action.type === 'ADD_TAG'" class="pl-4 border-l-2 border-indigo-200">
                                <label class="block text-xs font-medium text-gray-500 uppercase">Tag Name</label>
                                <input v-model="action.params.tagName" type="text" class="mt-1 block w-full text-sm border-gray-300 rounded-md" placeholder="z.B. VIP, Review-Needed">
                           </div>

                      </div>
                 </div>
            </div>

        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => route.params.id && route.params.id !== 'new');
const saving = ref(false);

const availableTriggers = [
    { value: 'ORDER_IMPORTED', label: 'Bestellung importiert (Etsy/CSV)' },
    { value: 'ORDER_PAID', label: 'Bestellung als bezahlt markiert' },
    { value: 'ORDER_SHIPPED', label: 'Bestellung als versendet markiert' },
];

const rule = ref({
    name: '',
    isActive: true,
    trigger: 'ORDER_IMPORTED',
    conditions: [] as any[],
    actions: [] as any[],
    priority: 0
});

const loadRule = async () => {
    if(!isEdit.value) return;
    try {
        const res = await axios.get('/api/automation/rules'); // Ideally get by ID, but list is small
        const found = res.data.find((r: any) => r.id === route.params.id);
        if(found) {
            rule.value = {
                ...found,
                conditions: JSON.parse(found.conditions || '[]'),
                actions: JSON.parse(found.actions || '[]')
            };
        }
    } catch(e) {
        console.error('Load Error', e);
    }
}

const addCondition = () => {
    rule.value.conditions.push({ field: 'totalPrice', operator: 'gt', value: '' });
}

const removeCondition = (idx: number) => {
    rule.value.conditions.splice(idx, 1);
}

const addAction = () => {
    rule.value.actions.push({ type: 'SEND_EMAIL', params: {} });
}

const removeAction = (idx: number) => {
    rule.value.actions.splice(idx, 1);
}

const saveRule = async () => {
    saving.value = true;
    try {
        if(isEdit.value) {
            await axios.put(`/api/automation/rules/${route.params.id}`, rule.value);
        } else {
            await axios.post('/api/automation/rules', rule.value);
        }
        router.push('/settings/automation');
    } catch (e) {
        alert('Fehler beim Speichern');
        console.error(e);
    } finally {
        saving.value = false;
    }
}

onMounted(() => {
    loadRule();
});
</script>
