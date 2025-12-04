# Etsy ERP/WMS Backend

Backend-Server für ein Etsy-Warenwirtschaftssystem (ERP/WMS) mit Multi-Tenant-Unterstützung.

## Features

- ✅ **Authentication & Multi-Tenancy**: JWT-basierte Authentifizierung mit Tenant-Isolation
- ✅ **Kundenverwaltung**: Kunden anlegen, suchen, Wiederholungskäufer markieren
- ✅ **Produktverwaltung**: Produkte mit SKU, GTIN/EAN, Gewicht, Preis
- ✅ **Bestellverwaltung**: Bestellungen erstellen, Status-Workflow, Bestellpositionen
- 🚧 **DHL-Integration**: Label-Generierung für Kleinpaket und Paket
- 🚧 **CSV-Import**: Etsy-Bestellungen per CSV importieren
- 🚧 **Dokumentenerstellung**: Rechnungen, Lieferscheine, Picklisten als PDF
-🚧 **Email-Automation**: Bestellbestätigungen, Versandbenachrichtigungen

## Tech Stack

- **Runtime:** Node.js 20+ mit TypeScript
- **Framework:** Express
- **ORM:** Prisma (PostgreSQL)
- **Authentication:** JWT + bcrypt
- **Validation:** Zod

## Setup

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Kopieren Sie `.env.example` zu `.env` und passen Sie die Einstellungen an:

```bash
cp .env.example .env
```

### 3. Datenbank Setup

**Option A: Lokale PostgreSQL-Datenbank**

```bash
# PostgreSQL installieren und starten
# Dann Datenbankverbindung in .env eintragen

# Prisma migrations ausführen
npm run prisma:migrate

# Prisma Client generieren
npm run prisma:generate
```

**Option B: Docker (empfohlen für Entwicklung)**

Erstellen Sie eine `docker-compose.yml` im Backend-Verzeichnis:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: etsyerp
      POSTGRES_PASSWORD: etsyerp123
      POSTGRES_DB: etsy_erp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Dann:

```bash
docker-compose up -d
npm run prisma:migrate
npm run prisma:generate
```

### 4. Development Server starten

```bash
npm run dev
```

Server läuft auf: `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Aktueller Benutzer

### Customers

- `GET /api/customers` - Liste aller Kunden (mit `?search=...` Parameter)
- `GET /api/customers/:id` - Kundendetails mit Bestellhistorie
- `POST /api/customers` - Neuen Kunden anlegen

### Products

- `GET /api/products` - Liste aller Produkte (mit `?search=...` Parameter)
- `GET /api/products/:id` - Produktdetails
- `POST /api/products` - Neues Produkt anlegen
- `PATCH /api/products/:id` - Produkt aktualisieren

### Orders

- `GET /api/orders` - Liste aller Bestellungen (mit `?status=...` und `?search=...`)
- `GET /api/orders/:id` - Bestelldetails
- `POST /api/orders` - Neue Bestellung anlegen
- `PATCH /api/orders/:id` - Bestellung aktualisieren (Status, Tracking, etc.)

## Prisma Studio

Prisma Studio für Datenbank-Verwaltung:

```bash
npm run prisma:studio
```

Öffnet automatisch im Browser: `http://localhost:5555`

## Build & Production

```bash
# Build
npm run build

# Production Start
npm start
```

## Nächste Schritte

- [ ] CSV-Import für Etsy-Bestellungen
- [ ] DHL API Integration
- [ ] PDF-Generierung für Rechnungen
- [ ] Email-Service
- [ ] Frontend entwickeln
