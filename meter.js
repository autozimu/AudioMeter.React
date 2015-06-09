function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumnAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;
	
	processor.connect(audioContext.destination);
	
	processor.checkClipping = function() {
		if (!this.clipping) {
			return false;
		}
		if ((this.lastClip + this.clipLag) < window.performance.now()) {
			this.clipping = false;
		}
		return this.clipping;
	};
	
	processor.shutdown = function() {
		this.disconnect();
		this.onaudioprocess = null;		
	};
	
	return processor;
}

function volumnAudioProcess(event) {
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
}