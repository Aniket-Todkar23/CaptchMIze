const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Giphy API Key
const GIPHY_API_KEY = "2rjciYoFCG2Hf5olBzHeGq7Y8townEkW";

// Categories for fetching GIFs
const categories = ["vehicles", "animals", "sports", "buildings", "cartoons", "actions"];

// Cache for storing used GIF IDs
const usedGifIds = new Set();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Function to get a random category
const getRandomCategory = () => categories[Math.floor(Math.random() * categories.length)];

// Function to fetch a new GIF while avoiding duplicates
const fetchNewGif = async (category) => {
  try {
    const response = await axios.get(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${category}&limit=10`
    );

    const gifList = response.data.data.filter((gif) => !usedGifIds.has(gif.id));

    if (gifList.length === 0) {
      // If no new GIFs are available for the category, clear the cache for the category
      usedGifIds.clear();
      return fetchNewGif(category);
    }

    const gifData = gifList[0]; // Pick the first unused GIF
    usedGifIds.add(gifData.id); // Add the GIF ID to the cache

    // Keep the cache size manageable by removing the oldest IDs
    if (usedGifIds.size > 50) {
      const [oldestId] = usedGifIds;
      usedGifIds.delete(oldestId);
    }

    return gifData;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching new GIF.");
  }
};
const availableTemplates = ["index", "captcha"];

// Route to fetch and display GIF captcha
app.get("/", async (req, res) => {
  try {
    const randomTemplate = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    if (randomTemplate === "index") {
      // Fetch data for index.ejs
      const category = getRandomCategory();
      const gifData = await fetchNewGif(category);
      const gifUrl = gifData.images.fixed_height.url;

      // Generate options (one correct and three incorrect)
      const correctAnswer = category;
      const options = [...categories.filter((cat) => cat !== category)];
      options.sort(() => 0.5 - Math.random());
      const allOptions = [correctAnswer, ...options.slice(0, 3)];
      allOptions.sort(() => 0.5 - Math.random());

      res.render("index", { gifUrl, correctAnswer, options: allOptions });
    } else if (randomTemplate === "captcha") {
      // Render captcha.ejs directly (no special data required)
      res.render("captcha");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the page. Please try again.");
  }
});




// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
