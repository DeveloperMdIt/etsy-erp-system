<template>
  <nav v-if="breadcrumbs.length" class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
        
      <!-- Home Icon -->
      <li>
        <div>
          <router-link to="/" class="text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Home</span>
          </router-link>
        </div>
      </li>

      <!-- Items -->
      <li v-for="(item, index) in breadcrumbs" :key="item.path">
        <div class="flex items-center">
            
          <!-- Separator -->
          <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
          </svg>

          <router-link 
            v-if="index < breadcrumbs.length - 1"
            :to="item.path" 
            class="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            {{ item.title }}
          </router-link>
          <span v-else class="ml-2 text-sm font-bold text-gray-800" aria-current="page">
            {{ item.title }}
          </span>
        </div>
      </li>

    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const breadcrumbs = computed(() => {
    const matched = [];
    // let currentRoute = route; // Unused

    // Handle "Parent" meta field manually since standard Vue Router 'matched' array 
    // works based on nested route config, but we have flat config with excessive logic.
    // Or we can just use the 'parent' meta pointer I added.
    
    // Simplest approach: Use the meta.parent chain.
    // 1. Current Page
    if (route.meta.title) {
        matched.unshift({
            path: route.path,
            title: route.meta.title
        });
    }

    // 2. Parent (Simple 1-level for now as per config)
    if (route.meta.parent) {
        const parentPath = route.meta.parent as string;
        const parentRoute = router.getRoutes().find(r => r.path === parentPath);
        if (parentRoute && parentRoute.meta.title) {
             matched.unshift({
                path: parentPath,
                title: parentRoute.meta.title
             });
        }
    }

    // If Dashboard (Home), we don't need text for it if we have icon, 
    // OR we can skip it if it's the only item (user is on dashboard).
    if (route.path === '/') return [];

    return matched;
});
</script>
