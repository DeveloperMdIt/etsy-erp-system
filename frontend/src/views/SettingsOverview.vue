<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
    
    <!-- Header & Search -->
    <div class="max-w-7xl mx-auto mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Einstellungen</h1>
        <div class="relative max-w-2xl">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input 
                type="text" 
                class="block w-full rounded-2xl border-0 py-4 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-inventivy-blue sm:text-lg bg-white" 
                placeholder="Einstellungen suchen, z.B. Artikel, Kunden, Versand..." 
            />
        </div>
    </div>

    <!-- Grid Container -->
    <div class="max-w-7xl mx-auto space-y-12">
      
      <!-- General Section -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">Allgemein</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          
          <!-- Activity Log -->
          <router-link to="/settings/activity-log" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
            <div class="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Ereignisse</span>
            <span class="text-sm text-gray-500 mt-2">Logbuch</span>
          </router-link>

          <!-- Profil -->
          <router-link to="/settings/profile" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
            <div class="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Mitarbeiter</span>
            <span class="text-sm text-gray-500 mt-2">Profil & Rechte</span>
          </router-link>

           <!-- Import -->
          <router-link to="/settings/import" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
            <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Datenimport</span>
            <span class="text-sm text-gray-500 mt-2">CSV Uploads</span>
          </router-link>
          
        </div>
      </div>

      <!-- Connections Section -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">Verbindungseinstellungen</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

          <!-- Kanäle (Etsy) -->
          <router-link to="/settings/channels" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
             <div class="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Kanäle</span>
            <span class="text-sm text-gray-500 mt-2">Etsy & Co</span>
          </router-link>

          <!-- Versandwege -->
          <router-link to="/settings/shipping" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
             <div class="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h12a1 1 0 001-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3z" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Versandwege</span>
            <span class="text-sm text-gray-500 mt-2">DHL & Post</span>
          </router-link>

           <!-- Printers (Link to Config) -->
           <router-link to="/settings/config#printers" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
             <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Drucker</span>
            <span class="text-sm text-gray-500 mt-2">Geräte & Formate</span>
          </router-link>

         </div>
      </div>

      <!-- Automation & Templates Section -->
      <div>
        <h2 class="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">Automatisierung & Vorlagen</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

          <!-- Automation -->
          <router-link to="/settings/automation" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
             <div class="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Automatisierung</span>
            <span class="text-sm text-gray-500 mt-2">Regeln & Workflows</span>
          </router-link>

          <!-- Document Templates -->
          <router-link to="/settings/templates/documents" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
             <div class="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">Dokumentvorlagen</span>
            <span class="text-sm text-gray-500 mt-2">Rechnung & Co.</span>
          </router-link>

          <!-- Email Templates -->
          <router-link to="/settings/templates/emails" class="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-gray-200 hover:shadow-md transition-all h-56 text-center">
             <div class="w-16 h-16 rounded-2xl bg-lime-50 text-lime-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <span class="font-medium text-gray-900 text-lg">E-Mail Vorlagen</span>
            <span class="text-sm text-gray-500 mt-2">Texte & Betreff</span>
          </router-link>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Static Overview
</script>
