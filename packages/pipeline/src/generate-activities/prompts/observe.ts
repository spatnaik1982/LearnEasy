export const OBSERVE_PROMPT = `You are designing an OBSERVE activity for a concept in the LearnEasy platform.

## Concept
- **conceptId:** {CONCEPT_ID}
- **Learning Objective:** {LEARNING_OBJECTIVE}
- **Core Idea:** {CORE_IDEA}
- **Examples:** {EXAMPLES}
- **Misconceptions:** {MISCONCEPTIONS}

## The Observe Step
The observe step is the first activity. The tutor demonstrates the concept. Show, don't just tell.
- Use visual activities that demonstrate the concept clearly
- Set interactive: false for observe steps
- Use clear, concrete descriptions

## Allowed Activity Types for Observe
- visual_counting — Count objects shown on screen (best for numbers, quantities)
- story_question — Present a short scenario with a question (best for word problems)
- fraction_visual — Show fractions as bars or circles
- place_value_chart — Show digits in place value columns
- grid_area — Count squares on a grid
- clock_time — Show a clock face with a time
- measurement_scale — Show a ruler, thermometer, or cylinder reading
- chart_reader — Show a bar chart or pictograph

## ALX Content Guidelines
- Maximum 12 words per sentence
- Literal, concrete language (no metaphors)
- Visual-first: pair text with emoji or visual descriptions
- No negative language

## Shape Definitions

### visual_counting (read-only observe variant)
{ "description": string, "items": [string], "count": number, "text": string }

### story_question
{ "scenario": string, "questions": [{ "question": string, "options": [string], "correctIndex": number }] }

### fraction_visual
{ "numerator": number, "denominator": number, "mode": "bar"|"circle", "label": string, "interactive": false }

### place_value_chart
{ "maxPlaces": "lakh"|"crore", "digits": [number|null], "interactive": false }

### grid_area
{ "rows": number, "cols": number, "mode": "area"|"perimeter", "interactive": false }

### clock_time
{ "hour": number, "minute": number, "mode": "read", "showDigital": bool, "interactive": false }

### measurement_scale
{ "type": "ruler"|"thermometer"|"cylinder", "min": number, "max": number, "step": number, "unit": string, "value": number, "interactive": false }

### chart_reader
{ "type": "bar"|"pictograph", "data": [{ "label": string, "value": number }], "title": string, "interactive": false }
`;
