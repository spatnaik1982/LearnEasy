export const MASTERY_CHECK_PROMPT = `You are designing a MASTERY CHECK for a concept in the LearnEasy platform.

## Concept
- **conceptId:** {CONCEPT_ID}
- **Learning Objective:** {LEARNING_OBJECTIVE}
- **Core Idea:** {CORE_IDEA}
- **Examples:** {EXAMPLES}
- **Misconceptions:** {MISCONCEPTIONS}

## The Mastery Check Step
The learner answers 2-3 multiple-choice questions to verify understanding.

## Allowed Activity Type
- multiple_choice

## ALX Content Guidelines
- Maximum 12 words per question
- Literal, concrete language (no metaphors)
- No negative language
- Use encouraging framing

## Shape Definition

### multiple_choice
{ "questions": [{ "question": string, "options": [string], "correctIndex": number }] }

Each question has exactly 4 options. correctIndex is 0-based (0-3).
Create 2-3 questions that test different aspects of the concept.
`;
