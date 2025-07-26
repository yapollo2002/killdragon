// --- Element Selection ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status');

// --- Game State & Images ---
const gridSize = 11;
const cellSize = canvas.width / gridSize;
const player = { x: 5, y: 5 };
const dragonImage = new Image();
const playerImage = new Image();

// --- THE CORE DRAWING FUNCTION ---
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- THIS IS THE NEW PART ---
    // Draw checkerboard background
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Check if the sum of row and col is even or odd
            if ((row + col) % 2 === 0) {
                ctx.fillStyle = '#6b8e23'; // An olive green color
            } else {
                ctx.fillStyle = '#f0e68c'; // A pale yellow (khaki) color
            }
            // Draw the colored square for the cell
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Draw grid lines on top of the colored squares
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    // Draw the images (this part is unchanged)
    ctx.drawImage(dragonImage, 0 * cellSize, 0 * cellSize, cellSize, cellSize);
    ctx.drawImage(dragonImage, (gridSize - 1) * cellSize, 0 * cellSize, cellSize, cellSize);
    ctx.drawImage(dragonImage, 0 * cellSize, (gridSize - 1) * cellSize, cellSize, cellSize);
    ctx.drawImage(dragonImage, (gridSize - 1) * cellSize, (gridSize - 1) * cellSize, cellSize, cellSize);
    ctx.drawImage(playerImage, player.x * cellSize, player.y * cellSize, cellSize, cellSize);

    console.log("Draw function completed successfully.");
}

// --- MOVEMENT FUNCTION ---
function handleMove(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX;
        player.y = newY;
    }
    // After every move, redraw the board
    draw();
}

// --- STARTUP LOGIC ---
console.log("Script started. Loading images...");

// Set the image sources
playerImage.src = 'player.png';
dragonImage.src = 'dragon.png';

// Use window.onload as the absolute final authority.
window.onload = () => {
    console.log("Window.onload event fired. All assets should be ready.");

    if (playerImage.width === 0 || dragonImage.width === 0) {
        console.error("Images have loaded but have no size. Check the image files.");
        alert("Could not load player/dragon images. Please check the files are not corrupted.");
        return;
    }

    console.log("Images confirmed ready. Performing initial draw.");
    draw();

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