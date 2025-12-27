<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ClockIcon class="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900">
                    Historischer Import
                  </DialogTitle>
                  <div class="mt-2 text-sm text-gray-500">
                    <p class="mb-4">
                      Wähle einen Zeitraum, um alte Bestellungen von Etsy zu importieren. 
                      Das System lädt alle Bestellungen seitenweise herunter.
                    </p>

                    <div class="grid grid-cols-1 gap-y-4">
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Ab Datum (Start)</label>
                        <input 
                          type="date" 
                          v-model="fromDate"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Bis Datum (Ende)</label>
                        <input 
                          type="date" 
                          v-model="toDate"
                          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                      </div>
                    </div>
                    
                    <div v-if="error" class="mt-3 text-red-600 text-xs bg-red-50 p-2 rounded">
                      {{ error }}
                    </div>

                  </div>
                </div>
              </div>

              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                  :disabled="loading || !fromDate"
                  :class="{ 'opacity-50 cursor-not-allowed': loading || !fromDate }"
                  @click="startImport"
                >
                  <span v-if="loading" class="animate-spin mr-2">⏳</span>
                  {{ loading ? 'Import läuft...' : 'Import Starten' }}
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  @click="closeModal"
                  :disabled="loading"
                >
                  Abbrechen
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { ClockIcon } from '@heroicons/vue/24/outline';
import axios from 'axios';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['close', 'success']);

const fromDate = ref('2024-01-01');
const toDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(false);
const error = ref<string | null>(null);

function closeModal() {
  if (loading.value) return; // Prevent closing while running? Or allow background?
  // Ideally allow closing and it runs in BG
  emit('close');
}

async function startImport() {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.post('/etsy/sync-orders', {
      fullSync: false,
      fromDate: fromDate.value,
      toDate: toDate.value
    });

    if (response.data.error) {
      error.value = response.data.error;
    } else {
      emit('success', response.data.message);
      closeModal();
    }
  } catch (err: any) {
    console.error('History Import Error:', err);
    error.value = err.response?.data?.error || err.message || 'Fehler beim Starten des Imports.';
  } finally {
    loading.value = false;
  }
}
</script>
