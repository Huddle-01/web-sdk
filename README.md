# Huddle01 Web SDK

## Getting Started

1. **Get the Huddle01 JS SDK**

```text
$ npm install --save huddle01-client
```

OR

```javascript
$ yarn add huddle01-client
```

1. **Get your API Key:** You can get your access keys in the Developer section of the Huddle01 Dashboard
2. **Import modules & instantiate Huddle01 Client. Also import the HuddleTypes and HuddleClientConfig to access the types**

```typescript
import HuddleClient, { emitter, HuddleTypes, HuddleClientConfig, } from "huddle01-client";
```

**The infrastructure mandates a schema on the URL** of the type `https://domain.com/room?roomId=C132`

Thus, on component mount, we add:

```typescript
history.push(`?roomId=${config.roomId}`);
```

> NOTE: functionality of livestreaming and recording working on your application is subject to mandating the above specified schema on your URL 

Initialise a new object

```typescript
const huddle: HuddleClient = new HuddleClient(config);
```

where `config` is of type `HuddleClientConfig` which is exported from the npm package.

Along with this, `HuddleTypes` containing types for Producer, Consumer and Peer are also exported from the npm package.

An example `config` object can be given as

```typescript
//write this as it is -- used to check for the recorder
const isRecorderBot = localStorage.getItem("bot_password") === "huddle01";

const config: HuddleClientConfig = {
  apiKey: "<API Key>",          // API KEY (issued on the dashboard)
  roomId: "C132",               // Room ID
  peerId: "rick254",            // Peer ID (needs to be unique for every peer)
  displayName: "Rick Sanchez",  // Display Name
  window,                       // Your browser's window object
  isBot,                        // bot flag
};
```

By this step, you should be connected to the Huddle servers.

**To allow recordings**, make sure to add:

```typescript
huddle && isRecorderBot && joinRoomBtn.click();
```

**Where:**

**huddle:** the huddle-client object of type HuddleClient

**isRecorderBot:** the boolean that checks if the user is a recorder bot or not

**joinRoomBtn:** the button

### Setting up event listeners

The emitter that we imported in the 1st step is used to emit events by Huddle about your application. Please refer to the demo app for application references

**The various types of events are:**

1. **Trigger:** on room status changes  
   **Return value:** error object

   ```typescript
    emitter.on("roomState", (state: string) => {
      //do whatever (ideally switch-case between all state types)
    });
   ```

   **Different state types:**

   | connected | failed | disconnected |
   | :--- | :--- | :--- |
   | successfully connected to the room | failure in connection to the room | successfully disconnected from the room |

2. **Trigger:** an error event on client/server side  
   **Return value:** error object

   ```typescript
    emitter.on("error", (error: any) => {
      //do whatever
    });
   ```

3. **Trigger:** new peer joins the room  
   **Return value:** an entire peer object with all the details about the peer of the type `HuddleTypes.IPeer`

   ```typescript
    emitter.on("addPeer", (peer: IPeer) => {
      //do whatever
    });
   ```

4. **Trigger:** you have a new producer producing to the Huddle servers  
   **Return value:** an producer object with details like your production media track \(eg. webcam/mic/screenshare\) of the type `HuddleTypes.IProducer`.

   ```typescript
    emitter.on("addProducer", (producer: IProducer) => {
      //do whatever (ideally switch-case between all state types)
    });
   ```

   **Different state types:**

   `producer.type:`

   | webcam | mic | screenshare |
   | :--- | :--- | :--- |
   | a webcam stream consumer | a mic stream consumer | a screenshare stream consumer |

5. **Trigger:** you have a new consumer consuming from the Huddle servers **Return value:** a consumer object with details like your consumption media track \(eg. webcam/mic/screenshare\) of the type `HuddleTypes.IConsumer`

```typescript
    emitter.on("addConsumer", (consumer: IConsumer) => {
      //do whatever (ideally switch-case between all state types)
    });
```

```text
#### Different state types:

`consumer.type:`

| webcam                   | mic                   | screenshare                   |
| :----------------------- | :-------------------- | :---------------------------- |
| a webcam stream consumer | a mic stream consumer | a screenshare stream consumer |
```

1. **Trigger:** one of the existing peers disconnects from the room  
   **Return value:** an entire peer object with all the details about the peer of the type `HuddleTypes.IPeer`\(same as the object received on the "add" event\)

   ```typescript
    emitter.on("removePeer", (peer: IPeer) => {
      //do whatever
    });
   ```

2. **Trigger:** you have closed the production of your existing producer to the Huddle servers  
   **Return value:** a producer object with details like your production media track \(eg. webcam/mic/screenshare\) peer of the type `HuddleTypes.IProducer` \(same as the object received on the "add" event\)

   ```typescript
    emitter.on("removeProducer", (producer: IProducer) => {
      //do whatever (ideally switch-case between all state types)
    });
   ```

   **Different state types:**

   `producer.type:`

   | webcam | mic | screenshare |
   | :--- | :--- | :--- |
   | a webcam stream producer | a mic stream producer | a screenshare stream producer |

3. **Trigger:** you have closed the production of your existing producer to the Huddle servers  
   **Return value:** a consumer object with details like your consumption media track \(eg. webcam/mic/screenshare\) peer of the type `HuddleTypes.IConsumer` \(same as the object received on the "add" event\)

   ```typescript
    emitter.on("removeConsumer", (consumer: IConsumer) => {
      //do whatever (ideally switch-case between all state types)
    });
   ```

   **Different state types:**

   `consumer.type:`

   | webcam | mic | screenshare |
   | :--- | :--- | :--- |
   | a webcam stream consumer | a mic stream consumer | a screenshare stream consumer |

All the data/states received by events need to be maintained by you in your app. Can be achieved using React states/redux or any similar implementations.

Please refer to the demo app where we use local React states to handle these data.

### Methods Available:

* **huddle.join\(\)**

  Example given below:

  ```typescript
  const joinRoom = async () => {
    if (!huddle) return;
    try {
      setupEventListeners();
      await huddle.join();
    } catch (error: any) {
      alert(error);
    }
  };
  ```

* **huddle.close\(\)**

  `close()` can only be called after `join()` is successful

  Example given below:

  ```typescript
  const leaveRoom = async () => {
    if (!huddle) return;
    try {
      await huddle.close();
      setRoomState(false);
    } catch (error: any) {
      alert(error);
    }
  };
  ```

* **huddle.enableWebcam\(\)**
* **huddle.enableMic\(\)**
* **huddle.enableShare\(\)**

  Example given below:

  ```typescript
  const enableWebcam = async () => {
    if (!huddle) return;
    try {
      await huddle.enableWebcam();
      setWebcamState(true);
    } catch (error: any) {
      alert(error);
    }
  };
  ```

* **huddle.disableWebcam\(\)**
* **huddle.disableShare\(\)**
* **huddle.disableMic\(\)**

  Example given below:

  ```typescript
  const disableWebcam = async () => {
    if (!huddle) return;
    try {
      await huddle.disableWebcam();
      setWebcamState(false);
    } catch (error: any) {
      alert(error);
    }
  };
  ```

  **NOTE:** `enable()` functions need to be called and have returned success first before calling any of the `disable()`counterparts

* **huddle.startRecording\(\)**

  ```typescript
  const startRecording = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.startRecording();
      if (status !== true)
        console.error("an error occurred while initiating recording");
      console.log("recording initiated");
    } catch (error: any) {
      console.error(error);
    }
  };
  ```

* **huddle.stopRecordig\(\)**

  ```typescript
  const stopRecorder = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.stopRecording();
      if (status !== true)
        console.error("an error occurred while initiating recording");
      console.log("recording initiated");
    } catch (error: any) {
      console.error(error);
    }
  };
  ```

* **huddle.startStreaming\(\)**

  ```typescript
  const startStreaming = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.startStreaming();
      if (status !== true)
        console.error("an error occurred while initiating streaming");
      console.log("streaming initiated");
    } catch (error: any) {
      console.error(error);
    }
  };
  ```

* **huddle.stopStreaming\(\)**

  ```typescript
  const stopStreaming = async () => {
    if (!huddle) return;
    try {
      const status: boolean = await huddle.stopStreaming();
      if (status !== true)
        console.error("an error occurred while initiating streaming");
      console.log("streaming stopped");
    } catch (error: any) {
      console.error(error);
    }
  };

**NOTE:** Recordings and live-streaming will only work in production environments \(or reach out to the team to run a local process of the recorder on your machine if you want to test in development environments\)

