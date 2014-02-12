define([], function() {
	function Reverb(context, opts) {
		this.input = this.output = context.createConvolver();
		this.context = context;
		
		opts = opts || {};
		this.seconds = opts.seconds;
		this.decay = opts.decay;
		this.reverse = opts.reverse;
		this.buildImpulse();
	}

	Reverb.prototype.connect = function(dest) {
		this.output.connect(dest.input ? dest.input : dest);
	};

	Reverb.prototype.disconnect = function() {
		this.output.disconnect();
	};

	Reverb.prototype.buildImpulse = function () {
		var rate = this.context.sampleRate;
		var length = rate * this.seconds;
		var decay = this.decay;
		var impulse = this.context.createBuffer(2, length, rate);
		var impulseL = impulse.getChannelData(0);
		var impulseR = impulse.getChannelData(1);
		var n, i;

		for (i = 0; i < length; i++) {
			n = this.reverse ? length - i : i;
			impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
			impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
		}

		this.input.buffer = impulse;
	};

	return Reverb;
});
