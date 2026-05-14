import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingWelcomeScreen } from '../screens/onboarding/OnboardingWelcomeScreen';
import { OnboardingDateScreen } from '../screens/onboarding/OnboardingDateScreen';
import { OnboardingCycleLenScreen } from '../screens/onboarding/OnboardingCycleLenScreen';
import { OnboardingNicknameScreen } from '../screens/onboarding/OnboardingNicknameScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  Date: undefined;
  CycleLen: { lastPeriodDate: string | null };
  Nickname: { cycleLen: number; lastPeriodDate: string | null };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Welcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="Date" component={OnboardingDateScreen} />
      <Stack.Screen name="CycleLen" component={OnboardingCycleLenScreen} />
      <Stack.Screen name="Nickname" component={OnboardingNicknameScreen} />
    </Stack.Navigator>
  );
}
