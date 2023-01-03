const canvas = document.getElementsByTagName('canvas')[0];
console.log(canvas)

canvas.width = innerWidth; canvas.height = innerHeight-10;

const c = canvas.getContext('2d');  // context of the canvas, lets us access all methods for 2d rendering

function drawBG(){
    c.fillStyle = 'black';
    c.fillRect(0,0,innerWidth, innerHeight)
}

const bottomPadding = 15;
const scale = 0.15;
const sensitivity = 5;

// *********** *********** 

class Player{
    constructor(){
        // this.sensitivity = 10;

        this.velocity = { xVel: 0.0, yVel: 0.0 } // if an object moves, it must have a velocity
        
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
        // c.fillStyle = 'red' // temporary
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    /* // deprecated
    moveLeft(){
        this.position.x -= this.sensitivity;
    }
    moveRight(){
        this.position.x += this.sensitivity;
    }*/

    update(){
        if(this.image){
            this.draw();

            this.position.x += this.velocity.xVel;
        }
    }  
}



// *********** gameplay *********** 

const player = new Player();
const keyFlags = {
    left: false,
    right: false,
    shoot: false
}

function animate(){
    requestAnimationFrame(animate); // tells the browser that you wish to perform an animation and requests that the browser calls a specified function to update an animation before the next repaint
    drawBG();
    player.update();

    if(keyFlags.left) player.velocity.xVel = -sensitivity;
    else if(keyFlags.right) player.velocity.xVel = sensitivity;
    else player.velocity.xVel = 0

    //*else shoot
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