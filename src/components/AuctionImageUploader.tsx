'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, CheckCircle, XCircle, Info } from 'lucide-react';

interface AuctionImageUploaderProps {
  onUpload: (imageUrls: string[]) => void;
}

const AuctionImageUploader: React.FC<AuctionImageUploaderProps> = ({ onUpload }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const UPLOADIMG = process.env.NEXT_PUBLIC_UPLOAD_API || '/api/upload';

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG and PNG allowed.');
      return false;
    }
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB per image.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processNewFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processNewFiles(files);
  };

  const processNewFiles = (files: File[]) => {
    setError(null);
    const validFiles = files.filter(validateFile);

    if (validFiles.length + images.length > 5) {
      setError('You can upload up to 5 images total.');
      return;
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    uploadFiles(validFiles);
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append('files', file));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOADIMG, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.urls) {
          onUpload([...uploadedUrls, ...response.urls]);
          setUploadedUrls((prev) => [...prev, ...response.urls]);
          setProgress(0);
        } else {
          setError('Unexpected server response.');
        }
      } else {
        setError('Upload failed: ' + xhr.responseText);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError('An error occurred during the upload.');
    };

    xhr.send(formData);
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg w-full">
      <h2 className="text-xl text-center font-semibold mb-2">Upload Images</h2>
      <p className="text-xs text-center text-gray-500 mb-4 flex items-center justify-center gap-1">
        <Info className="w-4 h-4" /> Max 5 images; JPG/PNG only; 5MB each
      </p>

      <div
        className="border-2 border-dashed p-6 rounded-lg bg-gray-50 mb-4 flex flex-col items-center justify-center hover:bg-gray-100 transition cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-10 h-10 text-gray-500 mb-2" />
        <p className="text-sm sm:text-base text-center text-gray-600 font-medium">
          Drag & Drop or Click to Upload
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/jpeg,image/png"
          multiple
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {previews.map((src, idx) => (
            <div
              key={idx}
              className="relative w-full h-24 sm:h-60 rounded-lg overflow-hidden bg-gray-100 border"
            >
              <Image
                src={src}
                alt={`Preview ${idx + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
              {uploadedUrls[idx] && (
                <CheckCircle className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-0.5 w-6 h-6" />
              )}
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="mt-4 text-center">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-center">
              <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">
                Uploading {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-200 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 text-sm flex items-center justify-center">
          <XCircle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}
    </div>
  );
};

export default AuctionImageUploader;
