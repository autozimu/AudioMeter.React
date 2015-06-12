// Polyfills.

// mediaDevices()
navigator.mediaDevices = function() {
    if (navigator.mediaDevices) {
        return navigator.mediaDevices;
    }

    navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    if (navigator.getUserMedia) {
        return {
            getUserMedia: function (c) {
                return new Promise(function(y, n) {
                        navigator.getUserMedia.call(navigator, c, y, n);
                    }
                );
            }
        }
    }
}();
if (!navigator.mediaDevices) {
    console.log("mediaDevices() not supported.");
    throw new Error("getUserMedia() not supported.")
}

// AudioContext
window.AudioContext = window.AudioContext || window.webkitAudioContext;



var AudioMeter = React.createClass({
    getInitialState: function() {
        var processor;

        function process(event) {
            var buf = event.inputBuffer.getChannelData(0);
            var sum = 0;
            var x;

            for (var i = 0; i < buf.length; i++) {
                x = buf[i];
                if (Math.abs(x) >= this.clipLevel) {
                    this.clipping = true;
                    this.lastClip = window.performance.now();
                }
                sum += x * x;
            }

            var rms = Math.sqrt(sum / buf.length);
            this.volume = Math.max(rms, this.volume * this.averaging);
            var volumeNode = document.getElementById('audioMeter.volume');
            volumeNode.textContent = 'Volume: ' + this.volume;
            console.log('Volume: ' + this.volume);
        }

        navigator.mediaDevices.getUserMedia(
            {
                audio: true
            }
        ).then(function(stream) {
                var audioCtx = new AudioContext();
                var mediaStreamSource = audioCtx.createMediaStreamSource(stream);
                processor = audioCtx.createScriptProcessor(512);
                processor.onaudioprocess = process;
                processor.clipping = false;
                processor.lastClip = 0;
                processor.volume = 0;
                processor.clipLevel = 0.98;
                processor.averaging = 0.95;
                processor.clipLag = 750;
                processor.connect(audioCtx.destination);
                processor.checkClipping = function () {
                    if (!this.clipping) {
                        return false;
                    }
                    if ((this.lastClip + this.clipLag) < window.performance.now()) {
                        this.clipping = false;
                    }
                    return this.clipping;
                };
                processor.shutdown = function () {
                    this.disconnect();
                    this.onaudioprocess = null;
                };
                mediaStreamSource.connect(processor);
            }
        ).catch(function(err){
                console.log('Error occured: ' + err.name);
            });

        return {
            processor: processor
        };
    },
    render: function() {
        return <h1 id="audioMeter.volume"> Volume: </h1>;
    }
});
