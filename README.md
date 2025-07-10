# Climate Org Directory & Scoring Dashboard

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green?logo=supabase)](https://supabase.com/)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Status: In Development](https://img.shields.io/badge/status-in--development-yellow)](#)
[![AGPL v3 License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)

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
- **Organization Management** - Add, edit, approve/reject climate organizations with inline editing
- **Intelligent Scoring** - 13-criteria assessment with real-time recommendations and visual progress
- **Metadata Enrichment** - Automatic website favicon and metadata extraction with loading states
- **Advanced Filtering & Search** - Multi-criteria filtering, real-time search, and sorting capabilities
- **Responsive Glass Design** - Modern glass morphism UI optimized for all devices

### 🛡️ **Security & Validation**
- **Real-time Validation** - Field-level validation with visual feedback and error handling
- **Role-based Access Control** - JWT-based admin authentication with secure routing
- **Row Level Security** - Supabase RLS for comprehensive data protection
- **Input Sanitization** - Comprehensive data validation, formatting, and URL validation

### 🎨 **User Experience**
- **Glass Morphism Design** - Modern frosted glass aesthetic with backdrop blur effects
- **Smooth Animations** - CSS-based transitions and micro-interactions (Framer Motion deprecated)
- **Regional Theming** - Visual themes and colors based on organization location
- **Comprehensive Loading States** - Loading indicators, progress bars, and error handling
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support

---

## Tech Stack

### **Frontend**
- **Next.js 14** with App Router and Server Components
- **React 18** with TypeScript for type safety
- **Tailwind CSS** with custom glass morphism utilities
- **CSS Animations** - Custom CSS transitions and animations (Framer Motion removed)
- **Custom Hooks** - Specialized hooks for organizations, scoring, and metadata

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
│   │   ├── layout.tsx
│   │   └── page.tsx        # Admin dashboard component
│   ├── api/                # API routes and serverless functions
│   │   └── metadata/
│   │       └── route.ts
│   ├── components/         # Reusable UI components
│   │   ├── AddOrganizationModal/
│   │   │   └── index.tsx
│   │   ├── AdminHeader/
│   │   │   └── index.tsx
│   │   ├── CustomDropdown/
│   │   │   └── index.tsx
│   │   ├── Icons/
│   │   │   └── index.tsx
│   │   ├── OrganizationCard/
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
│   │   ├── supabase/       # Supabase client configuration
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── server.ts
│   │   ├── motion.ts
│   │   ├── orgUtils.ts
│   │   ├── scoring.ts
│   │   ├── selectOptions.ts
│   │   └── validation.ts
│   ├── favicon.ico
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Homepage component
├── models/                 # TypeScript interfaces
│   ├── org.ts              # Organization interface
│   └── orgWithScore.ts     # Organization with scoring interface
├── public/                 # Static assets
├── .env.local              # Environment variables
├── .gitignore
├── eslint.config.mjs
├── LICENSE.md
├── middleware.ts           # Supabase root middleware
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.js
└── tsconfig.json

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
- **AdminHeader** - Header with compact layout, filters, search, and real-time stats
- **OrganizationCard** - Rich cards with glass effects, inline editing, and regional theming
- **AddOrganizationModal** - Form modal with comprehensive validation and dropdown components
- **ScoringSection** - Streamlined 13-criteria scoring interface with progress tracking
- **CustomDropdown** - Beautiful glass dropdown components with search and animations
- **ScoringGuide** - Interactive scoring guide with visual recommendations

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

> ⚠️ *Production-ready for private deployment*

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
   SUPABASE_SERVICE_KEY=your-service-key
   ```

4. **Set up the database:**
   - Import the SQL schema from `/database/schema.sql`
   - Configure Row Level Security policies
   - Set up authentication with custom admin claims
   - Enable real-time subscriptions

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Public view: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`
   - Login page: `http://localhost:3000/login`

### **Production Deployment**
- **Vercel** - Optimized for Next.js deployment
- **Supabase** - Database and authentication hosting
- **Environment Variables** - Secure credential management
- **Domain Configuration** - Custom domain setup

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
- Real-time organization counts by status with color-coded badges
- Metadata loading progress with visual indicators
- Quick stats showing strong candidates (21+ score) and continent coverage
- Compact header design with optimized spacing

#### 🏢 **Organization Management**
- **Glass Card Layout** - Modern frosted glass cards with regional theming
- **Inline Editing** - Edit organization details with real-time validation and error feedback
- **Status Management** - Approve, reject, or set to pending with visual status indicators
- **Metadata Integration** - Automatic favicon extraction and website validation
- **Email Processing** - Smart email parsing and validation with multiple email support

#### 🎯 **Scoring Interface**
- **Streamlined 13-Criteria Assessment** - Clean, focused scoring interface
- **Visual Progress Tracking** - Progress bars and completion indicators
- **Smart Recommendations** - Color-coded recommendations based on total scores
- **Comments System** - Detailed notes with character limits and formatting
- **Score Summary** - Real-time score calculation with percentage breakdowns

#### 🔍 **Advanced Filtering & Search**
- **Multi-Status Filtering** - Filter by All, Pending, Approved, Rejected with live counts
- **Real-time Search** - Instant search across organization names and details
- **Advanced Filters** - Continent, score range, and website status filtering
- **Sorting Options** - Sort by name, score, status, country, or recent activity
- **Filter Persistence** - Maintains filter state across sessions

#### 🌐 **Metadata Enhancement**
- **Automatic Website Processing** - Favicon extraction and URL validation
- **Loading Progress Indicators** - Visual feedback for metadata processing
- **Website Status Validation** - Checks for valid URLs and website accessibility
- **Image Placeholder Generation** - Fallback images for organizations without websites

#### 🎨 **Design & UX**
- **Glass Morphism Aesthetic** - Modern frosted glass design with backdrop blur
- **Regional Color Theming** - Visual themes based on organization's geographic location
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - CSS-based transitions and hover effects
- **Accessibility Features** - ARIA labels, keyboard navigation, and screen reader support

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

## Design System

#### **Glass Morphism Components**
- **btn-glass** - Glass button variants with hover effects
- **panel-glass** - Frosted glass panels with backdrop blur
- **dropdown-glass** - Beautiful glass dropdown menus
- **stained-glass** - Subtle color overlays for regional theming

#### **Regional Theming**
Organizations are visually themed based on their geographic location:
- **North America** - Blue gradient themes
- **Europe** - Purple and blue themes  
- **Asia** - Green and teal themes
- **Africa** - Orange and amber themes
- **South America** - Red and pink themes
- **Oceania** - Cyan and blue themes
- **Middle East** - Yellow and orange themes

#### **Validation System**
- **Real-time Validation** - Instant feedback as users type
- **Visual Error States** - Red borders and error messages
- **Warning States** - Yellow borders for formatting suggestions
- **Success States** - Green indicators for valid inputs
- **Character Limits** - Live character counting for text fields

### **Performance Optimizations**
- **Efficient Re-renders** - Optimized state management to prevent unnecessary updates
- **Lazy Loading** - Dynamic imports for better initial load times
- **Metadata Caching** - Intelligent caching of website metadata
- **Debounced Search** - Optimized search performance with debouncing
- **CSS-only Animations** - Hardware-accelerated animations without JavaScript frameworks

---

## Deployment

### Deploying to Vercel

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. Set the following environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Click "Deploy".

> **Note:**  
> Make sure your Supabase database and authentication are fully configured before deploying.

---

### Troubleshooting

#### CSS Linting Warnings

You may see warnings like `Can't validate with unknown variable '--font-ibm-plex'` from the CSS linter.  
These are safe to ignore as long as your custom properties are defined in your CSS (e.g., in `:root`).  
The app uses proper fallback font stacks for all custom font variables.

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

This project is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE.md).

---

## Questions

For questions, feedback, or collaboration opportunities:

- **GitHub**: [@gurleyryan](https://github.com/gurleyryan)
- **Email**: [gurleyryan@gmail.com](mailto:gurleyryan@gmail.com)

---

## Roadmap

### **Phase 1: Core Admin Features** ✅
- [x] Organization CRUD operations
- [x] 13-criteria scoring system
- [x] Admin authentication & security
- [x] Real-time validation system

### **Phase 2: Enhanced UX** ✅
- [x] Glass morphism design system
- [x] Regional theming
- [x] Metadata enrichment
- [x] Advanced filtering & search
- [x] Responsive design
- [x] CSS-based animations

### **Phase 3: Admin Experience** ✅
- [x] Inline editing capabilities
- [x] Streamlined scoring interface
- [x] Progress tracking
- [x] Comprehensive validation
- [x] Custom dropdown components

### **Phase 4: Public Interface** 🚧
- [ ] Public organization directory
- [ ] Search and discovery
- [ ] Organization profiles
- [ ] Public API endpoints

### **Phase 5: Advanced Features** 📋
- [ ] Multi-admin collaboration
- [ ] Audit trails and history
- [ ] Export capabilities (CSV, JSON)
- [ ] Integration APIs
- [ ] Bulk operations
- [ ] Analytics dashboard