let map, sliderW, sliderH;
let mode=1;

function cycle(n, p, c)
{
	let v=n+p;
	return v-Math.floor(v/c)*c;
}
function between(a, min, max)
{
	return min <= a && a<=max;
}

class cubeSpace
{
	constructor()
	{
		this.row=10; // number Y
		this.column=10; // number X
		this.cellWidth=50;
		this.cells=[];
		this.face = 0;
		this.r = 0;
		this.nextFace= 0;
		this.rotateDir = 0;
		this.reset();
	}
	get width()
	{
		return this.column * this.cellWidth;
	}
	get height()
	{
		return this.row * this.cellWidth;
	}
	get upperBound()
	{
		return -this.height /2;
	}
	get lowerBound()
	{
		return this.height/2;
	}
	get leftBound()
	{
		return -this.width /2;
	}
	get rightBound()
	{
		return this.width/2;
	}
	reset()
	{
		for(let x=0; x<10; x++)
		{
			this.cells.push([]);
			for(let y=0;y<10;y++)
			{
				this.cells[x].push([]);
				for(let z=0;z<10;z++)
				{
					this.cells[x][y].push(0);
				}
			}
		}
		this.cells[0][0][0]=2;
		this.cells[7][7][7]=3;
	}
	rotate(direction)
	{
		this.rotateDir=direction;
		this.nextFace=cycle(this.nextFace, direction, 4);
	}
	operate()
	{
		if(this.rotateDir != 0)
		{
			this.r = cycle(this.r, this.rotateDir * 5, 360);
			if(this.r ==this.nextFace * 90)
			{
				this.rotateDir = 0;
				this.face = this.nextFace;
			}
			return true;
		}
		return false;
	}
	getGrid(_x, _y)
	{
		let x = _x - this.leftBound;
		let y = _y - this.upperBound;
		return [Math.floor(x/this.cellWidth), Math.floor(y/this.cellWidth)];
	}
	add(_x, _y, mode=0)
	{
		if(!between(_x, 0, this.column-1) || !between(_y, 0, this.row-1)) return false;
		let x, z, dir;
		switch(this.face)
		{
			case 0:x=_x; z=0; dir=1; break;
			case 1:x=this.column-1; z=_x; dir=-1; break;
			case 2:x=this.column-1-_x; z=this.column-1; dir=-1; break;
			case 3:x=0; z=this.column-1-_x; dir=1; break;
		}
		
		for(let i=0; i<Math.min(Math.floor(this.column/2),4); i++)
		{
			console.log(x, _y, z);
			this.cells[x][_y][z] = mode;
			if(this.face % 2 == 0) z+=dir;
			else x+=dir;
		}
		return true;
	}
	render()
	{
		push();
		stroke(25);
		noFill();
		rotateY(this.r / 180 * PI);
		strokeWeight(3);
		box(this.width, this.height, this.width);
		strokeWeight(1);
		for(let x=0; x<this.column; x++)
		{
			for(let y=0;y<this.row;y++)
			{
				for(let z=0;z<this.column;z++)
				{
					if(this.cells[x][y][z] == 0) continue;
					switch(this.cells[x][y][z])
					{
						case 1:fill(255); break;
						case 2:fill(0,255,0); break;
						case 3:fill(255,255,0); break;
					}
					push();
					translate(this.cellWidth * x - this.width / 2 + this.cellWidth/2, 
						  -(this.cellWidth * y - this.height / 2 + this.cellWidth/2), 
						  -(this.cellWidth * z - this.width / 2 + this.cellWidth/2) );
					box(this.cellWidth);
					pop();
				}
			}
		}
		pop();
	}
}

function drawCursor(cur)
{
	if(!between(cur[0], 0, map.column-1) || !between(cur[1], 0, map.row-1)) return false;
	let w=map.cellWidth;
	push();
	stroke(255,0,0);
	strokeWeight(5);
	noFill();
	translate(0,0,900);
	rect(cur[0] * w - map.width/2, -(cur[1] * w -map.height/2) - w, w, w);
	pop();
	return true;
}

function setup()
{
	createCanvas(windowWidth,windowHeight,WEBGL);
	ortho(-width/2, width/2, height/2, -height/2, -2000, 2000);
	map=new cubeSpace();
	sliderW=createSlider(3,10,8);
	sliderH=createSlider(3,10,8);
	sliderW.position(10,10);
	sliderH.position(10,40);
}

function draw()
{
	background(220);
	map.column = sliderW.value();
	map.row = sliderH.value();
	let cur=map.getGrid(mouseX-width/2, mouseY-height/2);
	drawCursor(cur);
	map.operate();
	map.render();
}

function mousePressed() {
	if(map.rotateDir == 0)
	{
		let cur=map.getGrid(mouseX-width/2, mouseY-height/2);
		let _type;
		if(mouseButton === LEFT) _type=mode;
		else if(mouseButton === RIGHT) _type=0;
		map.add(cur[0], cur[1], _type);
	}
}

function keyPressed() {
	if (keyCode === LEFT_ARROW) {
		map.rotate(-1);
	} else if (keyCode === RIGHT_ARROW) {
		map.rotate(1);
	}
}
