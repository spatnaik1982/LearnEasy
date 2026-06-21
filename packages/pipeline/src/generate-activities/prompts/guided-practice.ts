export const GUIDED_PRACTICE_PROMPT = `You are designing a GUIDED PRACTICE activity for a concept in the LearnEasy platform.

## Concept
- **conceptId:** {CONCEPT_ID}
- **Learning Objective:** {LEARNING_OBJECTIVE}
- **Core Idea:** {CORE_IDEA}
- **Examples:** {EXAMPLES}
- **Misconceptions:** {MISCONCEPTIONS}

## The Guided Practice Step
The learner tries with hints and support. Provide graduated hints to help them succeed.

## Hint Structure
Provide exactly 5 hints as a JSON array of strings:
1. Explicit answer ("The correct answer is X. Let me show you...")
2. Visual/attention cue ("Look at the [specific part] carefully.")
3. Encouraging nudge ("You're close! Check your [step].")
4. Process hint ("Try [specific strategy].")
5. "" (empty string — signals no more hints)

## Allowed Activity Types for Guided Practice
- visual_counting — Count objects on screen with hints
- matching — Match items from two columns
- drag_drop — Drag items into correct positions
- sequencing — Arrange items in correct order
- story_question — Answer questions about a scenario
- fraction_visual — Interactive fraction exploration
- place_value_chart — Interactive place value chart
- fill_blank — Fill in missing number/word

## ALX Content Guidelines
- Maximum 12 words per sentence
- Literal, concrete language (no metaphors)
- Visual-first: pair text with emoji or visual descriptions
- No negative language
- Use encouraging phrases: "You're close!", "Great try!"

## Shape Definitions

### visual_counting
{ "description": string, "items": [string], "count": number, "hints": [string, string, string, string, ""] }

### matching
{ "description": string, "pairs": [{ "itemA": string, "itemB": string }], "hints": [string, string, string, string, ""] }

### drag_drop
{ "description": string, "items": [{ "id": string, "label": string }], "targets": [{ "id": string, "label": string }], "expectedPositions": { string: string }, "hints": [string, string, string, string, ""] }

### sequencing
{ "description": string, "items": [{ "id": string, "label": string, "emoji"?: string }], "correctOrder": [string], "hints": [string, string, string, string, ""] }

### story_question
{ "scenario": string, "questions": [{ "question": string, "options": [string], "correctIndex": number }], "hints": [string, string, string, string, ""] }

### fraction_visual
{ "numerator": number, "denominator": number, "mode": "bar"|"circle", "label": string, "interactive": true, "hints": [string, string, string, string, ""] }

### place_value_chart
{ "maxPlaces": "lakh"|"crore", "digits": [number|null], "interactive": true, "draggableDigits": [number], "hints": [string, string, string, string, ""] }

### fill_blank
{ "template": string, "blanks": [{ "id": string, "position": number, "correctAnswer": string|number, "options": [string|number] }], "mode": "select", "hints": [string, string, string, string, ""] }
`;
