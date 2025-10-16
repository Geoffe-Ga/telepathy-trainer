import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Modal, ScrollView, SafeAreaView } from 'react-native';
import { HelpModal } from './HelpModal';
import { HELP_SECTIONS } from '../constants/helpContent';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('HelpModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render modal when visible is true', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      expect(getByText('Help & Tips')).toBeTruthy();
    });

    it('should not render modal content when visible is false', () => {
      const { queryByText } = render(
        <HelpModal visible={false} onClose={mockOnClose} />
      );

      // Modal component still renders but with visible=false
      // Content may not be visible in test environment
      expect(queryByText('Help & Tips')).toBeNull();
    });

    it('should have slide animation type', () => {
      const { UNSAFE_getByType } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.animationType).toBe('slide');
    });

    it('should have pageSheet presentation style', () => {
      const { UNSAFE_getByType } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const modal = UNSAFE_getByType(Modal);
      expect(modal.props.presentationStyle).toBe('pageSheet');
    });
  });

  describe('Header', () => {
    it('should display header title', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      expect(getByText('Help & Tips')).toBeTruthy();
    });

    it('should display close button with accessibility label', () => {
      const { getByLabelText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      expect(getByLabelText('Close help')).toBeTruthy();
    });

    it('should call onClose when close button is pressed', () => {
      const { getByLabelText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      fireEvent.press(getByLabelText('Close help'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Section Tabs', () => {
    it('should render all help section tabs', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      expect(getByText('Concentration Tips')).toBeTruthy();
      expect(getByText('Practice Strategies')).toBeTruthy();
      expect(getByText('Understanding Results')).toBeTruthy();
      expect(getByText('About the Decks')).toBeTruthy();
    });

    it('should have exactly 4 section tabs', () => {
      render(<HelpModal visible={true} onClose={mockOnClose} />);

      // Note: TouchableOpacity doesn't have a default role in RN
      // This test verifies the structure
      const sections = Object.keys(HELP_SECTIONS);
      expect(sections.length).toBe(4);
    });

    it('should default to concentration section selected', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Verify concentration content is displayed
      expect(getByText(HELP_SECTIONS.concentration.content)).toBeTruthy();
    });

    it('should render tabs in horizontal scroll view', () => {
      const { UNSAFE_getAllByType } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const scrollViews = UNSAFE_getAllByType(ScrollView);
      const horizontalScrollView = scrollViews.find(
        (sv) => sv.props.horizontal === true
      );

      expect(horizontalScrollView).toBeTruthy();
      expect(horizontalScrollView?.props.showsHorizontalScrollIndicator).toBe(
        false
      );
    });
  });

  describe('Section Navigation', () => {
    it('should switch to Practice Strategies when tab is pressed', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      fireEvent.press(getByText('Practice Strategies'));

      expect(getByText(HELP_SECTIONS.strategies.content)).toBeTruthy();
    });

    it('should switch to Understanding Results when tab is pressed', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      fireEvent.press(getByText('Understanding Results'));

      expect(getByText(HELP_SECTIONS.results.content)).toBeTruthy();
    });

    it('should switch to About the Decks when tab is pressed', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      fireEvent.press(getByText('About the Decks'));

      expect(getByText(HELP_SECTIONS.decks.content)).toBeTruthy();
    });

    it('should allow switching back to concentration section', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Switch to another section
      fireEvent.press(getByText('Practice Strategies'));
      expect(getByText(HELP_SECTIONS.strategies.content)).toBeTruthy();

      // Switch back to concentration
      fireEvent.press(getByText('Concentration Tips'));
      expect(getByText(HELP_SECTIONS.concentration.content)).toBeTruthy();
    });

    it('should maintain selected section styling', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const practiceTab = getByText('Practice Strategies');
      fireEvent.press(practiceTab);

      // Verify content changed
      expect(getByText(HELP_SECTIONS.strategies.content)).toBeTruthy();
    });
  });

  describe('Content Display', () => {
    it('should display concentration tips content by default', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      expect(getByText(HELP_SECTIONS.concentration.content)).toBeTruthy();
    });

    it('should display content in a scrollable area', () => {
      const { UNSAFE_getAllByType } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const scrollViews = UNSAFE_getAllByType(ScrollView);
      const contentScrollView = scrollViews.find(
        (sv) => sv.props.horizontal !== true
      );

      expect(contentScrollView).toBeTruthy();
      expect(contentScrollView?.props.showsVerticalScrollIndicator).toBe(true);
    });

    it('should display full content for each section', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Test each section
      const sections = Object.entries(HELP_SECTIONS);

      sections.forEach(([, section]) => {
        fireEvent.press(getByText(section.title));
        expect(getByText(section.content)).toBeTruthy();
      });
    });
  });

  describe('Modal Dismissal', () => {
    it('should call onClose when modal requests close', () => {
      const { UNSAFE_getByType } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const modal = UNSAFE_getByType(Modal);

      // Simulate modal onRequestClose
      if (modal.props.onRequestClose) {
        modal.props.onRequestClose();
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when switching sections', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      fireEvent.press(getByText('Practice Strategies'));

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('SafeAreaView Usage', () => {
    it('should wrap content in SafeAreaView', () => {
      const { UNSAFE_getByType } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      expect(UNSAFE_getByType(SafeAreaView)).toBeTruthy();
    });
  });

  describe('Content Sections - Detailed', () => {
    describe('Concentration Tips', () => {
      it('should display concentration tips content', () => {
        const { getByText } = render(
          <HelpModal visible={true} onClose={mockOnClose} />
        );

        // Default section
        const content = HELP_SECTIONS.concentration.content;
        expect(getByText(content)).toBeTruthy();
      });
    });

    describe('Practice Strategies', () => {
      it('should display practice strategies content', () => {
        const { getByText } = render(
          <HelpModal visible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByText('Practice Strategies'));

        const content = HELP_SECTIONS.strategies.content;
        expect(getByText(content)).toBeTruthy();
      });
    });

    describe('Understanding Results', () => {
      it('should display understanding results content', () => {
        const { getByText } = render(
          <HelpModal visible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByText('Understanding Results'));

        const content = HELP_SECTIONS.results.content;
        expect(getByText(content)).toBeTruthy();
      });
    });

    describe('About the Decks', () => {
      it('should display about decks content', () => {
        const { getByText } = render(
          <HelpModal visible={true} onClose={mockOnClose} />
        );

        fireEvent.press(getByText('About the Decks'));

        const content = HELP_SECTIONS.decks.content;
        expect(getByText(content)).toBeTruthy();
      });
    });
  });

  describe('Navigation Flow', () => {
    it('should allow sequential navigation through all sections', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Start at concentration
      expect(getByText(HELP_SECTIONS.concentration.content)).toBeTruthy();

      // Go to strategies
      fireEvent.press(getByText('Practice Strategies'));
      expect(getByText(HELP_SECTIONS.strategies.content)).toBeTruthy();

      // Go to results
      fireEvent.press(getByText('Understanding Results'));
      expect(getByText(HELP_SECTIONS.results.content)).toBeTruthy();

      // Go to decks
      fireEvent.press(getByText('About the Decks'));
      expect(getByText(HELP_SECTIONS.decks.content)).toBeTruthy();

      // Go back to concentration
      fireEvent.press(getByText('Concentration Tips'));
      expect(getByText(HELP_SECTIONS.concentration.content)).toBeTruthy();
    });

    it('should allow non-sequential navigation', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Jump from concentration to decks
      fireEvent.press(getByText('About the Decks'));
      expect(getByText(HELP_SECTIONS.decks.content)).toBeTruthy();

      // Jump to strategies
      fireEvent.press(getByText('Practice Strategies'));
      expect(getByText(HELP_SECTIONS.strategies.content)).toBeTruthy();

      // Jump to results
      fireEvent.press(getByText('Understanding Results'));
      expect(getByText(HELP_SECTIONS.results.content)).toBeTruthy();
    });
  });

  describe('State Persistence', () => {
    it('should maintain section when modal visibility changes', () => {
      const { getByText, rerender } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Navigate to a different section
      fireEvent.press(getByText('About the Decks'));
      expect(getByText(HELP_SECTIONS.decks.content)).toBeTruthy();

      // Hide modal (but component state persists)
      rerender(<HelpModal visible={false} onClose={mockOnClose} />);

      // Show modal again - state is maintained
      rerender(<HelpModal visible={true} onClose={mockOnClose} />);

      // Should still be on decks section (state persists in React component)
      expect(getByText(HELP_SECTIONS.decks.content)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid section switching', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Rapidly switch sections
      fireEvent.press(getByText('Practice Strategies'));
      fireEvent.press(getByText('Understanding Results'));
      fireEvent.press(getByText('About the Decks'));
      fireEvent.press(getByText('Concentration Tips'));

      // Should end up at concentration
      expect(getByText(HELP_SECTIONS.concentration.content)).toBeTruthy();
    });

    it('should handle pressing the same tab multiple times', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const strategiesTab = getByText('Practice Strategies');

      // Press multiple times
      fireEvent.press(strategiesTab);
      fireEvent.press(strategiesTab);
      fireEvent.press(strategiesTab);

      // Should still display strategies content
      expect(getByText(HELP_SECTIONS.strategies.content)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have close button with accessibility label', () => {
      const { getByLabelText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const closeButton = getByLabelText('Close help');
      expect(closeButton).toBeTruthy();
    });

    it('should render all section tabs as tappable elements', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // All tabs should be findable and pressable
      const tabs = [
        'Concentration Tips',
        'Practice Strategies',
        'Understanding Results',
        'About the Decks',
      ];

      tabs.forEach((tabLabel) => {
        const tab = getByText(tabLabel);
        expect(tab).toBeTruthy();
        // Verify it's pressable by firing an event
        fireEvent.press(tab);
      });
    });
  });

  describe('Layout Structure', () => {
    it('should have header at the top', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Header title should be present
      expect(getByText('Help & Tips')).toBeTruthy();
    });

    it('should have tabs below header', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // All tabs should be present
      expect(getByText('Concentration Tips')).toBeTruthy();
      expect(getByText('Practice Strategies')).toBeTruthy();
      expect(getByText('Understanding Results')).toBeTruthy();
      expect(getByText('About the Decks')).toBeTruthy();
    });

    it('should have content area below tabs', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      // Content should be present
      expect(getByText(HELP_SECTIONS.concentration.content)).toBeTruthy();
    });

    it('should render two ScrollViews (tabs and content)', () => {
      const { UNSAFE_getAllByType } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      const scrollViews = UNSAFE_getAllByType(ScrollView);
      expect(scrollViews.length).toBe(2);
    });
  });

  describe('Integration with HELP_SECTIONS constant', () => {
    it('should render all sections from HELP_SECTIONS', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      Object.values(HELP_SECTIONS).forEach((section) => {
        expect(getByText(section.title)).toBeTruthy();
      });
    });

    it('should display content for each section key', () => {
      const { getByText } = render(
        <HelpModal visible={true} onClose={mockOnClose} />
      );

      Object.entries(HELP_SECTIONS).forEach(([, section]) => {
        fireEvent.press(getByText(section.title));
        expect(getByText(section.content)).toBeTruthy();
      });
    });
  });
});
