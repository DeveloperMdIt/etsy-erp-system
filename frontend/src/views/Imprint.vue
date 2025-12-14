<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PublicHeader from '../components/PublicHeader.vue'
import PublicFooter from '../components/PublicFooter.vue'
import BackToTop from '../components/BackToTop.vue'

const cmsContent = ref('')
const loading = ref(true)

onMounted(async () => {
  window.scrollTo(0, 0)
  try {
    const res = await axios.get('/api/public/content/imprint')
    if (res.data && res.data.content) {
      cmsContent.value = res.data.content
    }
  } catch (e) {
    // Keep default content
    console.log('Using default imprint')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col overflow-x-hidden w-full">
    <PublicHeader />

    <div class="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow p-4 sm:p-12 prose prose-blue prose-sm sm:prose-lg break-words overflow-hidden">
        
        <div v-if="!loading && cmsContent" v-html="cmsContent"></div>
        <div v-else>
            <h1>Impressum</h1>

            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
                Inventivy<br>
                Michael Deja<br>
                An der Hohl 4<br>
                36318 Schwalmtal<br>
                Deutschland
            </p>

            <h2>Kontakt</h2>
            <p>
                E-Mail: info@inventivy.de<br>
            </p>

            <h2>Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>

             <h2>Haftung für Inhalte</h2>
             <p>
                 Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
             </p>
        </div>
      </div>
    </div>

    <PublicFooter />
    <BackToTop />
  </div>
</template>

<style scoped>
h1 {
  @apply text-3xl font-bold text-gray-900 mb-8;
}
h2 {
  @apply text-2xl font-bold text-gray-800 mt-10 mb-4 pb-2 border-b border-gray-200;
}
p {
  @apply text-gray-600 mb-4 leading-relaxed;
}
a {
  @apply text-inventivy-blue hover:text-blue-700 underline;
}
</style>
