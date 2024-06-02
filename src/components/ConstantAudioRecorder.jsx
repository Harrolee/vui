import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const AudioRecorder = ({ onAudioChunk }) => {
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    const initAudio = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API or getUserMedia not supported");
        return;
      }

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = handleDataAvailable;
        mediaRecorderRef.current.start(1000); // Adjust the timeslice to the desired chunk size in milliseconds
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    const handleDataAvailable = async (event) => {
      if (event.data.size > 0) {
        onAudioChunk(event.data);
      }
    };

    initAudio();

    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [onAudioChunk]);

  return <div>Recording...</div>;
};

AudioRecorder.propTypes = {
  onAudioChunk: PropTypes.func.isRequired,
};

export default AudioRecorder;
