require.config({
	baseUrl: "scripts",
	paths: {
		"pex": "libraries/pex/pex",
		"lib": "libraries/pex/lib",
		"text": "libraries/text"
	}
});

require([
	"pex/sys/Window",
	"pex/geom/Vec2",
	"api",
	"nodes"
], function(Window, Vec2, Api, Nodes) {
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

		init: function() {
			this.api = new Api();
			this.nodes = new Nodes(Vec2.create(this.settings.width, this.settings.height), 3);

			if (this.api.shouldLoadData()) {
				this.api.downloadData(function(data) {
					console.log(data);
				});
			}

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
			}.bind(this));

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
	});
});
