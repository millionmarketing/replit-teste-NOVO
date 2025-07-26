# replit.md

## Overview

This is a full-stack web application built with React and Express.js that implements an AI-powered CRM (Customer Relationship Management) system. The application features a modern dashboard for managing conversations, contacts, agents, and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 26, 2025 - Complete Authentication System Implementation**
- ✅ Complete user authentication system with login, register, and password recovery
- ✅ Modern and responsive UI for all authentication pages
- ✅ Secure password hashing with bcrypt
- ✅ Session-based authentication with JWT-like tokens
- ✅ Authentication context with React hooks
- ✅ Protected routes and automatic redirects
- ✅ User profile display in topbar with logout functionality
- ✅ Database schema updated with sessions and password reset features

**July 26, 2025 - Complete Data Isolation System Implementation**
- ✅ Complete user data isolation across all database entities
- ✅ Added userId to all tables (agents, contacts, conversations, messages, metrics, whatsapp_settings)
- ✅ Updated database schema with proper foreign key relationships
- ✅ Modified storage layer to filter all operations by userId
- ✅ Updated API routes to enforce user-specific data access
- ✅ Enhanced authentication middleware with user context
- ✅ WhatsApp webhook handling with multi-user support
- ✅ Secure data separation - users can only access their own data

**July 26, 2025 - WhatsApp API Integration Complete**
- ✅ Full WhatsApp Meta API integration implemented
- ✅ Configuration interface in Settings → Integração WhatsApp  
- ✅ Database schema for storing WhatsApp credentials securely
- ✅ Webhook endpoints for receiving/sending messages
- ✅ Real-time configuration updates and status validation
- ✅ Template message support and automatic lead assignment to SDR agent
- ✅ Messages section fully functional with real-time polling
- ✅ Outgoing messages integrated with WhatsApp API
- ✅ Status indicator showing WhatsApp connection state

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Library**: Built on shadcn/ui with Radix UI primitives
- **Layout**: Sidebar navigation with topbar, responsive design
- **Pages**: Dashboard, Messages, Agents, Contacts, Analytics, Reporting
- **State Management**: React Query for API calls and caching
- **Styling**: Dark theme with custom CSS variables, Tailwind utility classes

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **API Routes**: RESTful endpoints for CRUD operations
- **Storage Layer**: Abstracted storage interface with PostgreSQL database implementation
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless
- **Development Tools**: Vite integration for hot reloading in development

### Database Schema
The application defines several core entities:
- **Users**: Authentication and user management
- **Conversations**: Chat/messaging functionality
- **Messages**: Individual messages within conversations
- **Contacts**: Customer/lead management with pipeline stages
- **Agents**: AI agent management with different types (SDR, support, marketing)
- **Metrics**: Dashboard analytics and performance tracking

## Data Flow

1. **Client Requests**: React components use React Query to fetch data
2. **API Layer**: Express routes handle HTTP requests and validate input
3. **Storage Layer**: Abstracted storage interface processes business logic
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON responses sent back through the chain

The application uses TypeScript throughout for type safety, with shared schema definitions between client and server.

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives, shadcn/ui components
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS, class-variance-authority
- **Icons**: Lucide React

### Backend Dependencies
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Validation**: Zod schemas
- **Session Management**: connect-pg-simple for PostgreSQL sessions

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **TypeScript**: Full TypeScript support with strict configuration
- **Replit Integration**: Development tools for Replit environment

## Deployment Strategy

The application is configured for deployment with:

1. **Development**: Uses Vite dev server with HMR and Express backend
2. **Production**: 
   - Frontend built with Vite to static assets
   - Backend bundled with esbuild
   - PostgreSQL database using Neon serverless with full schema migration
   - Environment variables for database connection

**Build Process**:
- `npm run build`: Builds both frontend and backend
- `npm run dev`: Development mode with hot reloading
- `npm run start`: Production mode

The application expects a `DATABASE_URL` environment variable for PostgreSQL connection and includes migration support through Drizzle Kit.

**Key Architectural Decisions**:
- Monorepo structure for easier development and deployment
- Type-safe database operations with Drizzle ORM
- Component-driven UI with reusable shadcn/ui components
- Server-side state management with React Query
- Dark theme with custom design system
- Modular storage interface for easy database backend swapping