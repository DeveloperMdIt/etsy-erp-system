<script setup lang="ts">
import { onMounted } from 'vue'
import PublicHeader from '../components/PublicHeader.vue'
import PublicFooter from '../components/PublicFooter.vue'
import BackToTop from '../components/BackToTop.vue'

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <PublicHeader />

    <div class="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow sm:p-12 p-6 prose prose-blue prose-lg">
        
        <h1>Über uns – Inventivy</h1>
        
        <!-- Intro / Warum Inventivy -->
        <h2>Warum Inventivy?</h2>
        <p class="lead">
          Viele Warenwirtschafts- und ERP-Systeme sind entweder funktional eingeschränkt oder wirtschaftlich kaum tragbar – insbesondere für Einzelunternehmer und kleine Unternehmen. Inventivy verfolgt einen anderen Ansatz.
        </p>
        
        <p><strong>Inventivy steht für:</strong></p>
        <ul class="checklist">
          <li>Praxisorientierte Funktionen statt unnötiger Komplexität</li>
          <li>Bezahlbare Nutzung ohne hohe Einstiegshürden</li>
          <li>Modulare Erweiterbarkeit nach tatsächlichem Bedarf</li>
          <li>Transparente Kostenstrukturen</li>
          <li>Entwicklung aus realen Anforderungen des Onlinehandels</li>
        </ul>

        <p class="font-medium text-gray-800 border-l-4 border-inventivy-blue pl-4 py-1 bg-blue-50">
          Inventivy ist kein theoretisches ERP-System, sondern ein Werkzeug für den täglichen Einsatz im E-Commerce.
        </p>

        <!-- Vision & Roadmap -->
        <h2>Vision & Zukunft</h2>
        <p>
          Inventivy ist als langfristig wachsendes System konzipiert. Ziel ist der Aufbau einer zentralen Plattform, die die wichtigsten Prozesse des Onlinehandels zuverlässig und bezahlbar abdeckt.
        </p>
        
        <h3>Geplante Erweiterungen</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mt-6 mb-8">
          <div class="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h4 class="font-bold text-gray-900 mb-3 text-lg">Daten & Qualität</h4>
            <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Adressvervollständigung</li>
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Adressprüfung zur Reduzierung von Rückläufern</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-5 rounded-lg border border-gray-100">
             <h4 class="font-bold text-gray-900 mb-3 text-lg">Finanzen & Buchhaltung</h4>
             <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Zahlungsanbindungen (Banken und Zahlungsdienste)</li>
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Schnittstellen zu lexoffice, BuchhaltungsButler und sevDesk</li>
             </ul>
          </div>

          <div class="bg-gray-50 p-5 rounded-lg border border-gray-100">
             <h4 class="font-bold text-gray-900 mb-3 text-lg">Verkauf & Marktplätze</h4>
             <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Anbindungen an eBay, Amazon, Kaufland und weitere Plattformen</li>
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Erweiterung auf zusätzliche Verkaufskanäle</li>
             </ul>
          </div>

          <div class="bg-gray-50 p-5 rounded-lg border border-gray-100">
             <h4 class="font-bold text-gray-900 mb-3 text-lg">Versand & Logistik</h4>
             <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Integration weiterer Paket- und Versanddienstleister</li>
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Optimierung von Versand- und Labelprozessen</li>
             </ul>
          </div>
           <div class="bg-gray-50 p-5 rounded-lg border border-gray-100 md:col-span-2">
             <h4 class="font-bold text-gray-900 mb-3 text-lg">Shops & Systeme</h4>
             <ul class="space-y-2 text-gray-600 text-sm">
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Anbindung an WordPress/WooCommerce, Shopify und weitere Shopsysteme</li>
                <li class="flex items-start"><span class="mr-2 text-inventivy-blue">•</span>Langfristige Entwicklung eines eigenen Shopsystems, direkt integriert in die Warenwirtschaft</li>
             </ul>
          </div>
        </div>

        <p>
          Alle Erweiterungen folgen einem klaren Grundsatz: <strong>echter Nutzen, messbare Zeitersparnis und wirtschaftliche Tragfähigkeit.</strong>
        </p>

        <!-- Vertrauen & Mitgestaltung -->
        <h2>Zusammenarbeit & Weiterentwicklung</h2>
        <p>
          Inventivy wird kontinuierlich weiterentwickelt.
          Anregungen und praxisnahe Funktionswünsche aus dem täglichen Einsatz sind ausdrücklich willkommen und fließen – sofern sinnvoll und realistisch – in die Planung zukünftiger Module ein.
        </p>
        <p>
          So entsteht ein System, das sich an realen Anforderungen orientiert und gemeinsam mit seinen Nutzern wächst.
        </p>

        <!-- Closing -->
        <div class="mt-12 p-8 bg-inventivy-blue/5 rounded-xl text-center border border-inventivy-blue/10">
          <p class="text-xl font-bold text-gray-800 italic m-0">
            "Inventivy – modular, praxisnah und wirtschaftlich gedacht."
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
  @apply text-2xl font-bold text-gray-800 mt-12 mb-6 pb-2 border-b border-gray-200;
}
h3 {
  @apply text-xl font-bold text-gray-800 mt-8 mb-4;
}
p {
  @apply text-gray-600 mb-4 leading-relaxed;
}
/* Custom checklist style */
ul.checklist {
  @apply list-none pl-0 mb-6 space-y-2;
}
ul.checklist li {
  @apply relative pl-8 text-gray-700 font-medium;
}
ul.checklist li::before {
  content: "✓";
  @apply absolute left-0 text-inventivy-blue font-bold;
}
</style>
