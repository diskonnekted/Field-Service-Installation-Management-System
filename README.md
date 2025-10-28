# Clasnet Group - Technician Assignment Management System

A comprehensive web-based system for managing technician assignments, designed specifically for Clasnet Group in Banjarnegara, Indonesia.

## Company Information
**Clasnet Group**  
Jl. Serulingmas No. 32, Banjarnegara, Indonesia  
Phone: +62 286 123456

## Features

### Core Functionality
- **Technician Management**: Manage freelance and permanent technicians with expertise tracking
- **Client Management**: Comprehensive client portfolio management
- **Service Management**: Define service types and categories
- **Equipment Inventory**: Track equipment stock and availability
- **Assignment System**: Create and manage service assignments with multi-technician support
- **PDF Generation**: Generate professional documents (Work Order, Completion Report, Payment Receipt)
- **Dashboard**: Real-time overview of operations and statistics
- **Search & Filter**: Advanced filtering across all modules

### Document Generation
- **Surat Perintah Kerja (Work Order)**: Professional work assignment letters
- **Berita Acara Serah Terima (Completion Report)**: Service completion documentation
- **Kwitansi (Payment Receipt)**: Technician payment documentation

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: SQLite (development ready, easily upgradable to PostgreSQL/MySQL)
- **Authentication**: Simple token-based authentication
- **PDF Generation**: jsPDF with html2canvas
- **UI Components**: shadcn/ui component library

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/diskonnekted/Field-Service-Installation-Management-System.git
cd Field-Service-Installation-Management-System
npm install
```

### 2. Database Setup
```bash
# Push database schema
npm run db:push

# Seed admin user
npx tsx src/lib/seed-admin.ts
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Login Credentials

- **Email**: admin@clasnet.com
- **Password**: admin123

## Database Schema

### Core Entities
- **Admin**: System administrators
- **Technicians**: Freelance and permanent technicians
- **Clients**: Service clients
- **Service Types**: Available services with categories
- **Service Equipment**: Equipment inventory
- **Service Cost Templates**: Cost structures for technician payments
- **Assignments**: Main assignment entity with relationships
- **Assignment Assistants**: Many-to-many for assistant technicians
- **Assignment Equipment**: Equipment used in assignments

### Key Features
- **Freelance Focus**: Primary support for freelance technicians
- **Cost Tracking**: Internal cost management (not client billing)
- **Multi-technician Support**: Lead technician + assistants
- **Equipment Management**: Stock tracking and assignment
- **Documentation**: Photo/file path support

## Usage Guide

### 1. Initial Setup
1. Login with default credentials
2. Navigate to "Layanan & Peralatan" tab
3. Add your service types and equipment inventory
4. Add technicians (freelance/permanent) with their expertise
5. Add clients to your portfolio

### 2. Creating Assignments
1. Go to "Manajemen Penugasan" tab
2. Click "Penugasan Baru"
3. Select client, service type, and lead technician (PIC)
4. Add assistant technicians if needed
5. Select required equipment with quantities
6. Set dates and total cost
7. Add notes and create assignment

### 3. Managing Assignments
- View all assignments in the management interface
- Filter by status, client, or service type
- Update assignment status as work progresses
- Generate PDF documents at any stage

### 4. PDF Generation
From any assignment, you can generate:
- **Work Order**: Initial assignment document
- **Completion Report**: Service completion documentation
- **Payment Receipt**: Technician payment breakdown

## Development

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── assignments/   # Assignment CRUD
│   │   ├── technicians/   # Technician CRUD
│   │   ├── clients/       # Client CRUD
│   │   ├── service-types/ # Service type CRUD
│   │   ├── equipment/     # Equipment CRUD
│   │   ├── dashboard/     # Dashboard stats
│   │   └── auth/          # Authentication
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── technician-management.tsx
│   ├── client-management.tsx
│   ├── assignment-management.tsx
│   ├── service-management.tsx
│   └── login.tsx
├── lib/                  # Utilities
│   ├── db.ts            # Prisma client
│   ├── pdf-service.ts   # PDF generation
│   ├── utils.ts         # Helper functions
│   └── seed-admin.ts    # Admin seeding
└── prisma/
    └── schema.prisma    # Database schema
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Admin login

#### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

#### Technicians
- `GET /api/technicians` - List technicians
- `POST /api/technicians` - Create technician
- `GET /api/technicians/[id]` - Get technician
- `PUT /api/technicians/[id]` - Update technician
- `DELETE /api/technicians/[id]` - Delete technician

#### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/[id]` - Get client
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

#### Service Types
- `GET /api/service-types` - List service types
- `POST /api/service-types` - Create service type
- `GET /api/service-types/[id]` - Get service type
- `PUT /api/service-types/[id]` - Update service type
- `DELETE /api/service-types/[id]` - Delete service type

#### Equipment
- `GET /api/equipment` - List equipment
- `POST /api/equipment` - Create equipment
- `GET /api/equipment/[id]` - Get equipment
- `PUT /api/equipment/[id]` - Update equipment
- `DELETE /api/equipment/[id]` - Delete equipment

#### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/[id]` - Get assignment
- `PUT /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment
- `GET /api/assignments/[id]/pdf` - Generate PDF

## Security Features

- Password hashing with bcrypt
- Token-based authentication
- Input validation and sanitization
- SQL injection prevention with Prisma ORM
- XSS protection with proper output escaping

## Production Deployment

### Environment Variables
Create `.env.local` file:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
```

### Database Migration
For production, consider upgrading to PostgreSQL:
1. Update `prisma/schema.prisma` provider
2. Update `DATABASE_URL` environment variable
3. Run `npx prisma migrate deploy`

### Build and Deploy
```bash
npm run build
npm start
```

## Scalability Considerations

- **Database**: Easily upgrade from SQLite to PostgreSQL/MySQL
- **Authentication**: Can be extended to NextAuth.js for social logins
- **File Storage**: Can integrate with cloud storage for documentation
- **Notifications**: Can add email/SMS notifications
- **Invoicing**: Can extend to client billing system
- **Reporting**: Can add advanced analytics and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical support or questions:
- Email: support@clasnet.com
- Phone: +62 286 123456

## License

This project is proprietary to Clasnet Group. All rights reserved.

---

**Clasnet Group**  
*Empowering technician management excellence since 2024*