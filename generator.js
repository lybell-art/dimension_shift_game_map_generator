let map, sliderW, sliderH;
let mode=1;

function cycle(n, p, c)
{
	let v=n+p;
	return v-Math.floor(v/c)*c;
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
		return [x%this.column, y%this.row];
	}
	add(_x, _y, mode=0)
	{
		let x, z, dir;
		switch(this.face)
		{
			case 0:x=_x; z=0; dir=1; break;
			case 1:x=this.column-1; z=_x; dir=-1; break;
			case 2:x=this.column-1-_x; z=this.column-1; dir=-1; break;
			case 3:x=0; z=this.column-1-_x; dir=1; break;
		}
		for(let i=0; i<Math.max(Math.floor(this.column/2),4); i++)
		{
			this.cells[x][_y][z] = mode;
			if(this.face % 2 == 1) z+=dir;
			else x+=dir;
		}
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
					translate(this.cellWidth * x - this.width / 2, this.cellWidth * y - this.height / 2, this.cellWidth * z - this.width / 2);
					box(this.cellWidth);
				}
			}
		}
		pop();
	}
}

function drawCursor(cur)
{
	let w=map.cellWidth;
	stroke(255,0,0);
	strokeWeight(3);
	translate(0,0,900);
	rect(cur[0] * w, cur[1] * w, w, w);
}

function setup()
{
	createCanvas(windowWidth,windowHeight,WEBGL);
	ortho(-width/2, width/2, height/2, -height/2, 0, 2000);
	map=new cubeSpace();
	sliderW=createSlider(3,10,8);
	sliderH=createSlider(3,10,8);
	sliderW.position(10,10);
	sliderH.position(10,40);
}

function draw()
{
	map.column = sliderW.value();
	map.row = sliderH.value();
	let cur=map.getGrid(mouseX-width/2, mouseY-height/2);
	drawCursor(cur);
	map.operate();
	map.render();
}

function mousePressed() {
	let cur=map.getGrid(mouseX-width/2, mouseY-height/2);
	let _type;
	if(mouseButton === LEFT) _type=mode;
	else if(mouseButton === RIGHT) _type=0;
	map.add(cur[0], cur[1], _type);
}
