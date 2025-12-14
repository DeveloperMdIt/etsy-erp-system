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
        
        <h1>Vertrag zur Auftragsverarbeitung (AVV)</h1>
        <p>nach Art. 28 DSGVO</p>

        <h2>I Präambel</h2>
        <p>
          Die Vertragsparteien sind mit der Leistungsvereinbarung und deren Durchführung ein Auftragsverarbeitungsvertrag (nachstehend "Vertrag" genannt) im Sinne des Art. 28 EU-Datenschutz-Grundverordnung (nachstehend "DSGVO" genannt) eingegangen. Um in Ergänzung zu der Leistungsvereinbarung die hieraus resultierenden datenschutzrechtlichen Rechte und Pflichten der Vertragsparteien hinsichtlich der Verarbeitung von personenbezogenen Daten durch den Auftragsverarbeiter im Auftrag des Auftraggebers gemäß den gesetzlichen Verpflichtungen zu konkretisieren, schließen die Vertragsparteien den nachfolgenden Vertrag.
        </p>

        <h2>II Anwendungsbereich</h2>
        <p>
          Der Auftragsverarbeiter verarbeitet personenbezogene Daten im Auftrag des Auftraggebers. Der Auftraggeber ist im Rahmen dieses Vertrages für die Einhaltung der gesetzlichen Bestimmungen der Datenschutzgesetze, insbesondere für die Rechtmäßigkeit der Datenweitergabe an den Auftragsverarbeiter allein verantwortlich ("Verantwortlicher" im Sinne des Art. 4 Nr. 7 DSGVO). Dieser Vertrag findet Anwendung auf alle Tätigkeiten des Auftragsverarbeiters bei denen durch den Auftragsverarbeiter oder durch ihn beauftragte Dritte mit personenbezogenen Daten des Auftraggebers in Berührung kommen können.
        </p>

        <h2>III Gegenstand und Dauer der Auftragsverarbeitung</h2>
        <p>
          <strong>Gegenstand und Spezifizierung der Auftragsverarbeitung:</strong> Der Auftragsverarbeiter verarbeitet im Rahmen dieses Auftrages personenbezogene Daten für den Auftraggeber im Sinne von Art. 4 Nr. 2 und Art. 28 DSGVO auf Grundlage dieses Vertrages. Aus dem Leistungsvereinbarung ergeben sich Gegenstand und Dauer der Auftragsverarbeitung. Eine Spezifizierung, sowie Art und Zweck der Auftragsverarbeitung, werden im Anhang "Gegenstand der Auftragsverarbeitung" konkretisiert.
        </p>
        <p>
          <strong>Räumlicher Anwendungsbereich:</strong> Die vertraglich vereinbarte Dienstleistung wird ausschließlich in einem Mitgliedstaat der Europäischen Union oder in einem Vertragsstaat des Abkommens über den Europäischen Wirtschaftsraum erbracht.
        </p>
        <p>
          <strong>Dauer der Auftragsverarbeitung:</strong> Der Vertrag beginnt mit Unterzeichnung beider Vertragsparteien (durch Registrierung und Bestätigung). Die Laufzeit richtet sich nach der Laufzeit des zugrundeliegenden Vertragsverhältnisses.
        </p>

        <h2>IV Pflichten des Auftragsverarbeiters</h2>
        <p>
          Der Auftragsverarbeiter verpflichtet sich, Daten nur auf dokumentierte Weisung des Auftraggebers zu verarbeiten. Er gewährleistet die Vertraulichkeit und unterstützt den Auftraggeber bei der Wahrung von Betroffenenrechten sowie bei der Einhaltung der Pflichten nach Art. 32-36 DSGVO.
        </p>
        <p>
          <strong>Datenschutzbeauftragter:</strong> Aufgrund der gesetzlichen Bestimmungen ist kein Datenschutzbeauftragter bestellt. Datenschutzanfragen sind zu richten an: info@inventivy.de
        </p>

        <h2>V Rechte und Pflichten des Auftraggebers</h2>
        <p>
          Der Auftraggeber ist für die Einhaltung der Datenschutzgesetze verantwortlich. Er hat den Auftragsverarbeiter unverzüglich über Fehler oder Unregelmäßigkeiten zu informieren.
        </p>

        <h2>VI Weisungen</h2>
        <p>
          Der Auftragsverarbeiter darf Daten nur auf Weisung des Auftraggebers verarbeiten. Weisungen in Textform sind an <strong>info@inventivy.de</strong> zu senden.
        </p>

        <h2>VII Technisch-organisatorische Maßnahmen</h2>
        <p>
          Der Auftragsverarbeiter trifft geeignete technische und organisatorische Maßnahmen gemäß Art. 32 DSGVO, um ein angemessenes Schutzniveau zu gewährleisten (siehe Anhang).
        </p>

        <h2>VIII Kontrollrechte</h2>
        <p>
          Der Auftraggeber hat das Recht, Überprüfungen durchzuführen.
        </p>

        <h2>IX Subunternehmen</h2>
        <p>
          Der Auftraggeber stimmt der Beauftragung von Subunternehmen zu. Aktuelle Subunternehmen sind im Anhang aufgeführt.
        </p>

        <h2>X Löschung und Rückgabe</h2>
        <p>
          Nach Vertragsbeendigung hat der Auftraggeber Anspruch auf Herausgabe oder Löschung der Daten.
        </p>

        <h2>XI Haftung</h2>
        <p>
          Die Parteien haften gemäß Art. 82 DSGVO.
        </p>

        <h2>XII Schlussbestimmungen</h2>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist der Sitz des Auftragsverarbeiters.
        </p>

        <hr class="my-8" />

        <h2>Anhang: Gegenstand der Auftragsverarbeitung</h2>
        <h3>Art der Daten</h3>
        <ul>
          <li>Personenstammdaten</li>
          <li>Kommunikationsdaten (z.B. Telefon, E-Mail)</li>
          <li>Vertragsstammdaten</li>
          <li>Kundenhistorie</li>
          <li>Artikeldaten, Bestelldaten, Käuferdaten</li>
        </ul>

        <h3>Art und Zweck der Datenverarbeitung</h3>
        <p>
          Inventivy bietet eine Auftragsabwicklung, Warenwirtschaft und Automatisierungslösung für Verkäufer. Zweck ist die Bereitstellung dieser Dienste.
        </p>

        <h3>Kategorie der betroffenen Personen</h3>
        <ul>
          <li>Auftraggeber (Shopbetreiber)</li>
          <li>Kunden des Shopbetreibers</li>
          <li>Lieferanten</li>
        </ul>

        <hr class="my-8" />

        <h2>Anhang: Technisch-Organisatorische Maßnahmen (TOMs)</h2>
        
        <h3>1. Vertraulichkeit</h3>
        <ul>
          <li><strong>Zutrittskontrolle:</strong> Kein unbefugter Zutritt zu Serverräumen (durch Hosting-Provider gesichert). Zutrittskontrolle bei Inventivy (Büroräume).</li>
          <li><strong>Zugangskontrolle:</strong> Sichere Passwörter, verschlüsselte Übertragung.</li>
          <li><strong>Zugriffskontrolle:</strong> Berechtigungskonzepte, Logging von Zugriffen.</li>
          <li><strong>Trennungskontrolle:</strong> Mandantenfähigkeit, logische Datentrennung.</li>
        </ul>

        <h3>2. Integrität</h3>
        <ul>
          <li><strong>Weitergabekontrolle:</strong> SSL/TLS-Verschlüsselung (HTTPS).</li>
          <li><strong>Eingabekontrolle:</strong> Protokollierung von Änderungen.</li>
        </ul>

        <h3>3. Verfügbarkeit und Belastbarkeit</h3>
        <ul>
          <li>Regelmäßige Backups.</li>
          <li>Redundante Systeme beim Hosting-Provider.</li>
          <li>Firewall und Sicherheitsupdates.</li>
        </ul>

        <h3>4. Verfahren zur Überprüfung</h3>
        <ul>
          <li>Datenschutz-Management und Incident-Response-Prozesse.</li>
          <li>Privacy by Design/Default.</li>
        </ul>

        <hr class="my-8" />

        <h2>Anhang: Subunternehmen</h2>
        <p>Aktuell eingesetzte Subunternehmen:</p>
        <ul>
          <li>
            <strong>NETCUP GmbH</strong><br>
            Daimlerstraße 25, 76185 Karlsruhe<br>
            Tätigkeit: Hosting, Datenbanken, Infrastruktur<br>
            Ort: Deutschland
          </li>
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
