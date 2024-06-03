import { WaveFile } from "wavefile";
import { sleep } from "./sleep";
const timeStampAudio = async (sourceArrayBuffer, sampleRate, duration) => {
  const tempMethodPlaySignature = async (signatureBuffer) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    // Play the timestampBuffer
    const source = audioContext.createBufferSource();
    // Step 2: Create an AudioBuffer
    const length = signatureBuffer.length; // Number of samples
    const audioBuffer = audioContext.createBuffer(1, length, sampleRate);

    // Step 3: Copy the data into the AudioBuffer
    audioBuffer.copyToChannel(signatureBuffer, 0); // Copy data to the first channel

    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const tempMethodPlayWav = async (wav) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContext.createBufferSource();
    // convert timestampBuffer to an AudioBuffer
    const timestampedAudioBuffer = await audioContext.decodeAudioData(
      wav.toBuffer().buffer
    );
    source.buffer = timestampedAudioBuffer;
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
  */
  const generateSignature = (secondIndex, totalSeconds) => {
    const duration = 0.05;
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

  const embedSignature = (wav, signature, signatureIndex, totalSeconds) => {
    // Extract samples and ensure they are in Float32Array format
    // Log original samples for debugging
    // console.log("Original samples:", wav.slice(0, 100));

    let samples = wav.getSamples(true, Float32Array);

    console.log("Converted samples:", samples.slice(0, 100));

    // Recreate WAV file with the same samples
    wav.fromScratch(1, sampleRate, "32F", samples);

    return wav;
  };

  // const embedSignature = (wav, signature, signatureIndex, totalSeconds) => {
  // Convert samples to Float32Array if not already
  // let samples = wav.getSamples();
  // if (!(samples instanceof Float32Array)) {
  //   samples = Float32Array.from(samples);
  // }

  // const signatureSamples = signature.length;

  // // Calculate the position in samples where the signature should be embedded
  // const positionInSeconds = signatureIndex / totalSeconds;
  // const positionInSamples = Math.floor(positionInSeconds * samples.length);

  // console.log(
  //   "Embedding signature. Signature samples length: ",
  //   signatureSamples
  // );
  // console.log(
  //   "Original samples around embedding position: ",
  //   samples.slice(positionInSamples, positionInSamples + signatureSamples)
  // );

  // // Overlap the signature onto the source audio
  // for (let i = 0; i < signatureSamples; i++) {
  //   if (positionInSamples + i < samples.length) {
  //     // Mix the original sample and the signature sample, ensuring the result is in the valid range
  //     samples[positionInSamples + i] = Math.min(
  //       1,
  //       Math.max(-1, samples[positionInSamples + i] + signature[i])
  //     );
  //   }
  // }

  // console.log(
  //   "Modified samples around embedding position: ",
  //   samples.slice(positionInSamples, positionInSamples + signatureSamples)
  // );

  // Create a new WAV file with the combined samples
  //   wav.fromScratch(1, sampleRate, "32f", samples);
  //   return wav;
  // };

  // const embedSignature = (wav, signature, signatureIndex, totalSeconds) => {
  //   const samples = wav.getSamples();
  //   const signatureSamples = signature.length;

  //   // Calculate the position in samples where the signature should be embedded
  //   const positionInSeconds = signatureIndex / totalSeconds;
  //   const positionInSamples = Math.floor(positionInSeconds * samples.length);

  //   console.log("beginning an overlap, signatureSamples: ", signatureSamples);
  //   // Overlap the signature onto the source audio
  //   for (let i = 0; i < signatureSamples - 1; i++) {
  //     if (positionInSamples + i < samples.length) {
  //       samples[positionInSamples + i] += signature[i];
  //     }
  //   }

  //   // Create a new WAV file with the combined samples
  //   wav.fromScratch(1, sampleRate, "32f", samples);
  //   return wav;
  // };

  // level here that determines the number of signatures that need to be created
  // const signatureIndex = signatureManager(source);

  // convert audioBuffer to a wav here
  let timestampedWav = new WaveFile();

  timestampedWav.fromBuffer(new Uint8Array(sourceArrayBuffer));

  for (let i = 0; i < duration; i++) {
    const signature = generateSignature(i, duration);
    // await tempMethodPlaySignature(signature);
    // embed a given signature into a given section of audio
    if (i == 1) {
      console.log("first time audio playing now");
      await tempMethodPlayWav(timestampedWav);
    }
    timestampedWav = embedSignature(timestampedWav, signature, i, duration);

    // await tempMethodPlayWav(timestampedWav);
    console.log("embedded: ", i);
  }
  // as a test, we expect every other second to contain a different tone than the adjacent second
  return timestampedWav.toBuffer().buffer;
};

export default timeStampAudio;
