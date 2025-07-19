'use client'

import { Palette, Type, Bold, Italic, Underline } from 'lucide-react'
import ColorPicker from './ColorPicker'

interface StyleSelectorProps {
  selectedColor: string
  onColorChange: (color: string) => void
  opacity: number
  onOpacityChange: (opacity: number) => void
  fontWeight: string
  onFontWeightChange: (weight: string) => void
  fontStyle: string
  onFontStyleChange: (style: string) => void
  textDecoration: string
  onTextDecorationChange: (decoration: string) => void
}

export default function StyleSelector({
  selectedColor,
  onColorChange,
  opacity,
  onOpacityChange,
  fontWeight,
  onFontWeightChange,
  fontStyle,
  onFontStyleChange,
  textDecoration,
  onTextDecorationChange,
}: StyleSelectorProps) {
  const fontWeights = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Touch-Friendly Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        opacity={opacity}
        onOpacityChange={onOpacityChange}
      />

      {/* Touch-Friendly Font Weight */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white font-bold text-lg">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Bold className="w-5 h-5 text-emerald-400" />
          </div>
          Font Weight
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fontWeights.map((weight) => (
            <button
              key={weight.value}
              onClick={() => onFontWeightChange(weight.value)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left min-h-[60px] active:scale-95 ${
                fontWeight === weight.value
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/25'
                  : 'border-gray-600 bg-white/10 hover:border-gray-500 hover:bg-white/20'
              }`}>
              <div className="text-white font-bold text-sm sm:text-base">
                {weight.label}
              </div>
              <div
                className="text-gray-300 mt-1 text-sm"
                style={{ fontWeight: weight.value }}>
                Sample
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Touch-Friendly Text Style Options */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-white font-bold text-lg">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Type className="w-5 h-5 text-emerald-400" />
          </div>
          Text Style
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              onFontStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')
            }
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-h-[48px] active:scale-95 ${
              fontStyle === 'italic'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/25'
                : 'border-gray-600 bg-white/10 hover:border-gray-500 text-gray-300 hover:bg-white/20'
            }`}>
            <Italic className="w-5 h-5" />
            <span className="font-bold">Italic</span>
          </button>

          <button
            onClick={() =>
              onTextDecorationChange(
                textDecoration === 'underline' ? 'none' : 'underline'
              )
            }
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-h-[48px] active:scale-95 ${
              textDecoration === 'underline'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/25'
                : 'border-gray-600 bg-white/10 hover:border-gray-500 text-gray-300 hover:bg-white/20'
            }`}>
            <Underline className="w-5 h-5" />
            <span className="font-bold">Underline</span>
          </button>
        </div>
      </div>

      {/* Touch-Friendly Quick Style Presets */}
      <div className="space-y-4">
        <div className="text-white font-bold text-lg">Quick Presets</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onColorChange('#FFFFFF')
              onOpacityChange(1)
              onFontWeightChange('700')
            }}
            className="p-4 rounded-2xl border-2 border-gray-600 bg-white/10 hover:border-gray-500 hover:bg-white/20 transition-all duration-200 text-left min-h-[60px] active:scale-95">
            <div className="text-white font-bold text-base">Bold White</div>
            <div className="text-sm text-gray-400 mt-1">High contrast</div>
          </button>

          <button
            onClick={() => {
              onColorChange('#000000')
              onOpacityChange(1)
              onFontWeightChange('700')
            }}
            className="p-4 rounded-2xl border-2 border-gray-600 bg-white/10 hover:border-gray-500 hover:bg-white/20 transition-all duration-200 text-left min-h-[60px] active:scale-95">
            <div className="text-black font-bold bg-white rounded-xl px-3 py-1 text-base">
              Bold Black
            </div>
            <div className="text-sm text-gray-400 mt-2">Classic</div>
          </button>

          <button
            onClick={() => {
              onColorChange('#FFD700')
              onOpacityChange(1)
              onFontWeightChange('700')
            }}
            className="p-4 rounded-2xl border-2 border-gray-600 bg-white/10 hover:border-gray-500 hover:bg-white/20 transition-all duration-200 text-left min-h-[60px] active:scale-95">
            <div className="text-yellow-400 font-bold text-base">Golden</div>
            <div className="text-sm text-gray-400 mt-1">Eye-catching</div>
          </button>

          <button
            onClick={() => {
              onColorChange('#FF6B35')
              onOpacityChange(1)
              onFontWeightChange('700')
            }}
            className="p-4 rounded-2xl border-2 border-gray-600 bg-white/10 hover:border-gray-500 hover:bg-white/20 transition-all duration-200 text-left min-h-[60px] active:scale-95">
            <div className="text-orange-500 font-bold text-base">Orange</div>
            <div className="text-sm text-gray-400 mt-1">Vibrant</div>
          </button>
        </div>
      </div>
    </div>
  )
}
