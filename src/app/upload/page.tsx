"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Loader2, CheckCircle2, ArrowLeft, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useArtStore } from "@/lib/store";
import { uploadImageToStorage, insertArtwork } from "@/lib/artworks";
import Link from "next/link";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useArtStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("sketch");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.replace("/login?next=/upload");
    }
  }, [isAuthenticated, mounted, router]);

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return "Invalid file type. Please upload JPG, PNG, WebP, or GIF.";
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const err = validateFile(selected);
    if (err) {
      setFileError(err);
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFileError(null);
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(selected);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload image to Supabase Storage
      const imageUrl = await uploadImageToStorage(file, user.id, (pct) => {
        setUploadProgress(pct);
      });

      if (!imageUrl) {
        toast.error("Image upload failed. Please try again.");
        setIsUploading(false);
        return;
      }

      setUploadProgress(90);

      // 2. Save artwork metadata to Supabase DB
      const { data: artwork, error: insertError } = await insertArtwork({
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        category,
        user_id: user.id,
        artist_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
        artist_username: user.user_metadata?.full_name?.toLowerCase().replace(/\s+/g, "") || user.email?.split("@")[0] || "anon",
        artist_avatar: user.user_metadata?.avatar_url || "",
      });

      setUploadProgress(100);

      if (insertError || !artwork) {
        toast.error("Failed to save artwork", {
          description: insertError || "Database insert failed. Please check RLS policies.",
        });
        setIsUploading(false);
        return;
      }

      toast.success("Artwork uploaded successfully!", {
        description: `"${title}" is now live in the gallery.`,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        duration: 4000,
      });

      router.push("/gallery");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Something went wrong. Please try again.");
      setIsUploading(false);
    }
  };

  if (!mounted || !isAuthenticated) return null;

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-charcoal-900 rounded-3xl shadow-xl border border-warm-200 dark:border-charcoal-800 p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-8 border-b border-warm-100 dark:border-charcoal-800 pb-4">
            <h1 className="font-display font-semibold text-2xl text-charcoal-900 dark:text-warm-100">
              Upload Artwork
            </h1>
            <button
              type="submit"
              form="upload-form"
              disabled={isUploading || !file || !title.trim() || !!fileError}
              className="btn-primary py-2 px-6 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </span>
              ) : (
                "Publish"
              )}
            </button>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-charcoal-500 dark:text-charcoal-400 mb-1.5">
                <span>Uploading to cloud storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-warm-200 dark:bg-charcoal-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-terracotta to-[#D4A853] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="label-micro block">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your artwork a name"
                className="input-field text-lg font-medium"
                disabled={isUploading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div>
                <label className="label-micro block mb-2">Artwork Image *</label>
                <div
                  className="relative rounded-2xl overflow-hidden border-2 border-dashed transition-colors h-48 flex items-center justify-center bg-warm-50 dark:bg-charcoal-950/40"
                  style={{ borderColor: fileError ? "#ef4444" : previewUrl ? "transparent" : undefined }}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {/* File info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-charcoal-900/70 text-white text-xs px-3 py-1.5 flex justify-between items-center">
                        <span className="truncate max-w-[120px]">{file?.name}</span>
                        <span>{fileSizeMB}MB</span>
                      </div>
                      {/* Clear button */}
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10 shadow"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {/* Change image overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal-900/40 backdrop-blur-sm cursor-pointer">
                        <span className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-warm-100 text-xs font-medium px-4 py-2 rounded-full shadow-lg">
                          Change image
                        </span>
                        <input
                          type="file"
                          accept={ALLOWED_TYPES.join(",")}
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full hover:bg-warm-100 dark:hover:bg-charcoal-900 transition-colors rounded-xl relative">
                      <UploadCloud className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500" />
                      <div className="text-center px-4">
                        <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                          Click to upload
                        </p>
                        <p className="text-xs text-charcoal-400 mt-1">
                          JPG, PNG, WebP, GIF — max {MAX_SIZE_MB}MB
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_TYPES.join(",")}
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                    </div>
                  )}
                </div>

                {/* File error message */}
                {fileError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-red-500 text-xs mt-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {fileError}
                  </motion.p>
                )}
              </div>

              {/* Category + Description */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-micro block">Category *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "sketch", label: "Sketch" },
                      { value: "mandala", label: "Mandala" },
                    ].map((cat) => (
                      <label
                        key={cat.value}
                        className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                          category === cat.value
                            ? "bg-charcoal-900 border-charcoal-900 text-warm-100 dark:bg-warm-100 dark:border-warm-200 dark:text-charcoal-900 font-semibold shadow-sm"
                            : "border-warm-200 text-charcoal-600 hover:border-charcoal-300 dark:border-charcoal-800 dark:text-charcoal-400 dark:hover:border-charcoal-700 bg-white dark:bg-charcoal-950"
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={cat.value}
                          checked={category === cat.value}
                          onChange={() => setCategory(cat.value)}
                          className="sr-only"
                          disabled={isUploading}
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-micro block">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell the story behind this piece..."
                    className="input-field resize-none"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
