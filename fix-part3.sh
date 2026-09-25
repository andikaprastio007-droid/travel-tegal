#!/usr/bin/env bash
set -e

echo "▶ Fix README..."
cat > README.md << 'READMEEOF'
# Travel Tegal ↔ Jabodetabek

Website travel online untuk layanan Tegal ↔ Jabodetabek.

## Fitur
- Booking tiket online
- Carter mobil
- Cek booking
- Upload bukti pembayaran
- Konfirmasi WhatsApp otomatis
- Admin dashboard
- Manajemen booking, pembayaran, pengaturan

## Tech Stack
- Next.js 14 + TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite (default)
- JWT auth (httpOnly cookie)

## Cara Menjalankan
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev

Buka http://localhost:3000

## Login Admin
- URL: http://localhost:3000/admin/login
- Email: admin@travel.local
- Password: Admin123!

## Struktur
- src/app        : halaman & API routes
- src/components : UI components
- src/lib        : helper (db, auth, validators, whatsapp)
- src/services   : business logic
- prisma         : database schema

## Environment
Lihat .env.example.

## Deploy
- Vercel (frontend + API)
- Ganti DATABASE_URL ke PostgreSQL untuk production
READMEEOF

echo "▶ Fix robots.txt..."
cat > public/robots.txt << 'ROBOTSEOF'
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Sitemap: /sitemap.xml
ROBOTSEOF

echo "▶ Cek seed.ts..."
if [ ! -f prisma/seed.ts ]; then
  echo "❌ prisma/seed.ts tidak ada, tulis ulang..."
  # Copy seed dari response (bisa manual nanti)
else
  echo "✅ prisma/seed.ts sudah ada."
fi

echo "▶ Cek sitemap.ts..."
if [ ! -f src/app/sitemap.ts ]; then
  echo "❌ src/app/sitemap.ts tidak ada"
else
  echo "✅ src/app/sitemap.ts sudah ada."
fi

echo ""
echo "✅ Fix selesai. Sekarang jalankan:"
echo "   npm install"
echo "   npx prisma generate"
echo "   npx prisma db push"
echo "   npm run db:seed"
echo "   npm run dev"
