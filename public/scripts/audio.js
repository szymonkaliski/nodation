define([], function() {
	function Audio() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
	}

	Audio.prototype.play = function(value) {
		var oscillator = this.context.createOscillator();
		oscillator.type = "sine";
		oscillator.frequency.value = 440 * (1 + value);
		oscillator.start(0);

		var currentTime = this.context.currentTime;

		var amp = this.context.createGainNode();
		amp.gain.setValueAtTime(0, currentTime);
		amp.gain.linearRampToValueAtTime(1, currentTime + 0.1);
		amp.gain.linearRampToValueAtTime(0, currentTime + 0.2);

		oscillator.connect(amp);
		amp.connect(this.context.destination);
	};

	return Audio;
});
