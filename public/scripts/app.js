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
			background:		[  30,  30,  30, 255 ],
			node:					[ 120, 120, 120, 255 ],
			nodeHover:		[  80,  80,  80, 120 ],
			connection:		[ 120, 120, 120, 255 ],
			playPoint:		[  80, 120,  80, 255 ],
			deletion:			[ 120,  80,  80, 120 ],
			button: {
				save:				[  90,  90, 140, 255 ],
				saveHover:	[ 120, 120, 140, 255 ],
				saveText:		[  30,  30,  30, 255 ]
			}
		},

		init: function() {
			var windowSize = Vec2.create(this.settings.width, this.settings.height);

			this.api = new Api();
			this.gui = new Gui(windowSize);
			this.nodes = new Nodes(windowSize, 3);

			if (this.api.shouldLoadData()) {
				this.api.downloadData(function(data) {
					this.nodes.deserialize(data);
				}.bind(this));
			}

			this.on("leftMouseDown", function(event) {
				var mousePos = Vec2.create(event.x, event.y);

				if (this.gui.isPressed(mousePos)) {
					this.api.saveData(this.nodes.serialize(), function(response) {
						window.history.pushState("nodation", "nodation", "/?graph=" + response.responseText.replace(/\"/g, ""));
					});
				}
				else {
					this.nodes.mouseDown(mousePos);
				}
			}.bind(this));

			this.on("mouseDragged", function(event) {
				this.nodes.mouseDrag(Vec2.create(event.x, event.y));
			}.bind(this));

			this.on("leftMouseUp", function(event) {
				this.nodes.mouseUp(Vec2.create(event.x, event.y));
			}.bind(this));

			this.on("mouseMoved", function(event) {
				var mousePos = Vec2.create(event.x, event.y);

				this.gui.mouseMoved(mousePos);
				this.nodes.mouseMoved(mousePos);
			}.bind(this));
		},

		draw: function() {
			this.nodes.update();
			this.gui.update();

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

			// draw gui buttons
			this.gui.buttonsArray().forEach(function(button) {
				drawRoundRect(this.ctx, button.posA, button.posB, color(this.colors.button[button.name]), button.size);
				drawRoundRect(this.ctx, button.posA, button.posB, color(this.colors.button[button.name + "Hover"].map(function(value, index) {
					return index == 3 ? Math.ceil(button.hoverAlpha * value) : value;
				})), button.size);

				drawText(this.ctx, Vec2.create().asAdd(button.posA, Vec2.create(12, 14)), button.name, color(this.colors.button[button.name + "Text"]));
			}.bind(this));
		}
	});
});
