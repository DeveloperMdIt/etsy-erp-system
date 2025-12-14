<script setup lang="ts">
// Logic for footer if any in future
</script>

<template>
    <footer class="bg-gray-800">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-base text-gray-400">
          &copy; 2025 Inventivy. Alle Rechte vorbehalten. 
          <span class="mx-2">|</span>
          <router-link to="/privacy" class="hover:text-white transition-colors">Datenschutz</router-link>
          <span class="mx-2">|</span>
          <router-link to="/terms" class="hover:text-white transition-colors">AGB</router-link>
          <span class="mx-2">|</span>
          <router-link to="/impressum" class="hover:text-white transition-colors">Impressum</router-link>
          <span class="mx-2">|</span>
          <router-link to="/avv" class="hover:text-white transition-colors">AVV</router-link>
        </p>
      </div>
    </footer>
</template>
