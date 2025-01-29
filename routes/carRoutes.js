const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Car = require('../models/Car');
const authMiddleware = require('../middleware/auth.js');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cars', // The folder in cloudinary where images will be stored
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optional: resize images
    }
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });

// Create a new car with images
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
    const { title, description, tags } = req.body;
    const images = req.files ? req.files.map(file => file.path) : [];

    try {
        const newCar = new Car({
            title,
            description,
            tags,
            images, // Cloudinary URLs will be stored automatically
            user: req.user.id
        });

        await newCar.save();
        res.status(201).json(newCar);
    } catch (error) {
        console.error('Error creating car:', error);
        res.status(500).json({ error: 'Error creating car' });
    }
});

// Update a car's details with new images
router.put("/:id", authMiddleware, upload.array("newImages", 10), async (req, res) => {
    const { title, description, tags, existingImages } = req.body;
    let updateData = { title, description, tags };
  
    try {
      const existingCar = await Car.findOne({ _id: req.params.id, user: req.user.id });
      if (!existingCar) return res.status(404).json({ error: "Car not found" });
  
      // Preserve specified existing images
      updateData.images = JSON.parse(existingImages || "[]");
  
      // Add new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map((file) => file.path);
        updateData.images = [...updateData.images, ...newImageUrls];
      }
  
      const updatedCar = await Car.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        updateData,
        { new: true }
      );
  
      res.status(200).json(updatedCar);
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({ error: "Error updating car" });
    }
  });
  

// Delete a car and its images
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const car = await Car.findOne({ _id: req.params.id, user: req.user.id });
        if (!car) return res.status(404).json({ error: 'Car not found' });

        // Delete images from Cloudinary
        for (const imageUrl of car.images) {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`cars/${publicId}`);
        }

        // Delete the car document
        await Car.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ error: 'Error deleting car' });
    }
});

// Get all cars for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const cars = await Car.find({ user: req.user.id });
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching cars' });
    }
});

// Get a specific car by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const car = await Car.findOne({ _id: req.params.id, user: req.user.id });
        if (!car) return res.status(404).json({ error: 'Car not found' });
        res.status(200).json(car);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching car' });
    }
});

module.exports = router;

// Swagger Documentation
/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Endpoints for managing cars and their associated images
 */

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car with images
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the car
 *                 example: Tesla Model X
 *               description:
 *                 type: string
 *                 description: Description of the car
 *                 example: Fully electric luxury SUV
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with the car
 *                 example: ["electric", "luxury"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Car images to upload
 *     responses:
 *       201:
 *         description: Car created successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update car details with new images
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the car to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the car
 *                 example: Updated Tesla Model X
 *               description:
 *                 type: string
 *                 description: Description of the car
 *                 example: Updated description
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags associated with the car
 *                 example: ["updated", "luxury"]
 *               newImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New car images to upload
 *               existingImages:
 *                 type: string
 *                 description: JSON string of existing image URLs to retain
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       404:
 *         description: Car not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete a car and its images
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the car to delete
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       404:
 *         description: Car not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars for the authenticated user
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of cars
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get a specific car by ID
 *     tags: [Cars]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the car to retrieve
 *     responses:
 *       200:
 *         description: Car details
 *       404:
 *         description: Car not found
 *       500:
 *         description: Internal server error
 */

