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

const overlapTones = (tone1, tone2) => {
  const maxLength = Math.max(tone1.length, tone2.length);
  const overlappedBuffer = new Float32Array(maxLength);

  for (let i = 0; i < maxLength; i++) {
    const sample1 = i < tone1.length ? tone1[i] : 0;
    const sample2 = i < tone2.length ? tone2[i] : 0;
    overlappedBuffer[i] = Math.min(1, Math.max(-1, sample1 + sample2));
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
/*
    Add controllable parameters here for defining a signature.
    Parameters might be: increment between timestamp, duration of signature, starting and ending frequencies of signature

    Info in a signature
      - x/X 

    At a high level, it will
      - generate a signature that contains this information
  */
export const generateSignature = (secondIndex, totalSeconds, sampleRate) => {
  const duration = 0.05;
  const frequency = 800;
  if (sampleRate / 2 < frequency) {
    console.log(
      `Signature might not be encoded. The frequency is ${frequency} but the sample rate is ${sampleRate}`
    );
  }
  let signature = generateTone(duration, frequency, sampleRate);

  const perfectFifth = (fundamental) => fundamental * 1.5;
  const tone2 = generateTone(duration, perfectFifth(frequency), sampleRate);
  signature = overlapTones(signature, tone2);

  return signatureToAudioBuffer(signature, sampleRate);
};

export const timeStampAudio = async (
  sourceAudioBuffer,
  sampleRate,
  duration
) => {
  const playAudioBuffer = async (audioBuffer) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    // Play the timestampBuffer
    const source = audioContext.createBufferSource();
    console.log("audioBuffer follows");
    console.log(audioBuffer);
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

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
    // await tempMethodPlayWav(timestampedWav);
    console.log("embedded: ", i);
  }
  // as a test, we expect every other second to contain a different tone than the adjacent second
  return sourceAudioBuffer;
};
