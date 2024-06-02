import { useEffect } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { sleep } from "../utils/sleep";
export interface RecordAudioProps {
  onRecordAudio: (blob: Blob) => void;
}

export default function RecordAudio(props: RecordAudioProps) {
  const recorderControls = useAudioRecorder({
    noiseSuppression: true,
    echoCancellation: true,
  });

  // useEffect(() => {
  //   if (!recorderControls.isRecording) {
  //     recorderControls.startRecording();
  //   }
  // }, [recorderControls]);

  // cycle the recorder every time-increment
  const cycleDuration = 5;

  // // while (true) {
  if (recorderControls.recordingTime > cycleDuration) {
    // sleep(cycleDuration);
    console.log(
      `recorderControls.recordingTime is ${recorderControls.recordingTime} and cycleDuration is ${cycleDuration}`
    );
    console.log(`stopping recording`);
    recorderControls.stopRecording();

    while (
      !recorderControls.recordingBlob?.size ||
      recorderControls.recordingBlob?.size < 500
    ) {
      console.log(`blob size is ${recorderControls.recordingBlob?.size}`);
    }
    console.log(`blob size is ${recorderControls.recordingBlob?.size}`);
    sleep(0.5);
    recorderControls.startRecording();
    console.log("started recording");
  }

  return (
    <div>
      <AudioRecorder
        recorderControls={recorderControls}
        onRecordingComplete={props.onRecordAudio}
      />
    </div>
  );
}
