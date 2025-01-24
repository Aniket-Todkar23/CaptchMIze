const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuration
const GIPHY_API_KEY = "2rjciYoFCG2Hf5olBzHeGq7Y8townEkW";
const categories = ["vehicles", "animals", "sports", "buildings", "cartoons", "actions"];
const usedGifIds = new Set();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const getRandomCategory = () => categories[Math.floor(Math.random() * categories.length)];

const fetchNewGif = async (category) => {
  try {
    const response = await axios.get(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${category}&limit=10`
    );
    
    const gifList = response.data.data.filter((gif) => !usedGifIds.has(gif.id));
    
    if (gifList.length === 0) {
      usedGifIds.clear();
      return fetchNewGif(category);
    }
    
    const gifData = gifList[0];
    usedGifIds.add(gifData.id);
    
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

app.get("/getCaptchaData", async (req, res) => {
  try {
    const category = getRandomCategory();
    const gifData = await fetchNewGif(category);
    const gifUrl = gifData.images.fixed_height.url;
    const options = [...categories.filter((cat) => cat !== category)]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    res.json({
      gifUrl,
      correctAnswer: category,
      options: [category, ...options].sort(() => 0.5 - Math.random())
    });
  } catch (error) {
    res.status(500).json({ error: "Error generating CAPTCHA" });
  }
});

app.get("/", (req, res) => {
  res.render("dynamic");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});