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
        const mockProps = {
            users: [],
            loading: false,
            error: null,
            onRefresh: jest.fn(),
        };
        render(<List {...mockProps} />);
        expect(screen.getByText('No users found')).toBeInTheDocument();
    });
});
