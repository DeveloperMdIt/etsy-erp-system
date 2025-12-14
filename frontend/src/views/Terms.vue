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
      <div class="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow p-4 sm:p-12 prose prose-blue prose-sm sm:prose-lg break-words overflow-hidden">
        
        <h1>Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <h2>§ 1 Geltungsbereich und Anbieter</h2>
        <p>
          (1) Die nachfolgenden Allgemeinen Geschäftsbedingungen gelten für alle Geschäftsbeziehungen zwischen<br><br>
          <strong>Inventivy</strong><br>
          Michael Deja<br>
          An der Hohl 4<br>
          36318 Schwalmtal<br>
          E-Mail: info@inventivy.de<br><br>
          (nachfolgend "Anbieter" oder "Inventivy") und den Nutzern der Software-Lösung Inventivy (nachfolgend "Kunde").
        </p>
        <p>
          (2) Das Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB, also an natürliche oder juristische Personen oder rechtsfähige Personengesellschaften, die bei Abschluss des Rechtsgeschäfts in Ausübung ihrer gewerblichen oder selbständigen beruflichen Tätigkeit handeln. Mit der Registrierung bestätigt der Kunde, dass er Unternehmer ist.
        </p>

        <h2>§ 2 Vertragsgegenstand und Testphase</h2>
        <p>
          (1) Der Anbieter stellt dem Kunden eine webbasierte Software-Lösung (SaaS) zur Verfügung, die Schnittstellen zu verschiedenen E-Commerce-Plattformen (wie Etsy), Versanddienstleistern und Zahlungsanbietern bereitstellt.
        </p>
        <p>
          (2) <strong>30 Tage kostenlose Testphase:</strong> Nach der Registrierung kann der Kunde die Software 30 Tage lang kostenlos und unverbindlich testen (Starter-Paket). Die Testphase endet automatisch. Es erfolgt keine automatische Umwandlung in ein kostenpflichtiges Abonnement, sofern der Kunde dies nicht aktiv bucht.
        </p>
        <p>
          (3) <strong>Dauerhafte kostenlose Basis-Nutzung:</strong> Nach Ablauf der Testphase wird der Account automatisch in den kostenlosen "Basis"-Tarif umgestellt, sofern der Kunde nicht mehr als 20 Bestellungen pro Monat importiert. Sollte das Volumen höher sein, wird der Kunde aufgefordert, ein passendes Paket zu buchen.
        </p>

        <h2>§ 3 Bereitstellung von ANWENDUNG und Speicherplatz</h2>
        <p>
          (1) Der Anbieter hält ab Vertragsschluss auf einer zentralen Datenverarbeitungsanlage (im Folgenden: SERVER) die vereinbarte ANWENDUNG in der jeweils aktuellen Version zur Nutzung bereit.
        </p>
        <p>
          (2) Der Anbieter haftet dafür, dass die bereit gestellte ANWENDUNG für die vereinbarten Zwecke geeignet ist und während der gesamten Vertragslaufzeit frei von Mängeln ist.
        </p>
        <p>
          (3) Der Anbieter gewährt dem Kunden Zugang zur ANWENDUNG durch Eingabe des vom Kunden gewählten Benutzernamens und eines sicheren Passworts.
        </p>
        <p>
          (4) Wartungsfenster werden dem Kunden rechtzeitig angekündigt.
        </p>
        <p>
          (5) Die ANWENDUNG und die ANWENDUNGSDATEN werden auf dem SERVER regelmäßig gesichert. Für die Einhaltung handels- und steuerrechtlicher Aufbewahrungsfristen ist der Kunde selbst verantwortlich.
        </p>

        <h2>§ 4 ZUGRIFFSSOFTWARE</h2>
        <p>
          (1) Die erforderliche ZUGRIFFSSOFTWARE ist ein handelsüblicher, aktueller Webbrowser (siehe Anhang 1).
        </p>
        <p>
          (2) Der Kunde hat die Installation und den Betrieb der ZUGRIFFSSOFTWARE selbst zu verantworten.
        </p>

        <h2>§ 5 Nutzungsrechte</h2>
        <p>
          (1) Der Kunde erhält an der ANWENDUNG einfache, nicht übertragbare, auf die Laufzeit dieses Vertrags beschränkte Nutzungsrechte.
        </p>
        <p>
          (2) Der Kunde ist verpflichtet, die Zugangsdaten geheim zu halten und vor dem Zugriff Dritter zu schützen.
        </p>
        <p>
          (3) Der Kunde haftet dafür, dass die ANWENDUNG nicht zu gesetzeswidrigen Zwecken verwendet wird.
        </p>

        <h2>§ 6 Haftung für Rechte Dritter</h2>
        <p>
          Der Anbieter haftet nicht für eine Verletzung der Rechte Dritter durch den Kunden, sofern und soweit sich diese Verletzung aus einer Überschreitung der nach diesem Vertrag eingeräumten Nutzungsrechte ergibt.
        </p>

        <h2>§ 7 Entgelt, Zahlungsmodalitäten</h2>
        <p>
          (1) Das Entgelt richtet sich nach der bei Vertragsabschluss jeweils gültigen Preisliste des Anbieters (unter /pricing einsehbar).
        </p>
        <p>
          (2) Die Rechnungsstellung erfolgt monatlich. Rechnungsbeträge sind sofort zur Zahlung fällig.
        </p>
        <p>
          (3) Die Rechnungen werden per E-Mail versendet oder im Kundenkonto bereitgestellt.
        </p>
        <p>
          (4) Die Zahlung erfolgt in der Regel per Lastschrift oder Kreditkarte über den angebundenen Zahlungsdienstleister.
        </p>
        <p>
          (5) Alle Preise verstehen sich zzgl. gesetzlicher Umsatzsteuer.
        </p>

        <h2>§ 8 Pflichten des Kunden</h2>
        <p>
          Der Kunde wird alle vereinbarten Pflichten erfüllen, insbesondere die Zugangsdaten geheim halten und keine unberechtigten Eingriffe in die Software vornehmen. Er ist verpflichtet, regelmäßige Datensicherungen seiner Daten durch Export aus der Anwendung vorzunehmen.
        </p>

        <h2>§ 9 Datensicherheit, Datenschutz</h2>
        <p>
          (1) Die Parteien beachten die geltenden datenschutzrechtlichen Bestimmungen, insbesondere die DSGVO.
        </p>
        <p>
          (2) Der Anbieter erhebt und nutzt kundenbezogene Daten nur im Rahmen der Vertragsdurchführung.
        </p>
        <p>
          (3) Es wird ein Vertrag zur Auftragsverarbeitung (AVV) nach Art. 28 DSGVO geschlossen.
        </p>

        <h2>§ 10 Geheimhaltung</h2>
        <p>
          Die Vertragspartner verpflichten sich, über alle vertraulichen Informationen Stillschweigen zu bewahren.
        </p>

        <h2>§ 11 Haftung</h2>
        <p>
          (1) Bei Vorsatz oder grober Fahrlässigkeit haftet der Anbieter unbeschränkt.
        </p>
        <p>
          (2) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten, beschränkt auf den vorhersehbaren Schaden.
        </p>
        <p>
          (3) Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
        </p>

        <h2>§ 12 Laufzeit, Kündigung</h2>
        <p>
          (1) Der Vertrag wird auf unbestimmte Zeit geschlossen.
        </p>
        <p>
          (2) Das Vertragsverhältnis kann vom Kunden jederzeit, vom Anbieter mit einer Frist von vier Wochen zum Monatsende gekündigt werden.
        </p>
        <p>
          (3) Das Recht zur außerordentlichen Kündigung bleibt unberührt.
        </p>

        <h2>§ 13 Pflichten nach Vertragsende</h2>
        <p>
          Der Kunde ist verpflichtet, seine Daten vor Vertragsende zu exportieren. Nach Vertragsende werden die Daten nach einer Karenzzeit gelöscht.
        </p>

        <h2>§ 14 Schlussbestimmungen</h2>
        <p>
          (1) Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
        </p>
        <p>
          (2) Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Anbieters.
        </p>
        
        <p class="mt-8 text-sm text-gray-500">Stand: 12/2025</p>

        <hr class="my-8" />

        <h2>Anhang 1: Leistungsbeschreibung & Systemvoraussetzungen</h2>
        <h3>Leistungsbeschreibung</h3>
        <p>
          Inventivy bietet eine Auftragsabwicklung, Artikelverwaltung und Automatisierungslösung für Verkäufer. Es werden Schnittstellen zu Marktplätzen (z.B. Etsy) und Versanddienstleistern bereitgestellt.
        </p>
        <h3>Systemvoraussetzungen</h3>
        <ul>
          <li>Aktueller Webbrowser (Chrome, Firefox, Edge, Safari)</li>
          <li>Internetanschluss (empfohlen mind. 10 Mbit/s)</li>
          <li>Bildschirmauflösung mind. 1920x1080 empfohlen</li>
        </ul>
        <h3>Passwortrichtlinie</h3>
        <ul>
          <li>Mindestens 8 Zeichen</li>
          <li>Kombination aus Buchstaben und Zahlen empfohlen</li>
        </ul>

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
h3 {
  @apply text-xl font-bold text-gray-800 mt-8 mb-3;
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
a {
  @apply text-inventivy-blue hover:text-blue-700 underline;
}
</style>
