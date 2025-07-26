// --- Element Selection ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status');

// --- Game State & Images ---
const gridSize = 11;
let cellSize; // This will be calculated in the resize function
const player = { x: 5, y: 5 };
const dragonImage = new Image();
const playerImage = new Image();

// This function synchronizes the drawing surface with the CSS size
function resizeCanvas() {
    // Get the actual size of the canvas element from CSS
    const size = canvas.clientWidth;

    // Set the canvas's internal drawing buffer to be the same square size
    canvas.width = size;
    canvas.height = size;

    // Recalculate the size of each cell
    cellSize = canvas.width / gridSize;

    // Redraw the game with the new sizes
    draw();
    console.log("Canvas resized and redrawn.");
}

// --- CORE DRAWING FUNCTION ---
function draw() {
    if (!cellSize) return; // Don't draw if the size hasn't been calculated yet

    // Draw checkerboard background
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if ((row + col) % 2 === 0) {
                ctx.fillStyle = '#6b8e23'; // Olive green
            } else {
                ctx.fillStyle = '#f0e68c'; // Khaki yellow
            }
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Draw grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    // Draw images
    ctx.drawImage(dragonImage, 0 * cellSize, 0 * cellSize, cellSize, cellSize);
    ctx.drawImage(dragonImage, (gridSize - 1) * cellSize, 0 * cellSize, cellSize, cellSize);
    ctx.drawImage(dragonImage, 0 * cellSize, (gridSize - 1) * cellSize, cellSize, cellSize);
    ctx.drawImage(dragonImage, (gridSize - 1) * cellSize, (gridSize - 1) * cellSize, cellSize, cellSize);
    ctx.drawImage(playerImage, player.x * cellSize, player.y * cellSize, cellSize, cellSize);
}

// --- MOVEMENT FUNCTION ---
function handleMove(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX;
        player.y = newY;
    }
    draw();
}

// --- STARTUP LOGIC ---
console.log("Script started. Loading images...");
playerImage.src = 'player.png';
dragonImage.src = 'dragon.png';

window.onload = () => {
    console.log("Window.onload event fired.");
    if (playerImage.width === 0 || dragonImage.width === 0) {
        alert("Could not load images. Check that player.png and dragon.png are correct.");
        return;
    }

    // Perform the initial resize and draw
    resizeCanvas();

    // Activate controls
    console.log("Activating controls.");
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp': handleMove(0, -1); break;
            case 'ArrowDown': handleMove(0, 1); break;
            case 'ArrowLeft': handleMove(-1, 0); break;
            case 'ArrowRight': handleMove(1, 0); break;
        }
    });

    document.getElementById('up-btn').onclick = () => handleMove(0, -1);
    document.getElementById('down-btn').onclick = () => handleMove(0, 1);
    document.getElementById('left-btn').onclick = () => handleMove(-1, 0);
    document.getElementById('right-btn').onclick = () => handleMove(1, 0);
};

// Also resize the canvas if the user rotates their phone or changes the window size
window.onresize = resizeCanvas;