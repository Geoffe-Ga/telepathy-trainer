import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConcentrationPrompt } from './ConcentrationPrompt';

describe('ConcentrationPrompt', () => {
  const mockOnReady = jest.fn();
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the modal title', () => {
      const { getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      expect(getByText('Prepare Your Mind')).toBeTruthy();
    });

    it('should render concentration tips content', () => {
      const { getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      expect(getByText(/Welcome to Telepathy Trainer/)).toBeTruthy();
      expect(getByText(/Based on research by Mitch Horowitz/)).toBeTruthy();
    });

    it('should render the ready button', () => {
      const { getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      expect(getByText('I am Ready')).toBeTruthy();
    });

    it('should render the checkbox with label', () => {
      const { getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      expect(getByText("Don't show this again")).toBeTruthy();
    });
  });

  describe('Checkbox Interaction', () => {
    it('should not be checked initially', () => {
      const { getByRole } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const checkbox = getByRole('checkbox');
      expect(checkbox.props.accessibilityState.checked).toBe(false);
    });

    it('should toggle checkbox when pressed', () => {
      const { getByRole, getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const checkboxContainer = getByText("Don't show this again").parent;

      fireEvent.press(checkboxContainer);

      const checkbox = getByRole('checkbox');
      expect(checkbox.props.accessibilityState.checked).toBe(true);
    });

    it('should toggle checkbox multiple times', () => {
      const { getByRole, getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const checkboxContainer = getByText("Don't show this again").parent;

      fireEvent.press(checkboxContainer);
      let checkbox = getByRole('checkbox');
      expect(checkbox.props.accessibilityState.checked).toBe(true);

      fireEvent.press(checkboxContainer);
      checkbox = getByRole('checkbox');
      expect(checkbox.props.accessibilityState.checked).toBe(false);

      fireEvent.press(checkboxContainer);
      checkbox = getByRole('checkbox');
      expect(checkbox.props.accessibilityState.checked).toBe(true);
    });
  });

  describe('Ready Button Interaction', () => {
    it('should call both callbacks when ready button is pressed', () => {
      const { getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByText('I am Ready'));

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnReady).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss with false when checkbox is not checked', () => {
      const { getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      fireEvent.press(getByText('I am Ready'));

      expect(mockOnDismiss).toHaveBeenCalledWith(false);
    });

    it('should call onDismiss with true when checkbox is checked', () => {
      const { getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const checkboxContainer = getByText("Don't show this again").parent;
      fireEvent.press(checkboxContainer);

      fireEvent.press(getByText('I am Ready'));

      expect(mockOnDismiss).toHaveBeenCalledWith(true);
    });

    it('should call onReady after onDismiss', () => {
      const callOrder: string[] = [];
      const trackingOnDismiss = jest.fn(() => callOrder.push('dismiss'));
      const trackingOnReady = jest.fn(() => callOrder.push('ready'));

      const { getByText } = render(
        <ConcentrationPrompt
          onReady={trackingOnReady}
          onDismiss={trackingOnDismiss}
        />
      );

      fireEvent.press(getByText('I am Ready'));

      expect(callOrder).toEqual(['dismiss', 'ready']);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label for ready button', () => {
      const { getByLabelText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      expect(getByLabelText('I am ready to begin')).toBeTruthy();
    });

    it('should have button role for ready button', () => {
      const { getByRole } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('should have checkbox role with proper state', () => {
      const { getByRole } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const checkbox = getByRole('checkbox');
      expect(checkbox).toBeTruthy();
      expect(checkbox.props.accessibilityState).toEqual({ checked: false });
    });

    it('should update checkbox accessibility state when toggled', () => {
      const { getByRole, getByText } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const checkboxContainer = getByText("Don't show this again").parent;
      fireEvent.press(checkboxContainer);

      const checkbox = getByRole('checkbox');
      expect(checkbox.props.accessibilityState).toEqual({ checked: true });
    });
  });

  describe('State Management', () => {
    it('should preserve checkbox state during multiple interactions', () => {
      const { getByText, getByRole } = render(
        <ConcentrationPrompt onReady={mockOnReady} onDismiss={mockOnDismiss} />
      );

      const checkboxContainer = getByText("Don't show this again").parent;

      // Check it
      fireEvent.press(checkboxContainer);
      expect(getByRole('checkbox').props.accessibilityState.checked).toBe(true);

      // Uncheck it
      fireEvent.press(checkboxContainer);
      expect(getByRole('checkbox').props.accessibilityState.checked).toBe(
        false
      );

      // Check it again
      fireEvent.press(checkboxContainer);
      expect(getByRole('checkbox').props.accessibilityState.checked).toBe(true);

      // Press ready - should send true
      fireEvent.press(getByText('I am Ready'));
      expect(mockOnDismiss).toHaveBeenCalledWith(true);
    });
  });
});
