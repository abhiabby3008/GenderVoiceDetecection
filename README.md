# Voice Gender Recognition API (Backend)

This repository contains the backend service for **Voice Gender Recognition**. It provides a simple HTTP API endpoint that accepts an uploaded WAV audio file and returns a gender prediction using a Hugging Face Wav2Vec2-based model.

---

## 🔍 Overview

* **Node.js / Express**

  * Exposes a REST endpoint (`POST /api/detect-gender`) to accept an audio file under the `audio` form‑data key.
  * Temporarily saves the uploaded file, spawns a Python process to run inference, and returns the JSON result.
  * Automatically deletes the uploaded file after processing.

* **Python (Librosa & Transformers)**

  * Implements `detect_gender.py`, which loads the Hugging Face pipeline
    `alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech` to perform gender classification.
  * Reads the uploaded WAV file, performs inference, and prints a JSON array like:

    ```json
    [
      { "score": 0.9987, "label": "male" },
      { "score": 0.0013, "label": "female" }
    ]
    ```

---

## 📋 Prerequisites

1. **Node.js** (v14+) and **npm**
2. **Python 3.8+** with `pip`
3. (Optional, but recommended) **FFmpeg** installed on your system for robust audio decoding

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/voice-gender-backend.git
cd voice-gender-backend
```

### 2. Set up the Python environment

1. Create and activate a virtual environment:

   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\activate
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

   **`requirements.txt`** should include:

   ```
   torch
   librosa
   soundfile
   transformers
   ```

### 3. Install Node.js dependencies

```bash
npm install express multer cors mime-types
```

---

## 🚀 Running the Service

1. **Start the Node.js server**:

   ```bash
   node server.js
   ```

   You should see:

   ```
   Node API listening on port 3000
   ```

2. **Health Check** (optional):

   ```bash
   curl http://localhost:3000/health
   # → OK
   ```

3. **Test the `/api/detect-gender` endpoint**:

   ```bash
   curl -X POST http://localhost:3000/api/detect-gender \
     -F audio=@"/path/to/your/sample.wav"
   ```

   Example JSON response:

   ```json
   [
     { "score": 0.9987, "label": "male" },
     { "score": 0.0013, "label": "female" }
   ]
   ```

---

## 📂 Directory Structure

```
voice-gender-backend/
├── detect_gender.py      # Python inference script
├── requirements.txt      # Python dependencies
├── server.js             # Node.js/Express server
├── package.json          # Node.js project file
├── uploads/              # Temporary upload folder (auto‑created by Multer)
└── README.md             # This file
```

---

## 📖 File Descriptions

### `server.js`

* Sets up an Express server with CORS enabled.
* `POST /api/detect-gender`:

  1. Uses Multer (`multer({ dest: 'uploads/' })`) to accept a single file under key `audio`.
  2. Logs the request and detected MIME type (based on `req.file.originalname`).
  3. Spawns a child process to run `python detect_gender.py <uploadedFilePath>`.
  4. Collects stdout/stderr, deletes the uploaded file after inference, and returns JSON.
  5. Times out with 504 if inference takes longer than 60 s.

### `detect_gender.py`

* Loads the Hugging Face pipeline:

  ```python
  from transformers import pipeline

  classifier = pipeline(
      "audio-classification",
      model="alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech"
  )
  ```
* Reads the file using `librosa.load(path, sr=None, mono=True)`.
* Handles CPU-only inference by default.
* Prints a JSON array of `{ "score": float, "label": "male"/"female" }`.
* Example usage:

  ```bash
  python detect_gender.py uploads/sample.wav
  ```

---

## 💡 Usage Examples

### Using `curl`

```bash
curl -X POST http://localhost:3000/api/detect-gender \
  -F audio=@"/absolute/path/to/audio.wav"
```

### Using Postman

1. Create a new `POST` request to `http://localhost:3000/api/detect-gender`.
2. Under **Body** → **form-data**, add a key named `audio` and set its type to **File**.
3. Select your `.wav` file.
4. **Send** → you should see a JSON response with gender scores.

---

## 🚧 Troubleshooting

* **MIME type prints as `false`**

  * Ensure you use `req.file.originalname` so `mime.lookup()` can detect `.wav`.
* **Python errors on loading audio**

  * Confirm your WAV is valid (mono, 16 kHz PCM).
  * Install FFmpeg so `audioread` fallback works:

    ```bash
    # On macOS (using Homebrew)
    brew install ffmpeg

    # On Ubuntu/Debian
    sudo apt-get install ffmpeg
    ```
* **Timeout errors**

  * The default timeout is 60 s. For larger files, either increase the timeout in `server.js` or record shorter clips.

---

## 🤝 Credits

* **Hugging Face Model**
  We use the public pipeline:
  [`alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech`](https://huggingface.co/alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech).

  ```text
  classifier = pipeline(
    "audio-classification",
    model="alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech"
  )
  ```

* **Librosa & SoundFile**
  For audio loading and decoding:

  * [https://github.com/librosa/librosa](https://github.com/librosa/librosa)
  * [https://github.com/bastibe/python-soundfile](https://github.com/bastibe/python-soundfile)

* **Express & Multer**
  For HTTP server and file uploads:

  * [https://expressjs.com/](https://expressjs.com/)
  * [https://github.com/expressjs/multer](https://github.com/expressjs/multer)

---


