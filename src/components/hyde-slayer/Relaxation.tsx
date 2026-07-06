"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Wind, Play, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { getExercises, completeExercise, getExerciseLogs } from "@/src/lib/server-actions/hyde-slayer/relaxation";
import { usePlayerStats } from "@/src/context/PlayerStatsContext";

type Phase = "idle" | "inhale" | "hold" | "exhale";

const reflectionQuestions = [
  "¿Qué está diciendo Hyde?", "¿Por qué pienso esto?", "¿Qué historia me estoy contando?",
  "¿Cuál es la verdad?", "¿Qué pequeña acción puedo hacer ahora?",
];

interface ExerciseGuide {
  icon: string;
  idleText: string;
  phaseLabel: string;
  stepDuration: number;
  steps: string[];
}

const exerciseGuides: Record<string, ExerciseGuide> = {
  "Escaneo corporal": {
    icon: "🔍",
    idleText: "Enfoca tu atención en cada parte del cuerpo, desde los pies hasta la cabeza.",
    phaseLabel: "ESCANEO CORPORAL",
    stepDuration: 15,
    steps: [
      "Siente la planta de tus pies contra el suelo",
      "Lleva la atención a tus tobillos y pantorrillas",
      "Siente la energía en tus rodillas y muslos",
      "Toma conciencia de tu cadera y abdomen",
      "Siente tu pecho expandirse con cada respiración",
      "Relaja tus hombros… déjalos caer por completo",
      "Siente el peso de tus brazos y manos",
      "Lleva la atención a tu cuello… suéltalo",
      "Relaja tu mandíbula, separa ligeramente los dientes",
      "Suaviza tu rostro: frente, ojos, mejillas, labios",
      "Ahora percibe tu cuerpo completo como una unidad",
      "Respira y siente la totalidad de tu ser",
    ],
  },
  "Visualización guiada": {
    icon: "🌅",
    idleText: "Imagina un lugar seguro y tranquilo. Déjate llevar por la visualización.",
    phaseLabel: "VISUALIZACIÓN",
    stepDuration: 20,
    steps: [
      "Cierra los ojos. Respira hondo. Suelta.",
      "Imagina un lugar seguro. Puede ser real o imaginario.",
      "Observa los colores a tu alrededor… tonos suaves y cálidos",
      "Siente la temperatura del aire en tu piel",
      "Escucha los sonidos del lugar… viento, agua, silencio",
      "Nota los aromas… fresco, salado, dulce, a tierra mojada",
      "Camina lentamente por este lugar. Cada paso es paz.",
      "Encuentra un sitio cómodo para sentarte",
      "Deja que la tranquilidad te envuelva por completo",
      "Lleva una mano a tu pecho. Siente tu corazón calmado.",
      "Guarda esta sensación de paz en tu interior",
      "Poco a poco, vuelve tu atención al presente",
    ],
  },
  "Estiramientos de cuello": {
    icon: "🧘",
    idleText: "Libera la tensión acumulada en el cuello y hombros con movimientos suaves.",
    phaseLabel: "ESTIRAMIENTO",
    stepDuration: 12,
    steps: [
      "Siéntate erguido, hombros relajados",
      "Inclina la cabeza hacia la derecha… siente el estiramiento",
      "Vuelve al centro. Inhala. Exhala.",
      "Inclina la cabeza hacia la izquierda… sin forzar",
      "Vuelve al centro. Respira profundamente.",
      "Gira la cabeza lentamente hacia la derecha",
      "Sostén la mirada a la derecha… respira",
      "Vuelve al centro. Gira hacia la izquierda",
      "Sostén la mirada a la izquierda… respira",
      "Baja la barbilla hacia el pecho… estira la nuca",
      "Rueda los hombros hacia atrás 5 veces",
      "Eleva los hombros hacia las orejas y suelta",
    ],
  },
  "Meditación de atención plena": {
    icon: "🧠",
    idleText: "Observa tus pensamientos sin juzgar. Sé testigo de tu mente.",
    phaseLabel: "ATENCIÓN PLENA",
    stepDuration: 25,
    steps: [
      "Siéntate cómodamente. Columna erguida pero sin tensión.",
      "Lleva la atención a tu respiración natural",
      "Observa el aire entrando y saliendo sin modificarlo",
      "Tu mente divagará. Es normal. Vuelve a la respiración.",
      "Nota las sensaciones en tu cuerpo sin juzgar",
      "Observa tus pensamientos como nubes que pasan",
      "No te apegues a ningún pensamiento. Déjalo ir.",
      "Vuelve una y otra vez al ancla de tu respiración",
      "Abre tu conciencia a los sonidos a tu alrededor",
      "Acoge cada sonido sin etiquetarlo como bueno o malo",
      "Expande tu atención a todo tu cuerpo",
      "Descansa en la pura conciencia de estar presente",
      "Sin esfuerzo. Sin expectativas. Solo presente.",
      "Poco a poco, trae de vuelta tu atención",
    ],
  },
  "Estiramiento de guerrero": {
    icon: "⚔️",
    idleText: "Fortalece cuerpo y mente con la postura del guerrero.",
    phaseLabel: "GUERRERO",
    stepDuration: 15,
    steps: [
      "Ponte de pie. Pies separados al ancho de caderas.",
      "Da un gran paso atrás con la pierna derecha",
      "Gira el pie trasero 45 grados. Afirma tu base.",
      "Flexiona la rodilla delantera a 90 grados",
      "Eleva los brazos hacia el cielo, palmas frente a frente",
      "Mantén la mirada al frente. Respira hondo.",
      "Siente la fuerza en tus piernas y tu centro",
      "Baja lentamente los brazos. Cambia de lado.",
      "Paso atrás con la pierna izquierda",
      "Flexiona la rodilla derecha. Eleva los brazos.",
      "Respira profundo. Eres fuerte. Estás presente.",
      "Baja los brazos. Junta los pies. Sacúdelos.",
    ],
  },
};

function getBreathingPattern(name: string, type: string): { inhale: number; hold: number; exhale: number } {
  if (type !== "breathing") return { inhale: 0, hold: 0, exhale: 0 };
  if (name.includes("4-7-8")) return { inhale: 4, hold: 7, exhale: 8 };
  if (name.includes("cuadrada")) return { inhale: 4, hold: 4, exhale: 4 };
  return { inhale: 4, hold: 0, exhale: 6 };
}

function phaseLabel(phase: Phase, pattern: { inhale: number; hold: number; exhale: number }): string {
  if (phase === "idle") return "";
  if (pattern.inhale === 0) return "RELAJACIÓN";
  if (phase === "inhale") return "INHALA";
  if (phase === "hold") return "SOSTÉN";
  return "EXHALA";
}

function phaseColor(phase: Phase, pattern: { inhale: number; hold: number; exhale: number }): string {
  if (pattern.inhale === 0) return "var(--hs-primary)";
  if (phase === "inhale") return "var(--hs-success)";
  if (phase === "hold") return "var(--hs-gold)";
  return "var(--hs-primary)";
}

export default function Relaxation() {
  const { refresh } = usePlayerStats();
  const [exercises, setExercises] = useState<Array<{ id: string; name: string; description: string | null; duration: number; type: string }>>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [timer, setTimer] = useState(4);
  const [rounds, setRounds] = useState(0);
  const [reflectionIndex, setReflectionIndex] = useState(-1);
  const [completedToday, setCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedExercise = useMemo(
    () => exercises.find((e) => e.id === selectedExerciseId),
    [exercises, selectedExerciseId]
  );

  const pattern = useMemo(
    () => selectedExercise
      ? getBreathingPattern(selectedExercise.name, selectedExercise.type)
      : { inhale: 4, hold: 0, exhale: 4 },
    [selectedExercise]
  );

  const guide = useMemo(
    () => selectedExercise ? exerciseGuides[selectedExercise.name] : null,
    [selectedExercise]
  );

  const currentPhaseSeconds = useMemo(() => {
    if (pattern.inhale === 0 && guide) return guide.stepDuration;
    if (phase === "inhale") return pattern.inhale;
    if (phase === "hold") return pattern.hold;
    return pattern.exhale;
  }, [phase, pattern, guide]);

  useEffect(() => {
    async function load() {
      try {
        const [exRes, logsRes] = await Promise.all([getExercises(), getExerciseLogs(100)]);
        if (exRes.success) {
          setExercises(exRes.data);
          if (exRes.data.length > 0) setSelectedExerciseId(exRes.data[0].id);
        }
        if (logsRes.success) {
          const today = new Date().toDateString();
          setCompletedToday(logsRes.data.filter(l => new Date(l.completedAt).toDateString() === today).length);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const start = async () => {
    if (!selectedExerciseId) return;
    setPhase("inhale");
    setTimer(pattern.inhale || (guide?.stepDuration ?? 60));
    setStepIndex(0);
    setRounds(0);
    setReflectionIndex(-1);

    await completeExercise({ exerciseId: selectedExerciseId, duration: 5 });
    setCompletedToday(prev => prev + 1);
    refresh();
  };

  useEffect(() => {
    if (phase === "idle") return;

    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          if (pattern.inhale === 0 && guide) {
            setStepIndex((prev) => {
              const next = prev + 1;
              if (next >= guide.steps.length) {
                setRounds((r) => r + 1);
                setReflectionIndex((ri) => (ri + 1) % reflectionQuestions.length);
                return 0;
              }
              return next;
            });
            return guide.stepDuration;
          }

          const nextPhase = (current: Phase): Phase => {
            if (current === "inhale") return pattern.hold > 0 ? "hold" : "exhale";
            if (current === "hold") return "exhale";
            return "inhale";
          };

          const after = nextPhase(phase);
          if (after === "inhale") {
            setStepIndex((prev) => {
              const next = prev + 1;
              if (next >= relaxationGlobalSteps.length) {
                setRounds((r) => r + 1);
                setReflectionIndex((ri) => (ri + 1) % reflectionQuestions.length);
                return 0;
              }
              return next;
            });
          }
          setPhase(after);
          return after === "inhale" ? pattern.inhale
            : after === "hold" ? pattern.hold
            : pattern.exhale;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, stepIndex, pattern, guide]);

  const stop = () => {
    setPhase("idle");
    setTimer(4);
    setStepIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  const isBreathing = pattern.inhale > 0;
  const activeGuide = !isBreathing ? guide : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wind className="w-6 h-6" style={{ color: "var(--hs-success)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">Relajación Circunstancial</h2>
        </div>
        {completedToday > 0 && (
          <span className="text-xs text-[var(--hs-success)]">
            <Sparkles className="w-3 h-3 inline mr-1" />{completedToday} hoy
          </span>
        )}
      </div>

      {exercises.length > 0 && phase === "idle" && (
        <div className="flex gap-2 flex-wrap">
          {exercises.map((ex) => (
            <button key={ex.id} onClick={() => setSelectedExerciseId(ex.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selectedExerciseId === ex.id ? "text-white" : "text-[var(--hs-text-muted)]"}`}
              style={{
                background: selectedExerciseId === ex.id ? "linear-gradient(135deg, var(--hs-primary), var(--hs-accent))" : "rgba(255,255,255,0.05)",
                border: `1px solid ${selectedExerciseId === ex.id ? "transparent" : "var(--hs-glass-border)"}`,
              }}
            >
              {(exerciseGuides[ex.name]?.icon ?? "🌬️")}{" "}{ex.name}
            </button>
          ))}
        </div>
      )}

      {selectedExercise && phase === "idle" && (
        <div className="hs-card p-4">
          <p className="text-xs text-[var(--hs-text-muted)]">{selectedExercise.description}</p>
          {isBreathing && (
            <div className="flex gap-3 mt-3">
              <span className="hs-badge text-[10px]" style={{ background: "rgba(16,185,129,0.15)", color: "var(--hs-success)" }}>
                Inhalar {pattern.inhale}s
              </span>
              {pattern.hold > 0 && (
                <span className="hs-badge text-[10px]" style={{ background: "rgba(245,158,11,0.15)", color: "var(--hs-gold)" }}>
                  Sostener {pattern.hold}s
                </span>
              )}
              <span className="hs-badge text-[10px]" style={{ background: "rgba(99,102,241,0.15)", color: "var(--hs-primary)" }}>
                Exhalar {pattern.exhale}s
              </span>
            </div>
          )}
          {activeGuide && (
            <div className="flex gap-3 mt-3">
              {activeGuide.steps.length > 0 && (
                <span className="hs-badge text-[10px]" style={{ background: "rgba(99,102,241,0.15)", color: "var(--hs-primary)" }}>
                  {activeGuide.steps.length} pasos · {activeGuide.stepDuration}s c/u
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="hs-card p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ width: 2 + Math.random() * 4, height: 2 + Math.random() * 4, background: "var(--hs-primary)", opacity: 0.2, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
            />
          ))}
        </div>

        {phase === "idle" ? (
          <>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              <span className="text-6xl">{activeGuide?.icon ?? "🌬️"}</span>
            </motion.div>
            <h3 className="text-2xl font-bold text-[var(--hs-text)] mb-2">{selectedExercise?.name ?? "Respiración Consciente"}</h3>
            <p className="text-sm text-[var(--hs-text-muted)] text-center max-w-md mb-8">
              {activeGuide?.idleText ?? "Sigue el ritmo de la respiración. Inhala, sostén, exhala. Relaja cada parte de tu cuerpo."}
            </p>
            <button onClick={start} className="hs-btn text-lg px-10 py-4" disabled={!selectedExerciseId}>
              <Play className="w-5 h-5 inline mr-2" />COMENZAR
            </button>
          </>
        ) : (
          <div className="text-center w-full max-w-md">
            <motion.div className="mx-auto mb-8 rounded-full flex items-center justify-center"
              style={{ width: 200, height: 200, border: "2px solid var(--hs-primary)" }}
              animate={
                isBreathing
                  ? {
                      scale: phase === "inhale" ? [0.6, 1] : phase === "hold" ? 1 : [1, 0.6],
                      opacity: phase === "inhale" ? [0.3, 0.8] : phase === "hold" ? [0.8, 0.8] : [0.8, 0.3],
                    }
                  : { scale: [0.8, 1, 0.8], opacity: [0.4, 0.7, 0.4] }
              }
              transition={{ duration: Math.max(currentPhaseSeconds, 0.5), ease: "easeInOut" }}
            >
              {activeGuide ? (
                <motion.span
                  key={stepIndex}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl"
                >
                  {activeGuide.icon}
                </motion.span>
              ) : (
                <span className="text-4xl font-black" style={{ color: phaseColor(phase, pattern) }}>{timer}</span>
              )}
            </motion.div>

            {activeGuide ? (
              <>
                <p className="text-lg font-bold mb-1" style={{ color: "var(--hs-primary)" }}>
                  {activeGuide.phaseLabel}
                </p>
                <p className="text-xs text-[var(--hs-text-muted)] mb-1">
                  {timer}s · paso {stepIndex + 1}/{activeGuide.steps.length}
                </p>
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-base font-medium text-[var(--hs-text)] mb-6 leading-relaxed"
                >
                  {activeGuide.steps[stepIndex]}
                </motion.p>

                <div className="flex items-center justify-center gap-1 mb-6">
                  {activeGuide.steps.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{ background: i === stepIndex ? "var(--hs-primary)" : i < stepIndex ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)", transform: i === stepIndex ? "scale(1.5)" : "scale(1)" }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-xl font-bold mb-2" style={{ color: phaseColor(phase, pattern) }}>
                  {phaseLabel(phase, pattern)}
                </p>
                <p className="text-xs text-[var(--hs-text-muted)] mb-2">
                  {phase === "inhale" ? `Inhalando... ${timer}s` : phase === "hold" ? `Sosteniendo... ${timer}s` : `Exhalando... ${timer}s`}
                </p>
                <div className="flex justify-center gap-1 mb-4">
                  <div className={`w-2 h-2 rounded-full transition-all ${phase === "inhale" ? "scale-150" : ""}`}
                    style={{ background: phase === "inhale" ? "var(--hs-success)" : "rgba(255,255,255,0.15)" }} />
                  {pattern.hold > 0 && (
                    <div className={`w-2 h-2 rounded-full transition-all ${phase === "hold" ? "scale-150" : ""}`}
                      style={{ background: phase === "hold" ? "var(--hs-gold)" : "rgba(255,255,255,0.15)" }} />
                  )}
                  <div className={`w-2 h-2 rounded-full transition-all ${phase === "exhale" ? "scale-150" : ""}`}
                    style={{ background: phase === "exhale" ? "var(--hs-primary)" : "rgba(255,255,255,0.15)" }} />
                </div>
                <motion.p key={stepIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-[var(--hs-text-muted)] mb-6">
                  {relaxationGlobalSteps[stepIndex]}
                </motion.p>
                <div className="flex items-center justify-center gap-1 mb-6">
                  {relaxationGlobalSteps.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all"
                      style={{ background: i <= stepIndex ? "var(--hs-primary)" : "rgba(255,255,255,0.1)", transform: i === stepIndex ? "scale(1.5)" : "scale(1)" }}
                    />
                  ))}
                </div>
              </>
            )}

            {rounds > 0 && reflectionQuestions[reflectionIndex] && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hs-glass rounded-2xl px-6 py-4 mt-4">
                <p className="text-xs text-[var(--hs-text-muted)] mb-1">Reflexión:</p>
                <p className="text-sm font-medium text-[var(--hs-text)]">{reflectionQuestions[reflectionIndex]}</p>
              </motion.div>
            )}

            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={stop} className="hs-btn-ghost py-2 px-4 text-sm">
                <RotateCcw className="w-4 h-4 inline mr-1" />Detener
              </button>
              <span className="text-xs text-[var(--hs-text-muted)]">{activeGuide ? `${Math.round(rounds * activeGuide.steps.length + stepIndex)} pasos` : `Ciclos: ${rounds}`}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const relaxationGlobalSteps = [
  "Relajar frente", "Relajar mandíbula", "Relajar cuello", "Relajar hombros",
  "Relajar espalda", "Relajar manos", "Relajar abdomen",
];
