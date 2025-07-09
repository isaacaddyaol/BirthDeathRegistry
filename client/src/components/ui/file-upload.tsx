import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, File, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  label: string;
  description?: string;
  required?: boolean;
}

export default function FileUpload({
  onFileSelect,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5,
  label,
  description,
  required = false
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
      />
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragOver
              ? 'border-gov-blue bg-blue-50'
              : 'border-gray-300 hover:border-gov-blue hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUpload className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
          </p>
          {description && (
            <p className="text-sm text-gov-gray mb-4">{description}</p>
          )}
          <Button type="button" className="bg-gov-blue hover:bg-blue-700 text-white">
            Choose File
          </Button>
          <p className="text-xs text-gov-gray mt-2">
            or drag and drop • Max {maxSize}MB
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="text-gov-green" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gov-gray">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}