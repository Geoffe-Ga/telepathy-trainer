import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { HELP_SECTIONS } from '../constants/helpContent';
import { theme } from '../constants/theme';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HelpModal({ visible, onClose }: HelpModalProps) {
  const [selectedSection, setSelectedSection] =
    useState<keyof typeof HELP_SECTIONS>('concentration');

  const sections = Object.entries(HELP_SECTIONS);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Help & Tips</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close help">
            <Text style={styles.closeButton}></Text>
          </TouchableOpacity>
        </View>

        {/* Section tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabContainer}
        >
          {sections.map(([key, section]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.tab,
                selectedSection === key && styles.tabSelected,
              ]}
              onPress={() =>
                setSelectedSection(key as keyof typeof HELP_SECTIONS)
              }
            >
              <Text
                style={[
                  styles.tabText,
                  selectedSection === key && styles.tabTextSelected,
                ]}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView
          style={styles.contentScrollView}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            <Text style={styles.contentText}>
              {HELP_SECTIONS[selectedSection].content}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    ...theme.typography.h2,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.sm,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  contentScrollView: {
    flex: 1,
  },
  contentText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  tab: {
    backgroundColor: theme.colors.surfaceLight,
    borderColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  tabContainer: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  tabScrollView: {
    backgroundColor: theme.colors.surface,
    maxHeight: 60,
  },
  tabSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.secondary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: theme.colors.text,
  },
});
