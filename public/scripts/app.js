require.config({
	baseUrl: "scripts",
	paths: {
		"pex": "libraries/pex/pex",
		"lib": "libraries/pex/lib"
	}
});

require([
	"pex/sys/Platform",
	"pex/sys/Window",
	"pex/geom/Vec2",
	"nodes"
], function(Platform, Window, Vec2, Nodes) {
	// run pex
	Window.create({
		settings: {
			type: "2d",
			width: 1280,
			height: 720,
			fullscreen: true
		},

		colors: {
			background: [ 30, 30, 30, 255 ],
			node: [ 120, 120, 120, 255 ],
			nodeHover: [ 80, 80, 80, 120 ],
			connection: [ 120, 120, 120, 255 ],
			playPoint: [ 80, 120, 80, 255 ],
			deletion: [ 120, 80, 80, 120 ]
		},

		// gui: new GUI(this),
		nodes: Nodes,

		init: function() {
			this.nodes.setup(Vec2.create(this.settings.width, this.settings.height), this.oscSender, 4);

			this.on("leftMouseDown", function(event) {
				this.nodes.mouseDown(Vec2.create(event.x, event.y));
			}.bind(this));

			this.on("mouseDragged", function(event) {
				this.nodes.mouseDrag(Vec2.create(event.x, event.y));
			}.bind(this));

			this.on("leftMouseUp", function(event) {
				this.nodes.mouseUp(Vec2.create(event.x, event.y));
			}.bind(this));

			this.on("mouseMoved", function(event) {
				this.nodes.mouseMoved(Vec2.create(event.x, event.y));
			}.bind(this));
		},

		draw: function() {
			this.nodes.update();

			if (Platform.isBrowser) {
				// drawing functions
				var drawCircle = function(context, pos, radius, fill) {
					context.beginPath();
					context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
					context.fillStyle = fill;
					context.fill();
				};

				var drawLine = function(context, start, end, stroke) {
					context.beginPath();
					context.moveTo(start.x, start.y);
					context.lineTo(end.x, end.y);
					context.strokeStyle = stroke;
					context.stroke();
				};

				var color = function(rgbArray) {
					var colorString = rgbArray
						.map(function(value, index) {
							return index == 3 ? value / 255 : value;
						})
						.join(",");
					return "rgba(" + colorString + ")";
				};

				// clear screen
				this.ctx.rect(0, 0, this.settings.width, this.settings.height);
				this.ctx.fillStyle = color(this.colors.background);
				this.ctx.fill();

				// draw connections
				this.ctx.lineWidth = 3;
				this.nodes.connectionsArray().forEach(function(connection) {
					drawLine(this.ctx, connection.startPos, connection.endPos, color(this.colors.connection));

					var outletVector = Vec2.create()
						.asSub(connection.endPos, connection.startPos)
						.normalize()
						.scale(20)
						.add(connection.startPos);

					drawCircle(this.ctx, outletVector, connection.size, color(this.colors.connection));

					if (connection.dragged) {
						drawCircle(this.ctx, connection.endPos, connection.size, color(this.colors.connection));
					}
				}.bind(this));

				this.nodes.playPointsArray().forEach(function(playPoint) {
					drawCircle(this.ctx, playPoint.pos, playPoint.size, color(this.colors.playPoint));
				});

				// draw nodes
				this.nodes.nodesArray().forEach(function(node) {
					drawCircle(this.ctx, node.pos, node.hoverSize, color(this.colors.nodeHover));
					drawCircle(this.ctx, node.pos, node.size, color(this.colors.node));

					drawCircle(this.ctx, node.pos, node.size, color(this.colors.playPoint.map(function(value, index) {
						return index == 3 ? Math.ceil(node.playState * value) : value;
					})));
				}.bind(this));

				// draw removal point
				this.nodes.deletionCircleArray().forEach(function(circle) {
					drawCircle(this.ctx, circle.pos, circle.size, color(this.colors.deletion));
				}.bind(this));
			}
			else {
				// clear screen
				this.canvas.clear().apply(this.colors.background);
				this.paint.setAntiAlias(true);

				// draw connections
				this.nodes.connectionsArray().forEach(function(connection) {
					this.paint.setColor(120, 120, 120, 255);
					this.paint.setStrokeWidth(3);
					this.canvas.drawLine(this.paint, connection.startPos.x, connection.startPos.y, connection.endPos.x, connection.endPos.y);

					var outletVector = Vec2.create()
						.asSub(connection.endPos, connection.startPos)
						.normalize()
						.scale(20)
						.add(connection.startPos);

					this.paint.setColor(120, 120, 120, 255);
					this.canvas.drawCircle(this.paint, outletVector.x, outletVector.y, connection.size, connection.size);

					if (connection.dragged) {
						this.canvas.drawCircle(this.paint, connection.endPos.x, connection.endPos.y, connection.size, connection.size);
					}
				}.bind(this));

				// draw play points
				this.nodes.playPointsArray().forEach(function(playPoint) {
					this.paint.setColor(80, 120, 80, 255);
					this.canvas.drawCircle(this.paint, playPoint.pos.x, playPoint.pos.y, playPoint.size, playPoint.size);
				}.bind(this));

				// draw nodes
				this.nodes.nodesArray().forEach(function(node) {
					this.paint.setColor(80, 80, 80, 120);
					this.canvas.drawCircle(this.paint, node.pos.x, node.pos.y, node.hoverSize, node.hoverSize);

					this.paint.setColor(120, 120, 120, 255);
					this.canvas.drawCircle(this.paint, node.pos.x, node.pos.y, node.size, node.size);

					this.paint.setColor(80, 120, 80, Math.ceil(node.playState * 255));
					this.canvas.drawCircle(this.paint, node.pos.x, node.pos.y, node.size, node.size);
				}.bind(this));

				// draw removal point
				this.nodes.deletionCircleArray().forEach(function(circle) {
					this.paint.setColor(120, 80, 80, 120);
					this.canvas.drawCircle(this.paint, circle.pos.x, circle.pos.y, circle.size, circle.size);
				}.bind(this));
			}
		}
	});
});
