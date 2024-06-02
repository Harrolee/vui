import React, { useState } from "react";
import { WaveFile } from "wavefile";
// exercise to the reader:
// Take a third wav file, the ground truth wav
// compare the ground truth wav against the de-noised re-rerecording

const EnergyComparison = () => {
  const [groundTruthAudio, setGroundTruthAudio] = useState(null);
  const [ambientAudio, setAmbientAudio] = useState(null);
  const [playbackAudio, setPlaybackAudio] = useState(null);
  const [energyOriginal, setEnergyOriginal] = useState(null);
  const [energyPlayback, setEnergyPlayback] = useState(null);
  const [energyAmbient, setEnergyAmbient] = useState(null);
  const [energyCorrected, setEnergyCorrected] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e, setAudio) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setAudio(event.target.result);
    };
    reader.readAsArrayBuffer(file);
  };

  const calculateEnergy = (audioBuffer) => {
    try {
      const wav = new WaveFile();
      wav.fromBuffer(new Uint8Array(audioBuffer));
      const samples = wav.getSamples();
      let energy = 0;
      for (let i = 0; i < samples.length; i++) {
        energy += samples[i] * samples[i];
      }
      return energy / samples.length; // Average energy (dimensionless)
    } catch (err) {
      setError("Failed to process audio file: " + err.message);
      return null;
    }
  };

  const noiseReduction = (playbackBuffer, ambientBuffer) => {
    try {
      const wavPlayback = new WaveFile();
      wavPlayback.fromBuffer(new Uint8Array(playbackBuffer));
      const samplesPlayback = wavPlayback.getSamples();

      const wavAmbient = new WaveFile();
      wavAmbient.fromBuffer(new Uint8Array(ambientBuffer));
      const samplesAmbient = wavAmbient.getSamples();

      if (samplesPlayback.length !== samplesAmbient.length) {
        setError("Playback and ambient recordings must have the same length");
        return null;
      }

      const correctedSamples = [];
      for (let i = 0; i < samplesPlayback.length; i++) {
        correctedSamples.push(samplesPlayback[i] - samplesAmbient[i]);
      }

      // Calculate energy of the corrected signal
      let energyCorrected = 0;
      for (let i = 0; i < correctedSamples.length; i++) {
        energyCorrected += correctedSamples[i] * correctedSamples[i];
      }
      return energyCorrected / correctedSamples.length; // Average energy (dimensionless)
    } catch (err) {
      setError("Failed to process audio files: " + err.message);
      return null;
    }
  };

  const compareEnergy = () => {
    if (playbackAudio && ambientAudio) {
      const energyOriginal = calculateEnergy(playbackAudio);
      const energyAmbient = calculateEnergy(ambientAudio);
      const energyCorrected = noiseReduction(playbackAudio, ambientAudio);

      setEnergyOriginal(energyOriginal);
      setEnergyAmbient(energyAmbient);
      setEnergyCorrected(energyCorrected);
    }
  };

  return (
    <div>
      <h1>Energy Comparison</h1>
      <div>
        <h3>Ambient</h3>
        <input
          type="file"
          accept="audio/wav"
          onChange={(e) => handleFileChange(e, setAmbientAudio)}
        />
        <h3>Playback</h3>
        <input
          type="file"
          accept="audio/wav"
          onChange={(e) => handleFileChange(e, setPlaybackAudio)}
        />
        <h3>GroundTruth</h3>
        <input
          type="file"
          accept="audio/wav"
          onChange={(e) => handleFileChange(e, setGroundTruthAudio)}
        />
      </div>
      <button onClick={compareEnergy}>Compare Energy</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {energyOriginal !== null &&
        energyAmbient !== null &&
        energyCorrected !== null && (
          <div>
            <p>Energy of Original Playback: {energyOriginal}</p>
            <p>Energy of Ambient Noise: {energyAmbient}</p>
            <p>Energy of Corrected Playback: {energyCorrected}</p>
          </div>
        )}
    </div>
  );
};

export default EnergyComparison;
