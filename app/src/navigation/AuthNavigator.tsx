import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmailScreen } from '../screens/auth/EmailScreen';
import { PasswordScreen } from '../screens/auth/PasswordScreen';
import { SignupStep1Screen } from '../screens/auth/SignupStep1Screen';
import { SignupStep2Screen } from '../screens/auth/SignupStep2Screen';
import { SignupStep3Screen } from '../screens/auth/SignupStep3Screen';

export type AuthStackParamList = {
  Email: undefined;
  Password: { email: string };
  SignupStep1: { email: string };
  SignupStep2: { email: string; nickname: string; password: string };
  SignupStep3: { email: string; nickname: string; password: string; lastPeriodDate: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Email" component={EmailScreen} />
      <Stack.Screen name="Password" component={PasswordScreen} />
      <Stack.Screen name="SignupStep1" component={SignupStep1Screen} />
      <Stack.Screen name="SignupStep2" component={SignupStep2Screen} />
      <Stack.Screen name="SignupStep3" component={SignupStep3Screen} />
    </Stack.Navigator>
  );
}
