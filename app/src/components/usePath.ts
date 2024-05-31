import { useSegments } from 'expo-router';

export function usePath() {
  return `/${useSegments().join('/')}`;
}
