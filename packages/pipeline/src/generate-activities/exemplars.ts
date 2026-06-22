export interface Exemplar {
  type: string;
  step: string;
  conceptDescription: string;
  content: Record<string, unknown>;
}

export const EXEMPLARS: Exemplar[] = [
  {
    type: 'visual_counting',
    step: 'observe',
    conceptDescription: 'counting_1_10 — Count objects from 1 to 10',
    content: {
      description: 'Observe apples 🍎🍎🍎',
      items: ['🍎'],
      count: 3,
      text: 'There are three apples.',
    },
  },
  {
    type: 'visual_counting',
    step: 'independent_practice',
    conceptDescription: 'counting_1_10 — Count objects from 1 to 10',
    content: {
      description: 'Count the flowers',
      items: ['🌸'],
      count: 7,
    },
  },
  {
    type: 'visual_counting',
    step: 'positive_completion',
    conceptDescription: 'any concept — encouragement',
    content: {
      description: 'Great work! You counted correctly.',
    },
  },
  {
    type: 'matching',
    step: 'guided_practice',
    conceptDescription: 'basic_shapes — Match shapes to names',
    content: {
      description: 'Match each shape to its name.',
      pairs: [
        { itemA: '⬤', itemB: 'Circle' },
        { itemA: '⬛', itemB: 'Square' },
        { itemA: '△', itemB: 'Triangle' },
      ],
    },
  },
  {
    type: 'drag_drop',
    step: 'guided_practice',
    conceptDescription: 'place_value_understanding — Place digits in correct columns',
    content: {
      description: 'Drag digits to their place values.',
      items: [
        { id: 'd1', label: '5' },
        { id: 'd2', label: '9' },
        { id: 'd3', label: '6' },
        { id: 'd4', label: '4' },
      ],
      targets: [
        { id: 't-thousands', label: 'Thousands' },
        { id: 't-hundreds', label: 'Hundreds' },
        { id: 't-tens', label: 'Tens' },
        { id: 't-ones', label: 'Ones' },
      ],
      expectedPositions: {
        d1: 't-thousands',
        d2: 't-hundreds',
        d3: 't-tens',
        d4: 't-ones',
      },
    },
  },
  {
    type: 'sequencing',
    step: 'guided_practice',
    conceptDescription: 'ascending_order — Arrange numbers from smallest to largest',
    content: {
      description: 'Arrange these numbers in ascending order.',
      items: [
        { id: 'n1', label: '12' },
        { id: 'n2', label: '5' },
        { id: 'n3', label: '8' },
        { id: 'n4', label: '3' },
      ],
      correctOrder: ['n4', 'n2', 'n3', 'n1'],
    },
  },
  {
    type: 'multiple_choice',
    step: 'mastery_check',
    conceptDescription: 'addition_1_10 — Add two numbers with sum up to 10',
    content: {
      questions: [
        {
          question: '2 + 1 = ?',
          options: ['2', '3', '4', '5'],
          correctIndex: 1,
        },
        {
          question: '3 + 2 = ?',
          options: ['4', '5', '6', '7'],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    type: 'story_question',
    step: 'observe',
    conceptDescription: 'addition_1_10 — Adding groups in a story',
    content: {
      scenario: 'Riya has 3 red balloons and 2 blue balloons. 🎈',
      questions: [
        {
          question: 'How many balloons does Riya have in total?',
          options: ['3', '4', '5', '6'],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    type: 'fraction_visual',
    step: 'observe',
    conceptDescription: 'fractions_intro — Show parts of a whole',
    content: {
      numerator: 1,
      denominator: 2,
      mode: 'circle',
      label: 'One half of a circle 🟠',
      interactive: false,
    },
  },
  {
    type: 'place_value_chart',
    step: 'observe',
    conceptDescription: 'reading_numbers_1000_9999 — Show place values of digits',
    content: {
      maxPlaces: 'lakh',
      digits: [2, 9, 1, 8],
      interactive: false,
    },
  },
  {
    type: 'grid_area',
    step: 'observe',
    conceptDescription: 'area_intro — Count squares on a grid',
    content: {
      rows: 4,
      cols: 3,
      mode: 'area',
      interactive: false,
    },
  },
  {
    type: 'chart_reader',
    step: 'observe',
    conceptDescription: 'bar_graphs — Read values from a bar chart',
    content: {
      type: 'bar',
      data: [
        { label: 'Jan', value: 3 },
        { label: 'Feb', value: 5 },
        { label: 'Mar', value: 2 },
      ],
      title: 'Rainfall by Month (cm)',
      interactive: false,
    },
  },
  {
    type: 'clock_time',
    step: 'observe',
    conceptDescription: 'clock_reading — Read time on a clock',
    content: {
      hour: 3,
      minute: 0,
      mode: 'read',
      showDigital: true,
      interactive: false,
    },
  },
  {
    type: 'clock_time',
    step: 'guided_practice',
    conceptDescription: 'clock_reading — Set time on a clock',
    content: {
      hour: 10,
      minute: 15,
      mode: 'set',
      showDigital: true,
      targetTime: { hour: 10, minute: 15 },
      interactive: true,
    },
  },
  {
    type: 'measurement_scale',
    step: 'observe',
    conceptDescription: 'reading_ruler — Read length on a ruler',
    content: {
      type: 'ruler',
      min: 0,
      max: 10,
      step: 1,
      unit: 'cm',
      value: 7,
      interactive: false,
    },
  },
  {
    type: 'fill_blank',
    step: 'guided_practice',
    conceptDescription: 'equation_solving — Fill in missing number',
    content: {
      template: '10 - ___ = 4',
      blanks: [
        { id: 'result', position: 0, correctAnswer: '6', options: ['4', '5', '6', '7'] },
      ],
      mode: 'select',
    },
  },
  {
    type: 'fill_blank',
    step: 'independent_practice',
    conceptDescription: 'addition_basics — Fill in missing number',
    content: {
      template: '5 + ___ = 9',
      blanks: [
        { id: 'ans', position: 0, correctAnswer: '4', options: ['3', '4', '5', '6'] },
      ],
      mode: 'select',
    },
  },
];
