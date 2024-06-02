import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const WaveformComparison = ({ audioFile1, audioFile2 }) => {
  const waveform1Ref = useRef(null);
  const waveform2Ref = useRef(null);
  const wavesurfer1 = useRef(null);
  const wavesurfer2 = useRef(null);
  const [audioData1, setAudioData1] = useState(null);
  const [audioData2, setAudioData2] = useState(null);

  useEffect(() => {
    wavesurfer1.current = WaveSurfer.create({
      container: waveform1Ref.current,
      waveColor: "violet",
      progressColor: "purple",
    });

    wavesurfer2.current = WaveSurfer.create({
      container: waveform2Ref.current,
      waveColor: "lightblue",
      progressColor: "blue",
    });

    loadAudioFiles();

    return () => {
      wavesurfer1.current.destroy();
      wavesurfer2.current.destroy();
    };
  }, []);
  const loadAudioFiles = async () => {
    try {
      const response1 = await fetch(audioFile1);
      const arrayBuffer1 = await response1.arrayBuffer();
      console.log("Audio file 1 response:", response1);
      console.log("Audio file 1 arrayBuffer:", arrayBuffer1);

      const response2 = await fetch(audioFile2);
      const arrayBuffer2 = await response2.arrayBuffer();
      console.log("Audio file 2 response:", response2);
      console.log("Audio file 2 arrayBuffer:", arrayBuffer2);

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Decode the audio data with callback functions for better error handling
      const decodeAudioData = (audioData) => {
        return new Promise((resolve, reject) => {
          audioContext.decodeAudioData(audioData, resolve, reject);
        });
      };

      const audioBuffer1 = await decodeAudioData(arrayBuffer1);
      const audioBuffer2 = await decodeAudioData(arrayBuffer2);

      wavesurfer1.current.loadDecodedBuffer(audioBuffer1);
      wavesurfer2.current.loadDecodedBuffer(audioBuffer2);

      setAudioData1(audioBuffer1.getChannelData(0));
      setAudioData2(audioBuffer2.getChannelData(0));
    } catch (error) {
      console.error("Error loading or decoding audio files:", error);
      if (error instanceof DOMException && error.name === "EncodingError") {
        console.error(
          "The audio data format might be unsupported or corrupted."
        );
      } else {
        console.error("Error details:", error);
      }
    }
  };

  const compareWaveforms = () => {
    if (audioData1 && audioData2) {
      // Implement your custom comparison logic here
      // Example: Compute and log the difference in amplitude at each sample
      const length = Math.min(audioData1.length, audioData2.length);
      const differences = [];
      for (let i = 0; i < length; i++) {
        differences.push(Math.abs(audioData1[i] - audioData2[i]));
      }
      console.log("Amplitude Differences:", differences);
    }
  };

  return (
    <div>
      <div ref={waveform1Ref}></div>
      <div ref={waveform2Ref}></div>
      <button onClick={compareWaveforms}>Compare Waveforms</button>
    </div>
  );
};

export default WaveformComparison;
