# Etsy ERP System - Deployment Guide

## Lokale Entwicklung

### 1. Repository klonen
```bash
git clone https://github.com/IHR-USERNAME/etsy-erp-system.git
cd etsy-erp-system
```

### 2. Backend einrichten
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Das Backend läuft auf `http://localhost:3001`

### 3. Frontend einrichten
```bash
cd frontend
npm install
npm run dev
```

Das Frontend läuft auf `http://localhost:5174`

---

## Netcup Server Deployment

### 1. Server vorbereiten

```bash
# PostgreSQL installieren
sudo apt update
sudo apt install postgresql postgresql-contrib

# Node.js installieren (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 für Process Management
sudo npm install -g pm2
```

### 2. Datenbank einrichten

```bash
sudo -u postgres psql

# In PostgreSQL
CREATE DATABASE etsy_erp;
CREATE USER etsy_user WITH ENCRYPTED PASSWORD 'SICHERES-PASSWORT';
GRANT ALL PRIVILEGES ON DATABASE etsy_erp TO etsy_user;
\q
```

### 3. Repository auf Server klonen

```bash
cd /var/www
git clone https://github.com/IHR-USERNAME/etsy-erp-system.git
cd etsy-erp-system
```

### 4. Backend deployen

```bash
cd backend

# .env.production kopieren und anpassen
cp .env.production .env
nano .env  # DATABASE_URL und Secrets anpassen

# Dependencies installieren
npm install --production

# Prisma Schema auf PostgreSQL anpassen
# In schema.prisma: provider = "postgresql"
npx prisma migrate deploy

# Build erstellen
npm run build

# Mit PM2 starten
pm2 start dist/index.js --name etsy-erp-backend
pm2 save
pm2 startup  # Autostart einrichten
```

### 5. Frontend deployen

```bash
cd frontend
npm install
npm run build

# Build-Ordner mit Nginx servieren (siehe Nginx config unten)
```

### 6. Nginx konfigurieren

```nginx
server {
    listen 80;
    server_name ihr-domain.de;

    # Frontend
    location / {
        root /var/www/etsy-erp-system/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. SSL mit Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ihr-domain.de
```

---

## Updates deployen

```bash
cd /var/www/etsy-erp-system
git pull origin main

# Backend neu starten
cd backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart etsy-erp-backend

# Frontend neu builden
cd ../frontend
npm install
npm run build
```

---

## Wichtige Hinweise

> [!IMPORTANT]
> **Secrets in .env**
> 
> Ändern Sie die folgenden Werte in der Production `.env`:
> - `JWT_SECRET`: Generieren Sie einen starken zufälligen String
> - `DATABASE_URL`: Verwenden Sie die echten PostgreSQL-Zugangsdaten
> - SMTP-Daten für Email-Versand (wenn konfiguriert)

> [!WARNING]
> **Firewall**
> 
> Stellen Sie sicher, dass nur Port 80 und 443 öffentlich erreichbar sind.
> Port 3001 (Backend) sollte nur intern erreichbar sein.
