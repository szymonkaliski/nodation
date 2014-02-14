define([
	"jquery",
], function($) {
	function Gui() {
		this.saveButton = $(".bar .save");
	}

	Gui.prototype.saveEvent = function(callback) {
		this.saveButton.on("click", callback);
	};

	return Gui;
});
