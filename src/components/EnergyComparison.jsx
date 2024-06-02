import React, { useState } from "react";
import { WaveFile } from "wavefile";

const EnergyComparison = () => {
  const [ambientAudio, setAmbientAudio] = useState(null);
  const [playbackAudio, setPlaybackAudio] = useState(null);
  const [energyPlayback, setEnergyPlayback] = useState(null);
  const [energyAmbient, setEnergyAmbient] = useState(null);
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

  const compareEnergy = () => {
    if (playbackAudio && ambientAudio) {
      const energyPlayback = calculateEnergy(playbackAudio);
      const energyAmbient = calculateEnergy(ambientAudio);

      setEnergyPlayback(energyPlayback);
      setEnergyAmbient(energyAmbient);
    }
  };

  return (
    <div>
      <h1>Energy Comparison</h1>
      <div>
        <h3>ambient</h3>
        <input
          type="file"
          accept="audio/wav"
          onChange={(e) => handleFileChange(e, setAmbientAudio)}
        />
        <h3>playback</h3>
        <input
          type="file"
          accept="audio/wav"
          onChange={(e) => handleFileChange(e, setPlaybackAudio)}
        />
      </div>
      <button onClick={compareEnergy}>Compare Energy</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {energyPlayback !== null && energyAmbient !== null && (
        <div>
          <p>Energy of Playback: {energyPlayback}</p>
          <p>Energy of Ambient: {energyAmbient}</p>
        </div>
      )}
    </div>
  );
};

export default EnergyComparison;

// apply timestamp to ambient audio as we record it.
// apply timestamp to
