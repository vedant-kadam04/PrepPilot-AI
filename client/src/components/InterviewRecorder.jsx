import { useEffect, useRef, useState } from "react";
import "./InterviewRecorder.css";

function InterviewRecorder({ onAnswerRecorded }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Camera permission denied.");
      }
    };

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let text = "";

        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + " ";
        }

        setTranscript(text);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Speech Recognition is not supported in this browser");
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    if (!stream) return;

    setTranscript("");

    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.start();
    recognitionRef.current?.start();
    setRecording(true);
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) return;

    recorder.stop();
    recognitionRef.current?.stop();
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const videoURL = URL.createObjectURL(blob);

      setRecordedVideo(videoURL);

      if (onAnswerRecorded) {
        onAnswerRecorded(transcript);
      }
      setRecording(false);
    };
  };

  return (
    <div className="recorder-container">
      {error && <p style={{ color: "red" }}>{error}</p>}

      <video ref={videoRef} autoPlay playsInline muted className="live-video" />

      <div className="recording-controls">
        <button
          className="record-btn"
          onClick={startRecording}
          disabled={recording}
        >
          Start Recording
        </button>

        <button
          className="stop-btn"
          onClick={stopRecording}
          disabled={!recording}
        >
          Stop Recording
        </button>
      </div>
      {recordedVideo && (
        <div className="recorder-video-section">
          <h3>Recorded Answer</h3>

          <video src={recordedVideo} controls className="recorded-video" />
        </div>
      )}

      {transcript && (
        <div className="transcript-section">
          <h3>Your Answer</h3>

          <textarea className="transcript-box" value={transcript} readOnly />
        </div>
      )}
    </div>
  );
}

export default InterviewRecorder;
