export const playAudioBuffer = async (audioBuffer) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
};

const signatureToAudioBuffer = async (signature, sampleRate) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = audioContext.createBuffer(
    1,
    signature.length,
    sampleRate
  );
  audioBuffer.copyToChannel(signature, 0);
  return audioBuffer;
};

const overlapTones = (tones) => {
  const toneLengths = tones.map((tone) => tone.length);
  const maxLength = Math.max(...toneLengths);
  const overlappedBuffer = new Float32Array(maxLength);

  for (let i = 0; i < maxLength; i++) {
    let sampleSum = 0;
    for (let tone of tones) {
      sampleSum += i < tone.length ? tone[i] : 0;
    }
    overlappedBuffer[i] = Math.min(1, Math.max(-1, sampleSum));
  }

  return overlappedBuffer;
};

const generateTone = (duration, frequency, sampleRate) => {
  const samples = duration * sampleRate;
  const buffer = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const amplitude = 0.5;
    buffer[i] =
      amplitude * Math.sin(2 * Math.PI * frequency * (i / sampleRate));
  }
  return buffer;
};

export const generateSignature = (secondIndex, totalSeconds, sampleRate) => {
  const frame = () => {
    const duration = 0.05;
    const bottomTone = generateTone(duration, 21500, sampleRate);
    const topTone = generateTone(duration, 22000, sampleRate);
    return overlapTones([bottomTone, topTone]);
  };

  const clap = () => {
    const duration = 0.01;
    const bottomTone = generateTone(duration, 21600, sampleRate);
    const middleTone = generateTone(duration, 21700, sampleRate);
    const topTone = generateTone(duration, 21800, sampleRate);
    return overlapTones([topTone, middleTone, bottomTone]);
  };

  if (secondIndex == 0) {
    // first signature in the track is a clap, like from a clapperstick
    return signatureToAudioBuffer(overlapTones([frame(), clap()]), sampleRate);
  } else {
    // other signatures are just beats
    return signatureToAudioBuffer(frame(), sampleRate);
  }
};

export const timeStampAudio = async (
  sourceAudioBuffer,
  sampleRate,
  duration
) => {
  const embedSignature = (audioBuffer, signature, signatureIndex) => {
    let data = audioBuffer.getChannelData(0);
    let signatureData = signature.getChannelData(0);

    // Calculate the position in samples where the signature should be embedded
    const currentStartingSample = signatureIndex * sampleRate;
    for (
      let i = currentStartingSample, j = 0;
      i < currentStartingSample + sampleRate;
      i++, j++
    ) {
      // data[i] /= 2;
      if (j < signatureData.length) {
        signatureData[j] /= 2;
        data[i] += signatureData[j];
      }
    }

    return audioBuffer;
  };

  for (let i = 0; i < duration; i++) {
    const signature = await generateSignature(i, duration, sampleRate);
    sourceAudioBuffer = embedSignature(sourceAudioBuffer, signature, i);
    console.log("embedded: ", i);
  }
  return sourceAudioBuffer;
};
