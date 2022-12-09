let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var frequency = 0.01744826987970336;
var color = "hsl(30,100%,50%)"
var lum = 50;

window.onload = function(){
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
    init();

};

function showAxes(ctx,axes) {
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    var xMin = 0;
    
    ctx.beginPath();
    ctx.strokeStyle = "rgb(128,128,128)";
    
    // X-Axis
    ctx.moveTo(xMin, height/2);
    ctx.lineTo(width, height/2);
    
    // Y-Axis
    ctx.moveTo(width/2, 0);
    ctx.lineTo(width/2, height);

    // Starting line
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    
    ctx.stroke();
}

function plotSine(ctx, xOffset, yOffset) {
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    var scale = 20;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    
    var x = 4;
    var y = 0;
    var amplitude = 100;
   

    ctx.moveTo(x, ctx.canvas.height/2);
    while (x < width) {
        y = height/2 + amplitude * Math.sin((x+xOffset) * frequency);
        ctx.lineTo(x, y);
        x++;

    }
    ctx.stroke();
    ctx.save();

    ctx.stroke();
    ctx.restore();
}

function draw() {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //showAxes(ctx);
    ctx.save();            
    
    plotSine(ctx, step, 50);
    ctx.restore();
    
    step += 4;
    window.requestAnimationFrame(draw);
}
// function spirograph() {            
//     var canvas2 = document.getElementById("canvas2");
//     var ctx = canvas2.getContext("2d");
    
//     showAxes(ctx);
//     ctx.save();
//     // var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     var step = 4;
//     for (var i = -4; i < canvas.height; i += step) {
//         // ctx.putImageData(imageData, 0, 0);
//         plotSine(ctx, i, 54 + i);
//     }
// }
function init() {
    color = `hsl(${frequency*258},100%,${lum}%)`;
    window.requestAnimationFrame(draw);
    // spirograph();
}
var step = -4;

document.getElementById("canvas").addEventListener("wheel",function cycleThePhase(event){
    if(event.deltaY>0){
        if(frequency<0.795){
            if(lum<50){
                if(lum+5<=50){
                    lum+=2;
                }  
            }
            else{
                if(frequency*258<=258){frequency*=1.05;}
                if(lum+5<=50){
                    lum+=2;
                }   
            }
        }
        else if(frequency>0.795){
            if(frequency*258<=258){frequency*=1.05;}
            if(lum-2>0){lum -= 2;}
        }
    }
    else if(event.deltaY<0){
        if(lum<50){
            if(lum+5<=50){
                lum+=2;
            }  
        }
        else{
            if(frequency>0.006616197340194356){
                if(frequency*258>=0){frequency*=0.95;}
                if(lum+2<=50){
                    lum+=5;
                }
            }
            else {
                if(frequency*258>=0){frequency*=0.95;}
                if(lum-2>0){lum -= 2;}
            }
        }
    }
    console.log(`Frequency = ${frequency*258} and luminosity = ${lum}`);
    color = `hsl(${frequency*258},100%,${lum}%)`;
        //document.getElementById("illumination").innerHTML = outputIllumination(phase).toFixed(0)+"%";
    //var sky = outputIllumination(phase);
    //var a = 170;
    //var backgroundColor = "rgb("+Math.floor(a-a*sky/100)+", "+Math.floor(g-g*sky/100)+", "+Math.floor(b-b*sky/100)+")";
    //document.body.style.background = backgroundColor;
});