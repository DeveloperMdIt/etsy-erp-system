<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useNotifications } from '../../composables/useNotifications'

const { showSuccess, showError } = useNotifications()

interface EmailTemplate {
    key: string
    label: string
    description: string
    subjectKey: string
    contentKey: string
    defaultSubject: string
    defaultContent: string
}

const templates: EmailTemplate[] = [
    {
        key: 'WELCOME',
        label: 'Willkommens-Email',
        description: 'Wird nach der Registrierung gesendet (falls Verifizierung deaktiviert oder danach).',
        subjectKey: 'SYSTEM_EMAIL_WELCOME_SUBJECT',
        contentKey: 'SYSTEM_EMAIL_WELCOME_CONTENT',
        defaultSubject: 'Willkommen bei Inventivy!',
        defaultContent: `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Willkommen bei Inventivy</title>
</head>
<body style="margin:0; padding:0; background:#f6f7fb; font-family: Arial, sans-serif; color:#111827;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7fb;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(17,24,39,0.08);">
          <tr>
            <td style="background:#111827; padding:22px 24px;">
              <img src="https://inventivy.de/logo.png" alt="Inventivy" width="150" style="display:block; border:0; max-width:100%; height:auto; margin-bottom:8px;" />
              <div style="font-size:13px; color:#e5e7eb;">Willkommen bei Inventivy</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <h1 style="margin:0 0 14px 0; font-size:22px; color:#111827;">Willkommen!</h1>
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6; color:#374151;">
                Sehr geehrte(r) <strong>{firstName} {lastName}</strong>,
              </p>
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6; color:#374151;">
                wir freuen uns sehr, Sie bei <strong>Inventivy</strong> begrüßen zu dürfen.
                Vielen Dank für Ihre Registrierung und das Vertrauen in unser System.
              </p>
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6; color:#374151;">
                Inventivy unterstützt Sie dabei, Abläufe zu vereinfachen und wertvolle Zeit im Alltag zu sparen.
                Nutzen Sie die gewonnenen Freiräume für das, was Ihnen wirklich wichtig ist.
              </p>
              <p style="margin:0 0 14px 0; font-size:15px; line-height:1.6; color:#374151;">
                Sollten Sie Fragen, Wünsche oder Anregungen haben, stehen wir Ihnen jederzeit gerne zur Verfügung.
              </p>
              <p style="margin:18px 0 0 0; font-size:15px; line-height:1.6; color:#374151;">
                Wir wünschen Ihnen viel Erfolg und Freude bei der Nutzung von Inventivy.
              </p>
              <p style="margin:12px 0 0 0; font-size:15px; line-height:1.6; color:#374151;">
                Ihr Team von <strong>Inventivy</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px; background:#f9fafb; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-size:12px; line-height:1.6; color:#6b7280;">
                Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese Nachricht.
              </p>
            </td>
          </tr>
        </table>
        <div style="height:14px;"></div>
        <div style="font-size:12px; color:#9ca3af; max-width:600px; text-align:center;">
          © Inventivy – Alle Rechte vorbehalten
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    {
        key: 'VERIFY',
        label: 'Verifizierungs-Email',
        description: 'Enthält den Link zur Bestätigung der Email-Adresse.',
        subjectKey: 'SYSTEM_EMAIL_VERIFY_SUBJECT',
        contentKey: 'SYSTEM_EMAIL_VERIFY_CONTENT',
        defaultSubject: 'Bitte bestätigen Sie Ihre Email',
        defaultContent: '<h1>Email Bestätigung</h1><p>Bitte klicken Sie <a href="{link}">hier</a>.</p>'
    }
]

const selectedTemplate = ref<EmailTemplate | null>(null)
const form = ref({
    subject: '',
    content: ''
})
const isLoading = ref(false)
const lastFocusedInput = ref<'subject' | 'content'>('content')
const subjectInput = ref<HTMLInputElement | null>(null)
const contentInput = ref<HTMLTextAreaElement | null>(null)

// Variables
const availableVars = [
    { label: 'Vorname', value: '{firstName}' },
    { label: 'Nachname', value: '{lastName}' },
    { label: 'Link (Verifizierung)', value: '{link}' }
]

const insertVariable = (variable: string) => {
    if (lastFocusedInput.value === 'content' && contentInput.value) {
        const el = contentInput.value
        const start = el.selectionStart
        const end = el.selectionEnd
        const text = form.value.content
        const before = text.substring(0, start)
        const after = text.substring(end, text.length)
        form.value.content = before + variable + after
        setTimeout(() => {
            el.focus()
            el.selectionStart = el.selectionEnd = start + variable.length
        }, 0)
    } else if (lastFocusedInput.value === 'subject' && subjectInput.value) {
        const el = subjectInput.value
        const start = el.selectionStart || 0
        const end = el.selectionEnd || 0
        const text = form.value.subject
        const before = text.substring(0, start)
        const after = text.substring(end, text.length)
        form.value.subject = before + variable + after
        setTimeout(() => {
            el.focus()
            el.selectionStart = el.selectionEnd = start + variable.length
        }, 0)
    }
}

const loadTemplate = async (tmpl: EmailTemplate) => {
    selectedTemplate.value = tmpl
    isLoading.value = true
    try {
        // Load Subject
        const resSub = await axios.get(`/api/admin/settings`)
        // Filter client side finding for now due to existing API structure
        // Or better: The admin settings endpoint returns array.
        const settings = resSub.data as Array<{key: string, value: string}>
        
        const subj = settings.find(s => s.key === tmpl.subjectKey)
        const cont = settings.find(s => s.key === tmpl.contentKey)

        form.value.subject = subj ? subj.value : tmpl.defaultSubject
        form.value.content = cont ? cont.value : tmpl.defaultContent

    } catch (e) {
        console.error(e)
        showError('Fehler beim Laden der Vorlage')
    } finally {
        isLoading.value = false
    }
}

const saveTemplate = async () => {
    if (!selectedTemplate.value) return
    isLoading.value = true
    try {
        await axios.put('/api/admin/settings', {
            settings: [
                { key: selectedTemplate.value.subjectKey, value: form.value.subject },
                { key: selectedTemplate.value.contentKey, value: form.value.content }
            ]
        })
        showSuccess('Vorlage gespeichert')
        selectedTemplate.value = null // Close editor
    } catch (e) {
        console.error(e)
        showError('Fehler beim Speichern')
    } finally {
        isLoading.value = false
    }
}

// PREVIEW & TEST LOGIC
import { computed } from 'vue'

const showPreview = ref(false)
const showTestModal = ref(false)
const testRecipient = ref('')
const isSendingTest = ref(false)

const getPreviewData = (text: string) => {
    let res = text
    res = res.replace(/{firstName}/g, 'Max')
    res = res.replace(/{lastName}/g, 'Mustermann')
    res = res.replace(/{link}/g, 'https://inventivy.de/verify-email?token=beispiel-token-123')
    return res
}

const previewSubject = computed(() => getPreviewData(form.value.subject))
const previewContent = computed(() => getPreviewData(form.value.content))

const sendTestEmail = async () => {
    if (!testRecipient.value) return
    isSendingTest.value = true
    try {
        await axios.post('/api/admin/emails/test', {
            recipient: testRecipient.value,
            subject: getPreviewData(form.value.subject), // Send with dummy data filled in
            content: getPreviewData(form.value.content)
        })
        showSuccess(`Test-E-Mail an ${testRecipient.value} gesendet`)
        showTestModal.value = false
        testRecipient.value = ''
    } catch (e) {
        console.error(e)
        showError('Fehler beim Senden der Test-E-Mail')
    } finally {
        isSendingTest.value = false
    }
}
</script>

<template>
    <div class="space-y-6">
        <h1 class="text-2xl font-bold text-gray-900">System E-Mail Vorlagen</h1>
        <p class="text-gray-600">Bearbeiten Sie die E-Mails, die das System automatisch versendet.</p>

        <!-- List -->
        <div v-if="!selectedTemplate" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="tmpl in templates" :key="tmpl.key" class="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">{{ tmpl.label }}</h3>
                <p class="text-sm text-gray-500 mt-2 mb-4">{{ tmpl.description }}</p>
                <button @click="loadTemplate(tmpl)" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                    Bearbeiten &rarr;
                </button>
            </div>
        </div>

        <!-- Editor -->
        <div v-else class="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Bearbeiten: {{ selectedTemplate.label }}</h3>
                <div class="space-x-2 flex items-center">
                    <button @click="showPreview = true" class="px-3 py-2 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 text-sm">
                        Vorschau
                    </button>
                    <button @click="showTestModal = true" class="px-3 py-2 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 text-sm">
                        Test-Email senden
                    </button>
                    <div class="w-px h-6 bg-gray-300 mx-2"></div>
                    <button @click="selectedTemplate = null" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Abbrechen</button>
                    <button @click="saveTemplate" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" :disabled="isLoading">
                        {{ isLoading ? 'Speichert...' : 'Speichern' }}
                    </button>
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Betreff</label>
                    <input 
                        ref="subjectInput"
                        v-model="form.subject" 
                        @focus="lastFocusedInput = 'subject'"
                        type="text" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Inhalt (HTML)</label>
                    
                    <!-- Toolbar for variables -->
                    <div class="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded border border-gray-100">
                        <span class="text-xs text-gray-500 flex items-center mr-2">Variablen einfügen:</span>
                        <button 
                            v-for="v in availableVars" 
                            :key="v.value"
                            @click="insertVariable(v.value)"
                            class="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                            title="Klicken zum Einfügen"
                        >
                            {{ v.value }}
                        </button>
                    </div>

                    <textarea 
                        ref="contentInput"
                        v-model="form.content" 
                        @focus="lastFocusedInput = 'content'"
                        rows="15" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm"
                    ></textarea>
                </div>
            </div>
        </div>

        <!-- PREVIEW MODAL -->
        <div v-if="showPreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 class="font-bold text-lg">Vorschau</h3>
                    <button @click="showPreview = false" class="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div class="p-6 overflow-y-auto flex-1 bg-gray-100">
                    <div class="bg-white shadow-sm p-8 max-w-2xl mx-auto min-h-[400px]">
                        <!-- Subject Preview -->
                        <div class="border-b pb-4 mb-4">
                            <span class="text-gray-500 text-sm block">Betreff:</span>
                            <span class="font-bold text-lg">{{ previewSubject }}</span>
                        </div>
                        <!-- Content Preview -->
                        <div class="prose max-w-none" v-html="previewContent"></div>
                    </div>
                </div>
                <div class="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
                    <button @click="showPreview = false" class="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Schließen</button>
                </div>
            </div>
        </div>

        <!-- TEST EMAIL MODAL -->
        <div v-if="showTestModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div class="p-6">
                    <h3 class="font-bold text-lg mb-4">Test-Email senden</h3>
                    <p class="text-sm text-gray-600 mb-4">An welche Adresse soll die Test-Email gesendet werden?</p>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Empfänger E-Mail</label>
                    <input v-model="testRecipient" type="email" placeholder="test@beispiel.de" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm mb-4">
                    
                    <div class="flex justify-end space-x-2">
                        <button @click="showTestModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Abbrechen</button>
                        <button @click="sendTestEmail" :disabled="isSendingTest || !testRecipient" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center">
                            <span v-if="isSendingTest" class="mr-2 animate-spin">⟳</span>
                            {{ isSendingTest ? 'Sende...' : 'Senden' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
