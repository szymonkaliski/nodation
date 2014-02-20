define([
	"jquery",
	"pex/utils/FuncUtils",
	"pex/utils/MathUtils",
	"reverb"
], function($, FuncUtils, MathUtils, Reverb) {
	function Audio() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		this.context = new AudioContext();
		this.master = this.context.createGainNode();

		this.master.gain.value = 1.0;

		// fix audio on iOS, and play without reverb
		if (/iPhone|iPad|iPod/i.test(navigator.userAgent) ) {
			this.master.connect(this.context.destination);

			// fix for iPad webaudio
			this.touchStarted = false;
			$(document).on("touchstart", function() {
				if (!this.touchStarted) {
					var buffer = this.context.createBuffer(1, 1, 22050);
					var source = this.context.createBufferSource();
					source.buffer = buffer;
					source.connect(this.context.destination);
					source.noteOn(0);

					this.touchStarted = true;
				}
			}.bind(this));
		}
		// nice audio on desktop browsers
		else {
			this.reverb = new Reverb(this.context, { seconds: 1.75, decay: 2, reverse: 0 });

			this.master.connect(this.reverb.input);
			this.reverb.connect(this.context.destination);
		}

		this.consts = {
			minFreq: 80,
			maxFreq: 880,
			rampTime: 0.1,
			gain: 0.5,
			voices: [ 1, 2, 4 ]
		};

		this.voices = [];
	}

	Audio.prototype.update = function() {
		this.voices = this.voices.reduce(function(memo, voice) {
			if (voice.started || voice.amp.gain.value > 0) {
				voice.started = false;
				memo.push(voice);
			}
			else {
				voice.oscillator.stop(0);
			}

			return memo;
		}, []);
	};

	Audio.prototype.play = function(value, volume) {
		var currentTime = this.context.currentTime;

		this.voices.push.apply(this.voices, FuncUtils.repeatedly(this.consts.voices.length, function(i) {
				var oscillator = this.context.createOscillator();
				var oscillatorValue = MathUtils.map(value, 0, 1, this.consts.minFreq, this.consts.maxFreq);

				var amp = this.context.createGainNode();
				var ampVolume = this.consts.gain * volume * (this.consts.voices.length - i) / this.consts.voices.length;

				oscillator.type = "sine";
				oscillator.frequency.value = oscillatorValue * this.consts.voices[i];
				oscillator.start(0);

				amp.gain.linearRampToValueAtTime(0, currentTime);
				amp.gain.linearRampToValueAtTime(ampVolume, currentTime + this.consts.rampTime);
				amp.gain.linearRampToValueAtTime(0, currentTime + this.consts.rampTime * 2);

				oscillator.connect(amp);
				amp.connect(this.master);

				return {
					"started": true,
					"amp": amp,
					"oscillator": oscillator
				};
			}.bind(this)));
	};

	return Audio;
});
