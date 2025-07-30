// --- Element Selection ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// --- Game State & Images ---
const gridSize = 11;
let cellSize;
let gameOver = false;
let dragonDecisionInterval; // Timer for the dragon to CHOOSE where to go next

const player = { x: 0, y: 0 };

const dragon = {
    gridX: 0,       // The grid square it's on
    gridY: 0,
    pixelX: 0,      // The actual pixel position on the canvas for smooth movement
    pixelY: 0,
    targetX: 0,     // The pixel position it's moving towards
    targetY: 0,
    speed: 1,       // How many pixels it moves per frame (lower is slower)
    isMoving: false,
    alive: true,
    zoneX: 0,
    zoneY: 0
};

const itemMap = new Map();
const collectedItemTypes = new Set();
const allItemTypes = ['wire', 'stick', 'stone'];

const playerImage = new Image();
const dragonImage = new Image();
const wireImage = new Image();
const stickImage = new Image();
const stoneImage = new Image();
const grassImage = new Image();

const itemImages = {
    wire: wireImage,
    stick: stickImage,
    stone: stoneImage
};

// This function synchronizes the drawing surface with the CSS size
function resizeCanvas() {
    const size = canvas.clientWidth;
    canvas.width = size;
    canvas.height = size;
    cellSize = canvas.width / gridSize;

    // Update dragon's pixel positions based on new cellSize
    dragon.pixelX = dragon.gridX * cellSize;
    dragon.pixelY = dragon.gridY * cellSize;
    dragon.targetX = dragon.gridX * cellSize; // Reset target to current grid position
    dragon.targetY = dragon.gridY * cellSize;
    dragon.isMoving = false; // Stop ongoing movement during resize

    draw();
}

// --- NEW: Main Game Loop ---
function gameLoop() {
    if (gameOver) {
        drawWinScreen();
        return;
    }

    // --- Dragon Animation Logic ---
    if (dragon.isMoving && dragon.alive) {
        const dx = dragon.targetX - dragon.pixelX;
        const dy = dragon.targetY - dragon.pixelY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < dragon.speed) {
            dragon.pixelX = dragon.targetX;
            dragon.pixelY = dragon.targetY;
            dragon.isMoving = false;
            dragon.gridX = Math.round(dragon.pixelX / cellSize);
            dragon.gridY = Math.round(dragon.pixelY / cellSize);
        } else {
            dragon.pixelX += (dx / distance) * dragon.speed;
            dragon.pixelY += (dy / distance) * dragon.speed;
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// --- NEW: Dragon Decision Logic ---
function decideDragonMove() {
    if (dragon.isMoving || !dragon.alive) return;

    // Pick a new random grid square within the 3x3 patrol zone
    const newGridX = dragon.zoneX + Math.floor(Math.random() * 3);
    const newGridY = dragon.zoneY + Math.floor(Math.random() * 3);

    if (newGridX !== dragon.gridX || newGridY !== dragon.gridY) {
        dragon.targetX = newGridX * cellSize;
        dragon.targetY = newGridY * cellSize;
        dragon.isMoving = true;
    }
}

// --- CORE DRAWING FUNCTION ---
function draw() {
    if (!cellSize) return;

    // Draw grass texture in each cell
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.drawImage(grassImage, col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Draw grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    // Draw the item pictograms that are on the map if the player is on top
    for (const [key, item] of itemMap.entries()) {
        const [x, y] = key.split(',').map(Number);
        if (player.x === x && player.y === y) {
            ctx.drawImage(item.image, x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Draw the dragon (if alive) and the player
    if (dragon.alive) {
        ctx.drawImage(dragonImage, dragon.pixelX, dragon.pixelY, cellSize, cellSize);
    }
    ctx.drawImage(playerImage, player.x * cellSize, player.y * cellSize, cellSize, cellSize);
}

function drawWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${cellSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
}

// --- GAME LOGIC FUNCTIONS ---
function handleMove(dx, dy) {
    if (gameOver) return;
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX;
        player.y = newY; // <--- THIS WAS THE MISSING LINE!
    }

    // Check for item discovery
    const playerPosKey = `${player.x},${player.y}`;
    if (itemMap.has(playerPosKey)) {
        const item = itemMap.get(playerPosKey);
        if (!item.discovered) {
            item.discovered = true;
            collectedItemTypes.add(item.type);
            updateStatus();
        }
    }

    // Check for slaying the dragon (based on grid positions)
    if (dragon.alive && collectedItemTypes.size === allItemTypes.length) {
        if (player.x === dragon.gridX && player.y === dragon.gridY) {
            dragon.alive = false;
            gameOver = true;
            clearInterval(dragonDecisionInterval);
        }
    }
    // No need to call draw() here, gameLoop will handle it.
}

function updateStatus() {
    if (collectedItemTypes.has('wire')) document.getElementById('icon-wire').style.display = 'inline';
    if (collectedItemTypes.has('stick')) document.getElementById('icon-stick').style.display = 'inline';
    if (collectedItemTypes.has('stone')) document.getElementById('icon-stone').style.display = 'inline';
}

// --- STARTUP LOGIC ---
function setupGame() {
    // Clear previous game state if restarting
    itemMap.clear();
    collectedItemTypes.clear();
    dragon.alive = true;
    gameOver = false;
    // Hide collected item icons on restart
    document.getElementById('icon-wire').style.display = 'none';
    document.getElementById('icon-stick').style.display = 'none';
    document.getElementById('icon-stone').style.display = 'none';

    // 1. Set a random 3x3 patrol zone for the dragon
    dragon.zoneX = Math.floor(Math.random() * (gridSize - 2));
    dragon.zoneY = Math.floor(Math.random() * (gridSize - 2));

    // 2. Place the dragon randomly within its zone
    dragon.gridX = dragon.zoneX + Math.floor(Math.random() * 3);
    dragon.gridY = dragon.zoneY + Math.floor(Math.random() * 3);

    // Initialize all pixel positions to match the starting grid position
    dragon.pixelX = dragon.gridX * cellSize;
    dragon.pixelY = dragon.gridY * cellSize;
    dragon.targetX = dragon.pixelX;
    dragon.targetY = dragon.pixelY;
    dragon.isMoving = false;

    // 3. Place the player randomly, making sure it's NOT in the dragon's zone
    do {
        player.x = Math.floor(Math.random() * gridSize);
        player.y = Math.floor(Math.random() * gridSize);
    } while (
        player.x >= dragon.zoneX && player.x < dragon.zoneX + 3 &&
        player.y >= dragon.zoneY && player.y < dragon.zoneY + 3
    );

    // 4. Place items, making sure they are not in the dragon's zone or on the player
    allItemTypes.forEach(type => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const isInDragonZone = x >= dragon.zoneX && x < dragon.zoneX + 3 && y >= dragon.zoneY && y < dragon.zoneY + 3;
            const isOnPlayer = player.x === x && player.y === y;

            if (!isInDragonZone && !isOnPlayer && !itemMap.has(`${x},${y}`)) {
                itemMap.set(`${x},${y}`, { type: type, image: itemImages[type], discovered: false });
                placed = true;
            }
        }
    });

    resizeCanvas();
    // Clear any existing dragon movement interval before starting a new one
    clearInterval(dragonDecisionInterval);
    dragonDecisionInterval = setInterval(decideDragonMove, 2500); // Dragon decides new target every 2.5 seconds
    updateStatus(); // Update status display to show "None"
}

function loadImage(imageObject, src) {
    return new Promise((resolve, reject) => {
        imageObject.onload = () => resolve(imageObject);
        imageObject.onerror = reject;
        imageObject.src = src;
    });
}

// Load all images before starting the game
Promise.all([
    loadImage(playerImage, 'player.png'),
    loadImage(dragonImage, 'dragon.png'),
    loadImage(wireImage, 'wire.png'),
    loadImage(stickImage, 'stick.png'),
    loadImage(stoneImage, 'stone.png'),
    loadImage(grassImage, 'grass.png')
]).then(() => {
    console.log("All images loaded successfully!");
    setupGame();    // Set up all game objects for the first time
    requestAnimationFrame(gameLoop); // Start the continuous animation loop!

    // Activate controls after everything is ready
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp': handleMove(0, -1); break;
            case 'ArrowDown': handleMove(0, 1); break;
            case 'ArrowLeft': handleMove(-1, 0); break;
            case 'ArrowRight': handleMove(1, 0); break;
        }
    });
    window.onresize = resizeCanvas;
}).catch(error => {
    console.error("Error loading images:", error);
    alert("Error loading game images. Make sure all .png files are in the correct folder.");
});