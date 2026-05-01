# NutriScan AI Build Prompts

A phased prompt guide for designing and building **NutriScan** in **React Native with Expo Go**.

This document is written so it can be pasted into an AI coding assistant step by step. Each phase contains one high-quality prompt, detailed scope, UI/UX expectations, technical guardrails, and acceptance criteria.

---

## Project Context

**Product name:** NutriScan  
**Tagline:** Scan your food. Protect your health.  
**Platform:** React Native with Expo Go already set up  
**Primary users:** People managing diabetes, hypertension, kidney disease, heart disease, liver disease, and health-conscious users  
**Core promise:** Let users scan food and quickly understand if it is **Safe**, **Caution**, or **Avoid** based on their health profile  

### Core App Structure

- Bottom tabs: **Home**, **Scan**, **History**, **Profile**
- Global floating **NutriBot FAB** on all screens except the full-screen camera screen
- Key app flows:
  - Auth and guest entry
  - 3-tier health personalization onboarding
  - Fast scan-to-verdict flow
  - Food log and weekly summaries
  - NutriBot chat with condition-aware guidance
  - Health tips and article detail screens

### UX Priorities

- Prioritize sick and older users first
- Keep the main flow fast, simple, and readable
- Use plain language instead of medical jargon when possible
- Always explain **why** a food was flagged
- Make personalization visible across the app
- Design for trust, warmth, and clarity, not a cold clinical feel

### Design Direction

Use this design system consistently unless explicitly improved with the same tone:

- **Primary color:** Medical Teal
- **Surfaces:** Warm white / soft green-tinted neutrals
- **Verdicts:**
  - Safe = green
  - Caution = amber/orange
  - Avoid = red
- **Display/UI font style:** modern, slightly rounded, friendly
- **Body text:** highly readable, 16px minimum equivalent
- **Touch targets:** large and accessible
- **Visual tone:** calm, credible, supportive, health-focused

### Technical Expectations

- Use **TypeScript**
- Use **React Navigation** for app navigation
- Organize by feature/modules, not by random file dumping
- Create reusable components and theme tokens first
- Support both **light mode** and **dark mode**
- Keep the UI performant and easy to expand
- Avoid overengineering the first version

---

# Step Phase 1 — App Foundation, Design System, and Navigation Shell

## Goal

Create the app foundation, reusable design system, theme tokens, navigation structure, and starter screens so the rest of NutriScan can be built consistently.

## Prompt to Give the AI

```txt
You are a Senior UI/UX Designer and Lead React Native Developer. Build the foundation of my NutriScan mobile app using React Native with Expo Go and TypeScript.

Project context:
- App name: NutriScan
- Tagline: Scan your food. Protect your health.
- Users: people with diabetes, hypertension, kidney disease, heart disease, liver disease, and health-conscious users
- Goal: users scan food and get a verdict based on their health profile: Safe, Caution, or Avoid
- My React Native Expo Go setup is already ready

What I want in this phase:
1. Create a scalable project structure using feature-based folders
2. Set up theme tokens for colors, spacing, radius, shadows, typography, and dark mode
3. Create reusable UI primitives and shared components
4. Set up React Navigation with:
   - Auth stack
   - Onboarding stack
   - Main bottom tabs: Home, Scan, History, Profile
   - Modal-ready flow for article detail and NutriBot chat
5. Build starter placeholder screens with polished structure, not blank pages
6. Add a floating NutriBot FAB visible on all main screens except the camera screen
7. Use clean, production-ready TypeScript code

Design direction:
- Warm, trustworthy, health-focused UI
- Medical teal primary color
- Warm white surfaces
- Safe/Caution/Avoid color system
- Large readable text and accessible spacing
- Modern but simple visual style
- Avoid generic SaaS-looking cards and overcrowded layouts

Important rules:
- Use reusable components first before building complex screens
- No hardcoded styles everywhere; use theme tokens
- Keep body text highly readable
- Design for older and medically sensitive users
- Make every screen look intentionally designed, even placeholders
- Return code in a clean file-by-file structure

Deliverables:
- folder structure
- theme setup
- navigation setup
- shared UI component system
- starter screen scaffolds
- explanation of architecture decisions
```

## Expected Output from AI

- App folder architecture
- `theme/` with color, typography, spacing, and dark mode tokens
- Reusable components such as:
  - `AppScreen`
  - `TopBar`
  - `PrimaryButton`
  - `SecondaryButton`
  - `ConditionPill`
  - `VerdictBadge`
  - `Card`
  - `SectionHeader`
  - `EmptyState`
  - `FloatingNutriBotButton`
- Navigation shell with all major routes declared
- Placeholder screens with clean spacing and obvious hierarchy

## UI/UX Requirements

- Minimum readable body size
- Large tap targets
- Strong contrast in light and dark mode
- One clear primary action per main screen
- Bottom navigation should feel calm and obvious
- The FAB must not cover important content

## Acceptance Checklist

- Theme tokens exist and are reusable
- Navigation works without dead ends
- FAB visibility is conditional and correct
- Screens do not look raw or unfinished
- Light and dark mode both render correctly
- Code is organized for future feature development

---

# Step Phase 2 — Onboarding, Personalization, and Profile Setup

## Goal

Build the health personalization flow that tailors the app to the user’s condition, goals, and nutrient watchlist.

## Prompt to Give the AI

```txt
Act as a Senior Product Designer and Lead React Native Engineer. Build the NutriScan onboarding and profile initialization experience in React Native with Expo Go and TypeScript.

The onboarding must feel simple, friendly, and safe for users who may be sick, older, or not tech-savvy.

I need this onboarding flow:
1. Welcome / intro screen
2. Condition selection screen with multi-select cards for:
   - Diabetes / Prediabetes
   - Hypertension / High Blood Pressure
   - Heart Disease / High Cholesterol
   - Kidney Disease / Renal Diet
   - Liver Disease / Hepatitis
   - Cancer on treatment
   - My condition isn’t listed
   - I’m not sure
3. Goal / dietary concern selection using pill tags such as:
   - Lower my sugar
   - Reduce salt and sodium
   - Manage my weight
   - Cut down on fatty foods
   - Protect my kidneys
   - Avoid processed junk food
   - Protect my heart
   - My doctor said something else
4. Optional NutriBot assist step where the user can describe their situation in plain text and the app interprets it into profile settings
5. Final profile confirmation screen showing:
   - selected conditions
   - monitored nutrients
   - daily targets
   - start scanning CTA

What I want:
- A polished, step-by-step onboarding flow
- Clear progress indicator
- Large selection cards and chips
- Friendly copywriting
- Strong visual feedback when selections are made
- Validation states that are gentle, not harsh
- A profile state model that can power the rest of the app
- Reusable components for selectable health cards and chips

UX rules:
- Keep the number of choices manageable on screen
- Use plain language
- Avoid making users feel diagnosed by the app
- Make it clear they can update this later
- Keep the experience encouraging and low-stress

Technical requirements:
- Use React Hook Form or a simple typed form state approach if cleaner
- Save onboarding state cleanly
- Create a typed user health profile model
- Make the onboarding reusable for future profile editing
- Return production-ready code and file structure

Also include:
- microcopy suggestions
- empty states
- validation behavior
- component breakdown
- notes on accessibility
```

## Expected Output from AI

- Full onboarding screen implementations
- Profile domain types and state shape
- Reusable selection components
- Progress UI and transitions
- Confirmation summary card
- Clear strategy for editing conditions later from Profile

## UI/UX Requirements

- Selected cards should be obviously active
- Progress should reduce anxiety, not feel long
- The final summary should make users feel understood
- Nutrient targets must be presented clearly and simply
- Avoid medical complexity overload

## Acceptance Checklist

- All onboarding steps are connected and functional
- The selected profile data persists correctly
- The experience works for both certain and unsure users
- NutriBot assist step feels optional, helpful, and not blocking
- The final confirmation screen feels rewarding and clear

---

# Step Phase 3 — Home, Scan Flow, Result Experience, and History

## Goal

Build the core NutriScan product experience: dashboard, camera entry, preview, verdict result, food logging, manual search fallback, and history views.

## Prompt to Give the AI

```txt
You are a Senior UI/UX Designer and Lead React Native Developer. Build the core NutriScan MVP flow in React Native with Expo Go and TypeScript.

I need these screens fully designed and implemented with reusable components:

HOME
- Greeting header
- Visible condition pills
- Today's health safety card with donut/ring summary
- Large Scan Food CTA
- Today's log preview
- Personalized health tips carousel
- Empty-state version for first-time users with no scans yet

SCAN FLOW
- Full-screen camera scan hub
- Overlay scan frame
- Toggle between Photo and Barcode
- Capture action
- Manual search fallback
- Preview / confirm screen after capture
- Loading skeleton while analysis happens
- Editable detected food name field
- Analyze button

SCAN RESULT
- Large verdict badge: Safe / Caution / Avoid
- Food image and food title
- Meal type and timestamp
- Illness alert card for caution or avoid
- Clear explanation of why the item is risky
- Nutrient rows focused on the user’s condition
- Expandable full nutrition facts area
- Better alternatives section for risky results
- Add to Food Log CTA
- Scan Another secondary action
- Safe-state variant with a positive message

MANUAL SEARCH
- Search screen with recent searches and searchable food results

HISTORY
- Daily logs list
- Date selector
- Daily summary card
- Weekly trend chart for safe/caution/avoid counts
- Full health summary report screen
- Frequent risky foods list
- Nutrient over-limit indicators

Critical UX rules:
- The scan flow must feel fast and obvious
- Users should always understand what is happening
- The result screen must explain why, not just show a red badge
- Use plain language such as “High sodium for your kidney condition”
- Show only the most relevant nutrients first
- Keep the Add to Food Log action very clear
- Design graceful loading, empty, and retry states

Technical expectations:
- Build with modular components
- Separate presentation from mock data/services where possible
- Use chart-friendly architecture for the history views
- Make camera screen visually focused and uncluttered
- Hide NutriBot FAB only on the camera viewfinder screen

Please provide:
- file-by-file code
- reusable components
- mock data structure
- screen composition reasoning
- performance and accessibility notes
```

## Expected Output from AI

- Home dashboard and empty-state version
- Camera and preview flow
- Result screen variants
- Food log behaviors
- Search fallback UI
- History summary and report screens
- Skeleton and error states

## UI/UX Requirements

- The primary scan CTA must stand out immediately
- The result screen must have a very strong visual hierarchy
- Verdict color must be obvious but not visually aggressive
- Nutrient information should be prioritized by relevance
- Charts should be simple and readable on mobile

## Acceptance Checklist

- A user can move from Home to result with minimal confusion
- Result screens explain risk clearly
- Food log actions are easy to understand
- History screens are informative without feeling too dense
- Empty states and loading states feel intentional

---

# Step Phase 4 — NutriBot, Profile, Settings, and Final UX Polish

## Goal

Build the support layer of the app: NutriBot chat, chat history, profile management, settings, trust signals, final polish, and app-wide UX refinement.

## Prompt to Give the AI

```txt
Act as a Senior Conversational UX Designer and Lead React Native Engineer. Build the final NutriScan support experience in React Native with Expo Go and TypeScript.

I need the following areas implemented:

NUTRIBOT
- Floating action button across the app except on the camera screen
- Full chat screen
- Chat history screen
- User bubbles and assistant bubbles
- Quick suggestion chips such as:
  - Is this food safe for me?
  - What should I eat for breakfast?
  - Explain my last scan
  - What foods are high in sodium?
  - Give me a healthy meal idea
- Context-aware chat header showing user condition pills
- Clean input bar and message grouping
- Empty state for users with no chat history

PROFILE
- Profile home screen
- User identity area
- Condition pills
- Health goals and daily nutrient limits
- Edit profile
- Re-open condition setup / onboarding editing flow
- Stats cards like total scans, safe this week, streak
- NutriBot section with chat history shortcut

SETTINGS
- Dark mode toggle
- Language selector
- Notification settings
- Privacy options
- Help center / feedback rows
- Medical disclaimer area
- Logout action

FINAL UX POLISH
- Add loading states, error states, and empty states everywhere needed
- Improve spacing and hierarchy consistency across all screens
- Add subtle animations and transitions where they help clarity
- Ensure FAB placement never blocks important actions
- Make all interactive areas accessible and obvious
- Review the app as one cohesive design system

Important behavioral rules:
- NutriBot must feel warm, short, and supportive
- The chatbot should never sound alarming or act like a doctor
- Medical questions should include a soft disclaimer pattern
- Settings should feel simple and not crowded
- The app should feel polished enough for a thesis demo or MVP showcase

Technical requirements:
- Use reusable chat components
- Make the chat UI scalable for future streaming responses
- Keep profile and settings modular
- Use clean typing and maintainable architecture

Also provide:
- final UI consistency audit
- UX improvement suggestions
- list of missing refinements or future enhancements
- recommended cleanup before production/demo
```

## Expected Output from AI

- NutriBot FAB and screens
- Chat UI system and reusable message components
- Profile and settings implementation
- Final polish pass recommendations
- UX audit notes for demo readiness

## UI/UX Requirements

- Chat should feel safe and easy to read
- Profile should feel personal but lightweight
- Settings should be grouped logically
- The app should feel connected across all tabs and flows

## Acceptance Checklist

- NutriBot works as a consistent support layer
- Profile data is understandable and editable
- Settings are clean and discoverable
- The whole app feels cohesive in both themes
- MVP demo quality is achieved

---

## Recommended AI Workflow

Use the phases in this exact order:

1. **Phase 1 first** to establish architecture and design consistency
2. **Phase 2 next** so profile data can drive the app behavior
3. **Phase 3 third** because it is the core product value
4. **Phase 4 last** to refine support, settings, and overall polish

Do not ask the AI to build everything at once. Use one phase at a time, review the output, run it, fix structure issues, then continue.

---

## Implementation Notes for Better AI Results

- Always paste the full phase prompt, not partial fragments
- Ask the AI to return code by files and folders
- Ask for reusable components before large screens
- After each phase, ask for a cleanup/refactor pass
- After each phase, ask for accessibility and dark mode review
- If a screen looks generic, ask the AI to improve hierarchy, spacing, and health-app warmth
- Keep mock data realistic so the UI feels believable during development

---

## Final Reminder for the AI

NutriScan is not a generic wellness app. It is a condition-aware food safety companion for people who may be anxious, sick, older, or unsure about what they can eat. The UI must feel calm, fast, trustworthy, and personalized. Every important screen should reduce uncertainty and guide the user toward a clear next action.
