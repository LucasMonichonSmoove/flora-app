"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Camera, ImagePlus, RotateCcw, X } from "lucide-react";

const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onError: (message: string) => void;
}

function getRejectionMessage(rejections: FileRejection[]) {
  const errorCode = rejections[0]?.errors[0]?.code;
  if (errorCode === "file-too-large") {
    return "Cette image dépasse 10 Mo. Choisissez un fichier plus léger.";
  }
  return "Format non pris en charge. Choisissez une image JPEG ou PNG.";
}

export default function UploadZone({
  file,
  onFileSelect,
  onClear,
  onError,
}: UploadZoneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleClear() {
    setPreviewUrl(null);
    onClear();
  }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    noClick: true,
    onDropAccepted: (acceptedFiles) => {
      const acceptedFile = acceptedFiles[0];
      if (acceptedFile) {
        setPreviewUrl(URL.createObjectURL(acceptedFile));
        onFileSelect(acceptedFile);
      }
    },
    onDropRejected: (rejections) => onError(getRejectionMessage(rejections)),
  });

  if (file && previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-stone-100">
        <Image
          src={previewUrl}
          alt={`Aperçu de ${file.name}`}
          width={1200}
          height={800}
          unoptimized
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-4 pb-4 pt-10 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="mt-0.5 text-xs text-white/75">
              {(file.size / (1024 * 1024)).toFixed(1)} Mo
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={open}
              aria-label="Choisir une autre photo"
              className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30"
            >
              <RotateCcw size={17} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              aria-label="Supprimer la photo"
              className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <input {...getInputProps({ capture: "environment" })} />
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-8 text-center transition sm:min-h-72 ${
        isDragActive
          ? "border-emerald-500 bg-emerald-50"
          : "border-stone-200 bg-stone-50/80 hover:border-emerald-300 hover:bg-emerald-50/40"
      }`}
    >
      <input {...getInputProps({ capture: "environment" })} />
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
        {isDragActive ? (
          <ImagePlus size={25} aria-hidden="true" />
        ) : (
          <Camera size={25} aria-hidden="true" />
        )}
      </span>
      <p className="text-base font-semibold text-stone-800">
        {isDragActive ? "Déposez votre photo ici" : "Ajoutez une photo de plante"}
      </p>
      <p className="mt-1.5 max-w-xs text-sm leading-6 text-stone-500">
        Glissez-déposez une image ou choisissez-la depuis votre appareil photo.
      </p>
      <button
        type="button"
        onClick={open}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      >
        <ImagePlus size={17} aria-hidden="true" />
        Choisir une image
      </button>
      <p className="mt-3 text-xs text-stone-400">JPEG ou PNG · 10 Mo maximum</p>
    </div>
  );
}
