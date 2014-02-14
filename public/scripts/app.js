require.config({
	baseUrl: "scripts",
	paths: {
		"pex": "libraries/pex/pex",
		"lib": "libraries/pex/lib",
		"text": "libraries/text",
		"jquery": "libraries/jquery"
	}
});

require([
	"pex/sys/Window",
	"pex/geom/Vec2",
	"api",
	"gui",
	"nodes"
], function(Window, Vec2, Api, Gui, Nodes) {
	Window.create({
		settings: {
			type: "2d",
			width: 1280,
			height: 720,
			fullscreen: true
		},

		colors: {
			background:	[ 237, 235, 230, 255 ],
			node:				[  64,  59,  51, 255 ],
			nodeHover:	[  64,  59,  51, 120 ],
			connection:	[  64,  59,  51, 255 ],
			playPoint:	[ 148, 199, 182, 255 ],
			deletion:		[ 211, 100,  59, 120 ]
		},

		init: function() {
			this.api = new Api();
			this.gui = new Gui();
			this.nodes = new Nodes(Vec2.create(this.settings.width, this.settings.height), 3);

			if (this.api.shouldLoadData()) {
				this.api.downloadData(function(data) {
					this.nodes.deserialize(data);
				}.bind(this));
			}

			this.gui.saveEvent(function() {
				this.api.saveData(this.nodes.serialize(), function(response) {
					window.history.pushState("nodation", "nodation", "/?graph=" + response.responseText.replace(/\"/g, ""));
					// TODO: add gui with info that page is saved
				});
			}.bind(this));

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

			var drawLine = function(context, start, end, stroke, width) {
				context.lineWidth = width || 3;
				context.beginPath();
				context.moveTo(start.x, start.y);
				context.lineTo(end.x, end.y);
				context.strokeStyle = stroke;
				context.stroke();
			};

			var drawRect = function(context, posA, posB, fill) {
				context.rect(posA.x, posA.y, posB.x, posB.y);
				context.fillStyle = fill;
				context.fill();
			};

			var drawRoundRect = function(context, posA, posB, fill, radius) {
				radius = radius || 10;
				var width = Math.abs(posA.x - posB.x);
				var height = Math.abs(posA.y - posB.y);

				context.lineJoin = "round";
				context.lineWidth = radius;
				context.fillStyle = fill;
				context.strokeStyle = fill;

				context.strokeRect(posA.x + radius / 2, posA.y + radius / 2, width - radius, height - radius);
				context.fillRect(posA.x + radius / 2, posA.y + radius / 2, width - radius, height - radius);
			};

			var drawText = function(context, pos, text, stroke, font) {
				context.font = font || "12px Helvetica";
				context.fillStyle = stroke;
				context.fillText(text, pos.x, pos.y);
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
			drawRect(this.ctx, Vec2.create(0, 0), Vec2.create(this.settings.width, this.settings.height), color(this.colors.background));

			// draw connections
			this.nodes.connectionsArray().forEach(function(connection) {
				drawLine(this.ctx, connection.startPos, connection.endPos, color(this.colors.connection), 3);

				var outletVector = Vec2.create()
					.asSub(connection.endPos, connection.startPos)
					.normalize()
					.scale(20)
					.add(connection.startPos);

				drawCircle(this.ctx, outletVector, connection.size, color(this.colors.connection));
				drawCircle(this.ctx, connection.endPos, connection.size, color(this.colors.connection));
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
