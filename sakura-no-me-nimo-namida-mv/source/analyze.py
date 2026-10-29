# Tempo / loudness analysis used to build audio.js  (pip install librosa)
import librosa, numpy as np, json
y, sr = librosa.load('song.mp3', sr=22050, mono=True)
dur = len(y) / sr
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
onset_env = librosa.onset.onset_strength(y=y, sr=sr)
times = librosa.times_like(onset_env, sr=sr)
rms = librosa.feature.rms(y=y)[0]
rt = librosa.times_like(rms, sr=sr)
grid = np.arange(0, dur, 0.1)
r = np.interp(grid, rt, rms); r = r / r.max()
o = np.interp(grid, times, onset_env); o = o / np.percentile(o, 99)
d = {'dur': dur, 'tempo': float(np.atleast_1d(tempo)[0]), 'beats': [round(float(b), 3) for b in beats],
     'rms': [round(float(v), 3) for v in r], 'onset': [round(float(min(v, 2)), 3) for v in o]}
open('audio.js', 'w').write('window.AUDIO=' + json.dumps(d) + ';')
