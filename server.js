require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS settings
const allowedOrigins = [
  "http://localhost:8080",
  "https://liferay.co.jp",
  "https://www.liferay.co.jp",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },

  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "bypass-tunnel-reminder"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "5mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 要約API
app.post("/summarize", cors(corsOptions), async (req, res) => {
  try {
    const { message, blogContents } = req.body;

    if (!blogContents) {
      return res.status(400).json({
        error: "blogContents is required",
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: message,
        },
        {
          role: "user",
          content: blogContents,
        },
      ],
      temperature: 0.3,
    });

    const summary = response.choices[0].message.content;

    res.json({
      mainPoints: summary,
    });
  } catch (error) {
    console.error("OpenAI Error:", error);

    res.status(500).json({
      error: "Failed to summarize",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy Server Started`);
  console.log(`http://localhost:${PORT}`);
});
