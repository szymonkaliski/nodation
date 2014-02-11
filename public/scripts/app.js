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
				var drawCircle = function(context, pos, radius, fill) {
					context.beginPath();
					context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
					context.fillStyle = fill;
					context.fill();
				};

				this.ctx.rect(0, 0, this.settings.width, this.settings.height);
				this.ctx.fillStyle = "rgba(30, 30, 30, 255)";
				this.ctx.fill();

				this.nodes.connectionsArray().forEach(function(connection) {
				});

				this.nodes.nodesArray().forEach(function(node) {
					drawCircle(this.ctx, node.pos, node.size, "rgba(120, 120, 120, 255)");
				}.bind(this));
			}
			else {
				this.canvas.clear(30, 30, 30, 255);
				this.paint.setAntiAlias(true);

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

				this.nodes.playPointsArray().forEach(function(playPoint) {
					this.paint.setColor(80, 120, 80, 255);
					this.canvas.drawCircle(this.paint, playPoint.pos.x, playPoint.pos.y, playPoint.size, playPoint.size);
				}.bind(this));

				this.nodes.nodesArray().forEach(function(node) {
					this.paint.setColor(80, 80, 80, 120);
					this.canvas.drawCircle(this.paint, node.pos.x, node.pos.y, node.hoverSize, node.hoverSize);

					this.paint.setColor(120, 120, 120, 255);
					this.canvas.drawCircle(this.paint, node.pos.x, node.pos.y, node.size, node.size);

					this.paint.setColor(80, 120, 80, Math.ceil(node.playState * 255));
					this.canvas.drawCircle(this.paint, node.pos.x, node.pos.y, node.size, node.size);
				}.bind(this));

				this.nodes.deletionCircleArray().forEach(function(circle) {
					this.paint.setColor(120, 80, 80, 120);
					this.canvas.drawCircle(this.paint, circle.pos.x, circle.pos.y, circle.size, circle.size);
				}.bind(this));
			}
		}
	});
});
