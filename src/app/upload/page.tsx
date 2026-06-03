"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useArtStore } from "@/lib/store";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, addArtwork } = useArtStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("sketch");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !isAuthenticated) {
      router.replace("/login?next=/upload");
    }
  }, [isAuthenticated, mounted, router]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file || !previewUrl) return;

    setIsUploading(true);

    setTimeout(() => {
      addArtwork({
        title,
        description,
        category,
        imageUrl: previewUrl,
      });

      setIsUploading(false);

      toast.success("Artwork uploaded successfully!", {
        description: `"${title}" is now live in the gallery.`,
        icon: <CheckCircle2 className="w-5 h-5 text-accent-sage" />,
        duration: 4000,
      });
      
      router.push("/dashboard");
    }, 1500);
  };

  if (!mounted || !isAuthenticated) return null; // Wait for auth check

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-warm-100 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
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
              disabled={isUploading || !file || !title.trim()}
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

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title (Moved Higher) */}
            <div className="space-y-2">
              <label className="label-micro block">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your artwork a name"
                className="input-field text-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image Upload (Reduced Height) */}
              <div>
                <label className="label-micro block mb-2">Artwork Image *</label>
                <div
                  className="relative rounded-2xl overflow-hidden border-2 border-dashed transition-colors h-48 flex items-center justify-center bg-warm-50 dark:bg-charcoal-950/40"
                  style={{
                    borderColor: previewUrl ? "transparent" : undefined,
                  }}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal-900/40 backdrop-blur-sm cursor-pointer">
                        <span className="bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-warm-100 text-xs font-medium px-4 py-2 rounded-full shadow-lg">
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
                    <div className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full hover:bg-warm-100 dark:hover:bg-charcoal-900 transition-colors rounded-xl border-warm-300 dark:border-charcoal-700 hover:border-charcoal-400">
                      <UploadCloud className="w-8 h-8 text-charcoal-400 dark:text-charcoal-500" />
                      <div className="text-center px-4">
                        <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                          Click to upload
                        </p>
                        <p className="text-xs text-charcoal-400 mt-1">
                          PNG, JPG up to 10MB
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
              </div>

              {/* Right Column: Category & Description */}
              <div className="space-y-6">
                {/* Category */}
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
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="label-micro block">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell the story behind this piece..."
                    className="input-field resize-none"
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
