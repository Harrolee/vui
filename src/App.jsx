import React, { useEffect, useState } from "react";
// import { FindOverlapByPeak } from "./components/FindOverlapByPeak";
// import Waveform from "./components/Waveform";
// import ConstantAudioRecorder from "./components/ConstantAudioRecorder";
// import EnergyComparison from "./components/EnergyComparison";
import { timeStampAudio } from "./utils/timestampAudio";
const App = () => {
  const [arrayBuffer, setArrayBuffer] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setArrayBuffer(event.target.result);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTimestamping = async (arrayBuffer) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    const audioBuffer = await audioContext.decodeAudioData(
      arrayBuffer.slice(0)
    );

    const timestampBuffer = await timeStampAudio(audioBuffer);
    console.log("this is normally where the audio would play");
    playAudio(timestampBuffer, audioContext);
  };

  const playAudio = (audioBuffer, audioContext) => {
    const source = audioContext.createBufferSource();

    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  useEffect(() => {
    if (arrayBuffer != null) {
      handleTimestamping(arrayBuffer);
    }
  }, [arrayBuffer]);

  // const handleAudioChunk = async (chunk) => {
  //   // Do something with the audio chunk
  //   console.log("Audio chunk received:", await chunk.arrayBuffer());
  // };

  // retrieve a 6second audio source from file

  // add timestamps (define an audio protocol --> a base frequency signature + one band of frequencies that denotes 1->#of seconds in clip and 2->which second this timestamp is)

  // play the audio source on a loop

  // get the audio source from someplace

  return (
    <div>
      <input type="file" accept="audio/wav" onChange={handleFileUpload} />
      {/* <ConstantAudioRecorder onAudioChunk={handleAudioChunk} /> */}
      {/* <EnergyComparison /> */}
      {/* <FindOverlapByPeak />
      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      {blob && <Waveform blob={blob} />} */}
    </div>
  );
};

export default App;
