// The new-order chime, synthesised in the browser with the Web Audio API.
//
// No .mp3 to host, download or keep in sync — which also means it works on a
// bad connection in the shop, costs nothing to serve, and can't be blocked as
// a third-party asset.
//
// Browsers refuse to start audio until the person has interacted with the
// page, so `primeAudio()` is called on the first click/keypress to unlock it.
// Signing in counts as that interaction, so by the time an order can arrive
// the chime is already allowed to play.

let ctx = null;

function audioContext() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

export function primeAudio() {
  const ac = audioContext();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}

// One bell-ish note: a sine tone with a fast attack and a long decay, plus a
// quieter octave above it for a bit of shine.
function note(ac, freq, startAt, duration, peak) {
  const gain = ac.createGain();
  gain.connect(ac.destination);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  for (const [multiplier, level] of [[1, 1], [2, 0.32]]) {
    const osc = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * multiplier;
    oscGain.gain.value = level;
    osc.connect(oscGain).connect(gain);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
  }
}

// Two rising notes — a doorbell, not an alarm. Distinct enough to hear from
// across the shop, short enough not to be annoying when orders come in fast.
export function playOrderChime() {
  const ac = audioContext();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume().catch(() => {});
  const now = ac.currentTime + 0.02;
  note(ac, 880, now, 0.42, 0.28);          // A5
  note(ac, 1174.66, now + 0.16, 0.72, 0.24); // D6
}
