import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  NotoSansKR_100Thin,
  NotoSansKR_200ExtraLight,
  NotoSansKR_300Light,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
  NotoSansKR_800ExtraBold,
  NotoSansKR_900Black,
} from '@expo-google-fonts/noto-sans-kr';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { useAuthStore } from './src/store/authStore';
import { toastConfig } from './src/components/ui/LunaToast';
import { useNotificationSetup } from './src/hooks/useNotificationSetup';
import { setupAndroidChannel } from './src/services/notifications';

function AuthenticatedRoot() {
  useNotificationSetup();
  const onboardingDone = useAuthStore(s => s.onboardingDone);
  return onboardingDone ? <TabNavigator /> : <OnboardingNavigator />;
}

function RootNavigator() {
  const token = useAuthStore(s => s.token);
  return token ? <AuthenticatedRoot /> : <AuthNavigator />;
}

export default function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } }),
  );
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_100Thin,
    NotoSansKR_200ExtraLight,
    NotoSansKR_300Light,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
    NotoSansKR_800ExtraBold,
    NotoSansKR_900Black,
  });

  useEffect(() => {
    setupAndroidChannel().catch((e) => console.error('[Luna] Android channel setup failed:', e));
  }, []);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1 }}><ActivityIndicator /></View>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
        <Toast position="bottom" bottomOffset={100} config={toastConfig} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
