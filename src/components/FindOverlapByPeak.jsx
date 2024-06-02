/* eslint-disable no-debugger */
import "../styling/styles.css";
import { useCallback, useState } from "react";
// import { ask } from "../api";
import { AudioPlayerControls } from "./AudioPlayerControls";
import RecordAudio from "./AudioRecorder";
import { Button } from "@mui/material";

export function FindOverlapByPeak() {
  // const [onPlayBack, setOnPlayBack] = useState(false);
  const [audioUrl, setAudioUrl] = useState();
  const [currentlyAsking, setCurrentlyAsking] = useState(false);

  // const handleAsk = async (blob) => {
  //   setCurrentlyAsking(false);
  //   // learn how to change chunk size
  //   // 500ms is ideal window size
  //   for await (const chunk of blob.stream()) {
  //     console.log(chunk);
  //     debugger;
  //   }
  //   // const response = await ask(blob, props.articleText);
  //   // const url = URL.createObjectURL(response);
  //   // setAudioUrl(url);
  // };

  const handleAsk = async (blob) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Convert blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();

    // Decode the ArrayBuffer to get the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get the audio data (assuming the audio is mono; for stereo, you need to handle both channels)
    const audioData = audioBuffer.getChannelData(0);
    console.log(audioBuffer.sampleRate);

    // Find the peak value
    let peak = 0;
    for (let i = 0; i < audioData.length; i++) {
      const absValue = Math.abs(audioData[i]);
      if (absValue > peak) {
        peak = absValue;
      }
    }

    console.log(`Peak value of the chunk: ${peak}`);
    // setCurrentlyAsking(false);
  };

  const handleStartAsking = useCallback(() => {
    setAudioUrl(undefined);
    setCurrentlyAsking(true);
  }, []);

  // const compareWaveforms = () => {
  //   if (audioData1 && audioData2) {
  //     // Implement your custom comparison logic here
  //     // Example: Compute and log the difference in amplitude at each sample
  //     const length = Math.min(audioData1.length, audioData2.length);
  //     const differences = [];
  //     for (let i = 0; i < length; i++) {
  //       differences.push(Math.abs(audioData1[i] - audioData2[i]));
  //     }
  //     console.log("Amplitude Differences:", differences);
  //   }
  // };

  return (
    <div>
      <div>
        <Button onClick={handleStartAsking}>Ask</Button>
      </div>
      {/* {audioUrl && <AudioPlayerControls src={audioUrl} />} */}
      {<RecordAudio onRecordAudio={handleAsk} />}
    </div>
  );
}
