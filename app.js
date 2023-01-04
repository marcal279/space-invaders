const canvas = document.getElementsByTagName('canvas')[0];
console.log(canvas)

canvas.width = innerWidth; 
canvas.height = innerHeight-10;

const c = canvas.getContext('2d');  // context of the canvas, lets us access all methods for 2d rendering

function drawBG(){
    c.fillStyle = 'black';
    c.fillRect(0,0,innerWidth, innerHeight)
}

const bottomPadding = 15;
const scale = 0.15;
const movementSensitivity = 7;
const rotationSensitivity = 0.15;

// *********** Classes *********** 

class Player{
    constructor(){
        this.velocity = { xVel: 0.0, yVel: 0.0 } // if an object moves, it must have a velocity
        
        this.rotation = 0;

        const SpaceshipImage = new Image(); // todo: to be added
        SpaceshipImage.src = './assets/spaceship.png';
        SpaceshipImage.onload = ()=>{
            // const scale = 0.5;
            this.image = SpaceshipImage;
            this.width = SpaceshipImage.width * scale; 
            this.height = SpaceshipImage.height * scale // because player won't be just a point object, image will have some width and height   

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

// *********** gameplay *********** 

const player = new Player();
const projectiles = [];
const keyFlags = {
    left: false,
    right: false,
    shoot: false
}

function showProj(){
    console.log(projectiles)
}

function animate(){
    requestAnimationFrame(animate); // tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint
    drawBG();

    player.update();

    projectiles.forEach((projectile, index, array)=>{
        if((projectile.position.y + projectile.radius) <= 0){
            projectiles.splice(index, 1);
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