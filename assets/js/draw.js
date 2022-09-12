//canvas context functions helpers
var Draw = {};

Draw.fillRect = function(ctx,x,y,w,h,opt){
	ctx.fillStyle = opt.color || "#fff";
	ctx.globalAlpha = opt.alpha || 1;
	if(opt.filter)
	{
		var old_filter = ctx.filter;
		ctx.filter = opt.filter;
	}
	ctx.fillRect(x,y,w,h);
	if(opt.filter)
	{
		ctx.filter = old_filter;
	}
};

Draw.strokeRect = function(ctx,x,y,w,h,opt){
	ctx.strokeStyle = opt.color || "#fff";
	ctx.globalAlpha = opt.alpha || 1;
	ctx.strokeRect(x,y,w,h);
};

Draw.fillCircle = function(ctx, x, y, r, opt){
	ctx.fillStyle = opt.color || "#fff";
	ctx.globalAlpha = opt.alpha || 1;
	if(opt.filter)
	{
		var old_filter = ctx.filter;
		ctx.filter = opt.filter;
	}
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fill();
	if(opt.filter)
	{
		ctx.filter = old_filter;
	}
};

Draw.strokeCircle = function(ctx, x, y, r, opt){
	ctx.strokeStyle = opt.color || "#fff";
	ctx.globalAlpha = opt.alpha || 1;
	if(opt.filter)
	{
		var old_filter = ctx.filter;
		ctx.filter = opt.filter;
	}
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.stroke();
	if(opt.filter)
	{
		ctx.filter = old_filter;
	}
};

Draw.fillText = function(ctx,t,x,y,opt){
	ctx.fillStyle = opt.color || "#fff";
	ctx.textBaseline = opt.valign || "top";
	ctx.textAlign = opt.align || "left";
	ctx.font = (opt.fontSize || 14) + "px sans-serif";
	ctx.globalAlpha = opt.alpha != null ? opt.alpha : 1;
	ctx.fillText(t,x,y);
};

Draw.clearCtx = function(ctx,x,y,w,h){
	ctx.clearRect(x,y,w,h);
};

Draw.drawImage = function(ctx, img, src, dest, opt){

    if(!img) return;
    
	opt = opt || {};
	src = src || {};
	dest = dest || {};

	sx = (src.x != null ? src.x : 0);
	sy = (src.y != null ? src.y : 0);
	sw = (src.width != null ? src.width : img.width);
	sh = (src.height != null ? src.height : img.height);

	dx = (dest.x != null ? dest.x : sx);
	dy = (dest.y != null ? dest.y : sy);
	dw = (dest.width != null ? dest.width : img.width);
	dh = (dest.height != null ? dest.height : img.height);

	ctx.globalAlpha = opt.alpha != null ? opt.alpha : 1;

	if(opt.angle)
	{
		ctx.save();
		ctx.translate((dx + dw/2),(dy + dh/2));
		ctx.rotate(opt.angle * Math.PI / 180);
		ctx.translate(-(dx + dw/2), -(dy + dh/2));
	}

	if(opt.tint)
	{
		var old_gco = ctx.globalCompositeOperation;
		//create canvas of destiny size
		off = Utils.offScreen2DContext(dw, dh);
		//draw image con it in x:y = 0
		off.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
		//source-atop: The new shape is only drawn 
		//where it overlaps the existing canvas content
		off.globalCompositeOperation = 'source-atop';	
		//use tint color
		off.fillStyle = opt.tint;
		//fill canvas
		off.fillRect(0, 0, dw, dh);
		//off.globalCompositeOperation = 'source-over';
	}

	if(opt.filter)
	{
		var old_filter = ctx.filter;
		ctx.filter = opt.filter;
	}

	ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

	if(opt.filter)
	{
		ctx.filter = old_filter;
	}

	if(opt.tint)
	{	
		//color: Preserves the luma of the bottom layer
		//while adopting the hue and chroma of the top layer
		ctx.globalCompositeOperation = 'color';
		//draw offcanvas on destiny
		ctx.drawImage(off.canvas, dx, dy, dw, dh);
		//back to default: (source-over)
		ctx.globalCompositeOperation = old_gco;
	}
	
	if(opt.angle)
	{
		ctx.restore();
	}
}