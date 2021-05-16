let map, sliderW, sliderH, saveButton;
let mode=1, myShader;
let uiLayer;

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
		this._startPoint = [0,0,7];
		this._endPoint = [7,7,7];
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
	set startPoint(pos)
	{
		let x=pos[0], y=pos[1], z=pos[2];
		this.cells[this._startPoint[0]][this._startPoint[1]][this._startPoint[2]] = 0;
		this.cells[x][y][z] = 2;
		this._startPoint=[x,y,z];
	}
	set endPoint(pos)
	{
		let x=pos[0], y=pos[1], z=pos[2];
		this.cells[this._endPoint[0]][this._endPoint[1]][this._endPoint[2]] = 0;
		this.cells[x][y][z] = 3;
		this._endPoint=[x,y,z];
	}
	reset()
	{
		this.cells=[];
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
		this.startPoint=[0,0,this.column-1];
		this.endPoint=[this.column-1,this.row-1,this.column-1];
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
	isStartEndPoint(mode)
	{
		return mode == 2 || mode == 3;
	}
	add(_x, _y, mode=0)
	{
		if(!between(_x, 0, this.column-1) || !between(_y, 0, this.row-1)) return false;
		let x, z, dir;
		switch(this.face)
		{
			case 0:x=_x; z=this.column-1; dir=-1; break;
			case 1:x=0; z=_x; dir=1; break;
			case 2:x=this.column-1-_x; z=0; dir=1; break;
			case 3:x=this.column-1; z=this.column-1-_x; dir=-1; break;
		}
		
		let xx=x, zz=z, sePoint=false;
		for(let i=0; i<Math.min(Math.floor(this.column/2),4); i++)
		{
			if(!this.isStartEndPoint(mode)) this.cells[x][_y][z] = mode;
			else if(_y+1 < this.column) // start & end point
			{
				let bottom=this.cells[x][_y+1][z];
				if(bottom != 0 && !this.isStartEndPoint(bottom))
				{
					if(mode == 2) this.startPoint=[x,_y,z];
					else this.endPoint=[x,_y,z];
					sePoint=true;
					break;
				}
			}
			if(this.face % 2 == 0) z+=dir;
			else x+=dir;
		}
		if(!sePoint && this.isStartEndPoint(mode))
		{
			if(mode == 2) this.startPoint=[xx,_y,zz];
			else this.endPoint=[xx,_y,zz];
		}
		return true;
	}
	//get bounding box
	getBound(_face=null)
	{
		let face = _face===null ? this.face : _face;
		let x, z, slideDir, depthDir;
		//get starting point
		switch(face)
		{
			case 0:x=0; z=this.column-1; slideDir=1; depthDir=-1; break;
			case 1:x=0; z=0; slideDir=1; depthDir=1; break;
			case 2:x=this.column-1; z=0; slideDir=-1; depthDir=1; break;
			case 3:x=this.column-1; z=this.column-1; slideDir=-1; depthDir=-1; break;
		}
		
		//현재 바라보는 위치의 왼쪽 위부터 스캔합니다.
		let res=[], xx=(face % 2 == 0)?x:z, zz;
		for(let i=0;i<this.row;i++)
		{
			res.push([]);
			for(let j=0;j<this.column;j++) res[i].push(0);
		}
		
		let startX=-1, startY=-1;
		for(let i=0; i<this.column; i++)
		{
			for(let j=0; j<this.row; j++)	
			{
				zz=(face % 2 == 0)?z:x;
				for(let k=0; k<Math.ceil(this.column/2); k++)
				{
					let cell=(face % 2 == 0) ? this.cells[xx][j][zz] : this.cells[zz][j][xx];
					if(cell !== 0 && !this.isStartEndPoint(cell))
					{
						res[j][i]=cell;
						break;
					}
					zz+=depthDir;
				}
			}
			xx+=slideDir;
		}
		return res;
	}
	getStartPoint()
	{
		let _x, _y, _facing;
		if(this._startPoint[2] > Math.floor(this.column/2) ) _facing=0;
		else _facing=2;
		_x=(_facing == 0) ? this._startPoint[0] : this.column - 1 - this._startPoint[0];
		_y=this._startPoint[1];
		_x = _x * this.cellWidth - this.width / 2 + this.cellWidth/2;
		_y = _y * this.cellWidth - this.height / 2 + this.cellWidth/2;
		return {x:_x, y:_y, facing:_facing};
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
		shader(myShader);
		for(let x=0; x<this.column; x++)
		{
			for(let y=0;y<this.row;y++)
			{
				for(let z=0;z<this.column;z++)
				{
					let currentCell=this.cells[x][y][z];
					if(currentCell == 0) continue;
					switch(currentCell)
					{
						case 1:fill(255); break;
						case 2:fill(0,255,0); break;
						case 3:fill(255,255,0); break;
						case 4:fill("#a18d6c"); break;
						case 5:fill("#42a3ed"); break;
					}
					push();
					translate(this.cellWidth * x - this.width / 2 + this.cellWidth/2, 
						  -(this.cellWidth * y - this.height / 2 + this.cellWidth/2), 
						  this.cellWidth * z - this.width / 2 + this.cellWidth/2 );
					if( this.isStartEndPoint(currentCell) ) sphere(this.cellWidth / 3);
					else box(this.cellWidth);
					pop();
				}
			}
		}
		resetShader();
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

function drawUI()
{
	uiLayer.clear();
	uiLayer.noStroke();
	uiLayer.fill(255);
	uiLayer.rect(0, 0, 100, 160, 0, 0, 0, 30);
	uiLayer.stroke(25);
	switch(mode)
	{
		case 1:uiLayer.fill(255); break;
		case 2:uiLayer.fill(0,255,0); break;
		case 3:uiLayer.fill(255,255,0); break;
		case 4:uiLayer.fill("#a18d6c"); break;
		case 5:uiLayer.fill("#42a3ed"); break;
	}
	uiLayer.rect(10, 10, 80, 80);
	let str;
	switch(mode)
	{
		case 1:str="Wall"; break;
		case 2:str="Start"; break;
		case 3:str="Goal"; break;
		case 4:str="Sand"; break;
		case 5:str="Pond"; break;
	}
	uiLayer.noStroke();
	uiLayer.fill(0);
	uiLayer.text(str, 50, 130);
	push();
	noStroke();
	texture(uiLayer);
	translate(0,0,900);
	rotateX(PI);
	rect(width/2 - 100,-height/2,100,160);
	pop();
}

function preload()
{
	myShader = loadShader("shader.vert", "shader.frag");
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
	
	saveButton=createButton('export');
	saveButton.position(10, 70);
	saveButton.mousePressed(exportData);
	
	resetButton=createButton('reset');
	resetButton.position(10, 100);
	resetButton.mousePressed(function(){map.reset();});
	uiLayer = createGraphics(100, 160);
	uiLayer.textAlign(CENTER, CENTER);
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
	drawUI();
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
	else if (between(keyCode, 49, 53)) mode = keyCode - 48; //1~5
}

function exportData()
{
	let data={};
	data.level = 0;
	data.row = map.row;
	data.column = map.column;
	data.cells=map.cells.slice(0,map.column);
	let startPointData=map.getStartPoint();
	data.startX=startPointData.x;
	data.startY=startPointData.y;
	data.facing=startPointData.faceing;
	for(let i=0;i<map.column;i++)
	{
		data.cells[i].splice(map.row);
		for(let j=0;j<map.row;j++)
		{
			data.cells[i][j].splice(map.column);
		}
	}
	saveJSON(data, 'map.json');
}
