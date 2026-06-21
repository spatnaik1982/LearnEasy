export const POSITIVE_COMPLETION_PROMPT = `You are designing a POSITIVE COMPLETION activity for a concept in the LearnEasy platform.

## Concept
- **conceptId:** {CONCEPT_ID}
- **Learning Objective:** {LEARNING_OBJECTIVE}
- **Core Idea:** {CORE_IDEA}

## The Positive Completion Step
Celebrate the learner's achievement! This is an encouraging message with no task.

## Allowed Activity Type
- visual_counting

## ALX Content Guidelines
- Maximum 12 words per sentence
- Literal, concrete language
- Use encouraging phrases
- Pair with emoji

## Shape Definition

### visual_counting (positive completion variant)
{ "description": string, "count"?: number, "emoji"?: string, "items"?: [string], "text"?: string }

Example: { "description": "Great job learning to count!", "count": 1, "emoji": "🎉", "items": ["You did it!"], "text": "Keep practicing!" }
`;
