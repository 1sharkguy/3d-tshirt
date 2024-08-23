import express from 'express';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.route('/').get((req, res) => {
  res.status(200).json({ message: "Hello from DALL.E ROUTES" })
})

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt,
      response_format: 'b64_json'
    });

    if (response && response.data && response.data.length > 0) {
      const image = response.data[0].b64_json;
      res.status(200).json({ photo: image });
    } else {
      console.error('Invalid response format:');
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;