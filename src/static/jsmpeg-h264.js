var JSMpeg = {
    Player: null,
    VideoElement: null,
    BitBuffer: null,
    Source: {},
    Demuxer: {},
    Decoder: {},
    Renderer: {},
    AudioOutput: {},
    Now: function() {
        return window.performance ? window.performance.now() / 1e3 : Date.now() / 1e3;
    },
    CreateVideoElements: function() {
        var elements = document.querySelectorAll(".jsmpeg");
        for (var i = 0; i < elements.length; i++) {
            new JSMpeg.VideoElement(elements[i]);
        }
    },
    Fill: function(array, value) {
        if (array.fill) {
            array.fill(value);
        } else {
            for (var i = 0; i < array.length; i++) {
                array[i] = value;
            }
        }
    }
};

if (document.readyState === "complete") {
    JSMpeg.CreateVideoElements();
} else {
    document.addEventListener("DOMContentLoaded", JSMpeg.CreateVideoElements);
}

JSMpeg.VideoElement = function() {
    "use strict";
    var VideoElement = function(element) {
        var url = element.dataset.url;
        if (!url) {
            throw "VideoElement has no `data-url` attribute";
        }
        var addStyles = function(element, styles) {
            for (var name in styles) {
                element.style[name] = styles[name];
            }
        };
        this.container = element;
        addStyles(this.container, {
            display: "inline-block",
            position: "relative",
            minWidth: "80px",
            minHeight: "80px"
        });
        this.canvas = document.createElement("canvas");
        this.canvas.width = 960;
        this.canvas.height = 540;
        addStyles(this.canvas, {
            display: "block",
            width: "100%"
        });
        this.container.appendChild(this.canvas);
        this.playButton = document.createElement("div");
        this.playButton.innerHTML = VideoElement.PLAY_BUTTON;
        addStyles(this.playButton, {
            zIndex: 2,
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "0",
            right: "0",
            maxWidth: "75px",
            maxHeight: "75px",
            margin: "auto",
            opacity: "0.7",
            cursor: "pointer"
        });
        this.container.appendChild(this.playButton);
        var options = {
            canvas: this.canvas
        };
        for (var option in element.dataset) {
            try {
                options[option] = JSON.parse(element.dataset[option]);
            } catch (err) {
                options[option] = element.dataset[option];
            }
        }
        this.player = new JSMpeg.Player(url, options);
        element.playerInstance = this.player;
        if (options.poster && !options.autoplay && !this.player.options.streaming) {
            options.decodeFirstFrame = false;
            this.poster = new Image();
            this.poster.src = options.poster;
            this.poster.addEventListener("load", this.posterLoaded);
            addStyles(this.poster, {
                display: "block",
                zIndex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
            });
            this.container.appendChild(this.poster);
        }
        if (!this.player.options.streaming) {
            this.container.addEventListener("click", this.onClick.bind(this));
        }
        if (options.autoplay || this.player.options.streaming) {
            this.playButton.style.display = "none";
        }
        if (this.player.audioOut && !this.player.audioOut.unlocked) {
            var unlockAudioElement = this.container;
            if (options.autoplay || this.player.options.streaming) {
                this.unmuteButton = document.createElement("div");
                this.unmuteButton.innerHTML = VideoElement.UNMUTE_BUTTON;
                addStyles(this.unmuteButton, {
                    zIndex: 2,
                    position: "absolute",
                    bottom: "10px",
                    right: "20px",
                    width: "75px",
                    height: "75px",
                    margin: "auto",
                    opacity: "0.7",
                    cursor: "pointer"
                });
                this.container.appendChild(this.unmuteButton);
                unlockAudioElement = this.unmuteButton;
            }
            this.unlockAudioBound = this.onUnlockAudio.bind(this, unlockAudioElement);
            unlockAudioElement.addEventListener("touchstart", this.unlockAudioBound, false);
            unlockAudioElement.addEventListener("click", this.unlockAudioBound, true);
        }
    };
    VideoElement.prototype.onUnlockAudio = function(element, ev) {
        if (this.unmuteButton) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        this.player.audioOut.unlock(function() {
            if (this.unmuteButton) {
                this.unmuteButton.style.display = "none";
            }
            element.removeEventListener("touchstart", this.unlockAudioBound);
            element.removeEventListener("click", this.unlockAudioBound);
        }.bind(this));
    };
    VideoElement.prototype.onClick = function(ev) {
        if (this.player.isPlaying) {
            this.player.pause();
            this.playButton.style.display = "block";
        } else {
            this.player.play();
            this.playButton.style.display = "none";
            if (this.poster) {
                this.poster.style.display = "none";
            }
        }
    };
    VideoElement.PLAY_BUTTON = '<svg style="max-width: 75px; max-height: 75px;" ' + 'viewBox="0 0 200 200" alt="Play video">' + '<circle cx="100" cy="100" r="90" fill="none" ' + 'stroke-width="15" stroke="#fff"/>' + '<polygon points="70, 55 70, 145 145, 100" fill="#fff"/>' + "</svg>";
    VideoElement.UNMUTE_BUTTON = '<svg style="max-width: 75px; max-height: 75px;" viewBox="0 0 75 75">' + '<polygon class="audio-speaker" stroke="none" fill="#fff" ' + 'points="39,13 22,28 6,28 6,47 21,47 39,62 39,13"/>' + '<g stroke="#fff" stroke-width="5">' + '<path d="M 49,50 69,26"/>' + '<path d="M 69,50 49,26"/>' + "</g>" + "</svg>";
    return VideoElement;
}();

JSMpeg.Player = function() {
    "use strict";
    var Player = function(url, options) {
        this.options = options || {};
        if (options.source) {
            this.source = new options.source(url, options);
            options.streaming = !!this.source.streaming;
        } else if (url.match(/^wss?:\/\//)) {
            this.source = new JSMpeg.Source.WebSocket(url, options);
            options.streaming = true;
        } else if (options.progressive !== false) {
            this.source = new JSMpeg.Source.AjaxProgressive(url, options);
            options.streaming = false;
        } else {
            this.source = new JSMpeg.Source.Ajax(url, options);
            options.streaming = false;
        }
        this.maxAudioLag = options.maxAudioLag || .25;
        this.loop = options.loop !== false;
        this.autoplay = !!options.autoplay || options.streaming;
        this.demuxer = new JSMpeg.Demuxer.TS(options);
        this.source.connect(this.demuxer);
        if (options.video !== false) {
            this.video = new JSMpeg.Decoder.MPEG1Video(options);
            this.renderer = null;
            this.demuxer.connect(JSMpeg.Demuxer.TS.STREAM.VIDEO_1, this.video);
            this.video.connect(this.renderer);
        }
        if (options.audio !== false && JSMpeg.AudioOutput.WebAudio.IsSupported()) {
            this.audio = new JSMpeg.Decoder.MP2Audio(options);
            this.audioOut = new JSMpeg.AudioOutput.WebAudio(options);
            this.demuxer.connect(JSMpeg.Demuxer.TS.STREAM.AUDIO_1, this.audio);
            this.audio.connect(this.audioOut);
        }
        Object.defineProperty(this, "currentTime", {
            get: this.getCurrentTime,
            set: this.setCurrentTime
        });
        Object.defineProperty(this, "volume", {
            get: this.getVolume,
            set: this.setVolume
        });
        this.unpauseOnShow = false;
        if (options.pauseWhenHidden !== false) {
            document.addEventListener("visibilitychange", this.showHide.bind(this));
        }
        this.source.start();
        if (this.autoplay) {
            this.play();
        }
    };
    Player.prototype.showHide = function(ev) {
        if (document.visibilityState === "hidden") {
            this.unpauseOnShow = this.wantsToPlay;
            this.pause();
        } else if (this.unpauseOnShow) {
            this.play();
        }
    };
    Player.prototype.play = function(ev) {
        this.animationId = requestAnimationFrame(this.update.bind(this));
        this.wantsToPlay = true;
    };
    Player.prototype.pause = function(ev) {
        cancelAnimationFrame(this.animationId);
        this.wantsToPlay = false;
        this.isPlaying = false;
        if (this.audio && this.audio.canPlay) {
            this.audioOut.stop();
            this.seek(this.currentTime);
        }
    };
    Player.prototype.getVolume = function() {
        return this.audioOut ? this.audioOut.volume : 0;
    };
    Player.prototype.setVolume = function(volume) {
        if (this.audioOut) {
            this.audioOut.volume = volume;
        }
    };
    Player.prototype.stop = function(ev) {
        this.pause();
        this.seek(0);
        if (this.video && this.options.decodeFirstFrame !== false) {
            this.video.decode();
        }
    };
    Player.prototype.destroy = function() {
        this.pause();
        this.source.destroy();
        this.renderer.destroy();
        this.audioOut.destroy();
    };
    Player.prototype.seek = function(time) {
        var startOffset = this.audio && this.audio.canPlay ? this.audio.startTime : this.video.startTime;
        if (this.video) {
            this.video.seek(time + startOffset);
        }
        if (this.audio) {
            this.audio.seek(time + startOffset);
        }
        this.startTime = JSMpeg.Now() - time;
    };
    Player.prototype.getCurrentTime = function() {
        return this.audio && this.audio.canPlay ? this.audio.currentTime - this.audio.startTime : this.video.currentTime - this.video.startTime;
    };
    Player.prototype.setCurrentTime = function(time) {
        this.seek(time);
    };
    Player.prototype.update = function() {
        this.animationId = requestAnimationFrame(this.update.bind(this));
        if (!this.source.established) {
            if (this.renderer) {
                this.renderer.renderProgress(this.source.progress);
            }
            return;
        }
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.startTime = JSMpeg.Now() - this.currentTime;
        }
        if (this.options.streaming) {
            this.updateForStreaming();
        } else {
            this.updateForStaticFile();
        }
    };
    Player.prototype.updateForStreaming = function() {
        if (this.video) {
            this.video.decode();
        }
        if (this.audio) {
            var decoded = false;
            do {
                if (this.audioOut.enqueuedTime > this.maxAudioLag) {
                    this.audioOut.resetEnqueuedTime();
                    this.audioOut.enabled = false;
                }
                decoded = this.audio.decode();
            } while (decoded);
            this.audioOut.enabled = true;
        }
    };
    Player.prototype.updateForStaticFile = function() {
        var notEnoughData = false, headroom = 0;
        if (this.audio && this.audio.canPlay) {
            while (!notEnoughData && this.audio.decodedTime - this.audio.currentTime < .25) {
                notEnoughData = !this.audio.decode();
            }
            if (this.video && this.video.currentTime < this.audio.currentTime) {
                notEnoughData = !this.video.decode();
            }
            headroom = this.demuxer.currentTime - this.audio.currentTime;
        } else if (this.video) {
            var targetTime = JSMpeg.Now() - this.startTime + this.video.startTime, lateTime = targetTime - this.video.currentTime, frameTime = 1 / this.video.frameRate;
            if (this.video && lateTime > 0) {
                if (lateTime > frameTime * 2) {
                    this.startTime += lateTime;
                }
                notEnoughData = !this.video.decode();
            }
            headroom = this.demuxer.currentTime - targetTime;
        }
        this.source.resume(headroom);
        if (notEnoughData && this.source.completed) {
            if (this.loop) {
                this.seek(0);
            } else {
                this.pause();
            }
        }
    };
    return Player;
}();

JSMpeg.BitBuffer = function() {
    "use strict";
    var BitBuffer = function(bufferOrLength, mode) {
        if (typeof bufferOrLength === "object") {
            this.bytes = bufferOrLength instanceof Uint8Array ? bufferOrLength : new Uint8Array(bufferOrLength);
            this.byteLength = this.bytes.length;
        } else {
            this.bytes = new Uint8Array(bufferOrLength || 1024 * 1024);
            this.byteLength = 0;
        }
        this.mode = mode || BitBuffer.MODE.EXPAND;
        this.index = 0;
    };
    BitBuffer.prototype.resize = function(size) {
        var newBytes = new Uint8Array(size);
        if (this.byteLength !== 0) {
            this.byteLength = Math.min(this.byteLength, size);
            newBytes.set(this.bytes, 0, this.byteLength);
        }
        this.bytes = newBytes;
        this.index = Math.min(this.index, this.byteLength << 3);
    };
    BitBuffer.prototype.evict = function(sizeNeeded) {
        console.log("evict(" + sizeNeeded +")");
       
        var bytePos = this.index >> 3;
        var available = this.bytes.length - this.byteLength;
        console.log("  bits.index >> 3 was " + bytePos)
        console.log("  bits.byteLength was " + this.byteLength)
        console.log("  bits.bytes.length was " + this.bytes.length)
        if (this.index === this.byteLength << 3 || sizeNeeded > available + bytePos) {
            this.byteLength = 0;
            this.index = 0;
            return;
        } else if (bytePos === 0) {
            return;
        }
        if (this.bytes.copyWithin) {
            this.bytes.copyWithin(0, bytePos, this.byteLength);
        } else {
            this.bytes.set(this.bytes.subarray(bytePos, this.byteLength));
        }
        this.byteLength = this.byteLength - bytePos;
        this.index -= bytePos << 3;
        return;
    };
    BitBuffer.prototype.write = function(buffers) {
        var isArrayOfBuffers = typeof buffers[0] === "object", totalLength = 0, available = this.bytes.length - this.byteLength;
        if (isArrayOfBuffers) {
            var totalLength = 0;
            for (var i = 0; i < buffers.length; i++) {
                totalLength += buffers[i].byteLength;
            }
        } else {
            totalLength = buffers.byteLength;
        }
        if (totalLength > available) {
            if (this.mode === BitBuffer.MODE.EXPAND) {
                var newSize = Math.max(this.bytes.length * 2, totalLength - available);
                this.resize(newSize);
            } else {
                this.evict(totalLength);
            }
        }
        if (isArrayOfBuffers) {
            for (var i = 0; i < buffers.length; i++) {
                this.appendSingleBuffer(buffers[i]);
            }
        } else {
            this.appendSingleBuffer(buffers);
        }
    };
    BitBuffer.prototype.appendSingleBuffer = function(buffer) {
        buffer = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        try{
            this.bytes.set(buffer, this.byteLength);
        } catch (ex){
            console.error(ex);
        }
        this.byteLength += buffer.length;
    };
    BitBuffer.prototype.nextBytesAreStartCode = function() {
        var i = this.index + 7 >> 3;
        return i >= this.byteLength || this.bytes[i] == 0 && this.bytes[i + 1] == 0 && this.bytes[i + 2] == 1;
    };
    BitBuffer.prototype.peek = function(count) {
        var offset = this.index;
        var value = 0;
        while (count) {
            var currentByte = this.bytes[offset >> 3], remaining = 8 - (offset & 7), read = remaining < count ? remaining : count, shift = remaining - read, mask = 255 >> 8 - read;
            value = value << read | (currentByte & mask << shift) >> shift;
            offset += read;
            count -= read;
        }
        return value;
    };
    BitBuffer.prototype.read = function(count) {
        var value = this.peek(count);
        this.index += count;
        return value;
    };
    BitBuffer.prototype.skip = function(count) {
        return this.index += count;
    };
    BitBuffer.prototype.rewind = function(count) {
        this.index = Math.max(this.index - count, 0);
    };
    BitBuffer.prototype.has = function(count) {
        return (this.byteLength << 3) - this.index >= count;
    };
    BitBuffer.MODE = {
        EVICT: 1,
        EXPAND: 2
    };
    return BitBuffer;
}();

JSMpeg.Source.WebSocket = function() {
    "use strict";
    var WSSource = function(url, options) {
        this.streaming = true;
        this.url = url;
        this.options = options;
        this.socket = null;
        this.callbacks = {
            connect: [],
            data: []
        };
        this.destination = null;
        this.reconnectInterval = options.reconnectInterval !== undefined ? options.reconnectInterval : 5;
        this.shouldAttemptReconnect = !!this.reconnectInterval;
        this.completed = false;
        this.established = false;
        this.progress = 0;
        this.reconnectTimeoutId = 0;
        window._wsTotalBytes = 0;
    };
    WSSource.prototype.connect = function(destination) {
        this.destination = destination;
    };
    WSSource.prototype.destroy = function() {
        clearTimeout(this.reconnectTimeoutId);
        this.shouldAttemptReconnect = false;
        this.socket.close();
    };
    WSSource.prototype.start = function() {
        this.shouldAttemptReconnect = !!this.reconnectInterval;
        this.progress = 0;
        this.established = false;
        this.socket = new WebSocket(this.url, this.options.protocols || null);
        this.socket.binaryType = "arraybuffer";
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onerror = this.onClose.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    };
    WSSource.prototype.resume = function(secondsHeadroom) {};
    WSSource.prototype.onOpen = function() {
        this.progress = 1;
        this.established = true;
        console.log("sending websocket message: start")
        this.socket.send("start");
    };
    WSSource.prototype.onClose = function() {
        if (this.shouldAttemptReconnect) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = setTimeout(function() {
                this.start();
            }.bind(this), this.reconnectInterval * 1e3);
        }
    };
    WSSource.prototype.onMessage = function(ev) {
        if (this.destination) {
            window._wsTotalBytes += ev.data.byteLength;
            this.destination.write(ev.data);
        }
    };
    return WSSource;
}();

JSMpeg.Demuxer.TS = function() {
    "use strict";
    var TS = function(options) {
        this.bits = null;
        this.leftoverBytes = null;
        this.guessVideoFrameEnd = true;
        this.pidsToStreamIds = {};
        this.pesPacketInfo = {};
        this.startTime = 0;
        this.currentTime = 0;
    };
    TS.prototype.connect = function(streamId, destination) {
        this.pesPacketInfo[streamId] = {
            destination: destination,
            currentLength: 0,
            totalLength: 0,
            pts: 0,
            buffers: []
        };
    };
    TS.prototype.write = function(rawbuffer) {
        var buffer = this.removePadding(rawbuffer);
        if (this.leftoverBytes) {
            var totalLength = buffer.byteLength + this.leftoverBytes.byteLength;
            this.bits = new JSMpeg.BitBuffer(totalLength);
            this.bits.write([ this.leftoverBytes, buffer ]);
        } else {
            this.bits = new JSMpeg.BitBuffer(buffer);
        }
        while (this.bits.has(188 << 3) && this.parsePacket()) {}
        var leftoverCount = this.bits.byteLength - (this.bits.index >> 3);
        this.leftoverBytes = leftoverCount > 0 ? this.bits.bytes.subarray(this.bits.index >> 3) : null;
    };
    TS.prototype.removePadding = function(rawAB){
        //console.log("rawAB length : " + rawAB.byteLength);
        var r = new Uint8Array(rawAB);
        var clean = [];
        for (var pkt = 0; pkt <= 7; pkt++){
            if ( r[(188*pkt)+12] == 71 && r.byteLength >= ((pkt+1)*188)+12 ){
                var maxlength = Math.min(r.byteLength, ((pkt+1)*188)+12);
                for (var n = (pkt*188)+12; n < maxlength; n++){
                    clean.push(r[n]);
                }
            }
        }
        var ret = new Uint8Array(clean);
        return ret;
    }
    TS.prototype.parsePacket = function() {
        if (this.bits.read(8) !== 71) {
            if (!this.resync()) {
                return false;
            }
        }
        var end = (this.bits.index >> 3) + 187;
        var transportError = this.bits.read(1), payloadStart = this.bits.read(1), transportPriority = this.bits.read(1), pid = this.bits.read(13), transportScrambling = this.bits.read(2), adaptationField = this.bits.read(2), continuityCounter = this.bits.read(4);
        var streamId = this.pidsToStreamIds[pid];
        if (payloadStart && streamId) {
            var pi = this.pesPacketInfo[streamId];
            if (pi && pi.currentLength) {
                this.packetComplete(pi);
            }
        }
        if (adaptationField & 1) {
            if (adaptationField & 2) {
                var adaptationFieldLength = this.bits.read(8);
                this.bits.skip(adaptationFieldLength << 3);
            }
            if (payloadStart && this.bits.nextBytesAreStartCode()) {
                this.bits.skip(24);
                streamId = this.bits.read(8);
                this.pidsToStreamIds[pid] = streamId;
                var packetLength = this.bits.read(16);
                this.bits.skip(8);
                var ptsDtsFlag = this.bits.read(2);
                this.bits.skip(6);
                var headerLength = this.bits.read(8);
                var payloadBeginIndex = this.bits.index + (headerLength << 3);
                var pi = this.pesPacketInfo[streamId];
                if (pi) {
                    var pts = 0;
                    if (ptsDtsFlag & 2) {
                        this.bits.skip(4);
                        var p32_30 = this.bits.read(3);
                        this.bits.skip(1);
                        var p29_15 = this.bits.read(15);
                        this.bits.skip(1);
                        var p14_0 = this.bits.read(15);
                        this.bits.skip(1);
                        pts = (p32_30 * 1073741824 + p29_15 * 32768 + p14_0) / 9e4;
                        this.currentTime = pts;
                        if (this.startTime === -1) {
                            this.startTime = pts;
                        }
                    }
                    var payloadLength = packetLength ? packetLength - headerLength - 3 : 0;
                    this.packetStart(pi, pts, payloadLength);
                }
                this.bits.index = payloadBeginIndex;
            }
            if (streamId) {
                var pi = this.pesPacketInfo[streamId];
                if (pi) {
                    var start = this.bits.index >> 3;
                    var complete = this.packetAddData(pi, start, end);
                    var hasPadding = !payloadStart && adaptationField & 2;
                    if (complete || this.guessVideoFrameEnd && hasPadding) {
                        this.packetComplete(pi);
                    }
                }
            }
        }
        this.bits.index = end << 3;
        return true;
    };
    TS.prototype.resync = function() {
        if (!this.bits.has(188 * 3 << 3)) {
            return false;
        }
        var byteIndex = this.bits.index >> 3;
        for (var i = 0; i < 187; i++) {
            if (this.bits.bytes[byteIndex + i] === 71) {
                var foundSync = true;
                for (var j = 1; j < 2; j++) {
                    if (this.bits.bytes[byteIndex + i + 188 * j] !== 71) {
                        foundSync = false;
                        break;
                    }
                }
                if (foundSync) {
                    this.bits.index = byteIndex + i + 1 << 3;
                    return true;
                }
            }
        }
        console.warn("JSMpeg: Possible garbage data. Skipping.");
        this.bits.skip(187 << 3);
        return false;
    };
    TS.prototype.packetStart = function(pi, pts, payloadLength) {
        pi.totalLength = payloadLength;
        pi.currentLength = 0;
        pi.pts = pts;
    };
    TS.prototype.packetAddData = function(pi, start, end) {
        pi.buffers.push(this.bits.bytes.subarray(start, end));
        pi.currentLength += end - start;
        var complete = pi.totalLength !== 0 && pi.currentLength >= pi.totalLength;
        return complete;
    };
    TS.prototype.packetComplete = function(pi) {
        pi.destination.write(pi.pts, pi.buffers);
        pi.totalLength = 0;
        pi.currentLength = 0;
        pi.buffers = [];
    };
    TS.STREAM = {
        PACK_HEADER: 186,
        SYSTEM_HEADER: 187,
        PROGRAM_MAP: 188,
        PRIVATE_1: 189,
        PADDING: 190,
        PRIVATE_2: 191,
        AUDIO_1: 192,
        VIDEO_1: 224,
        DIRECTORY: 255
    };
    return TS;
}();

JSMpeg.Decoder.Base = function() {
    "use strict";
    var BaseDecoder = function(options) {
        this.destination = null;
        this.canPlay = false;
        this.collectTimestamps = !options.streaming;
        this.timestamps = [];
        this.timestampIndex = 0;
        this.startTime = 0;
        this.decodedTime = 0;
        Object.defineProperty(this, "currentTime", {
            get: this.getCurrentTime
        });
    };
    BaseDecoder.prototype.connect = function(destination) {
        this.destination = destination;
    };
    BaseDecoder.prototype.write = function(pts, buffers) {
        if (this.collectTimestamps) {
            if (this.timestamps.length === 0) {
                this.startTime = pts;
                this.decodedTime = pts;
            }
            this.timestamps.push({
                index: this.bits.byteLength << 3,
                time: pts
            });
        }
        this.bits.write(buffers);
        this.canPlay = true;
    };
    BaseDecoder.prototype.seek = function(time) {
        if (!this.collectTimestamps) {
            return;
        }
        this.timestampIndex = 0;
        for (var i = 0; i < this.timestamps.length; i++) {
            if (this.timestamps[i].time > time) {
                break;
            }
            this.timestampIndex = i;
        }
        var ts = this.timestamps[this.timestampIndex];
        if (ts) {
            this.bits.index = ts.index;
            this.decodedTime = ts.time;
        } else {
            this.bits.index = 0;
            this.decodedTime = this.startTime;
        }
    };
    BaseDecoder.prototype.decode = function() {
        this.advanceDecodedTime(0);
    };
    BaseDecoder.prototype.advanceDecodedTime = function(seconds) {
        if (this.collectTimestamps) {
            var newTimestampIndex = -1;
            for (var i = this.timestampIndex; i < this.timestamps.length; i++) {
                if (this.timestamps[i].index > this.bits.index) {
                    break;
                }
                newTimestampIndex = i;
            }
            if (newTimestampIndex !== -1 && newTimestampIndex !== this.timestampIndex) {
                this.timestampIndex = newTimestampIndex;
                this.decodedTime = this.timestamps[this.timestampIndex].time;
                return;
            }
        }
        this.decodedTime += seconds;
    };
    BaseDecoder.prototype.getCurrentTime = function() {
        return this.decodedTime;
    };
    return BaseDecoder;
}();

JSMpeg.Decoder.MPEG1Video = function() {
    "use strict";
    var MPEG1 = function(options) {
        JSMpeg.Decoder.Base.call(this, options);
        var bufferSize = options.videoBufferSize || 64 * 1024;
        var bufferMode = options.streaming ? JSMpeg.BitBuffer.MODE.EVICT : JSMpeg.BitBuffer.MODE.EXPAND;
        this.bits = new JSMpeg.BitBuffer(bufferSize, bufferMode);
        this.NALs = [];
        window.NALs = this.NALs;
        this.prevMarker = 0;
        this.prevTime = Date.now();
        window._mpeg1TotalBytes = 0;
    };
    MPEG1.prototype = Object.create(JSMpeg.Decoder.Base.prototype);
    MPEG1.prototype.constructor = MPEG1;
    MPEG1.prototype.write = function(pts, buffers) {
        JSMpeg.Decoder.Base.prototype.write.call(this, pts, buffers);
        var totalLength = buffers.map(a => a.length).reduce((a,b) => a+b);
        var dst = new Uint8Array(totalLength);
        var lengthSoFar = 0;
        for (var i = 0; i<buffers.length; i++){
            try{
                dst.set(buffers[i], lengthSoFar);
                lengthSoFar += buffers[i].length;
            } catch (ex){
                console.error(ex);
            }
        }
        
        window._wfs.trigger('wfsH264DataParsing', {data: dst});
    };

    MPEG1.prototype.frameRate = 25;
    MPEG1.prototype.decodeSequenceHeader = function() {
        this.framerate = 25;
        var newWidth = 432;
        var newHeight = 320;
        this.width = newWidth;
        this.height = newHeight;
        if (this.destination) {
                this.destination.resize(newWidth, newHeight);
        }
    };
    return MPEG1;
}();

function hx(arr){
    var str = "";
    for(var i = 0; i< arr.length; i+=16){
      for (var j = 0; j < 16; j++){
          if ( arr[i+j] != undefined ){
              var hex = arr[i+j].toString(16);
              str += (hex.length < 2 ? "0"+hex : hex)+ " ";
          }
      }
      str += "\n";
      //if(i > 6){
          //break;
      //}
    }
    console.log(str);
  }



