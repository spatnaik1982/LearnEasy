# Autism Learning Experience (ALX) Design Guidelines

## Arin Learn Design System v1.0

**Document Type:** UX Design Guidelines
**Product:** Arin Learn
**Audience:** Designers, Product Managers, Frontend Engineers, Content Authors
**Purpose:** Establish a consistent autism-friendly learning experience for children preparing for NIOS OBE Levels A, B, and C.

---

# 1. Introduction

Arin Learn is designed specifically for autistic learners.

Traditional UX principles often optimize for efficiency, speed, and engagement. For autistic learners, these goals must be balanced with predictability, sensory comfort, emotional safety, and cognitive accessibility.

These guidelines define the Autism Learning Experience (ALX) framework used throughout the platform.

---

# 2. Core Design Philosophy

## ALX-1 Predictability

Every screen should feel familiar.

Users should always know:

* Where they are
* What they are doing
* What comes next
* How much remains

### Requirements

* Navigation remains in the same position across all screens.
* Primary actions remain consistent.
* Lesson structure never changes.
* Avoid unexpected UI changes.

---

## ALX-2 Visual First

Show before explaining.

Many autistic learners process visual information more effectively than verbal instructions.

### Requirements

* Every concept begins with a visual example.
* Use illustrations before text explanations.
* Pair text with icons or imagery.
* Use visual demonstrations whenever possible.

---

## ALX-3 One Concept at a Time

Avoid introducing multiple concepts simultaneously.

### Requirements

Each screen should focus on:

* One concept
* One task
* One decision

### Example

Good:

Count these apples.

Bad:

Count apples, compare quantities, and solve addition.

---

## ALX-4 Visible Progress

Users should always understand progress and completion.

### Requirements

Display:

* Step indicators
* Lesson progress
* Question counts
* Completion status

### Example

Question 2 of 5

---

## ALX-5 Safe Mistakes

Mistakes should feel like part of learning.

### Requirements

* Unlimited retries
* No penalties
* No failure states
* No public scoring

### Preferred Feedback

"Let's try counting again."

### Avoid

"Incorrect."

"You failed."

---

## ALX-6 Controlled Sensory Environment

Users must control sensory stimulation.

### Requirements

* No autoplay audio
* No autoplay video
* No flashing elements
* No unexpected animations

Users must be able to:

* Mute sounds
* Disable animations
* Adjust contrast
* Adjust audio speed

---

## ALX-7 Routine-Based Learning

Learning should follow a predictable structure.

### Standard Lesson Flow

1. Observe
2. Practice
3. Quiz
4. Complete

Never alter this sequence.

---

## ALX-8 Mastery-Based Progression

Progress should reflect understanding rather than completion.

### Focus On

* Skills learned
* Concepts mastered
* Growth over time

### Avoid

* Excessive points
* Competitive leaderboards
* Rank systems

---

# 3. Visual Design Guidelines

## Color System

The interface should feel calm, warm, and safe.

### Preferred Colors

Primary:

* Soft Blue
* Muted Teal

Success:

* Muted Green

Warning:

* Soft Amber

Error:

* Soft Coral

Background:

* Warm Off-White
* Light Gray

### Avoid

* Neon colors
* Pure white backgrounds
* Pure black backgrounds
* Highly saturated red
* Flashing color changes

---

## Contrast

Maintain WCAG AA compliance.

Avoid extremely harsh contrast combinations.

### Recommended

* Dark gray text
* Off-white background

### Avoid

* Pure black on pure white

---

## Whitespace

Use whitespace intentionally.

### Goals

* Reduce clutter
* Separate concepts
* Guide attention

### Avoid

Excessive whitespace that increases eye travel distance.

---

# 4. Typography Guidelines

## Font Selection

Use clean, readable sans-serif fonts.

### Approved Fonts

* Inter
* Arial
* Verdana
* Atkinson Hyperlegible
* OpenDyslexic (optional accessibility mode)

### Avoid

* Decorative fonts
* Handwriting fonts
* Script fonts

---

## Font Sizes

### Minimum Sizes

Body Text:

16px

Question Text:

20px+

Lesson Headings:

24px+

---

## Line Height

Use:

1.5–1.75

---

## Alignment

Always left aligned.

Avoid:

* Center aligned paragraphs
* Fully justified text

---

## Text Width

Limit line length to:

60–80 characters

---

# 5. Layout Guidelines

## Consistent Navigation

Navigation elements must never move.

### Fixed Locations

* Back button
* Home button
* Progress indicator
* Audio controls

---

## Screen Structure

Recommended Layout:

Header

Progress Indicator

Main Learning Area

Primary Action

Secondary Actions

---

## Single Primary Action

Each screen should contain one dominant action.

### Example

Continue

Avoid presenting multiple competing actions.

---

# 6. Interaction Design

## Touch Targets

### Minimum

48x48 pixels

### Preferred

56x56 pixels

---

## Spacing

Minimum spacing:

8px

Preferred:

12–16px

---

## Drag and Drop

Keep drag distances short.

Always provide a tap alternative.

### Example

Drag apple to basket

OR

Tap basket

---

## Feedback

Interactions should feel responsive.

### Examples

* Gentle scale animation
* Soft highlight
* Visual confirmation

Avoid excessive motion.

---

# 7. Motion Guidelines

## Motion Principles

Motion should communicate.

Never entertain.

### Allowed

* Fade transitions
* Small scale changes
* Progress animations

### Avoid

* Bounce animations
* Infinite loops
* Parallax effects
* Screen shaking

---

## Duration

Recommended:

150–300ms

---

# 8. Audio Guidelines

## User Control

Audio is always optional.

### Requirements

* Mute button
* Volume control
* Replay audio

---

## Voice Design

Voice should be:

* Calm
* Slow
* Clear
* Neutral

Avoid exaggerated excitement.

---

# 9. Language and Microcopy

## Literal Communication

Use direct instructions.

### Good

Count the apples.

Select the correct answer.

### Avoid

Let's conquer this challenge!

You're on fire!

---

## Button Labels

Always be explicit.

### Good

Submit Answer

Continue Lesson

Listen Again

### Avoid

Go

Next

Continue

without context.

---

## Sentence Length

Keep sentences short.

Target:

5–12 words

---

# 10. Error Prevention and Recovery

## Prevent Errors

Design interfaces that reduce mistakes.

### Techniques

* Clear instructions
* Large targets
* Visual examples
* Confirmation before destructive actions

---

## Error Messages

Use constructive language.

### Good

Let's try that again.

Count each apple one more time.

### Avoid

Wrong.

Error.

Invalid.

---

# 11. Learning-Specific Guidelines

## Visual Schedules

Every lesson should display:

Today's Lesson

1. Learn
2. Practice
3. Quiz
4. Complete

Users should always know what comes next.

---

## Transition Preparation

Before moving between sections:

Great work.

Next: Practice

---

## Completion Visibility

Always show:

Question 3 of 5

Lesson 2 of 8

---

## Resume Capability

If a learner exits unexpectedly:

Return them directly to the last activity.

Never restart automatically.

---

# 12. Personalization Guidelines

Each learner should have a sensory profile.

Example:

{
"audio": false,
"animations": "low",
"visual_support": "high",
"contrast": "medium"
}

The interface should adapt automatically.

---

# 13. AI Tutor Guidelines

## Communication Rules

AI must:

* Use short sentences
* Use literal language
* Explain one idea at a time
* Avoid abstract concepts
* Avoid sarcasm
* Avoid idioms

---

## Praise Guidelines

Focus on achievement.

### Good

You counted correctly.

You identified all the shapes.

### Avoid

You're a genius.

You're a superstar.

---

## Explanations

Always:

Show → Explain → Practice

Never provide long paragraphs.

---

# 14. Accessibility Requirements

Minimum WCAG AA compliance.

Support:

* Keyboard navigation
* Screen readers
* High contrast mode
* Dyslexia-friendly mode
* Reduced motion mode
* Responsive layouts

---

# 15. Design Review Checklist

Before releasing any feature verify:

* Predictable layout
* One concept per screen
* Visible progress
* Clear completion state
* Large touch targets
* Literal language
* No sensory overload
* Safe error recovery
* Audio controls available
* Motion controls available
* AI responses follow ALX guidelines

A feature that passes accessibility requirements but violates ALX principles should not be considered production ready.

