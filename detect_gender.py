# detect_gender.py

import sys
import json
import librosa
import numpy as np
from transformers import pipeline
import mimetypes

# load the Hugging Face pipeline once
classifier = pipeline(
    "audio-classification",
    model="alefiury/wav2vec2-large-xlsr-53-gender-recognition-librispeech"
)

def main(audio_path):
    
    # load audio via librosa
    waveform, sample_rate = librosa.load(audio_path, sr=None, mono=True)
    # run inference
    result = classifier({
        "array": waveform.astype(np.float32),
        "sampling_rate": sample_rate
    })
    # output JSON to stdout
    print(json.dumps(result))
    # print(" File received:", audio_path)
    # print(" Detected MIME type:", mimetypes.guess_type(audio_path))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python detect_gender.py <audio-file-path>", file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])
