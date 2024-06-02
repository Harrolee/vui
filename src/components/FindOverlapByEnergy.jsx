/* eslint-disable no-debugger */
import "../styling/styles.css";
import { useCallback, useState } from "react";
// import { ask } from "../api";
import { AudioPlayerControls } from "./AudioPlayerControls";
import RecordAudio from "./AudioRecorder";
import { Button } from "@mui/material";
import compareEnergy from "../utils/compareEnergy";
import alignAudio from "../utils/alignAudio";

export function FindOverlap() {
  const energyThreshold = 500; // threshold should be a dynamic value relative to the energy of the entire clip

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

  const handleAsk = async (playbackBlob) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    const playbackArrayBuffer = await playbackBlob.arrayBuffer();
    const playbackAudioBuffer = await audioContext.decodeAudioData(
      playbackArrayBuffer
    );

    // using playbackBlob as a holder here
    const originalTrack = playbackBlob; // learn how to get the original track
    const originalTrackArrayBuffer = await originalTrack.arrayBuffer();
    const originalTrackAudioBuffer =
      await originalTrackArrayBuffer.decodeAudioData(originalTrackArrayBuffer);

    const alignedTracks = alignAudio(
      playbackAudioBuffer,
      originalTrackAudioBuffer
    );

    // should I make chunks at this level or should I make chunks
    // after I've creates wav files and given them to compareEnergy?
    // Can I convert the data from a channel of an audio buffer back into an audio buffer?
    // Can I chunk an audio buffer?

    // Do I need to chunk recordings at all?
    // yes. You will need to chunk them into 1second segments.
    // Wait. You're going to record audio from the user into a buffer and analyze it as it's being read?
    // that's badass, bro

    // break audio into chunks
    const chunk1 = alignedTracks.one;

    // Get the audio data (assuming the audio is mono; for stereo, you need to handle both channels)

    // get audio buffer of both the playback audio and the original audio
    const energy = compareEnergy(alignedTracks.one, alignedTracks.two);

    if (energy.difference > energyThreshold) {
      console.log(`Peak value of the chunk: ${peak}`);
    }
  };

  const handleStartAsking = useCallback(() => {
    setAudioUrl(undefined);
    setCurrentlyAsking(true);
  }, []);

  return (
    <div>
      <div>
        <Button onClick={handleStartAsking}>Ask</Button>
      </div>
      {audioUrl && <AudioPlayerControls src={audioUrl} />}
      {currentlyAsking && <RecordAudio onRecordAudio={handleAsk} />}
    </div>
  );
}
