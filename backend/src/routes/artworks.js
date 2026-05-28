import express from 'express';
import { getArtworks, getArtworkById } from '../controllers/artworkController.js';

const router = express.Router();

// GET /api/artworks
router.get('/', getArtworks);

// GET /api/artworks/:id
router.get('/:id', getArtworkById);

export default router;
