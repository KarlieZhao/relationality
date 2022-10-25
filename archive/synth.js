// for legacy browsers
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();

let audioSources = [];

let getAudioSource;

// // https://stackoverflow.com/questions/17944496/html5-audio-player-drag-and-drop
// window.addEventListener("load", function() {
//   // var dropzone = document.querySelector('#dropzone');
//   // maybe not needed
//   for(const dropzone of document.querySelectorAll(".sample")) {
//   dropzone.addEventListener("drop", handleDrop, false);
//   dropzone.addEventListener("dragover", handleDragOver, false);
//   }
//   var dropzone = document.body;
//   dropzone.addEventListener("drop", handleDrop, false);
//   dropzone.addEventListener("dragover", handleDragOver, false);
// });

// var handleDragOver = function(e) {
//   e.preventDefault();
//   e.stopPropagation();
// };

// var handleDrop = function(e) {
//   e.preventDefault();
//   e.stopPropagation();
//   let index = 0;
//   if(e.target.id.startsWith("sample")) {
//     index = e.target.id.split("sample")[1];
//   }
//   else {
//     return;
//   }
//   console.log("dropped in", index);

//   var files = e.dataTransfer.files;
//   for (var i = 0; i < files.length; i++) {
//     var file = files[i];
//     var reader = new FileReader();
//     document.querySelector(`#sample${index} > p`).innerText = file.name;
//     reader.addEventListener("load", function(e) {
//       var data = e.target.result;
//       audioContext.decodeAudioData(data, function(buffer) {
//         playSound(buffer, index);
//       });
//     });
//     reader.readAsArrayBuffer(file);
//   }
// };

let sources = [audioContext.createBufferSource(), audioContext.createBufferSource()];

var playSound = function(buffer, index) {
  sources[index] = audioContext.createBufferSource();
  sources[index].buffer = buffer;
  sources[index].loop = true;
  sources[index].start();
};

getAudioSource = (index) => {
  return sources[index];
};

// not working
// audio lines
var q0 = 0,
  q1 = 1,
  q2 = 2,
  q3 = 3;
const offlineContexts = [];
for (let i = 0; i < 4; i++) {
  offlineContexts[i] = new OfflineAudioContext(2, 44100 * 40, 44100);
}

var analyser = audioContext.createAnalyser();
analyser.fftSize = 1024;
var bufferLength = analyser.frequencyBinCount;
var analyserBuffer = new Uint8Array(bufferLength);

var analyserWave = audioContext.createAnalyser();
analyserWave.fftSize = 1024;
var bufferLength2 = analyserWave.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength2);

const WIDTH = 1200;
const HEIGHT = 400;
var waveFormCanvas = document.createElement("canvas");
var canvasCtx = waveFormCanvas.getContext("2d");
canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

var mouseX = 0,
  mouseY = 0,
  time = 0,
  speed = 2;

document.onmousemove = function(event) {
  var eventDoc, doc, body;

  event = event || window.event; // IE-ism

  // If pageX/Y aren't available and clientX/Y are,
  // calculate pageX/Y - logic taken from jQuery.
  // (This is to support old IE)
  if (event.pageX == null && event.clientX != null) {
    eventDoc = (event.target && event.target.ownerDocument) || document;
    doc = eventDoc.documentElement;
    body = eventDoc.body;

    event.pageX =
      event.clientX +
      ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
      ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
    event.pageY =
      event.clientY +
      ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
      ((doc && doc.clientTop) || (body && body.clientTop) || 0);
  }

  mouseX = Math.max(0, Math.min(100000, event.pageX));
  mouseY = Math.max(0, Math.min(100000, event.pageY));
  // Use event.pageX / event.pageY here
};

let updaters = [];
{
  const startTime = new Date() / 1000;
  const updater = () => {
    time = new Date() / 1000 - startTime;
    analyser.getByteFrequencyData(analyserBuffer);
    analyserWave.getByteTimeDomainData(dataArray);

    var sliceWidth = (WIDTH * 1.0) / bufferLength;
    var x = 0;
    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = (v * 255) / 2;

      canvasCtx.fillStyle = `rgb(${y}, ${y}, ${y})`;
      canvasCtx.fillRect(x, 0, sliceWidth, HEIGHT);

      x += sliceWidth;
    }

    for (const u of updaters) {
      u.f();
    }

    setTimeout(updater, 5);
  };
  updater();
}

// register to the updater if needed
function addValue(obj, func, val) {
  if (typeof val === "function") {
    if (typeof obj[func] === "function") {
      updaters.push({
        f: () => {
          obj[func](val());
        }
      });
    } else {
      updaters.push({
        f: () => {
          obj[func] = val();
        }
      });
    }
  } else if (Array.isArray(val)) {
    if (typeof obj[func] === "function") {
      updaters.push({
        f: () => {
          obj[func](val[Math.floor((time * speed) % val.length)]);
        }
      });
    } else {
      updaters.push({
        f: () => {
          obj[func] = val[Math.floor((time * speed) % val.length)];
        }
      });
    }
  } else {
    if (typeof obj[func] === "function") {
    } else {
      obj[func] = val;
    }
  }
}

const synths = [];

function hushSound() {
  for (let i = synths.length - 1; i >= 0; i--) {
    if (synths[i] !== undefined) {
      for (const s of synths[i]) {
        if (s.stop !== undefined) {
          s.stop();
        }
        s.disconnect();
      }
    }
    synths.pop();
  }
}

function runCode(code) {
  updaters = [];
  eval(code);
}

class Synthesizer {
  constructor({ toneSynth, objSynth }) {
    if (toneSynth !== undefined) {
      this.source = toneSynth;
      this.outlet = toneSynth;
    } else {
      // ???????
      this.outlet = objSynth.outlet;
      this.source = objSynth.source;
      this.play = objSynth.play;
    }
    this.queue = [];
  }
  out(index = q0) {
    // // BAD!!!
    // and this needs whole structural change to work
    // if (index == q0) {
    //   this.outlet.connect(audioContext.destination);
    //   // this.outlet.connect(offlineContexts[index].destination);
    // } else {
    //   this.outlet.connect(offlineContexts[index].destination);
    // }
    this.queue.push(this.source);
    // console.log("index", index)
    if (synths[index] != null || synths[index] != undefined) {
      console.log("index", index);
      for (const s of synths[index]) {
        if (s.stop !== undefined) {
          s.stop();
        }
        s.disconnect();
      }
    }
    synths[index] = this.queue;
    this.play();
    this.outlet.connect(audioContext.destination);
    this.outlet.connect(analyser);
    this.outlet.connect(analyserWave);
  }
  gain(v = 1) {
    const g = audioContext.createGain();
    this.outlet.connect(g);
    addValue(g.gain, "value", v);
    this.outlet = g;
    return this;
  }
  // feedback(delayTime, amount) {
  //   const effect = new Tone.FeedbackDelay();
  //   this.outlet.connect(effect);
  //   this.outlet = effect;
  //   addValue(effect.delayTime, "value", delayTime);
  //   addValue(effect.feedback, "value", amount);
  //   return this;
  // }
  crush(bits = 8) {
    const effect = bitcrusher(audioContext, {
      bitDepth: 32,
      frequency: 1
    });
    this.outlet.connect(effect);
    this.outlet = effect;
    addValue(effect, "bitDepth", bits);
    return this;
  }
  lpf(f = 1000) {
    const effect = audioContext.createBiquadFilter();
    effect.type = "lowpass";
    addValue(effect.frequency, "value", f);
    effect.gain.setValueAtTime(25, audioContext.currentTime);
    this.outlet.connect(effect);
    this.outlet = effect;
    return this;
  }
  hpf(f = 1000) {
    const effect = audioContext.createBiquadFilter();
    effect.type = "highpass";
    addValue(effect.frequency, "value", f);
    effect.gain.setValueAtTime(25, audioContext.currentTime);
    this.outlet.connect(effect);
    this.outlet = effect;
    return this;
  }
  mult(s) {
    this.queue.push(s.outlet);
    const g = audioContext.createGain();
    this.outlet.connect(g.gain);
    s.outlet.connect(g);
    this.outlet = g;
    return this;
  }
  add(s, v = 1) {
    this.queue.push(s.outlet);
    const gs = audioContext.createGain();
    s.outlet.connect(gs);
    addValue(gs.gain, "value", v);
    const g = audioContext.createGain();
    this.outlet.connect(g);
    gs.connect(g);
    this.outlet = g;
    return this;
  }
  blend(s, v = 0.5) {
    this.queue.push(s.outlet);
    // this outlet
    const go = audioContext.createGain();
    addValue(go.gain, "value", v);
    this.outlet.connect(go);    
    
    // s, -1
    const gm = audioContext.createGain();
    gm.gain.value = -1;
    s.outlet.connect(gm);
    
    // s, v
    const gs = audioContext.createGain();
    addValue(gs.gain, "value", v);
    s.outlet.connect(gs);
    
    // add all
    const g = audioContext.createGain();
    go.connect(g);
    gm.connect(g);
    gs.connect(g);
    this.outlet = g;
    return this;
  }
  modulate(s, v = 100) {
    this.queue.push(s.outlet);
    this.modulator = s;

    const g = audioContext.createGain();
    s.outlet.connect(g);
    addValue(g.gain, "value", v);
    g.connect(this.source.detune);

    return this;
  }
  play() {
    for (const s of this.queue) {
      if (s.start !== undefined) {
        s.start();
      }
    }
  }
}

// needed???
class WaveSynthesizer extends Synthesizer {
  constructor({ toneSynth: s }) {
    super({ toneSynth: s });
  }
}

const keyTable = {
  C: 24,
  "C#": 25,
  D: 26,
  "D#": 27,
  E: 28,
  F: 29,
  "F#": 30,
  G: 31,
  "G#": 32,
  A: 33,
  "A#": 34,
  B: 35
};
const keyOrder = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];
const midiToNote = _keyNum => {
  const keyNum = _keyNum.toUpperCase();
  const k = /[A-Z]#?/.exec(keyNum)[0];
  const n = /\d+/.exec(keyNum)[0];
  return keyTable[k] + 12 * n;
};

function noteToFreq(m) {
  let tuning = 440;
  if (isNaN(m) || m > 120 || m <= 0) return Math.random() * midiToFreq(100);
  return Math.pow(2, (m - 69) / 12) * tuning;
}

class Oscillator extends WaveSynthesizer {
  constructor(_f, type = "sine") {
    const s = audioContext.createOscillator();
    // const s = offlineContexts[1].createOscillator();

    s.type = type;
    super({ toneSynth: s });
    let f = _f;
    if (typeof _f == "string") {
      f = noteToFreq(midiToNote(_f));
    } else if (Array.isArray(_f)) {
      f = [];
      for (const el of _f) {
        if (typeof el == "string") {
          f.push(noteToFreq(midiToNote(el)));
        } else {
          f.push(el);
        }
      }
    }
    this.freq = f;
    addValue(s.frequency, "value", f);
  }
}

const sine = (freq = 440) => {
  return new Oscillator(freq);
};

const tri = (freq = 440) => {
  return new Oscillator(freq, "triangle");
};

const square = (freq = 440) => {
  return new Oscillator(freq, "square");
};

class WhiteNoise extends Synthesizer {
  constructor() {
    // https://noisehack.com/generate-noise-web-audio-api/
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    var whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    super({ toneSynth: whiteNoise });
  }
}

const wnoise = () => {
  return new WhiteNoise();
};

// class Bus extends Synthesizer {
//   constructor(index) {
//     const s = audioContext.createBufferSource();
//     setTimeout(()=>{
//     offlineContexts[index]
//       .startRendering()
//       .then(function(renderedBuffer) {
//         console.log("Rendering completed successfully");
//         s.buffer = renderedBuffer;
//         // s.start();
//       })
//       .catch(function(err) {
//         console.log("Rendering failed: " + err);
//         // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
//       });
//     }, 20);

//     super({ toneSynth: s });
//   }
// }

// const bus = (index = q0) => {
//   return new Bus(index);
// }

// class Mic extends WaveSynthesizer {
//   constructor() {
//     const s = getAudioSource();
//     super({ toneSynth: s });
//   }
// }

// const mic = () => {
//   return new Mic();
// };

var samplegain;
var globalPlaybackRate = 1;

class Sample extends WaveSynthesizer {
  constructor(index) {
    // const s = getAudioSource(index);
    // s.playbackRate.value = 1;
    // const s = audio
    // console.log(audio)
    // audio.mediaElement.play()
    samplegain = audioContext.createGain();
    // s.connect(samplegain);
    super({ toneSynth: samplegain });
    // this.sample = s;
  }
  speed(v) {
    globalPlaybackRate = v;
    // addValue(this.sample.playbackRate, "value", v);

    return this;
  }
}

const sample = (index = 0) => {
  return new Sample(index);
};