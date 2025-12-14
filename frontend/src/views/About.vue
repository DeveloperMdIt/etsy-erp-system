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
        
        <p class="lead text-xl text-gray-600">
          Inventivy ist aus der Praxis des E-Commerce entstanden.
        </p>
        
        <p>
          Seit mehreren Jahren sind wir selbst im Onlinehandel tätig und haben in dieser Zeit zahlreiche Warenwirtschafts-, ERP- und Versandlösungen im Alltag eingesetzt und getestet.
        </p>

        <p>
          Dabei zeigte sich immer wieder dasselbe Bild:
          Entweder fehlten genau die Funktionen, die für einen effizienten Arbeitsalltag notwendig sind, oder die Systeme waren preislich so angesetzt, dass sie für Einzelunternehmer und kleine Unternehmen im heutigen Wettbewerbsumfeld kaum wirtschaftlich nutzbar waren.
        </p>

        <p>
          Mit zunehmendem Bestellvolumen wurde zudem deutlich, dass einfache Lösungen wie Excel-Listen, manuelle Datenpflege und händische Labelerstellung keine tragfähige Basis mehr darstellen. Um Zeit zu sparen und Prozesse zu stabilisieren, mussten professionelle Systeme eingesetzt werden – auch wenn diese oft unnötig komplex oder kostenintensiv waren.
        </p>

        <h3 class="text-inventivy-blue font-bold mt-8">Aus genau diesem Spannungsfeld heraus ist Inventivy entstanden.</h3>

        <p>
          Unser Anspruch ist es, eine Warenwirtschaft zu entwickeln, die leistbar bleibt, praxisnah funktioniert und dennoch umfangreiche Funktionen bietet, die den Arbeitsalltag von Onlinehändlern nachhaltig erleichtern. Inventivy richtet sich gezielt an kleine und mittlere Händler, die professionell arbeiten möchten, ohne sich an hohe Fixkosten oder überdimensionierte Systeme zu binden.
        </p>

        <p>
          Inventivy wird konsequent aus der praktischen Anwendung heraus weiterentwickelt. Neue Funktionen und Module entstehen nicht aus theoretischen Konzepten, sondern aus realen Anforderungen des täglichen E-Commerce-Betriebs.
        </p>

        <h2>Vision & Weiterentwicklung</h2>
        <p>
          Inventivy ist als modulares System konzipiert und wird schrittweise erweitert. Geplant sind unter anderem folgende Module und Anbindungen:
        </p>
        <ul>
          <li>Adressvervollständigung und Adressprüfung zur Reduzierung von Fehlzustellungen</li>
          <li>Zahlungsanbindungen, unter anderem an Bank- und Zahlungsdienste</li>
          <li>Schnittstellen zu Buchhaltungs- und Abrechnungssystemen wie lexoffice, BuchhaltungsButler und sevDesk</li>
          <li>Anbindungen an weitere Verkaufsplattformen wie eBay, Amazon, Kaufland und weitere Marktplätze</li>
          <li>Integration zusätzlicher Paket- und Versanddienstleister</li>
          <li>Anbindungen an Shopsysteme wie WordPress/WooCommerce, Shopify und weitere Systeme</li>
          <li>Langfristig die Weiterentwicklung eines eigenen Shopsystems, das direkt aus der Warenwirtschaft heraus betrieben werden kann</li>
        </ul>
        <p>
          Alle Erweiterungen folgen dabei einem klaren Grundsatz: bezahlbar bleiben, echten Nutzen schaffen und messbar Zeit sparen.
        </p>

        <h2>Hinter Inventivy</h2>
        <p>
          Inventivy vereint technische Kompetenz mit praxisnaher Anwenderperspektive.
          Die Entwicklung erfolgt durch einen Fachinformatiker mit logistischem Hintergrund, wodurch Prozesse, Abläufe und Anforderungen aus der Praxis direkt in die Software einfließen. Ergänzt wird diese Sicht durch kontinuierliches Testen aus Anwendersicht, insbesondere durch nicht technisch geprägte Nutzer. Dadurch wird sichergestellt, dass Inventivy nicht nur leistungsfähig, sondern auch verständlich und effizient bedienbar bleibt.
        </p>

        <h2>Mitgestalten statt nur nutzen</h2>
        <p>
          Inventivy versteht sich als wachsendes System.
          Wünsche, Anregungen und praxisnahe Ideen für neue Funktionen oder Module sind ausdrücklich willkommen und fließen – sofern sinnvoll und umsetzbar – in die Weiterentwicklung ein.
        </p>

        <p class="font-bold text-gray-800 mt-8 border-l-4 border-inventivy-blue pl-4">
          Inventivy – eine Warenwirtschaft aus der Praxis für den professionellen Onlinehandel.
        </p>

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
ul {
  @apply list-disc pl-5 mb-4 text-gray-600;
}
li {
  @apply mb-1;
}
</style>
