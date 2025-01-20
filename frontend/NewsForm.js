import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsForm.css'; // Import the CSS file

function NewsForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    // subcategory: '',
    // images: [], // An array of image files (not just filenames)
    publishDate: '',
    keywords: '',
    country: '',
    chemicals: '',
  });

  const [categories, setCategories] = useState([]); // For storing categories
  const [subcategories, setSubcategories] = useState([]); // For storing subcategories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/news/categories');
        setCategories(response.data); // Populate categories dynamically
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Unable to fetch categories. Please try again later.');
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories based on the selected category
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (formData.category) {
        try {
          const response = await axios.get(`http://localhost:8000/news/subcategories/${formData.category}`);
          setSubcategories(response.data); // Store subcategories in state
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      } else {
        setSubcategories([]); // Clear subcategories when no category is selected
      }
    };
    fetchSubcategories();
  }, [formData.category]); // Only run when category changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'images') {
      const files = Array.from(e.target.files);
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

      // Filter out invalid image files and store their names
      const validFiles = files.filter(file => validImageTypes.includes(file.type));

      if (validFiles.length !== files.length) {
        alert('Only JPEG, JPG, and PNG images are allowed.');
      }

      // Store image files (not filenames)
      setFormData({ ...formData, images: validFiles });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = new FormData();
    data.append('title', formData.title);
    data.append('category_id', formData.category);  // Send the selected category value
    // data.append('subcategory_id', formData.subcategory);  // Send the selected subcategory value
  
    // // Append actual files (if any)
    // formData.images.forEach((file) => {
    //   data.append('images', file); // Send the actual file data here
    // });
  
    data.append('publish_date', formData.publishDate);
    data.append('keywords', formData.keywords);
    data.append('country', formData.country);
    data.append('chemicals', formData.chemicals); // Assuming it's a comma-separated string
  
    try {
      await axios.post('http://localhost:8000/news/create', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('News added successfully');
      setFormData({
        title: '',
        category: '',
        // subcategory: '',
        // images: [],
        publishDate: '',
        keywords: '',
        country: '',
        chemicals: '',
      });
    } catch (error) {
      console.error(error.response?.data || error.message); // Log the backend error message for debugging
      alert('Successfully added News');
    }
  };
  

  return (
    <div className="news-form">
      <h2>Add News</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />

        {/* Category Dropdown */}
        <select
  name="category"
  value={formData.category}
  onChange={handleChange} // Update the category in the state
>
  <option value="">Select Category</option>
  {categories.map((category, index) => (
    <option key={index} value={category}>
      {category}
    </option>
  ))}
</select>

        {/* Subcategory Dropdown */}
        <select
          name="subcategory"
          value={formData.subcategory}
          onChange={handleChange}
          disabled={!formData.category} // Disable subcategory until a category is selected
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>

        {/* <input
          type="file"
          name="images"
          multiple
          onChange={handleChange}
        /> */}
        <input
          type="date"
          name="publishDate"
          value={formData.publishDate}
          onChange={handleChange}
        />
        <input
          type="text"
          name="keywords"
          placeholder="Keywords"
          value={formData.keywords}
          onChange={handleChange}
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
        />
        <input
          type="text"
          name="chemicals"
          placeholder="Chemicals (comma separated)"
          value={formData.chemicals}
          onChange={handleChange}
        />
        <button type="submit">Add News</button>
      </form>
    </div>
  );
}

export default NewsForm;
