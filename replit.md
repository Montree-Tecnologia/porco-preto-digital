# Pró Porco - Sistema de Gestão Suinícola

## Overview

Pró Porco is a comprehensive web-based management system for small-scale pig farming operations. The application provides complete operational and financial control, enabling farmers to digitalize their swine production management. The system handles livestock tracking, facility management, inventory control, feeding schedules, health records, weight monitoring, sales, and financial reporting.

**Current Status:** Frontend prototype complete with mock data. Backend integration pending.

**Target Users:** Small pig farmers (50-200 animals) who need accessible digital tools for farm management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18+ with TypeScript, built using Vite

**UI Component Library:** Radix UI primitives with shadcn/ui components for a consistent, accessible design system

**Styling:** Tailwind CSS with custom HSL color variables themed for agricultural applications (greens for growth, browns for earth/stability, blues for data/reports)

**State Management:** 
- Custom React hook (`useProPorcoData`) manages all application state with mock data
- Prepared for migration to TanStack Query for server state management
- Client-side data persistence using localStorage for authentication state

**Routing:** React Router v6 with protected routes pattern for authentication

**Form Handling:** React Hook Form with Zod schema validation for type-safe form data

**Design Decisions:**
- Component-based architecture with clear separation of concerns
- Responsive-first design supporting mobile and desktop workflows
- Accessibility built-in through Radix UI primitives
- Agricultural color palette (HSL values) for intuitive visual hierarchy

### Backend Architecture

**Status:** Planned but not yet implemented

**Planned Stack:**
- Express.js server
- PostgreSQL database (via Neon/Replit)
- Drizzle ORM for type-safe database operations
- JWT-based authentication with bcrypt password hashing
- RESTful API design

**Database Schema:** Defined in Drizzle config but not yet implemented. Schema includes entities for users, pigs, pens (piquetes), supplies (insumos), feed compositions, feeding records, health records, weight records, sales, and costs.

**Current Workaround:** Frontend uses a comprehensive mock data system in `useProPorcoData` hook that simulates full CRUD operations with localStorage persistence.

### Authentication & Authorization

**Current Implementation:** Mock authentication system with hardcoded credentials
- Email: admin@prorporco.com
- Password: 123456

**Security Considerations:**
- Protected routes wrapper checks authentication state
- Auth state persists in localStorage (temporary solution)
- Logout functionality clears session data

**Planned Implementation:**
- JWT token-based authentication
- Secure password hashing with bcrypt
- HTTP-only cookies for token storage
- Role-based access control (RBAC) for multi-user scenarios

### Data Models

**Core Entities:**

1. **Porcos (Pigs):** Individual animal tracking with ID, birth/acquisition date, weight history, pen location, purchase value, breed, sex, target slaughter weight
   
2. **Piquetes (Pens):** Facility management with capacity, area, type, current occupancy

3. **Insumos (Supplies):** Inventory for vaccines, medications, and feed ingredients with stock control and alerts

4. **Compostos (Feed Compositions):** Custom feed recipes combining multiple ingredients

5. **Alimentação (Feeding Records):** Tracking feed consumption per pig/pen with date and quantity

6. **Sanidade (Health Records):** Vaccination and medical treatment logs with scheduling for next applications

7. **Pesagem (Weight Records):** Weight tracking over time for growth monitoring and profitability calculations

8. **Vendas (Sales):** Transaction records with individual pig values, commission tracking, and buyer information

9. **Custos (Costs):** Operating expenses categorized as commissioning, operational, administrative, or other

**Calculated Metrics:**
- Individual pig profitability (revenue - costs - feed)
- Weight gain trends and projections
- Inventory consumption rates
- Financial reports (DRE - Demonstrativo de Resultados)

## External Dependencies

### UI & Component Libraries
- **@radix-ui/react-***: Accessible, unstyled UI primitives (dialogs, dropdowns, forms, navigation, etc.)
- **shadcn/ui**: Pre-built component patterns built on Radix UI
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Data & State Management
- **@tanstack/react-query**: Prepared for server state management (not yet active)
- **react-hook-form**: Form state management
- **@hookform/resolvers + zod**: Form validation with type-safe schemas

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the application
- **ESLint**: Code linting
- **Lovable.dev**: Development platform and deployment

### Planned Backend Dependencies
- **express**: Web server framework
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm + drizzle-kit**: Database ORM and migration tools
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cookie-parser + cors**: HTTP utilities

### Database
- **PostgreSQL**: Via Neon serverless (configured but not yet connected)
- Connection string expected in `DATABASE_URL` environment variable
- Drizzle schema defined in `/server/db/schema.ts` (pending implementation)

### Build & Deployment
- **Development**: `npm run dev` - Runs tsx watch server (backend) + Vite (frontend)
- **Production**: Separate client and server builds with Node.js runtime
- **Database Management**: Drizzle Kit CLI for migrations and schema management