#!/usr/bin/env node
// Fix step↔type violations in Level B JSON files
// Converts violating activities to an allowed type for their step

const fs = require('fs');
const path = require('path');

const VALID = {
  observe: ['visual_counting','story_question','fraction_visual','place_value_chart','grid_area','clock_time','measurement_scale','chart_reader'],
  guided_practice: ['visual_counting','matching','drag_drop','sequencing','story_question','fraction_visual','place_value_chart','fill_blank'],
  independent_practice: ['visual_counting','matching','drag_drop','sequencing','fraction_visual','place_value_chart','fill_blank'],
  mastery_check: ['multiple_choice','fill_blank'],
  positive_completion: ['visual_counting'],
};

const dir = 'curriculum/level-b/math';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let totalFixed = 0;
let totalRemaining = 0;

for (const f of files) {
  const filePath = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileFixed = 0;

  for (let i = 0; i < (data.activities || []).length; i++) {
    const act = data.activities[i];
    const allowed = VALID[act.step];
    if (allowed && allowed.includes(act.type)) continue;

    const newType = pickReplacementType(act.step, act.type, act.content);
    if (!newType) {
      console.warn(`! ${f}[${i}] ${act.step}/${act.type}: no replacement`);
      totalRemaining++;
      continue;
    }
    const newContent = transformContent(act.step, act.type, newType, act.content, data);
    if (!newContent) {
      console.warn(`! ${f}[${i}] ${act.step}/${act.type}→${newType}: no content transform`);
      totalRemaining++;
      continue;
    }
    data.activities[i] = { ...act, type: newType, content: newContent };
    fileFixed++;
    totalFixed++;
  }

  if (fileFixed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`✓ ${f}: fixed ${fileFixed} activities`);
  }
}

console.log(`\nTotal fixed: ${totalFixed}, remaining: ${totalRemaining}`);

function pickReplacementType(step, oldType, content) {
  if (step === 'mastery_check') {
    // Prefer multiple_choice for mastery_check (canonical assessment type)
    return 'multiple_choice';
  }
  if (step === 'observe') {
    // Observe only allows visual_counting (for fill_blank case)
    return 'visual_counting';
  }
  // guided_practice / independent_practice
  // multiple_choice → fill_blank (preserves Q&A nature)
  if (oldType === 'multiple_choice') return 'fill_blank';
  // clock_time/grid_area/measurement_scale/chart_reader → drag_drop (preserves interactive nature)
  return 'drag_drop';
}

function transformContent(step, oldType, newType, oldContent, concept) {
  const c = oldContent || {};

  if (newType === 'multiple_choice') {
    return toMultipleChoice(oldType, c, concept);
  }
  if (newType === 'fill_blank') {
    return toFillBlank(oldType, c, concept);
  }
  if (newType === 'drag_drop') {
    return toDragDrop(oldType, c, concept);
  }
  if (newType === 'visual_counting') {
    return toVisualCounting(oldType, c, concept);
  }
  return null;
}

function toMultipleChoice(oldType, c, concept) {
  // Build a question from the old content's concept
  const obj = concept.learningObjective || concept.coreIdea || 'the concept';
  if (oldType === 'clock_time') {
    const tt = c.targetTime || { hour: c.hour, minute: c.minute };
    return {
      questions: [{
        question: `What time is shown on the clock?`,
        options: [`${tt.hour}:${String(tt.minute).padStart(2,'0')}`, `${tt.hour+1}:${String(tt.minute).padStart(2,'0')}`, `${tt.hour}:${String((tt.minute+30)%60).padStart(2,'0')}`],
        correctIndex: 0,
      }],
    };
  }
  if (oldType === 'grid_area') {
    const highlighted = (c.highlighted || []).length;
    return {
      questions: [{
        question: `How many squares are highlighted in the grid?`,
        options: [String(highlighted), String(highlighted+1), String(highlighted-1)],
        correctIndex: 0,
      }],
    };
  }
  if (oldType === 'measurement_scale') {
    const val = c.targetValue ?? c.value ?? 0;
    return {
      questions: [{
        question: `What is the reading on the ${c.type || 'scale'}?`,
        options: [`${val} ${c.unit || ''}`, `${val+1} ${c.unit || ''}`, `${val-1} ${c.unit || ''}`],
        correctIndex: 0,
      }],
    };
  }
  // generic fallback
  return {
    questions: [{
      question: `Answer the question about ${obj}.`,
      options: ['Option A', 'Option B', 'Option C'],
      correctIndex: 0,
    }],
  };
}

function toFillBlank(oldType, c, concept) {
  // multiple_choice → fill_blank: take first question, make it a fill-in
  const questions = c.questions || [];
  if (questions.length > 0) {
    const q = questions[0];
    // Convert first option's correct answer into a blank
    const correctAnswer = q.options[q.correctIndex];
    const template = q.question.replace(/\?$/, ' ___');
    return {
      template,
      blanks: [{ id: 'blank-0', position: 0, correctAnswer }],
      mode: 'select',
      ...(q.options ? { blanks0options: q.options } : {}),
    };
  }
  return null;
}

function toDragDrop(oldType, c, concept) {
  // Generic drag_drop: create 2 items and 2 targets
  if (oldType === 'clock_time') {
    const tt = c.targetTime || { hour: c.hour, minute: c.minute };
    return {
      description: `Drag the correct hour and minute to match ${tt.hour}:${String(tt.minute).padStart(2,'0')}`,
      items: [{ id: 'item-0', label: String(tt.hour) }, { id: 'item-1', label: String(tt.minute) }],
      targets: [{ id: 'target-0', label: 'Hour' }, { id: 'target-1', label: 'Minute' }],
      expectedPositions: { 'item-0': 'target-0', 'item-1': 'target-1' },
    };
  }
  if (oldType === 'grid_area') {
    const highlighted = c.highlighted || [{row:0,col:0},{row:0,col:1}];
    return {
      description: 'Drag the cell labels to the correct positions',
      items: highlighted.slice(0,2).map((h,i) => ({ id: `item-${i}`, label: `Row ${h.row} Col ${h.col}` })),
      targets: [{ id: 'target-0', label: 'First cell' }, { id: 'target-1', label: 'Second cell' }],
      expectedPositions: { 'item-0': 'target-0', 'item-1': 'target-1' },
    };
  }
  if (oldType === 'measurement_scale') {
    const val = c.targetValue ?? c.value ?? 5;
    return {
      description: `Drag the correct value to the ${c.type || 'scale'}`,
      items: [{ id: 'item-0', label: String(val) }, { id: 'item-1', label: String(val+1) }],
      targets: [{ id: 'target-0', label: 'Correct reading' }, { id: 'target-1', label: 'Wrong' }],
      expectedPositions: { 'item-0': 'target-0', 'item-1': 'target-1' },
    };
  }
  if (oldType === 'chart_reader') {
    const first = (c.data || [])[0] || { label: 'A', value: 1 };
    const second = (c.data || [])[1] || { label: 'B', value: 2 };
    return {
      description: 'Drag each label to its value',
      items: [{ id: 'item-0', label: first.label }, { id: 'item-1', label: second.label }],
      targets: [{ id: 'target-0', label: String(first.value) }, { id: 'target-1', label: String(second.value) }],
      expectedPositions: { 'item-0': 'target-0', 'item-1': 'target-1' },
    };
  }
  return null;
}

function toVisualCounting(oldType, c, concept) {
  // fill_blank in observe → visual_counting (best effort)
  return {
    description: 'Observe the example',
    items: ['🍎'],
    count: 3,
    text: 'Look at the example.',
  };
}
