class cubeSpace
{
	constructor()
	{
		this.row=10; // number Y
		this.column=10; // number X
		this.cellWidth=50;
		this.level = 0;
		this.bounding=[];
		this.face = 0;
		this.r = 0;
		this.nextFace= 0;
		this.rotateDir=0;
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
	render()
	{
		push();
		stroke(25);
		noFill();
		rotateY(this.r / 180 * PI);
		box(this.width, this.height, this.width);
		pop();
	}
}

