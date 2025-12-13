<template>
    <div class="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="max-w-7xl mx-auto mb-8 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <button @click="goBack" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 class="text-3xl font-bold text-gray-900">{{ pageTitle }}</h1>
            </div>
            <div class="flex items-center gap-3">
                 <button @click="goBack" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Abbrechen
                </button>
                <button @click="save" :disabled="isSaving" class="px-4 py-2 bg-inventivy-blue text-white rounded-lg hover:bg-inventivy-dark font-medium flex items-center gap-2">
                    <svg v-if="isSaving" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Speichern</span>
                </button>
            </div>
        </div>

        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Main Editor -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Meta Info -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Vorlagen-Name</label>
                        <input v-model="form.name" type="text" class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-inventivy-blue focus:ring-inventivy-blue">
                    </div>

                    <div v-if="isEmailTemplate">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
                        <div class="relative">
                            <input ref="subjectInput" v-model="form.subject" @focus="lastFocusedInput = 'subject'" type="text" class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-inventivy-blue focus:ring-inventivy-blue">
                            <p class="text-xs text-gray-500 mt-1">Variablen wie {OrderRef} können im Betreff verwendet werden.</p>
                        </div>
                    </div>
                </div>

                <!-- Content/Body -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
                    <div class="flex items-center justify-between mb-2">
                         <label class="block text-sm font-medium text-gray-700">Inhalt</label>
                         <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">HTML unterstützt</span>
                    </div>
                    
                    <textarea 
                        ref="contentInput" 
                        v-model="form.content" 
                        @focus="lastFocusedInput = 'content'"
                        class="flex-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-inventivy-blue focus:ring-inventivy-blue font-mono text-sm"
                        placeholder="Hallo {BuyerName}, ..."
                    ></textarea>
                </div>
            </div>

            <!-- Sidebar -->
             <div class="space-y-6">
                 <!-- Test/Preview -->
                 <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-semibold text-gray-900 mb-4">Aktionen</h3>
                    <button @click="sendTestMsg" :disabled="isSendingTest" class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-3">
                         <svg v-if="isSendingTest" class="animate-spin h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Test-E-Mail senden
                    </button>
                    <!-- For debugging/dev -->
                    <div class="text-xs text-gray-400 text-center">
                        Template Type: {{ currentType }}
                    </div>
                </div>

                 <!-- Variables List -->
                 <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-semibold text-gray-900 mb-2">Platzhalter</h3>
                    <p class="text-sm text-gray-500 mb-4">Klicken zum Einfügen</p>

                    <div class="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <div 
                            v-for="v in variables" 
                            :key="v.code" 
                            @click="insertVariable(v.code)"
                            class="group p-2 rounded-lg hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition-colors"
                        >
                            <div class="flex items-center justify-between">
                                <span class="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{{ v.code }}</span>
                                <svg class="w-4 h-4 text-gray-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div class="text-xs text-gray-600 mt-1">{{ v.label }}</div>
                        </div>
                    </div>
                 </div>
             </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all transform translate-y-0"
         :class="toastType === 'success' ? 'bg-green-600' : 'bg-red-600'">
        {{ toastMessage }}
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TemplateService, TEMPLATE_VARIABLES } from '../services/template.service';

const route = useRoute();
const router = useRouter();

const currentType = computed(() => route.params.type as string);
const isEmailTemplate = computed(() => currentType.value.startsWith('EMAIL_'));
const isSendingTest = ref(false);
const isSaving = ref(false);

const sendTestMsg = async () => {
    if (isSendingTest.value) return;
    isSendingTest.value = true;
    try {
        await TemplateService.sendTestEmail({
             type: currentType.value,
             subject: form.value.subject,
             content: form.value.content
        });
        triggerToast('Test-E-Mail gesendet (siehe Backend-Console)', 'success');
    } catch (e) {
         triggerToast('Fehler beim Senden', 'error');
         console.error(e);
    } finally {
        isSendingTest.value = false;
    }
};

const variables = TEMPLATE_VARIABLES;

const form = ref({
    id: '',
    name: '',
    subject: '',
    content: ''
});

// Track which input was last focused so we insert variables there
const lastFocusedInput = ref<'subject' | 'content'>('content');
const contentInput = ref<HTMLTextAreaElement | null>(null);
const subjectInput = ref<HTMLInputElement | null>(null);

const pageTitle = computed(() => {
    switch (currentType.value) {
        case 'EMAIL_ORDER_CONFIRMATION': return 'Bestellbestätigung bearbeiten';
        case 'EMAIL_SHIPPING_CONFIRMATION': return 'Versandbestätigung bearbeiten';
        case 'EMAIL_PAYMENT_RECEIVED': return 'Zahlungseingang bearbeiten';
        case 'EMAIL_INVOICE_SEND': return 'Rechnung versenden bearbeiten';
        case 'DOC_INVOICE': return 'Rechnungsvorlage bearbeiten';
        case 'DOC_DELIVERY_NOTE': return 'Lieferscheinvorlage bearbeiten';
        default: return 'Vorlage bearbeiten';
    }
});

// Default contents if new
const defaults: Record<string, any> = {
    'EMAIL_ORDER_CONFIRMATION': {
        name: 'Auftragsbestätigung per Email senden',
        subject: 'Auftragsbestätigung für die Bestellung {OrderRef}',
        content: `Hallo {BuyerName},

anbei senden wir die Auftragsbestätigung {InvoiceNumber} zur Bestellung {OrderRef} bei {ShopName} als PDF Datei.

Viele Grüße`
    },
    'EMAIL_SHIPPING_CONFIRMATION': {
        name: 'Versandbestätigung',
        subject: 'Deine Bestellung {OrderRef} wurde versandt!',
        content: `Hallo {BuyerName},

gute Nachrichten! Deine Bestellung {OrderRef} wurde heute an dich versandt.

Du kannst die Sendung hier verfolgen: {TrackingUrl}

Viele Grüße,
Dein {ShopName} Team`
    }
};

onMounted(async () => {
    try {
        const type = currentType.value;
        const existing = await TemplateService.getByType(type);
        
        if (existing) {
            form.value = { ...existing };
        } else {
            // Load default if available, else empty
            const def = defaults[type] || {};
            form.value.name = def.name || type;
            form.value.subject = def.subject || '';
            form.value.content = def.content || '';
        }
    } catch (e: any) {
        // Ignore 404 (just means new template)
        if (e.response && e.response.status === 404) {
             const type = currentType.value;
             const def = defaults[type] || {};
             form.value.name = def.name || type;
             form.value.subject = def.subject || '';
             form.value.content = def.content || '';
             return;
        }
        console.error("Failed to load template", e);
    }
});

const insertVariable = (variable: string) => {
    if (lastFocusedInput.value === 'content' && contentInput.value) {
        // Insert into textarea at cursor
        const el = contentInput.value;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = form.value.content;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        
        form.value.content = before + variable + after;
        
        // Restore cursor and focus
        setTimeout(() => {
            el.focus();
            el.selectionStart = el.selectionEnd = start + variable.length;
        }, 0);

    } else if (lastFocusedInput.value === 'subject' && subjectInput.value && isEmailTemplate.value) {
        // Insert into subject input
         const el = subjectInput.value;
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const text = form.value.subject;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        
        form.value.subject = before + variable + after;
        
        setTimeout(() => {
            el.focus();
            el.selectionStart = el.selectionEnd = start + variable.length;
        }, 0);
    }
};

const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    toastMessage.value = msg;
    toastType.value = type;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 3000);
}

const save = async () => {
    isSaving.value = true;
    try {
        await TemplateService.saveTemplate({
            type: currentType.value,
            ...form.value
        });
        triggerToast('Erfolgreich gespeichert', 'success');
    } catch (e) {
        triggerToast('Fehler beim Speichern', 'error');
        console.error(e);
    } finally {
        isSaving.value = false;
    }
};

const goBack = () => {
    router.back();
};

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
