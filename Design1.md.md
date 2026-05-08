---
version: 1.0.0
name: NutriScan Neo-Brutalist Medical Teal
purpose: Frontend-only redesign system for the NutriScan mobile app
main_color: "#00897B"
description: Neo-Brutalist mobile UI system adapted for a health app using Medical Teal as the primary brand color while preserving bold borders, hard shadows, graphic depth, and high-contrast structure.
colors:
  medical-teal: "#00897B"
  medical-teal-dark: "#00695C"
  medical-teal-light: "#26A69A"
  mint-tint: "#E0F2F1"
  deep-black: "#0A0A0A"
  white: "#FFFFFF"
  warning-coral: "#FF6B57"
  caution-yellow: "#FFD54F"
  success-green: "#2E7D32"
typography:
  display-xl:
    fontFamily: "Space Grotesk"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: "0.95"
  display-md:
    fontFamily: "Space Grotesk"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: "1"
  body:
    fontFamily: "DM Sans"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.6"
  ui-label:
    fontFamily: "Space Grotesk"
    fontSize: "0.95rem"
    fontWeight: 700
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
rounded:
  none: "0px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  full: "999px"
shadows:
  brutal-sm: "3px 3px 0 0 #0A0A0A"
  brutal-md: "5px 5px 0 0 #0A0A0A"
  brutal-lg: "8px 8px 0 0 #0A0A0A"
borders:
  heavy: "3px solid #0A0A0A"
  extra-heavy: "4px solid #0A0A0A"
motion:
  bounce: "cubic-bezier(0.175, 0.885, 0.32, 1.275)"
  snap: "180ms ease-out"
  float: "4s ease-in-out infinite"
---

# NutriScan Frontend Redesign System

Use this design system to redesign the entire NutriScan frontend only. Keep all backend logic, API calls, Supabase flows, business logic, state management, and data models unchanged.

## Core Direction
NutriScan should feel bold, memorable, and high-contrast, but still trustworthy for a health product. Keep the neo-brutalist DNA: thick black borders, hard offset shadows, solid fills, graphic shapes, and punchy motion. Replace the original acid-green-led feel with a cleaner healthcare-led system centered on Medical Teal (#00897B).

## Design Goals
- Make the app feel modern, energetic, and premium without looking childish.
- Keep a strong health-tech identity using teal as the anchor color.
- Preserve high contrast and structural clarity on every screen.
- Improve visual hierarchy, spacing, readability, and component consistency.
- Redesign only presentation and interaction styling, not app logic.

## Color Rules
Use Medical Teal (#00897B) as the primary accent across buttons, highlights, pills, active tabs, focus states, icons, and important metrics. Use Deep Black (#0A0A0A) for borders, text, and brutalist shadow offsets. Use White and Mint Tint (#E0F2F1) for cards and screen backgrounds to keep the app fresh and readable.

Use supporting semantic colors only where needed:
- Safe / success: #2E7D32
- Caution / warning: #FFD54F
- Avoid / danger: #FF6B57

Do not use soft gradients, blurred pastel cards, or low-contrast gray-on-gray surfaces. Colors should be solid, intentional, and readable.

## Typography
- Headlines: Space Grotesk, bold, compact, slightly oversized.
- Body: DM Sans, clean and readable.
- UI labels: Space Grotesk, bold, uppercase or lowercase depending on context.
- Prefer short, direct copy.
- Lowercase section headers are allowed if they still feel polished.

## Layout Principles
- Use a strong card-based layout.
- Prefer rigid alignment with intentional asymmetry.
- Allow slight rotation on decorative cards or promo sections, but keep essential health data straight and readable.
- Keep wide padding and clear spacing between sections.
- Avoid cramped layouts and text touching borders.

## Elevation & Depth
- Every major card should use thick black borders and hard offset shadows.
- Use shadows like `5px 5px 0 #0A0A0A`, not soft blur shadows.
- Use layered surfaces to create depth: card, badge, pill, CTA, floating button.
- Avoid glassmorphism and soft neumorphism.

## Shape Language
- Mix rounded pills with hard-edged cards.
- Buttons can be pill-shaped, but cards should feel sturdy and graphic.
- Metric tiles, result cards, and info panels should look tactile and bold.
- Use large corner radii only when it supports the neo-brutalist system.

## Motion
- Interactions should feel snappy and physical.
- Buttons should slightly scale on press.
- Cards may have tiny bounce or wobble on entry.
- Keep transitions short and purposeful.
- Avoid slow, floaty, luxury-style animations.

## Frontend-Only Guardrails
Do not modify:
- backend logic
- API integrations
- Supabase queries
- authentication flow
- business logic
- reducers, context logic, or data models unless purely needed for UI typing
- route behavior unless required for frontend presentation only

You may modify:
- screen layout
- spacing
- typography
- card design
- buttons
- pills and badges
- tab bar styling
- icon sizing
- loading, empty, and error state presentation
- animations and transitions
- reusable presentational UI components

## Global UI Rules
- All primary buttons: Medical Teal fill, black border, hard shadow, bold label.
- All secondary buttons: white or mint fill, black border, black text.
- All cards: heavy black border, hard shadow, solid fill.
- All pills and badges: compact, bold, high contrast.
- Inputs: thick borders, large labels, clear focused state using teal.
- Icons: bold and simple, not thin or delicate.
- Section headers: strong hierarchy with subtitle support.

## Screen Styling Guidance

### Auth Screens
Make login, register, and forgot password feel bold and welcoming. Use large headings, thick bordered inputs, strong CTA buttons, and compact helper text. Keep the forms clean, not noisy.

### Onboarding
Use high-energy cards and chips for condition and goal selection. Selected states should feel obviously active with teal fills or teal accents. Progress indicators should be graphic and memorable.

### Home Dashboard
Turn the dashboard into a high-contrast health command center. The greeting, scan CTA, safety overview, nutrient watchlist, and health tips should each live in distinct brutalist cards with clear hierarchy.

### Scan Flow
Camera overlay, preview, and result screens should feel urgent, smart, and easy to understand. Verdict states must be instantly scannable using semantic color blocks with strong typography.

### History & Reports
Charts, daily logs, and risky food summaries should feel structured and analytical. Use bold section cards and consistent metric tiles.

### NutriBot
Make the AI chat feel playful but useful. Chat bubbles should keep the brutalist identity with clean contrast and strong spacing, while still feeling readable for long conversations.

### Article Screens
Health tips and article detail should feel editorial, not generic AI-generated. Use image-first cards, strong titles, clean takeaways, and less clutter.

### Profile
Profile should feel like a personal health dashboard. Use bold stat cards, clean info sections, clear edit actions, and a polished active/auth badge.

## Component Directions

### Buttons
- Thick black border
- Hard shadow
- Medical Teal primary fill
- Slight press-down scale on tap
- Rounded pill for major CTA, rounded rectangle for utility actions

### Cards
- White or mint backgrounds
- Black border + hard offset shadow
- Optional slight rotation only on decorative cards
- Never use overly soft, modern SaaS shadows

### Inputs
- Black border, white fill
- Strong label above field
- Teal focus ring or teal border state
- Error state uses coral with clear message

### Badges & Pills
- Compact and bold
- Teal for active
- Yellow for caution
- Coral for avoid/danger
- Green for safe status if needed

### Tab Bar
- Keep it bold and tactile
- Active tab should clearly use Medical Teal
- Floating scan or assistant actions can be exaggerated and playful

## Accessibility
- Maintain strong contrast at all times.
- Do not put teal text on dark teal backgrounds without enough contrast.
- Large headings must still be readable on small screens.
- Avoid overly rotated content when it contains important health information.
- Use clear states for loading, disabled, selected, error, and success.

## Do's
- Do keep the black-border brutalist identity.
- Do use Medical Teal as the main brand anchor.
- Do make cards feel tactile and layered.
- Do prioritize readability for health information.
- Do make UI feel app-ready, not like a marketing landing page.

## Don'ts
- Don't touch backend logic or data flow.
- Don't introduce soft gradients or blurry shadows.
- Don't make the health interface chaotic or hard to read.
- Don't over-rotate core content like nutrient values or scan verdicts.
- Don't turn every component into a decorative object.

## Final Instruction for the AI Redesigning the App
Redesign the entire NutriScan frontend using this Medical Teal neo-brutalist system. Keep the existing functionality, backend integrations, state flow, and routing behavior intact. Focus on replacing only the visual language, interaction polish, spacing, hierarchy, and reusable presentational components so the app feels bold, cohesive, health-focused, and production-ready.
