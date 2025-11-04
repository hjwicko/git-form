import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const { title, description, pr, schemas, secret } = req.body;

  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).send('Forbidden: Invalid secret');
  }

  try {
    await axios.post(
      `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/dispatches`,
      {
        event_type: 'create-adr-issue',
        client_payload: {
          title,
          description,
          pr,
          schemas
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json'
        }
      }
    );

    res.status(200).send('Issue creation triggered');
  } catch (error) {
    console.error('GitHub dispatch error:', error.response?.data || error.message);
    res.status(500).send('Failed to trigger GitHub Action');
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server running on http://localhost:${PORT}`);
});
