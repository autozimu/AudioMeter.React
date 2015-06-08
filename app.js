window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.cancelAnimationFrame = navigator.cancelAnimationFrame || navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
navigator.requestAnimationFrame = navigator.requestAnimationFrame || navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;


var audioCtx = new AudioContext();

var analyser = audioCtx.createAnalyser();

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFiler = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();

if (!navigator.getUserMedia) {
	throw new Error("getUserMedia not supported");
}

navigator.getUserMedia(
	{
		audio: true,
		video: true
	},
	function (stream) {
		document.querySelector('#camFeed').src = window.URL.createObjectURL(stream);
	},
	function (err) {
		console.log("The following error occured: " + err.name);
	}
);