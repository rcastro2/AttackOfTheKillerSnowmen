let rnd = (l,u) => Math.random() * (u-l) + l;
let $ = (id) => document.getElementById(id);

class Entity{
    constructor(model,x,y,z,scale = 1,container=scene){
        this.dz = 0.1;
        this.obj = document.createElement("a-entity")
        this.obj.setAttribute("gltf-model",`#${model}`);
        this.obj.setAttribute("position",{x:x,y:y,z:z});
        this.obj.setAttribute("scale",{x:scale, y:scale, z:scale});
        container.append(this.obj);
    }
    collidedWith(that,threshold){
        let cx = Math.pow(that.object3D.position.x - this.obj.object3D.position.x,2)
        let cz = Math.pow(that.object3D.position.z - this.obj.object3D.position.z,2)
        let d = Math.sqrt(cx + cz);
        return d < threshold;
    }
    angleTo(that){
        let dx = that.object3D.position.x - this.obj.object3D.position.x;
        let dz = that.object3D.position.z - this.obj.object3D.position.z;

        this.angle = Math.atan(dx/dz)
        if(dz < 0){
            this.angle += Math.PI
        }
    }
    rotateTowards(that){
        this.angleTo(that);
        this.obj.object3D.rotation.y = this.angle;
    }
    forward(speed){
        let dx = speed * Math.sin(this.angle);
        let dz = speed * Math.cos(this.angle);
        this.obj.object3D.position.x += dx;
        this.obj.object3D.position.z += dz; 
    }
}
class Snowman extends Entity{
    constructor(x,y,z,scale=1){
        super("snowman",x,y,z,scale);
    }
    defeated(){
        this.obj.object3D.position.y += 0.25;
    }
    attack(speed){ 
        this.rotateTowards(camera);       
        this.forward(speed);
    }
    face(){
        this.rotateTowards(camera)
    }
}
class Cube extends Entity{
    constructor(x,y,z,scale=1,container=scene){
        super("cube",x,y,z,scale,container);

        this.obj.addEventListener("mouseenter",function(obj){
            if(obj.target.getAttribute("visible")){
                obj.target.setAttribute("visible",false)
                new Cube(0.25 * saved ,1,-1,0.1,score);
                saved++;
                totalTime += 5;
            } 
        })
    }
}
let scene, time, camera, intro, home, instruction,instruction2, score, sign, gameStarted = false;
let startTime, timeLeft, totalTime = 60, timer;
let snowmen = [], cubes = [], pos=0, saved = 0;
let message = "North pole has been invaded by killer snowmen from outer space.  It is your task to collect the magical ice cubes and return them home in order to vanquish the invaders."
window.onload = () => {
    scene = $("scene")
    time = $("time")
    score = $("score")
    camera = $("camera")
    intro = $("intro")
    instruction = $("instruction");instruction2 = $("instruction2");
   
    setTimeout(displayIntro,500);
}
function displayIntro(){
    instruction.setAttribute("value",message.substring(0,pos++));
    instruction2.setAttribute("value",message.substring(0,pos++));
    if(pos < message.length){
        setTimeout(displayIntro,50);
    }else{
        start = $("start")
        start.setAttribute("visible","true")
        window.addEventListener("click",function(){
            if(!gameStarted){
                gameStarted = true;
                initObjects();
                setTimeout(hideIntro(),1500);
            } 
        })
    }
}
function hideIntro(){
    intro.object3D.position.z -= 0.2
    if(intro.object3D.position.z < -50){
        intro.setAttribute("visible","false")
        updateGame();
        let d = new Date();
        startTime = d.getTime();
        updateTime();
    }else{
        setTimeout(hideIntro,10)
    }
}
function initObjects(){
    home = new Entity("home",-45,0,-45)
    for(let i = 0; i < 20; i++){
        snowmen.push(new Snowman(rnd(-50,50),3,rnd(50,-50),0.01))
    }
    for(let i = 0; i < 5; i++){
        cubes.push(new Cube(rnd(-50,50),0,rnd(50,-50),0.5))
    }
    for(let i = 0; i < 100; i++){
        n = Math.floor(rnd(1,6));
        new Entity("pine" + n,rnd(-50,50),0,rnd(50,-50))
    }
}

function updateGame(){
    if(timer && timeLeft == 0){
        clearTimeout(timer)
        timer = null;
    }
    for(let snowman of snowmen){
        if(saved == cubes.length && home.collidedWith(camera,6)){
            $("gone").setAttribute("visible","true")
            snowman.defeated();
        }else if(timeLeft == 0){
            sign = $("goodbye")
            console.log(sign)
            sign.setAttribute("visible","true")
            camera.removeAttribute("wasd-controls");
            if(!snowman.collidedWith(camera,10)){
                snowman.attack(0.1);
            }
        }else if(snowman.collidedWith(camera,10)){
            snowman.face()
        }
        
    }
    setTimeout(updateGame,20)
}
function updateTime(){
    let d = new Date();
    let timeElapsed = Math.floor((d.getTime() - startTime)/1000);
    timeLeft = totalTime - timeElapsed
    if(timeLeft >= 0){
        time.setAttribute("value","Time: " + timeLeft);
    }
    timer = setTimeout(updateTime,100)
}