# Climate Org Directory & Scoring Dashboard

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green?logo=supabase)](https://supabase.com/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-blue?logo=tailwindcss)](https://tailwindcss.com/)

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Admin Dashboard](#admin-dashboard)
- [Scoring System](#scoring-system)
- [Contributing](#contributing)
- [Credits](#credits)
- [License](#license)
- [Questions](#questions)

---

## Description

A sophisticated platform to catalog, score, and assess grassroots climate organizations using a comprehensive 13-criteria rubric. Features an enterprise-grade admin dashboard with real-time validation, automated metadata fetching, and intelligent scoring recommendations. Built to support transparent, collective, and scalable climate action aligned with Music Declares Emergency.

---

## Features

### 🎯 **Core Functionality**
- **Organization Management** - Add, edit, approve/reject climate organizations
- **Intelligent Scoring** - 13-criteria assessment with real-time recommendations
- **Metadata Enrichment** - Automatic website favicon and metadata extraction
- **Advanced Filtering** - Status-based filters with real-time counts
- **Responsive Design** - Optimized for desktop, tablet, and mobile

### 🛡️ **Security & Validation**
- **Real-time Validation** - Field-level validation with visual feedback
- **Role-based Access Control** - JWT-based admin authentication
- **Row Level Security** - Supabase RLS for data protection
- **Input Sanitization** - Comprehensive data validation and formatting

### 🎨 **User Experience**
- **Motion Animations** - Smooth transitions and micro-interactions
- **Regional Theming** - Visual themes based on organization location
- **Loading States** - Comprehensive loading and error handling
- **Accessibility** - ARIA labels and keyboard navigation support

---

## Tech Stack

### **Frontend**
- **Next.js 14** with App Router and Server Components
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations and transitions

### **Backend**
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level security policies
- **Auth** - JWT-based authentication with custom claims
- **Edge Functions** - Serverless functions for metadata processing

### **Development**
- **TypeScript** - Full type safety across the application
- **ESLint & Prettier** - Code formatting and linting
- **Custom Hooks** - Reusable state management logic
- **Component Architecture** - Modular, testable components

---

## Architecture

The application follows a **clean architecture** pattern with clear separation of concerns:

```
project-root/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard page
│   │   └── page.tsx        # Admin dashboard component
│   ├── api/                # API routes and serverless functions
│   │   └── metadata/
│   │       └── route.ts
│   ├── components/         # Reusable UI components
│   │   ├── AdminHeader/
│   │   │   └── index.tsx
│   │   ├── OrganizationCard/
│   │   │   └── index.tsx
│   │   ├── AddOrganizationModal/
│   │   │   └── index.tsx
│   │   └── ScoringSection/
│   │       └── index.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useOrganizations.ts
│   │   ├── useScoring.ts
│   │   └── useWebsiteMetadata.ts
│   ├── login/              # Authentication pages
│   │   └── page.tsx        # Login page component
│   ├── utils/              # Logic utilities
│   │   ├── orgUtils.ts
│   │   ├── scoring.ts
│   │   └── validation.ts
│   ├── favicon.ico
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Homepage component
├── lib/                    # External library configurations
│   └── supabaseClient.ts   # Supabase client configuration
├── models/                 # TypeScript interfaces
│   ├── org.ts              # Organization interface
│   └── orgWithScore.ts     # Organization with scoring interface
├── public/                 # Static assets
├── .env.local              # Environment variables
├── package.json
├── tsconfig.json
└── next.config.js
```

### **App Router Structure Details**

#### **Pages & Routes**
- **`/`** - Homepage (public organization directory)
- **`/admin`** - Admin dashboard for organization management
- **`/login`** - Authentication page for admin access

#### **API Routes**
- **`/api/auth/*`** - Authentication endpoints
- **`/api/organizations/*`** - Organization CRUD operations
- **`/api/scoring/*`** - Scoring system endpoints
- **`/api/metadata/*`** - Website metadata extraction

#### **Component Architecture**
- **AdminHeader** - Header with filters, controls, and real-time stats
- **OrganizationCard** - Display, editing, and scoring interface
- **AddOrganizationModal** - Form modal with validation
- **ScoringSection** - Comprehensive 13-criteria scoring interface

#### **Custom Hooks**
- **useOrganizations** - Organization CRUD and state management
- **useScoring** - Scoring logic and calculations
- **useWebsiteMetadata** - Automatic metadata fetching and caching

#### **Utility Functions**
- **orgUtils** - Regional theming, colors, URL validation
- **validation** - Field validation with real-time feedback
- **scoring** - Scoring criteria and recommendation logic

### **Key Architectural Principles**
- **Single Responsibility** - Each component/hook has one clear purpose
- **Separation of Concerns** - Data, UI, and business logic are separated
- **Reusability** - Components can be used across different contexts
- **Type Safety** - Comprehensive TypeScript coverage
- **Performance** - Optimized re-renders and efficient state management

---

## Installation

> ⚠️ *In active development — deploy-ready for private use.*

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gurleyryan/MDEDB.git
   cd MDEDB
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up the database:**
   - Import the SQL schema from `/database/schema.sql`
   - Configure Row Level Security policies
   - Set up authentication with custom claims

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Public view: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`

---

## Usage

### **Public Interface**
- Browse approved climate organizations
- View organization details and scoring summaries
- Search and filter by criteria

### **Admin Interface**
- Manage organization submissions
- Assign scores using the 13-criteria rubric
- Approve, reject, or mark organizations as pending
- Real-time collaboration with other admins

> 🔐 **Admin Access**: Requires Supabase authentication with `admin` role in JWT custom claims.

---

## Admin Dashboard

The admin dashboard provides a comprehensive interface for managing climate organizations:

### **Key Features**

#### 📊 **Dashboard Overview**
- Real-time organization counts by status
- Quick stats and approval rates
- Progress tracking for scoring completion

#### 🏢 **Organization Management**
- **Card-based Layout** - Rich organization cards with metadata
- **Inline Editing** - Edit organization details with real-time validation
- **Status Management** - Approve, reject, or set to pending
- **Bulk Operations** - Efficient management of multiple organizations

#### 🎯 **Scoring Interface**
- **13-Criteria Assessment** - Comprehensive scoring rubric
- **Visual Progress** - Progress bars and completion indicators
- **Smart Recommendations** - AI-driven scoring suggestions
- **Comments System** - Detailed notes for each organization

#### 🔍 **Advanced Filtering**
- Filter by approval status (All, Pending, Approved, Rejected)
- Real-time count updates
- Toggle rejected organization visibility
- Search and sort capabilities

#### 🌐 **Metadata Enhancement**
- Automatic website favicon extraction
- Metadata enrichment for organization details
- URL validation and formatting
- Email validation and parsing

---

## Scoring System

### **13-Criteria Assessment Framework**

Organizations are evaluated across 13 key criteria, each scored 0-2:

1. **Impact Track Record** - Demonstrated environmental impact
2. **Local Legitimacy** - Community recognition and trust
3. **Transparency** - Open communication and accountability
4. **Scalability** - Potential for growth and replication
5. **Digital Presence** - Online visibility and engagement
6. **Alignment** - Mission alignment with climate goals
7. **Urgency Relevance** - Addressing critical climate issues
8. **Clear Actionable CTA** - Specific action opportunities
9. **Show Ready CTA** - Event-ready engagement options
10. **Scalable Impact** - Potential for widespread influence
11. **Accessibility** - Inclusive participation opportunities
12. **Global/Regional Fit** - Geographic relevance
13. **Volunteer Pipeline** - Volunteer recruitment and management

### **Scoring Guidelines**
- **0 Points** - Does not meet the criteria
- **1 Point** - Unclear or questionable
- **2 Points** - Clearly meets the criteria

### **Recommendations**
- **🟢 21-26 Points** - Strong Candidate (Recommended for approval)
- **🟡 13-20 Points** - Promising, Needs Follow-Up
- **🔴 0-12 Points** - Low Priority / Not Suitable

---

## Contributing

We welcome contributions! Please see our contributing guidelines:

### **Current Contributors**
- [Ryan Gurley](https://github.com/gurleyryan) - Lead Developer & Architect

### **How to Contribute**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain component modularity
- Add comprehensive error handling
- Include proper TypeScript interfaces
- Test on multiple screen sizes

---

## Credits

### **Technologies**
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [TypeScript](https://www.typescriptlang.org/) - Type safety

### **Inspiration**
- [Music Declares Emergency](https://musicdeclares.net/) - Climate action in the music industry

---

## License

This project is currently unlicensed. Please contact the maintainers for usage permissions.

---

## Questions

For questions, feedback, or collaboration opportunities:

- **GitHub**: [@gurleyryan](https://github.com/gurleyryan)
- **Email**: [gurleyryan@gmail.com](mailto:gurleyryan@gmail.com)

---

## Roadmap

### **Phase 1: Core Admin Features** ✅
- [x] Organization CRUD operations
- [x] Scoring system implementation
- [x] Admin authentication
- [x] Real-time validation

### **Phase 2: Enhanced UX** ✅
- [x] Responsive design
- [x] Motion animations
- [x] Metadata enrichment
- [x] Advanced filtering

### **Phase 3: Public Interface** 🚧
- [ ] Public organization directory
- [ ] Search and discovery
- [ ] Organization profiles
- [ ] Public API

### **Phase 4: Advanced Features** 📋
- [ ] Multi-admin collaboration
- [ ] Audit trails
- [ ] Export capabilities
- [ ] Integration APIs