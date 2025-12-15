<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useNotifications } from '@/composables/useNotifications'
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/vue/24/outline'

const { showSuccess, showError } = useNotifications()

interface ShippingProfile {
  id: string
  name: string
  provider: 'DHL' | 'INTERNETMARKE'
  productCode: string
  billingNumber?: string
  baseWeight: number
  length?: number
  width?: number
  height?: number
  _count?: { products: number }
}

const profiles = ref<ShippingProfile[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingProfile = ref<ShippingProfile | null>(null)

// Form Data
const formData = ref({
  name: '',
  provider: 'DHL',
  productCode: 'V01PAK',
  billingNumber: '',
  baseWeight: 0,
  length: 0,
  width: 0,
  height: 0
})

const providers = [
  { value: 'DHL', label: 'DHL Paket' },
  { value: 'INTERNETMARKE', label: 'Internetmarke (Deutsche Post)' }
]

const dhlProducts = [
  { code: 'V01PAK', label: 'DHL Paket' },
  { code: 'V62WP', label: 'Warenpost' },
  { code: 'V53WPI', label: 'Warenpost International' }
]

const internetmarkeProducts = [
  { code: '1020', label: 'Standardbrief (bis 20g)' },
  { code: '1030', label: 'Kompaktbrief (bis 50g)' },
  { code: '1040', label: 'Großbrief (bis 500g)' },
  { code: '1050', label: 'Maxibrief (bis 1000g)' }
]

const fetchProfiles = async () => {
  try {
    loading.value = true
    const res = await axios.get('/api/shipping-profiles')
    profiles.value = res.data
  } catch (e) {
    showError('Fehler beim Laden der Versandprofile')
  } finally {
    loading.value = false
  }
}

const openModal = (profile: ShippingProfile | null = null) => {
  editingProfile.value = profile
  if (profile) {
    formData.value = {
      name: profile.name,
      provider: profile.provider as string,
      productCode: profile.productCode,
      billingNumber: profile.billingNumber || '',
      baseWeight: profile.baseWeight,
      length: profile.length || 0,
      width: profile.width || 0,
      height: profile.height || 0
    }
  } else {
    // defaults
    formData.value = {
      name: '',
      provider: 'DHL',
      productCode: 'V01PAK',
      billingNumber: '',
      baseWeight: 0,
      length: 0,
      width: 0,
      height: 0
    }
  }
  showModal.value = true
}

const saveProfile = async () => {
  try {
    if (editingProfile.value) {
      await axios.put(`/api/shipping-profiles/${editingProfile.value.id}`, formData.value)
      showSuccess('Profil aktualisiert')
    } else {
      await axios.post('/api/shipping-profiles', formData.value)
      showSuccess('Profil erstellt')
    }
    showModal.value = false
    fetchProfiles()
  } catch (e) {
    showError('Speichern fehlgeschlagen')
  }
}

const deleteProfile = async (id: string) => {
  if (!confirm('Diesen Profil wirklich löschen?')) return
  try {
    await axios.delete(`/api/shipping-profiles/${id}`)
    showSuccess('Profil gelöscht')
    fetchProfiles()
  } catch (e) {
    showError('Löschen fehlgeschlagen')
  }
}

onMounted(fetchProfiles)
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-medium text-gray-900">Versandprofile</h3>
      <button @click="openModal()" class="btn-primary flex items-center gap-2">
        <PlusIcon class="h-5 w-5" />
        Neues Profil
      </button>
    </div>

    <!-- List -->
    <div v-if="loading" class="text-center py-4 text-gray-500">Lade Profile...</div>
    
    <div v-else-if="profiles.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
      Noch keine Versandprofile angelegt.
    </div>

    <div v-else class="space-y-4">
      <div v-for="profile in profiles" :key="profile.id" class="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
        <div>
          <h4 class="font-medium text-gray-900">{{ profile.name }}</h4>
          <p class="text-sm text-gray-500">
            {{ profile.provider === 'DHL' ? 'DHL Paket' : 'Internetmarke' }} • 
            {{ profile.productCode }} • 
            {{ profile._count?.products || 0 }} Produkte verknüpft
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Basisgewicht: {{ profile.baseWeight }}g • 
            {{ profile.length || '?' }}x{{ profile.width || '?' }}x{{ profile.height || '?' }}cm
          </p>
        </div>
        <div class="flex gap-2">
          <button @click="openModal(profile)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
            <PencilIcon class="h-5 w-5" />
          </button>
          <button @click="deleteProfile(profile.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-full">
            <TrashIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showModal = false"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            {{ editingProfile ? 'Profil bearbeiten' : 'Neues Versandprofil' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input v-model="formData.name" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" placeholder="z.B. Großbrief Standard">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Dienstleister</label>
              <select v-model="formData.provider" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
                <option v-for="p in providers" :key="p.value" :value="p.value">{{ p.label }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Produkt / Marke</label>
              <select v-model="formData.productCode" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
                <optgroup v-if="formData.provider === 'DHL'" label="DHL Paket">
                  <option v-for="p in dhlProducts" :key="p.code" :value="p.code">{{ p.label }}</option>
                </optgroup>
                <optgroup v-if="formData.provider === 'INTERNETMARKE'" label="Internetmarke">
                  <option v-for="p in internetmarkeProducts" :key="p.code" :value="p.code">{{ p.label }}</option>
                </optgroup>
              </select>
            </div>

            <div v-if="formData.provider === 'DHL'">
              <label class="block text-sm font-medium text-gray-700">Abrechnungsnummer (EKP + Verfahren + Teilnahme)</label>
              <input v-model="formData.billingNumber" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2" placeholder="z.B. 33333333330101 (Leer lassen für Standard)">
              <p class="text-xs text-gray-500 mt-1">Nur angeben, wenn abweichend vom Haupt-Login</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Basisgewicht (Verpackung) in g</label>
                <input v-model.number="formData.baseWeight" type="number" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2">
              </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-medium text-gray-700">Länge (cm)</label>
                <input v-model.number="formData.length" type="number" class="mt-1 block w-full border p-2 rounded-md">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700">Breite (cm)</label>
                <input v-model.number="formData.width" type="number" class="mt-1 block w-full border p-2 rounded-md">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700">Höhe (cm)</label>
                <input v-model.number="formData.height" type="number" class="mt-1 block w-full border p-2 rounded-md">
              </div>
            </div>
          </div>

          <div class="mt-5 sm:mt-6 flex gap-3">
            <button @click="showModal = false" type="button" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">
              Abbrechen
            </button>
            <button @click="saveProfile" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm">
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
