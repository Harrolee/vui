import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

const Waveform = ({ blob }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);

  useEffect(() => {
    const handleAsk = async (blob) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      const arrayBuffer = await blob.arrayBuffer();
      audioBufferRef.current = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBufferRef.current.getChannelData(0); // Assuming mono for simplicity

      drawWaveform(audioData, ctx, canvas);
      drawFrequencySpectrum(audioData, ctx, canvas);
    };

    const drawWaveform = (audioData, ctx, canvas) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height / 2);

      const width = canvas.width;
      const height = canvas.height / 2; // Half the height for waveform
      const length = audioData.length;
      const sliceWidth = width / length;
      let x = 0;

      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < length; i++) {
        const y = (audioData[i] * height) / 2 + height / 2;
        ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    const drawFrequencySpectrum = (audioData, ctx, canvas) => {
      const fftSize = 2048;
      const offlineAudioContext = new (window.OfflineAudioContext ||
        window.webkitOfflineAudioContext)(
        1,
        fftSize,
        audioContextRef.current.sampleRate
      );
      const source = offlineAudioContext.createBufferSource();
      source.buffer = offlineAudioContext.createBuffer(
        1,
        audioData.length,
        audioContextRef.current.sampleRate
      );
      source.buffer.copyToChannel(audioData, 0);
      const analyser = offlineAudioContext.createAnalyser();
      analyser.fftSize = fftSize;

      source.connect(analyser);
      analyser.connect(offlineAudioContext.destination);
      source.start(0);
      offlineAudioContext.startRendering().then((renderedBuffer) => {
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);

        ctx.clearRect(0, canvas.height / 2, canvas.width, canvas.height / 2); // Clear the lower half for spectrum
        const width = canvas.width;
        const height = canvas.height / 2;
        const barWidth = (width / analyser.frequencyBinCount) * 2.5;
        let x = 0;

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
          const barHeight = (frequencyData[i] / 255) * height;
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(
            x,
            canvas.height / 2 + height - barHeight,
            barWidth,
            barHeight
          );
          x += barWidth + 1;
        }
      });
    };

    handleAsk(blob);
  }, [blob]);

  return <canvas ref={canvasRef} width="800" height="400"></canvas>; // Increased height for both visualizations
};

Waveform.propTypes = {
  blob: PropTypes.instanceOf(Blob).isRequired,
};

export default Waveform;
