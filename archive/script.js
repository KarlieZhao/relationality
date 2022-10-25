/* global Torus jdom css */
/* global Hydra */
/* global hotkeys */
/* global CodeMirror */
/* global freesound */

freesound.setToken("zcY7Xe1bN9d3VnNmVhzHsfMWI7Pamkr53amV57B0");

var query = "piano"
var page = 1
var filter = ""
var sort = ""
var descriptors = ""

var audio

var playing = false

var s

function search(query, t0 = 0, t1 = 2.0, f) {
  let filter = `duration:[${t0} TO ${t1}]`;
  let target = f !== undefined ? `.tonal.hpcp_entropy.mean:${f}` : "";
  freesound.textSearch(query, { filter, target },
     function (sounds) {
      app.soundApp.sounds = []
      for (let i = 0; i < 1; i++) {
        var snd = sounds.getSound(i);
        freesound.getSound(snd.id,
        function (sound) {
          let a = new Audio(sound.previews['preview-hq-mp3']);
          a.setAttribute("crossorigin", "anonymous");
          if(app.soundApp.sounds.length >= 10) app.soundApp.sounds.shift()
          
          let onclick = ()=>{
            let tags = [...sound.tags, ""];
            let n = sound.tags.length;
            for(let i = 0; i < n+1; i++) {
              // setTimeout(() => {
              //   // p(tags[i]).scrollX((i-1)/3*0).bg(255,255,255).out(0)
              //   app.hydraApp.textCtx.clearRect(0,0,window.innerWidth,window.innerHeight)
              //  let name = adjectives[Math.floor(Math.random()*adjectives.length)]// + "\n" + tags[i] 
              //  if (tags[i] === "") name = ""
              //  app.hydraApp.textCtx.fillText(name, window.innerWidth/2, window.innerHeight/2-50);
              //  app.hydraApp.textCtx.fillText(tags[i], window.innerWidth/2, window.innerHeight/2+50);
              // }, t1 * 1000 / globalPlaybackRate / (n+1) * i)
                                       }
            audio = audioContext.createMediaElementSource(a)
            a.playbackRate = globalPlaybackRate
            audio.connect(samplegain)
            a.play()
            playing = true
            a.onended = () => {
              // if (playing) {
                codeDaemon.setTarget();
                console.log("on to next one");
                playing = false;
              // }
            }
          }
            
            onclick()
          
  //           app.soundApp.sounds.push( jdom`
  // <div style="display:inline"><button onclick=${onclick}>${sound.name}</button></div>
  // `)
  //           app.soundApp.render()
          })
      }
    }, function (e) { console.log(e); codeDameon.setTarget() }
  );
}

class HydraApp extends Torus.StyledComponent {
  init() {
    this.canvas = document.createElement("CANVAS");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.hydra = new Hydra({
      canvas: this.canvas,
      detectAudio: false,
      enableStreamCapture: false
    });
    setTimeout(()=>
    s0.init({src: waveFormCanvas}),4000)
    
    setFunction({
      name: 'sampleY',
      type: 'coord',
      inputs: [
        {name: 'ypos', type: 'float', default: 0.0},
      ],
      glsl:
       `return vec2(_st.x, ypos);`
    });
    setFunction({
      name: 'sampleX',
      type: 'coord',
      inputs: [
        {name: 'xpos', type: 'float', default: 0.0},
      ],
      glsl:
       `return vec2(xpos, _st.y);`
    });
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    this.textCtx = ctx;

    ctx.font = `${100}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('Hello world', window.innerWidth/2,window.innerHeight/2);
    
    s1.init({src:canvas})

    
    window.addEventListener('resize',
      () => {
      this.hydra.setResolution(window.innerWidth, window.innerHeight);
    ctx.font = `${100}px monospace`;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }, true);
  }
  styles() {
    return css`
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
      background-color: black;
    `
  }
  compose() {
    return jdom`<div>${this.canvas}</div>`;
  }
}

class CodeApp extends Torus.StyledComponent {
  init() {
    this.el = document.createElement("TEXTAREA");
    this.console = "";
    this.consoleClass = "";
    this.showEditor = true;

    // https://github.com/ojack/hydra/blob/3dcbf85c22b9f30c45b29ac63066e4bbb00cf225/hydra-server/app/src/editor.js
    this.flashCode = (l0, l1) => {
      if (l0 === undefined) l0 = this.cm.firstLine();
      if (l1 === undefined) l1 = this.cm.lastLine() + 1;
      let count = 0;
      for (let l = l0; l < l1; l++) {
        const start = { line: l, ch: 0 };
        const end = { line: l + 1, ch: 0 };
        const marker = this.cm.markText(start, end, {
          css: "background-color: #fec418;"
        });
        setTimeout(() => marker.clear(), 300);
        count++;
      }
    };

    const getLine = () => {
      const c = this.cm.getCursor();
      const s = this.cm.getLine(c.line);
      this.flashCode(c.line, c.line + 1);
      return s;
    };

    this.getCurrentBlock = () => {
      // thanks to graham wakefield + gibber
      const pos = this.cm.getCursor();
      let startline = pos.line;
      let endline = pos.line;
      while (startline > 0 && this.cm.getLine(startline) !== "") {
        startline--;
      }
      while (endline < this.cm.lineCount() && this.cm.getLine(endline) !== "") {
        endline++;
      }
      const pos1 = {
        line: startline,
        ch: 0
      };
      const pos2 = {
        line: endline,
        ch: 0
      };
      const str = this.cm.getRange(pos1, pos2);

      this.flashCode(startline, endline);

      return str;
    };

    this.evalCode = c => {
      try {
        let result = eval(c);
        if (result === undefined) result = "";
        this.console = result;
        this.consoleClass = "normal";
        // localStorage.setItem("hydracode", this.cm.getValue());
      } catch (e) {
        console.log(e);
        this.console = e + "";
        this.consoleClass = "error";
      }
      this.render();
    };

    const commands = {
      evalAll: () => {
        const code = this.cm.getValue();
        this.flashCode();
        this.evalCode(code);
        const enc = btoa(encodeURIComponent(code));
        const params = new URLSearchParams(location.search);
        params.set('code', enc);
        window.history.replaceState({}, '', `${location.pathname}?${params}`);
      },
      toggleEditor: () => {
        this.showEditor = !this.showEditor;
        this.render();
      },
      evalLine: () => {
        const code = getLine();
        this.evalCode(code);
      },
      toggleComment: () => {
        this.cm.toggleComment();
      },
      evalBlock: () => {
        const code = this.getCurrentBlock();
        this.evalCode(code);
      }
    };

    const keyMap = {
      evalAll: { key: "ctrl+shift+enter" },
      toggleEditor: { key: "ctrl+shift+h" },
      toggleComment: { key: "ctrl+/" },
      evalLine: { key: "shift+enter,ctrl+enter" },
      evalBlock: { key: "alt+enter" }
    };

    // enable in textarea
    hotkeys.filter = function(event) {
      return true;
    };
    const commandNames = Object.keys(keyMap);
    for (const commandName of commandNames) {
      const hk = keyMap[commandName];
      if (typeof commands[commandName] === "function") {
        hotkeys(hk.key, function(e, hotkeyHandler) {
          e.preventDefault();
          commands[commandName]();
        });
      }
    }
  }
  styles() {
    return css`
      position: relative;
      height: 100%;
      overflow: hidden;
      .editor-container {
        position: relative;
        height: 100%;
      }
      .editor-console {
        font-family: monospace;
        font-variant-ligatures: no-common-ligatures;
        font-size: 14pt;
        color: #fff;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1;
        background-color: rgba(0, 0, 0, 0.5);
      }
      .error {
        color: crimson;
      }
      .hide {
        visibility: hidden;
      }
    `;
  }
  render() {
    let r = super.render();
    return r;
  }
  loaded() {
    if (this.cm == undefined) {
      this.cm = CodeMirror.fromTextArea(this.el, {
        theme: "paraiso-dark",
        value: "a",
        mode: { name: "javascript", globalVars: true },
        lineWrapping: true,
        styleSelectedText: true
      });      
      
      const urlParams = new URLSearchParams(window.location.search);
      let code = `
//click to start

`;
      const c = urlParams.get("code");
      if (c !== null) code = decodeURIComponent(atob(c));

      this.cm.setValue(code);
      this.evalCode(this.cm.getValue());
    }
    this.cm.refresh();
  }
  setCode(c) {
    this.cm.setValue(c)
  }
  compose() {
    return jdom`
    <div>
      <div class="editor-container ${this.showEditor ? "" : "hide"}">
        ${this.el}
      </div>
    
      <div class="editor-console">
      >> <code class="${this.consoleClass}">${this.console}</code>
      </div>
    </div>
    `;
  }
}

class MenuApp extends Torus.StyledComponent {
  init(app) {
    this.name = window.location.hostname;
    this.app = app;
  }
  styles() {
    return css`
    background-color: rgba(0,0,0,0.5);
    color: white;
    display: flex;
    justify-content: space-between;
    padding: 0 .1em 0 .1em;
    margin: 0;
    flex: 1 1 auto;
    
    .inline {
      display: inline;
    }
    .pointer {
      cursor: pointer;
    }
    `
  }
  compose() {
    return jdom`
    <div>
      <div class="url">🌐${this.name}</div>
      <div class="pointer" onclick="${() => this.app.toggleDialog()}">🔰info</div>
    </div>
    `;
  }
}

class SoundApp extends Torus.StyledComponent {
  init(app) {
    this.name = window.location.hostname;
    this.app = app;
    this.sounds = [];
  }
  styles() {
    return css`
    background-color: rgba(0,0,0,0.5);
    color: white;
    display: flex;
    justify-content: space-between;
    padding: 0 .1em 0 .1em;
    margin: 0;
    flex: 1 1 auto;
    
    position: absolute;
    bottom: 0;
    z-index: 10;
    
    .inline {
      display: inline;
    }
    .pointer {
      cursor: pointer;
    }
    `
  }
  compose() {
    return jdom`
    <div>
      Sounds
      <div>${ this.sounds }</div>
    </div>
    `;
  }
}

class InfoApp extends Torus.StyledComponent {
  init(app) {
    this.app = app;
  }
  styles() {
    return css`
      background-color: rgba(255, 255, 255, 0.9);
      color: black;
      border-radius: 1em;
      padding: 1em;
      box-shadow: 0 0 10px black;
      max-width: 500px;
      .title {
        font-weight: bold;
      }
      a {
        /*font-weight: bold;*/
        color: black;
      }
      div {
        margin: .5em 0 .5em 0;
      }
    `
  }
  compose() {
    return jdom`
    <div>
      <div class="title">hydra-editor-torus</div>
      <div>This project is a small <a href="https://github.com/ojack/hydra-synth/" target="_blank">Hydra</a> editor made with <a href="https://github.com/thesephist/torus" target="_blank">Torus</a> JavaScript framework. Feel free to <a href="https://glitch.com/edit/#!/hydra-editor-torus" target="_blank">remix</a> the project to make your own editor!</div>
      <div>Naoto Hieda 2021</div>
      <button onclick="${()=>this.app.toggleDialog()}">close</button>
    </div>
    `;
  }
}

class App extends Torus.StyledComponent {
  init() {
    this.dialog = false;
    this.hydraApp = new HydraApp();
    this.codeApp = new CodeApp();
    this.menuApp = new MenuApp(this);
    this.infoApp = new InfoApp(this);
    this.soundApp = new SoundApp(this);
  }
  toggleDialog() {
    this.dialog = !this.dialog;
    this.render();
  }
  styles() {
    return css`
      position: absolute;
      width: 100%;
      height: 100%;
      .container {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2;
      }
      .dialog {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3;
        background-color: rgba(0, 0, 0, 0.3);
      }
      .hide {
        display: none;
      }
      
      #party-venue {
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
      }
    `;
  }
  compose() {
    return jdom`
    <div class="wrapper">
      ${this.hydraApp.node}
      <div class="container">
        ${this.menuApp.node}
        ${this.codeApp.node}
        <div id="party-venue" />
      </div>
      <div id="dialogback" class="dialog ${this.dialog ? "" : "hide"}" onclick="${(e)=>e.target.id=="dialogback"&&this.toggleDialog()}">
        ${this.infoApp.node}
      </div>
    </>`;
  }
  loaded() {
    this.codeApp.loaded();
  }
}

let codes = [
  `s=()=>osc(6,0.1).contrast(0.5).layer(src(s1))
s().color(1,0,0).add(s().color(0,1,0).modulate(solid(1),()=>analyserBuffer[0]/1000)).add(s().color(0,0,1).modulate(solid(1),()=>analyserBuffer[2]/400)).modulate(src(s0).rotate(1.6).brightness(-.5),4/CR).saturate(SP)BONUS.out()

sample().speed(SP).crush(CR).out()
search(WORD,T0,T1)`,
  `s=()=>osc(6,0.1).contrast(0.5).layer(src(s1))
s().color(1,0,0).add(s().color(0,1,0).modulate(solid(1),()=>analyserBuffer[0]/1000)).add(s().color(0,0,1).modulate(solid(1),()=>analyserBuffer[2]/400)).modulate(noise(3),()=>analyserBuffer[0]/1000*4/CR).saturate(SP)BONUS.out()

sample().speed(SP).crush(CR).out()
search(WORD,T0,T1)`,
  `s=()=>osc(6,0.1).contrast(0.5).layer(src(s1))
s().color(1,0,0).add(s().color(0,1,0).modulate(solid(1),()=>analyserBuffer[0]/1000)).add(s().color(0,0,1).modulate(solid(1),()=>analyserBuffer[2]/400)).modulate(osc(3),()=>analyserBuffer[0]/1000*4/CR).saturate(SP)BONUS.out()

sample().speed(SP).crush(CR).out()
search(WORD,T0,T1)`,
]

class Code {
  constructor(i, codeApp) {
    this.i = i;
    this.codeApp = codeApp;
    this.text = "";
    this.state = "done";
    this.targetText = "";
    this.timeInterval = { type: 3, delete: 2 };
    this.timeVariance = { type: 0, delete: 0 };
    this.immediateMode = false;
    this.started = false;
    this.codeInterval = 1000 * 1;
    this.codeIndex;
  }
  setTimeInterval({type = 10, del = 5} = {}) {
    this.timeInterval.type = type;
    this.timeInterval.delete = del;
  }
  setCodeIndex(i) {
    this.codeIndex = i;
  }
  setImmediate(b) {
    this.immediateMode = b;
  }
  start() {
    if (this.started === false) {
      this.started = true;
      this.setTarget();
    }
  }
  pause() {
    this.started = false;
  }
  resume() {
    this.started = true;
    this.update();
  }
  toggle() {
    if (this.started) {
      this.pause();
    }
    else {
      this.resume();
    }
  }
  setTarget() {
    const func = codes[Math.floor(Math.random() * codes.length)];
    let words = ["train", "wind", "duck", "pigeon", "tokyo", "metro"]
    let bonus = [".colorama()", ".hue(0.5)", ".repeat(2,2)", ".modulateRotate(shape(999,0.1,0.3),()=>analyserBuffer[0]/1000*3)", ".modulate(osc(3),1)", "", ""]
    let cr = [4,8,16]
    let sp = [0.3,0.5,0.7,1]
    let t0;
    let t = func
      .toString()
      // .replace(/\s/g, "")
      .replace(/\(\)=>{(.*)}/, "$1")
      .replace(/WORD/, `'${words[Math.floor(Math.random() * words.length)]}'`)
      .replace(/CR/g, cr[Math.floor(Math.random() * cr.length)])
      .replace(/SP/g, sp[Math.floor(Math.random() * sp.length)])
      .replace(/BONUS/g, bonus[Math.floor(Math.random() * bonus.length)])
      .replace(/T0/, t0=Math.floor(Math.random() * 10))
      .replace(/T1/, t0+3+Math.floor(Math.random() * 10))
    this.targetText = t;
    if (this.targetText != this.text) {
      this.state = "delete";
      this.update();
    } else {
      if (this.started) {
        setTimeout(() => {
          this.setTarget();
        }, this.codeInterval);
      }
    }
  }
  update() {
    if (this.started === false) {
      return;
    }
    if (this.state === "delete") {
      this.text = this.text.substring(0, this.text.length - 1);
      this.codeApp.setCode(this.text);
      if (this.immediateMode) {
        this.text = "";
      }
      if (this.text.length == 0 || this.targetText.startsWith(this.text)) {
        this.state = "type";
      }
    } else if (this.state === "type") {
      this.text = this.text + this.targetText[this.text.length];
      if (this.immediateMode) {
        this.text = this.targetText;
      }
      this.codeApp.setCode(this.text);
      if (this.text.length == this.targetText.length) {
        this.state = "done";
        let execCode = this.text;
        // let execCode = this.text + ".layer(o1).out(o0)";
        eval(execCode);
        this.codeApp.flashCode(0);

        // next
        // setTimeout(() => {
        //   this.setTarget();
        // }, this.codeInterval);
      }
    }

    if (this.state !== "done") {
      setTimeout(() => {
        this.update();
      }, this.timeInterval[this.state] + this.timeVariance[this.state] * Math.random());
    }
  }
}

const app = new App();
document.querySelector("div#app").appendChild(app.node);
let codeDaemon = new Code(0, app.codeApp)
app.loaded();

// const domParty = new DomParty({ parent: document.getElementById("party-venue") });

let first = true;
function inputInit() {
  if (first) {
    sample().out()
    codeDaemon.start();
    first = false;
  }
  // else codeDaemon.setTarget()
}

inputInit();

// window.addEventListener("mousedown", inputInit);
// window.addEventListener("touchdown", inputInit);