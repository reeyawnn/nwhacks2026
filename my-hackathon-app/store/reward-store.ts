import { useSyncExternalStore } from 'react';

type Listener = () => void;

let rewardMinutes = 140;
const listeners = new Set<Listener>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

export const getRewardMinutes = () => rewardMinutes;

export const addRewardMinutes = (minutes: number) => {
  rewardMinutes = Math.max(0, rewardMinutes + minutes);
  emitChange();
};

export const setRewardMinutes = (minutes: number) => {
  rewardMinutes = Math.max(0, minutes);
  emitChange();
};

export const subscribeToRewardMinutes = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useRewardMinutes = () =>
  useSyncExternalStore(subscribeToRewardMinutes, getRewardMinutes, getRewardMinutes);
