define([
	"pex/geom/Vec2",
	"pex/utils/ObjectUtils",
	"player"
], function(Vec2, ObjectUtils, Player) {
	var getClosestNode = function(nodes, pos) {
		return nodes.reduce(function(memo, node, index) {
			var distance = node.pos.distance(pos);
			if (distance < memo.distance) {
				memo = ObjectUtils.mergeObjects(node, { distance: distance, index: index });
			}

			return memo;
		}, { distance: Infinity });
	};

	function Nodes(windowSize, playerSpeed) {
		this.consts = {
			k: 0.65,
			m: 0.8,
			nodeSize: 20,
			hoverSize: 30,
			deletionSize: 50,
			windowSize: windowSize
		};

		this.deletionPoint = {
			size: 0,
			pos: Vec2.create(this.consts.windowSize.x / 2, this.consts.windowSize.y)
		};

		this.player = new Player(playerSpeed);
		this.nodes = [];
		this.connections = [];
	}

	Nodes.prototype.mouseDown = function(pos) {
		var closestNode = getClosestNode(this.nodes, pos);

		if (closestNode.distance < this.consts.nodeSize) {
			this.nodes[closestNode.index].dragged = true;
			this.nodes[closestNode.index].targetPos = pos;
		}
		else if (closestNode.distance < this.consts.hoverSize) {
			this.createConnection(closestNode.pos, closestNode.id);
		}
		else {
			this.createNode(pos);
		}
	};

	Nodes.prototype.mouseDrag = function(pos) {
		this.nodes
			.filter(ObjectUtils.property("dragged"))
			.forEach(ObjectUtils.property("targetPos", pos));

		this.connections
			.filter(ObjectUtils.property("dragged"))
			.forEach(ObjectUtils.property("endPos", pos));
	};

	Nodes.prototype.mouseUp = function(pos) {
		this.nodes = this.nodes.reduce(function(memo, node) {
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
				if (closestNode.distance < this.consts.nodeSize && closestNode.id != connection.startId) {
					connection.endId = closestNode.id;
					connection.endPos = closestNode.pos;
					connection.dragged = false;
					memo.push(connection);
				}
			}

			return memo;
		}.bind(this), []);
	};

	Nodes.prototype.mouseMoved = function(pos) {
		this.nodes.forEach(function(node) {
			node.hover = (node.pos.distance(pos) < node.hoverSize || node.dragged);
		});
	};

	Nodes.prototype.createNode = function(pos) {
		this.nodes.push({
			id: (new Date()).getTime(),
			pos: pos,
			targetPos: pos,
			size: this.consts.nodeSize,
			playState: 0,
			hoverSize: this.consts.nodeSize,
			dragged: true,
			hover: true
		});
	};

	Nodes.prototype.createConnection = function(pos, startId) {
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
			size: this.consts.nodeSize / 3
		});
	};

	Nodes.prototype.nodesArray = function() {
		return this.nodes;
	};

	Nodes.prototype.connectionsArray = function() {
		return this.connections;
	};

	Nodes.prototype.playPointsArray = function() {
		return this.connections
			.filter(ObjectUtils.property("playing"))
			.map(function(connection) {
				var dir = Vec2.create().asSub(connection.endPos, connection.startPos);
				var dist = connection.endPos.distance(connection.startPos);
				var progress = connection.progress;

				return {
					pos: Vec2.create().asAdd(connection.startPos, dir.scale(progress / dist)),
					size: this.consts.nodeSize / 3
				};
			}.bind(this));
	};

	Nodes.prototype.deletionCircleArray = function() {
		return [ this.deletionPoint ];
	};

	Nodes.prototype.isNodeDragged = function() {
		return (this.nodes.filter(ObjectUtils.property("dragged")).length > 0);
	};

	Nodes.prototype.isInDeletionPos = function(pos) {
		return (pos.distance(this.deletionPoint.pos) < this.deletionPoint.size);
	};

	Nodes.prototype.update = function() {
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
			node.hoverSize = this.consts.k * node.hoverSize + (1 - this.consts.k) * (node.hover ? this.consts.hoverSize : this.consts.nodeSize);
		}.bind(this));

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

			node.playState = this.consts.m * node.playState + (1 - this.consts.m) * (playConnections.length > 0 ? 1 : 0);
		}.bind(this));

		// update deletion point size
		this.deletionPoint.size = this.consts.k * this.deletionPoint.size + (1 - this.consts.k) * (this.isNodeDragged() ? this.consts.deletionSize : 0);

		// walk and play connections
		this.connections = this.player.walk(this.connections);
		this.player.play(this.connections, this.nodes, this.consts.windowSize);
	};

	Nodes.prototype.serialize = function() {
		var windowCenter = this.consts.windowSize.clone().scale(0.5);

		return JSON.stringify({
			nodes: this.nodes.map(function(node) {
				node.centerPos = Vec2.create().asSub(node.pos, windowCenter);
				return node;
			}),
			connections: this.connections
		});
	};

	Nodes.prototype.deserialize = function(object) {
		var windowCenter = this.consts.windowSize.clone().scale(0.5);

		if (!(object instanceof Object)) {
			object = JSON.parse(object);
		}

		var findNodeForID = function(id) {
			return this.nodes.map(ObjectUtils.property("id")).indexOf(id);
		}.bind(this);

		this.nodes = object.nodes.map(function(node) {
			node.pos = Vec2.create().asAdd(windowCenter, node.centerPos);
			return node;
		});

		this.connections = object.connections.map(function(connection) {
			var startIndex = findNodeForID(connection.startId);
			var endIndex = findNodeForID(connection.endId);

			connection.startPos = this.nodes[startIndex].pos;
			connection.endPos = this.nodes[endIndex].pos;

			return connection;
		}.bind(this));
	};

	return Nodes;
});
