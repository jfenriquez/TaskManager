"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AudioWaveform, Plus, Play, Pause, Edit3, Trash2, Volume2, Maximize2, Minimize2, Repeat, Sparkles, Check, X, Star, Loader2,
} from "lucide-react";
import { getVitamentes, createVitamente, updateVitamente, completeVitamente, getTodayVitamentesLog } from "@/src/lib/server-actions/hyde-slayer/vitamente";
import { usePlayerStats } from "@/src/context/PlayerStatsContext";

interface Affirmation {
  id: string;
  title: string;
  content: string;
  category: string | null;
}

export default function Vitamentes() {
  const { refresh } = usePlayerStats();
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState("");
  const [newText, setNewText] = useState("");
  const [count, setCount] = useState(0);
  const [showMirror, setShowMirror] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completingRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const [vitRes, logRes] = await Promise.all([getVitamentes(), getTodayVitamentesLog()]);
        if (vitRes.success) setAffirmations(vitRes.data);
        if (logRes.success) setCompletedIds(new Set(logRes.data.map(l => l.vitamenteId)));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (isPlaying && intervalRef.current === null) {
      intervalRef.current = setInterval(async () => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % affirmations.length;

          if (!completingRef.current && affirmations[next]) {
            completingRef.current = true;
            completeVitamente({ vitamenteId: affirmations[next].id }).then((r) => {
              if (r.success) {
                setCompletedIds(prev => new Set(prev).add(affirmations[next].id));
                setCount(c => c + 1);
                refresh();
              }
              completingRef.current = false;
            });
          }

          return next;
        });
      }, 4000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, affirmations, refresh]);

  const togglePlay = () => {
    if (affirmations.length === 0) return;
    if (!isPlaying) {
      if (currentIndex === -1) setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const addAffirmation = async () => {
    if (!newText.trim()) return;
    const result = await createVitamente({ title: newText.trim(), content: newText.trim() });
    if (result.success) {
      setAffirmations(prev => [...prev, { id: result.data.id, title: result.data.title, content: result.data.content, category: null }]);
      setNewText("");
    }
  };

  const startEdit = (aff: Affirmation) => {
    setEditId(aff.id);
    setEditText(aff.content);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    const result = await updateVitamente({ id: editId, content: editText.trim() });
    if (result.success) {
      setAffirmations(prev => prev.map(a => a.id === editId ? { ...a, content: editText.trim(), title: editText.trim() } : a));
    }
    setIsEditing(false);
    setEditId("");
  };

  const deleteAffirmation = (i: number) => {
    setAffirmations(prev => prev.filter((_, j) => j !== i));
    if (currentIndex === i) {
      setCurrentIndex(-1);
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--hs-primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AudioWaveform className="w-6 h-6" style={{ color: "var(--hs-gold)" }} />
          <h2 className="text-xl font-black text-[var(--hs-text)] uppercase tracking-wider">Vitamentes</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--hs-text-muted)]">
            <Star className="w-3 h-3 inline mr-1" />{count} repeticiones
          </span>
          <span className="text-xs text-[var(--hs-success)]">
            <Check className="w-3 h-3 inline mr-1" />{completedIds.size}/{affirmations.length} hoy
          </span>
          <button onClick={() => setShowMirror(!showMirror)} className="hs-btn-ghost text-xs py-1.5 px-3">
            {showMirror ? "Ocultar espejo" : "Modo espejo"}
          </button>
        </div>
      </div>

      <div className={`hs-card ${isFullscreen ? "fixed inset-4 z-50 flex flex-col items-center justify-center" : "p-8"}`}>
        <AnimatePresence mode="wait">
          {currentIndex >= 0 && affirmations[currentIndex] ? (
            <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-8 h-16">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div key={i} className="w-1 rounded-full"
                    style={{ background: "linear-gradient(180deg, var(--hs-primary), var(--hs-accent))" }}
                    animate={isPlaying ? { height: [20, 60 + Math.random() * 40, 20], opacity: [0.4, 1, 0.4] } : { height: 20 }}
                    transition={{ duration: 1 + Math.random(), repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-[var(--hs-text)] mb-4 leading-relaxed">
                &ldquo;{affirmations[currentIndex].content}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="hs-badge text-xs" style={{ background: "var(--hs-primary)20", color: "var(--hs-primary)" }}>
                  {currentIndex + 1} / {affirmations.length}
                </span>
                {completedIds.has(affirmations[currentIndex].id) && (
                  <span className="hs-badge text-xs" style={{ background: "rgba(16,185,129,0.15)", color: "var(--hs-success)" }}>
                    <Check className="w-3 h-3 inline mr-1" />Completada hoy
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <AudioWaveform className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--hs-text-muted)" }} />
              <p className="text-lg font-medium text-[var(--hs-text-muted)]">
                {affirmations.length === 0 ? "No hay vitamentes disponibles" : "Presiona Play para comenzar"}
              </p>
            </div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => { setIsPlaying(false); setCurrentIndex(-1); }} className="hs-btn-ghost p-3 rounded-xl">
            <X className="w-5 h-5" />
          </button>
          <button onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--hs-primary), var(--hs-accent))", boxShadow: "0 0 30px var(--hs-hyde-glow)" }}
          >
            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-1" />}
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="hs-btn-ghost p-3 rounded-xl">
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>

        {isPlaying && (
          <div className="flex items-center justify-center gap-1 mt-4">
            {affirmations.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: i === currentIndex ? "var(--hs-primary)" : "rgba(255,255,255,0.1)", transform: i === currentIndex ? "scale(1.5)" : "scale(1)" }}
              />
            ))}
          </div>
        )}
      </div>

      {showMirror && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="hs-card p-8 text-center">
          <p className="text-lg font-medium text-[var(--hs-text-muted)] mb-2">Mírate al espejo y repite:</p>
          <p className="text-2xl font-bold text-[var(--hs-text)]">
            &ldquo;{currentIndex >= 0 ? affirmations[currentIndex].content : "Selecciona una afirmación"}&rdquo;
          </p>
        </motion.div>
      )}

      <div className="hs-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider">Mis afirmaciones</h3>
          <div className="flex gap-2">
            <input className="hs-input text-sm py-2 w-48" placeholder="Nueva afirmación..." value={newText}
              onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addAffirmation()} />
            <button onClick={addAffirmation} className="hs-btn text-sm py-2 px-3"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="space-y-2">
          {affirmations.map((aff, i) => (
            <motion.div key={aff.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${i === currentIndex ? "bg-[var(--hs-primary)]20 border border-[var(--hs-primary)]30" : "border border-transparent hover:border-[var(--hs-glass-border)]"}`}
              style={{ background: i === currentIndex ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.02)" }}
            >
              <button onClick={() => { setCurrentIndex(i); setIsPlaying(true); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                <Play className="w-3.5 h-3.5" style={{ color: "var(--hs-text-muted)" }} />
              </button>
              <span className="text-sm text-[var(--hs-text)] flex-1">&ldquo;{aff.content}&rdquo;</span>
              {completedIds.has(aff.id) && <Check className="w-3.5 h-3.5" style={{ color: "var(--hs-success)" }} />}
              <button onClick={() => startEdit(aff)} className="text-[var(--hs-text-muted)] hover:text-[var(--hs-primary)]"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteAffirmation(i)} className="text-[var(--hs-text-muted)] hover:text-[var(--hs-danger)]"><Trash2 className="w-3.5 h-3.5" /></button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsEditing(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="hs-card p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-[var(--hs-text)] uppercase tracking-wider mb-4">Editar afirmación</h3>
              <input className="hs-input text-base mb-4" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="hs-btn-ghost text-sm py-2">Cancelar</button>
                <button onClick={saveEdit} className="hs-btn text-sm py-2"><Check className="w-4 h-4 inline mr-1" />Guardar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
