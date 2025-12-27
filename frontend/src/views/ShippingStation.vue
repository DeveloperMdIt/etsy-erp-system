<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { TruckIcon, PrinterIcon, QrCodeIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'; // Using QrCodeIcon as standin for Barcode

interface OrderItem {
    id: number;
    title: string;
    quantity: number;
    sku?: string;
}

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
    status: string;
    trackingCode?: string;
    shippingProvider?: string;
}

const scanInput = ref('');
const scanInputRef = ref<HTMLInputElement | null>(null);
const currentOrder = ref<Order | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const focusInput = () => {
    nextTick(() => {
        scanInputRef.value?.focus();
    });
};

onMounted(() => focusInput());

const handleScan = async () => {
    const term = scanInput.value.trim();
    if (!term) return;
    
    // Clear previous state
    currentOrder.value = null;
    error.value = null;
    successMessage.value = null;
    loading.value = true;

    try {
        // Search for order by ID or Receipt ID
        // Note: We need an endpoint that searches by ReceiptID specifically? 
        // Or we use the general orders list with filter?
        // Let's assume we can GET /api/orders/{id} or search.
        // For now, let's try to fetch all orders filtering by this ID (inefficient but works for prototype)
        // Better: GET /api/orders/search?q={term} 
        
        // Let's use the existing list endpoint with search?
        // Actually, scan input matches 'receipt_id' mostly.
        const res = await axios.get(`/api/orders?search=${term}`);
        
        // Find exact match or first result?
        const found = res.data.orders?.find((o:any) => o.orderNumber === term || o.id === term);

        if (found) {
            // Fetch full details if needed (items might be missing in list view?)
            // Assuming list view returns enough.
            currentOrder.value = mapOrder(found);
            // Play success sound?
        } else {
            error.value = `Keine Bestellung gefunden für "${term}"`;
            // Play error sound?
        }

        scanInput.value = ''; // Reset input for next scan (or keep it?)
        // Usually reset for next scan, but if we found an order, we might want to keep focus on actions?
        // "Scan-to-Ship" usually implies: Scan -> Show -> Actions -> Scan Label -> Done.

    } catch (e: any) {
        error.value = e.message;
    } finally {
        loading.value = false;
        // Keep focus?
        // focusInput(); // If we want rapid scanning
    }
};

const mapOrder = (apiOrder: any): Order => {
    return {
        id: apiOrder.id,
        orderNumber: apiOrder.orderNumber,
        customerName: apiOrder.customerName || 'Unbekannt',
        items: apiOrder.items || [], // Items usually included in our API
        status: apiOrder.status,
        trackingCode: apiOrder.trackingCode,
        shippingProvider: apiOrder.shippingProvider
    };
};

const createLabel = async () => {
    if(!currentOrder.value) return;
    loading.value = true;
    try {
        // Use Label Service (implemented previously)
        // POST /api/labels/create
        // We'll need a default provider?
        
        // For now, just simulate or call specific endpoint
        // Assuming we have a configured provider.
        // const res = await axios.post('/api/labels/preview', { ... }); 
        
        // For MVP: Just mark as shipped manually or assume label creation logic exists.
        // Let's implement the "Mark Shipped" logic first as "Billbee-LIke" manual path.
        alert("Label-Druck wird implementiert... (Nutze 'Als versendet markieren')");

    } catch (e: any) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

const markShipped = async () => {
    if(!currentOrder.value) return;
    const code = prompt("Tracking Code eingeben (oder leer lassen für ohne):");
    if (code === null) return; // Cancelled

    loading.value = true;
    try {
        await axios.post(`/api/orders/${currentOrder.value.orderNumber}/tracking`, {
            trackingCode: code,
            carrier: 'DHL' // Default or dynamic
        });
        successMessage.value = `Bestellung ${currentOrder.value.orderNumber} als versendet markiert!`;
        currentOrder.value = null; // Clear
        focusInput();
    } catch (e: any) {
         error.value = "Fehler: " + (e.response?.data?.error || e.message);
    } finally {
        loading.value = false;
    }
};

</script>

<template>
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Versandstation</h1>
        <p class="text-gray-500 mt-2">Scanne eine Bestellnummer, um den Versand zu starten.</p>
    </div>

    <!-- Scanner Input -->
    <div class="relative rounded-md shadow-sm max-w-lg mx-auto mb-10">
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <QrCodeIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
            ref="scanInputRef"
            type="text"
            v-model="scanInput"
            @keyup.enter="handleScan"
            class="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg py-4"
            placeholder="Bestellnummer scannen (Enter)..."
            :disabled="loading"
        />
        <div v-if="loading" class="absolute inset-y-0 right-0 flex items-center pr-3">
             <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    </div>

    <!-- Feedback Messages -->
    <div v-if="error" class="rounded-md bg-red-50 p-4 mb-6">
        <div class="flex">
            <div class="flex-shrink-0">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Fehler</h3>
                <div class="mt-2 text-sm text-red-700">
                    <p>{{ error }}</p>
                </div>
            </div>
        </div>
    </div>

    <div v-if="successMessage" class="rounded-md bg-green-50 p-4 mb-6">
        <div class="flex">
            <div class="flex-shrink-0">
                <CheckCircleIcon class="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Erledigt</h3>
                <div class="mt-2 text-sm text-green-700">
                    <p>{{ successMessage }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- ORder Details Card -->
    <div v-if="currentOrder" class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">Bestellung #{{ currentOrder.orderNumber }}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ currentOrder.customerName }}</p>
            </div>
            <div class="flex space-x-2">
                 <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="currentOrder.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                 >
                    {{ currentOrder.status }}
                </span>
            </div>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl class="sm:divide-y sm:divide-gray-200">
                <!-- Items List -->
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt class="text-sm font-medium text-gray-500 flex items-center">
                        Artikel
                        <span class="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 rounded-full">{{ currentOrder.items.length }}</span>
                    </dt>
                    <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul class="divide-y divide-gray-200 border rounded-md">
                            <li v-for="item in currentOrder.items" :key="item.id" class="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                <div class="w-0 flex-1 flex items-center">
                                    <span class="font-medium truncate">{{ item.title }}</span>
                                    <span v-if="item.sku" class="ml-2 text-gray-400 text-xs">SKU: {{ item.sku }}</span>
                                </div>
                                <div class="ml-4 flex-shrink-0 font-bold">
                                    {{ item.quantity }}x
                                </div>
                            </li>
                        </ul>
                    </dd>
                </div>

                <!-- Actions -->
                <div class="py-5 sm:px-6 flex justify-end space-x-4 bg-gray-50">
                    <button @click="markShipped" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <TruckIcon class="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                        Als versendet markieren
                    </button>
                    <!-- Future: Create Label -->
                     <button @click="createLabel" type="button" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PrinterIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Label drucken (Beta)
                    </button>
                </div>
            </dl>
        </div>
    </div>

</div>
</template>
