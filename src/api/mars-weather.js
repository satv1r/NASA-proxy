const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

const limiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 10, // limit each IP to 2 requests per windowMs
});

const speedLimiter = slowDown({
  windowMs: 30 * 1000, // 30 seconds
  delayAfter: 1, // allow 100 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 100:
  // request # 101 is delayed by  500ms
  // request # 102 is delayed by 1000ms
  // request # 103 is delayed by 1500ms
  // etc.
});

const router = express.Router();
// https://api.nasa.gov/planetary/apod?api_key=o50slHLqJd3LnaWMAegD0nN5q83KIAw7CicARCKX
const BASE_URL = "https://api.nasa.gov/insight_weather/?";

let cachedData;
let cacheTime;

router.get("/", limiter, speedLimiter, async (req, res, next) => {
  // In memory cache
  if (cacheTime && cacheTime > Date.now() - 60 * 15 * 1000) {
    return res.json(cachedData);
  }
  try {
    const params = new URLSearchParams({
      api_key: process.env.NASA_KEY,
      feedtype: "json",
      ver: "1.0",
    });
    // 1. make a request to nasa api
    const { data } = await axios.get(`${BASE_URL}${params}`);
    // 2. store data in cache and update cache time
    cachedData = data;
    cacheTime = Date.now();
    data.cacheTime = cacheTime;
    // 3. respond to request with data
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
