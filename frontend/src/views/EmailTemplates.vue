<template>
    <div class="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto mb-8">
             <div class="flex items-center gap-4 mb-4">
                <router-link to="/settings" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </router-link>
                <h1 class="text-3xl font-bold text-gray-900">E-Mail Vorlagen</h1>
            </div>
            <p class="text-gray-600">Gestalten Sie die E-Mails, die automatisch an Ihre Kunden gesendet werden.</p>
        </div>

        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- Bestätigung -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Bestellbestätigung</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">Wird nach erfolgreicher Bestellung versendet.</p>
                <router-link to="/settings/templates/edit/EMAIL_ORDER_CONFIRMATION" class="text-inventivy-blue font-medium hover:text-blue-700 text-sm">Bearbeiten &rarr;</router-link>
            </div>

            <!-- Zahlungseingang -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Zahlungseingang</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">Benachrichtigung über erhaltene Zahlung.</p>
                 <router-link to="/settings/templates/edit/EMAIL_PAYMENT_RECEIVED" class="text-inventivy-blue font-medium hover:text-blue-700 text-sm">Bearbeiten &rarr;</router-link>
            </div>

            <!-- Versandbestätigung -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Versandbestätigung</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">Versandinfos & Tracking-Nummer.</p>
                 <router-link to="/settings/templates/edit/EMAIL_SHIPPING_CONFIRMATION" class="text-inventivy-blue font-medium hover:text-blue-700 text-sm">Bearbeiten &rarr;</router-link>
            </div>
            <!-- Rechnung versenden -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Rechnung senden</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">E-Mail zum manuellen Versenden von Rechnungen.</p>
                 <router-link to="/settings/templates/edit/EMAIL_INVOICE_SEND" class="text-inventivy-blue font-medium hover:text-blue-700 text-sm">Bearbeiten &rarr;</router-link>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
// Placeholder logic
</script>
