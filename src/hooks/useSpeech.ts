"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  getTtsSegment,
  putTtsSegment,
  type TtsCacheEntry,
} from "@/src/lib/ttsCache";
import type { TtsSegment } from "@/src/utils/ttsSegments";

export interface SpeechProgress {
  done: number;
  total: number;
}

const emptySubscribe = () => () => {};

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SpeechProgress>({
    done: 0,
    total: 0,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionRef = useRef(0);
  const playResolveRef = useRef<(() => void) | null>(null);
  const prefetchRef = useRef<Map<string, Promise<Blob | null>>>(new Map());
  const browserSpeechSupported = useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false
  );

  const cleanupAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // El audio puede no tener metadata cargada.
      }
      audio.removeAttribute("src");
      audio.load();
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    playResolveRef.current?.();
    playResolveRef.current = null;
    prefetchRef.current.clear();
    cleanupAudio();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setProgress({ done: 0, total: 0 });
  }, [cleanupAudio]);

  const speakWithBrowser = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const fetchSegmentBlob = useCallback(
    async (segment: TtsSegment, signal: AbortSignal): Promise<Blob> => {
      const cached = await getTtsSegment(segment.id);
      if (cached) return cached.blob;

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: segment.text }),
        signal,
      });

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const info = (await response.json()) as {
            error?: string;
            status?: number;
            detail?: string;
          };
          detail = [
            info.error,
            info.status ? `(${info.status})` : "",
            info.detail,
          ]
            .filter(Boolean)
            .join(" ");
        } catch {
          // La respuesta no era JSON; se conserva el status HTTP.
        }
        throw new Error(detail);
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error("Respuesta de audio vacía");
      }

      const now = Date.now();
      const entry: TtsCacheEntry = {
        id: segment.id,
        text: segment.text,
        blob,
        bytes: blob.size,
        createdAt: now,
        lastUsedAt: now,
      };
      void putTtsSegment(entry);

      return blob;
    },
    []
  );

  const prefetch = useCallback(
    (segment: TtsSegment, signal: AbortSignal) => {
      const existing = prefetchRef.current.get(segment.id);
      if (existing) return existing;

      const promise = fetchSegmentBlob(segment, signal).catch(
        (prefetchError) => {
          if (!signal.aborted) {
            console.warn(
              "[TTS] No se pudo precargar un segmento:",
              prefetchError
            );
          }
          return null;
        }
      );

      prefetchRef.current.set(segment.id, promise);
      return promise;
    },
    [fetchSegmentBlob]
  );

  const getBlob = useCallback(
    async (segment: TtsSegment, signal: AbortSignal): Promise<Blob> => {
      const pending = prefetchRef.current.get(segment.id);
      if (pending) {
        const blob = await pending;
        if (blob) return blob;
        prefetchRef.current.delete(segment.id);
      }

      return fetchSegmentBlob(segment, signal);
    },
    [fetchSegmentBlob]
  );

  const playBlob = useCallback((blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        resolve();
        return;
      }

      const url = URL.createObjectURL(blob);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = url;

      let audio = audioRef.current;
      if (!audio) {
        audio = new Audio();
        audio.preload = "auto";
        audioRef.current = audio;
      }

      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.src = url;

      playResolveRef.current = () => {
        audio.onended = null;
        audio.onerror = null;
        resolve();
      };

      audio.onended = () => {
        playResolveRef.current = null;
        resolve();
      };

      audio.onerror = () => {
        playResolveRef.current = null;
        reject(new Error("No se pudo reproducir el audio"));
      };

      audio.play().catch((playError) => {
        playResolveRef.current = null;
        reject(playError);
      });
    });
  }, []);

  const speakSegments = useCallback(
    async (segments: TtsSegment[], fallbackText?: string) => {
      if (!segments.length || typeof window === "undefined") return;

      stop();
      setError(null);

      const session = ++sessionRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      prefetchRef.current = new Map();
      setIsSpeaking(true);
      setProgress({ done: 0, total: segments.length });

      try {
        for (let index = 0; index < segments.length; index++) {
          if (session !== sessionRef.current) return;

          const segment = segments[index];
          const nextSegment = segments[index + 1];
          if (nextSegment) {
            void prefetch(nextSegment, controller.signal);
          }

          const blob = await getBlob(segment, controller.signal);
          if (session !== sessionRef.current) return;

          await playBlob(blob);
          if (session !== sessionRef.current) return;

          setProgress({ done: index + 1, total: segments.length });
        }

        setIsSpeaking(false);
        setProgress({ done: 0, total: 0 });
        cleanupAudio();
        abortRef.current = null;
      } catch (err) {
        if (session !== sessionRef.current || controller.signal.aborted) return;

        const message = err instanceof Error ? err.message : String(err);
        console.error(
          `[TTS] Falló un segmento (${message}). Usando voz del navegador.`
        );
        setError(message);
        cleanupAudio();
        abortRef.current = null;

        const text = (
          fallbackText?.trim() || segments.map((segment) => segment.text).join(" ")
        ).trim();
        speakWithBrowser(text);
      }
    },
    [
      stop,
      prefetch,
      getBlob,
      playBlob,
      cleanupAudio,
      speakWithBrowser,
    ]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const clearError = useCallback(() => setError(null), []);

  return {
    speakSegments,
    stop,
    isSpeaking,
    progress,
    supported: browserSpeechSupported,
    error,
    clearError,
  };
}
