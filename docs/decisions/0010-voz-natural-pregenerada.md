# 0010. Natural voice pre-generated offline with Qwen3-TTS

- Status: accepted
- Date: 2026-11-22
- Proposed by: AI tool, from the owner's request for a natural, free voice
- Accepted by: owner, on 2026-11-22 (offline generation on the owner's PC, static files, no keys, no paid service, the synthetic "Qwen femenina" voice chosen by ear)

## Context

The practice of the oral defense read each question with `speechSynthesis`, whose voice depends on the browser and the device and often sounds robotic. The topic summaries (the `<p class="resumen">` paragraph of each guide page) had no audio. The owner wants a natural Spanish voice that costs nothing to run, needs no key and works on a static site (GitHub Pages).

## Decision

1. Generate the audio once, offline, on the owner's PC (NVIDIA RTX 2060, 6 GB) and commit the files. The site only serves static files. Nothing is generated at run time and no service is called.
2. Model: Qwen3-TTS 1.7B (Apache 2.0), two steps.
   - The voice was designed with `Qwen3-TTS-12Hz-1.7B-VoiceDesign` from a text description, and the owner picked it by ear. VoiceDesign changes the timbre between calls, so the chosen 11 s clip is kept as `scripts/voz-referencia.wav` with its spoken text in `scripts/voz-referencia.txt`.
   - Every file is made with `Qwen3-TTS-12Hz-1.7B-Base` and `generate_voice_clone` from that clip, so all of them share one voice.
3. Scope: the 106 questions of `public/datos/defensa/catalogo.json` and the 110 summary paragraphs of nine guide pages. 216 files.
4. Format: mono AAC in `.m4a`, 48 kb/s. It plays in every browser, including Safari on iOS, so there is one file per text and no fallback to keep in sync. Opus at 32 kb/s would be about a third smaller but needs a second format for Safari. The measured size is 6.3 KB per second of audio.
5. Pronunciation is fixed only for speech, in `scripts/voz_natural.py` (`hablado()`): acronyms (LiDAR, SLAM, PWM, PID, PSO), units, percentages, decimals with comma, ranges, arrows and numbers are written as they are said. The text the person reads is never changed.
6. Each audio is tied to its text by a hash. `public/audio/manifiesto.json` lists, for each file, the hash of the visible text and of the spoken text. `python scripts/voz_natural.py --comprobar` fails when a text, the pronunciation map or a file changed and the audio was not regenerated. It needs no GPU and no torch, so CI runs it with the other generators. Generation is resumable: it skips what is up to date.
7. Site behavior. Nothing loads up front and nothing autoplays.
   - Each summary gets an Escuchar button (`js/voz-resumen.js`, loaded when the browser is idle) with play, pause and progress, loading and error states, keyboard use and one audio at a time. It finds its audio by the hash of its text, so no page needs an id.
   - `js/defensa-voz.js` plays the question audio and falls back to `speechSynthesis` when there is no file or it fails to load.
   - A visible note says the voice is synthetic and generated with Qwen3-TTS. It sits next to the first button of each page and shows again while any audio plays. The rows of the other buttons stay one line tall, which keeps long pages short.
   - The player and the manifest (`js/voz-natural.js`, `audio/manifiesto.json`) are requested on the first press. The audio file is requested when playback starts.

## Alternatives considered

- Kokoro 82M: faster and lighter, and it was sampled next to Qwen3-TTS, but the owner picked the Qwen voice by ear. It also has no way to design or clone a voice, and its Spanish choice is limited to a few fixed voices.
- A runtime API (a cloud voice service): costs money or needs a key and a server, sends the text to a third party and breaks on a static site.
- Qwen3-TTS VoiceDesign for every file: the timbre drifts between calls, so the voice would not stay the same across 216 files.
- The browser voice only (what existed): free but not natural and different on every device.
- Opus plus an MP3 fallback: smaller for Chrome and Firefox but two files per text to generate, commit and keep in sync.

## Consequences

- Measured on the pilot (10 questions and 5 summaries, 151 s of audio, RTX 2060 6 GB, fp16 and `sdpa`): batch of 1 took 8.8 s of GPU per second of audio, 4 took 5.6, 8 took 1.8 to 2.0 and 16 took 2.9. The batch of 8 is the default. It uses more than 6 GB of GPU memory, so Windows spills the rest to shared memory. Batch 16 was slower for that reason.
- Estimate for the full set: 37 minutes of audio, 14 MB of files, about 1.1 to 1.3 hours of GPU.
- Consistency of the clones against the reference clip, measured with pyin pitch and characters per second: the median pitch of the 15 pilot clips stays within 13 % of their mean. The speaking rate varies more, between 12.1 and 16.5 characters per second (one clip is 19 % above the mean), because of numbers and pauses.
- The voice is synthetic and says so. Qwen3-TTS is credited in `docs/credits.md`.
- Adding or editing a summary or a question makes `--comprobar` fail until someone with a GPU regenerates it. The generator only touches what changed.
- Regenerate: install `torch` with CUDA, `qwen-tts`, `soundfile`, `beautifulsoup4` and ffmpeg, set `HF_HOME` to a folder with the `Qwen/Qwen3-TTS-12Hz-1.7B-Base` model and run `python scripts/voz_natural.py` from the repository root. `--solo 10p,5r` makes the pilot, `--lote N` sets the batch and `--medir` measures without writing.
- Undo: delete `public/audio/`. The question panel falls back to `speechSynthesis`. Remove the `vozResumen` function from `js/sitio.js` and the summary buttons disappear.
