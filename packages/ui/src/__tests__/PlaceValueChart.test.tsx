import { render, screen, fireEvent } from '@testing-library/react';
import { PlaceValueChart } from '../PlaceValueChart';

describe('PlaceValueChart', () => {
  it('renders all 8 columns in crore mode', () => {
    render(
      <PlaceValueChart
        maxPlaces="crore"
        placedDigits={{}}
        draggableDigits={[1, 2]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={jest.fn()}
      />
    );
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
    render(
      <PlaceValueChart
        placedDigits={{}}
        draggableDigits={[1, 2]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={jest.fn()}
      />
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays digits when placed', () => {
    render(
      <PlaceValueChart
        placedDigits={{ 7: 8 }}
        draggableDigits={[1, 2]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={jest.fn()}
      />
    );
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('has accessible column labels', () => {
    render(
      <PlaceValueChart
        placedDigits={{}}
        draggableDigits={[1, 2]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={jest.fn()}
      />
    );
    expect(screen.getByLabelText('Crores column')).toBeInTheDocument();
    expect(screen.getByLabelText('Ones column')).toBeInTheDocument();
  });

  it('renders lakh mode with 6 columns', () => {
    render(
      <PlaceValueChart
        maxPlaces="lakh"
        placedDigits={{}}
        draggableDigits={[1, 2]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={jest.fn()}
      />
    );
    expect(screen.queryByText('Cr')).not.toBeInTheDocument();
    expect(screen.queryByText('TL')).not.toBeInTheDocument();
  });

  it('highlights active column with background', () => {
    const { container } = render(
      <PlaceValueChart
        placedDigits={{}}
        draggableDigits={[1, 2]}
        selectedDigit={1}
        activeColumn={3}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={jest.fn()}
      />
    );
    const cells = container.querySelectorAll('[role="gridcell"]');
    expect(cells[3].className).toContain('5D87B1');
  });

  it('calls onRemoveDigit when clicking a placed digit', () => {
    const onRemove = jest.fn();
    render(
      <PlaceValueChart
        placedDigits={{ 3: 5 }}
        draggableDigits={[1, 2]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={onRemove}
      />
    );
    const cells = document.querySelectorAll('[role="gridcell"]');
    fireEvent.click(cells[3]);
    expect(onRemove).toHaveBeenCalledWith(3);
  });

  it('calls onPlaceDigit when clicking empty active column with selected digit', () => {
    const onPlace = jest.fn();
    render(
      <PlaceValueChart
        placedDigits={{}}
        draggableDigits={[1, 2]}
        selectedDigit={5}
        activeColumn={2}
        onSelectDigit={jest.fn()}
        onPlaceDigit={onPlace}
        onRemoveDigit={jest.fn()}
      />
    );
    const cells = document.querySelectorAll('[role="gridcell"]');
    fireEvent.click(cells[2]);
    expect(onPlace).toHaveBeenCalledWith(2);
  });

  it('shows result: green border for correct, coral for incorrect', () => {
    const { container } = render(
      <PlaceValueChart
        placedDigits={{ 7: 5 }}
        draggableDigits={[1, 2]}
        selectedDigit={null}
        activeColumn={null}
        onSelectDigit={jest.fn()}
        onPlaceDigit={jest.fn()}
        onRemoveDigit={jest.fn()}
        targetNumber={5}
        showResult
      />
    );
    const cells = container.querySelectorAll('[role="gridcell"]');
    expect(cells[7].className).toContain('8FB996');
  });
});
