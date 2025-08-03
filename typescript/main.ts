let gid = (x: string) => document.getElementById(x);
let parseTime = (t: number) => Math.floor(t/60) + ":" + Math.floor(t%60).toString().padStart(2, "0");

function animateBackground(ms: number) {
  const C1 = inLevel ? "#000" : "#001", C2 = inLevel ? "#100" : "#112", W = 120;
  let value = Math.round(W * 2 - ((ms * 0.05) % (W * 2)));
  if(value >= W) {
    value -= W;
    gid("background").style.background = `repeating-linear-gradient(-45deg, ${C1}, ${C1} ${value}px, ${C2} ${value}px, ${C2} ${value + W}px, ${C1} ${value + W}px, ${C1} ${W * 2}px)`;
  } else {
    gid("background").style.background = `repeating-linear-gradient(-45deg, ${C2}, ${C2} ${value}px, ${C1} ${value}px, ${C1} ${value + W}px, ${C2} ${value + W}px, ${C2} ${W * 2}px)`;
  }
}
// Run the background at 100fps because I can.
let backgroundTimer = 0; setInterval(() => { backgroundTimer += 10; animateBackground(backgroundTimer); }, 10);

function createWindow(x: number, y: number, w: number, h: number, open = true) {
  let win = document.createElement("div");
  win.classList.add("window");
  win.style.left = x + "px";
  win.style.top = y + "px";
  win.style.width = w + "px";
  win.style.height = "70px";
  win.textContent = "—";
  let wInside = document.createElement("div");
  wInside.classList.add("winside");
  win.appendChild(wInside);
  gid("windows").appendChild(win);
  if(open) setTimeout(() => { win.style.height = h + "px"; }, 10);
  else win.style.opacity = "0";
  return win;
}

let allWins: WindowThing[] = [];
class WindowThing {
  element: HTMLDivElement;
  get content() { return this.element.children[0].innerHTML; }
  set content(s: string) { this.element.children[0].innerHTML = s; }
  get x() { return parseInt(this.element.style.left.slice(0, -2)); }
  get y() { return parseInt(this.element.style.top.slice(0, -2)); }
  get w() { return parseInt(this.element.style.width.slice(0, -2)); }
  get h() { return parseInt(this.element.style.height.slice(0, -2)); }
  set x(v: number) { this.element.style.left = v + "px"; }
  set y(v: number) { this.element.style.top = v + "px"; }
  set w(v: number) { this.element.style.width = v + "px"; }
  set h(v: number) { this.element.style.height = v + "px"; }
  isEssential: boolean;
  constructor(x: number, y: number, w: number, h: number, text?: string, open = true, ess = false) {
    allWins.push(this);
    this.element = createWindow(x, y, w, h, open);
    if(text) this.content = text;
    if(!open) this.close();
    this.isEssential = ess;
  }
  close() {
    this.h = 70;
    this.element.style.opacity = "0";
    this.element.style.pointerEvents = "none";
  }
  reopen(h: number) {
    this.h = h;
    this.element.style.opacity = "1";
    this.element.style.pointerEvents = "all";
  }
  destroy() {
    this.element.remove();
    allWins.splice(allWins.indexOf(this), 1);
  }
}

let levsel = new WindowThing(50, 50, 800, 100, "Level Select", true, true);
levsel.element.id = "levsel";
levsel.element.classList.add("windowbutton");
let playButton = new WindowThing(600, 300, 200, 100, "Start", false, true);
playButton.element.classList.add("windowbutton");
playButton.element.id = "playbutton";

levsel.element.onclick = function() {
  if(levsel.h == 100) {
    levsel.h = 300;
    levsel.content = "Selected Level: Hammer of Justice - Toby Fox";
    playButton.reopen(100);
  } else {
    levsel.h = 100;
    levsel.content = "Level Select";
    playButton.close();
  }
}

let audioOffsetter = new WindowThing(50, 600, 600, 100, `
  Visual ← Audio Offset: <input id="audio-offset" type="range" min="-100" max="100" step="1" style="width:200px" value="${localStorage.getItem("offsetInfo")?.split(";")[0] || 0}">
  <span id="ao-text">0</span>ms<br/>
  Visual ← Input Offset:<span style="font-size:6px">&nbsp;</span>
  <input id="input-offset" type="range" min="-100" max="100" step="1" style="width:200px" value="${localStorage.getItem("offsetInfo")?.split(";")[1] || 40}"> <span id="io-text">0</span>ms`, true, true);
setInterval(() => {
  // update the thingies
  let fmt = (x: string) => (parseInt(x) > 0 ? "+" : "") + parseInt(x);
  gid("ao-text").textContent = fmt((gid("audio-offset") as HTMLInputElement).value);
  gid("io-text").textContent = fmt((gid("input-offset") as HTMLInputElement).value);
  localStorage.setItem("offsetInfo", (gid("audio-offset") as HTMLInputElement).value + ";" + (gid("input-offset") as HTMLInputElement).value);
}, 50);

const MissTime = 400, OkTime = 150, PerfectTime = 50;

abstract class RhythmWindow extends WindowThing {
  song: Song;
  key: string;
  constructor(x: number, y: number, w: number, h: number, song: Song, key: string, open = true) {
    super(x, y, w, h, "", open);
    this.song = song;
    this.key = key;
  }
  abstract hit(e: KeyboardEvent): void;
  abstract addInput(hit: number, windup: number): void;
  doScore(badness: number) {
    this.song.score += badness <= PerfectTime ? 1 : badness > OkTime ? 0 : 1 - 0.4 * ((badness - PerfectTime) / (OkTime - PerfectTime));
    if(badness > OkTime) this.song.misses++;
    this.song.maxScore += 1;
  }
  formatParticle(badness: number, particle: HTMLElement) {
    particle.classList.add("particle");
    if(badness < PerfectTime) {
      particle.textContent = "perfect!";
      particle.style.color = "lime";
    } else if(badness < OkTime) {
      particle.textContent = "ok!";
      particle.style.color = "yellow";
    } else { // miss
      particle.textContent = "miss";
      particle.style.color = "#f77";
    }
  }
}

class KeyWindow extends RhythmWindow {
  song: Song;
  key: string;
  pendingInputs: ({time: number, el: HTMLDivElement})[] = [];
  constructor(s: Song, x: number, y: number, w: number, h: number, k: string, open = true) {
    super(x, y, w, h, s, k, open);
    document.addEventListener("keydown", (e) => { this.hit(e); });
    let hitzone = document.createElement("div");
    hitzone.classList.add("keywindow-hitzone");
    hitzone.textContent = k;
    this.element.children[0].appendChild(hitzone);
  }
  hit(e: KeyboardEvent) {
    if(e.key != this.key) return;
    if(!this.pendingInputs.length) return;
    let tilNext = this.pendingInputs[0].time - Date.now();
    let badness = Math.abs(tilNext + parseInt((gid("input-offset") as HTMLInputElement).value));
    if(badness < MissTime) {
      // Hit!
      this.pendingInputs[0].el.style.transitionDuration = "0.1s";
      this.pendingInputs[0].el.style.width = "0";
      this.pendingInputs[0].el.style.left = "50%";
      this.pendingInputs[0].el.style.top = this.pendingInputs[0].el.offsetTop - 10 + "px"; // stop it from moving down
      this.pendingInputs[0].el.style.opacity = "0";
      // Create a particle thingy
      let particle = document.createElement("div");
      this.formatParticle(badness, particle);
      particle.style.top = this.pendingInputs[0].el.style.top;
      this.element.children[0].appendChild(particle);
      setTimeout(() => {
        particle.style.translate = `0px -20px`;
        particle.style.opacity = "0";
      }, 10);
      setTimeout(() => { particle.remove(); }, 510);
      this.pendingInputs.splice(0, 1);
      this.doScore(badness);
    }
  }
  addInput(hit: number, windup: number) {
    let el = document.createElement("div");
    el.classList.add("keywindow-input");
    el.style.top = "-90px";
    el.style.transitionDuration = (windup * 1.54) + "ms"; // idk what's up with this
    this.element.children[0].appendChild(el);
    this.pendingInputs.push({time: Date.now() + hit, el: el});
    setTimeout(() => {
      el.style.display = "block";
      el.style.top = "calc(125% - 90px)"; // x1.25
    }, hit - windup);
    setTimeout(() => {
      if(!(el.style.opacity != "0")) return;
      // Create a particle thingy
      let particle = document.createElement("div");
      particle.classList.add("particle");
      particle.textContent = "miss";
      particle.style.color = "#f77";
      particle.style.top = "100%";
      this.element.children[0].appendChild(particle);
      setTimeout(() => {
        particle.style.translate = `0px -50px`;
        particle.style.opacity = "0";
      }, 10);
      setTimeout(() => { particle.remove(); }, 510);
      this.pendingInputs.splice(0, 1);
      this.song.maxScore += 1;
      this.song.misses += 1;
    }, hit + MissTime);
    setTimeout(() => {
      el.remove();
    }, hit + windup);
  }
  close() {
    super.close();
    document.removeEventListener("keydown", (e) => { this.hit(e); });
  }
}

class GridWindow extends RhythmWindow {
  song: Song;
  key: string;
  private _gridWidth: number;
  private _gridHeight: number;
  get gw() { return this._gridWidth; }
  get gh() { return this._gridHeight; }
  set gw(v: number) { this.setupGrid(v, this.gh); }
  set gh(v: number) { this.setupGrid(this.gw, v); }
  pendingInputs: number[] = [];
  constructor(s: Song, x: number, y: number, w: number, h: number, k: string, gw: number, gh: number, open = true) {
    super(x, y, w, h, s, k, open);
    document.addEventListener("keydown", (e) => { this.hit(e); });
    this.element.children[0].classList.add("gridwindow-main");
    this.setupGrid(gw, gh);
  }
  setupGrid(w: number, h: number) {
    this.content = "";
    let templateArea: string[][] = [], templateRows: string[] = [], templateColumns: string[] = [];
    for(let i = 0; i < w; i++) {
      templateRows.push("1fr");
      templateArea.push([]);
      for(let j = 0; j < h; j++) {
        if(i == 0) templateColumns.push("1fr");
        templateArea[i].push("item-" + i + "-" + j);
        let el = document.createElement("div");
        el.classList.add("gridwindow-item", "item-" + i + "-" + j);
        if(i == w - 1 && j == h - 1) {
          el.classList.add("gridwindow-hitzone");
          el.textContent = this.key;
        }
        el.style.gridArea = "item-" + i + "-" + j;
        this.element.children[0].appendChild(el);
      }
    }
    (this.element.children[0] as HTMLElement).style.gridTemplateAreas = templateArea.map(x => '"' + x.join(" ") + '"').join("\n");
    (this.element.children[0] as HTMLElement).style.gridTemplateRows = templateRows.join(" ");
    (this.element.children[0] as HTMLElement).style.gridTemplateColumns = templateColumns.join(" ");
    this._gridWidth = w;
    this._gridHeight = h;
  }
  hit(e: KeyboardEvent) {
    if(e.key != this.key) return;
    if(!this.pendingInputs.length) return;
    let tilNext = this.pendingInputs[0] - Date.now();
    let badness = Math.abs(tilNext + parseInt((gid("input-offset") as HTMLInputElement).value));
    if(badness < MissTime) {
      // Hit!
      // Create a particle thingy
      let particle = document.createElement("div");
      this.formatParticle(badness, particle);
      particle.style.top = Math.round((this.gw - 0.5) / (this.gw) * 1000) / 10 + "%";
      this.element.children[0].appendChild(particle);
      setTimeout(() => {
        particle.style.translate = `0px -50px`;
        particle.style.opacity = "0";
      }, 10);
      setTimeout(() => { particle.remove(); }, 510);
      this.pendingInputs.splice(0, 1);
      this.doScore(badness);
    }
  }
  addInput(hit: number, windup: number) {
    let h = Date.now() + hit; this.pendingInputs.push(h);
    for(let i = 0; i < this.gw; i++) {
      for(let j = 0; j < this.gh; j++) {
        let el = Array.from(document.getElementsByClassName("item-" + i + "-" + j)).find(x => this.element.children[0].contains(x)) as HTMLElement;
        setTimeout(() => {
          el.style.transition = "10ms";
          el.style.background = "white";
        }, hit - windup * (1 - (i * this.gh + j) / (this.gw * this.gh - 1)));
        setTimeout(() => {
          el.style.transition = "150ms";
          el.style.background = "transparent";
        }, hit - windup * (1 - (i * this.gh + j) / (this.gw * this.gh - 1)) + 100);
      }
    }
    setTimeout(() => {
      if(!this.pendingInputs.includes(h)) return;
      // Create a particle thingy
      let particle = document.createElement("div");
      particle.classList.add("particle");
      particle.textContent = "miss";
      particle.style.color = "#f77";
      particle.style.top = "100%";
      this.element.children[0].appendChild(particle);
      setTimeout(() => {
        particle.style.translate = `0px -50px`;
        particle.style.opacity = "0";
      }, 10);
      setTimeout(() => { particle.remove(); }, 510);
      this.pendingInputs.splice(0, 1);
      this.song.maxScore += 1;
      this.song.misses += 1;
    }, hit + MissTime);
  }
  close() {
    super.close();
    document.removeEventListener("keydown", (e) => { this.hit(e); });
  }
}

let songUI = new WindowThing(50, window.innerHeight - 200, 800, 125, "", false, true);

class Song {
  title: string;
  duration: number;
  element: HTMLAudioElement;
  tempo: number;
  actx: AudioContext;
  score: number;
  maxScore: number;
  misses: number;
  updateLoop: number;
  get mspb() { return 60000 / this.tempo; }
  countoff: number;
  startTime: number;
  constructor(title: string, duration: number, element: HTMLAudioElement, tempo: number, countoff: number, level: (S: Song) => void) {
    this.title = title; this.duration = duration; this.element = element; this.tempo = tempo; this.countoff = countoff;
    this.level = level;
    this.actx = new AudioContext();
    let track = this.actx.createMediaElementSource(this.element);
    let gain = this.actx.createGain();
    track.connect(gain).connect(this.actx.destination);
  }
  start() {
    console.log("Starting...")
    // Music!
    setTimeout(() => { this.actx.resume(); this.element.play(); console.log("Playing sound"); }, this.countoff * this.mspb + 100 + parseInt((gid("audio-offset") as HTMLInputElement).value));
    songUI.content = this.title;
    songUI.reopen(125);
    // Play level!
    this.startTime = Date.now();
    this.score = 0;
    this.maxScore = 0;
    this.misses = 0;
    setTimeout(() => this.level(this), 100); // have to do an extra 100ms because the offset could be up to -100ms
    this.updateLoop = setInterval(() => {
      let acc = this.score / this.maxScore;
      songUI.content = this.title + " [" + parseTime(this.element.currentTime) + " / " + parseTime(this.duration) +
        "]<br/>Score: " + (this.maxScore == 0 ? 0 : acc * 100).toFixed(2) + "% (" +
        (this.score == 0 ? "—" : acc == 1 ? "AllPerfect!!" : this.misses == 0 ? "FullCombo!" : acc > 0.99 ? "SS!" : acc > 0.98 ? "S+!" : acc > 0.98 ? "S" : acc > 0.96 ? "A+" : acc > 0.9 ? "A" : acc > 0.86 ? "B+" : acc > 0.8 ? "B" : acc > 0.76 ? "C+" : acc > 0.7 ? "C" : acc > 0.6 ? "D" : "Z") + ")" +
        "<br/>Press ` to exit"
    }, 20);
    // Get ready to stop the level!!
    let thisStartTime = this.startTime * 1.0;
    setTimeout(() => {
      // check if still in level
      if(this.startTime != thisStartTime || !inLevel) return;
      inLevel = false;
      this.stop();
      gid("curtain").style.top = "0%";
      let acc = this.score / this.maxScore;
      gid("clear").innerHTML = `LEVEL CLEAR !!!<br/>SONG: ${this.title}<br/>HITS: ${this.maxScore - this.misses}<br/>MISSES: ${this.misses}<br/>SCORE: ${(this.maxScore == 0 ? 0 : acc * 100).toFixed(2)}%<br/>RANK: ` +
        (this.score == 0 ? "undefined??" : acc == 1 ? "ALL PERFECT! :::3" : this.misses == 0 ? "FULL COMBO :3" : acc > 0.99 ? "SUPREME :O" : acc > 0.98 ? "superb+ :D" : acc > 0.98 ? "superb :D" : acc > 0.96 ? "awesome+ (:" : acc > 0.9 ? "awesome (:" : acc > 0.86 ? "nice+ :)" : acc > 0.8 ? "nice" : acc > 0.76 ? "ok+" : acc > 0.7 ? "ok" : acc > 0.6 ? "eh" : "none :C");
      gid("clear").style.top = "25%";
      levsel.reopen(100);
      levsel.content = "Level Select";
      setTimeout(() => { gid("curtain").style.top = "-100%"; gid("clear").style.top = "-100%"; audioOffsetter.reopen(100); }, 5000);
      for(let i = allWins.length - 1; i >= 0; i--) {
        if(!allWins[i].isEssential) allWins[i].destroy();
      }
    }, 500 + this.duration * 1000 + this.countoff * this.mspb);
  }
  stop() {
    this.element.pause();
    songUI.close();
    this.element.currentTime = 0;
    clearInterval(this.updateLoop);
    this.updateLoop = undefined;
  }
  level: (S: Song) => void;
}
let hammerOfJustice = new Song("Hammer of Justice - Toby Fox", 138, gid("hammer-of-justice") as HTMLAudioElement, 160, 4, (S: Song) => {
  let b = S.mspb;
  let w0 = new GridWindow(S, 800, 200, 200, 400, "j", 4, 1);
  for(let i = 4; i <= 64; i += 4) {
    if(i % 16 == 0) {
      w0.addInput(b * (i + 1.5), b * 2.25);
    } else {
      w0.addInput(b * (i + 2.0), b * 1.50);
    }
  }
  let w01 = new GridWindow(S, 995, 210, 200, 400, "k", 3, 1, false);
  setTimeout(() => { w01.reopen(400); }, b * 9.5);
  for(let i = 12; i <= 64; i += 4) {
    if(i % 32 == 0) {
      w01.addInput(b * (i + 3.0), b * 2.0);
    } else {
      w01.addInput(b * (i + 3.5), b * 1.5);
    }
  }
  let w1 = new KeyWindow(S, 250, 100, 200, 500, "s", false);
  setTimeout(() => { w1.reopen(500); }, b * 15);
  w1.addInput(b * 20, b * 4);
  w1.addInput(b * 24, b * 4);
  w1.addInput(b * 28, b * 4);
  w1.addInput(b * 32, b * 4);
  for(let i = 36.5; i < 66; i++) w1.addInput(b * i, b * 2);

  // Second part!
  let w11 = new KeyWindow(S, 445, 50, 200, 500, "d", false);
  setTimeout(() => { w1.close(); }, b * 66);
  setTimeout(() => { w11.reopen(500); }, b * 64);
  for(let i = 68; i <= 158; i += 4) {
    w11.addInput(b * i, b * 4);
    if(i % 16 == 0) w11.addInput(b * (i + 2), b * 4); // sometimes there's an extra crash
  }
  w0.addInput(b * 69.5, b * 1.5);
  let w21 = new KeyWindow(S, 995, 310, 200, 400, "k", false);
  setTimeout(() => { w01.close(); w21.reopen(400); }, b * 68);
  w21.addInput(b * 70, b * 2);
  let w2 = new KeyWindow(S, 800, 300, 200, 400, "j", false);
  setTimeout(() => { w0.close(); w2.reopen(400); }, b * 70);
  w2.addInput(b * 75.0, b * 2);
  w2.addInput(b * 75.5, b * 2);
  w21.addInput(b * 76, b * 2);
  w21.addInput(b * 78, b * 2);
  for(let i = 80; i <= 84; i ++) w2.addInput(b * i, b * 2);
  w2.addInput(b * 87.0, b * 2);
  w2.addInput(b * 87.5, b * 2);
  w21.addInput(b * 88, b * 2);
  w21.addInput(b * 90, b * 2);
  w21.addInput(b * 91, b * 2);
  w2.addInput(b * 92.0, b * 2);
  w2.addInput(b * 93.5, b * 2);
  w21.addInput(b * 94, b * 2);
  for(let i = 96; i < 100; i ++) w2.addInput(b * i, b * 2);
  w2.addInput(b * 100.00, b * 2);
  w2.addInput(b * 100.75, b * 2);
  w21.addInput(b * 101.50, b * 2);
  w21.addInput(b * 102, b * 2);

  w2.addInput(b * 107.0, b * 2);
  w2.addInput(b * 107.5, b * 2);
  w21.addInput(b * 108, b * 2);
  w21.addInput(b * 110, b * 2);
  for(let i = 112; i <= 116; i ++) w2.addInput(b * i, b * 2);
  w2.addInput(b * 119.0, b * 2);
  w21.addInput(b * 119.5, b * 2);
  w21.addInput(b * 120, b * 2);
  w21.addInput(b * 122, b * 2);
  w21.addInput(b * 123, b * 2);
  w2.addInput(b * 124.0, b * 2);
  w21.addInput(b * 125.5, b * 2);
  w21.addInput(b * 126, b * 2);
  for(let i = 128; i <= 131; i ++) w2.addInput(b * i, b * 2);

  setTimeout(() => { w21.close(); w01.reopen(400); }, b * 131.5);
  w01.addInput(b * 133.5, b * 1.5);
  w2.addInput(b * 134.0, b * 1.5);
  w01.addInput(b * 136.0, b * 1.0);
  w01.addInput(b * 137.5, b * 1.5);
  setTimeout(() => { w01.close(); w21.reopen(400); }, b * 138);
  w2.addInput(b * 138.0, b * 2);
  w2.addInput(b * 139.0, b * 2);
  w2.addInput(b * 139.5, b * 2);
  w21.addInput(b * 140, b * 2);
  w21.addInput(b * 142, b * 2);
  for(let i = 144; i <= 148; i ++) w2.addInput(b * i, b * 2);
  w2.addInput(b * 149.5, b * 2);
  w2.addInput(b * 150.0, b * 2);
  w21.addInput(b * 151.0, b * 2);
  w21.addInput(b * 151.5, b * 2);
  w21.addInput(b * 152, b * 2);
  w2.addInput(b * 154, b * 2);
  w2.addInput(b * 155, b * 2);
  w21.addInput(b * 156, b * 2);
  w2.addInput(b * 157.5, b * 2);
  w2.addInput(b * 158.0, b * 2);
  w2.addInput(b * 162.0, b * 2);
  w2.addInput(b * 163.0, b * 2);

  // Slow part...
  setTimeout(() => { w11.close(); w2.close(); w21.close(); }, b * 158.5);
  setTimeout(() => { w1.reopen(500); w2.reopen(400); w01.reopen(400); }, b * 160);
  w01.addInput(b * 164, b * 2);
  w1.addInput(b * 164, b * 4);
  w1.addInput(b * 168.15584, b * 4.15584);
  setTimeout(() => {
    b = 60000 / 154;
    // Everything is zeroed out again here. -164 to everything.
    for(let i = 8; i <= 60; i++) { if(i % 4 == 0 || [10, 26, 42, 60].includes(i)) w1.addInput(b * i, b * 4); }
    w01.addInput(b * 4, b * 2);
    w01.addInput(b * 8, b * 2);
    w01.addInput(b * 9.5, b * 1.5);
    w2.addInput(b * 10, b * 1.5);
    w01.addInput(b * 11.5, b * 1.5);
    w2.addInput(b * 12, b * 1.5);
    w01.addInput(b * 16, b * 2);
    w01.addInput(b * 20, b * 2);
    w01.addInput(b * 24, b * 2);
    w01.addInput(b * 25.5, b * 1.5);
    w01.addInput(b * 27.5, b * 1.0);
    w2.addInput(b * 28, b * 1.5);
    w01.addInput(b * 32, b * 2);
    w01.addInput(b * 36, b * 2);
    w01.addInput(b * 40, b * 2);
    w01.addInput(b * 41.5, b * 1.5);
    w2.addInput(b * 42, b * 1.5);
    w01.addInput(b * 43.5, b * 1.5);
    w2.addInput(b * 44, b * 1.5);
    w01.addInput(b * 48, b * 2);
    w01.addInput(b * 52, b * 2);
    w01.addInput(b * 56, b * 2);
    w01.addInput(b * 57.5, b * 1.5);
    w01.addInput(b * 59.5, b * 1.0);
    w2.addInput(b * 60, b * 1.5);
    // There's something really weird going on
    w1.addInput(b * 65.44375, b * 2);
    w1.addInput(b * 66.40625, b * 2);
    w01.addInput(b * 65, b * 1.925); // ?
    setTimeout(() => {
      b = 60000 / 160;
      // Everything is zeroed out again! yippee
      for(let i = 2.5; i < 96; i++) { w1.addInput(b * i, b * 2); }
      w01.addInput(b * 4, b * 2);
      w01.addInput(b * 8, b * 2);
      w01.addInput(b * 9.5, b * 1.5);
      w2.addInput(b * 10, b * 1.5);
      w01.addInput(b * 11.5, b * 1.5);
      w2.addInput(b * 12, b * 1.5);
      w01.addInput(b * 16, b * 2);
      w01.addInput(b * 20, b * 2);
      w01.addInput(b * 24, b * 2);
      w01.addInput(b * 25.5, b * 1.5);
      w01.addInput(b * 27.5, b * 1.0);
      w2.addInput(b * 28, b * 1.5);
      w01.addInput(b * 32, b * 2);
      w01.addInput(b * 36, b * 2);
      w01.addInput(b * 40, b * 2);
      w01.addInput(b * 41.5, b * 1.5);
      w2.addInput(b * 42, b * 1.5);
      w01.addInput(b * 43.5, b * 1.5);
      w2.addInput(b * 44, b * 1.5);
      w01.addInput(b * 48, b * 2);
      w01.addInput(b * 52, b * 2);
      w01.addInput(b * 56, b * 2);
      w01.addInput(b * 57.5, b * 1.5);
      w01.addInput(b * 59.5, b * 1.0);
      w2.addInput(b * 60, b * 1.5);

      setTimeout(() => { w01.close(); w21.reopen(400); }, b * 61);
      w21.addInput(b * 64, b * 2);
      w2.addInput(b * 65, b * 2);
      w2.addInput(b * 65.5, b * 2);
      w21.addInput(b * 66, b * 2);
      w21.addInput(b * 66.5, b * 2);
      w2.addInput(b * 67.5, b * 2);
      w21.addInput(b * 68.5, b * 2);
      w2.addInput(b * 69, b * 2);
      w2.addInput(b * 69.5, b * 2);
      w21.addInput(b * 70, b * 2);
      w21.addInput(b * 70.5, b * 2);
      w2.addInput(b * 71.5, b * 2);
      w21.addInput(b * 72.5, b * 2);
      w2.addInput(b * 73, b * 2);
      w2.addInput(b * 73.5, b * 2);
      w21.addInput(b * 74, b * 2);
      w2.addInput(b * 75, b * 2);
      w21.addInput(b * 75.5, b * 2);
      w21.addInput(b * 76.5, b * 2);
      w21.addInput(b * 77, b * 2);
      w2.addInput(b * 77.5, b * 2);
      w2.addInput(b * 78, b * 2);
      w21.addInput(b * 79, b * 2);
      // Change it up a bit...
      w21.addInput(b * 80, b * 2);
      w2.addInput(b * 81, b * 2);
      w2.addInput(b * 81.5, b * 2);
      w21.addInput(b * 82, b * 2);
      w21.addInput(b * 82.5, b * 2);
      w2.addInput(b * 83.5, b * 2);
      w21.addInput(b * 84.5, b * 2);
      w2.addInput(b * 85, b * 2);
      w2.addInput(b * 85.5, b * 2);
      w21.addInput(b * 86, b * 2);
      w21.addInput(b * 86.5, b * 2);
      w2.addInput(b * 87.5, b * 2);
      w21.addInput(b * 88, b * 2);
      w2.addInput(b * 88.5, b * 2);
      w21.addInput(b * 89, b * 2);
      w21.addInput(b * 89.5, b * 2);
      w2.addInput(b * 91, b * 2);
      w21.addInput(b * 91.5, b * 2);
      w2.addInput(b * 92, b * 2);
      w21.addInput(b * 93, b * 2);
      w2.addInput(b * 94, b * 2);
      w21.addInput(b * 95, b * 2);
      setTimeout(() => { w1.close(); }, b * 96);
      // okay I am not doing this again so I'm going to instead copy paste it :3
      setTimeout(() => {
        w21.addInput(b * 64, b * 2);
        w2.addInput(b * 65, b * 2);
        w2.addInput(b * 65.5, b * 2);
        w21.addInput(b * 66, b * 2);
        w21.addInput(b * 66.5, b * 2);
        w2.addInput(b * 67.5, b * 2);
        w21.addInput(b * 68.5, b * 2);
        w2.addInput(b * 69, b * 2);
        w2.addInput(b * 69.5, b * 2);
        w21.addInput(b * 70, b * 2);
        w21.addInput(b * 70.5, b * 2);
        w2.addInput(b * 71.5, b * 2);
        w21.addInput(b * 72.5, b * 2);
        w2.addInput(b * 73, b * 2);
        w2.addInput(b * 73.5, b * 2);
        w21.addInput(b * 74, b * 2);
        w2.addInput(b * 75, b * 2);
        w21.addInput(b * 75.5, b * 2);
        w21.addInput(b * 76.5, b * 2);
        w21.addInput(b * 77, b * 2);
        w2.addInput(b * 77.5, b * 2);
        w2.addInput(b * 78, b * 2);
        w21.addInput(b * 79, b * 2);
        // Change it up a bit...
        w21.addInput(b * 80, b * 2);
        w2.addInput(b * 81, b * 2);
        w2.addInput(b * 81.5, b * 2);
        w21.addInput(b * 82, b * 2);
        w21.addInput(b * 82.5, b * 2);
        w2.addInput(b * 83.5, b * 2);
        w21.addInput(b * 84.5, b * 2);
        w2.addInput(b * 85, b * 2);
        w2.addInput(b * 85.5, b * 2);
        w21.addInput(b * 86, b * 2);
        w21.addInput(b * 86.5, b * 2);
        w2.addInput(b * 87.5, b * 2);
        w21.addInput(b * 88, b * 2);
        w2.addInput(b * 88.5, b * 2);
        w21.addInput(b * 89, b * 2);
        w21.addInput(b * 89.5, b * 2);
        w2.addInput(b * 91, b * 2);
        w21.addInput(b * 91.5, b * 2);
        w2.addInput(b * 92, b * 2);
        w21.addInput(b * 93, b * 2);
        w2.addInput(b * 94, b * 2);
        w21.addInput(b * 95, b * 2);
        // yes I know it looks weird I'm just lazy like that :shrugcat:
        setTimeout(() => { w2.close(); w21.close(); }, b * 96);
      }, b * 32);
    }, b * 65); // !!!! Random magic number !!!!
  }, b * 164);
});

let inLevel = false;
playButton.element.onclick = function() {
  if(inLevel) return; // Can't start two levels at once
  inLevel = true;
  gid("curtain").style.top = "0%";
  for(let i of allWins) { i.close(); }
  setTimeout(() => { gid("curtain").style.top = "-100%"; }, 500);
  setTimeout(() => { hammerOfJustice.start(); }, 1000);
}

document.addEventListener("keypress", (e) => {
  if(e.key == "`" && inLevel) {
    inLevel = false;
    hammerOfJustice.stop();
    gid("curtain").style.top = "0%";
    songUI.close();
    levsel.reopen(100);
    levsel.content = "Level Select";
    setTimeout(() => { gid("curtain").style.top = "-100%"; audioOffsetter.reopen(100); }, 500);
    for(let i = allWins.length - 1; i >= 0; i--) {
      if(!allWins[i].isEssential) allWins[i].destroy();
    }
  }
});