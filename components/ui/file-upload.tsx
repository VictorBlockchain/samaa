"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Image, Video, Mic, FileText, Check, AlertCircle } from "lucide-react"
import { formatFileSize } from "@/lib/storage"

interface FileUploadProps {
  accept: string
  maxSize?: number
  multiple?: boolean
  onFileSelect: (files: File[]) => void
  onUpload?: (files: File[]) => Promise<void>
  disabled?: boolean
  className?: string
  type?: 'image' | 'video' | 'audio' | 'any'
  placeholder?: string
}

interface UploadedFile {
  file: File
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export function FileUpload({
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
  onFileSelect,
  onUpload,
  disabled = false,
  className = "",
  type = 'any',
  placeholder
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getIcon = () => {
    switch (type) {
      case 'image':
        return Image
      case 'video':
        return Video
      case 'audio':
        return Mic
      default:
        return FileText
    }
  }

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    
    switch (type) {
      case 'image':
        return 'Drop images here or click to browse'
      case 'video':
        return 'Drop videos here or click to browse'
      case 'audio':
        return 'Drop audio files here or click to browse'
      default:
        return 'Drop files here or click to browse'
    }
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${formatFileSize(maxSize)}`
      }
    }

    const acceptedTypes = accept.split(',').map(t => t.trim())
    if (!acceptedTypes.some(acceptedType => {
      if (acceptedType.endsWith('/*')) {
        return file.type.startsWith(acceptedType.slice(0, -1))
      }
      return file.type === acceptedType
    })) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    return { valid: true }
  }

  const createPreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return undefined
  }

  const handleFileSelect = (selectedFiles: FileList) => {
    const newFiles: UploadedFile[] = []
    
    Array.from(selectedFiles).forEach(file => {
      const validation = validateFile(file)
      
      if (validation.valid) {
        newFiles.push({
          file,
          preview: createPreview(file),
          status: 'pending',
          progress: 0
        })
      } else {
        newFiles.push({
          file,
          status: 'error',
          progress: 0,
          error: validation.error
        })
      }
    })

    if (!multiple) {
      setFiles(newFiles.slice(0, 1))
      onFileSelect(newFiles.slice(0, 1).map(f => f.file))
    } else {
      setFiles(prev => [...prev, ...newFiles])
      onFileSelect(newFiles.map(f => f.file))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      onFileSelect(newFiles.map(f => f.file))
      return newFiles
    })
  }

  const handleUpload = async () => {
    if (!onUpload) return

    const validFiles = files.filter(f => f.status === 'pending')
    if (validFiles.length === 0) return

    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.status === 'pending' ? { ...f, status: 'uploading' as const } : f
    ))

    try {
      await onUpload(validFiles.map(f => f.file))
      
      // Update status to success
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f
      ))
    } catch (error) {
      // Update status to error
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { 
          ...f, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f
      ))
    }
  }

  const IconComponent = getIcon()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-indigo-400 bg-indigo-50' 
            : 'border-slate-300 hover:border-indigo-300 hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center ${
            isDragOver ? 'bg-indigo-100' : 'bg-slate-100'
          }`}>
            <IconComponent className={`w-8 h-8 ${
              isDragOver ? 'text-indigo-600' : 'text-slate-600'
            }`} />
          </div>

          <div>
            <p className="text-lg font-medium text-slate-700 font-queensides">
              {getPlaceholder()}
            </p>
            <p className="text-sm text-slate-500 font-queensides mt-1">
              Max file size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((uploadedFile, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg"
              >
                {/* Preview or Icon */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img 
                      src={uploadedFile.preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconComponent className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate font-queensides">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-slate-500 font-queensides">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.error && (
                    <p className="text-xs text-red-500 font-queensides">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'success' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Upload Button */}
            {onUpload && files.some(f => f.status === 'pending') && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleUpload}
                disabled={disabled}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-queensides"
              >
                Upload Files
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
