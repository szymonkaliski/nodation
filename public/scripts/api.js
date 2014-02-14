define([], function() {
	function Api() {
		var locations = location.search.split("?graph=");
		this.id = (locations.length === 2) ? locations[1] : null;
	}

	Api.prototype.shouldLoadData = function() {
		return Boolean(this.id);
	};

	Api.prototype.downloadData = function(callback) {
		require(["text!/api/load/" + this.id], function(data) {
			callback(JSON.parse(data));
		});
	};

	Api.prototype.saveData = function(data, callback) {
		var request = new XMLHttpRequest();

		request.open("POST", "/api/save/");
		request.onreadystatechange = function() {
			if (request.readyState === 4 && callback) {
				callback(request);
			}
		};

		request.setRequestHeader("Content-Type", "application/json");
		request.send(data);
	};

	return Api;
});
