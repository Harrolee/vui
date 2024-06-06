const timeStampAudio = async (sourceAudioBuffer, sampleRate, duration) => {
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

  const generateHighFrequencyTone = (duration, frequency) => {
    const samples = duration * sampleRate;
    const buffer = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      buffer[i] = 0.5 * Math.sin(2 * Math.PI * frequency * (i / sampleRate));
    }
    return buffer;
  };

  const signatureToAudioBuffer = async (signature) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(
      1,
      signature.length,
      audioContext.sampleRate
    );
    buffer.copyToChannel(signature, 0);
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
  const generateSignature = (secondIndex, totalSeconds) => {
    const duration = 0.05;
    const frequency = 800;
    if (sampleRate / 2 < frequency) {
      console.log(
        `Signature might not be encoded. The frequency is ${frequency} but the sample rate is ${sampleRate}`
      );
    }

    let signature = generateHighFrequencyTone(duration, frequency);

    // as a test, even seconds should produce different tones than odd seconds
    // if (secondIndex % 2) {
    //   console.log("modded");
    //   const perfectFifth = (fundamental) => fundamental * 1.5;
    //   const tone2 = generateHighFrequencyTone(
    //     duration,
    //     800
    //     // perfectFifth(frequency)
    //   );
    //   signature = overlapTones(signature, tone2);
    // }

    // convert signature to audio buffer before playing

    return signature;
  };

  const embedSignature = (audioBuffer, signature, signatureIndex) => {
    let data = audioBuffer.getChannelData(0);

    // Calculate the position in samples where the signature should be embedded
    const currentStartingSample = signatureIndex * sampleRate;

    // playAudioBuffer(signature);
    for (
      let i = currentStartingSample, j = 0;
      i < currentStartingSample + sampleRate;
      i++, j++
    ) {
      // data[i] /= 2;
      // console.log(`j is ${j} and signature.length is ${signature.length}`);
      if (j < signature.length) {
        signature[j] /= 2;
        data[i] += signature[j];
      }
    }

    return audioBuffer;
  };

  for (let i = 0; i < duration; i++) {
    const signature = await signatureToAudioBuffer(
      generateSignature(i, duration)
    );
    // await playAudioBuffer(signature);
    // embed a given signature into a given section of audio
    if (i == 1) {
      console.log("first time audio playing now");
      // await playAudioBuffer(sourceAudioBuffer);
    }

    sourceAudioBuffer = embedSignature(sourceAudioBuffer, signature, i);

    // await tempMethodPlayWav(timestampedWav);
    console.log("embedded: ", i);
  }
  // as a test, we expect every other second to contain a different tone than the adjacent second
  return sourceAudioBuffer;
};

export default timeStampAudio;
