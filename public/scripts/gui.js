define([
	"jquery",
], function($) {
	function Gui() {
		this.saveButton = $(".bar .button.save");
		this.infoButton = $(".bar .button.info");
		this.overlay = $(".overlay");

		this.infoButton.on("click", function() {
			this.overlay.fadeToggle();
		}.bind(this));

		this.overlay.on("click", function() {
			this.overlay.fadeOut();
		}.bind(this));

		if (!localStorage.getItem("alreadyRan")) {
			this.overlay.fadeIn();
			localStorage.setItem("alreadyRan", true);
		}

		// fix for ipad scrolling
		$(document).bind("touchmove", function(event) {
			event.preventDefault();
		});
	}

	Gui.prototype.saveEvent = function(callback) {
		this.saveButton.on("click", callback);
	};

	return Gui;
});
