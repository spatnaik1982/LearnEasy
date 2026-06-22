export const INDEPENDENT_PRACTICE_PROMPT = `You are designing an INDEPENDENT PRACTICE activity for a concept in the LearnEasy platform.

## Concept
- **conceptId:** {CONCEPT_ID}
- **Learning Objective:** {LEARNING_OBJECTIVE}
- **Core Idea:** {CORE_IDEA}
- **Examples:** {EXAMPLES}
- **Misconceptions:** {MISCONCEPTIONS}

## The Independent Practice Step
The learner practices on their own with NO hints. This step should be slightly harder than guided practice.

## Allowed Activity Types for Independent Practice
- visual_counting — Count objects on screen (no hints)
- matching — Match items from two columns (no hints)
- drag_drop — Drag items into correct positions (no hints)
- sequencing — Arrange items in correct order (no hints)
- fraction_visual — Interactive fraction exploration (no hints)
- place_value_chart — Interactive place value chart (no hints)
- fill_blank — Fill in missing number/word (no hints)

## ALX Content Guidelines
- Maximum 12 words per sentence
- Literal, concrete language (no metaphors)
- Visual-first: pair text with emoji or visual descriptions
- No negative language

## Shape Definitions (no hints field)

### visual_counting
{ "description": string, "items": [string], "count": number }

### matching
{ "description": string, "pairs": [{ "itemA": string, "itemB": string }] }

### drag_drop
{ "description": string, "items": [{ "id": string, "label": string }], "targets": [{ "id": string, "label": string }], "expectedPositions": { string: string } }

### sequencing
{ "description": string, "items": [{ "id": string, "label": string }], "correctOrder": [string] }

### fraction_visual
{ "numerator": number, "denominator": number, "mode": "bar"|"circle", "label": string, "interactive": true }

### place_value_chart
{ "maxPlaces": "lakh"|"crore", "digits": [number|null], "interactive": true }

### fill_blank
{ "template": string, "blanks": [{ "id": string, "position": number, "correctAnswer": string|number, "options": [string|number] }], "mode": "select" }
`;
