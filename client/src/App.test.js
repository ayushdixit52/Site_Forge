import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the SiteForge dashboard', () => {
  render(<App />);
  expect(screen.getByText(/your websites/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create new website/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
});
