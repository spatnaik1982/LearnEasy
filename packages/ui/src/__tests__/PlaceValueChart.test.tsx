import { render, screen } from '@testing-library/react';
import { PlaceValueChart } from '../PlaceValueChart';

describe('PlaceValueChart', () => {
  it('renders all 8 columns in crore mode', () => {
    render(<PlaceValueChart maxPlaces="crore" />);
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
    render(<PlaceValueChart />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays digits when provided', () => {
    render(<PlaceValueChart digits={[1, 2, 3, 4, 5, 6, 7, 8]} />);
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('has accessible column labels', () => {
    render(<PlaceValueChart />);
    expect(screen.getByLabelText('Crores column')).toBeInTheDocument();
    expect(screen.getByLabelText('Ones column')).toBeInTheDocument();
  });

  it('renders lakh mode with 6 columns', () => {
    render(<PlaceValueChart maxPlaces="lakh" />);
    expect(screen.queryByText('Cr')).not.toBeInTheDocument();
    expect(screen.queryByText('TL')).not.toBeInTheDocument();
  });
});
