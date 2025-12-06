// hooks/useNotifications.ts

import { useState, useEffect, useRef } from "react";

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(() =>
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "default"
    );

  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);
  const coinAudioRef = useRef<HTMLAudioElement | null>(null);
  const resetAudioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar audios
  useEffect(() => {
    if (typeof window === "undefined") return;

    startAudioRef.current = new Audio("/sounds/start.mp3");
    endAudioRef.current = new Audio("/sounds/end.mp3");
    coinAudioRef.current = new Audio("/sounds/coins.mp3");
    resetAudioRef.current = new Audio("/sounds/reset.mp3");

    if (startAudioRef.current) startAudioRef.current.volume = 0.7;
    if (endAudioRef.current) endAudioRef.current.volume = 0.8;
    if (coinAudioRef.current) coinAudioRef.current.volume = 0.7;
    if (resetAudioRef.current) resetAudioRef.current.volume = 0.8;
  }, []);

  const ensureNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window))
      return false;
    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      return true;
    }
    if (Notification.permission === "denied") {
      setNotificationPermission("denied");
      return false;
    }
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    return perm === "granted";
  };

  const showNotification = (title: string, body?: string) => {
    if (!("Notification" in window)) return;
    new Notification(title, { body });
  };

  const playSound = (type: "start" | "end" | "coin" | "reset") => {
    const audioMap = {
      start: startAudioRef,
      end: endAudioRef,
      coin: coinAudioRef,
      reset: resetAudioRef,
    };

    const audioRef = audioMap[type];
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const vibrate = (pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate?.(pattern);
      } catch {}
    }
  };

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
    return result;
  };

  return {
    notificationPermission,
    ensureNotificationPermission,
    showNotification,
    playSound,
    vibrate,
    requestPermission,
  };
}
