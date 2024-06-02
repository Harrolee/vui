import { useState } from "react";
import { WaveFile } from "wavefile";

const CompareEnergy = (originalAudio, playbackAudio) => {
  const [energyPlayback, setEnergyPlayback] = useState(null);
  const [energyOriginal, setEnergyOriginal] = useState(null);

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
      console.log("Failed to process audio file: " + err.message);
      return null;
    }
  };

  const compareEnergy = () => {
    if (playbackAudio && originalAudio) {
      const energyPlayback = calculateEnergy(playbackAudio);
      const energyOriginal = calculateEnergy(originalAudio);

      setEnergyPlayback(energyPlayback);
      setEnergyOriginal(energyOriginal);
    }
  };

  compareEnergy();

  const highest =
    energyOriginal > energyPlayback ? energyOriginal : energyPlayback;
  const lowest =
    energyOriginal < energyPlayback ? energyOriginal : energyPlayback;

  return {
    energyOriginal: energyOriginal,
    energyPlayback: energyPlayback,
    difference: highest - lowest,
    highest: highest,
    lowest: lowest,
  };
};

export default CompareEnergy;
