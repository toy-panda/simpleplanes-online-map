const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const sidebar = document.querySelector('#sidebar');

let isMobile = window.innerWidth/window.innerHeight < 1 ? true : false;
console.log(isMobile);

if (isMobile == true) {
    ctx.canvas.height = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
} else {
    ctx.canvas.height = sidebar.offsetHeight;
    ctx.canvas.width = window.innerWidth - sidebar.offsetWidth;
}

const viewportTransform = {
    x: 0,
    y: 0,
    scale: 0.1
}

// Layers
let displayAxis = true;
let displayCoordinates = true;
let displayAirports = true;
let displayDocks = true;
let displayShips = true;

// States
let isMeasuring = false;

//Images import
const axis = document.getElementById("axis");

let islands = {
    WrightIsles: {
        img: document.getElementById("wright"),
        scale: {
            width: 2.34979,
            height: 2.3369
        },
        offset: {
            x: -13736+6019.41,
            y: -13163+5594
        }
    },
    Krakabloa: {
        img: document.getElementById("krakabloa"),
        scale: {
            width: 2.3406,
            height: 2.3446
        },
        offset: {
            x: -13532+26392,
            y: -9338-53185
        }
    },
    SkyPark: {
        img: document.getElementById("skypark"),
        scale: {
            width: 5.306,
            height: 5.306
        },
        offset: {
            x: -1372-679,
            y: -937+31029
        }
    },
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
            y: -6173
        },
        color: "#3de15d",
        type: "airport"
    },
    BanditAirport : {
        img: document.getElementById("airport"),
        name: "Bandit Airport",
        position: {
            x: 14416,
            y: -58625
        },
        color: "#3de15d",
        type: "airport"
    },
    YagerAirport : {
        img: document.getElementById("airport"),
        name: "Yager Airport",
        position: {
            x: 26113,
            y: -52471
        },
        color: "#3de15d",
        type: "airport"
    },
    YagerDock : {
        img: document.getElementById("anchor"),
        name: "Water Takeoff",
        position: {
            x: 25282,
            y: -49629
        },
        color: "#fc3dff",
        type: "anchor"
    },
    USSTiny : {
        img: document.getElementById("ship"),
        name: "USS Tiny",
        position: {
            x: -141,
            y: 6805
        },
        color: "rgb(255,212,59)",
        type: "ship"
    },
    USSBeast : {
        img: document.getElementById("ship"),
        name: "USS Beast",
        position: {
            x: 10128,
            y: -8260
        },
        color: "rgb(255,212,59)",
        type: "ship"
    },
    USSTinyTwo : {
        img: document.getElementById("ship"),
        name: "USS Tiny Two",
        position: {
            x: 22501,
            y: -77294
        },
        color: "rgb(255,212,59)",
        type: "ship"
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

const proceedPathes = (k) => {
    // USS Tiny
    ctx.setLineDash([7/k, 4/k]);
    ctx.beginPath();
    ctx.strokeStyle = "rgb(59, 160, 255)";
    ctx.moveTo(icons.USSTiny.position.x, icons.USSTiny.position.y);
    //ctx.lineTo(3839, 10503);
    ctx.lineTo(14510.67, 20418.54);
    ctx.stroke();
    // USS Beast
    ctx.setLineDash([7/k, 4/k]);
    ctx.beginPath();
    ctx.strokeStyle = "rgb(59, 160, 255)";
    ctx.moveTo(icons.USSBeast.position.x, icons.USSBeast.position.y);
    ctx.lineTo(icons.USSBeast.position.x, icons.USSBeast.position.y-20000);
    ctx.stroke();
    // USS TinyTow
    ctx.setLineDash([7/k, 4/k]);
    ctx.beginPath();
    ctx.strokeStyle = "rgb(59, 160, 255)";
    ctx.moveTo(icons.USSTinyTwo.position.x, icons.USSTinyTwo.position.y);
    ctx.lineTo(icons.USSTinyTwo.position.x, icons.USSTinyTwo.position.y-20000);
    ctx.stroke();
}

const processIcons = (k) => {
    if (k < 0.025) {k = 0.025}
    Object.keys(icons).forEach(element => {
        if(displayAirports == false && icons[element].type == "airport") {return;}
        if(displayShips == false && icons[element].type == "ship") {return;}
        if(displayDocks == false && icons[element].type == "anchor") {return;}
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
    if (displayShips) {proceedPathes(viewportTransform.scale);}
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

canvas.addEventListener("pointerdown", (e) => {
    previousX = e.clientX;
    previousY = e.clientY;

    canvas.addEventListener("pointermove", onMouseMove);
})

canvas.addEventListener("pointerup", (e) => {
    canvas.removeEventListener("pointermove", onMouseMove);
})

canvas.addEventListener("pointermove", (e) => {
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

document.querySelector('#displayShips').addEventListener('click', () => {
    displayShips = !displayShips;
    render();
})

document.querySelector('#displayPorts').addEventListener('click', () => {
    displayDocks = !displayDocks;
    render();
})

// Navigation buttons

document.querySelector('#WI').addEventListener('click', (e) => {
    const centerX = -islands.WrightIsles.offset.x - (islands.WrightIsles.img.naturalWidth * islands.WrightIsles.scale.width)/2;
    const centerY = -islands.WrightIsles.offset.y - (islands.WrightIsles.img.naturalHeight * islands.WrightIsles.scale.height)/2;
    viewportTransform.x = centerX * viewportTransform.scale + ctx.canvas.width/2;
    viewportTransform.y = centerY * viewportTransform.scale + ctx.canvas.height/2;
    render(e);
});

document.querySelector('#KI').addEventListener('click', (e) => {
    const centerX = -islands.Krakabloa.offset.x - (islands.Krakabloa.img.naturalWidth * islands.Krakabloa.scale.width)/2;
    const centerY = -islands.Krakabloa.offset.y - (islands.Krakabloa.img.naturalHeight * islands.Krakabloa.scale.height)/2;
    viewportTransform.x = centerX * viewportTransform.scale + ctx.canvas.width/2;
    viewportTransform.y = centerY * viewportTransform.scale + ctx.canvas.height/2;
    render(e);
});

document.querySelector('#SC').addEventListener('click', (e) => {
    const centerX = -islands.SkyPark.offset.x - (islands.SkyPark.img.naturalWidth * islands.SkyPark.scale.width)/2;
    const centerY = -islands.SkyPark.offset.y - (islands.SkyPark.img.naturalHeight * islands.SkyPark.scale.height)/2;
    viewportTransform.x = centerX * viewportTransform.scale + ctx.canvas.width/2;
    viewportTransform.y = centerY * viewportTransform.scale + ctx.canvas.height/2;
    render(e);
});


render();