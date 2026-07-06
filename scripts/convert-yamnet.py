"""
Downloads YAMNet from TF Hub, converts to ONNX, then quantizes to INT8.
Output: public/models/yamnet_q8.onnx (~30-50 MB vs ~250 MB full precision)

Requirements:
    pip install tensorflow tensorflow-hub tf2onnx onnx onnxruntime

Usage:
    cd frontend
    python scripts/convert-yamnet.py
"""

import os
import sys
import tempfile
import subprocess

OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__), '..', '..', 'public', 'models', 'yamnet_q8.onnx'
)
FULL_ONNX_PATH = os.path.join(tempfile.gettempdir(), 'yamnet_full.onnx')

os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_PATH)), exist_ok=True)

try:
    import tensorflow as tf
    import tensorflow_hub as hub
    import tf2onnx
    import onnx
    from onnxruntime.quantization import quantize_dynamic, QuantType
except ImportError as e:
    print(f"MISSING_DEPS: {e}")
    print("Install: pip install tensorflow tensorflow-hub tf2onnx onnx onnxruntime")
    sys.exit(2)

# ── Step 1: Download YAMNet and export as SavedModel ──────────────────────────
print("Loading YAMNet from TensorFlow Hub...")
yamnet = hub.load('https://tfhub.dev/google/yamnet/1')


class YAMNetScores(tf.Module):
    """Exposes only the scores output (shape [F, 521])."""

    def __init__(self, model):
        self._model = model

    @tf.function(input_signature=[
        tf.TensorSpec(shape=[None], dtype=tf.float32, name='waveform')
    ])
    def __call__(self, waveform):
        scores, _embeddings, _spectrogram = self._model(waveform)
        return scores


wrapper = YAMNetScores(yamnet)

tmpdir = tempfile.mkdtemp(prefix='yamnet_saved_')
print(f"Saving TF SavedModel to {tmpdir}...")
tf.saved_model.save(wrapper, tmpdir)

# ── Step 2: Convert SavedModel → ONNX (opset 13) ─────────────────────────────
print("Converting SavedModel → ONNX...")
result = subprocess.run(
    [sys.executable, '-m', 'tf2onnx.convert',
     '--saved-model', tmpdir,
     '--output', FULL_ONNX_PATH,
     '--opset', '13'],
    capture_output=True, text=True
)
if result.stdout:
    sys.stdout.write(result.stdout)
if result.stderr:
    sys.stderr.write(result.stderr)
if result.returncode != 0:
    print(f"tf2onnx failed with code {result.returncode}", file=sys.stderr)
    sys.exit(1)

# ── Step 3: Quantize ONNX → INT8 ─────────────────────────────────────────────
print(f"Quantizing to INT8 → {OUTPUT_PATH}...")
quantize_dynamic(
    FULL_ONNX_PATH,
    OUTPUT_PATH,
    weight_type=QuantType.QInt8,
)

size_mb = os.path.getsize(OUTPUT_PATH) / 1_000_000
print(f"OK: {OUTPUT_PATH} ({size_mb:.1f} MB)")
