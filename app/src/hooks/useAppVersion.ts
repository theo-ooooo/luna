import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import Constants from 'expo-constants';

interface PlatformVersionInfo {
  latest_version: string;
  min_version: string;
  store_url?: string;
}

interface VersionResponse {
  ios: PlatformVersionInfo;
  android: PlatformVersionInfo;
}

type UpdateState = 'none' | 'optional' | 'force';

export interface AppVersionResult {
  updateState: UpdateState;
  storeUrl: string | null;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
  }
  return 0;
}

export function useAppVersion(): AppVersionResult {
  const [updateState, setUpdateState] = useState<UpdateState>('none');
  const [storeUrl, setStoreUrl] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) return;

    function checkVersion() {
      fetch(`${apiUrl}/api/version`)
        .then(res => res.json())
        .then((data: { data?: VersionResponse }) => {
          const info = data.data;
          if (!info) return;
          const platform = Platform.OS === 'ios' ? info.ios : info.android;
          setStoreUrl(platform.store_url ?? null);
          if (compareVersions(currentVersion, platform.min_version) < 0) {
            setUpdateState('force');
          } else if (compareVersions(currentVersion, platform.latest_version) < 0) {
            setUpdateState('optional');
          } else {
            setUpdateState('none');
          }
        })
        .catch(() => {});
    }

    checkVersion();

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current !== 'active' && next === 'active') {
        checkVersion();
      }
      appState.current = next;
    });

    return () => subscription.remove();
  }, []);

  return { updateState, storeUrl };
}
