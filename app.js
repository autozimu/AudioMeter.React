// Request media API.
navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
	getUserMedia: function(c) {
		return new Promise(function(y, n) {
			(navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
		});
	}
} : null);
// Ensure getUserMedia() is supported.
if (!navigator.mediaDevices) {
	console.log("getUserMedia() not supported.");
	throw new Error("getUserMedia() not supported.");
}

// AudioContext API.
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

var mediaStreamSource;
var meter;
var raftID;
var meterCanvas;

navigator.mediaDevices.getUserMedia(
	{
		audio: true,
	}
)
.then(function (stream) {
	meterCanvas = document.querySelector("#meter").getContext("2d");
	mediaStreamSource = audioCtx.createMediaStreamSource(stream);
	meter = createAudioMeter(audioCtx);
	mediaStreamSource.connect(meter);

	drawLoop();
})
.catch(function (err) {
	console.log("The following error occured: " + err.name);
});

function drawLoop(time) {
	meterCanvas.clearRect(0, 0, meterCanvas.canvas.width, meterCanvas.canvas.height);
	
	if (meter.checkClipping()) {
		meterCanvas.fillStyle = "#B20000";
	}
	else {
		meterCanvas.fillStyle = "#00FF48";
	}
	
	meterCanvas.fillRect(0, 0, meter.volume * meterCanvas.canvas.width * 1.4, meterCanvas.canvas.height);
	
	raftID = window.requestAnimationFrame(drawLoop);
}