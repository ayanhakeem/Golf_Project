require('dotenv').config();
const mongoose = require('mongoose');
const Charity = require('./models/Charity');

const sampleCharities = [
  {
    name: "Save the Green Foundation",
    description: "Dedicated to preserving golf courses and local parks through sustainable lawn care and community involvement.",
    images: ["https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true
  },
  {
    name: "Clubs for Kids",
    description: "Providing golf equipment and professional coaching to underprivileged youth to build character and community.",
    images: ["https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true
  },
  {
    name: "Heart of the Fairway",
    description: "Raising funds for cardiac research through international golf tournaments and member donations.",
    images: ["https://images.unsplash.com/photo-1623519107389-992ca2ac299c?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");
    
    // Clear existing charities to avoid duplicates if reset is needed
    await Charity.deleteMany({});
    console.log("Cleared existing charities.");
    
    await Charity.insertMany(sampleCharities);
    console.log("Sample charities seeded successfully!");
    
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
