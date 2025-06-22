const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// In-memory database (use a real DB for production)
let urls = [];
let idCounter = 1;

// Serve homepage (optional)
app.get('/', (req, res) => {
  res.send('URL Shortener Microservice');
});

// POST: Shorten URL
app.post('/api/shorturl', (req, res) => {
  let inputUrl = req.body.url;

  // Validate format
  try {
    let urlObject = new URL(inputUrl);
    dns.lookup(urlObject.hostname, (err, address) => {
      if (err || !address) {
        return res.json({ error: 'invalid url' });
      }

      // Save and return short URL
      let existing = urls.find(entry => entry.original_url === inputUrl);
      if (existing) {
        return res.json({ original_url: existing.original_url, short_url: existing.short_url });
      }

      const newEntry = {
        original_url: inputUrl,
        short_url: idCounter++
      };
      urls.push(newEntry);
      res.json(newEntry);
    });
  } catch {
    return res.json({ error: 'invalid url' });
  }
});

// GET: Redirect to original URL
app.get('/api/shorturl/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const found = urls.find(entry => entry.short_url === id);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for given input' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
