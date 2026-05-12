import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { TabNavigator } from './src/navigation/TabNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { useAuthStore } from './src/store/authStore';
import { toastConfig } from './src/components/ui/LunaToast';
import { useNotificationSetup } from './src/hooks/useNotificationSetup';
import { setupAndroidChannel } from './src/services/notifications';

function AuthenticatedRoot() {
  useNotificationSetup();
  return <TabNavigator />;
}

function RootNavigator() {
  const token = useAuthStore(s => s.token);
  return token ? <AuthenticatedRoot /> : <AuthNavigator />;
}

export default function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } }),
  );

  useEffect(() => {
    setupAndroidChannel().catch((e) => console.error('[Luna] Android channel setup failed:', e));
  }, []);

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
