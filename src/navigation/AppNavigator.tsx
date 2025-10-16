import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuessScreen } from '../screens/GuessScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { HelpModal } from '../screens/HelpModal';
import { theme } from '../constants/theme';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 20,
          },
        }}
      >
        <Tab.Screen
          name="Guess"
          component={GuessScreen}
          options={{
            title: 'Practice',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bulb" size={size} color={color} />
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setShowHelp(true)}
                style={styles.helpButton}
                accessibilityLabel="Open help"
              >
                <Ionicons
                  name="help-circle"
                  size={28}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

const styles = {
  helpButton: {
    marginRight: 16,
  },
};
