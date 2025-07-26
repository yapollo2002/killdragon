// --- Element Selection ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status');

// --- NEW: Image Loading ---
// Create new Image objects to hold our pictograms
const playerImage = new Image();
const dragonImage = new Image();

// Set the source of the images to the files you just saved
playerImage.src = 'player.png';
dragonImage.src = 'dragon.png';

// --- Game State Variables ---
const gridSize = 11;
let cellSize = canvas.width / gridSize;
let gameOver = false;

// The player object no longer needs a 'color' property
const player = { x: 5, y: 5 };
let dragons = [
    { x: 0, y: 0 }, { x: gridSize - 1, y: 0 },
    { x: 0, y: gridSize - 1 }, { x: gridSize - 1, y: gridSize - 1 }
];
const itemMap = new Map();
const collectedItemTypes = new Set();
const allItemTypes = ['wire', 'stink', 'stone'];

// --- Global Function for Movement ---
function handleMove(dx, dy) {
    if (gameOver) return;
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX;
        player.y = newY;
    }
    const playerPosKey = `${player.x},${player.y}`;
    if (itemMap.has(playerPosKey)) {
        const item = itemMap.get(playerPosKey);
        if (!item.discovered) {
            item.discovered = true;
            collectedItemTypes.add(item.type);
            updateStatus();
        }
    }
    if (collectedItemTypes.size === allItemTypes.length) {
        const dragonIndex = dragons.findIndex(d => d.x === player.x && d.y === player.y);
        if (dragonIndex > -1) {
            dragons.splice(dragonIndex, 1);
            if (dragons.length === 0) {
                gameOver = true;
            }
        }
    }
    draw();
}

// --- Other Game Functions ---
function updateStatus() {
    const itemsText = [...collectedItemTypes].map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(', ');
    statusDisplay.textContent = collectedItemTypes.size > 0 ? `Items Collected: ${itemsText}` : 'Items Collected: None';
    if (collectedItemTypes.size === allItemTypes.length) {
        statusDisplay.textContent += ' - You can now defeat dragons!';
        statusDisplay.style.color = '#28a745';
    }
}

function draw() {
    cellSize = canvas.width / gridSize;
    ctx.fillStyle = '#2a5d2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    // --- MODIFIED: Draw Dragons ---
    // Instead of fillRect, we now use drawImage for the dragons
    dragons.forEach(dragon => {
        ctx.drawImage(dragonImage, dragon.x * cellSize, dragon.y * cellSize, cellSize, cellSize);
    });

    // --- MODIFIED: Draw Player ---
    // We also use drawImage for the player now
    ctx.drawImage(playerImage, player.x * cellSize, player.y * cellSize, cellSize, cellSize);

    const playerPosKey = `${player.x},${player.y}`;
    if (itemMap.has(playerPosKey)) {
        const item = itemMap.get(playerPosKey);
        ctx.fillStyle = 'blue';
        ctx.font = `bold ${cellSize * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(item.type, player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 1.5);
    }
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${cellSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
    }
}

function setupGame() {
    allItemTypes.forEach(type => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            if (!dragons.some(d => d.x === x && d.y === y) && !(player.x === x && player.y === y) && !itemMap.has(`${x},${y}`)) {
                itemMap.set(`${x},${y}`, { type, discovered: false });
                placed = true;
            }
        }
    });
    resizeCanvas();
}

function resizeCanvas() {
    const size = canvas.clientWidth;
    canvas.width = size;
    canvas.height = size;
    draw();
}

// --- Event Listeners ---
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': handleMove(0, -1); break;
        case 'ArrowDown': handleMove(0, 1); break;
        case 'ArrowLeft': handleMove(-1, 0); break;
        case 'ArrowRight': handleMove(1, 0); break;
    }
});
window.addEventListener('resize', resizeCanvas);

// --- MODIFIED: Initial Game Start ---
// We need to wait for the images to load before we start the game.
let imagesLoaded = 0;
function onImageLoad() {
    imagesLoaded++;
    // Once both images are loaded, set up and start the game
    if (imagesLoaded === 2) {
        setupGame();
    }
}

// Tell the images to call onImageLoad() when they are ready
playerImage.onload = onImageLoad;
dragonImage.onload = onImageLoad;
