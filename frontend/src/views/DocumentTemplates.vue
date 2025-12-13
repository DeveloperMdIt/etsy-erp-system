<template>
    <div class="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto mb-8">
            <div class="flex items-center gap-4 mb-4">
                <router-link to="/settings" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </router-link>
                <h1 class="text-3xl font-bold text-gray-900">Dokumentvorlagen</h1>
            </div>
            <p class="text-gray-600">Verwalten Sie hier Ihre Vorlagen für Rechnungen, Lieferscheine und andere Dokumente.</p>
        </div>

        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Rechnung -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Rechnung</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">Standardvorlage für Kundenrechnungen anpassen.</p>
                <router-link to="/settings/templates/edit/DOC_INVOICE" class="text-inventivy-blue font-medium hover:text-blue-700 text-sm">Bearbeiten &rarr;</router-link>
            </div>

            <!-- Lieferschein -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Lieferschein</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">Layout für Lieferscheine konfigurieren.</p>
                 <router-link to="/settings/templates/edit/DOC_DELIVERY_NOTE" class="text-inventivy-blue font-medium hover:text-blue-700 text-sm">Bearbeiten &rarr;</router-link>
            </div>
            
             <!-- Gutschrift -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div class="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">Korrekturrechnung</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">Vorlage für Gutschriften und Stornos.</p>
                 <router-link to="/settings/templates/edit/DOC_CREDIT_NOTE" class="text-inventivy-blue font-medium hover:text-blue-700 text-sm">Bearbeiten &rarr;</router-link>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
// Placeholder logic
</script>
