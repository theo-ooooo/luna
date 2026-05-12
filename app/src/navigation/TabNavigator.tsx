import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../theme/tokens';
import { Icon, IconName } from '../components/ui/Icon';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { RecordScreen } from '../screens/RecordScreen';
import { AIScreen } from '../screens/AIScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type TabParamList = {
  Home: undefined;
  Insights: undefined;
  Record: undefined;
  AI: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabItem {
  id: keyof TabParamList;
  label: string;
  icon: IconName;
  primary?: boolean;
}

const TABS: TabItem[] = [
  { id: 'Home',     label: '홈',      icon: 'home' },
  { id: 'Insights', label: '인사이트', icon: 'trend' },
  { id: 'Record',   label: '기록',  icon: 'plus', primary: true },
  { id: 'AI',       label: 'AI',    icon: 'spark' },
  { id: 'Settings', label: '설정',  icon: 'user' },
];

function LunaTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={[styles.tabBar, Shadow.lift]}>
        {TABS.map((tab, index) => {
          const active = state.index === index;
          const onPress = () => navigation.navigate(tab.id);

          if (tab.primary) {
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.primaryBtn}
                onPress={onPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <Icon name={tab.icon} size={22} strokeWidth={2.4} color={Colors.bgInk} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
            >
              <Icon
                name={tab.icon}
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                color={active ? Colors.coral : 'rgba(242,238,232,0.5)'}
              />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <LunaTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Record" component={RecordScreen} />
      <Tab.Screen name="AI" component={AIScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute', left: 16, right: 16, bottom: 8,
    backgroundColor: 'transparent',
  },
  tabBar: {
    backgroundColor: Colors.bgInk,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10, fontWeight: '600',
    color: 'rgba(242,238,232,0.5)', letterSpacing: 0.2,
  },
  tabLabelActive: { color: Colors.coral },
  primaryBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.coral,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 4,
  },
});
