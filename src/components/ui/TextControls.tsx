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
    <div className="space-y-6">
      {/* Text Input */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Type className="w-5 h-5" />
          Text Content
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? disabledMessage : 'Enter your text here...'}
          disabled={disabled}
          className={`w-full p-3 border rounded-lg resize-none transition-all duration-200 ${
            disabled
              ? 'bg-red-500/10 border-red-500/30 text-red-400 placeholder-red-400 cursor-not-allowed'
              : 'bg-white/10 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none'
          }`}
          rows={3}
        />

        <div className="text-xs text-gray-400">{text.length} characters</div>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Maximize className="w-5 h-5" />
          Font Size
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min="8"
            max="500"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">8</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                value={fontSize}
                onChange={(e) =>
                  setFontSize(Math.max(1, Number(e.target.value)))
                }
                className="w-20 px-2 py-1 bg-white/10 border border-gray-600 rounded text-white text-sm text-center focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-xs text-gray-400">px</span>
            </div>
            <span className="text-sm text-gray-400">500</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[12, 16, 24, 32, 48, 64, 96, 128].map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  fontSize === size
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Position Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Move className="w-5 h-5" />
          Text Position
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
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
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-400 mt-1">{position.x}%</div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Vertical</label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.y}
              onChange={(e) =>
                setPosition({ ...position, y: Number(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-400 mt-1">{position.y}%</div>
          </div>
        </div>

        {/* Quick Position Presets */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => setPosition({ x: 50, y: 20 })}
            className="p-2 bg-white/5 hover:bg-white/10 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
            Top
          </button>
          <button
            onClick={() => setPosition({ x: 50, y: 50 })}
            className="p-2 bg-white/5 hover:bg-white/10 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
            Center
          </button>
          <button
            onClick={() => setPosition({ x: 50, y: 80 })}
            className="p-2 bg-white/5 hover:bg-white/10 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
            Bottom
          </button>
        </div>
      </div>

      {/* Rotation Control */}
      {setRotation && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <RotateCw className="w-5 h-5" />
            Rotation
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">-180°</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white/10 border border-gray-600 rounded text-white text-sm text-center focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400">°</span>
              </div>
              <span className="text-sm text-gray-400">180°</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRotation(0)}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
                Reset
              </button>
              <button
                onClick={() => setRotation(rotation - 90)}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
                -90°
              </button>
              <button
                onClick={() => setRotation(rotation + 90)}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-gray-600 rounded text-xs text-gray-300 transition-colors">
                +90°
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <div className="text-sm text-emerald-300 font-medium mb-1">
          🎯 Interactive Text
        </div>
        <div className="text-xs text-gray-400">
          Click and drag text on canvas to move. Use arrow keys for precise
          positioning. Press Delete to clear text.
        </div>
      </div>
    </div>
  )
}
