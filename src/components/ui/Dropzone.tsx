'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon } from 'lucide-react'

interface DropzoneProps {
  onFileSelect: (file?: File) => void
  loading?: boolean
  disabled?: boolean
  disabledMessage?: string
}

export default function Dropzone({
  onFileSelect,
  loading = false,
  disabled = false,
  disabledMessage = 'Upload disabled',
}: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [
        '.jpeg',
        '.jpg',
        '.png',
        '.gif',
        '.bmp',
        '.webp',
        '.svg',
        '.tiff',
        '.tif',
        '.ico',
        '.avif',
        '.heic',
        '.heif',
      ],
    },
    multiple: false,
    disabled: loading || disabled,
    maxSize: undefined, // Remove file size limit
    minSize: 0, // Allow any file size
    validator: (file) => {
      // Custom validator to accept all image resolutions
      if (!file.type.startsWith('image/')) {
        return {
          code: 'file-invalid-type',
          message: 'File must be an image',
        }
      }
      return null // Accept all image files regardless of size or resolution
    },
  })

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
        ${
          disabled
            ? 'border-red-500/50 bg-red-500/10 cursor-not-allowed opacity-75'
            : loading
            ? 'cursor-not-allowed opacity-50 border-gray-600 bg-white/5'
            : isDragActive
            ? 'border-emerald-400 bg-emerald-500/10 cursor-pointer'
            : 'border-gray-600 hover:border-gray-500 bg-white/5 cursor-pointer'
        }
      `}>
      <input {...getInputProps()} />

      <div className="flex flex-col items-center space-y-4">
        {disabled ? (
          <>
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500/20">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">
                Upload Disabled
              </h3>
              <p className="text-gray-400 mb-4">{disabledMessage}</p>
              <div className="text-sm text-red-400">
                Upgrade to Pro to continue creating images
              </div>
            </div>
          </>
        ) : loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
            <div className="text-white text-lg font-medium">Processing...</div>
            <div className="text-gray-400 text-sm">Removing background...</div>
          </>
        ) : (
          <>
            <div
              className={`
              w-20 h-20 rounded-full flex items-center justify-center transition-colors
              ${isDragActive ? 'bg-emerald-500/20' : 'bg-gray-700/50'}
            `}>
              {isDragActive ? (
                <Upload className="w-10 h-10 text-emerald-400" />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isDragActive ? 'Drop your image here' : 'Upload an image'}
              </h3>
              <p className="text-gray-400 mb-4">
                {isDragActive
                  ? 'Release to upload'
                  : 'Drag and drop an image, or click to browse'}
              </p>
              <div className="text-sm text-gray-500">
                Supports: JPG, PNG, GIF, WebP, SVG, TIFF, BMP, AVIF, HEIC, ICO •
                Any resolution • No size limit
              </div>
            </div>

            {!isDragActive && (
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                Choose File
              </button>
            )}
          </>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gray-600 rounded-tl-lg opacity-50"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gray-600 rounded-tr-lg opacity-50"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gray-600 rounded-bl-lg opacity-50"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gray-600 rounded-br-lg opacity-50"></div>
    </div>
  )
}
