# Onboarding UI/UX Fix

## Objective
Remove all skip buttons from the onboarding flow, ensure personalization is completed before entering home, and fix spacing/UI consistency across all onboarding screens.

## Flow
Welcome → Conditions → Goals → [nutribot-assist if "unsure"] → Confirmation → Tabs

No skips allowed. User must actively engage with each screen.

## Screens

### Welcome (`welcome.tsx`)
- **Remove**: "Skip for Now" secondary button
- **Remove**: Tertiary text "You can always update your health profile from Settings later"
- **Remove**: `SecondaryButton` from imports
- **Spacing**: Change container from `justifyContent: 'space-between'` to natural top-to-bottom flow
- **Typography**: Use `theme.textStyles` objects instead of inline font properties

### Conditions (`conditions.tsx`)
- **No functional changes** — no skip to remove
- **Spacing**: Fix "or" divider line to 3px (match brutalist border style). Standardize margin values on divider and custom input wrapper using theme spacing tokens

### Goals (`goals.tsx`)
- **Remove**: "Skip this step" secondary button when no goals selected
- **Remove**: `SecondaryButton` from imports
- **PrimaryButton**: Always enabled. Label always "Continue" (remove conditional goal-count text)
- **Spacing**: Increase margin-bottom on chip area before button

### NutriBot Assist (`nutribot-assist.tsx`)
- **Keep**: All secondary actions ("re-answer", "pick manually") as legitimate choices
- **Changes**: Remove duplicate custom progress bar on questions step (layout's ProgressBar already covers it). Make question step scrollable. Fix padding to match other screens.

### Confirmation (`confirmation.tsx`)
- **No functional changes**
- **Spacing**: Minor: align action marginTop values with theme spacing (`spacing.xl` = 32)

## Common Patterns
- Use `theme.textStyles.h1`/`h2`/`body`/`caption` consistently instead of inline fontFamily/fontSize/fontWeight/lineHeight
- Use `theme.spacing` tokens for all margin/padding values
- Consistent padding: `paddingTop: 16, paddingHorizontal: 20, paddingBottom: 40` inside scroll views
