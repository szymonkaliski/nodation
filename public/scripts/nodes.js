define([
	"pex/geom/Vec2",
	"pex/utils/ObjectUtils",
	"player"
], function(Vec2, ObjectUtils, Player) {
	var consts = {
		k: 0.65,
		m: 0.8,
		nodeSize: 20,
		hoverSize: 30,
		deletionSize: 30,
		windowSize: null
	};

	var getClosestNode = function(nodes, pos) {
		return nodes.reduce(function(memo, node, index) {
			var distance = node.pos.distance(pos);
			if (distance < memo.distance) {
				memo = ObjectUtils.mergeObjects(node, { distance: distance, index: index });
			}

			return memo;
		}, { distance: Infinity });
	};

	return {
		nodes: [],
		connections: [],
		deletionPoint: { size: 0, pos: null },

		setup: function(windowSize, playerSpeed) {
			consts.windowSize = windowSize;
			this.deletionPoint.pos = Vec2.create(windowSize.x / 2, windowSize.y);
			if (playerSpeed) Player.setSpeed(playerSpeed);
		},

		mouseDown: function(pos) {
			var closestNode = getClosestNode(this.nodes, pos);

			if (closestNode.distance < consts.nodeSize) {
				this.nodes[closestNode.index].dragged = true;
				this.nodes[closestNode.index].targetPos = pos;
			}
			else if (closestNode.distance < consts.hoverSize) {
				this.createConnection(closestNode.pos, closestNode.id);
			}
			else {
				this.createNode(pos);
			}
		},

		mouseDrag: function(pos) {
			this.nodes
				.filter(ObjectUtils.property("dragged"))
				.forEach(ObjectUtils.property("targetPos", pos));

			this.connections
				.filter(ObjectUtils.property("dragged"))
				.forEach(ObjectUtils.property("endPos", pos));
		},

		mouseUp: function(pos) {
			this.nodes = this.nodes
				.reduce(function(memo, node) {
					// if node is in removal spot, we should remove it,
					// and all connection that it has
					if (node.dragged && this.isInDeletionPos(pos)) {
						this.connections = this.connections.filter(function(connection) {
							return (connection.startId != node.id && connection.endId != node.id);
						});
					}
					else {
						node.dragged = false;
						memo.push(node);
					}

					return memo;
				}.bind(this), []);

			this.connections = this.connections.reduce(function(memo, connection) {
				if (!connection.dragged) {
					memo.push(connection);
				}
				else {
					var closestNode = getClosestNode(this.nodes, pos);
					if (closestNode.distance < consts.nodeSize) {
						connection.endId = closestNode.id;
						connection.endPos = closestNode.pos;
						connection.dragged = false;
						memo.push(connection);
					}
				}

				return memo;
			}.bind(this), []);
		},

		mouseMoved: function(pos) {
			this.nodes.forEach(function(node) {
				node.hover = (node.pos.distance(pos) < node.hoverSize);
			});
		},

		createNode: function(pos) {
			this.nodes.push({
				id: (new Date()).getTime(),
				pos: pos,
				targetPos: pos,
				size: consts.nodeSize,
				playState: 0,
				hoverSize: consts.nodeSize,
				dragged: true,
				hover: false
			});
		},

		createConnection: function(pos, startId) {
			// connections stay with nodes, by assigning vectors to the same ref,
			// and not copying them
			this.connections.push({
				startPos: pos,
				endPos: pos,
				startId: startId,
				endId: null,
				dragged: true,
				playing: false,
				shouldPlay: false,
				progress: 0,
				size: consts.nodeSize / 3
			});
		},

		nodesArray: function() {
			return this.nodes;
		},

		connectionsArray: function() {
			return this.connections;
		},

		playPointsArray: function() {
			return this.connections
				.filter(ObjectUtils.property("playing"))
				.map(function(connection) {
					var dir = Vec2.create().asSub(connection.endPos, connection.startPos);
					var dist = connection.endPos.distance(connection.startPos);
					var progress = connection.progress;

					return {
						pos: Vec2.create().asAdd(connection.startPos, dir.scale(progress / dist)),
						size: consts.nodeSize / 3
					};
				});
		},

		deletionCircleArray: function() {
			return [ this.deletionPoint ];
		},

		isNodeDragged: function() {
			return (this.nodes.filter(ObjectUtils.property("dragged")).length > 0);
		},

		isInDeletionPos: function(pos) {
			return (pos.distance(this.deletionPoint.pos) < this.deletionPoint.size);
		},

		update: function() {
			// update node dragged state
			this.nodes
				.filter(ObjectUtils.property("dragged"))
				.forEach(function(node) {
					var dist = node.targetPos.distance(node.pos);
					var sub = Vec2.create().asSub(node.targetPos, node.pos);
					node.pos.add(sub.normalize().scale(dist / 3));
				});

			// update node hover size
			this.nodes.forEach(function(node) {
				node.hoverSize = consts.k * node.hoverSize + (1 - consts.k) * (node.hover ? consts.hoverSize : consts.nodeSize);
			});

			// update node playing state
			this.nodes.forEach(function(node) {
				var playConnections = this.connections
					.filter(function(connection) {
						var value = false;

						if (connection.progress !== 0) {
							if (connection.startId === node.id) {
								value = (connection.progress < node.size);
							}
							else if (connection.endId === node.id) {
								var distance = connection.startPos.distance(connection.endPos);
								value = ((distance - connection.progress) < node.size);
							}
						}

						return value;
					});

				node.playState = consts.m * node.playState + (1 - consts.m) * (playConnections.length > 0 ? 1 : 0);
			}.bind(this));

			// update deletion point size
			this.deletionPoint.size = consts.k * this.deletionPoint.size + (1 - consts.k) * (this.isNodeDragged() ? consts.deletionSize : 0);

			// walk and play connections
			this.connections = Player.walk(this.connections);
			Player.play(this.connections, this.nodes, consts.windowSize);
		},

		serialize: function() {
			return JSON.stringify({
				nodes: this.nodes,
				connections: this.connections
			});
		},

		deserialize: function(object) {
			if (!(object instanceof Object)) {
				object = JSON.parse(object);
			}

			var findNodeForID = function(id) {
				return this.nodes.map(ObjectUtils.property("id")).indexOf(id);
			}.bind(this);

			this.nodes = object.nodes.map(function(node) {
				node.pos = Vec2.create(node.pos.x, node.pos.y);
				return node;
			});

			this.connections = object.connections.map(function(connection) {
				var startIndex = findNodeForID(connection.startId);
				var endIndex = findNodeForID(connection.endId);

				connection.startPos = this.nodes[startIndex].pos;
				connection.endPos = this.nodes[endIndex].pos;

				return connection;
			}.bind(this));
		}
	};
});
