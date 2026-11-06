import { TTS_CACHE_VERSION } from "@/src/lib/ttsCache";
import type { Task } from "@/src/types/task.types";

export const MAX_TTS_TASKS = 20;

export interface TtsSegment {
  id: string;
  text: string;
}

export interface BuildTtsSegmentsInput {
  userId?: string | null;
  tasks: Task[];
  isToday: boolean;
  goalText: string;
  maxTasks?: number;
}

function normalize(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return clean;
  return /[.!?¿¡]$/.test(clean) ? clean : `${clean}.`;
}

function legacyHash(value: string): string {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;

  for (let index = 0; index < value.length; index++) {
    const charCode = value.charCodeAt(index);
    hash1 = Math.imul(hash1 ^ charCode, 2654435761);
    hash2 = Math.imul(hash2 ^ charCode, 1597334677);
  }

  hash1 =
    Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^
    Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 =
    Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^
    Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);

  return `${(hash2 >>> 0).toString(16).padStart(8, "0")}${(hash1 >>> 0)
    .toString(16)
    .padStart(8, "0")}`;
}

async function hashText(value: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    try {
      const data = new TextEncoder().encode(value);
      const digest = await window.crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      return legacyHash(value);
    }
  }

  return legacyHash(value);
}

export async function hashTtsText(
  text: string,
  userId?: string | null
): Promise<string> {
  return hashText(`${TTS_CACHE_VERSION}|${userId ?? "anon"}|${text}`);
}

async function buildSegment(
  text: string,
  userId?: string | null
): Promise<TtsSegment> {
  const normalized = normalize(text);
  return {
    id: await hashTtsText(normalized, userId),
    text: normalized,
  };
}

export async function buildTtsSegments({
  userId,
  tasks,
  isToday,
  goalText,
  maxTasks = MAX_TTS_TASKS,
}: BuildTtsSegmentsInput): Promise<TtsSegment[]> {
  const pending = tasks.filter((task) => !task.completed);
  const pendingToRead = pending.slice(0, maxTasks);
  const texts: string[] = [];

  texts.push(isToday ? "Tus tareas de hoy." : "Tus tareas del día seleccionado.");

  if (pending.length === 0) {
    texts.push("No tienes tareas pendientes.");
  } else {
    texts.push(
      `Tienes ${pending.length} ${
        pending.length === 1 ? "tarea pendiente" : "tareas pendientes"
      }.`
    );

    for (const task of pendingToRead) {
      texts.push(normalize(task.title));
    }

    const remaining = pending.length - pendingToRead.length;
    if (remaining > 0) {
      texts.push(
        `Y ${remaining} ${
          remaining === 1 ? "tarea pendiente más" : "tareas pendientes más"
        }.`
      );
    }
  }

  if (goalText.trim()) {
    texts.push(goalText);
  }

  return Promise.all(texts.map((text) => buildSegment(text, userId)));
}
