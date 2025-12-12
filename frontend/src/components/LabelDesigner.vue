<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface LabelElement {
  id: string
  type: 'text' | 'image' | 'barcode' | 'qrcode' | 'address_sender' | 'address_recipient'
  x: number
  y: number
  width: number
  height: number
  content?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'bold' | 'normal'
  align?: 'left' | 'center' | 'right'
  addressFormat?: 'multiline' | 'singleline'
  addressSeparator?: string
}

interface LabelLayout {
  width: number
  height: number
  elements: LabelElement[]
}

const props = defineProps<{
  modelValue?: string | null
  format: string
  logoUrl?: string | null
}>()

const emit = defineEmits(['update:modelValue', 'close', 'save'])

const MM_TO_PX = 3.78
const SCALE = 1.5

const FORMAT_SIZES: Record<string, { width: number, height: number }> = {
    'A6': { width: 105, height: 148 },
    'A5': { width: 148, height: 210 },
    '4x6': { width: 101.6, height: 152.4 },
    '4x4': { width: 101.6, height: 101.6 }
}

const layout = ref<LabelLayout>({
    width: 105,
    height: 148,
    elements: []
})

const selectedElementId = ref<string | null>(null)
const draggingElementId = ref<string | null>(null)

const canvasStyle = computed(() => {
    const widthPx = layout.value.width * MM_TO_PX * SCALE
    const heightPx = layout.value.height * MM_TO_PX * SCALE
    return {
        width: `${widthPx}px`,
        height: `${heightPx}px`
    }
})

const selectedElement = computed(() => {
    return layout.value.elements.find(e => e.id === selectedElementId.value)
})

const initLayout = () => {
    const size = FORMAT_SIZES[props.format] || FORMAT_SIZES['A6']
    layout.value.width = size.width
    layout.value.height = size.height

    if (props.modelValue) {
        try {
            const parsed = JSON.parse(props.modelValue)
            if(parsed.elements) {
                 layout.value.elements = parsed.elements
            }
        } catch (e) {
            console.error('Invalid layout JSON', e)
        }
    } else {
        layout.value.elements = [
            { id: 'sender', type: 'address_sender', x: 5, y: 5, width: 60, height: 20, fontSize: 8 },
            { id: 'recipient', type: 'address_recipient', x: 10, y: 50, width: 80, height: 40, fontSize: 12, fontWeight: 'bold' }
        ]
    }
}

const addElement = (type: LabelElement['type']) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newElement: LabelElement = {
        id,
        type,
        x: 10,
        y: 10,
        width: type === 'qrcode' ? 20 : 50,
        height: type === 'qrcode' ? 20 : 10,
        content: type === 'text' ? 'Text' : undefined,
        fontSize: 10,
        align: 'left'
    }
    
    layout.value.elements.push(newElement)
    selectedElementId.value = id
}

const removeElement = (id: string) => {
    layout.value.elements = layout.value.elements.filter(e => e.id !== id)
    if (selectedElementId.value === id) selectedElementId.value = null
}

const startDrag = (e: MouseEvent, element: LabelElement) => {
    e.stopPropagation()
    selectedElementId.value = element.id
    draggingElementId.value = element.id
}

const onMouseMove = (e: MouseEvent) => {
    if (!draggingElementId.value) return
    
    const element = layout.value.elements.find(el => el.id === draggingElementId.value)
    if (!element) return

    const movementX_MM = e.movementX / (MM_TO_PX * SCALE)
    const movementY_MM = e.movementY / (MM_TO_PX * SCALE)

    element.x += movementX_MM
    element.y += movementY_MM
}

const stopDrag = () => {
    draggingElementId.value = null
}

const save = () => {
    const json = JSON.stringify(layout.value)
    emit('update:modelValue', json)
    emit('save', json)
}

const generatePreview = async () => {
    const testData = {
        senderName: 'Max Mustermann',
        senderStreet: 'Musterstraße 1',
        senderPostalCode: '12345',
        senderCity: 'Musterstadt',
        recipientName: 'Erika Mustermann',
        recipientStreet: 'Beispielweg 99',
        recipientPostalCode: '54321',
        recipientCity: 'Beispielstadt',
        recipientCountry: 'Deutschland',
        trackingNumber: 'TEST123456789'
    }

    try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/labels/preview', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                layout: layout.value,
                testData
            })
        })

        if (response.ok) {
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
        } else {
            alert('Fehler beim Generieren der Vorschau')
        }
    } catch (error) {
        console.error('Preview error:', error)
        alert('Fehler beim Generieren der Vorschau')
    }
}

watch(() => props.format, () => {
    const size = FORMAT_SIZES[props.format]
    if (size) {
        layout.value.width = size.width
        layout.value.height = size.height
    }
})

const rotateLayout = () => {
    const w = layout.value.width
    const h = layout.value.height
    layout.value.width = h
    layout.value.height = w
}

onMounted(() => {
    initLayout()
    window.addEventListener('mouseup', stopDrag)
    window.addEventListener('mousemove', onMouseMove)
})

</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl h-[90vh] flex flex-col border border-gray-200" @click.stop>
          
          <!-- Header -->
          <div class="bg-white px-4 py-3 flex justify-between items-center border-b shrink-0">
            <div class="flex items-center space-x-4">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Label Designer - {{ format }}</h3>
                <p class="text-xs text-gray-500">Elemente per Drag & Drop platzieren. ({{ layout.width }}x{{ layout.height }}mm)</p>
              </div>
              <button @click="rotateLayout" type="button" class="text-xs flex items-center px-2 py-1 border rounded hover:bg-gray-50 text-gray-600" title="Format drehen (90°)">
                <span class="mr-1">🔄</span> {{ layout.width > layout.height ? 'Querformat' : 'Hochformat' }}
              </button>
            </div>
            <div class="flex space-x-2">
              <button @click="generatePreview" type="button" class="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none">
                📄 Vorschau (Test-PDF)
              </button>
              <button @click="$emit('close')" type="button" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                Schließen
              </button>
              <button @click="save" type="button" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                Speichern
              </button>
            </div>
          </div>

          <!-- Editor Body -->
          <div class="flex-1 flex overflow-hidden">
            
            <!-- TOOLBAR -->
            <div class="w-64 bg-white border-r p-4 overflow-y-auto">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Elemente</h4>
              
              <div class="space-y-2">
                <button @click="addElement('text')" class="w-full flex items-center px-3 py-2 border rounded hover:bg-gray-50 text-sm">
                  <span class="mr-2">T</span> Textfeld
                </button>
                <button @click="addElement('address_sender')" class="w-full flex items-center px-3 py-2 border rounded hover:bg-gray-50 text-sm">
                  <span class="mr-2">🏠</span> Absender-Block
                </button>
                <button @click="addElement('address_recipient')" class="w-full flex items-center px-3 py-2 border rounded hover:bg-gray-50 text-sm">
                  <span class="mr-2">👤</span> Empfänger-Block
                </button>
                <button @click="addElement('qrcode')" class="w-full flex items-center px-3 py-2 border rounded hover:bg-gray-50 text-sm">
                  <span class="mr-2">📱</span> QR Code
                </button>
                <button @click="addElement('image')" class="w-full flex items-center px-3 py-2 border rounded hover:bg-gray-50 text-sm">
                  <span class="mr-2">🖼️</span> Bild / Logo
                </button>
              </div>

              <div class="mt-8">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Variablen</h4>
                <p class="text-xs text-gray-500 mb-2">Benutze diese Platzhalter in Textfeldern:</p>
                <ul class="text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
                  <li>{recipientName}</li>
                  <li>{recipientStreet}</li>
                  <li>{recipientCity}</li>
                  <li>{trackingNumber}</li>
                </ul>
              </div>
            </div>

            <!-- CANVAS AREA -->
            <div class="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-10 select-none">
              <div class="relative">
                
                <!-- Dimension Labels -->
                <div class="absolute -bottom-8 left-0 right-0 flex justify-center text-xs text-gray-600 font-mono">
                  <span class="bg-white px-2 py-1 rounded border shadow-sm">↔ {{ layout.width }} mm</span>
                </div>
                <div class="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600 font-mono">
                  <span class="bg-white px-2 py-1 rounded border shadow-sm">↕ {{ layout.height }} mm</span>
                </div>

                <div :style="canvasStyle" class="relative bg-white shadow-lg border-2 border-gray-600">
                  
                  <!-- Orientation Marker -->
                  <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded border-2 border-indigo-400 shadow-sm">
                    ▲ OBEN
                  </div>

                  <!-- Empty State -->
                  <div v-if="layout.elements.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center pointer-events-none border-2 border-dashed border-gray-300 m-2 rounded">
                    <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <p class="text-sm">Leere Leinwand</p>
                    <p class="text-xs mt-1">Klicken Sie links auf einen Button, um Elemente hinzuzufügen.</p>
                  </div>

                  <!-- Elements -->
                  <div 
                    v-for="el in layout.elements" 
                    :key="el.id"
                    class="absolute border border-transparent hover:border-indigo-300 cursor-move flex items-center px-1"
                    :class="{'border-indigo-600 ring-1 ring-indigo-600': selectedElementId === el.id}"
                    :style="{
                      left: `${el.x * MM_TO_PX * SCALE}px`,
                      top: `${el.y * MM_TO_PX * SCALE}px`,
                      width: `${el.width * MM_TO_PX * SCALE}px`,
                      height: `${el.height * MM_TO_PX * SCALE}px`,
                      fontSize: `${(el.fontSize || 10) * SCALE}px`,
                      fontFamily: el.fontFamily || 'Helvetica, sans-serif',
                      fontWeight: el.fontWeight || 'normal',
                      textAlign: el.align || 'left'
                    }"
                    @mousedown="startDrag($event, el)"
                  >
                    <span v-if="el.type === 'text'" class="w-full overflow-hidden text-ellipsis whitespace-nowrap">{{ el.content }}</span>
                    
                    <div v-else-if="el.type === 'address_sender'" class="text-[0.8em] leading-tight overflow-hidden">
                      <template v-if="el.addressFormat === 'singleline'">
                        Max Mustermann{{ el.addressSeparator || ', ' }}Musterstraße 1{{ el.addressSeparator || ', ' }}12345 Musterstadt
                      </template>
                      <template v-else>
                        Max Mustermann<br>Musterstraße 1<br>12345 Musterstadt
                      </template>
                    </div>
                    
                    <div v-else-if="el.type === 'address_recipient'" class="leading-tight overflow-hidden">
                      <template v-if="el.addressFormat === 'singleline'">
                        <strong>Erika Mustermann</strong>{{ el.addressSeparator || ', ' }}Beispielweg 99{{ el.addressSeparator || ', ' }}54321 Beispielstadt
                      </template>
                      <template v-else>
                        <strong>Erika Mustermann</strong><br>Beispielweg 99<br>54321 Beispielstadt
                      </template>
                    </div>
                    
                    <div v-else-if="el.type === 'qrcode'" class="bg-gray-800 w-full h-full opacity-50 flex items-center justify-center text-white text-[0.5em]">QR</div>
                    
                    <div v-else-if="el.type === 'image'" class="w-full h-full bg-white flex items-center justify-center border border-dashed border-gray-300 relative overflow-hidden">
                      <img v-if="logoUrl" :src="logoUrl" class="max-w-full max-h-full object-contain" alt="Logo" />
                      <div v-else class="text-gray-400 text-xs text-center p-1">Firmenlogo<br>(Pfad ungültig)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PROPERTIES PANEL -->
            <div class="w-72 bg-white border-l p-4 overflow-y-auto">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Eigenschaften</h4>
              
              <div v-if="selectedElement" class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-500">Typ</label>
                  <div class="text-sm font-medium">{{ selectedElement.type }}</div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs text-gray-500">X (mm)</label>
                    <input v-model.number="selectedElement.x" type="number" step="0.5" class="w-full border rounded p-1 text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500">Y (mm)</label>
                    <input v-model.number="selectedElement.y" type="number" step="0.5" class="w-full border rounded p-1 text-sm">
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs text-gray-500">Breite (mm)</label>
                    <input v-model.number="selectedElement.width" type="number" step="1" class="w-full border rounded p-1 text-sm">
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500">Höhe (mm)</label>
                    <input v-model.number="selectedElement.height" type="number" step="1" class="w-full border rounded p-1 text-sm">
                  </div>
                </div>

                <div v-if="selectedElement.type === 'text'">
                  <label class="block text-xs text-gray-500">Inhalt</label>
                  <textarea v-model="selectedElement.content" rows="3" class="w-full border rounded p-1 text-sm"></textarea>
                </div>

                <div class="border-t pt-4">
                  <label class="block text-xs text-gray-500 mb-1">Schrift</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input v-model.number="selectedElement.fontSize" type="number" placeholder="Size" class="w-full border rounded p-1 text-sm">
                    <select v-model="selectedElement.fontWeight" class="w-full border rounded p-1 text-sm">
                      <option value="normal">Normal</option>
                      <option value="bold">Fett</option>
                    </select>
                  </div>
                  <div class="mt-2 flex space-x-2">
                    <button @click="selectedElement.align = 'left'" :class="{'bg-gray-200': selectedElement.align === 'left'}" class="p-1 border rounded hover:bg-gray-100">L</button>
                    <button @click="selectedElement.align = 'center'" :class="{'bg-gray-200': selectedElement.align === 'center'}" class="p-1 border rounded hover:bg-gray-100">C</button>
                    <button @click="selectedElement.align = 'right'" :class="{'bg-gray-200': selectedElement.align === 'right'}" class="p-1 border rounded hover:bg-gray-100">R</button>
                  </div>
                </div>

                <!-- Address Format Options -->
                <div v-if="selectedElement.type === 'address_sender' || selectedElement.type === 'address_recipient'" class="border-t pt-4 mt-2">
                  <label class="block text-xs text-gray-500 mb-1">Adressformat</label>
                  <select v-model="selectedElement.addressFormat" class="w-full border rounded p-1 text-sm mb-2">
                    <option value="multiline">Mehrzeilig</option>
                    <option value="singleline">Einzeilig</option>
                  </select>
                  
                  <div v-if="selectedElement.addressFormat === 'singleline'">
                    <label class="block text-xs text-gray-500 mb-1">Trennzeichen</label>
                    <div class="grid grid-cols-4 gap-1 mb-2">
                      <button @click="selectedElement.addressSeparator = ', '" :class="{'bg-indigo-100 border-indigo-500': selectedElement.addressSeparator === ', '}" class="p-1 border rounded hover:bg-gray-100 text-xs">, </button>
                      <button @click="selectedElement.addressSeparator = ' | '" :class="{'bg-indigo-100 border-indigo-500': selectedElement.addressSeparator === ' | '}" class="p-1 border rounded hover:bg-gray-100 text-xs">|</button>
                      <button @click="selectedElement.addressSeparator = ' - '" :class="{'bg-indigo-100 border-indigo-500': selectedElement.addressSeparator === ' - '}" class="p-1 border rounded hover:bg-gray-100 text-xs">-</button>
                      <button @click="selectedElement.addressSeparator = '   '" :class="{'bg-indigo-100 border-indigo-500': selectedElement.addressSeparator === '   '}" class="p-1 border rounded hover:bg-gray-100 text-xs">⎵</button>
                    </div>
                    <input v-model="selectedElement.addressSeparator" type="text" placeholder="Eigenes Zeichen" class="w-full border rounded p-1 text-xs" />
                  </div>
                </div>

                <div class="border-t pt-4 mt-4">
                  <button @click="removeElement(selectedElement.id)" class="w-full bg-red-50 text-red-600 py-2 rounded text-sm hover:bg-red-100">
                    Entfernen
                  </button>
                </div>
              </div>
              <div v-else class="text-sm text-gray-400 text-center mt-10">
                Klicke auf ein Element, um es zu bearbeiten.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
