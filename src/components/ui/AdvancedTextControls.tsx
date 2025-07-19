'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Lock } from 'lucide-react'
import { useHasPremiumAccess } from '@/contexts/UserContext'

interface AdvancedTextControlsProps {
  letterSpacing: number
  setLetterSpacing: (value: number) => void
  tiltX: number
  setTiltX: (value: number) => void
  tiltY: number
  setTiltY: (value: number) => void
  disabled?: boolean
  disabledMessage?: string
}

export default function AdvancedTextControls({
  letterSpacing,
  setLetterSpacing,
  tiltX,
  setTiltX,
  tiltY,
  setTiltY,
  disabled = false,
  disabledMessage = "Upgrade to Pro to access advanced text effects"
}: AdvancedTextControlsProps) {
  const hasPremiumAccess = useHasPremiumAccess()
  const isPremiumFeature = !hasPremiumAccess

  return (
    <div className="space-y-6">
      {/* Letter Spacing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            Letter Spacing
            {isPremiumFeature && <Lock className="w-4 h-4 text-amber-500" />}
          </Label>
          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
            {letterSpacing}px
          </span>
        </div>
        <div className="relative">
          <Slider
            value={[letterSpacing]}
            onValueChange={(value) => !isPremiumFeature && setLetterSpacing(value[0])}
            min={-20}
            max={100}
            step={1}
            disabled={disabled || isPremiumFeature}
            className={`w-full ${isPremiumFeature ? 'opacity-50' : ''}`}
          />
          {isPremiumFeature && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-900/90 px-3 py-1 rounded-lg border border-amber-500/30">
                <span className="text-xs text-amber-400 font-medium">Pro Feature</span>
              </div>
            </div>
          )}
        </div>
        {isPremiumFeature && (
          <p className="text-xs text-gray-500">{disabledMessage}</p>
        )}
      </div>

      {/* 3D Tilt X */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            Horizontal Tilt (3D Effect)
            {isPremiumFeature && <Lock className="w-4 h-4 text-amber-500" />}
          </Label>
          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
            {tiltX}°
          </span>
        </div>
        <div className="relative">
          <Slider
            value={[tiltX]}
            onValueChange={(value) => !isPremiumFeature && setTiltX(value[0])}
            min={-45}
            max={45}
            step={1}
            disabled={disabled || isPremiumFeature}
            className={`w-full ${isPremiumFeature ? 'opacity-50' : ''}`}
          />
          {isPremiumFeature && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-900/90 px-3 py-1 rounded-lg border border-amber-500/30">
                <span className="text-xs text-amber-400 font-medium">Pro Feature</span>
              </div>
            </div>
          )}
        </div>
        {isPremiumFeature && (
          <p className="text-xs text-gray-500">{disabledMessage}</p>
        )}
      </div>

      {/* 3D Tilt Y */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            Vertical Tilt (3D Effect)
            {isPremiumFeature && <Lock className="w-4 h-4 text-amber-500" />}
          </Label>
          <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
            {tiltY}°
          </span>
        </div>
        <div className="relative">
          <Slider
            value={[tiltY]}
            onValueChange={(value) => !isPremiumFeature && setTiltY(value[0])}
            min={-45}
            max={45}
            step={1}
            disabled={disabled || isPremiumFeature}
            className={`w-full ${isPremiumFeature ? 'opacity-50' : ''}`}
          />
          {isPremiumFeature && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-gray-900/90 px-3 py-1 rounded-lg border border-amber-500/30">
                <span className="text-xs text-amber-400 font-medium">Pro Feature</span>
              </div>
            </div>
          )}
        </div>
        {isPremiumFeature && (
          <p className="text-xs text-gray-500">{disabledMessage}</p>
        )}
      </div>

      {/* Premium Notice */}
      {isPremiumFeature && (
        <div className="p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                Unlock Advanced Text Effects
              </p>
              <p className="text-xs text-amber-400/80">
                Get access to letter spacing and 3D tilt effects with Pro
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
