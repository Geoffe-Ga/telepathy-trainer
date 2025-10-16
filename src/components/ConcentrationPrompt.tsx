import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { CONCENTRATION_TIPS } from '../constants/helpContent';
import { theme } from '../constants/theme';

interface ConcentrationPromptProps {
  onReady: () => void;
  onDismiss: (dontShowAgain: boolean) => void;
}

export function ConcentrationPrompt({
  onReady,
  onDismiss,
}: ConcentrationPromptProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleReady = () => {
    onDismiss(dontShowAgain);
    onReady();
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Text style={styles.title}>Prepare Your Mind</Text>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.content}>{CONCENTRATION_TIPS}</Text>
        </ScrollView>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setDontShowAgain(!dontShowAgain)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: dontShowAgain }}
        >
          <View
            style={[styles.checkbox, dontShowAgain && styles.checkboxChecked]}
          >
            {dontShowAgain && <Text style={styles.checkmark}></Text>}
          </View>
          <Text style={styles.checkboxLabel}>Don&apos;t show this again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleReady}
          accessibilityLabel="I am ready to begin"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>I am Ready</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.md,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: theme.spacing.md,
  },
  checkboxLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  checkmark: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background + 'CC', // 80% opacity
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '80%',
    maxWidth: 500,
    padding: theme.spacing.xl,
    width: '100%',
    ...theme.shadows.md,
  },
  scrollView: {
    marginBottom: theme.spacing.md,
    maxHeight: 400,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
