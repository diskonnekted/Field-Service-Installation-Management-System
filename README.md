# Service Management System

Sistem manajemen layanan yang komprehensif untuk mengelola penugasan teknisi, klien, dan pelaporan menggunakan Next.js 15, TypeScript, Prisma, dan PostgreSQL.

## 🚀 Fitur Utama

### 📊 Dashboard
- Statistik overview penugasan
- Monitoring status pekerjaan
- Visualisasi data dengan grafik

### 👥 Manajemen Teknisi
- CRUD teknisi lengkap
- Informasi kontak dan keahlian
- Kategori teknisi (Senior/Junior)

### 🏢 Manajemen Klien
- Database klien terpusat
- Informasi kontak dan alamat
- Riwayat penugasan

### 🛠️ Manajemen Layanan
- Jenis layanan dan kategori
- Peralatan yang dibutuhkan
- Deskripsi layanan detail

### 📋 Manajemen Penugasan
- Pembuatan dan penjadwalan penugasan
- Assign teknisi utama dan asisten
- Tracking status pekerjaan
- Perhitungan biaya otomatis

### 📄 Generate PDF
- **Surat Tugas (Work Order)**
- **Berita Acara Serah Terima**
- **Tagihan Pembayaran**
- Download langsung dari browser

## 🛠️ Teknologi

- **Frontend**: Next.js 15 dengan App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js
- **PDF Generation**: jsPDF
- **State Management**: Zustand
- **TypeScript**: Full type safety

## 📦 Instalasi

```bash
# Clone repository
git clone https://github.com/username/service-management-system.git
cd service-management-system

# Install dependencies
npm install

# Setup database
npm run db:push

# Seed data admin
npm run db:seed

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk mengakses aplikasi.

## 🔐 Login Default

- **Username**: `admin`
- **Password**: `admin123`

## 📁 Struktur Proyek

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── assignments/       # Assignment pages
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout
├── components/            # React Components
│   ├── ui/               # shadcn/ui components
│   ├── assignment-management.tsx
│   ├── technician-management.tsx
│   └── client-management.tsx
├── lib/                   # Utilities
│   ├── db.ts             # Prisma client
│   ├── pdf-service.ts    # PDF generation
│   └── utils.ts          # Helper functions
└── hooks/                 # Custom React hooks
```

## 🗄️ Database Schema

### Tables:
- `technicians` - Data teknisi
- `clients` - Data klien
- `service_types` - Jenis layanan
- `service_equipment` - Peralatan
- `assignments` - Penugasan
- `assignment_assistants` - Asisten teknisi
- `assignment_equipment` - Peralatan penugasan

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Login admin

### Technicians
- `GET /api/technicians` - List teknisi
- `POST /api/technicians` - Tambah teknisi
- `PUT /api/technicians/[id]` - Update teknisi
- `DELETE /api/technicians/[id]` - Hapus teknisi

### Clients
- `GET /api/clients` - List klien
- `POST /api/clients` - Tambah klien
- `PUT /api/clients/[id]` - Update klien
- `DELETE /api/clients/[id]` - Hapus klien

### Assignments
- `GET /api/assignments` - List penugasan
- `POST /api/assignments` - Tambah penugasan
- `PUT /api/assignments/[id]` - Update penugasan
- `DELETE /api/assignments/[id]` - Hapus penugasan
- `GET /api/assignments/[id]/pdf` - Generate PDF

### Service Types & Equipment
- `GET /api/service-types` - List jenis layanan
- `GET /api/equipment` - List peralatan

### Dashboard
- `GET /api/dashboard/stats` - Statistik dashboard

## 🎨 Fitur UI/UX

- **Responsive Design**: Mobile-friendly
- **Dark Mode Support**: Tema terang/gelap
- **Loading States**: Indikator loading
- **Error Handling**: Pesan error yang jelas
- **Search & Filter**: Pencarian data
- **Pagination**: Navigasi data
- **Toast Notifications**: Feedback interaksi

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Database operations
npm run db:push      # Push schema changes
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

## 📝 Notes

- Sistem menggunakan bahasa Indonesia untuk interface
- PDF generate langsung di browser tanpa server-side rendering
- Auto-calculation untuk biaya penugasan
- Real-time updates dengan Socket.IO (opsional)

## 🤝 Kontribusi

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail

## 👥 Author

**Clasnet Group**  
Jl. Serulingmas No. 32, Banjarnegara, Indonesia  
Telepon: +62 286 123456