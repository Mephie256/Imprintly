'use client';

import { useState } from 'react';
import { Palette, Pipette, Plus } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
}

// Canva-style color presets
const colorPresets = [
  // Basic Colors
  { name: 'White', color: '#FFFFFF' },
  { name: 'Black', color: '#000000' },
  { name: 'Gray', color: '#808080' },
  { name: 'Light Gray', color: '#D3D3D3' },
  { name: 'Dark Gray', color: '#404040' },
  
  // Primary Colors
  { name: 'Red', color: '#FF0000' },
  { name: 'Green', color: '#00FF00' },
  { name: 'Blue', color: '#0000FF' },
  { name: 'Yellow', color: '#FFFF00' },
  { name: 'Cyan', color: '#00FFFF' },
  { name: 'Magenta', color: '#FF00FF' },
  
  // Popular Colors
  { name: 'Orange', color: '#FF6B35' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Pink', color: '#EC4899' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Sky Blue', color: '#0EA5E9' },
  { name: 'Amber', color: '#F59E0B' },
  
  // Gradient Colors
  { name: 'Coral', color: '#FF7F7F' },
  { name: 'Mint', color: '#98FB98' },
  { name: 'Lavender', color: '#E6E6FA' },
  { name: 'Peach', color: '#FFCBA4' },
  { name: 'Rose Gold', color: '#E8B4B8' },
  { name: 'Teal', color: '#008080' },
  
  // Dark Theme Colors
  { name: 'Navy', color: '#1E293B' },
  { name: 'Forest', color: '#064E3B' },
  { name: 'Burgundy', color: '#7F1D1D' },
  { name: 'Indigo', color: '#312E81' },
  { name: 'Slate', color: '#475569' },
  { name: 'Zinc', color: '#52525B' },
];

// Recent colors (would be stored in localStorage in real app)
const recentColors = ['#FF6B35', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#0EA5E9'];

export default function ColorPicker({ selectedColor, onColorChange, opacity = 1, onOpacityChange }: ColorPickerProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'recent'>('presets');
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onColorChange(color);
  };

  const rgbaToHex = (rgba: string): string => {
    if (rgba.startsWith('#')) return rgba;
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return rgba;
    const [, r, g, b] = match;
    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
  };

  const currentHex = rgbaToHex(selectedColor);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Palette className="w-5 h-5" />
        Text Color
      </div>

      {/* Color Preview */}
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-gray-600">
        <div 
          className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg"
          style={{ backgroundColor: selectedColor, opacity }}
        ></div>
        <div>
          <div className="text-white font-medium">Current Color</div>
          <div className="text-xs text-gray-400 font-mono">{currentHex.toUpperCase()}</div>
          {onOpacityChange && (
            <div className="text-xs text-gray-400">Opacity: {Math.round(opacity * 100)}%</div>
          )}
        </div>
      </div>

      {/* Opacity Slider */}
      {onOpacityChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Opacity</span>
            <span className="text-sm text-white font-medium">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
        {[
          { key: 'presets', label: 'Presets', icon: Palette },
          { key: 'custom', label: 'Custom', icon: Pipette },
          { key: 'recent', label: 'Recent', icon: Plus }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === key
                ? 'bg-emerald-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeTab === 'presets' && (
          <div className="grid grid-cols-6 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.color}
                onClick={() => handleColorSelect(preset.color)}
                className={`aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                  currentHex.toLowerCase() === preset.color.toLowerCase()
                    ? 'border-emerald-400 ring-2 ring-emerald-400/50'
                    : 'border-white/20 hover:border-white/40'
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              >
                {currentHex.toLowerCase() === preset.color.toLowerCase() && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Hex Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={currentHex}
                  onChange={handleCustomColorChange}
                  className="w-12 h-10 rounded border border-gray-600 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={currentHex}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      onColorChange(e.target.value);
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="text-sm text-blue-300 font-medium mb-1">💡 Color Tips</div>
              <div className="text-xs text-gray-400">
                Use high contrast colors for better readability. White text works well on dark backgrounds.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              {recentColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(color)}
                  className={`aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    currentHex.toLowerCase() === color.toLowerCase()
                      ? 'border-emerald-400 ring-2 ring-emerald-400/50'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {currentHex.toLowerCase() === color.toLowerCase() && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {recentColors.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent colors</p>
                <p className="text-xs">Colors you use will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
