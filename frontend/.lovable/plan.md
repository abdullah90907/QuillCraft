## Plan: QuillCraft Frontend (TanStack Router, backend-ready)

### 1) Foundation and app shell
- Replace the placeholder index route with the QuillCraft app shell and production-ready structure.
- Update root metadata in `src/routes/__root.tsx` with app-specific SEO/social fields (title, description, og:title, og:description, og:type, twitter:card).
- Build a persistent **Header** (logo, nav links, theme toggle) and **Footer** (basic links/copyright) shared across all pages.
- Keep navigation in TanStack Router with clear active states for Home, Build, and Test.

### 2) Design system and theme architecture
- Refine `src/styles.css` tokens to a premium educational palette centered on indigo + teal with calm neutrals.
- Implement clean semantic surfaces, border, shadow, and spacing tokens so styling remains consistent in light and dark modes.
- Create reusable motion patterns (section reveal, staggered items, subtle hover lift, CTA emphasis) and apply with Framer Motion.
- Ensure theme toggle updates the document theme class and persists user preference.

### 3) Route structure and shared layout composition
- Add page routes:
  - `/` Home
  - `/build` Build
  - `/test` Test
- Keep a shared layout composition so header/footer remain persistent while page content transitions animate smoothly.
- Implement route-level transition wrappers for polished cross-page navigation.

### 4) Home page (visual-first, animation-heavy)
- Build a strong hero with premium typography, confident headline, and animated supporting copy/visual accents.
- Add prominent CTAs to Build and Test with micro-interactions.
- Implement animated **How it Works** section with staggered step cards.
- Implement **Key Features** cards with hover motion, iconography, and consistent premium styling.
- Optimize hierarchy and spacing so the first fold feels distinctive and high-quality on desktop and mobile.

### 5) Build page (bot creation UX)
- Create a clean, responsive bot-builder form with fields:
  - Bot Name
  - Role / Subject
  - Personality
  - Answer Style (segmented control: Hints First / Direct Answers)
  - Rules (textarea)
- Add polished form interactions, validation states, loading state, and submit feedback.
- After creation, display success state with animated confirmation and action to continue to Test.

### 6) Test page (chat interface, backend-ready)
- Build a chat interface that displays bot identity/config summary, transcript, input, and send action.
- Render confidence badges under assistant replies with clear visual emphasis.
- Use mock responses initially, but structure the chat layer with a clear request/response contract and service abstraction so it can plug into the existing FastAPI `/chat` endpoint later with minimal refactor.
- Add empty/loading/error states suitable for future real API integration.
- Include “Back to edit bot” navigation that returns to Build.

### 7) Shared state and UX behavior
- Implement lightweight shared client state for bot configuration and chat context, designed to support backend integration later.
- Ensure Build → Test data handoff is reliable and typed.
- Add graceful fallbacks on `/test` when no bot config exists (guide user back to Build).
- Keep interactions accessible with focus-visible states, keyboard support, and responsive behavior.

### 8) Polish and final consistency pass
- Align spacing rhythm, motion timing, card styles, and icon usage across all pages.
- Verify dark/light readability and contrast consistency.
- Ensure responsive quality across breakpoints and smooth perceived performance.
- Perform final pass for copy tone, visual coherence, and premium educational product feel.

## Technical details
- **Framework:** React + TypeScript (existing TanStack Start app)
- **Routing:** TanStack Router (confirmed)
- **Styling:** Tailwind CSS v4 with semantic tokens
- **Animation:** Framer Motion for page transitions and micro-interactions
- **Icons:** Lucide React
- **Architecture note:** The frontend will be built to allow easy connection to the existing FastAPI backend in the future, including the `/chat` integration path.
