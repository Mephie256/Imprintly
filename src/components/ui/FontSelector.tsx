'use client'

import React, { useEffect, useState } from 'react'
import { Button } from './button'
import { Label } from './label'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from './command'
import { CaretSortIcon, CheckIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { cn } from '../../lib/utils'
import { FREE_FONTS, ALL_FONTS } from '@/constants/fonts'
import { useHasPremiumAccess } from '@/contexts/UserContext'
// Fonts are preloaded via fonts.css import - no dynamic loading needed

interface FontSelectorProps {
  selectedFont: string
  onFontChange: (font: string) => void
}

const FontSelector: React.FC<FontSelectorProps> = ({
  selectedFont,
  onFontChange,
}) => {
  const [isPaidUser, setIsPaidUser] = useState(false)
  const hasPremiumAccess = useHasPremiumAccess()

  useEffect(() => {
    setIsPaidUser(hasPremiumAccess)
  }, [hasPremiumAccess])

  // Fonts are preloaded via fonts.css import - no additional loading needed

  return (
    <Popover>
      <div className="flex flex-col items-start justify-start my-8">
        <Label>
          Font Family{' '}
          {!isPaidUser && (
            <span className="text-xs text-muted-foreground ml-2">
              (6 free fonts available)
            </span>
          )}
        </Label>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'w-[200px] justify-between mt-3 p-2',
              !selectedFont && 'text-muted-foreground'
            )}>
            {selectedFont ? selectedFont : 'Select font family'}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search font family..." className="h-9" />
          <CommandList>
            <CommandEmpty>No font family found.</CommandEmpty>
            {!isPaidUser && (
              <CommandGroup heading="Free Fonts">
                {FREE_FONTS.map((font) => (
                  <button
                    key={font}
                    onClick={() => {
                      console.log('🎯 FONT SELECTED:', font)
                      onFontChange(font)
                    }}
                    className={cn(
                      'w-full px-3 py-2 text-left rounded-lg transition-all hover:bg-gray-700/50 flex items-center justify-between',
                      font === selectedFont
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'text-gray-300'
                    )}
                    style={{ fontFamily: font }}>
                    <span>{font}</span>
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        font === selectedFont ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </button>
                ))}
              </CommandGroup>
            )}
            <CommandGroup
              heading={
                isPaidUser ? 'All Fonts' : 'Premium Fonts (Upgrade to Access)'
              }>
              {(isPaidUser
                ? ALL_FONTS
                : ALL_FONTS.filter((f) => !FREE_FONTS.includes(f))
              ).map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    if (isPaidUser) {
                      console.log('🎯 PREMIUM FONT SELECTED:', font)
                      onFontChange(font)
                    }
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left rounded-lg transition-all flex items-center justify-between',
                    isPaidUser
                      ? `hover:bg-gray-700/50 ${
                          font === selectedFont
                            ? 'bg-blue-600/20 text-blue-300'
                            : 'text-gray-300'
                        }`
                      : 'opacity-50 cursor-not-allowed text-gray-500'
                  )}
                  style={{ fontFamily: isPaidUser ? font : 'inherit' }}
                  disabled={!isPaidUser}>
                  <span>{font}</span>
                  {!isPaidUser && (
                    <LockClosedIcon className="ml-auto h-4 w-4" />
                  )}
                  {isPaidUser && (
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4',
                        font === selectedFont ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  )}
                </button>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default FontSelector
