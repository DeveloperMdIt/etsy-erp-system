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
        
        <h1>Datenschutz&shy;erklärung</h1>
        
        <h2>I. Einleitung</h2>
        <p>
          Wir freuen uns über Ihr Interesse an unserer Website und unseren Dienstleistungen. Der Schutz Ihrer Privatsphäre ist für uns sehr wichtig. Nachstehend informieren wir Sie ausführlich über den Umgang mit Ihren Daten.
        </p>

        <h2>II. Wer ist für die Datenverarbeitung verantwortlich?</h2>
        <p>
          Der nach Art. 4 Nr. 7 DSGVO Verantwortliche für die Datenverarbeitung ist:
        </p>
        <p>
          <strong>Inventivy</strong><br>
          Michael Deja<br>
          An der Hohl 4<br>
          36318 Schwalmtal<br>
          E-Mail: info@inventivy.de
        </p>
        
        <h2>III. Gibt es einen Datenschutzbeauftragten?</h2>
        <p>
          Aufgrund der gesetzlichen Bestimmungen ist kein Datenschutzbeauftragter bestellt. Bei Fragen zum Datenschutz wenden Sie sich bitte direkt an den Verantwortlichen unter der oben genannten Adresse.
        </p>
        
        <h2>IV. Wofür verarbeiten wir Ihre Daten?</h2>
        <h3>IV.1. Logfiles / Hosting</h3>
        <p>
          Beim Aufruf unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden temporär in einem sogenannten Logfile gespeichert. Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:
        </p>
        <ul>
          <li>IP-Adresse des anfragenden Rechners,</li>
          <li>Datum und Uhrzeit des Zugriffs,</li>
          <li>Name und URL der abgerufenen Datei,</li>
          <li>Website, von der aus der Zugriff erfolgt (Referrer-URL),</li>
          <li>verwendeter Browser und ggf. das Betriebssystem Ihres Rechners sowie der Name Ihres Access-Providers.</li>
        </ul>
        <p><strong>Rechtsgrundlage und berechtigte Interessen:</strong> Die Verarbeitung erfolgt auf Basis unseres überwiegenden berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) an der Sicherheit und Stabilität unserer Internetpräsenz durch Beauftragung eines Dienstleisters zur Erbringung von Infrastruktur- und Plattformdienstleistungen, Rechenkapazität, Speicherplatz und Datenbankdienste, Sicherheitsleistungen sowie technische Wartungsleistungen.</p>
        <p><strong>Datenempfänger/Auftragsverarbeiter:</strong> NETCUP GmbH, Daimlerstraße 25, 76185 Karlsruhe</p>
        
        <h3>IV.2. Cookie-Consent-Management</h3>
        <p>
          Neben der Speicherung von Cookies (siehe separate Ziffer) verwalten wir die Einwilligungserklärungen unserer Internetnutzer mittels eines Cookie-Consent-Tools.
        </p>
        <p><strong>Zweck der Verarbeitung:</strong> Erfüllung der gesetzlichen Verpflichtung zum Einwilligungsmanagement</p>
        <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 Satz 1 lit. c DSGVO</p>
        <p><strong>Speicherdauer:</strong> Bis zum Widerruf der Einwilligung zur Cookiespeicherung oder Löschung des lokalen Speichers vom Browser.</p>

        <h3>IV.3. Webfonts</h3>
        <p>
          Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Web Fonts, die von Google bereitgestellt werden. Beim Aufruf einer Seite lädt Ihr Browser die benötigten Web Fonts in ihren Browsercache, um Texte und Schriftarten korrekt anzuzeigen.
        </p>
         <p>
          Weitere Informationen zu Google Web Fonts finden Sie unter <a href="https://developers.google.com/fonts/faq" target="_blank">https://developers.google.com/fonts/faq</a> und in der Datenschutzerklärung von Google: <a href="https://www.google.com/policies/privacy/" target="_blank">https://www.google.com/policies/privacy/</a>.
        </p>

        <h3>IV.4. Kontaktaufnahme</h3>
        <p>
          Im Falle Ihrer Kontaktaufnahme mit uns (z. B. per Kontaktformular, E-Mail) werden personenbezogene Daten erhoben. Diese Daten werden ausschließlich zum Zweck der Beantwortung Ihres Anliegens bzw. für die Kontaktaufnahme und die damit verbundene technische Administration gespeichert und verwendet.
        </p>
        <p><strong>Rechtsgrundlagen:</strong> Art. 6 Abs. 1 lit. b DSGVO bei vor- oder vertraglichen Angelegenheiten. Art. 6 Abs. 1 lit. a DSGVO für Ihre freiwilligen Angaben.</p>

        <h3>IV.5. Registrierung / Kundenkonto</h3>
        <p>
          Wenn Sie sich auf unserer Plattform registrieren, erheben wir die von Ihnen angegebenen Daten (Name, E-Mail-Adresse, Passwort, Shop-Daten).
        </p>
        <p><strong>Zweck der Verarbeitung:</strong> Bereitstellung des Dienstes, Vertragsdurchführung, Verwaltung Ihres Accounts.</p>
        <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>

        <h3>IV.6. Zahlungsabwicklung</h3>
        <p>
          Für kostenpflichtige Dienste binden wir Zahlungsdienstleister ein.
        </p>
        <h4>PayPal</h4>
        <p>
          Bei Zahlung via PayPal werden Ihre Zahlungsdaten an die PayPal (Europe) S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg weitergegeben.
        </p>
        <p><strong>Datenschutzerklärung von PayPal:</strong> <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank">https://www.paypal.com/de/webapps/mpp/ua/privacy-full</a></p>

        <h2>V. Ihre Rechte als betroffene Person</h2>
        <p>Sie haben das Recht auf:</p>
        <ul>
          <li>gemäß Art. 15 DSGVO Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten zu verlangen;</li>
          <li>gemäß Art. 16 DSGVO unverzüglich die Berichtigung unrichtiger oder Vervollständigung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen;</li>
          <li>gemäß Art. 17 DSGVO die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen;</li>
          <li>gemäß Art. 18 DSGVO die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen;</li>
          <li>gemäß Art. 20 DSGVO Ihre personenbezogenen Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten oder die Übermittlung an einen anderen Verantwortlichen zu verlangen;</li>
          <li>gemäß Art. 7 Abs. 3 DSGVO Ihre einmal erteilte Einwilligung jederzeit gegenüber uns zu widerrufen;</li>
          <li>gemäß Art. 77 DSGVO sich bei einer Aufsichtsbehörde zu beschweren.</li>
        </ul>

        <h3>Widerspruchsrecht</h3>
        <p>
          Sofern Ihre personenbezogenen Daten auf Grundlage von berechtigten Interessen gemäß Art. 6 Abs. 1 S. 1 lit. f DSGVO verarbeitet werden, haben Sie das Recht, gemäß Art. 21 DSGVO Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten einzulegen, soweit dafür Gründe vorliegen, die sich aus Ihrer besonderen Situation ergeben.
        </p>

        <h2>VI. Speicherdauer</h2>
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie es für die Erreichung des jeweiligen Zwecks erforderlich ist oder wie es die gesetzlichen Aufbewahrungsfristen (z.B. handels- und steuerrechtliche Aufbewahrungsfristen) vorsehen. Nach Wegfall des Zwecks bzw. Ablauf der Fristen werden die entsprechenden Daten routinemäßig gesperrt oder gelöscht.
        </p>

        <h2>VII. Cookies</h2>
        <p>
          Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
        </p>
        <p>
          Einige Cookies sind „Session-Cookies“. Solche Cookies werden nach Ende Ihrer Browser-Sitzung von selbst gelöscht. Hingegen bleiben andere Cookies auf Ihrem Endgerät bestehen, bis Sie diese selbst löschen. Solche Cookies helfen uns, Sie bei Rückkehr auf unserer Website wiederzuerkennen.
        </p>
        <p>
          Mit einem modernen Webbrowser können Sie das Setzen von Cookies überwachen, einschränken oder unterbinden. Die Deaktivierung von Cookies kann eine eingeschränkte Funktionalität unserer Website zur Folge haben.
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
h3 {
  @apply text-xl font-bold text-gray-800 mt-8 mb-3;
}
h4 {
  @apply text-lg font-semibold text-gray-800 mt-6 mb-2;
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
