'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check, HelpCircle } from 'lucide-react';

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface CoachmarksProps {
  steps: TourStep[];
  tourKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Coachmarks({ steps, tourKey, isOpen, onClose }: CoachmarksProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const updateRect = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll into view if out of viewport
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const handleResize = () => updateRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen, currentStepIndex, currentStep]);

  if (!isOpen || !currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`petal_tour_${tourKey}`, 'completed');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-obsidian-950/50 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={handleComplete}
      />

      {/* Target Highlight Box */}
      {targetRect && (
        <div
          className="absolute border-2 border-rose-500 rounded-2xl shadow-[0_0_25px_rgba(244,63,94,0.4)] pointer-events-none transition-all duration-300 z-51"
          style={{
            top: targetRect.top - 6 + window.scrollY,
            left: targetRect.left - 6 + window.scrollX,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        className="fixed z-52 w-full max-w-sm p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-rose-200/80 shadow-2xl space-y-4 animate-scale-up"
        style={{
          top: targetRect
            ? Math.min(
                window.innerHeight - 240,
                Math.max(20, targetRect.bottom + 16)
              )
            : '50%',
          left: targetRect
            ? Math.min(
                window.innerWidth - 380,
                Math.max(20, targetRect.left + targetRect.width / 2 - 180)
              )
            : '50%',
          transform: !targetRect ? 'translate(-50%, -50%)' : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-100/70 text-rose-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold tracking-wider text-rose-700 uppercase">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleComplete}
            className="p-1 rounded-full text-obsidian-800/40 hover:text-obsidian-950 hover:bg-cream-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg font-bold text-obsidian-950">
            {currentStep.title}
          </h3>
          <p className="text-xs leading-relaxed text-obsidian-800/80">
            {currentStep.description}
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-rose-100/60">
          <button
            onClick={handleComplete}
            className="text-xs font-semibold text-obsidian-800/50 hover:text-obsidian-950 transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-semibold text-obsidian-900 hover:bg-cream-50 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1"
            >
              {currentStepIndex === steps.length - 1 ? (
                <>
                  <span>Finish</span> <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Next</span> <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating Tour Replay Trigger Button
export function TourTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200 shadow-xl text-obsidian-900 text-xs font-semibold hover:bg-rose-50 hover:text-rose-700 transition-all flex items-center gap-2 group animate-bounce-slow"
      title="Start Interactive App Tour"
    >
      <HelpCircle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
      <span>App Guide Tour</span>
    </button>
  );
}
