---
name: Serene Structure
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#42474e'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#72777f'
  outline-variant: '#c2c7cf'
  surface-tint: '#366289'
  primary: '#335f87'
  on-primary: '#ffffff'
  primary-container: '#4e78a1'
  on-primary-container: '#fdfcff'
  inverse-primary: '#a0caf8'
  secondary: '#36656e'
  on-secondary: '#ffffff'
  secondary-container: '#baebf5'
  on-secondary-container: '#3c6b75'
  tertiary: '#3e6447'
  on-tertiary: '#ffffff'
  tertiary-container: '#567e5e'
  on-tertiary-container: '#f6fff4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#a0caf8'
  on-primary-fixed: '#001d34'
  on-primary-fixed-variant: '#1a4a70'
  secondary-fixed: '#baebf5'
  secondary-fixed-dim: '#9fced9'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#1b4d56'
  tertiary-fixed: '#c1edc8'
  tertiary-fixed-dim: '#a6d1ad'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#284f33'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
  soft-blue: '#5D87B1'
  muted-teal: '#76A5AF'
  muted-green: '#8FB996'
  soft-amber: '#EBC06D'
  soft-coral: '#E5989B'
  warm-off-white: '#F9F7F2'
  slate-text: '#374151'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.5'
  question-text:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.6'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  button-label:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  touch-target-min: 56px
  container-max: 1024px
---

## Brand & Style

The design system is built upon the **Autism Learning Experience (ALX)** framework, prioritizing emotional safety, cognitive ease, and radical predictability. The brand personality is calm, supportive, and dependable—acting as a steady guide rather than an overstimulating entertainer.

The visual style is a refined **Minimalist** approach with **Tactile** affordances. It utilizes heavy whitespace to reduce "visual noise," allowing students with sensory sensitivities to focus on a single learning objective. Elements use soft, physical metaphors (gentle shadows and rounded corners) to make interactive targets feel approachable and "clickable" without the jarring intensity of high-saturation gamification.

**Key Stylistic Pillars:**
- **Predictability:** Consistent placement of functional anchors (navigation, progress).
- **Reduced Sensory Load:** No flashing, high-contrast vibrating colors, or complex motion.
- **Literalism:** Icons and imagery represent real-world objects exactly as they are.

## Colors

The palette is intentionally "de-saturated" to prevent sensory overwhelm. The default mode is **Light**, utilizing a warm off-white base to reduce the harsh glare often associated with pure white backgrounds (#FFFFFF).

- **Primary (Soft Blue):** Used for navigation and primary actions. It evokes a sense of calm and stability.
- **Secondary (Muted Teal):** Used for supporting information and secondary interactive elements.
- **Tertiary (Muted Green):** Reserved for success states and "Mastery" indicators.
- **Soft Amber & Soft Coral:** Used for warnings and "safe mistakes" respectively. These are low-vibrancy tones to ensure feedback is clear but never alarming.

**Contrast Note:** All text-to-background combinations must meet WCAG AA standards, primarily using `slate-text` (#374151) against `warm-off-white` (#F9F7F2).

## Typography

This design system uses **Inter** exclusively for its exceptional legibility and neutral, professional character. 

**Principles for ASD Readability:**
- **Alignment:** All text blocks are strictly left-aligned to provide a consistent vertical "anchor" for the eye.
- **Line Height:** Generous leading (1.6x - 1.7x) is applied to body text to prevent "line-jumping" during reading.
- **Width:** Paragraphs are constrained to a maximum width of 80 characters to minimize eye travel.
- **Weight:** Avoid ultra-thin weights. Medium (500) is preferred for questions and prompts to ensure they stand out clearly against instructional text.

## Layout & Spacing

The layout follows a **Fixed Grid** model centered on the screen to limit the field of view and reduce peripheral distraction. 

- **The Learning Area:** Content is housed in a central container with a max-width of 1024px. This ensures that even on ultra-wide monitors, the "Observe" and "Practice" materials remain within a comfortable focal range.
- **Spacing Rhythm:** An 8px base unit is used. To maintain "High Whitespace," major components (like the instruction area vs. the interaction area) should be separated by at least 48px (6 units).
- **Responsive Behavior:** 
    - **Desktop:** 12-column grid, 64px margins.
    - **Tablet:** 8-column grid, 32px margins.
    - **Mobile:** 4-column grid, 16px margins.
- **Touch Safety:** All interactive elements maintain a minimum spacing of 16px from each other to prevent accidental taps.

## Elevation & Depth

To maintain a "low sensory load," this design system avoids complex lighting and heavy shadows. Hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**.

- **Surface Tiers:** The main background is the lowest layer (`warm-off-white`). Instructional cards and practice areas sit on a slightly elevated white surface (#FFFFFF).
- **Shadows:** Shadows are used only to indicate interactivity. They are highly diffused, low-opacity (10-15%), and tinted with the `primary-color` hue to keep the interface feeling warm rather than sterile/gray.
- **Depth as Feedback:** When a student taps a "Practice" element, the elevation should decrease (a "pressed" state) to provide immediate tactile confirmation that the action was registered.

## Shapes

The shape language uses **Rounded** corners (0.5rem / 8px) to eliminate "sharp" edges, which can feel aggressive or clinical. 

- **UI Elements (Buttons/Inputs):** 8px radius.
- **Cards/Learning Containers (Large):** 16px (rounded-lg) to 24px (rounded-xl) for a friendlier, softer appearance.
- **Selection States:** When an item is selected in a "Quiz" or "Match" activity, the border thickness increases to 3px with a soft glow, rather than changing the shape itself, maintaining predictability.

## Components

The component library is built specifically for the 'Observe, Practice, Quiz, Complete' lesson flow.

### 1. The Lesson Header
- **Progress Indicator:** A horizontal bar at the very top. Uses `muted-green` for completed segments and `warm-off-white` for remaining. Includes text: "Step 2 of 4".
- **Navigation:** Back and Home buttons are always in the top-left, fixed.

### 2. Learning Cards (Observe & Practice)
- **Visual Container:** A large, centered white card with 24px padding. 
- **Instructional Prompts:** Located at the top of the card in `question-text` style. 
- **Media:** Images must have high-contrast outlines or be isolated on white backgrounds to ensure the literal object is the focus.

### 3. Interaction Elements
- **Buttons:** Large (56px height) with `button-label` text. The primary action (e.g., "Submit Answer") uses `soft-blue`. Secondary actions (e.g., "Listen Again") use a ghost-button style with a 2px `soft-blue` border.
- **Chips/Selection Items:** Used for matching and MCQ. These must have a clear "hover" (soft highlight) and "selected" (3px primary border) state.
- **Input Fields:** Large, 20px text size. Focus states must be high-visibility but use the `soft-blue` palette.

### 4. Feedback & Transitions
- **Positive Completion:** A full-screen overlay using `muted-green` accents. It should feature a large checkmark icon and simple literal praise: "Great work. You finished the lesson."
- **Sensory Controls:** A persistent "Sensory" fab or menu item allowing students to toggle audio hints and reduce motion globally.

### 5. Lesson Flow Transitions
- Before moving from "Observe" to "Practice," a transition screen displays: "Next: Practice" with a single "Start Practice" button. This prepares the student for the shift in activity type.
