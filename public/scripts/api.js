define([], function() {
	var Api = function() {
		var locations = location.search.split("?graph=");
		this.id =(locations.length === 2) ? locations[1] : null;
	};

	Api.prototype.shouldLoadData = function() {
		return Boolean(this.id);
	};

	Api.prototype.downloadData = function(callback) {
		require(["text!/api/load/" + this.id], function(data) {
			callback(JSON.parse(data));
		});
	};

	return Api;
});
