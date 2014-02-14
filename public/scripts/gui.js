define([
	"pex/utils/ObjectUtils",
	"pex/geom/Vec2"
], function(ObjectUtils, Vec2) {
	function Gui(windowSize) {
		this.consts = {
			"k": 0.9,
			"buttonWidth": 50,
			"buttonHeight": 20,
			"buttonSize": 10
		};

		this.buttons = [
			{
				"name": "save",
				"size": this.consts.buttonSize,
				"hoverAlpha": 0,
				"hover": false,
				"posA": Vec2.create(0, windowSize.y).add(Vec2.create(20, -20 - this.consts.buttonHeight)),
				"posB": Vec2.create(0, windowSize.y).add(Vec2.create(20 + this.consts.buttonWidth, -20)),
			}
		];
	}

	Gui.prototype.isInside = function(button, pos) {
		var posA = button.posA;
		var posB = button.posB;
		return (posA.x < pos.x && pos.x < posB.x && posA.y < pos.y && pos.y < posB.y);
	};

	Gui.prototype.isPressed = function(pos) {
		return this.buttons.reduce(function(memo, button) {
			if (this.isInside(button, pos)) memo = true;

			return memo;
		}.bind(this), false);
	};

	Gui.prototype.mouseMoved = function(pos) {
		this.buttons.forEach(function(button) {
			button.hover = this.isInside(button, pos);
		}.bind(this));
	};

	Gui.prototype.update = function() {
		this.buttons.forEach(function(button) {
			button.hoverAlpha = this.consts.k * button.hoverAlpha + (1 - this.consts.k) * (button.hover ? 1 : 0);
		}.bind(this));
	};

	Gui.prototype.buttonsArray = function() {
		return this.buttons;
	};

	return Gui;
});
