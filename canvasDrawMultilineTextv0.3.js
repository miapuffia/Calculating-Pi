/*
 * This was designed to be as versitile as possible!
 * Version 0.3
 *
 * Params:
 *	(Required)
 * 		context			- Context of canvas
 *		text			- String text to draw
 *		maxWidth		- Max width a line can take up
 * 	(Optional)
 *		x				- X position to start drawing lines at
 *		y				- Y position to start drawing lines at
 * 		font			- Text font (defaults to the provided context's font)
 * 		fill			- Text color (defaults to black)
 *		alignment		- Text alignment (supports left, center, and right) (defaults to left)
 * 		padding			- Extra space around all lines and depending on lineHeightStyle, in between lines (defaults to 0)
 *		lineHeightStyle	- Described how lines should be spaced, currently based on padding (supports none, splitPadding, and mergedPadding) (defaults to mergedPadding)
 *		useBackground	- Boolean whether or not to draw a background (defaults to false) (currently there is no way to set background color)
*/
function drawMultilineText(params) {
	var context = params.context;
	var text = params.text;
	var maxWidth = params.maxWidth;
	
	var font = params.font ?? context.font;
	var fill = params.fill ?? "black";
	var alignment = params.alignment ?? "left";
	var padding = params.padding ?? 0;
	var lineHeightStyle = params.lineHeightStyle ?? "mergedPadding";
	var useBackground = params.useBackground ?? false;
	var x = params.x ?? 0;
	var y = params.y ?? 0;
	
	context.font = font;
	context.textBaseline = "bottom";
	
	let totalTextWidth = context.measureText(text).width;
	let textHeight = parseInt(font, 10);
	
	function drawLine(lineText, lineY) {
		let lineWidth = context.measureText(lineText).width;
		
		switch(alignment) {
			case "center":
				if(useBackground) {
					context.fillStyle = "white";
					context.fillRect(((maxWidth - lineWidth) / 2) - padding + x, lineY, lineWidth + (2 * padding), parseInt(font, 10) + (2 * padding));
				}
				
				context.fillStyle = fill;
				context.fillText(lineText, ((maxWidth - lineWidth) / 2) + x, lineY + textHeight + padding);
				
				break;
			case "right":
				if(useBackground) {
					context.fillStyle = "white";
					context.fillRect(maxWidth - (lineWidth + (2 * padding)) + x, lineY, lineWidth + (2 * padding), parseInt(font, 10) + (2 * padding));
				}
				
				context.fillStyle = fill;
				context.fillText(lineText, maxWidth - lineWidth - padding + x, lineY + textHeight + padding);
				
				break;
			case "left":
			default:
				if(useBackground) {
					context.fillStyle = "white";
					context.fillRect(x, lineY, lineWidth + (2 * padding), parseInt(font, 10) + (2 * padding));
				}
				
				context.fillStyle = fill;
				context.fillText(lineText, x + padding, lineY + textHeight + padding);
		}
	}
	
	//Line fits or it can't be broken up
	if(totalTextWidth + (2 * padding) <= maxWidth || !text.includes(" ")) {
		drawLine(text, y);
	} else {
		let extraLineHeight;
		
		switch(lineHeightStyle) {
			case "none":
				extraLineHeight = 0;
				break;
			case "splitPadding":
				extraLineHeight = 2 * padding;
				break;
			case "mergedPadding":
			default:
				extraLineHeight = padding;
		}
		
		let lineNumber = 0;
		
		while(text.length > 0) {
			let shorterText = text;
			let shorterTextWidth = context.measureText(shorterText).width;
			
			//Chop off words until it fits or there is only 1 word left
			while(shorterTextWidth + (2 * padding) > maxWidth && text.includes(" ")) {
				shorterText = shorterText.substring(0, shorterText.lastIndexOf(" "));
				
				shorterTextWidth = context.measureText(shorterText).width;
			}
			
			drawLine(shorterText, y + (lineNumber * (textHeight + extraLineHeight)));
			
			lineNumber++;
			
			text = text.substring(shorterText.length + 1);
		}
	}
}