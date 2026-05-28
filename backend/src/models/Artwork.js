import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['sketch', 'mandala', 'illustration', 'other'],
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexing for performance
artworkSchema.index({ artist: 1, createdAt: -1 });
artworkSchema.index({ category: 1, createdAt: -1 });

const Artwork = mongoose.model('Artwork', artworkSchema);
export default Artwork;
