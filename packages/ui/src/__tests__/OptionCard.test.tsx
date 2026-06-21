import { render, screen, fireEvent } from '@testing-library/react';
import { OptionCard } from '../OptionCard';

describe('OptionCard', () => {
  it('renders letter badge and label', () => {
    render(<OptionCard letter="A" label="Apple" isSelected={false} onClick={() => {}} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('renders emoji when provided', () => {
    render(<OptionCard letter="A" label="Apple" emoji="🍎" isSelected={false} onClick={() => {}} />);
    expect(screen.getByTestId('option-emoji')).toHaveTextContent('🍎');
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<OptionCard letter="A" label="Apple" isSelected={false} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('option-card'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows selected state with blue border', () => {
    render(<OptionCard letter="A" label="Apple" isSelected={true} onClick={() => {}} />);
    const card = screen.getByTestId('option-card');
    expect(card).toHaveStyle('borderColor: #5D87B1');
  });

  it('shows correct state when showResult and isCorrect', () => {
    render(<OptionCard letter="A" label="Apple" isSelected={false} isCorrect={true} showResult={true} onClick={() => {}} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByTestId('option-card')).toHaveStyle('borderColor: #8FB996');
  });

  it('shows incorrect state when showResult and not isCorrect', () => {
    render(<OptionCard letter="A" label="Apple" isSelected={false} isCorrect={false} showResult={true} onClick={() => {}} />);
    expect(screen.getByText('✗')).toBeInTheDocument();
    expect(screen.getByTestId('option-card')).toHaveStyle('borderColor: #E5989B');
  });

  it('has aria-selected attribute', () => {
    render(<OptionCard letter="A" label="Apple" isSelected={true} onClick={() => {}} />);
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('has minimum 56px height', () => {
    render(<OptionCard letter="A" label="Apple" isSelected={false} onClick={() => {}} />);
    expect(screen.getByTestId('option-card')).toHaveStyle('minHeight: 56px');
  });
});
