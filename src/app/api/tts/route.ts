import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 3000;
const DEFAULT_VOICE_ID = "onwK4e9ZLuTAKqWW03F9";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

interface TtsRequestBody {
  text?: unknown;
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    const code = (cause as NodeJS.ErrnoException).code;
    return `${error.message} (${code ? `${code}: ` : ""}${cause.message})`;
  }
  if (cause !== undefined) {
    return `${error.message} (${String(cause)})`;
  }
  return error.message;
}

function callElevenLabs(
  voiceId: string,
  modelId: string,
  apiKey: string,
  text: string
): Promise<Response> {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
      voiceId
    )}/stream?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  );
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: TtsRequestBody;
  try {
    body = (await request.json()) as TtsRequestBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Texto vacío" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Texto demasiado largo (máx. ${MAX_TEXT_LENGTH} caracteres)` },
      { status: 400 }
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("[ElevenLabs TTS] Falta ELEVENLABS_API_KEY en el entorno");
    return NextResponse.json(
      { error: "TTS no configurado en el servidor" },
      { status: 500 }
    );
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL_ID;

  let response: Response;
  try {
    response = await callElevenLabs(voiceId, modelId, apiKey, text);
  } catch (firstError) {
    const firstMessage = describeError(firstError);
    console.error(
      "[ElevenLabs TTS] Primer intento falló, reintentando:",
      firstMessage
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      response = await callElevenLabs(voiceId, modelId, apiKey, text);
      console.warn("[ElevenLabs TTS] Reintento exitoso");
    } catch (secondError) {
      const message = describeError(secondError);
      console.error("[ElevenLabs TTS] Segundo intento falló:", message);
      return NextResponse.json(
        {
          error: "No se pudo contactar ElevenLabs",
          detail: message,
          firstError: firstMessage,
        },
        { status: 502 }
      );
    }
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    console.error(
      "[ElevenLabs TTS] Error",
      response.status,
      detail.slice(0, 800)
    );
    return NextResponse.json(
      {
        error: "ElevenLabs error",
        status: response.status,
        detail: detail.slice(0, 800),
      },
      { status: 502 }
    );
  }

  try {
    const audio = await response.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Length": audio.byteLength.toString(),
      },
    });
  } catch (error) {
    const message = describeError(error);
    console.error("[ElevenLabs TTS] Error leyendo el audio:", message);
    return NextResponse.json(
      { error: "Error leyendo el audio de ElevenLabs", detail: message },
      { status: 502 }
    );
  }
}
