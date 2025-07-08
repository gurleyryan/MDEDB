# Climate Org Directory & Scoring Dashboard

<!-- Uncomment once you select a license -->
<!-- [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/license/mit/) -->

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Admin Dashboard](#admin-dashboard)
- [Contributing](#contributing)
- [Credits](#credits)
- [Tests](#tests)
- [License](#license)
- [Questions](#questions)

---

## Description

A centralized platform to catalog, score, and assess grassroots climate organizations based on a shared rubric. Admins can review submitted orgs, assign structured impact scores across 13 criteria, and approve or reject entries. The goal is to support a transparent, collective, and scalable ecosystem for climate action, aligned with Music Declares Emergency.

---

## Tech Stack

- **Next.js** with App Router
- **Supabase** (PostgreSQL, Auth, RLS, Storage)
- **Tailwind CSS** for UI
- **Google Apps Script** for sheet-to-DB syncing
- **JWT Custom Claims & Auth Hooks** for secure RBAC

---

## Installation

> ⚠️ *In development — not yet deploy-ready for public use.*

1. Clone the repo:
   ```bash
   git clone https://github.com/[your-username]/climate-org-directory.git
   cd climate-org-directory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your `.env.local` with Supabase project URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

---

## Usage

Basic public view and scoring summaries coming soon.

For now, the **admin dashboard** includes:

- Full organization list with filters by approval status
- Ability to **approve**, **reject**, or **set to pending**
- Live synced Supabase RLS and auth-based permissions

> ✅ Admin access requires valid Supabase login with associated `admin` role injected into JWT.

---

## Admin Dashboard

![screenshot-coming-soon](#)

Features:

- Custom claim-based access control
- Realtime updates to org approval state
- RLS-secured view of climate orgs
- Simple filters for `pending`, `approved`, and `rejected`

---

## Contributing

Contributors:

- [Ryan Gurley](https://github.com/gurleyryan)

Pull requests welcome as the project evolves into public submission + scoring.

---

## Credits

- [Supabase](https://supabase.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Music Declares Emergency](https://musicdeclares.net/)

---

## Tests

N/A at this stage.

---

## License

No license selected yet.

---

## Questions

Reach out with feedback, interest, or questions:

- [GitHub](https://github.com/gurleyryan)
- <a href="mailto:gurleyryan@gmail.com">gurleyryan@gmail.com</a>
