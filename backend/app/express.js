const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Correct the path to the 'images' folder in the backend directory
const imageFolderPath = path.join(__dirname, 'images'); // Ensure this points to 'backend/app/images'


console.log('Serving images from:', imageFolderPath);

// Serve static files (images) from the 'images' folder
app.use('/images', express.static(imageFolderPath));  // '/images' will serve files from 'backend/app/images'


// Endpoint to list image files
app.get('/images', (_req, res) => {
  fs.readdir(imageFolderPath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading images directory.'); 
    }
    // Filter out non-image files (optional)
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
    res.json(imageFiles);  // Send list of image files
  });
});

// Start server
app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
