import { render, screen, fireEvent } from '@testing-library/react';
import { RealWorldTask } from '../RealWorldTask';

describe('RealWorldTask', () => {
  const defaultProps = {
    scenario: 'You see a bird in the park.',
    taskDescription: 'Write one sentence about what the bird is doing.',
    response: '',
    onResponseChange: jest.fn(),
  };

  it('renders scenario and task description', () => {
    render(<RealWorldTask {...defaultProps} />);
    expect(screen.getByText('You see a bird in the park.')).toBeInTheDocument();
    expect(
      screen.getByText('Write one sentence about what the bird is doing.'),
    ).toBeInTheDocument();
  });

  it('renders text input for response', () => {
    render(<RealWorldTask {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type what you observed...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('rows', '1');
  });

  it('calls onResponseChange when text changes', () => {
    const onResponseChange = jest.fn();
    render(<RealWorldTask {...defaultProps} onResponseChange={onResponseChange} />);
    const input = screen.getByPlaceholderText('Type what you observed...');
    fireEvent.change(input, { target: { value: 'The bird is flying.' } });
    expect(onResponseChange).toHaveBeenCalledWith('The bird is flying.');
  });

  it('shows hint only when hint prop is non-empty', () => {
    const { rerender } = render(<RealWorldTask {...defaultProps} />);
    expect(screen.queryByText('Show Hint')).not.toBeInTheDocument();

    rerender(<RealWorldTask {...defaultProps} hint="" />);
    expect(screen.queryByText('Show Hint')).not.toBeInTheDocument();

    rerender(<RealWorldTask {...defaultProps} hint="Look at the bird's wings" />);
    expect(screen.getByText('Show Hint')).toBeInTheDocument();
  });

  it('has no party emoji', () => {
    render(<RealWorldTask {...defaultProps} />);
    expect(screen.queryByText('🎉')).not.toBeInTheDocument();
    expect(screen.queryByText('⭐')).not.toBeInTheDocument();
    expect(screen.queryByText('🌟')).not.toBeInTheDocument();
  });
});
