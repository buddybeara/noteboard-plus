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
var _a, _b;
var gid = function (x) { return document.getElementById(x); };
var parseTime = function (t) { return Math.floor(t / 60) + ":" + Math.floor(t % 60).toString().padStart(2, "0"); };
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
    function WindowThing(x, y, w, h, text, open, ess) {
        if (open === void 0) { open = true; }
        if (ess === void 0) { ess = false; }
        allWins.push(this);
        this.element = createWindow(x, y, w, h, open);
        if (text)
            this.content = text;
        if (!open)
            this.close();
        this.isEssential = ess;
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
var levsel = new WindowThing(50, 50, 800, 100, "Level Select", true, true);
levsel.element.id = "levsel";
levsel.element.classList.add("windowbutton");
var playButton = new WindowThing(600, 300, 200, 100, "Start", false, true);
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
var audioOffsetter = new WindowThing(50, 600, 600, 100, "\n  Visual \u2190 Audio Offset: <input id=\"audio-offset\" type=\"range\" min=\"-100\" max=\"100\" step=\"1\" style=\"width:200px\" value=\"".concat(((_a = localStorage.getItem("offsetInfo")) === null || _a === void 0 ? void 0 : _a.split(";")[0]) || 0, "\">\n  <span id=\"ao-text\">0</span>ms<br/>\n  Visual \u2190 Input Offset:<span style=\"font-size:6px\">&nbsp;</span>\n  <input id=\"input-offset\" type=\"range\" min=\"-100\" max=\"100\" step=\"1\" style=\"width:200px\" value=\"").concat(((_b = localStorage.getItem("offsetInfo")) === null || _b === void 0 ? void 0 : _b.split(";")[1]) || 40, "\"> <span id=\"io-text\">0</span>ms"), true, true);
setInterval(function () {
    // update the thingies
    var fmt = function (x) { return (parseInt(x) > 0 ? "+" : "") + parseInt(x); };
    gid("ao-text").textContent = fmt(gid("audio-offset").value);
    gid("io-text").textContent = fmt(gid("input-offset").value);
    localStorage.setItem("offsetInfo", gid("audio-offset").value + ";" + gid("input-offset").value);
}, 50);
var MissTime = 400, OkTime = 150, PerfectTime = 50;
var RhythmWindow = /** @class */ (function (_super) {
    __extends(RhythmWindow, _super);
    function RhythmWindow(x, y, w, h, song, key, open) {
        if (open === void 0) { open = true; }
        var _this = _super.call(this, x, y, w, h, "", open) || this;
        _this.song = song;
        _this.key = key;
        return _this;
    }
    RhythmWindow.prototype.doScore = function (badness) {
        this.song.score += badness <= PerfectTime ? 1 : badness > OkTime ? 0 : 1 - 0.4 * ((badness - PerfectTime) / (OkTime - PerfectTime));
        if (badness > OkTime)
            this.song.misses++;
        this.song.maxScore += 1;
    };
    RhythmWindow.prototype.formatParticle = function (badness, particle) {
        particle.classList.add("particle");
        if (badness < PerfectTime) {
            particle.textContent = "perfect!";
            particle.style.color = "lime";
        }
        else if (badness < OkTime) {
            particle.textContent = "ok!";
            particle.style.color = "yellow";
        }
        else { // miss
            particle.textContent = "miss";
            particle.style.color = "#f77";
        }
    };
    return RhythmWindow;
}(WindowThing));
var KeyWindow = /** @class */ (function (_super) {
    __extends(KeyWindow, _super);
    function KeyWindow(s, x, y, w, h, k, open) {
        if (open === void 0) { open = true; }
        var _this = _super.call(this, x, y, w, h, s, k, open) || this;
        _this.pendingInputs = [];
        document.addEventListener("keydown", function (e) { _this.hit(e); });
        var hitzone = document.createElement("div");
        hitzone.classList.add("keywindow-hitzone");
        hitzone.textContent = k;
        _this.element.children[0].appendChild(hitzone);
        return _this;
    }
    KeyWindow.prototype.hit = function (e) {
        if (e.key != this.key)
            return;
        if (!this.pendingInputs.length)
            return;
        var tilNext = this.pendingInputs[0].time - Date.now();
        var badness = Math.abs(tilNext + parseInt(gid("input-offset").value));
        if (badness < MissTime) {
            // Hit!
            this.pendingInputs[0].el.style.transitionDuration = "0.1s";
            this.pendingInputs[0].el.style.width = "0";
            this.pendingInputs[0].el.style.left = "50%";
            this.pendingInputs[0].el.style.top = this.pendingInputs[0].el.offsetTop - 10 + "px"; // stop it from moving down
            this.pendingInputs[0].el.style.opacity = "0";
            // Create a particle thingy
            var particle_1 = document.createElement("div");
            this.formatParticle(badness, particle_1);
            particle_1.style.top = this.pendingInputs[0].el.style.top;
            this.element.children[0].appendChild(particle_1);
            setTimeout(function () {
                particle_1.style.translate = "0px -20px";
                particle_1.style.opacity = "0";
            }, 10);
            setTimeout(function () { particle_1.remove(); }, 510);
            this.pendingInputs.splice(0, 1);
            this.doScore(badness);
        }
    };
    KeyWindow.prototype.addInput = function (hit, windup) {
        var _this = this;
        var el = document.createElement("div");
        el.classList.add("keywindow-input");
        el.style.top = "-90px";
        el.style.transitionDuration = (windup * 1.54) + "ms"; // idk what's up with this
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
            _this.song.maxScore += 1;
            _this.song.misses += 1;
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
}(RhythmWindow));
var GridWindow = /** @class */ (function (_super) {
    __extends(GridWindow, _super);
    function GridWindow(s, x, y, w, h, k, gw, gh, open) {
        if (open === void 0) { open = true; }
        var _this = _super.call(this, x, y, w, h, s, k, open) || this;
        _this.pendingInputs = [];
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
        var badness = Math.abs(tilNext + parseInt(gid("input-offset").value));
        if (badness < MissTime) {
            // Hit!
            // Create a particle thingy
            var particle_2 = document.createElement("div");
            this.formatParticle(badness, particle_2);
            particle_2.style.top = Math.round((this.gw - 0.5) / (this.gw) * 1000) / 10 + "%";
            this.element.children[0].appendChild(particle_2);
            setTimeout(function () {
                particle_2.style.translate = "0px -50px";
                particle_2.style.opacity = "0";
            }, 10);
            setTimeout(function () { particle_2.remove(); }, 510);
            this.pendingInputs.splice(0, 1);
            this.doScore(badness);
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
            _this.song.maxScore += 1;
            _this.song.misses += 1;
        }, hit + MissTime);
    };
    GridWindow.prototype.close = function () {
        var _this = this;
        _super.prototype.close.call(this);
        document.removeEventListener("keydown", function (e) { _this.hit(e); });
    };
    return GridWindow;
}(RhythmWindow));
var songUI = new WindowThing(50, window.innerHeight - 200, 800, 125, "", false, true);
var Song = /** @class */ (function () {
    function Song(title, duration, element, tempo, countoff, level) {
        this.title = title;
        this.duration = duration;
        this.element = element;
        this.tempo = tempo;
        this.countoff = countoff;
        this.level = level;
        this.actx = new AudioContext();
        var track = this.actx.createMediaElementSource(this.element);
        var gain = this.actx.createGain();
        track.connect(gain).connect(this.actx.destination);
    }
    Object.defineProperty(Song.prototype, "mspb", {
        get: function () { return 60000 / this.tempo; },
        enumerable: false,
        configurable: true
    });
    Song.prototype.start = function () {
        var _this = this;
        console.log("Starting...");
        // Music!
        setTimeout(function () { _this.actx.resume(); _this.element.play(); console.log("Playing sound"); }, this.countoff * this.mspb + 100 + parseInt(gid("audio-offset").value));
        songUI.content = this.title;
        songUI.reopen(125);
        // Play level!
        this.startTime = Date.now();
        this.score = 0;
        this.maxScore = 0;
        this.misses = 0;
        setTimeout(function () { return _this.level(_this); }, 100); // have to do an extra 100ms because the offset could be up to -100ms
        this.updateLoop = setInterval(function () {
            var acc = _this.score / _this.maxScore;
            songUI.content = _this.title + " [" + parseTime(_this.element.currentTime) + " / " + parseTime(_this.duration) +
                "]<br/>Score: " + (_this.maxScore == 0 ? 0 : acc * 100).toFixed(2) + "% (" +
                (_this.score == 0 ? "—" : acc == 1 ? "AllPerfect!!" : _this.misses == 0 ? "FullCombo!" : acc > 0.99 ? "SS!" : acc > 0.98 ? "S+!" : acc > 0.98 ? "S" : acc > 0.96 ? "A+" : acc > 0.9 ? "A" : acc > 0.86 ? "B+" : acc > 0.8 ? "B" : acc > 0.76 ? "C+" : acc > 0.7 ? "C" : acc > 0.6 ? "D" : "Z") + ")" +
                "<br/>Press ` to exit";
        }, 20);
        // Get ready to stop the level!!
        var thisStartTime = this.startTime * 1.0;
        setTimeout(function () {
            // check if still in level
            if (_this.startTime != thisStartTime || !inLevel)
                return;
            inLevel = false;
            _this.stop();
            gid("curtain").style.top = "0%";
            var acc = _this.score / _this.maxScore;
            gid("clear").innerHTML = "LEVEL CLEAR !!!<br/>SONG: ".concat(_this.title, "<br/>HITS: ").concat(_this.maxScore - _this.misses, "<br/>MISSES: ").concat(_this.misses, "<br/>SCORE: ").concat((_this.maxScore == 0 ? 0 : acc * 100).toFixed(2), "%<br/>RANK: ") +
                (_this.score == 0 ? "undefined??" : acc == 1 ? "ALL PERFECT! :::3" : _this.misses == 0 ? "FULL COMBO :3" : acc > 0.99 ? "SUPREME :O" : acc > 0.98 ? "superb+ :D" : acc > 0.98 ? "superb :D" : acc > 0.96 ? "awesome+ (:" : acc > 0.9 ? "awesome (:" : acc > 0.86 ? "nice+ :)" : acc > 0.8 ? "nice" : acc > 0.76 ? "ok+" : acc > 0.7 ? "ok" : acc > 0.6 ? "eh" : "none :C");
            gid("clear").style.top = "25%";
            levsel.reopen(100);
            levsel.content = "Level Select";
            setTimeout(function () { gid("curtain").style.top = "-100%"; gid("clear").style.top = "-100%"; audioOffsetter.reopen(100); }, 5000);
            for (var i = allWins.length - 1; i >= 0; i--) {
                if (!allWins[i].isEssential)
                    allWins[i].destroy();
            }
        }, 500 + this.duration * 1000 + this.countoff * this.mspb);
    };
    Song.prototype.stop = function () {
        this.element.pause();
        songUI.close();
        this.element.currentTime = 0;
        clearInterval(this.updateLoop);
        this.updateLoop = undefined;
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
    var w1 = new KeyWindow(S, 250, 100, 200, 500, "s", false);
    setTimeout(function () { w1.reopen(500); }, b * 15);
    w1.addInput(b * 20, b * 4);
    w1.addInput(b * 24, b * 4);
    w1.addInput(b * 28, b * 4);
    w1.addInput(b * 32, b * 4);
    for (var i = 36.5; i < 66; i++)
        w1.addInput(b * i, b * 2);
    // Second part!
    var w11 = new KeyWindow(S, 445, 50, 200, 500, "d", false);
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
    w21.addInput(b * 101.50, b * 2);
    w21.addInput(b * 102, b * 2);
    w2.addInput(b * 107.0, b * 2);
    w2.addInput(b * 107.5, b * 2);
    w21.addInput(b * 108, b * 2);
    w21.addInput(b * 110, b * 2);
    for (var i = 112; i <= 116; i++)
        w2.addInput(b * i, b * 2);
    w2.addInput(b * 119.0, b * 2);
    w21.addInput(b * 119.5, b * 2);
    w21.addInput(b * 120, b * 2);
    w21.addInput(b * 122, b * 2);
    w21.addInput(b * 123, b * 2);
    w2.addInput(b * 124.0, b * 2);
    w21.addInput(b * 125.5, b * 2);
    w21.addInput(b * 126, b * 2);
    for (var i = 128; i <= 131; i++)
        w2.addInput(b * i, b * 2);
    setTimeout(function () { w21.close(); w01.reopen(400); }, b * 131.5);
    w01.addInput(b * 133.5, b * 1.5);
    w2.addInput(b * 134.0, b * 1.5);
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
    setTimeout(function () { w11.close(); w2.close(); w21.close(); }, b * 158.5);
    setTimeout(function () { w1.reopen(500); w2.reopen(400); w01.reopen(400); }, b * 160);
    w01.addInput(b * 164, b * 2);
    w1.addInput(b * 164, b * 4);
    w1.addInput(b * 168.15584, b * 4.15584);
    setTimeout(function () {
        b = 60000 / 154;
        // Everything is zeroed out again here. -164 to everything.
        for (var i = 8; i <= 60; i++) {
            if (i % 4 == 0 || [10, 26, 42, 60].includes(i))
                w1.addInput(b * i, b * 4);
        }
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
        setTimeout(function () {
            b = 60000 / 160;
            // Everything is zeroed out again! yippee
            for (var i = 2.5; i < 64; i++) {
                w1.addInput(b * i, b * 2);
            }
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
            setTimeout(function () { w01.close(); w21.reopen(400); }, b * 61);
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
            setTimeout(function () { w1.close(); }, b * 96);
            // okay I am not doing this again so I'm going to instead copy paste it :3
            setTimeout(function () {
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
                setTimeout(function () { w2.close(); w21.close(); }, b * 96);
            }, b * 32);
        }, b * 65); // !!!! Random magic number !!!!
    }, b * 164);
});
var inLevel = false;
playButton.element.onclick = function () {
    if (inLevel)
        return; // Can't start two levels at once
    inLevel = true;
    gid("curtain").style.top = "0%";
    for (var _i = 0, allWins_1 = allWins; _i < allWins_1.length; _i++) {
        var i = allWins_1[_i];
        i.close();
    }
    setTimeout(function () { gid("curtain").style.top = "-100%"; }, 500);
    setTimeout(function () { hammerOfJustice.start(); }, 1000);
};
document.addEventListener("keypress", function (e) {
    if (e.key == "`" && inLevel) {
        inLevel = false;
        hammerOfJustice.stop();
        gid("curtain").style.top = "0%";
        songUI.close();
        levsel.reopen(100);
        levsel.content = "Level Select";
        setTimeout(function () { gid("curtain").style.top = "-100%"; audioOffsetter.reopen(100); }, 500);
        for (var i = allWins.length - 1; i >= 0; i--) {
            if (!allWins[i].isEssential)
                allWins[i].destroy();
        }
    }
});
