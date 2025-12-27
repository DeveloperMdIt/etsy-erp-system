<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="closeModal">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <CloudArrowUpIcon class="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900">Adressen importieren (CSV)</DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Ergänzen Sie fehlende Adressen einfach über den offiziellen Etsy CSV-Export.
                    </p>
                    
                    <!-- Step 1: Instruction -->
                    <div class="mt-4 rounded-md bg-gray-50 p-4 text-left text-sm">
                      <p class="font-medium text-gray-700">Schritt 1: Exportieren</p>
                      <ul class="mt-1 list-disc pl-4 text-gray-600 space-y-1">
                        <li>Öffnen Sie die <a href="https://www.etsy.com/your/shops/me/download" target="_blank" class="text-indigo-600 hover:underline">Etsy Download-Seite</a>.</li>
                        <li>Wählen Sie unter "CSV-Typ" die Option <strong>"Bestellungen"</strong> und klicken Sie auf Download.</li>
                        <li><strong>Wichtig:</strong> Etsy schickt Ihnen den Download-Link <strong>per E-Mail</strong>.</li>
                        <li>Laden Sie die Datei aus der E-Mail herunter und ziehen Sie sie hier rein.</li>
                      </ul>
                    </div>

                    <!-- Step 2: Upload -->
                     <div class="mt-4">
                      <p class="mb-2 text-left text-sm font-medium text-gray-700">Schritt 2: Datei hier ablegen</p>
                      
                      <div 
                        class="flex max-w-lg justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 hover:bg-gray-50 hover:border-indigo-400 transition-colors cursor-pointer"
                        @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false"
                        @drop.prevent="handleDrop"
                        @click="triggerFileInput"
                        :class="{'border-indigo-500 bg-indigo-50': isDragging}"
                      >
                        <div class="space-y-1 text-center">
                          <DocumentTextIcon v-if="!file" class="mx-auto h-12 w-12 text-gray-400" />
                          <CheckCircleIcon v-else class="mx-auto h-12 w-12 text-green-500" />
                          
                          <div class="flex text-sm text-gray-600 justify-center">
                            <label class="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500">
                              <span v-if="!file">Datei auswählen</span>
                              <span v-else>{{ file.name }}</span>
                              <input ref="fileInput" type="file" class="sr-only" accept=".csv" @change="handleFileSelect" />
                            </label>
                          </div>
                          <p v-if="!file" class="text-xs text-gray-500">oder hier reinziehen (Drag & Drop)</p>
                        </div>
                      </div>
                    </div>

                    <!-- Error Message -->
                     <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button 
                  type="button" 
                  class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                  :disabled="!file || uploading"
                  :class="{'opacity-50 cursor-not-allowed': !file || uploading}"
                  @click="uploadFile"
                >
                  <span v-if="uploading">Import läuft...</span>
                  <span v-else>Import starten</span>
                </button>
                <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm" @click="closeModal" ref="cancelButtonRef">
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
import { CloudArrowUpIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
import { CheckCircleIcon } from '@heroicons/vue/24/solid';
import axios from 'axios';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['close', 'success']);

const file = ref<File | null>(null);
const isDragging = ref(false);
const uploading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

function closeModal() {
  file.value = null;
  error.value = null;
  emit('close');
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const selectedFile = target.files?.[0];
  if (selectedFile) {
    validateAndSetFile(selectedFile);
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const selectedFile = event.dataTransfer?.files?.[0];
  if (selectedFile) {
    validateAndSetFile(selectedFile);
  }
}

function validateAndSetFile(selectedFile: File) {
  if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
    error.value = 'Bitte nur .csv Dateien hochladen.';
    return;
  }
  file.value = selectedFile;
  error.value = null;
}

async function uploadFile() {
  if (!file.value) return;

  uploading.value = true;
  error.value = null;

  const formData = new FormData();
  formData.append('file', file.value);

  try {
    const response = await axios.post('/api/etsy/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      // alert(response.data.message); // Removed in favor of emit
      emit('success', response.data.message);
      closeModal();
    } else {
      error.value = response.data.error || 'Ein unbekannter Fehler ist aufgetreten.';
    }
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data?.error || 'Upload fehlgeschlagen.';
  } finally {
    uploading.value = false;
  }
}
</script>
