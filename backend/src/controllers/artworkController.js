import Artwork from '../models/Artwork.js';

export const getArtworks = async (req, res, next) => {
  try {
    const { category, sort, limit = 20, page = 1 } = req.query;
    
    let query = { isPublished: true };
    if (category && category !== 'All') {
      query.category = category.toLowerCase();
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortQuery = { createdAt: -1 };
    if (sort === 'popular') {
      sortQuery = { likesCount: -1, createdAt: -1 };
    }

    const artworks = await Artwork.find(query)
      .populate('artist', 'name username avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Artwork.countDocuments(query);

    res.status(200).json({
      success: true,
      data: artworks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getArtworkById = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artist', 'name username bio avatar followers');
      
    if (!artwork) {
      const error = new Error('Artwork not found');
      error.status = 404;
      return next(error);
    }
    
    // Increment views (simple approach)
    artwork.views += 1;
    await artwork.save();

    res.status(200).json({
      success: true,
      data: artwork
    });
  } catch (err) {
    next(err);
  }
};
