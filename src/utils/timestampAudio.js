import { WaveFile } from "wavefile";

const timeStampAudio = (source, sampleRate) => {
  const countSeconds = (source) => {
    debugger;
    console.log("counting seconds");
    const lengthInSamples = source.length;
    const numberOfSeconds = lengthInSamples / sampleRate;
    return numberOfSeconds;
  };

  const overlapTones = (tone1, tone2) => {
    const maxLength = Math.max(tone1.length, tone2.length);
    const overlappedBuffer = new Float32Array(maxLength);

    for (let i = 0; i < maxLength; i++) {
      const sample1 = i < tone1.length ? tone1[i] : 0;
      const sample2 = i < tone2.length ? tone2[i] : 0;
      overlappedBuffer[i] = sample1 + sample2;
    }

    return overlappedBuffer;
  };

  // the sample rate must be that of the recorded clip for this to work
  const generateHighFrequencyTone = (duration, frequency) => {
    const samples = duration * sampleRate;
    const buffer = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      buffer[i] = 0.5 * Math.sin(2 * Math.PI * frequency * (i / sampleRate));
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

    At a low level, it will
    - determine duration of audio clip

  */
  const generateSignature = (secondIndex, totalSeconds) => {
    const duration = 0.1;
    const frequency = 700;
    if (sampleRate / 2 < frequency) {
      console.log(
        `Signature might not be encoded. The frequency is ${frequency} but the sample rate is ${sampleRate}`
      );
    }

    let signature = generateHighFrequencyTone(duration, frequency);

    // as a test, even seconds should produce different tones than odd seconds
    if (totalSeconds % secondIndex) {
      const perfectFifth = (fundamental) => fundamental * 1.5;
      const tone2 = generateHighFrequencyTone(
        duration,
        perfectFifth(frequency)
      );
      signature = overlapTones(signature, tone2);
    }

    return signature;
  };

  /*
  Parameters:
    - sampleRate
    - source audio
    - the signature to embed
    - part of audio to embed that signature into (1/6th, 2/6th, 3/6th, etc)
  */
  const embedSignature = (source, signature, signatureIndex, totalSeconds) => {
    const wav = new WaveFile();
    wav.fromBuffer(new Uint8Array(source));
    const samples = wav.getSamples();
    const signatureSamples = signature.length;

    // Calculate the position in samples where the signature should be embedded
    const positionInSeconds = signatureIndex / totalSeconds;
    const positionInSamples = Math.floor(positionInSeconds * samples.length);

    // Overlap the signature onto the source audio
    for (let i = 0; i < signatureSamples; i++) {
      if (positionInSamples + i < samples.length) {
        samples[positionInSamples + i] += signature[i];
      }
    }

    // Create a new WAV file with the combined samples
    wav.fromScratch(1, "32f", sampleRate, samples);
    return wav.toBuffer();
  };

  const seconds = countSeconds(source);
  // level here that determines the number of signatures that need to be created
  // const signatureIndex = signatureManager(source);
  console.log("seconds", seconds);
  let timestampedAudio = source;
  for (let i = 0; i < seconds; i++) {
    const signature = generateSignature(i, seconds);
    debugger;
    // embed a given signature into a given section of audio
    timestampedAudio = embedSignature(timestampedAudio, signature, i, seconds);
    console.log("embedded: ", i);
  }

  // as a test, we expect every other second to contain a different tone than the adjacent second
  return timestampedAudio;
};

export default timeStampAudio;
