'use client'

import { Type, Move, Maximize, RotateCw } from 'lucide-react'

interface TextControlsProps {
  text: string
  setText: (text: string) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
  fontSize: number
  setFontSize: (size: number) => void
  rotation?: number
  setRotation?: (rotation: number) => void
  disabled?: boolean
  disabledMessage?: string
}

export default function TextControls({
  text,
  setText,
  position,
  setPosition,
  fontSize,
  setFontSize,
  rotation = 0,
  setRotation,
  disabled = false,
  disabledMessage = 'Text editing disabled',
}: TextControlsProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Text Input - Touch-Friendly */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white font-bold text-lg">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Type className="w-5 h-5 text-emerald-400" />
          </div>
          Text Content
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? disabledMessage : 'Enter your text here...'}
          disabled={disabled}
          className={`w-full p-4 sm:p-5 border-2 rounded-2xl resize-none transition-all duration-300 text-base sm:text-lg min-h-[80px] sm:min-h-[100px] ${
            disabled
              ? 'bg-red-500/10 border-red-500/30 text-red-400 placeholder-red-400 cursor-not-allowed'
              : 'bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
          }`}
          rows={3}
        />

        <div className="text-xs text-gray-400">{text.length} characters</div>
      </div>

      {/* Font Size - Touch-Friendly */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white font-bold text-lg">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Maximize className="w-5 h-5 text-emerald-400" />
          </div>
          Font Size
        </div>

        <div className="space-y-4">
          {/* Touch-friendly slider */}
          <input
            type="range"
            min="8"
            max="500"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-3 sm:h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
          />

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400 font-medium">8px</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="1000"
                value={fontSize}
                onChange={(e) =>
                  setFontSize(Math.max(1, Number(e.target.value)))
                }
                className="w-24 px-3 py-2 bg-white/10 border-2 border-gray-600 rounded-xl text-white text-base text-center focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[44px]"
              />
              <span className="text-sm text-gray-400 font-medium">px</span>
            </div>
            <span className="text-sm text-gray-400 font-medium">500px</span>
          </div>

          {/* Touch-friendly preset buttons */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[12, 16, 24, 32, 48, 64, 96, 128].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-3 text-sm font-bold rounded-xl transition-all duration-200 min-h-[44px] active:scale-95 ${
                  fontSize === size
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500'
                }`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Position Controls - Touch-Friendly */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white font-bold text-lg">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Move className="w-5 h-5 text-emerald-400" />
          </div>
          Text Position
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-300">
              Horizontal
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.x}
              onChange={(e) =>
                setPosition({ ...position, x: Number(e.target.value) })
              }
              className="w-full h-3 sm:h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
            />
            <div className="text-center">
              <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-sm font-bold text-emerald-300">
                {position.x}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-300">
              Vertical
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.y}
              onChange={(e) =>
                setPosition({ ...position, y: Number(e.target.value) })
              }
              className="w-full h-3 sm:h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
            />
            <div className="text-center">
              <span className="inline-block bg-white/10 px-3 py-1 rounded-lg text-sm font-bold text-emerald-300">
                {position.y}%
              </span>
            </div>
          </div>
        </div>

        {/* Touch-Friendly Position Presets */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => setPosition({ x: 50, y: 20 })}
            className="p-3 bg-white/10 hover:bg-white/20 border-2 border-gray-600 hover:border-gray-500 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all duration-200 min-h-[44px] active:scale-95">
            Top
          </button>
          <button
            onClick={() => setPosition({ x: 50, y: 50 })}
            className="p-3 bg-white/10 hover:bg-white/20 border-2 border-gray-600 hover:border-gray-500 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all duration-200 min-h-[44px] active:scale-95">
            Center
          </button>
          <button
            onClick={() => setPosition({ x: 50, y: 80 })}
            className="p-3 bg-white/10 hover:bg-white/20 border-2 border-gray-600 hover:border-gray-500 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all duration-200 min-h-[44px] active:scale-95">
            Bottom
          </button>
        </div>
      </div>

      {/* Rotation Control - Touch-Friendly */}
      {setRotation && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-lg">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <RotateCw className="w-5 h-5 text-emerald-400" />
            </div>
            Rotation
          </div>

          <div className="space-y-4">
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-3 sm:h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400 font-medium">-180°</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-white/10 border-2 border-gray-600 rounded-xl text-white text-base text-center focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[44px]"
                />
                <span className="text-sm text-gray-400 font-medium">°</span>
              </div>
              <span className="text-sm text-gray-400 font-medium">180°</span>
            </div>

            {/* Touch-friendly rotation presets */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setRotation(0)}
                className="px-3 py-3 bg-white/10 hover:bg-white/20 border-2 border-gray-600 hover:border-gray-500 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all duration-200 min-h-[44px] active:scale-95">
                Reset
              </button>
              <button
                onClick={() => setRotation(rotation - 90)}
                className="px-3 py-3 bg-white/10 hover:bg-white/20 border-2 border-gray-600 hover:border-gray-500 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all duration-200 min-h-[44px] active:scale-95">
                -90°
              </button>
              <button
                onClick={() => setRotation(rotation + 90)}
                className="px-3 py-3 bg-white/10 hover:bg-white/20 border-2 border-gray-600 hover:border-gray-500 rounded-xl text-sm font-bold text-gray-300 hover:text-white transition-all duration-200 min-h-[44px] active:scale-95">
                +90°
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touch-Friendly Help Section */}
      <div className="p-4 sm:p-5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl">
        <div className="text-base sm:text-lg text-emerald-300 font-bold mb-2 flex items-center gap-2">
          <span className="text-xl">🎯</span>
          Interactive Text
        </div>
        <div className="text-sm sm:text-base text-gray-400 leading-relaxed">
          <span className="hidden sm:inline">
            Click and drag text on canvas to move. Use arrow keys for precise
            positioning. Press Delete to clear text.
          </span>
          <span className="sm:hidden">
            Tap and drag text to move. Use controls above for precise
            adjustments.
          </span>
        </div>
      </div>
    </div>
  )
}
