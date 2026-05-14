import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const currentVersion = Constants.expoConfig?.version ?? '0.0.0';
    const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';

    fetch(`${apiUrl}/api/version`)
      .then(res => res.json())
      .then((data: { data?: VersionInfo }) => {
        const info = data.data;
        if (!info) return;
        if (compareVersions(currentVersion, info.min_version) < 0) {
          setUpdateState('force');
        } else if (compareVersions(currentVersion, info.latest_version) < 0) {
          setUpdateState('optional');
        }
      })
      .catch(() => {});
  }, []);

  return updateState;
}
