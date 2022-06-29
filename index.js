import * as wasm from "hands";

import { EventHandler } from "hands";

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const rectangle = document.getElementsByClassName('inner-box')[0];
const fpsCounter = document.getElementById('fps-counter');
const pre = document.getElementById("hands");
const event = EventHandler.new();

let getFingerCoords = (finger) => {
    let fingerX = 1280 * finger.x;
    let fingerY = 720 * finger.y;
    return [fingerX, fingerY];
}

// work with canvas
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
        { color: 'red', lineWidth: 2 });
      drawLandmarks(canvasCtx, landmarks, { color: 'yellow', lineWidth: 1 });
      let results = [];  
      for (let i = 0; i < 21; i ++) {
            let a = getFingerCoords(landmarks[i]);
            results.push(a[0]);
            results.push(a[1]);
        };
      let res = event.compute(wasm.array_test(results));
      console.log(results);
      console.log(res);
      if (res == "Activated" || res == "Action cancelled" 
      || res == "Close action" || res.includes("Waiting")) {
        rectangle.classList.add('color')
        } else {
          rectangle.classList.remove('color')
        }
      }
    }
  }
  canvasCtx.restore();

//something from mediapipe
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

//work with camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});

camera.start();


//FPS counter
let frameCount = function _fc(timeStart) {

  let now = performance.now();
  let duration = now - timeStart;

  if (duration < 100) {

    _fc.counter++;

  } else {

    _fc.fps = _fc.counter * 10;
    _fc.counter = 0;
    timeStart = now;
    fpsCounter.innerHTML = `${_fc.fps + ' fps'}`;

  }

  requestAnimationFrame(() => frameCount(timeStart));
}

frameCount.counter = 0;
frameCount.fps = 0;

frameCount(performance.now())