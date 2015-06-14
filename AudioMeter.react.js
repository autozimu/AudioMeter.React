// Polyfill: mediaDevices.
navigator.mediaDevices = function() {
    if (navigator.mediaDevices) {
        return navigator.mediaDevices;
    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
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

// Polyfill: AudioContext.
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

var AudioMeter = React.createClass({

    getInitialState: function() {
        return {
            volume: 0,
            debug: false
        };
    },

    componentDidMount: function () {

        // Processing.
        var process = function (event) {
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
            this.setState({
                volume: Math.max(rms, this.state.volume * this.averaging)
            });
            //console.log('Volume: ' + this.state.volume);

            //var canvasCtx = document.getElementById('audioMeter.canvas').getContext('2d');
            //canvasCtx.clearRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
            //
            //if (this.checkClipping()) {
            //    canvasCtx.fillStyle = '#B20000';
            //}
            //else {
            //    canvasCtx.fillStyle = '#00FF48';
            //}
            //
            //canvasCtx.fillRect(0, 0, this.volume * canvasCtx.canvas.width * 1.4, canvasCtx.canvas.height);
            //
        }.bind(this);

        // Init processing.
        navigator.mediaDevices.getUserMedia(
            {
                audio: true
            }
        ).then(function(stream) {
                var audioCtx = new AudioContext();
                var mediaStreamSource = audioCtx.createMediaStreamSource(stream);
                var processor = audioCtx.createScriptProcessor(512);

                this.clipping = false;
                this.lastClip = 0;
                this.clipLevel = 0.98;
                this.averaging = 0.95;
                this.clipLag = 750;
                this.checkClipping = function () {
                    if (!this.clipping) {
                        return false;
                    }
                    if ((this.lastClip + this.clipLag) < window.performance.now()) {
                        this.clipping = false;
                    }
                    return this.clipping;
                };

                processor.onaudioprocess = process;
                processor.connect(audioCtx.destination);
                mediaStreamSource.connect(processor);
            }.bind(this)
        ).catch(function(err){
                console.log('Error occured: ' + err.name);
            });
    },

    toggleDebug: function() {
        this.setState({
            debug: !this.state.debug
        });
    },

    render: function() {
        return (
            <div>
                <button onClick={this.toggleDebug}>Debug</button>
                { this.state.debug  ? <p>Volume: {this.state.volume}</p> : null}
            </div>
        );
    }
});
