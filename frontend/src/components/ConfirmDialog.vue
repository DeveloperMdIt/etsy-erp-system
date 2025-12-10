<script setup lang="ts">
import { ref } from 'vue'

export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const isOpen = ref(false)
const options = ref<ConfirmDialogOptions>({
  title: '',
  message: '',
  confirmText: 'Bestätigen',
  cancelText: 'Abbrechen',
  type: 'warning'
})
let resolvePromise: ((value: boolean) => void) | null = null

const show = (opts: ConfirmDialogOptions): Promise<boolean> => {
  options.value = {
    ...opts,
    confirmText: opts.confirmText || 'Bestätigen',
    cancelText: opts.cancelText || 'Abbrechen',
    type: opts.type || 'warning'
  }
  isOpen.value = true
  
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const confirm = () => {
  isOpen.value = false
  if (resolvePromise) {
    resolvePromise(true)
    resolvePromise = null
  }
}

const cancel = () => {
  isOpen.value = false
  if (resolvePromise) {
    resolvePromise(false)
    resolvePromise = null
  }
}

defineExpose({ show })
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="px-6 py-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="options.type === 'danger'" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else-if="options.type === 'warning'" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-medium text-gray-900">{{ options.title }}</h3>
            <p class="mt-2 text-sm text-gray-500">{{ options.message }}</p>
          </div>
        </div>
      </div>
      <div class="px-6 py-4 bg-gray-50 flex gap-3">
        <button
          @click="cancel"
          class="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ options.cancelText }}
        </button>
        <button
          @click="confirm"
          class="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="{
            'bg-red-600 hover:bg-red-700 focus:ring-red-500': options.type === 'danger',
            'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500': options.type === 'warning',
            'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': options.type === 'info'
          }"
        >
          {{ options.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
