const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const sidebar = document.querySelector('#sidebar');

let isMobile = window.innerWidth/window.innerHeight < 1 ? true : false;
console.log(isMobile);

if (isMobile == true) {
    ctx.canvas.height = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
}

const viewportTransform = {
    x: 0,
    y: 0,
    scale: 1
}

// Layers
let displayAxis = true;
let displayCoordinates = true;
let displayAirports = true;

// States
let isMeasuring = false;

//Multipliers
const WRIGHT_MULTIPLIER = 19.6111;

//Images import
const axis = document.getElementById("axis");

let islands = {
    WrightIsles: {
        img: document.getElementById("wright"),
        scale: {
            width: 19.6111,
            height: 19.6111
        },
        offset: {
            x: -7562,
            y: -6912
        }
    }
}

let icons = {
    WrightAirport : {
        img: document.getElementById("airport"),
        name: "Wright Airport",
        position: {
            x: 5894,
            y: 4703
        },
        color: "#3de15d",
        type: "airport"
    },
    NorthRunway : {
        img: document.getElementById("airport"),
        name: "North Runway",
        position: {
            x: -4449,
            y: -5480
        },
        color: "#3de15d",
        type: "airport"
    }
}

const processMaps = () => {
    Object.keys(islands).forEach(element => {
        ctx.drawImage(islands[element].img, 
            islands[element].offset.x,
            islands[element].offset.y,
            islands[element].img.naturalWidth * islands[element].scale.width,
            islands[element].img.naturalHeight * islands[element].scale.height);
    });
}

const processIcons = (k) => {
    if (k < 0.025) {k = 0.025}
    Object.keys(icons).forEach(element => {
        if(displayAirports == false && icons[element].type == "airport") {return;}
        ctx.drawImage(icons[element].img, 
            icons[element].position.x - 10/k, 
            icons[element].position.y - 10/k, 
            20/k, 
            20/k);
        ctx.font = `${15/k}px monospace`;
        ctx.fillStyle = icons[element].color;
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3/k;
        ctx.strokeText(icons[element].name, 
            icons[element].position.x, 
            icons[element].position.y - 15/k);
        ctx.fillText(icons[element].name, 
            icons[element].position.x, 
            icons[element].position.y - 15/k);
    });
}

const drawAxis = (k) => {
    if (k < 0.025) {k = 0.025}
    ctx.drawImage(axis, 
        0, 
        -100/k, 
        100/k, 
        100/k);
    ctx.beginPath();
    ctx.arc(0, 0, 2/k, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
}

const drawCoordinates = (xpos, ypos, k) => {
    ctx.font = `bold ${18/k}px monospace`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`X: ${Math.round(xpos/k)}`, (xpos+10)/k, (ypos-40)/k);
    ctx.fillText(`Y: ${Math.round(-ypos/k)}`, (xpos+10)/k, (ypos-20)/k);
}

const render = (e) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(viewportTransform.scale, 0, 0, viewportTransform.scale, viewportTransform.x, viewportTransform.y);

    processMaps();
    if (displayAxis) {drawAxis(viewportTransform.scale);}
    processIcons(viewportTransform.scale);
    if (displayCoordinates) {drawCoordinates(e.clientX - viewportTransform.x, e.clientY - viewportTransform.y, viewportTransform.scale);}
    
    if (!isMobile) {
        if (ctx.canvas.height != sidebar.offsetHeight) {
            ctx.canvas.height = sidebar.offsetHeight;
            ctx.canvas.width = window.innerWidth * 0.75;
        }
    }
}

// We need to keep track of our previous mouse position for later
let previousX = 0, previousY = 0;

const updatePanning = (e) => {
    const localX = e.clientX;
    const localY = e.clientY;

    viewportTransform.x += localX - previousX;
    viewportTransform.y += localY - previousY;

    previousX = localX;
    previousY = localY;
}

const updateZooming = (e) => {

    const oldX = viewportTransform.x;
    const oldY = viewportTransform.y;

    const localX = e.clientX;
    const localY = e.clientY;

    const previousScale = viewportTransform.scale;
    const newScaleX = viewportTransform.scale + e.deltaY * -0.01

    if (previousScale <= 0.01) {
        if (newScaleX-previousScale < 0) { return; }
    }

    if (previousScale >= 5) {
        if (newScaleX-previousScale > 0) { return; }
    }

    let delta = e.deltaY;

    if (newScaleX-previousScale < 1) {
        delta = delta * viewportTransform.scale;
    }
    
    const newScale = viewportTransform.scale += delta * -0.01;

    const newX = localX - (localX - oldX) * (newScale / previousScale);
    const newY = localY - (localY - oldY) * (newScale / previousScale);

    viewportTransform.x = newX;
    viewportTransform.y = newY;
    viewportTransform.scale = newScale;
    
}

const onMouseMove = (e) => {
    updatePanning(e)

    render(e);

}

const onMouseWheel = (e) => {
    updateZooming(e)

    render(e)

    //console.log(e)
}

canvas.addEventListener("wheel", onMouseWheel);

canvas.addEventListener("mousedown", (e) => {
    previousX = e.clientX;
    previousY = e.clientY;

    canvas.addEventListener("mousemove", onMouseMove);
})

canvas.addEventListener("mouseup", (e) => {
    canvas.removeEventListener("mousemove", onMouseMove);
})

canvas.addEventListener("mousemove", (e) => {
    render(e);
})

canvas.addEventListener('click', (e) => {
    render(e);
})


// Layers

document.querySelector('#displayAxis').addEventListener('click', () => {
    displayAxis = !displayAxis;
    render();
})

document.querySelector('#displayAirports').addEventListener('click', () => {
    displayAirports = !displayAirports;
    render();
})

document.querySelector('#displayCoordinates').addEventListener('click', () => {
    displayCoordinates = !displayCoordinates;
    render();
})

// Navigation buttons



render();