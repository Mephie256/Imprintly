'use client'

import { Sparkles } from 'lucide-react'

interface TextEffectsProps {
  textEffect: 'none' | 'shadow' | 'outline' | 'glow' | 'liquid-glass'
  onTextEffectChange: (
    effect: 'none' | 'shadow' | 'outline' | 'glow' | 'liquid-glass'
  ) => void
  glowColor: string
  onGlowColorChange: (color: string) => void
  disabled?: boolean
  disabledMessage?: string
}

export default function TextEffects({
  textEffect,
  onTextEffectChange,
  glowColor,
  onGlowColorChange,
  disabled = false,
  disabledMessage = 'Text effects disabled',
}: TextEffectsProps) {
  const effects = [
    { id: 'none', label: 'None', icon: '✨' },
    { id: 'shadow', label: 'Shadow', icon: '🌑' },
    { id: 'outline', label: 'Outline', icon: '⭕' },
    { id: 'glow', label: 'Glow', icon: '💫' },
    { id: 'liquid-glass', label: 'Liquid Glass', icon: '🌊' },
  ] as const

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 text-white font-bold text-lg">
        <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        Text Effects
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-2 gap-3">
        {effects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => !disabled && onTextEffectChange(effect.id as any)}
            disabled={disabled}
            className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left min-h-[60px] active:scale-95 ${
              disabled
                ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-not-allowed'
                : textEffect === effect.id
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/25'
                : 'border-gray-600 bg-white/10 hover:border-gray-500 hover:bg-white/20'
            }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{effect.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">
                  {effect.label}
                </div>
                {effect.id === 'liquid-glass' && (
                  <div className="text-xs text-purple-300 mt-1">
                    Transparent glass effect
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Glow Color Picker */}
      {textEffect === 'glow' && !disabled && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-purple-300">
            Glow Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={glowColor}
              onChange={(e) => onGlowColorChange(e.target.value)}
              className="w-12 h-12 rounded-xl border-2 border-gray-600 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={glowColor}
              onChange={(e) => onGlowColorChange(e.target.value)}
              placeholder="#00ffff"
              className="flex-1 px-3 py-2 bg-white/10 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="text-xs text-gray-400">
            Choose your custom glow color
          </div>
        </div>
      )}

      {disabled && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {disabledMessage}
        </div>
      )}

      {/* Effect Preview */}
      {textEffect !== 'none' && !disabled && (
        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-2">Preview:</div>
          <div
            className="text-2xl font-bold text-center py-4"
            style={{
              ...(textEffect === 'shadow' && {
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                color: '#ffffff',
              }),
              ...(textEffect === 'outline' && {
                WebkitTextStroke: '2px #ffffff',
                color: 'transparent',
              }),
              ...(textEffect === 'glow' && {
                textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor}`,
                color: '#ffffff',
              }),
              ...(textEffect === 'liquid-glass' && {
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backdropFilter: 'blur(10px)',
                textShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
              }),
            }}>
            Sample Text
          </div>
        </div>
      )}
    </div>
  )
}
