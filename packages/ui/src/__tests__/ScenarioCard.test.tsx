import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioCard } from '../ScenarioCard';

const mockSpeak = jest.fn();
const mockCancel = jest.fn();

beforeEach(() => {
  Object.defineProperty(window, 'speechSynthesis', {
    value: { speak: mockSpeak, cancel: mockCancel },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ScenarioCard', () => {
  it('renders scenario text', () => {
    render(<ScenarioCard text="Once upon a time" />);
    expect(screen.getByText('Once upon a time')).toBeInTheDocument();
  });

  it('renders visual emoji when provided', () => {
    render(<ScenarioCard text="Story" visual="📖" />);
    expect(screen.getByTestId('scenario-visual')).toHaveTextContent('📖');
  });

  it('is expanded by default', () => {
    render(<ScenarioCard text="Story" />);
    expect(screen.getByTestId('scenario-content')).not.toHaveClass('hidden');
  });

  it('collapses when Hide Story clicked', () => {
    render(<ScenarioCard text="Story" />);
    fireEvent.click(screen.getByText('Hide Story'));
    expect(screen.getByTestId('scenario-content')).toHaveClass('hidden');
  });

  it('expands when Show Story clicked after collapse', () => {
    render(<ScenarioCard text="Story" />);
    fireEvent.click(screen.getByText('Hide Story'));
    fireEvent.click(screen.getByText('Show Story'));
    expect(screen.getByTestId('scenario-content')).not.toHaveClass('hidden');
  });

  it('shows Read Aloud button when readAloud=true', () => {
    render(<ScenarioCard text="Story" readAloud />);
    expect(screen.getByTestId('read-aloud-button')).toBeInTheDocument();
  });

  it('hides Read Aloud button when readAloud=false', () => {
    render(<ScenarioCard text="Story" readAloud={false} />);
    expect(screen.queryByTestId('read-aloud-button')).not.toBeInTheDocument();
  });

  it('does not show collapse toggle when collapsible=false', () => {
    render(<ScenarioCard text="Story" collapsible={false} />);
    expect(screen.queryByTestId('collapse-toggle')).not.toBeInTheDocument();
  });
});
