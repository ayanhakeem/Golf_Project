const Charity = require('../models/Charity');
const cloudinary = require('../config/cloudinary');

/**
 * GET /api/charities
 * Public — list all active charities with optional search/filter
 */
const getCharities = async (req, res) => {
  const { search, featured, page = 1, limit = 12 } = req.query;
  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (featured === 'true') {
    query.isFeatured = true;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [charities, total] = await Promise.all([
    Charity.find(query).skip(skip).limit(Number(limit)).sort({ isFeatured: -1, createdAt: -1 }),
    Charity.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    charities,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
};

/**
 * GET /api/charities/featured
 */
const getFeaturedCharities = async (req, res) => {
  const charities = await Charity.find({ isActive: true, isFeatured: true }).limit(6);
  return res.status(200).json({ success: true, charities });
};

/**
 * GET /api/charities/:id
 */
const getCharityById = async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity) {
    return res.status(404).json({ success: false, message: 'Charity not found' });
  }
  return res.status(200).json({ success: true, charity });
};

/**
 * POST /api/charities — Admin
 */
const createCharity = async (req, res) => {
  const { name, description, isFeatured, events } = req.body;
  const images = req.files ? req.files.map((f) => f.path) : [];

  const charity = await Charity.create({
    name,
    description,
    images,
    isFeatured: isFeatured === 'true',
    events: events ? JSON.parse(events) : [],
  });

  return res.status(201).json({ success: true, message: 'Charity created', charity });
};

/**
 * PUT /api/charities/:id — Admin
 */
const updateCharity = async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity) {
    return res.status(404).json({ success: false, message: 'Charity not found' });
  }

  const { name, description, isFeatured, isActive, events } = req.body;
  if (name) charity.name = name;
  if (description) charity.description = description;
  if (isFeatured !== undefined) charity.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (isActive !== undefined) charity.isActive = isActive === 'true' || isActive === true;
  if (events) charity.events = JSON.parse(events);

  // Append newly uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => f.path);
    charity.images = [...charity.images, ...newImages];
  }

  await charity.save();
  return res.status(200).json({ success: true, message: 'Charity updated', charity });
};

/**
 * DELETE /api/charities/:id — Admin
 */
const deleteCharity = async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity) {
    return res.status(404).json({ success: false, message: 'Charity not found' });
  }

  // Delete images from Cloudinary
  for (const imageUrl of charity.images) {
    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  await charity.deleteOne();
  return res.status(200).json({ success: true, message: 'Charity deleted' });
};

module.exports = { getCharities, getFeaturedCharities, getCharityById, createCharity, updateCharity, deleteCharity };
