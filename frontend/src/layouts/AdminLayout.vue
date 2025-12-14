<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Squares2X2Icon, 
  UsersIcon, 
  PuzzlePieceIcon, 
  Cog6ToothIcon, 
  DocumentTextIcon, 
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const isSidebarOpen = ref(true)

const navigation = [
  { name: 'Übersicht', href: '/admin', icon: Squares2X2Icon },
  { name: 'Kunden', href: '/admin/users', icon: UsersIcon },
  { name: 'Module', href: '/admin/modules', icon: PuzzlePieceIcon },
  { name: 'Inhalte (CMS)', href: '/admin/content', icon: DocumentTextIcon },
  { name: 'System', href: '/admin/settings', icon: Cog6ToothIcon },
]

const handleLogout = () => {
  localStorage.removeItem('authToken')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <!-- Sidebar -->
    <div 
      class="bg-gray-900 w-64 flex-shrink-0 flex flex-col transition-all duration-300"
      :class="isSidebarOpen ? 'w-64' : 'w-20'"
    >
      <div class="h-16 flex items-center justify-center p-4 bg-gray-900 border-b border-gray-800">
        <h1 class="text-white font-bold text-xl truncate" v-if="isSidebarOpen">Admin Panel</h1>
        <span class="text-white font-bold text-xl" v-else>A</span>
      </div>

      <nav class="flex-1 px-2 py-4 space-y-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors group"
          :title="!isSidebarOpen ? item.name : ''"
        >
          <component :is="item.icon" class="w-6 h-6 flex-shrink-0" :class="isSidebarOpen ? 'mr-3' : 'mx-auto'" />
          <span v-if="isSidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <button 
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-6 h-6 flex-shrink-0" :class="isSidebarOpen ? 'mr-3' : 'mx-auto'" />
          <span v-if="isSidebarOpen">Logout</span>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="bg-white shadow">
            <div class="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h2 class="text-xl font-semibold text-gray-800">{{ $route.meta.title || 'Admin' }}</h2>
                <div class="text-sm text-gray-500">Super Admin Mode</div>
            </div>
        </header>

        <main class="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <router-view></router-view>
        </main>
    </div>
  </div>
</template>
