'use client';

import { useState } from 'react';
import { Download, X, Image as ImageIcon, FileImage, Zap } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: 'png' | 'jpeg', quality: number, maxWidth: number) => void;
}

const presets = [
  {
    name: 'Web Optimized',
    description: 'Perfect for web use, social media',
    format: 'jpeg' as const,
    quality: 0.85,
    maxWidth: 1920,
    icon: Zap,
    size: '~200-500KB'
  },
  {
    name: 'High Quality',
    description: 'Best quality, larger file size',
    format: 'png' as const,
    quality: 1.0,
    maxWidth: 3840,
    icon: ImageIcon,
    size: '~1-3MB'
  },
  {
    name: 'Thumbnail',
    description: 'Small size for thumbnails',
    format: 'jpeg' as const,
    quality: 0.8,
    maxWidth: 1280,
    icon: FileImage,
    size: '~100-300KB'
  }
];

export default function DownloadModal({ isOpen, onClose, onDownload }: DownloadModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customFormat, setCustomFormat] = useState<'png' | 'jpeg'>('jpeg');
  const [customQuality, setCustomQuality] = useState(0.8);
  const [customMaxWidth, setCustomMaxWidth] = useState(1920);
  const [useCustom, setUseCustom] = useState(false);

  const handleDownload = () => {
    if (useCustom) {
      onDownload(customFormat, customQuality, customMaxWidth);
    } else {
      const preset = presets[selectedPreset];
      onDownload(preset.format, preset.quality, preset.maxWidth);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-white/20 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Download Options</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Preset Options */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Quick Presets</h4>
              <button
                onClick={() => setUseCustom(!useCustom)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  useCustom
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {useCustom ? 'Using Custom' : 'Use Custom'}
              </button>
            </div>

            {!useCustom && (
              <div className="grid gap-3">
                {presets.map((preset, index) => {
                  const Icon = preset.icon;
                  const isSelected = selectedPreset === index;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedPreset(index)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-gray-600 bg-white/5 hover:border-gray-500 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-emerald-500/20' : 'bg-gray-700/50'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-emerald-400' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{preset.name}</span>
                            <span className="text-xs text-emerald-400 font-medium">{preset.size}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{preset.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Format: {preset.format.toUpperCase()}</span>
                            <span>Max: {preset.maxWidth}px</span>
                            {preset.format === 'jpeg' && (
                              <span>Quality: {Math.round(preset.quality * 100)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Options */}
          {useCustom && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Custom Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Format</label>
                  <select
                    value={customFormat}
                    onChange={(e) => setCustomFormat(e.target.value as 'png' | 'jpeg')}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="jpeg">JPEG (smaller)</option>
                    <option value="png">PNG (lossless)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Max Width</label>
                  <select
                    value={customMaxWidth}
                    onChange={(e) => setCustomMaxWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={1280}>1280px (HD)</option>
                    <option value={1920}>1920px (Full HD)</option>
                    <option value={2560}>2560px (2K)</option>
                    <option value={3840}>3840px (4K)</option>
                    <option value={7680}>7680px (8K)</option>
                  </select>
                </div>
              </div>

              {customFormat === 'jpeg' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Quality: {Math.round(customQuality * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={customQuality}
                    onChange={(e) => setCustomQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Download Button */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
