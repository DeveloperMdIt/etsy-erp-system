<template>
  <div class="flex flex-col w-64 bg-sidebar-bg h-full text-sidebar-text transition-all duration-300 left-0 top-0 fixed" :class="collapsed ? 'w-20' : 'w-64'">
    
    <!-- Logo area -->
    <router-link to="/dashboard" class="flex items-center justify-center h-16 border-b border-slate-800 bg-sidebar-bg font-bold text-xl tracking-wider overflow-hidden hover:bg-opacity-90 transition-colors">
        <Logo 
            :collapsed="collapsed" 
            logoClass="h-full"
        />
    </router-link>

    <!-- Nav Items -->
    <nav class="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <router-link v-for="item in displayNavItems" :key="item.path" :to="item.path" 
            class="group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors"
            :class="isActive(item.path) ? 'bg-sidebar-active text-white shadow-md' : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'"
            :title="collapsed ? item.name : ''"
        >
            <component :is="item.icon" class="flex-shrink-0 h-6 w-6" :class="isActive(item.path) ? 'text-white' : 'text-sidebar-icon group-hover:text-white'" aria-hidden="true" />
            <span v-if="!collapsed" class="ml-3">{{ item.name }}</span>
        </router-link>
    </nav>

    <!-- User / Footer -->
    <div class="border-t border-slate-700 p-4 bg-sidebar-bg">
        <div class="flex items-center">
             <div class="h-9 w-9 rounded-full bg-inventivy-blue flex items-center justify-center text-white font-bold cursor-pointer" @click="$emit('toggle-menu')">
                {{ userInitials }}
             </div>
             <div v-if="!collapsed" class="ml-3">
                 <p class="text-sm font-medium text-white group-hover:text-gray-200">{{ userName }}</p>
                 <button @click="$emit('logout')" class="text-xs text-sidebar-icon hover:text-white">Abmelden</button>
             </div>
        </div>
    </div>

    <!-- Toggle Collapse (Optional) -->
    <!-- <button @click="collapsed = !collapsed" class="absolute -right-3 top-20 bg-indigo-600 rounded-full p-1 text-white shadow-sm border border-white">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
    </button> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
// Icons would ideally be heroicons components, but for now using inline SVGs wrapped in simple components or raw check
// To keep it clean, I will define simple SVG components here or just standard spans if I can't import icons easily without library.
// I'll use standard "VNode" approach or just simple mapping.

// Layout needs to be strictly defined.
const props = defineProps<{
    user: any,
    collapsed: boolean
}>()

const route = useRoute();

const isActive = (path: string) => {
    if (path === '/') return route.path === '/';
    return route.path.startsWith(path);
}

const userName = computed(() => props.user?.firstName || props.user?.email || 'User');
const userInitials = computed(() => (props.user?.firstName?.[0] || props.user?.email?.[0] || 'U').toUpperCase());

// Define Icons
const IconHome = { template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>` };
const IconOrders = { template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>` };
const IconProducts = { template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>` };
const IconCustomers = { template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>` };
const IconSettings = { template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>` };

const navItems = [
    { name: 'Dashboard', path: '/', icon: IconHome },
    { name: 'Bestellungen', path: '/orders', icon: IconOrders },
    { name: 'Produkte', path: '/products', icon: IconProducts },
    { name: 'Kunden', path: '/customers', icon: IconCustomers },
    { name: 'Mein Abo', path: '/subscription', icon: { template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>` } },
    { name: 'Einstellungen', path: '/settings', icon: IconSettings },
]

const adminItem = { name: 'Admin Panel', path: '/admin', icon: { template: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>` } }

const displayNavItems = computed(() => {
    if (props.user?.role === 'ADMIN') {
        return [...navItems, adminItem]
    }
    return navItems
})
import Logo from './Logo.vue';
</script>
