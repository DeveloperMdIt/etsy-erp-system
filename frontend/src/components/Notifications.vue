<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <TransitionGroup 
      tag="div" 
      name="notification" 
      class="w-full max-w-4xl px-4 flex flex-col items-center space-y-4 pointer-events-none"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'pointer-events-auto w-full shadow-lg rounded-xl overflow-hidden border border-opacity-50 relative',
          notificationClass(notification.type)
        ]"
      >
        <div class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="iconComponent(notification.type)" class="h-8 w-8" />
            </div>
            <div class="ml-4 w-0 flex-1">
              <p class="text-base font-semibold leading-relaxed break-words">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useNotifications } from '../composables/useNotifications';

const { notifications, removeNotification } = useNotifications();

const notificationClass = (type: string) => {
  const classes = {
    success: 'bg-green-50 border-green-400 text-green-900',
    error: 'bg-red-50 border-red-400 text-red-900',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-900',
    info: 'bg-blue-50 border-blue-400 text-blue-900'
  };
  return classes[type as keyof typeof classes] || classes.info;
};

const iconComponent = (type: string) => {
  const icons = {
    success: () => h('svg', { class: 'text-green-400', fill: 'currentColor', viewBox: '0 0 20 20' }, [
      h('path', { 'fill-rule': 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z', 'clip-rule': 'evenodd' })
    ]),
    error: () => h('svg', { class: 'text-red-400', fill: 'currentColor', viewBox: '0 0 20 20' }, [
      h('path', { 'fill-rule': 'evenodd', d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z', 'clip-rule': 'evenodd' })
    ]),
    warning: () => h('svg', { class: 'text-yellow-400', fill: 'currentColor', viewBox: '0 0 20 20' }, [
      h('path', { 'fill-rule': 'evenodd', d: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z', 'clip-rule': 'evenodd' })
    ]),
    info: () => h('svg', { class: 'text-blue-400', fill: 'currentColor', viewBox: '0 0 20 20' }, [
      h('path', { 'fill-rule': 'evenodd', d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z', 'clip-rule': 'evenodd' })
    ])
  };
  return icons[type as keyof typeof icons] || icons.info;
};

defineExpose({
  showSuccess: (title: string, message?: string) => useNotifications().showSuccess(title, message),
  showError: (title: string, message?: string) => useNotifications().showError(title, message),
  showInfo: (title: string, message?: string) => useNotifications().showInfo(title, message),
  showWarning: (title: string, message?: string) => useNotifications().showWarning(title, message),
  show: (type: any, message: string) => {
    // Adapter for legacy calls that might use (type, title, message) signature or similar
    void type;
    void message;
    // no-op currently, or implement if needed
  }
});
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
