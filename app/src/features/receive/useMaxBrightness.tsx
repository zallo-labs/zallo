import { useEffect } from 'react';
import * as Brightness from 'expo-brightness';

export const useMaxBrighness = () => {
  useEffect(() => {
    let pre: number | undefined = undefined;

    (async () => {
      let perm = await Brightness.getPermissionsAsync();
      if (!perm.granted && perm.canAskAgain)
        perm = await Brightness.requestPermissionsAsync();

      if (perm.granted) {
        pre = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1);
      }
    })();

    return () => {
      if (pre !== undefined) Brightness.setBrightnessAsync(pre);
    };
  }, []);
};
