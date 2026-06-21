import { render, screen, fireEvent } from '@testing-library/react';
import { ClockWidget } from '../ClockWidget';

describe('ClockWidget', () => {
  it('renders clock face with numbers', () => {
    render(<ClockWidget hour={3} minute={45} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('shows digital time when showDigital is true', () => {
    render(<ClockWidget hour={3} minute={45} showDigital />);
    expect(screen.getByText('3:45')).toBeInTheDocument();
  });

  it('has accessible role img with time description', () => {
    render(<ClockWidget hour={10} minute={30} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', expect.stringContaining('10'));
  });

  it('renders NumberStepper controls for keyboard accessibility', () => {
    render(<ClockWidget hour={3} minute={45} interactive />);
    expect(screen.getByText('Hour')).toBeInTheDocument();
    expect(screen.getByText('Minute')).toBeInTheDocument();
    expect(screen.getAllByTestId('stepper-value').length).toBe(2);
  });

  it('fires onTimeChange when stepper changes', () => {
    const onChange = jest.fn();
    render(<ClockWidget hour={3} minute={45} interactive onTimeChange={onChange} />);
    const increaseBtns = screen.getAllByTestId('stepper-increase');
    fireEvent.click(increaseBtns[0]);
    expect(onChange).toHaveBeenCalledWith(4, 45);
  });

  it('pads single-digit minutes with zero', () => {
    render(<ClockWidget hour={2} minute={5} showDigital />);
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('shows target time label when targetTime provided', () => {
    render(<ClockWidget hour={2} minute={0} targetTime={{ hour: 5, minute: 30 }} />);
    expect(screen.getByText('Set the clock to 5:30')).toBeInTheDocument();
  });

  it('does not render steppers in read mode', () => {
    render(<ClockWidget hour={3} minute={0} interactive mode="read" />);
    expect(screen.queryByText('Hour')).not.toBeInTheDocument();
  });
});
