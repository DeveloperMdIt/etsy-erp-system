import axios from 'axios';

const API_URL = '/api/templates';

// Common variables available in templates
export const TEMPLATE_VARIABLES = [
    { code: '{TrackingNumber}', label: 'Sendungsnummer', description: 'Alias für Tracking ID' },
    { code: '{TrackingLink}', label: 'Sendungslink', description: 'Alias für Tracking Link' },
    { code: '{TrackingNumberAvailable}', label: 'Block: Tracking vorhanden', description: 'Startet Bedingung: Nur wenn Tracking verfügbar' },
    { code: '{/TrackingNumberAvailable}', label: 'Ende: Tracking vorhanden', description: 'Beendet Bedingung' },
    { code: '{BuyerName}', label: 'Kundenname', description: 'Vor- und Nachname des Kunden' },
    { code: '{BuyerFirstName}', label: 'Kunden Vorname', description: 'Vorname des Kunden' },
    { code: '{BuyerLastName}', label: 'Kunden Nachname', description: 'Nachname des Kunden' },
    { code: '{OrderRef}', label: 'Bestellnummer', description: 'Interne Bestellnummer' },
    { code: '{InvoiceNumber}', label: 'Rechnungsnummer', description: 'Nummer der erzeugten Rechnung' },
    { code: '{OrderDate}', label: 'Bestelldatum', description: 'Datum des Auftragseingangs' },
    { code: '{ShopName}', label: 'Shop Name', description: 'Name deines Shops' },
    { code: '{GrandTotal}', label: 'Gesamtbetrag', description: 'Bruttobetrag der Bestellung' },
    { code: '{PaymentMethod}', label: 'Zahlart', description: 'Verwendete Zahlungsmethode' },
    { code: '{PayDate}', label: 'Zahldatum', description: 'Datum des Zahlungseingangs' },
    { code: '{TrackingCode}', label: 'Tracking ID', description: 'Sendungsverfolgungsnummer' },
    { code: '{TrackingUrl}', label: 'Tracking Link', description: 'Link zur Sendungsverfolgung' },
];

export const TemplateService = {
    // Get headers with auth token
    getHeaders() {
        const token = sessionStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    async getByType(type: string) {
        try {
            const response = await axios.get(`${API_URL}/by-type/${type}`, {
                headers: this.getHeaders()
            });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // Return null or specific object indicates not found
                return null;
            }
            throw error;
        }
    },

    async saveTemplate(templateData: any) {
        const response = await axios.post(`${API_URL}/save`, templateData, {
            headers: this.getHeaders()
        });
        return response.data;
    },

    async sendTestEmail(data: { type: string, subject: string, content: string }) {
        const response = await axios.post(`${API_URL}/send-test`, data, {
            headers: this.getHeaders()
        });
        return response.data;
    }
};
