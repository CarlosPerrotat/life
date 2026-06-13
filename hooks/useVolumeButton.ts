import { useEffect, useRef } from 'react';

type VolumeButtonCallback = (type: 'up' | 'down') => void;

export function useVolumeButton(onPress: VolumeButtonCallback) {
  const callbackRef = useRef(onPress);
  callbackRef.current = onPress;

  useEffect(() => {
    let manager: any = null;
    let subscription: any = null;

    async function setup() {
      try {
        const VolumeManager = require('react-native-volume-manager').VolumeManager;
        if (!VolumeManager) return;

        // Prevent default volume UI on Android
        await VolumeManager.showNativeVolumeUI({ enabled: false });

        subscription = VolumeManager.addVolumeListener((result: any) => {
          // Fired on every volume change; we infer direction by comparing
          if (result.volume !== undefined) {
            // Store previous volume to detect direction
            if (
              previousVolumeRef.current !== null &&
              result.volume > previousVolumeRef.current
            ) {
              callbackRef.current('up');
            } else if (
              previousVolumeRef.current !== null &&
              result.volume < previousVolumeRef.current
            ) {
              callbackRef.current('down');
            }
            previousVolumeRef.current = result.volume;
          }
        });

        manager = VolumeManager;
      } catch (_e) {
        // react-native-volume-manager not available (Expo Go), silently ignore
      }
    }

    setup();

    return () => {
      subscription?.remove?.();
      manager?.showNativeVolumeUI?.({ enabled: true });
    };
  }, []);

  // Keep track of volume level between renders
  const previousVolumeRef = useRef<number | null>(null);
}
