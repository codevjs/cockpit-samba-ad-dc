import React from 'react';
import { render, screen } from '@testing-library/react';
import List from './list';

// Mock the cockpit object
jest.mock('cockpit', () => ({
    script: jest.fn(() => ({
        done: jest.fn().mockReturnThis(),
        catch: jest.fn(),
    })),
}), { virtual: true });

describe('List component', () => {
    it('should render without crashing', () => {
        render(<List />);
        expect(screen.getByLabelText('search users')).toBeInTheDocument();
    });
});
