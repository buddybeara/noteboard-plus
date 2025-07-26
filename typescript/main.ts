let gid = (x: string) => document.getElementById(x);

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
  constructor(x: number, y: number, w: number, h: number, text?: string, open = true) {
    allWins.push(this);
    this.element = createWindow(x, y, w, h, open);
    if(text) this.content = text;
    if(!open) this.close();
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

let levsel = new WindowThing(50, 50, 800, 100, "Level Select");
levsel.element.id = "levsel";
levsel.element.classList.add("windowbutton");
let playButton = new WindowThing(600, 300, 200, 100, "Start", false);
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

const MissTime = 400, OkTime = 150, PerfectTime = 50;

class KeyWindow extends WindowThing {
  song: Song;
  key: string;
  pendingInputs: ({time: number, el: HTMLDivElement})[] = [];
  constructor(s: Song, x: number, y: number, w: number, h: number, key: string, open = true) {
    super(x, y, w, h, "", open);
    this.song = s;
    this.key = key;
    document.addEventListener("keydown", (e) => { this.hit(e); });
    let hitzone = document.createElement("div");
    hitzone.classList.add("keywindow-hitzone");
    hitzone.textContent = key;
    this.element.children[0].appendChild(hitzone);
  }
  hit(e: KeyboardEvent) {
    if(e.key != this.key) return;
    if(!this.pendingInputs.length) return;
    let tilNext = this.pendingInputs[0].time - Date.now();
    let badness = Math.abs(tilNext + 40);
    if(badness < MissTime) {
      // Hit!
      this.pendingInputs[0].el.style.transitionDuration = "0.1s";
      this.pendingInputs[0].el.style.width = "0";
      this.pendingInputs[0].el.style.left = "50%";
      this.pendingInputs[0].el.style.top = this.pendingInputs[0].el.offsetTop - 10 + "px"; // stop it from moving down
      this.pendingInputs[0].el.style.opacity = "0";
      // Create a particle thingy
      let particle = document.createElement("div");
      particle.classList.add("particle");
      if(badness < PerfectTime) {
        particle.textContent = "perfect!";
        particle.style.color = "lime";
      } else if(Math.abs(tilNext) < OkTime) {
        particle.textContent = "ok!";
        particle.style.color = "yellow";
      } else { // miss
        particle.textContent = "miss";
        particle.style.color = "#f77";
      }
      //particle.textContent += " " + tilNext;
      particle.style.top = this.pendingInputs[0].el.style.top;
      this.element.children[0].appendChild(particle);
      setTimeout(() => {
        particle.style.translate = `0px -20px`;
        particle.style.opacity = "0";
      }, 10);
      setTimeout(() => { particle.remove(); }, 510);
      this.pendingInputs.splice(0, 1);
    }
  }
  addInput(hit: number, windup: number) {
    let el = document.createElement("div");
    el.classList.add("keywindow-input");
    el.style.top = "-90px";
    el.style.transitionDuration = (windup * 1.612) + "ms"; // idk what's up with this
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

class GridWindow extends WindowThing {
  song: Song;
  key: string;
  private _gridWidth: number;
  private _gridHeight: number;
  get gw() { return this._gridWidth; }
  get gh() { return this._gridHeight; }
  set gw(v: number) { this.setupGrid(v, this.gh); }
  set gh(v: number) { this.setupGrid(this.gw, v); }
  pendingInputs: number[] = [];
  constructor(s: Song, x: number, y: number, w: number, h: number, key: string, gw: number, gh: number, open = true) {
    super(x, y, w, h, "", open);
    this.song = s;
    this.key = key;
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
    let badness = Math.abs(tilNext + 40);
    if(badness < MissTime) {
      // Hit!
      // Create a particle thingy
      let particle = document.createElement("div");
      particle.classList.add("particle");
      if(badness < PerfectTime) {
        particle.textContent = "perfect!";
        particle.style.color = "lime";
      } else if(Math.abs(tilNext) < OkTime) {
        particle.textContent = "ok!";
        particle.style.color = "yellow";
      } else { // miss
        particle.textContent = "miss";
        particle.style.color = "#f77";
      }
      //particle.textContent += " " + tilNext;
      particle.style.top = Math.round((this.gw - 0.5) / (this.gw) * 1000) / 10 + "%";
      console.log(Math.round((this.gw - 0.5) / (this.gw) * 1000) / 10 + "%");
      this.element.children[0].appendChild(particle);
      setTimeout(() => {
        particle.style.translate = `0px -50px`;
        particle.style.opacity = "0";
      }, 10);
      setTimeout(() => { particle.remove(); }, 510);
      this.pendingInputs.splice(0, 1);
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
    }, hit + MissTime);
  }
  close() {
    super.close();
    document.removeEventListener("keydown", (e) => { this.hit(e); });
  }
}

class Song {
  title: string;
  duration: number;
  element: HTMLAudioElement;
  baseTempo: number;
  tempo: number;
  actx: AudioContext;
  get mspb() { return 60000 / this.tempo; }
  countoff: number;
  startTime: number;
  constructor(title: string, duration: number, element: HTMLAudioElement, tempo: number, countoff: number, level: (S: Song) => void) {
    this.title = title; this.duration = duration; this.element = element; this.baseTempo = tempo; this.tempo = tempo; this.countoff = countoff;
    this.level = level;
  }
  start() {
    this.tempo = this.baseTempo;
    // Music!
    this.actx = new AudioContext();
    let track = this.actx.createMediaElementSource(this.element);
    let gain = this.actx.createGain();
    track.connect(gain).connect(this.actx.destination);
    setTimeout(() => { this.element.play() }, this.countoff * this.mspb);
    // Play level!
    this.startTime = Date.now();
    this.level(this);
  }
  stop() {
    this.actx.close();
  }
  level: (S: Song) => void;
}
let hammerOfJustice = new Song("Hammer of Justice - Toby Fox", 136, gid("hammer-of-justice") as HTMLAudioElement, 160, 4, (S: Song) => {
  let b = S.mspb;
  let w0 = new GridWindow(S, 800, 200, 200, 400, "j", 3, 1);
  for(let i = 4; i <= 64; i += 4) {
    if(i % 16 == 0) {
      w0.addInput(b * (i + 1.5), b * 1.5);
    } else {
      w0.addInput(b * (i + 1.5), b * 1.0);
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
  let w1 = new KeyWindow(S, 100, 100, 200, 500, "s", false);
  setTimeout(() => { w1.reopen(500); }, b * 15);
  w1.addInput(b * 20, b * 4);
  w1.addInput(b * 24, b * 4);
  w1.addInput(b * 28, b * 4);
  w1.addInput(b * 32, b * 4);
  for(let i = 36.5; i < 66; i++) w1.addInput(b * i, b * 2);

  // Second part!
  let w11 = new KeyWindow(S, 400, 50, 200, 500, "d", false);
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
  w2.addInput(b * 101.50, b * 2);
  w21.addInput(b * 102, b * 2);

  w2.addInput(b * 107.0, b * 2);
  w2.addInput(b * 107.5, b * 2);
  w21.addInput(b * 108, b * 2);
  w21.addInput(b * 110, b * 2);
  for(let i = 112; i <= 116; i ++) w2.addInput(b * i, b * 2);
  w2.addInput(b * 119.0, b * 2);
  w2.addInput(b * 119.5, b * 2);
  w21.addInput(b * 120, b * 2);
  w21.addInput(b * 122, b * 2);
  w21.addInput(b * 123, b * 2);
  w2.addInput(b * 124.0, b * 2);
  w2.addInput(b * 125.5, b * 2);
  w21.addInput(b * 126, b * 2);
  for(let i = 128; i <= 131; i ++) w2.addInput(b * i, b * 2);

  setTimeout(() => { w21.close(); w01.reopen(400); }, b * 131.5);
  w01.addInput(b * 133.5, b * 1.5);
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
  w2.addInput(b * 151.0, b * 2);
  w21.addInput(b * 151.5, b * 2);
  w21.addInput(b * 152, b * 2);
  w2.addInput(b * 154, b * 2);
  w2.addInput(b * 155, b * 2);
  w21.addInput(b * 156, b * 2);
  w2.addInput(b * 157.5, b * 2);
  w2.addInput(b * 158.0, b * 2);
});

let inLevel = false;
playButton.element.onclick = function() {
  if(inLevel) return; // Can't start two levels at once
  inLevel = true;
  gid("curtain").style.top = "0%";
  levsel.close();
  playButton.close();
  setTimeout(() => { gid("curtain").style.top = "-100%"; }, 500);
  setTimeout(() => { hammerOfJustice.start(); }, 1000);
}

document.addEventListener("keypress", (e) => {
  console.log(e.key);
  if(e.key == "`" && inLevel) {
    inLevel = false;
    hammerOfJustice.stop();
    gid("curtain").style.top = "0%";
    levsel.reopen(100);
    setTimeout(() => { gid("curtain").style.top = "-100%"; }, 500);
  }
  for(let i = allWins.length - 1; i >= 0; i--) {
    if(allWins[i].element.id != "levsel" && allWins[i].element.id != "playbutton") allWins[i].destroy();
  }
});