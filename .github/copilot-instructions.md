# AMPLIFY Operations Platform - AI Coding Agent Instructions

## Project Overview
**AMPLIFY** is a Next.js web platform for curating and verifying grassroots climate organizations. It provides an admin dashboard for organization assessment, scoring, and approval management. Artists see only approved, verified organizations, enforced through Supabase Row Level Security (RLS).

## Architecture Essentials

### Core Data Model
- **`Org`** ([models/org.ts](../models/org.ts)) - Base organization interface with 20+ fields
- **`OrgWithScore`** ([models/orgWithScore.ts](../models/orgWithScore.ts)) - Extends `Org` with calculated `alignment_score`
- **`OrgScoring`** ([app/utils/scoring.ts](../app/utils/scoring.ts)) - 13-criteria scoring structure (each 0-2 points, max 26)

### Multi-Layer Permission Model
1. **JWT Auth** → [app/utils/supabase/middleware.ts](../app/utils/supabase/middleware.ts) validates session
2. **RLS Policies** → Database-level row security enforces role visibility
3. **Hook-Level Filtering** → [useOrganizations.ts](../app/hooks/useOrganizations.ts) queries `org_public_view` (public) vs `org_with_score` (admin)
4. **Approval Status Gate** → Only `approved` + `verified_at IS NOT NULL` visible to public queries

### API Routes Pattern
- **`/api/metadata`** - Website scraping with retry logic, 24h caching, favicon extraction
- Response includes `title`, `description`, `favicon`, `image`, validation status
- Failures mark organization as needing manual review

## Critical Developer Patterns

### State Management via Custom Hooks
Never use Redux/Context for this app. Use specialized hooks:

- **`useOrganizations()`** - CRUD operations, filters by role/public status
  - `fetchOrgs()` / `updateStatus()` / `addOrganization()` / `updateOrganization()`
  - Returns `{ orgs, loading, error, updatingId, ... }`
  
- **`useScoring()`** - Scoring logic and persistence
  - `fetchOrgScoring()` / `updateScoringField()` / `saveScoring()`
  - Manages optimistic UI updates
  
- **`useWebsiteMetadata()`** - Metadata fetching with auto-retry
  - Passes `orgs` array, returns `{ websiteMetadata, loadingMetadata, error }`

### Component Architecture
Components use **controlled components** with validation:
- [OrganizationCard](../app/components/OrganizationCard/index.tsx) - Card display + inline editing
- [AddOrganizationModal](../app/components/AddOrganizationModal/index.tsx) - Form with real-time validation
- [ScoringSection](../app/components/ScoringSection/index.tsx) - 13-criteria scorecard
- [CustomDropdown](../app/components/CustomDropdown/index.tsx) - Reusable glass-morphism dropdowns

Props receive both data AND callback functions; no data mutations without parent callbacks.

### Validation Strategy
All validation lives in [app/utils/validation.ts](../app/utils/validation.ts):
- Email parsing supports multiple comma-separated emails
- Country code validation (ISO 3166-1 alpha-2, 2 uppercase letters)
- Org name: 2-200 characters
- Approval status: `pending | approved | rejected | under_review`

Use `validateOrganization()` before form submission to get `{ errors, warnings }` arrays.

### Styling Conventions
- **Tailwind + custom CSS** - No shadcn/ui; use [globals.css](../app/globals.css) for glass morphism
- **Motion animations** - [framer-motion](../app/utils/motion.ts) with reduced-motion support
- **Dark theme** - Custom colors: `mde-blue`, `mde-yellow`, `mde-green`
- **Responsive** - Mobile-first; heavy use of `sm:`, `md:` breakpoints

## Scoring System (13 Criteria)
Max total: 26 points (2 pts each). Thresholds:
- **Strong Candidate** ≥ 21 pts
- **Promising Candidate** 13-20 pts
- **Low Priority** < 13 pts

See [scoring.ts](../app/utils/scoring.ts) for full criteria descriptions and constants.

## Supabase Integration Points
- **Tables**: `org`, `org_scoring`, `user_roles`
- **Views**: `org_with_score` (admin), `org_public_view` (public)
- **Auth**: JWT tokens in cookies; refresh handled by middleware
- **Client**: [createClient()](../app/utils/supabase/client.ts) for browser; server functions use SSR client

## Development Workflow

### Build & Run
```bash
npm run dev        # Next.js with Turbopack (port 3000)
npm run build      # Production build
npm run lint       # ESLint check
```

### Key Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- Database RLS policies **must match** role checks in hooks

## Common Pitfalls to Avoid

1. **Querying wrong view** - Admin needs `org_with_score` (includes alignment_score), public needs `org_public_view`
2. **Forgetting validation** - Always validate before `.update()` / `.insert()`
3. **Broken email parsing** - Support comma-separated emails; see [validation.ts](../app/utils/validation.ts)
4. **RLS policy mismatches** - Hook role check must align with database RLS filters
5. **Inline editing state** - Manage `editingOrgId` + `editForm` in parent; pass callbacks to OrganizationCard
6. **Missing async error handling** - Always check `{ data, error }` tuple from Supabase

## Reference Files by Function
- **Auth flow**: [useUser.ts](../app/hooks/useUser.ts)
- **Icons system**: [Icons/index.tsx](../app/components/Icons/index.tsx)
- **Form validation**: [validation.ts](../app/utils/validation.ts)
- **Admin dashboard**: [admin/page.tsx](../app/admin/page.tsx) (657 lines - main orchestrator)
- **Public homepage**: [page.tsx](../app/page.tsx)
- **Login page**: [login/page.tsx](../app/login/page.tsx)
