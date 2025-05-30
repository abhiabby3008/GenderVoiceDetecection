// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

// Health check
app.get('/health', (req, res) => res.send('OK'));

// Gender endpoint
app.post('/api/detect-gender', upload.single('audio'), (req, res) => {
  console.log('🔔 Received request');
  if (!req.file) return res.status(400).json({ error: 'No file uploaded under key "audio".' });

  const audioPath = path.resolve(req.file.path);
  console.log('🐍 Spawning Python for', audioPath);

  const py = spawn('python', ['detect_gender.py', audioPath], { shell: true });
  let stdout = '', stderr = '';

  py.stdout.on('data', d => { stdout += d; console.log('🐍 Py stdout:', d.toString().trim()) });
  py.stderr.on('data', d => { stderr += d; console.error('🐍 Py stderr:', d.toString().trim()) });

  py.on('close', code => {
    console.log(`🐍 Py exited with ${code}`);
    fs.unlink(audioPath, () => { });

    if (code !== 0) return res.status(500).json({ error: stderr || 'Inference error' });

    try {
      const result = JSON.parse(stdout);
      console.log('⬅️ Sending:', result);
      return res.json(result);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON from Python', detail: stdout });
    }
  });

  // safety net
  setTimeout(() => {
    if (!res.headersSent) res.status(504).json({ error: 'Timeout' });
  }, 60000);
});

// *** CRITICAL: Make sure this is at the bottom! ***
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node API listening on port ${PORT}`));
