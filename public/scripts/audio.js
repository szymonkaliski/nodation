define([
	"pex/utils/FuncUtils",
	"pex/utils/MathUtils",
	"reverb"
], function(FuncUtils, MathUtils, Reverb) {
	function Audio() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
		this.reverb = new Reverb(this.context, { seconds: 1, decay: 3, reverse: 0 });

		this.reverb.connect(this.context.destination);

		this.consts = {
			minFreq: 80,
			maxFreq: 880,
			rampTime: 0.1,
			gain: 0.5,
			voices: [ 1, 2, 4 ]
		};
	}

	Audio.prototype.play = function(value, volume) {
		var oscillators = FuncUtils.repeatedly(this.consts.voices.length, function(i) {
			var oscillator = this.context.createOscillator();
			var oscillatorValue = MathUtils.map(value, 0, 1, this.consts.minFreq, this.consts.maxFreq);

			oscillator.type = "sine";
			oscillator.frequency.value = oscillatorValue * this.consts.voices[i];
			oscillator.start(0);

			return oscillator;
		}.bind(this));

		var currentTime = this.context.currentTime;

		var amps = FuncUtils.repeatedly(this.consts.voices.length, function(i) {
			var amp = this.context.createGainNode();
			var ampVolume = this.consts.gain * volume * (this.consts.voices.length - i) / this.consts.voices.length;

			amp.gain.linearRampToValueAtTime(0, currentTime);
			amp.gain.linearRampToValueAtTime(ampVolume, currentTime + this.consts.rampTime);
			amp.gain.linearRampToValueAtTime(0, currentTime + this.consts.rampTime * 2);

			oscillators[i].connect(amp);
			amp.connect(this.reverb.input);
		}.bind(this));
	};

	return Audio;
});
