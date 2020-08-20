const express = require("express");
const axios = require("axios");

const router = express.Router();
// https://api.nasa.gov/planetary/apod?api_key=o50slHLqJd3LnaWMAegD0nN5q83KIAw7CicARCKX
const BASE_URL = "https://api.nasa.gov/insight_weather/?";

router.get("/", async (req, res, next) => {
  try {
    const params = new URLSearchParams({
      api_key: process.env.NASA_KEY,
      feedtype: "json",
      ver: "1.0",
    });
    console.log(`${BASE_URL}${params}`);
    // 1. make a request to nasa api
    const { data } = await axios.get(`${BASE_URL}${params}`);
    console.log(data);
    // 2. respond to this request with data from the NASA api
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
