"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair,
  Target,
  Eye,
  HelpCircle,
  Split,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

const steps = [
  { key: "especifico", label: "Objetivo Específico", icon: <Target className="w-5 h-5" /> },
  { key: "proposito", label: "Propósito", icon: <Sparkles className="w-5 h-5" /> },
  { key: "visualizacion", label: "Visualización", icon: <Eye className="w-5 h-5" /> },
  { key: "preguntas", label: "Preguntas de Hyde", icon: <HelpCircle className="w-5 h-5" /> },
  { key: "misiones", label: "Dividir en Misiones", icon: <Split className="w-5 h-5" /> },
  { key: "cronograma", label: "Cronograma", icon: <Calendar className="w-5 h-5" /> },
];

const hydeQuestions = [
  "¿Vale el esfuerzo?",
  "¿Vale el riesgo?",
  "¿Qué es lo peor que puede pasar?",
  "¿Qué perderé si postergo?",
  "¿Qué ganaré si actúo?",
  "¿Cómo afectará a mi familia?",
  "¿Vale la pena?",
];

interface GoalSheetProps {
  onSave?: (data: {
    title: string;
    purpose: string | null;
    visualization: string | null;
    hydeAnswers: Record<string, string> | null;
    missions: string[] | null;
    timeline: string | null;
  }) => void;
  onClose?: () => void;
  initialData?: {
    title?: string;
    purpose?: string | null;
    visualization?: string | null;
    hydeAnswers?: Record<string, string> | null;
    missions?: string[] | null;
    timeline?: string | null;
  } | null;
}

export default function GoalSheet({ onSave, onClose, initialData }: GoalSheetProps) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(initialData?.title ?? "");
  const [purpose, setPurpose] = useState(initialData?.purpose ?? "");
  const [visualization, setVisualization] = useState(initialData?.visualization ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>(initialData?.hydeAnswers ?? {});
  const [missions, setMissions] = useState<string[]>(initialData?.missions ?? []);
  const [newMission, setNewMission] = useState("");
  const [timeline, setTimeline] = useState(initialData?.timeline?.slice(0, 10) ?? "");
  const [completed, setCompleted] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 0: return goal.trim().length > 0;
      case 1: return purpose.trim().length > 0;
      case 2: return visualization.trim().length > 0;
      case 3: return Object.keys(answers).length > 0;
      case 4: return missions.length > 0;
      case 5: return timeline.trim().length > 0;
      default: return false;
    }
  };

  const addMission = () => {
    if (newMission.trim()) {
      setMissions([...missions, newMission.trim()]);
      setNewMission("");
    }
  };

  const finish = () => {
    setCompleted(true);
    onSave?.({
      title: goal.trim(),
      purpose: purpose.trim() || null,
      visualization: visualization.trim() || null,
      hydeAnswers: Object.keys(answers).length > 0 ? answers : null,
      missions: missions.length > 0 ? missions : null,
      timeline: timeline || null,
    });
  };

  const reset = () => {
    setStep(0);
    setGoal("");
    setPurpose("");
    setVisualization("");
    setAnswers({});
    setMissions([]);
    setNewMission("");
    setTimeline("");
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6" style={{ color: "var(--hs-success)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">
            Objetivo Creado
          </h2>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="hs-card p-8 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1 }}
          >
            <Check className="w-20 h-20 mx-auto mb-4" style={{ color: "var(--hs-success)" }} />
          </motion.div>
          <h3 className="text-2xl font-black text-[var(--hs-text)] mb-2">¡Objetivo Registrado!</h3>
          <p className="text-sm text-[var(--hs-text-muted)] mb-6">
            &ldquo;{goal}&rdquo; ha sido añadido a tu hoja de ruta.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-[var(--hs-text-muted)]">
            <Sparkles className="w-4 h-4" style={{ color: "var(--hs-gold)" }} />
            +50 XP por crear un objetivo
          </div>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={reset} className="hs-btn">
              Crear otro objetivo
            </button>
            {onClose && (
              <button onClick={onClose} className="hs-btn-ghost">
                Volver a la lista
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--hs-text-muted)" }} />
          </button>
        )}
        <Crosshair className="w-6 h-6" style={{ color: "var(--hs-primary)" }} />
        <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">
          Hoja de Objetivos
        </h2>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                i === step
                  ? "text-white"
                  : i < step
                  ? "text-[var(--hs-success)]"
                  : "text-[var(--hs-text-muted)]"
              }`}
              style={{
                background:
                  i === step
                    ? "linear-gradient(135deg, var(--hs-primary), var(--hs-accent))"
                    : i < step
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(255,255,255,0.05)",
                border:
                  i < step
                    ? "1px solid rgba(16,185,129,0.2)"
                    : "1px solid var(--hs-glass-border)",
              }}
            >
              {i < step ? <Check className="w-3.5 h-3.5" /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className="w-6 h-px" style={{ background: "var(--hs-glass-border)" }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 0: Specific Goal */}
          {step === 0 && (
            <div className="hs-card p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="hs-badge text-[10px]" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
                  PASO 1
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Objetivo Específico</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">Define tu objetivo con claridad. Sé específico y medible.</p>
              <div className="space-y-3">
                <input
                  className="hs-input text-base"
                  placeholder="Ej: Subir 15 kilos de masa muscular"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canProceed() && setStep(1)}
                />
                <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hs-glass-border)" }}>
                  <p className="text-xs text-[var(--hs-text-muted)] font-medium mb-1">💡 Ejemplos:</p>
                  <ul className="text-xs text-[var(--hs-text-muted)] space-y-1">
                    <li>• Leer 24 libros en un año</li>
                    <li>• Ahorrar $10,000 en 12 meses</li>
                    <li>• Correr una maratón en 6 meses</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Purpose */}
          {step === 1 && (
            <div className="hs-card p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="hs-badge text-[10px]" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
                  PASO 2
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Propósito</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">¿Por qué quieres esto? Conecta con tu motivación más profunda.</p>
              <textarea
                className="hs-input min-h-[120px] resize-none"
                placeholder="Ej: Quiero sentirme fuerte, saludable y lleno de energía. Quiero verme al espejo y sentir orgullo..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
          )}

          {/* Step 2: Visualization */}
          {step === 2 && (
            <div className="hs-card p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="hs-badge text-[10px]" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
                  PASO 3
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Visualización</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">Cierra los ojos e imagina. Describe cómo te ves, cómo te sientes.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  "¿Cómo me veo?",
                  "¿Cómo me siento?",
                  "¿Qué ropa uso?",
                  "¿Cómo me habla la gente?",
                  "¿Cómo es mi energía?",
                  "¿Qué emociones siento?",
                ].map((q) => (
                  <div key={q} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hs-glass-border)" }}>
                    <p className="text-[10px] text-[var(--hs-text-muted)] mb-1">{q}</p>
                  </div>
                ))}
              </div>
              <textarea
                className="hs-input min-h-[100px] resize-none"
                placeholder="Describe tu visualización en detalle..."
                value={visualization}
                onChange={(e) => setVisualization(e.target.value)}
              />
            </div>
          )}

          {/* Step 3: Hyde's Questions */}
          {step === 3 && (
            <div className="hs-card p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="hs-badge text-[10px]" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
                  PASO 4
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Preguntas de Hyde</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">Hyde intentará detenerte con estas preguntas. Responde con honestidad.</p>
              <div className="space-y-4">
                {hydeQuestions.map((q) => (
                  <div key={q} className="p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--hs-glass-border)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-4 h-4" style={{ color: "var(--hs-danger)" }} />
                      <p className="text-sm font-semibold text-[var(--hs-text)]">{q}</p>
                    </div>
                    <textarea
                      className="hs-input min-h-[60px] resize-none text-sm"
                      placeholder="Tu respuesta..."
                      value={answers[q] || ""}
                      onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Split into Missions */}
          {step === 4 && (
            <div className="hs-card p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="hs-badge text-[10px]" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
                  PASO 5
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Dividir en Misiones</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">Divide tu objetivo en misiones pequeñas y alcanzables.</p>
              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <input
                    className="hs-input flex-1"
                    placeholder="Ej: Entrenar 3 veces por semana"
                    value={newMission}
                    onChange={(e) => setNewMission(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMission()}
                  />
                  <button onClick={addMission} className="hs-btn text-sm px-4">
                    Añadir
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Dormir mejor",
                    "Entrenar 3 veces por semana",
                    "Comer más proteína",
                    "Preparar comidas",
                    "Controlar peso semanalmente",
                  ].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setMissions([...missions, ex])}
                      className="text-left px-3 py-2 rounded-xl text-xs text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] transition-all"
                      style={{ border: "1px solid var(--hs-glass-border)" }}
                    >
                      + {ex}
                    </button>
                  ))}
                </div>
              </div>
              {missions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--hs-text)] uppercase tracking-wider">
                    Tus misiones ({missions.length})
                  </p>
                  {missions.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--hs-success)" }} />
                      <span className="text-sm text-[var(--hs-text)]">{m}</span>
                      <button
                        onClick={() => setMissions(missions.filter((_, j) => j !== i))}
                        className="ml-auto text-[10px] text-[var(--hs-text-muted)] hover:text-[var(--hs-danger)]"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Timeline */}
          {step === 5 && (
            <div className="hs-card p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="hs-badge text-[10px]" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
                  PASO 6
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--hs-text)] mb-2">Cronograma</h3>
              <p className="text-sm text-[var(--hs-text-muted)] mb-6">Establece fechas límite realistas para tu objetivo y misiones.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--hs-text-muted)] mb-1 block">
                    Fecha límite del objetivo
                  </label>
                  <input
                    type="date"
                    className="hs-input"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                  />
                </div>
                {missions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--hs-text)] mb-3 uppercase tracking-wider">
                      Checklist de misiones
                    </p>
                    <div className="space-y-2">
                      {missions.map((m, i) => (
                        <label key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--hs-glass-border)" }}>
                          <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: "var(--hs-primary)" }} />
                          <span className="text-sm text-[var(--hs-text)]">{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          className={`hs-btn-ghost text-sm ${step === 0 ? "opacity-0 pointer-events-none" : ""}`}
        >
          <ChevronLeft className="w-4 h-4 inline mr-1" />
          Anterior
        </button>
        <div className="text-xs text-[var(--hs-text-muted)]">
          Paso {step + 1} de {steps.length}
        </div>
        {step < steps.length - 1 ? (
          <button
            onClick={() => canProceed() && setStep(step + 1)}
            className={`hs-btn text-sm ${!canProceed() ? "opacity-50 pointer-events-none" : ""}`}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 inline ml-1" />
          </button>
        ) : (
          <button
            onClick={finish}
            className={`hs-btn text-sm ${!canProceed() ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Check className="w-4 h-4 inline mr-1" />
            Completar objetivo
          </button>
        )}
      </div>
    </div>
  );
}
