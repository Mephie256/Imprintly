'use client';

import { Palette, Type, Bold, Italic, Underline } from 'lucide-react';
import ColorPicker from './ColorPicker';

interface StyleSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  fontWeight: string;
  onFontWeightChange: (weight: string) => void;
  fontStyle: string;
  onFontStyleChange: (style: string) => void;
  textDecoration: string;
  onTextDecorationChange: (decoration: string) => void;
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
  onTextDecorationChange
}: StyleSelectorProps) {

  const fontWeights = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' },
  ];

  return (
    <div className="space-y-6">
      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        opacity={opacity}
        onOpacityChange={onOpacityChange}
      />

      {/* Font Weight */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Bold className="w-5 h-5" />
          Font Weight
        </div>

        <div className="grid grid-cols-2 gap-2">
          {fontWeights.map((weight) => (
            <button
              key={weight.value}
              onClick={() => onFontWeightChange(weight.value)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                fontWeight === weight.value
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
              }`}
            >
              <div className="text-white font-medium text-sm">{weight.label}</div>
              <div
                className="text-gray-300 mt-1"
                style={{ fontWeight: weight.value }}
              >
                Sample
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Style Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Type className="w-5 h-5" />
          Text Style
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onFontStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              fontStyle === 'italic'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-gray-600 bg-white/5 hover:border-gray-500 text-gray-300'
            }`}
          >
            <Italic className="w-4 h-4" />
            Italic
          </button>

          <button
            onClick={() => onTextDecorationChange(textDecoration === 'underline' ? 'none' : 'underline')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              textDecoration === 'underline'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-gray-600 bg-white/5 hover:border-gray-500 text-gray-300'
            }`}
          >
            <Underline className="w-4 h-4" />
            Underline
          </button>
        </div>
      </div>

      {/* Quick Style Presets */}
      <div className="space-y-3">
        <div className="text-white font-semibold">Quick Presets</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onColorChange('#FFFFFF');
              onOpacityChange(1);
              onFontWeightChange('700');
            }}
            className="p-3 rounded-lg border border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10 transition-colors text-left"
          >
            <div className="text-white font-bold">Bold White</div>
            <div className="text-xs text-gray-400">High contrast</div>
          </button>

          <button
            onClick={() => {
              onColorChange('#000000');
              onOpacityChange(1);
              onFontWeightChange('700');
            }}
            className="p-3 rounded-lg border border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10 transition-colors text-left"
          >
            <div className="text-black font-bold bg-white rounded px-2 py-1">Bold Black</div>
            <div className="text-xs text-gray-400 mt-1">Classic</div>
          </button>

          <button
            onClick={() => {
              onColorChange('#FFD700');
              onOpacityChange(1);
              onFontWeightChange('700');
            }}
            className="p-3 rounded-lg border border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10 transition-colors text-left"
          >
            <div className="text-yellow-400 font-bold">Golden</div>
            <div className="text-xs text-gray-400">Eye-catching</div>
          </button>

          <button
            onClick={() => {
              onColorChange('#FF6B35');
              onOpacityChange(1);
              onFontWeightChange('700');
            }}
            className="p-3 rounded-lg border border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10 transition-colors text-left"
          >
            <div className="text-orange-500 font-bold">Orange</div>
            <div className="text-xs text-gray-400">Vibrant</div>
          </button>
        </div>
      </div>
    </div>
  );
}
