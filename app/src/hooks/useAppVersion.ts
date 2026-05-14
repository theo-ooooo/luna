import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Constants from 'expo-constants';

interface VersionInfo {
  latest_version: string;
  min_version: string;
}

type UpdateState = 'none' | 'optional' | 'force';

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
  }
  return 0;
}

export function useAppVersion() {
  const [updateState, setUpdateState] = useState<UpdateState>('none');
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) return;

    function checkVersion() {
      fetch(`${apiUrl}/api/version`)
        .then(res => res.json())
        .then((data: { data?: VersionInfo }) => {
          const info = data.data;
          if (!info) return;
          if (compareVersions(currentVersion, info.min_version) < 0) {
            setUpdateState('force');
          } else if (compareVersions(currentVersion, info.latest_version) < 0) {
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

  return updateState;
}
