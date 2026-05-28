"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useArtStore } from "@/lib/store";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export function UploadModal({ isOpen, onClose, defaultCategory = "sketch" }: UploadModalProps) {
  const addArtwork = useArtStore((state) => state.addArtwork);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // base64 data URL
  const [isUploading, setIsUploading] = useState(false);

  // Convert file → base64 data URL so it survives page refreshes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory(defaultCategory);
    setFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file || !previewUrl) return;

    setIsUploading(true);

    setTimeout(() => {
      addArtwork({
        title,
        description,
        category,
        imageUrl: previewUrl, // base64 — persists across refreshes
      });

      setIsUploading(false);
      handleClose();

      toast.success("Your artwork has been uploaded!", {
        description: `"${title}" is now live in the ${category === "mandala" ? "Mandala" : "Sketches"} section.`,
        icon: <CheckCircle2 className="w-5 h-5 text-accent-sage" />,
        duration: 4000,
      });
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-charcoal-950/50 backdrop-blur-sm z-50"
          />

          {/* Modal — full flex column, footer always pinned at bottom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-white dark:bg-charcoal-900 rounded-3xl shadow-2xl border border-warm-200 dark:border-charcoal-800 z-[60] flex flex-col"
            style={{ maxHeight: "92vh" }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200 dark:border-charcoal-800 flex-shrink-0">
              <h2 className="font-display font-semibold text-lg text-charcoal-900 dark:text-warm-100">
                Upload Artwork
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  form="upload-form"
                  disabled={isUploading || !file || !title.trim()}
                  className="btn-primary py-1.5 px-5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading
                    </span>
                  ) : (
                    "Publish"
                  )}
                </button>
                <button
                  onClick={handleClose}
                  type="button"
                  className="p-1.5 rounded-full text-charcoal-500 hover:text-charcoal-900 hover:bg-warm-100 dark:text-charcoal-400 dark:hover:text-warm-100 dark:hover:bg-charcoal-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <form id="upload-form" onSubmit={handleSubmit}>
                <div className="p-6 space-y-5">

                  {/* Image Upload Zone */}
                  <div>
                    <label className="label-micro block mb-2">Artwork Image *</label>
                    <div
                      className="relative rounded-2xl overflow-hidden border-2 border-dashed transition-colors"
                      style={{
                        borderColor: previewUrl ? "transparent" : undefined,
                      }}
                    >
                      {previewUrl ? (
                        /* Preview */
                        <div className="relative w-full bg-warm-100 dark:bg-charcoal-800 rounded-2xl overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-h-56 object-contain"
                          />
                          {/* Change image button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-charcoal-900/30 cursor-pointer">
                            <span className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-warm-100 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                              Change image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Drop zone */
                        <div className="border-2 border-dashed border-warm-300 dark:border-charcoal-700 rounded-2xl bg-warm-50 dark:bg-charcoal-950/40 hover:border-charcoal-400 dark:hover:border-charcoal-500 hover:bg-warm-100 dark:hover:bg-charcoal-900 transition-colors flex flex-col items-center justify-center py-10 gap-3 cursor-pointer">
                          <UploadCloud className="w-10 h-10 text-charcoal-300 dark:text-charcoal-600" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                              Click to choose an image
                            </p>
                            <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-0.5">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                    {file && (
                      <p className="text-xs text-accent-sage mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {file.name}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="label-micro block">Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your artwork a name"
                      className="input-field"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="label-micro block">Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell the story behind this piece..."
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="label-micro block">Category *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "sketch", label: "Sketch / Drawing" },
                        { value: "mandala", label: "Mandala Art" },
                      ].map((cat) => (
                        <label
                          key={cat.value}
                          className={`flex items-center justify-center p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                            category === cat.value
                              ? "bg-charcoal-900 border-charcoal-900 text-warm-100 dark:bg-warm-100 dark:border-warm-200 dark:text-charcoal-900 font-semibold"
                              : "border-warm-300 text-charcoal-600 hover:border-charcoal-400 dark:border-charcoal-700 dark:text-charcoal-400 dark:hover:border-charcoal-500"
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={category === cat.value}
                            onChange={() => setCategory(cat.value)}
                            className="sr-only"
                          />
                          <span className="text-sm">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
