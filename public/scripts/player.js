define([
	"pex/geom/Vec2",
	"pex/utils/FuncUtils",
	"pex/utils/ObjectUtils"
], function(Vec2, FuncUtils, ObjectUtils) {
	return {
		speed: 2,

		setSpeed: function(speed) {
			this.speed = speed;
		},

		walk: function(connections) {
			var playingConnections = connections.filter(ObjectUtils.property("playing"));
			var playConnectionsWithId = function(startId) {
				connections.forEach(function(connection) {
					if (connection.startId === startId) connection.playing = true;
				});
			};

			// if no connections are playing, set first one as playing,
			// and all others that have same starting id as well
			if (playingConnections.length === 0 && connections.length > 0 && !connections[0].dragged) {
				playConnectionsWithId(connections[0].startId);
			}

			connections
				.filter(ObjectUtils.property("playing"))
				.forEach(function(connection) {
					var distance = connection.startPos.distance(connection.endPos);

					if (connection.progress < distance) {
						connection.progress += this.speed;
					}
					else {
						// connection is no longer "playing" (nothing is moving on it),
						// but actually should make a sound ("shouldPlay")
						connection.playing = false;
						connection.shouldPlay = true;
						connection.progress = 0;

						// play connected connections
						playConnectionsWithId(connection.endId);
					}
				}.bind(this));

			return connections;
		},

		play: function(connections, nodes, windowSize) {
			var playValues = [];

			connections
				.filter(ObjectUtils.property("shouldPlay"))
				.forEach(function(connection) {
					nodes
						.filter(function(node) {
							return (node.id == connection.endId);
						})
						.forEach(function(node) {
							var halfWindow = windowSize.clone().scale(0.5);
							var maxDistance = halfWindow.distance(windowSize);
							var distance = node.pos.clone().distance(halfWindow) / maxDistance;

							playValues.push(1 - distance);
						});

						// mark connection as played
						connection.shouldPlay = false;
				});

			if (playValues.length > 0) {
				// TODO: add webaudio here
			}
		}
	};
});
