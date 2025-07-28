var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var gid = function (x) { return document.getElementById(x); };
function animateBackground(ms) {
    var C1 = inLevel ? "#000" : "#001", C2 = inLevel ? "#100" : "#112", W = 120;
    var value = Math.round(W * 2 - ((ms * 0.05) % (W * 2)));
    if (value >= W) {
        value -= W;
        gid("background").style.background = "repeating-linear-gradient(-45deg, ".concat(C1, ", ").concat(C1, " ").concat(value, "px, ").concat(C2, " ").concat(value, "px, ").concat(C2, " ").concat(value + W, "px, ").concat(C1, " ").concat(value + W, "px, ").concat(C1, " ").concat(W * 2, "px)");
    }
    else {
        gid("background").style.background = "repeating-linear-gradient(-45deg, ".concat(C2, ", ").concat(C2, " ").concat(value, "px, ").concat(C1, " ").concat(value, "px, ").concat(C1, " ").concat(value + W, "px, ").concat(C2, " ").concat(value + W, "px, ").concat(C2, " ").concat(W * 2, "px)");
    }
}
// Run the background at 100fps because I can.
var backgroundTimer = 0;
setInterval(function () { backgroundTimer += 10; animateBackground(backgroundTimer); }, 10);
function createWindow(x, y, w, h, open) {
    if (open === void 0) { open = true; }
    var win = document.createElement("div");
    win.classList.add("window");
    win.style.left = x + "px";
    win.style.top = y + "px";
    win.style.width = w + "px";
    win.style.height = "70px";
    win.textContent = "—";
    var wInside = document.createElement("div");
    wInside.classList.add("winside");
    win.appendChild(wInside);
    gid("windows").appendChild(win);
    if (open)
        setTimeout(function () { win.style.height = h + "px"; }, 10);
    else
        win.style.opacity = "0";
    return win;
}
var allWins = [];
var WindowThing = /** @class */ (function () {
    function WindowThing(x, y, w, h, text, open) {
        if (open === void 0) { open = true; }
        allWins.push(this);
        this.element = createWindow(x, y, w, h, open);
        if (text)
            this.content = text;
        if (!open)
            this.close();
    }
    Object.defineProperty(WindowThing.prototype, "content", {
        get: function () { return this.element.children[0].innerHTML; },
        set: function (s) { this.element.children[0].innerHTML = s; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WindowThing.prototype, "x", {
        get: function () { return parseInt(this.element.style.left.slice(0, -2)); },
        set: function (v) { this.element.style.left = v + "px"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WindowThing.prototype, "y", {
        get: function () { return parseInt(this.element.style.top.slice(0, -2)); },
        set: function (v) { this.element.style.top = v + "px"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WindowThing.prototype, "w", {
        get: function () { return parseInt(this.element.style.width.slice(0, -2)); },
        set: function (v) { this.element.style.width = v + "px"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WindowThing.prototype, "h", {
        get: function () { return parseInt(this.element.style.height.slice(0, -2)); },
        set: function (v) { this.element.style.height = v + "px"; },
        enumerable: false,
        configurable: true
    });
    WindowThing.prototype.close = function () {
        this.h = 70;
        this.element.style.opacity = "0";
        this.element.style.pointerEvents = "none";
    };
    WindowThing.prototype.reopen = function (h) {
        this.h = h;
        this.element.style.opacity = "1";
        this.element.style.pointerEvents = "all";
    };
    WindowThing.prototype.destroy = function () {
        this.element.remove();
        allWins.splice(allWins.indexOf(this), 1);
    };
    return WindowThing;
}());
var levsel = new WindowThing(50, 50, 800, 100, "Level Select");
levsel.element.id = "levsel";
levsel.element.classList.add("windowbutton");
var playButton = new WindowThing(600, 300, 200, 100, "Start", false);
playButton.element.classList.add("windowbutton");
playButton.element.id = "playbutton";
levsel.element.onclick = function () {
    if (levsel.h == 100) {
        levsel.h = 300;
        levsel.content = "Selected Level: Hammer of Justice - Toby Fox";
        playButton.reopen(100);
    }
    else {
        levsel.h = 100;
        levsel.content = "Level Select";
        playButton.close();
    }
};
var MissTime = 400, OkTime = 150, PerfectTime = 50;
var KeyWindow = /** @class */ (function (_super) {
    __extends(KeyWindow, _super);
    function KeyWindow(s, x, y, w, h, key, open) {
        if (open === void 0) { open = true; }
        var _this = _super.call(this, x, y, w, h, "", open) || this;
        _this.pendingInputs = [];
        _this.song = s;
        _this.key = key;
        document.addEventListener("keydown", function (e) { _this.hit(e); });
        var hitzone = document.createElement("div");
        hitzone.classList.add("keywindow-hitzone");
        hitzone.textContent = key;
        _this.element.children[0].appendChild(hitzone);
        return _this;
    }
    KeyWindow.prototype.hit = function (e) {
        if (e.key != this.key)
            return;
        if (!this.pendingInputs.length)
            return;
        var tilNext = this.pendingInputs[0].time - Date.now();
        var badness = Math.abs(tilNext + 40);
        if (badness < MissTime) {
            // Hit!
            this.pendingInputs[0].el.style.transitionDuration = "0.1s";
            this.pendingInputs[0].el.style.width = "0";
            this.pendingInputs[0].el.style.left = "50%";
            this.pendingInputs[0].el.style.top = this.pendingInputs[0].el.offsetTop - 10 + "px"; // stop it from moving down
            this.pendingInputs[0].el.style.opacity = "0";
            // Create a particle thingy
            var particle_1 = document.createElement("div");
            particle_1.classList.add("particle");
            if (badness < PerfectTime) {
                particle_1.textContent = "perfect!";
                particle_1.style.color = "lime";
            }
            else if (Math.abs(tilNext) < OkTime) {
                particle_1.textContent = "ok!";
                particle_1.style.color = "yellow";
            }
            else { // miss
                particle_1.textContent = "miss";
                particle_1.style.color = "#f77";
            }
            //particle.textContent += " " + tilNext;
            particle_1.style.top = this.pendingInputs[0].el.style.top;
            this.element.children[0].appendChild(particle_1);
            setTimeout(function () {
                particle_1.style.translate = "0px -20px";
                particle_1.style.opacity = "0";
            }, 10);
            setTimeout(function () { particle_1.remove(); }, 510);
            this.pendingInputs.splice(0, 1);
        }
    };
    KeyWindow.prototype.addInput = function (hit, windup) {
        var _this = this;
        var el = document.createElement("div");
        el.classList.add("keywindow-input");
        el.style.top = "-90px";
        el.style.transitionDuration = (windup * 1.612) + "ms"; // idk what's up with this
        this.element.children[0].appendChild(el);
        this.pendingInputs.push({ time: Date.now() + hit, el: el });
        setTimeout(function () {
            el.style.display = "block";
            el.style.top = "calc(125% - 90px)"; // x1.25
        }, hit - windup);
        setTimeout(function () {
            if (!(el.style.opacity != "0"))
                return;
            // Create a particle thingy
            var particle = document.createElement("div");
            particle.classList.add("particle");
            particle.textContent = "miss";
            particle.style.color = "#f77";
            particle.style.top = "100%";
            _this.element.children[0].appendChild(particle);
            setTimeout(function () {
                particle.style.translate = "0px -50px";
                particle.style.opacity = "0";
            }, 10);
            setTimeout(function () { particle.remove(); }, 510);
            _this.pendingInputs.splice(0, 1);
        }, hit + MissTime);
        setTimeout(function () {
            el.remove();
        }, hit + windup);
    };
    KeyWindow.prototype.close = function () {
        var _this = this;
        _super.prototype.close.call(this);
        document.removeEventListener("keydown", function (e) { _this.hit(e); });
    };
    return KeyWindow;
}(WindowThing));
var GridWindow = /** @class */ (function (_super) {
    __extends(GridWindow, _super);
    function GridWindow(s, x, y, w, h, key, gw, gh, open) {
        if (open === void 0) { open = true; }
        var _this = _super.call(this, x, y, w, h, "", open) || this;
        _this.pendingInputs = [];
        _this.song = s;
        _this.key = key;
        document.addEventListener("keydown", function (e) { _this.hit(e); });
        _this.element.children[0].classList.add("gridwindow-main");
        _this.setupGrid(gw, gh);
        return _this;
    }
    Object.defineProperty(GridWindow.prototype, "gw", {
        get: function () { return this._gridWidth; },
        set: function (v) { this.setupGrid(v, this.gh); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GridWindow.prototype, "gh", {
        get: function () { return this._gridHeight; },
        set: function (v) { this.setupGrid(this.gw, v); },
        enumerable: false,
        configurable: true
    });
    GridWindow.prototype.setupGrid = function (w, h) {
        this.content = "";
        var templateArea = [], templateRows = [], templateColumns = [];
        for (var i = 0; i < w; i++) {
            templateRows.push("1fr");
            templateArea.push([]);
            for (var j = 0; j < h; j++) {
                if (i == 0)
                    templateColumns.push("1fr");
                templateArea[i].push("item-" + i + "-" + j);
                var el = document.createElement("div");
                el.classList.add("gridwindow-item", "item-" + i + "-" + j);
                if (i == w - 1 && j == h - 1) {
                    el.classList.add("gridwindow-hitzone");
                    el.textContent = this.key;
                }
                el.style.gridArea = "item-" + i + "-" + j;
                this.element.children[0].appendChild(el);
            }
        }
        this.element.children[0].style.gridTemplateAreas = templateArea.map(function (x) { return '"' + x.join(" ") + '"'; }).join("\n");
        this.element.children[0].style.gridTemplateRows = templateRows.join(" ");
        this.element.children[0].style.gridTemplateColumns = templateColumns.join(" ");
        this._gridWidth = w;
        this._gridHeight = h;
    };
    GridWindow.prototype.hit = function (e) {
        if (e.key != this.key)
            return;
        if (!this.pendingInputs.length)
            return;
        var tilNext = this.pendingInputs[0] - Date.now();
        var badness = Math.abs(tilNext + 40);
        if (badness < MissTime) {
            // Hit!
            // Create a particle thingy
            var particle_2 = document.createElement("div");
            particle_2.classList.add("particle");
            if (badness < PerfectTime) {
                particle_2.textContent = "perfect!";
                particle_2.style.color = "lime";
            }
            else if (Math.abs(tilNext) < OkTime) {
                particle_2.textContent = "ok!";
                particle_2.style.color = "yellow";
            }
            else { // miss
                particle_2.textContent = "miss";
                particle_2.style.color = "#f77";
            }
            //particle.textContent += " " + tilNext;
            particle_2.style.top = Math.round((this.gw - 0.5) / (this.gw) * 1000) / 10 + "%";
            console.log(Math.round((this.gw - 0.5) / (this.gw) * 1000) / 10 + "%");
            this.element.children[0].appendChild(particle_2);
            setTimeout(function () {
                particle_2.style.translate = "0px -50px";
                particle_2.style.opacity = "0";
            }, 10);
            setTimeout(function () { particle_2.remove(); }, 510);
            this.pendingInputs.splice(0, 1);
        }
    };
    GridWindow.prototype.addInput = function (hit, windup) {
        var _this = this;
        var h = Date.now() + hit;
        this.pendingInputs.push(h);
        for (var i = 0; i < this.gw; i++) {
            var _loop_1 = function (j) {
                var el = Array.from(document.getElementsByClassName("item-" + i + "-" + j)).find(function (x) { return _this.element.children[0].contains(x); });
                setTimeout(function () {
                    el.style.transition = "10ms";
                    el.style.background = "white";
                }, hit - windup * (1 - (i * this_1.gh + j) / (this_1.gw * this_1.gh - 1)));
                setTimeout(function () {
                    el.style.transition = "150ms";
                    el.style.background = "transparent";
                }, hit - windup * (1 - (i * this_1.gh + j) / (this_1.gw * this_1.gh - 1)) + 100);
            };
            var this_1 = this;
            for (var j = 0; j < this.gh; j++) {
                _loop_1(j);
            }
        }
        setTimeout(function () {
            if (!_this.pendingInputs.includes(h))
                return;
            // Create a particle thingy
            var particle = document.createElement("div");
            particle.classList.add("particle");
            particle.textContent = "miss";
            particle.style.color = "#f77";
            particle.style.top = "100%";
            _this.element.children[0].appendChild(particle);
            setTimeout(function () {
                particle.style.translate = "0px -50px";
                particle.style.opacity = "0";
            }, 10);
            setTimeout(function () { particle.remove(); }, 510);
            _this.pendingInputs.splice(0, 1);
        }, hit + MissTime);
    };
    GridWindow.prototype.close = function () {
        var _this = this;
        _super.prototype.close.call(this);
        document.removeEventListener("keydown", function (e) { _this.hit(e); });
    };
    return GridWindow;
}(WindowThing));
var Song = /** @class */ (function () {
    function Song(title, duration, element, tempo, countoff, level) {
        this.title = title;
        this.duration = duration;
        this.element = element;
        this.baseTempo = tempo;
        this.tempo = tempo;
        this.countoff = countoff;
        this.level = level;
    }
    Object.defineProperty(Song.prototype, "mspb", {
        get: function () { return 60000 / this.tempo; },
        enumerable: false,
        configurable: true
    });
    Song.prototype.start = function () {
        var _this = this;
        this.tempo = this.baseTempo;
        // Music!
        this.actx = new AudioContext();
        var track = this.actx.createMediaElementSource(this.element);
        var gain = this.actx.createGain();
        track.connect(gain).connect(this.actx.destination);
        setTimeout(function () { _this.element.play(); }, this.countoff * this.mspb);
        // Play level!
        this.startTime = Date.now();
        this.level(this);
    };
    Song.prototype.stop = function () {
        this.actx.close();
    };
    return Song;
}());
var hammerOfJustice = new Song("Hammer of Justice - Toby Fox", 136, gid("hammer-of-justice"), 160, 4, function (S) {
    var b = S.mspb;
    var w0 = new GridWindow(S, 800, 200, 200, 400, "j", 4, 1);
    for (var i = 4; i <= 64; i += 4) {
        if (i % 16 == 0) {
            w0.addInput(b * (i + 1.5), b * 2.25);
        }
        else {
            w0.addInput(b * (i + 2.0), b * 1.50);
        }
    }
    var w01 = new GridWindow(S, 995, 210, 200, 400, "k", 3, 1, false);
    setTimeout(function () { w01.reopen(400); }, b * 9.5);
    for (var i = 12; i <= 64; i += 4) {
        if (i % 32 == 0) {
            w01.addInput(b * (i + 3.0), b * 2.0);
        }
        else {
            w01.addInput(b * (i + 3.5), b * 1.5);
        }
    }
    var w1 = new KeyWindow(S, 100, 100, 200, 500, "s", false);
    setTimeout(function () { w1.reopen(500); }, b * 15);
    w1.addInput(b * 20, b * 4);
    w1.addInput(b * 24, b * 4);
    w1.addInput(b * 28, b * 4);
    w1.addInput(b * 32, b * 4);
    for (var i = 36.5; i < 66; i++)
        w1.addInput(b * i, b * 2);
    // Second part!
    var w11 = new KeyWindow(S, 400, 50, 200, 500, "d", false);
    setTimeout(function () { w1.close(); }, b * 66);
    setTimeout(function () { w11.reopen(500); }, b * 64);
    for (var i = 68; i <= 158; i += 4) {
        w11.addInput(b * i, b * 4);
        if (i % 16 == 0)
            w11.addInput(b * (i + 2), b * 4); // sometimes there's an extra crash
    }
    w0.addInput(b * 69.5, b * 1.5);
    var w21 = new KeyWindow(S, 995, 310, 200, 400, "k", false);
    setTimeout(function () { w01.close(); w21.reopen(400); }, b * 68);
    w21.addInput(b * 70, b * 2);
    var w2 = new KeyWindow(S, 800, 300, 200, 400, "j", false);
    setTimeout(function () { w0.close(); w2.reopen(400); }, b * 70);
    w2.addInput(b * 75.0, b * 2);
    w2.addInput(b * 75.5, b * 2);
    w21.addInput(b * 76, b * 2);
    w21.addInput(b * 78, b * 2);
    for (var i = 80; i <= 84; i++)
        w2.addInput(b * i, b * 2);
    w2.addInput(b * 87.0, b * 2);
    w2.addInput(b * 87.5, b * 2);
    w21.addInput(b * 88, b * 2);
    w21.addInput(b * 90, b * 2);
    w21.addInput(b * 91, b * 2);
    w2.addInput(b * 92.0, b * 2);
    w2.addInput(b * 93.5, b * 2);
    w21.addInput(b * 94, b * 2);
    for (var i = 96; i < 100; i++)
        w2.addInput(b * i, b * 2);
    w2.addInput(b * 100.00, b * 2);
    w2.addInput(b * 100.75, b * 2);
    w2.addInput(b * 101.50, b * 2);
    w21.addInput(b * 102, b * 2);
    w2.addInput(b * 107.0, b * 2);
    w2.addInput(b * 107.5, b * 2);
    w21.addInput(b * 108, b * 2);
    w21.addInput(b * 110, b * 2);
    for (var i = 112; i <= 116; i++)
        w2.addInput(b * i, b * 2);
    w2.addInput(b * 119.0, b * 2);
    w2.addInput(b * 119.5, b * 2);
    w21.addInput(b * 120, b * 2);
    w21.addInput(b * 122, b * 2);
    w21.addInput(b * 123, b * 2);
    w2.addInput(b * 124.0, b * 2);
    w2.addInput(b * 125.5, b * 2);
    w21.addInput(b * 126, b * 2);
    for (var i = 128; i <= 131; i++)
        w2.addInput(b * i, b * 2);
    setTimeout(function () { w21.close(); w01.reopen(400); }, b * 131.5);
    w01.addInput(b * 133.5, b * 1.5);
    w01.addInput(b * 136.0, b * 1.0);
    w01.addInput(b * 137.5, b * 1.5);
    setTimeout(function () { w01.close(); w21.reopen(400); }, b * 138);
    w2.addInput(b * 138.0, b * 2);
    w2.addInput(b * 139.0, b * 2);
    w2.addInput(b * 139.5, b * 2);
    w21.addInput(b * 140, b * 2);
    w21.addInput(b * 142, b * 2);
    for (var i = 144; i <= 148; i++)
        w2.addInput(b * i, b * 2);
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
var inLevel = false;
playButton.element.onclick = function () {
    if (inLevel)
        return; // Can't start two levels at once
    inLevel = true;
    gid("curtain").style.top = "0%";
    levsel.close();
    playButton.close();
    setTimeout(function () { gid("curtain").style.top = "-100%"; }, 500);
    setTimeout(function () { hammerOfJustice.start(); }, 1000);
};
document.addEventListener("keypress", function (e) {
    console.log(e.key);
    if (e.key == "`" && inLevel) {
        inLevel = false;
        hammerOfJustice.stop();
        gid("curtain").style.top = "0%";
        levsel.reopen(100);
        setTimeout(function () { gid("curtain").style.top = "-100%"; }, 500);
        for (var i = allWins.length - 1; i >= 0; i--) {
            if (allWins[i].element.id != "levsel" && allWins[i].element.id != "playbutton")
                allWins[i].destroy();
        }
    }
});
