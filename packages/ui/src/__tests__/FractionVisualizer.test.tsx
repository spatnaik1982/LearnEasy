import { render, screen } from '@testing-library/react';
import { FractionVisualizer } from '../FractionVisualizer';

describe('FractionVisualizer', () => {
  it('renders a fraction bar with correct parts', () => {
    const { container } = render(
      <FractionVisualizer numerator={3} denominator={4} mode="bar" />,
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('renders a fraction circle', () => {
    const { container } = render(
      <FractionVisualizer numerator={1} denominator={3} mode="circle" />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<FractionVisualizer numerator={3} denominator={4} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('aria-label', expect.stringContaining('3 out of 4'));
  });

  it('shows label when showLabel is true', () => {
    render(<FractionVisualizer numerator={1} denominator={2} showLabel />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('renders compare mode side by side', () => {
    const { container } = render(
      <FractionVisualizer
        numerator={1}
        denominator={2}
        compare={{ numerator: 2, denominator: 4 }}
      />,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(3);
  });

  it('shows error when denominator exceeds max', () => {
    render(<FractionVisualizer numerator={1} denominator={20} maxDenominator={12} />);
    expect(screen.getByText('Too many parts to show clearly')).toBeInTheDocument();
  });

  it('renders improper fraction as whole plus remainder', () => {
    const { container } = render(<FractionVisualizer numerator={5} denominator={3} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
  });

  it('renders circle mode in compare view', () => {
    const { container } = render(
      <FractionVisualizer
        numerator={1}
        denominator={3}
        mode="circle"
        compare={{ numerator: 2, denominator: 6 }}
      />,
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(3);
  });

  it('renders custom label', () => {
    render(<FractionVisualizer numerator={3} denominator={4} label="three-fourths" showLabel />);
    expect(screen.getByText('three-fourths')).toBeInTheDocument();
  });
});
