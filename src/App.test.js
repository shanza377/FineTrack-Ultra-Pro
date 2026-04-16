import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FinTrack Pro app', () => {
  render(<App />);
  const titleElement = screen.getByText(/FinTrack Pro/i);
  expect(titleElement).toBeInTheDocument();
});
