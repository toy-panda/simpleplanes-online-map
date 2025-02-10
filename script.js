const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
// const offscreenCanvas = document.createElement('canvas');
const offscreenCanvas = document.getElementById('offscreenCanvas');
const offscreenCtx = offscreenCanvas.getContext('2d');


const sidebar = document.querySelector('#sidebar');

import { islands } from './modules/islands.js'
import { heightmaps } from './modules/heightmaps.js'
import { icons } from './modules/icons.js'

let isMobile = window.innerWidth < 780;

if (isMobile == true) {
    ctx.canvas.height = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
}

offscreenCtx.canvas.height = window.innerHeight;
offscreenCtx.canvas.width = window.innerWidth;

const viewportTransform = {
    x: 0,
    y: 0,
    scale: 0.1
}

let layers = [
    {
        name: "displayAxis",
        type: "axis",
        enabled: true
    },
    {
        name: "displayCoordinates",
        type: "coordinates",
        enabled: true
    },
    {
        name: "displayAirports",
        type: "airport",
        enabled: true
    },
    {
        name: "displayDocks",
        type: "anchor",
        enabled: true
    },
    {
        name: "displayShips",
        type: "ship",
        enabled: true
    },
    {
        name: "displayDesktop",
        enabled: true
    },
    {
        name: "displayXYZ",
        enabled: true
    }
]

let path = []

const drawMaps = () => {
    Object.keys(islands).forEach(element => {
        if (layers[5].enabled == false) {
            if (islands[element].desktopOnly == true) {return;}
        }
        ctx.drawImage(islands[element].img, 
            islands[element].offset.x,
            islands[element].offset.y,
            islands[element].img.naturalWidth * islands[element].scale.width,
            islands[element].img.naturalHeight * islands[element].scale.height);
    });
}

const drawHeightmaps = () => {
    Object.keys(heightmaps).forEach(element => {
        if (layers[5].enabled == false) {
            if (heightmaps[element].desktopOnly == true) {return;}
        }
        // ctx.drawImage(heightmaps[element].img, 
        //     heightmaps[element].offset.x,
        //     heightmaps[element].offset.y,
        //     heightmaps[element].img.naturalWidth * heightmaps[element].scale.width,
        //     heightmaps[element].img.naturalHeight * heightmaps[element].scale.height);
        offscreenCtx.drawImage(heightmaps[element].img, 
            heightmaps[element].offset.x,
            heightmaps[element].offset.y,
            heightmaps[element].img.naturalWidth * heightmaps[element].scale.width,
            heightmaps[element].img.naturalHeight * heightmaps[element].scale.height);   
    });

    
}

const drawShipPath = (k) => {
    // USS Tiny
    ctx.setLineDash([7/k, 4/k]);
    ctx.beginPath();
    ctx.strokeStyle = "rgb(59, 160, 255)";
    ctx.moveTo(icons.USSTiny.position.x, icons.USSTiny.position.y);
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

    ctx.setLineDash([]);
}

const drawIcons = (k) => {
    Object.keys(icons).forEach(element => {
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type == icons[element].type && (layers[i].enabled == false)) {
                return;
            }
        }
        if (layers[5].enabled == false) {
            if (icons[element].desktopOnly == true) {return;}
        }
        if (icons[element].type != "kraken" && icons[element].type != "brownPearl") {
            if (k < 0.025) {k = 0.025}
            //console.log(icons[element].type)
        }
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
    const axis = document.getElementById("axis");
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

function getZData(xpos, ypos, cx, cy, k) {
    const pixel = offscreenCtx.getImageData(cx, cy, 1, 1).data;
    const r = pixel[0];

    const KrakabloaCenter = getCenter(islands.Krakabloa);
    let distKrakabloa = Math.hypot(
        KrakabloaCenter.x + xpos/k,
        KrakabloaCenter.y + ypos/k);

    if (distKrakabloa < 12000) {
        return r * (2346 / 255);
    } else {
        return 0;
    }
}

function getCenter(isalnd) {
    const x = -isalnd.offset.x - (isalnd.img.naturalWidth * isalnd.scale.width)/2;
    const y = -isalnd.offset.y - (isalnd.img.naturalHeight * isalnd.scale.height)/2;
    return {x:x, y:y}
}

const drawCoordinates = (xpos, ypos, cx, cy, k) => {
    const zpos = getZData(xpos, ypos, cx, cy, k);
    ctx.font = `bold ${18/k}px monospace`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    if (layers[6].enabled == true) {
        ctx.fillText(`X: ${Math.round(xpos/k)}`, (xpos+10)/k, (ypos-60)/k);
        ctx.fillText(`Y: ${Math.round(-ypos/k)}`, (xpos+10)/k, (ypos-40)/k);
        ctx.fillText(`Z: ${Math.round(zpos)}`, (xpos+10)/k, (ypos-20)/k);
    } else {
        ctx.fillText(`Long: ${Math.round(xpos/k)}`, (xpos+10)/k, (ypos-60)/k);
        ctx.fillText(`Lat : ${Math.round(-ypos/k)}`, (xpos+10)/k, (ypos-40)/k);
        ctx.fillText(`Alt : ${Math.round(zpos)}`, (xpos+10)/k, (ypos-20)/k);
    }
    
}

const drawPointer = (xpos, ypos, k) => {
    const pointer = document.getElementById("pointer");
    ctx.drawImage(pointer, 
        (xpos-25)/k, 
        (ypos-25)/k, 
        50/k, 
        50/k);

}

const render = (e) => {
    // offscreenCtx
    offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    offscreenCtx.setTransform(viewportTransform.scale, 0, 0, viewportTransform.scale, viewportTransform.x, viewportTransform.y);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(viewportTransform.scale, 0, 0, viewportTransform.scale, viewportTransform.x, viewportTransform.y);

    drawHeightmaps();
    drawMaps();
    // drawHeightmaps();
    
    if (layers[0].enabled) {drawAxis(viewportTransform.scale);}
    if (layers[4].enabled) {drawShipPath(viewportTransform.scale);}
    drawIcons(viewportTransform.scale);
    drawPath();
    drawMeasure();
    if (layers[1].enabled) {drawCoordinates(e.clientX - viewportTransform.x, e.clientY - viewportTransform.y, e.clientX, e.clientY, viewportTransform.scale);}

    if (!isMobile) {
        if (ctx.canvas.height != sidebar.offsetHeight) {
            ctx.canvas.height = sidebar.offsetHeight;
            ctx.canvas.width = window.innerWidth - sidebar.offsetWidth;
        }
    }

    if (isMobile) {
        drawPointer(e.clientX - viewportTransform.x, e.clientY - viewportTransform.y, viewportTransform.scale);
    }
}


let previousX = 0, previousY = 0;

const updatePanning = (e) => {
    if (Date.now() - lastTouchmove <= 100) {return;}
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

const updateZoomingMobile = (targetX,targetY,d) => {

    const oldX = viewportTransform.x;
    const oldY = viewportTransform.y;

    const localX = targetX;
    const localY = targetY;

    const previousScale = viewportTransform.scale;
    const newScaleX = viewportTransform.scale + d * -0.01

    if (previousScale <= 0.01) {
        if (newScaleX-previousScale < 0) { return; }
    }

    if (previousScale >= 5) {
        if (newScaleX-previousScale > 0) { return; }
    }

    let delta = d;

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

/* ================= Desktop events ================= */

const onMouseMove = (e) => {
    updatePanning(e);
    render(e);
}

const onMouseWheel = (e) => {
    updateZooming(e)
    render(e)
}

canvas.addEventListener("wheel", onMouseWheel);

canvas.addEventListener("mousedown", (e) => {
    previousX = e.clientX;
    previousY = e.clientY;
    if (drawPathMode == true || drawMeasureMode == true) { touchStartRecord = Date.now(); }
    canvas.addEventListener("mousemove", onMouseMove);
})

canvas.addEventListener("mouseup", (e) => {
    if (drawPathMode == true) { 
        if (Date.now() - touchStartRecord <= 200) {
            addPointToPath(e);
        }
    }
    if (drawMeasureMode == true) { 
        if (Date.now() - touchStartRecord <= 200) {
            addPointToMeasure(e);
        }
    }
    canvas.removeEventListener("mousemove", onMouseMove);
})

canvas.addEventListener("mousemove", (e) => {
    render(e);
})

canvas.addEventListener('click', (e) => {
    render(e);
})


/* ================= Mobile events ================= */

canvas.addEventListener('touchstart', (e) => {
    previousX = e.touches[0].clientX;
    previousY = e.touches[0].clientY;
    canvas.addEventListener('touchmove', onTouchMove);
});

canvas.addEventListener('touchend', (e) => {
    canvas.removeEventListener("mousemove", onTouchMove);
});

let prevDist = 0;
const debug = document.querySelector('#debug');

let lastTouchmove;

const onTouchMove = (e) => {
    //console.log(e);
    if (e.touches.length == 2) {
        e.preventDefault();
        const midX = (e.touches[0].clientX + e.touches[1].clientX)/2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY)/2;
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY);
        let diff = prevDist - dist;
        if (diff >= 5) { diff = 5 }
        if (diff <= -5) { diff = -5 }
        prevDist = dist;
        updateZoomingMobile(midX, midY, diff);
        lastTouchmove = Date.now();
        render(e);
        return;
    }
    updatePanning(e.touches[0]);
    render(e.touches[0]);
}


// Layers checkbox handler
document.querySelector(".layers-wrapper").addEventListener('click', (e) => {
    const isButton = e.target.nodeName === 'INPUT';
    if (!isButton) { return; }
    //console.log(1)
    layers.forEach(element => {
        if (element.name == e.target.id) {
            element.enabled = !element.enabled;
        }
    });
    document.querySelector("#MW").disabled = !layers[5].enabled;
    document.querySelector("#KR").disabled = !layers[5].enabled;
    render(e);
})

// Navigation buttons handler
document.querySelector('.btns').addEventListener('click', (e) => {
    const isButton = e.target.nodeName === 'INPUT';
    if (!isButton) { return; }
    Object.keys(islands).forEach(element => {
        if (islands[element].name == e.target.value) {
            const targetIsland = islands[element];
            const centerX = -targetIsland.offset.x - (targetIsland.img.naturalWidth * targetIsland.scale.width)/2;
            const centerY = -targetIsland.offset.y - (targetIsland.img.naturalHeight * targetIsland.scale.height)/2;
            viewportTransform.x = centerX * viewportTransform.scale + ctx.canvas.width/2;
            viewportTransform.y = centerY * viewportTransform.scale + ctx.canvas.height/2;
            render(e);
        }
    });
    Object.keys(icons).forEach(element => {
        if (icons[element].name == e.target.value) {
            const targetIsland = icons[element];
            const centerX = -targetIsland.position.x;
            const centerY = -targetIsland.position.y;
            viewportTransform.x = centerX * viewportTransform.scale + ctx.canvas.width/2;
            viewportTransform.y = centerY * viewportTransform.scale + ctx.canvas.height/2;
            render(e);
        }
    });
})


document.querySelector("#menu-mobile").addEventListener('click', () => {
    sidebar.style.width = "100%";
})
  
document.querySelector(".close-menu").addEventListener('click', () => {
    sidebar.style.width = "0";
})

/* ================= Tools: Path Builder ================= */

let drawPathMode = false;
let touchStartRecord = 0;

document.querySelector("#draw-path").addEventListener('click', () => {
    const measureBuilderWindow = document.querySelector(".measureBuilder");
    measureBuilderWindow.style.display = "none";
    document.querySelector("#draw-measure").style.opacity = 0.5;
    document.querySelector("#draw-measure").style.outline = "0px solid white";
    drawMeasureMode = false;

    const dialogWindow = document.querySelector(".pathBuilder");
    if (dialogWindow.style.display == "none" || dialogWindow.style.display == "") {
        dialogWindow.style.display = "flex";
        document.querySelector("#draw-path").style.opacity = 1;
        document.querySelector("#draw-path").style.outline = "2px solid white";
        drawPathMode = true;
    } else if (dialogWindow.style.display == "flex") {
        dialogWindow.style.display = "none";
        document.querySelector("#draw-path").style.opacity = 0.5;
        document.querySelector("#draw-path").style.outline = "0px solid white";
        drawPathMode = false;
    }
})

document.querySelector("#undo-path").addEventListener('click', (e) => {
    path.pop();
    document.querySelector("#pathOutput").innerHTML = ""
    path.forEach(element => {
        document.querySelector("#pathOutput").innerHTML += `[${path.indexOf(element)+1}] X: ${element.x}, Y: ${element.y}<br>`;
    })
    render(e);
});

document.querySelector("#clear-path").addEventListener('click', (e) => {
    path = [];
    document.querySelector("#pathOutput").innerHTML = "Add points by clicking on the map";
    render(e);
});

document.querySelector("#copy-path").addEventListener('click', async () => {
    const textToCopy = JSON.stringify(path).toString();
    navigator.clipboard.writeText(textToCopy);
});

function addPointToPath(e) {
    let pointX = Math.round((e.clientX - viewportTransform.x)/viewportTransform.scale);
    let pointY = Math.round(-(e.clientY - viewportTransform.y)/viewportTransform.scale);
    let pointZ = Math.round(getZData(e.clientX - viewportTransform.x, e.clientY - viewportTransform.y, e.clientX, e.clientY, viewportTransform.scale));
    path.push({x:pointX, y:pointY, z:pointZ})
    if (path.length == 1) {document.querySelector("#pathOutput").innerHTML = ""}
    document.querySelector("#pathOutput").innerHTML += `[${path.length}] X: ${pointX}, Y: ${pointY}, Z: ${pointZ}<br>`;
}

function drawPath() {
    let k = viewportTransform.scale;
    path.forEach(element => {
        if (path.length > 1 && path.indexOf(element) != path.length - 1) {
            ctx.beginPath();
            ctx.strokeStyle = "rgb(255, 59, 59)";
            ctx.moveTo(element.x, -element.y);
            ctx.lineTo(path[path.indexOf(element)+1].x, -path[path.indexOf(element)+1].y);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(element.x, -element.y, 4/k, 0, 2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.font = `${15/k}px monospace`;
        ctx.fillStyle = "red";
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3/k;
        ctx.strokeText(path.indexOf(element) + 1, 
            element.x, 
            -element.y - 15/k);
        ctx.fillText(path.indexOf(element) + 1, 
            element.x, 
            -element.y - 15/k);
    });
    
}

/* ================= Tools: Measure Builder ================= */

let drawMeasureMode = false;
let measurePoints = [];

document.querySelector("#draw-measure").addEventListener('click', () => {
    const pathBuilderWindow = document.querySelector(".pathBuilder");
    pathBuilderWindow.style.display = "none";
    document.querySelector("#draw-path").style.opacity = 0.5;
    document.querySelector("#draw-path").style.outline = "0px solid white";
    drawPathMode = false;

    const dialogWindow = document.querySelector(".measureBuilder");
    if (dialogWindow.style.display == "none" || dialogWindow.style.display == "") {
        dialogWindow.style.display = "flex";
        document.querySelector("#draw-measure").style.opacity = 1;
        document.querySelector("#draw-measure").style.outline = "2px solid white";
        drawMeasureMode = true;
    } else if (dialogWindow.style.display == "flex") {
        dialogWindow.style.display = "none";
        document.querySelector("#draw-measure").style.opacity = 0.5;
        document.querySelector("#draw-measure").style.outline = "0px solid white";
        drawMeasureMode = false;
    }
})

function addPointToMeasure(e) {
    let pointX = Math.round((e.clientX - viewportTransform.x)/viewportTransform.scale);
    let pointY = Math.round(-(e.clientY - viewportTransform.y)/viewportTransform.scale);
    if (measurePoints.length < 2) {
        measurePoints.push({x:pointX, y:pointY})
    }
    console.log(measurePoints)
    if (measurePoints.length == 1) {document.querySelector("#measureOutput").innerHTML = "Put the END point on the map"};
    if (measurePoints.length == 2) {
        const distance = Math.hypot(
            measurePoints[0].x - measurePoints[1].x,
            measurePoints[0].y - measurePoints[1].y);
        const heading12 = Math.atan2(
            0 - (-100 * (measurePoints[0].x - measurePoints[1].x)),
            0 + (-100 * (measurePoints[0].y - measurePoints[1].y)),
        );
        const heading21 = Math.atan2(
            0 - (-100 * (measurePoints[1].x - measurePoints[0].x)),
            0 + (-100 * (measurePoints[1].y - measurePoints[0].y)),
        );
        console.log(distance)
        document.querySelector("#measureOutput").innerHTML = `
            [Point 1] X:${measurePoints[0].x} Y:${measurePoints[0].y}<br>
            [Point 2] X:${measurePoints[1].x} Y:${measurePoints[1].y}<br>
            <hr>
            [Distance]    ${(distance/1000).toFixed(3)}km | ${(distance/1000*0.621371).toFixed(3)}mi<br>
            [X Component] ${(Math.abs(measurePoints[1].x-measurePoints[0].x)/1000).toFixed(3)}km | ${(Math.abs(measurePoints[1].x-measurePoints[0].x)/1000*0.621371).toFixed(3)}mi<br>
            [Y Component] ${(Math.abs(measurePoints[1].y-measurePoints[0].y)/1000).toFixed(3)}km | ${(Math.abs(measurePoints[1].y-measurePoints[0].y)/1000*0.621371).toFixed(3)}mi<br>
            <hr>
            [Heading 1 → 2] ${mod(heading12 * (180 / Math.PI)).toFixed(3)}°<br>
            [Heading 2 → 1] ${mod(heading21 * (180 / Math.PI)).toFixed(3)}°<br>
        `};
}

document.querySelector("#clear-measure").addEventListener('click', (e) => {
    measurePoints = [];
    document.querySelector("#measureOutput").innerHTML = "Put the START point on the map";
    render(e);
});

function drawMeasure() {
    let k = viewportTransform.scale;
    measurePoints.forEach(element => {
        if (measurePoints.length == 2) {
            ctx.beginPath();
            ctx.strokeStyle = "rgb(255, 59, 209)";
            ctx.moveTo(measurePoints[0].x, -measurePoints[0].y);
            ctx.lineTo(measurePoints[1].x, -measurePoints[1].y);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(element.x, -element.y, 4/k, 0, 2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "rgb(255, 59, 209)";
        ctx.fill();

        ctx.font = `${15/k}px monospace`;
        ctx.fillStyle = "rgb(255, 59, 209)";
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3/k;
        ctx.strokeText(measurePoints.indexOf(element) + 1, 
            element.x, 
            -element.y - 15/k);
        ctx.fillText(measurePoints.indexOf(element) + 1, 
            element.x, 
            -element.y - 15/k);
    });
    
}

function mod(a) {
    a = -a
    if (a < 0) {
        a += 360
    }
    return a;
}


render();