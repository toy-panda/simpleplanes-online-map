const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const sidebar = document.querySelector('#sidebar');

import { islands } from './modules/islands.js'
import { icons } from './modules/icons.js'

let isMobile = window.innerWidth < 780;

if (isMobile == true) {
    ctx.canvas.height = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
}

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
]

const drawMaps = () => {
    Object.keys(islands).forEach(element => {
        ctx.drawImage(islands[element].img, 
            islands[element].offset.x,
            islands[element].offset.y,
            islands[element].img.naturalWidth * islands[element].scale.width,
            islands[element].img.naturalHeight * islands[element].scale.height);
    });
}

const drawPathes = (k) => {
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
    if (k < 0.025) {k = 0.025}
    Object.keys(icons).forEach(element => {

        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type == icons[element].type && (layers[i].enabled == false)) {
                return;
            }
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

const drawCoordinates = (xpos, ypos, k) => {
    ctx.font = `bold ${18/k}px monospace`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`X: ${Math.round(xpos/k)}`, (xpos+10)/k, (ypos-40)/k);
    ctx.fillText(`Y: ${Math.round(-ypos/k)}`, (xpos+10)/k, (ypos-20)/k);
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(viewportTransform.scale, 0, 0, viewportTransform.scale, viewportTransform.x, viewportTransform.y);

    drawMaps();
    if (layers[0].enabled) {drawAxis(viewportTransform.scale);}
    if (layers[4].enabled) {drawPathes(viewportTransform.scale);}
    drawIcons(viewportTransform.scale);
    if (layers[1].enabled) {drawCoordinates(e.clientX - viewportTransform.x, e.clientY - viewportTransform.y, viewportTransform.scale);}
    
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
    console.log(e);
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
    console.log(1)
    layers.forEach(element => {
        if (element.name == e.target.id) {
            element.enabled = !element.enabled;
        }
    });
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
})


document.querySelector("#menu-mobile").addEventListener('click', () => {
    sidebar.style.width = "100%";
})
  
document.querySelector(".close-menu").addEventListener('click', () => {
    sidebar.style.width = "0";
})

render();