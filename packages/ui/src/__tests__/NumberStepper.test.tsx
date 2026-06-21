import { render, screen, fireEvent } from '@testing-library/react';
import { NumberStepper } from '../NumberStepper';

describe('NumberStepper', () => {
  it('renders value and label', () => {
    render(<NumberStepper value={5} min={1} max={10} step={1} label="Count" onChange={() => {}} />);
    expect(screen.getByTestId('stepper-value')).toHaveTextContent('5');
    expect(screen.getByTestId('stepper-label')).toHaveTextContent('Count');
  });

  it('increments when plus clicked', () => {
    const onChange = jest.fn();
    render(<NumberStepper value={5} min={1} max={10} step={1} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('stepper-increase'));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('decrements when minus clicked', () => {
    const onChange = jest.fn();
    render(<NumberStepper value={5} min={1} max={10} step={1} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('stepper-decrease'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disables minus at min', () => {
    render(<NumberStepper value={1} min={1} max={10} step={1} onChange={() => {}} />);
    expect(screen.getByTestId('stepper-decrease')).toBeDisabled();
  });

  it('disables plus at max', () => {
    render(<NumberStepper value={10} min={1} max={10} step={1} onChange={() => {}} />);
    expect(screen.getByTestId('stepper-increase')).toBeDisabled();
  });

  it('wraps from max to min when wrap=true', () => {
    const onChange = jest.fn();
    render(<NumberStepper value={10} min={1} max={10} step={1} wrap={true} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('stepper-increase'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('wraps from min to max when wrap=true', () => {
    const onChange = jest.fn();
    render(<NumberStepper value={1} min={1} max={10} step={1} wrap={true} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('stepper-decrease'));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('steps by given step value', () => {
    const onChange = jest.fn();
    render(<NumberStepper value={0} min={0} max={20} step={5} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('stepper-increase'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('buttons have 56x56px dimensions', () => {
    render(<NumberStepper value={5} min={1} max={10} step={1} onChange={() => {}} />);
    const decrease = screen.getByTestId('stepper-decrease');
    const increase = screen.getByTestId('stepper-increase');
    expect(decrease).toHaveStyle('width: 56px');
    expect(decrease).toHaveStyle('height: 56px');
    expect(increase).toHaveStyle('width: 56px');
    expect(increase).toHaveStyle('height: 56px');
  });
});
