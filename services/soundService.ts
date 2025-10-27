
let audioContext: AudioContext | null = null;

const initializeAudio = () => {
  if (typeof window !== 'undefined' && !audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

const playTone = (frequency: number, duration: number, startTime = 0) => {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + startTime + duration);

  oscillator.start(audioContext.currentTime + startTime);
  oscillator.stop(audioContext.currentTime + startTime + duration);
};

export const startAudioContext = () => {
    initializeAudio();
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

export const playCorrectSound = () => {
  if (!audioContext || audioContext.state === 'suspended') return;
  playTone(523.25, 0.1, 0); // C5
  playTone(659.25, 0.1, 0.1); // E5
};

export const playIncorrectSound = () => {
  if (!audioContext || audioContext.state === 'suspended') return;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};

export const playTimeUpSound = () => {
  if (!audioContext || audioContext.state === 'suspended') return;
  playTone(440, 0.08, 0);
  playTone(440, 0.08, 0.15);
};
