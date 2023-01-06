const canvas = document.getElementsByTagName('canvas')[0];
console.log(canvas)

canvas.width = innerWidth; 
canvas.height = innerHeight-10;

const c = canvas.getContext('2d');  // context of the canvas, lets us access all methods for 2d rendering

function drawBG(){
    c.fillStyle = 'black';
    c.fillRect(0,0,innerWidth, innerHeight)
}

function getRandomInt(max, min=0){
    return Math.ceil(Math.random()*max)+min;    // using ceil so that it doesnt generate 0. limits of random number are thus (0,max+1]
}

function isBetween(arg, min, max){
    if(arg>=min && arg <= max) return true;
    return false;
}

const bottomPadding = 15;
const movementSensitivity = 7;
const rotationSensitivity = 0.15;

// *********** Classes *********** 

class Player{
    constructor(){
        this.velocity = { xVel: 0.0, yVel: 0.0 } // if an object moves, it must have a velocity
        
        this.rotation = 0;
        this.scale = 0.15;

        const SpaceshipImage = new Image(); // todo: to be added
        SpaceshipImage.src = './assets/spaceship.png';
        SpaceshipImage.onload = ()=>{
            this.image = SpaceshipImage;
            this.width = SpaceshipImage.width * this.scale; 
            this.height = SpaceshipImage.height * this.scale // because player won't be just a point object, image will have some width and height   

            this.position = { 
                x: canvas.width/2 - this.width, 
                y: canvas.height - this.height - bottomPadding 
            } // because player must have a position on the screen
        }
    }

    draw(){ // to draw the player
        c.save();

        c.translate(this.position.x + this.width/2, this.position.y + this.height/2)    // translate canvas to center of spaceship and then rotate canvas so that spaceship will rotate
        c.rotate(this.rotation)
        c.translate(-(this.position.x + this.width/2), -(this.position.y + this.height/2))    // translate canvas back to original position

        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        
        c.restore();
    }

    update(){
        if(this.image){
            this.draw();

            this.position.x += this.velocity.xVel;
        }
    }  
}

class Projectile{
    constructor(position, velocity){    //!! tutorial has it as {position, velocity}, i.e., a single object
        this.position = position;
        this.velocity = velocity;

        this.radius = 3;                // circle projectiles
    }

    draw(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI, false);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update(){
        this.draw();
        this.position.x += this.velocity.xVel;
        this.position.y += this.velocity.yVel;
    }
}

var InvaderWidth = 0;   // needed for grid calculation 
var InvaderHeight = 0; 

class Invader{
    constructor(position){
        this.velocity = { xVel: 0.0, yVel: 0.0 };
        this.rotation = 0;
        this.scale = 1.5;

        const InvaderImage = new Image();
        InvaderImage.src = './assets/invader.png';
        InvaderImage.onload = ()=>{
            this.image = InvaderImage;
            this.width = InvaderImage.width * this.scale;
            this.height = InvaderImage.height * this.scale;

            InvaderWidth = this.width;
            InvaderHeight = this.height;

            this.position = {
                x: position.x,  // passed as constructor arg
                y: position.y
            }
        }
    }

    draw(){
        c.save();

        c.translate(this.position.x + this.width/2,  this.position.y + this.height/2);
        c.rotate(this.rotation)
        c.translate(-(this.position.x + this.width/2),  -(this.position.y + this.height/2));

        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);

        c.restore();
    }

    update(){
        if(this.image){
            this.draw();

            this.position.x += this.velocity.xVel;
            this.position.y += this.velocity.yVel;
        }
    }

    shoot(invaderProjectiles){      // !! consider renaming to addInvaderProjectile()
        invaderProjectiles.push(
            new InvaderProjectile(
                {
                    x: this.position.x + (this.width/2),
                    y: this.position.y + this.height
                },
                {
                    xVel: 0,
                    yVel: 5
                }
            )
        )
    }
}

class InvaderProjectile{
    constructor(position, velocity){    //!! tutorial has it as {position, velocity}, i.e., a single object
        this.position = position;
        this.velocity = velocity;

        this.width = 5;
        this.height = 10                // Rectangle projectiles
    }

    draw(){
        c.fillStyle = 'white';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(){
        this.draw();
        this.position.x += this.velocity.xVel;
        this.position.y += this.velocity.yVel;
    }
}

class InvaderGrid{     // for the grid of invaders. modularizes each grid of invaders, so that if we move grid we move all invaders in it
    constructor(){
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            xVel: 4,
            yVel: 0     // we set yVel in the update itself
        }

        this.invaders = []

        this.dimensions = {
            rows: getRandomInt(4),  // min 1, max 5
            cols: getRandomInt(7,4) // min 4, max 12
        }

        this.padding = {
            colPadding: 50,
            rowPadding: 50
        }


        // bug fix
        // this.width = this.dimensions.cols * (InvaderWidth + this.padding.colPadding);
        // this.height = this.dimensions.rows * (InvaderHeight + this.padding.rowPadding);
        this.width = this.dimensions.cols * (InvaderWidth);
        this.height = this.dimensions.rows * (InvaderHeight);

        for(let row = 0; row < this.dimensions.rows; row++){
            for(let col = 0; col < this.dimensions.cols; col++){
                this.invaders.push(
                    new Invader(
                        {
                            x: this.padding.colPadding * col, 
                            y: this.padding.rowPadding * row
                        }
                    )
                );
            }
        }
        console.log(this.invaders)
    }

    update(){
        this.position.x += this.velocity.xVel;
        this.position.y += this.velocity.yVel;

        this.velocity.yVel = 0;     // makes sure it moves down only one line

        if( (this.position.x + this.width > canvas.width) || (this.position.x <= 0) ){     // topmost point so dont need this.width for 2nd condition
            // console.log(`position = ${this.position.x}, width = ${this.width}, canvas.width = ${canvas.width}, position+width = ${this.position.x+this.width}`)
            this.velocity.xVel *= -1;
            this.velocity.yVel = InvaderHeight;    // moves it down one line
        }
        // if( (this.position.y + this.height >= canvas.height) || (this.position.y <= 0) ){
        //     this.velocity.yVel *= -1;
        // }    //* because we want to push them off the bottom of the screen

        this.invaders.forEach((invader, index, array)=>{
            invader.velocity.xVel = this.velocity.xVel; //!! this is done in grid.update
            invader.velocity.yVel = this.velocity.yVel;

            invader.update(); //!! in tutorial this is in grids.forEach
        })
    }
}

// *********** gameplay *********** 

const player = new Player();
const projectiles = [];
const invaderGrids = [          // array for multiple grids
    new InvaderGrid()
];
const keyFlags = {
    left: false,
    right: false,
    shoot: false
}

function showProj(){
    console.log(projectiles)
}

var frames = 0;     // no. of frames passed
var randomInterval;

function animate(){
    requestAnimationFrame(animate); // tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint
    drawBG();

    player.update();
    invaderGrids.forEach((grid, index, array)=>{
        grid.update();

    invaderProjectiles.forEach((invaderProjectile, index, array)=>{
        invaderProjectile.update();

        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            setTimeout(()=>{
                array.splice(index, 1)
            }, 0);
        }

        if((invaderProjectile.position.y + invaderProjectile.height >= player.position.y) &&
        (isBetween(invaderProjectile.position.x, player.position.x, player.position.x + player.width) ||
        isBetween(invaderProjectile.position.x-invaderProjectile.width, player.position.x, player.position.x + player.width)) ){
            alert('you lose')
        }
    })

    invaderGrids.forEach((invaderGrid, gridIndex, gridArray)=>{
        invaderGrid.update();
        
        if(frames%100==0 && invaderGrid.invaders.length>0){
            let randomInvader = invaderGrid.invaders[getRandomInt(invaderGrid.invaders.length)]
            if(randomInvader) randomInvader.shoot(invaderProjectiles);
        }

        invaderGrid.invaders.forEach((invader, invaderIndex, invaderArray)=>{
            projectiles.forEach((projectile, projectileIndex, projectileArray)=>{
                if( (projectile.position.y <= (invader.position.y+invader.height)) && (isBetween(projectile.position.x+projectile.radius, invader.position.x, invader.position.x+invader.width)) ){
                    setTimeout(()=>{    // to avoid bugs
                        let invaderFound = invaderArray.find((invaderActual)=>{
                            return invaderActual === invader
                        })
                        let projectileFound = projectileArray.find((projectileActual)=>{
                            return projectileActual === projectile
                        })
                        
                        if(invaderFound && projectileFound){
                            invaderArray.splice(invaderIndex,1);
                            projectileArray.splice(projectileIndex,1)
                        }
                    }, 0)                    
                }
            })
        })

        if(invaderGrid.invaders.length < 1) gridArray.splice(gridIndex, 1)
    })

    projectiles.forEach((projectile, index, array)=>{
        if((projectile.position.y + projectile.radius) <= 0){
            setTimeout(()=>{                        // just to prevent a big, otherwise just the splice would also work
                projectiles.splice(index, 1);
            }, 0)
        }
        else{
            projectile.update();
        }

    })

    if(keyFlags.left && player.position.x>=0){
        player.velocity.xVel = -movementSensitivity;
        player.rotation = -rotationSensitivity;
    }
    else if(keyFlags.right && (player.position.x + player.width)<=canvas.width){
        player.velocity.xVel = movementSensitivity;
        player.rotation = rotationSensitivity;
    }
    else {
        player.velocity.xVel = 0;
        player.rotation = 0;
    }

    //* spawn enemies
    if(!(frames % randomInterval)){
        invaderGrids.push(new InvaderGrid());
        randomInterval = getRandomInt(500,500);
        frames = 0;
    }

    frames++;
}
animate();

addEventListener('keydown', (keyEvent)=>{   // when a key pressed
    switch(keyEvent.key){
        case "ArrowLeft":
            keyFlags.left = true;
            break;
        case "a":
            keyFlags.left = true;
            break;


        case "ArrowRight":
            keyFlags.right  = true;
            break;
        case "d":
            keyFlags.right  = true;
            break;

        case " ":
            //shoot
            projectiles.push(
                new Projectile(
                    { 
                        x: player.position.x + player.width/2, 
                        y: player.position.y
                    },
                    {
                        xVel: player.velocity.xVel/2,
                        yVel: -10
                    }
                )
            )
            keyFlags.shoot = true;
            break;
        
        default:
            console.log(keyEvent.key);
            break;
    }
})

addEventListener('keyup', (keyEvent)=>{     // when a key released
    switch(keyEvent.key){
        case "ArrowLeft":
            keyFlags.left = false;
            break;
        case "a":
            keyFlags.left = false;
            break;


        case "ArrowRight":
            keyFlags.right  = false;
            break;
        case "d":
            keyFlags.right  = false;
            break;

        case " ":
            //shoot
            keyFlags.shoot = false;
            break;
        
        default:
            console.log(keyEvent.key);
            break;
    }
})