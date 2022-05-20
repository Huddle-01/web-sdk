//client sdk import
import HuddleClient, { emitter, HuddleTypes } from "huddle01-client";

//react imports
import { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";

//helper imports
import { getTrack } from "../lib/utils/helpers";
import { PeerVideo, PeerAudio, PeerScreen } from "../components/PeerViewport";

// interfaces
import { IConsumerStreams } from "../interface/interfaces";

function Room() {
  const history = useHistory();
  //to allow for recordings
  const isBot = localStorage.getItem("bot_password") === "huddle01";
  //initialising states
  const [huddle, setHuddle] = useState<HuddleClient | null>(null);
  const [roomState, setRoomState] = useState<string>("");
  const [micState, setMicState] = useState<boolean>(false);
  const [webcamState, setWebcamState] = useState<boolean>(false);
  const [recordingState, setRecordingState] = useState<boolean>(false);
  const [screenshareState, setScreenshareState] = useState<boolean>(false);
  const [streamingState, setStreamingState] = useState<boolean>(false);
  const [peers, setPeers] = useState<HuddleTypes.IPeer[]>([]);
  const [consumerStreams, setConsumerStreams] = useState<IConsumerStreams>({
    video: [],
    audio: [],
    screen: [],
  });

  const meVideoElem = useRef<any>(null);
  const meScreenElem = useRef<any>(null);
  const joinRoomBtn = useRef<any>(null);

  const config: HuddleTypes.HuddleClientConfig = {
    apiKey: "API-KEY-HERE",
    roomId: "C132",
    peerId: "Rick" + Math.floor(Math.random() * 4000),
    displayName: "Rick Sanchez",
    window,
    isBot,
  };

  //initialize the app
  useEffect(() => {
    history.push(`?roomId=${config.roomId}`);

    const myHuddleClient: HuddleClient = new HuddleClient(config);
    setHuddle(myHuddleClient);
  }, []);

  //recording config
  useEffect(() => {
    //joinRoomBtn here can be whatever button/function used that calls `huddle.join()`
    huddle && isBot && joinRoomBtn.current.click();
  }, [huddle, isBot]);

  const setupEventListeners = async () => {
    emitter.on("roomState", (state: string) => {
      switch (state) {
        case "connected":
          //do whatever
          break;
        case "failed":
          //do whatever
          break;
        case "disconnected":
          //do whatever
          break;
        default:
          setRoomState(state);
          break;
      }
      setRoomState(state);
    });

    emitter.on("error", (error: any) => {
      alert(error);
      //do whatever
    });

    emitter.on("addPeer", (peer: HuddleTypes.IPeer) => {
      console.log("new peer =>", peer);
      setPeers((_peers) => [..._peers, peer]);
    });

    emitter.on("addProducer", (producer: HuddleTypes.IProducer) => {
      console.log("new prod", producer);
      switch (producer.type) {
        case "webcam":
          const videoStream: MediaStreamTrack | null = producer.track;
          if (typeof videoStream == "object") {
            try {
              if (videoStream !== null) {
                meVideoElem.current.srcObject = getTrack(videoStream);
              }
            } catch (error: any) {
              console.error(error);
            }
          }
          break;
        case "mic":
          //do whatever
          break;
        case "screen":
          const screenStream: MediaStreamTrack | null = producer.track;
          if (typeof screenStream == "object") {
            try {
              if (screenStream !== null) {
                meScreenElem.current.srcObject = getTrack(screenStream);
              }
            } catch (error: any) {
              console.error(error);
            }
          }
          break;

        default:
          break;
      }
    });

    emitter.on("removeProducer", (producer: HuddleTypes.IProducer) => {
      console.log("remove ", producer);
      switch (producer.type) {
        case "webcam":
          try {
            meVideoElem.current.srcObject = null;
          } catch (error: any) {
            console.error(error);
          }
          break;
        case "mic":
          //do whatever
          break;
        case "screen":
          try {
            meScreenElem.current.srcObject = null;
          } catch (error: any) {
            console.error(error);
          }
          break;

        default:
          break;
      }
    });

    emitter.on("addConsumer", (consumer: HuddleTypes.IConsumer) => {
      switch (consumer.type) {
        case "webcam": {
          const videoStream = consumer.track;
          setConsumerStreams((prevState) => ({
            ...prevState,
            video: [...prevState.video, videoStream],
          }));

          break;
        }

        case "screen": {
          const screenStream = consumer.track;
          setConsumerStreams((prevState) => ({
            ...prevState,
            screen: [...prevState.screen, screenStream],
          }));
          break;
        }

        case "mic": {
          const audioStream = consumer.track;
          setConsumerStreams((prevState) => ({
            ...prevState,
            audio: [...prevState.audio, audioStream],
          }));

          break;
        }

        default:
          break;
      }
    });

    emitter.on("removeConsumer", (consumer: any) => {
      switch (consumer.type) {
        case "screen":
          setConsumerStreams((prevState) => {
            return {
              ...prevState,
              screen: prevState.screen.filter(
                (_consumer) => _consumer.id !== consumer._id
              ),
            };
          });
          break;
        case "webcam":
          setConsumerStreams((prevState) => {
            return {
              ...prevState,
              video: prevState.video.filter(
                (_consumer) => _consumer.id !== consumer._id
              ),
            };
          });
          break;
        case "mic":
          setConsumerStreams((prevState) => {
            return {
              ...prevState,
              audio: prevState.audio.filter(
                (_consumer) => _consumer.id !== consumer._id
              ),
            };
          });
          break;

        default:
          break;
      }
    });
  };

  const joinRoom = async () => {
    if (!huddle) return;
    try {
      setupEventListeners();
      await huddle.join();
    } catch (error: any) {
      alert(error);
    }
  };

  const leaveRoom = async () => {
    if (!huddle) return;
    try {
      await huddle.close();
      setRoomState("");
    } catch (error: any) {
      alert(error);
    }
  };

  //TODO: add pauseWebcam() and resumeWebcam()
  const enableWebcam = async () => {
    if (!huddle) return;
    try {
      await huddle.enableWebcam();
      setWebcamState(true);
    } catch (error: any) {
      setWebcamState(false);
      alert(error);
    }
  };

  const disableWebcam = async () => {
    if (!huddle) return;
    try {
      await huddle.disableWebcam();
      setWebcamState(false);
    } catch (error: any) {
      alert(error);
    }
  };

  const startScreenshare = async () => {
    if (!huddle) return;
    try {
      await huddle.enableShare();
      setScreenshareState(true);
    } catch (error: any) {
      alert(error);
      setScreenshareState(false);
    }
  };

  const stopScreenshare = async () => {
    if (!huddle) return;
    try {
      await huddle.disableShare();
      setScreenshareState(false);
    } catch (error: any) {
      alert(error);
    }
  };

  //TODO: add muteMic() and unmuteMic()
  const enableMic = async () => {
    if (!huddle) return;
    try {
      huddle.enableMic();
      setMicState(true);
    } catch (error: any) {
      setMicState(false);
      alert(error);
    }
  };

  const disableMic = async () => {
    if (!huddle) return;
    try {
      huddle.disableMic();
      setMicState(false);
    } catch (error: any) {
      alert(error);
      setMicState(true);
    }
  };

  const startRecording = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.startRecording();
      if (status) {
        console.log("recording successfully initiated");
        setRecordingState(true);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const stopRecording = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.stopRecording();
      if (status) {
        console.log("recording successfully stopped");
        setRecordingState(false);
      }
    } catch (error: any) {
      console.error(error);
    }
  };
  const startStreaming = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.startStreaming();
      if (status) {
        console.log("Streaming successfully started");
        setStreamingState(true);
      }
    } catch (error: any) {
      console.error(error);
    }
  };
  const stopStreaming = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.stopStreaming();
      if (status) {
        console.log("Streaming successfully stopped");
        setStreamingState(false);
      }
    } catch (error: any) {
      console.error(error);
    }
  };
  return (
    <div className="App">
      <div className="me-ports">
        <video height="400px" width="400px" autoPlay ref={meVideoElem} />
        <video height="400px" width="400px" autoPlay ref={meScreenElem} />
      </div>
      <div className="btn-grp">
        <button
          ref={joinRoomBtn}
          id="join-btn"
          onClick={roomState === "connected" ? leaveRoom : joinRoom}
        >
          {roomState === "connected" ? "Leave Room" : "Join Room"}
        </button>
        <button onClick={webcamState ? disableWebcam : enableWebcam}>
          {webcamState ? "Disable Webcam" : "Enable Webcam"}
        </button>
        <button onClick={micState ? disableMic : enableMic}>
          {micState ? "Disable Mic" : "Enable Mic"}
        </button>
        <button onClick={screenshareState ? stopScreenshare : startScreenshare}>
          {screenshareState ? "Disable Screenshare" : "Enable Screenshare"}
        </button>{" "}
        <button onClick={recordingState ? stopRecording : startRecording}>
          {recordingState ? "Disable Recording" : "Enable Recording"}
        </button>
        <button onClick={streamingState ? stopStreaming : startStreaming}>
          {streamingState ? "Disable Streaming" : "Enable Streaming"}
        </button>
        {/* <button onClick={toggleWebcam}>Toggle Webcam</button> */}
      </div>

      <div className="peer-ports">
        {consumerStreams.video.map((stream, idx) => {
          return <PeerVideo key={idx} videoTrack={getTrack(stream)} />;
        })}
        {consumerStreams.screen.map((stream, idx) => {
          return <PeerScreen key={idx} screenTrack={getTrack(stream)} />;
        })}
        {consumerStreams.audio.map((stream, idx) => {
          return <PeerAudio key={idx} audioTrack={getTrack(stream)} />;
        })}
      </div>
    </div>
  );
}

export default Room;
