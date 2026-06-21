import { render, screen, fireEvent } from '@testing-library/react';
import { PlaceValueChart } from '../PlaceValueChart';

const noop = () => {};

function renderPvc(overrides: Record<string, unknown> = {}) {
  return render(
    <PlaceValueChart
      maxPlaces="crore"
      placedDigits={{}}
      draggableDigits={[1, 2]}
      selectedDigit={null}
      activeColumn={null}
      onSelectDigit={noop}
      onPlaceDigit={noop}
      onRemoveDigit={noop}
      {...overrides}
    />,
  );
}

describe('PlaceValueChart', () => {
  it('renders all 8 columns in crore mode', () => {
    renderPvc();
    expect(screen.getByText('Cr')).toBeInTheDocument();
    expect(screen.getByText('TL')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('TTh')).toBeInTheDocument();
    expect(screen.getByText('Th')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('renders with role grid', () => {
    renderPvc();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays digits when placed', () => {
    renderPvc({ placedDigits: { 7: 8 } });
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('has accessible column labels', () => {
    renderPvc();
    expect(screen.getByLabelText('Crores column')).toBeInTheDocument();
    expect(screen.getByLabelText('Ones column')).toBeInTheDocument();
  });

  it('renders lakh mode with 6 columns', () => {
    renderPvc({ maxPlaces: 'lakh' });
    expect(screen.queryByText('Cr')).not.toBeInTheDocument();
    expect(screen.queryByText('TL')).not.toBeInTheDocument();
  });

  it('renders draggable digit buttons with aria labels', () => {
    renderPvc({ draggableDigits: [3, 7] });
    expect(screen.getByLabelText('Digit 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 7')).toBeInTheDocument();
  });

  it('calls onRemoveDigit when clicking a placed digit with no digit selected', () => {
    const onRemove = jest.fn();
    renderPvc({ placedDigits: { 3: 5 }, onRemoveDigit: onRemove });
    const cells = document.querySelectorAll('[role="gridcell"]');
    fireEvent.click(cells[3]);
    expect(onRemove).toHaveBeenCalledWith(3);
  });

  it('renders all column cells as droppable targets', () => {
    renderPvc();
    for (const label of ['Crores column', 'Ones column']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('shows result: green border for correct, coral for incorrect', () => {
    const { container } = renderPvc({
      placedDigits: { 7: 5 },
      targetNumber: 5,
      showResult: true,
    });
    const cells = container.querySelectorAll('[role="gridcell"]');
    expect(cells[7].className).toContain('muted-green');
  });

  it('calls onSelectDigit when a digit is clicked', () => {
    const onSelectDigit = jest.fn();
    renderPvc({ draggableDigits: [3, 7], onSelectDigit });
    fireEvent.click(screen.getByLabelText('Digit 3'));
    expect(onSelectDigit).toHaveBeenCalledWith(3);
  });

  it('calls onPlaceDigit with digit and column when column clicked after selecting', () => {
    const onPlaceDigit = jest.fn();
    renderPvc({ selectedDigit: 5, onPlaceDigit });
    const cells = document.querySelectorAll('[role="gridcell"]');
    fireEvent.click(cells[2]);
    expect(onPlaceDigit).toHaveBeenCalledWith(5, 2);
  });

  it('calls onPlaceDigit (not onRemoveDigit) when clicking filled column with digit selected', () => {
    const onPlaceDigit = jest.fn();
    const onRemoveDigit = jest.fn();
    renderPvc({
      placedDigits: { 3: 5 },
      selectedDigit: 2,
      onPlaceDigit,
      onRemoveDigit,
    });
    const cells = document.querySelectorAll('[role="gridcell"]');
    fireEvent.click(cells[3]);
    expect(onPlaceDigit).toHaveBeenCalledWith(2, 3);
    expect(onRemoveDigit).not.toHaveBeenCalled();
  });
});
