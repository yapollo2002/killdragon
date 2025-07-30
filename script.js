// --- Element Selection ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// --- Game State & Images ---
const gridSize = 11;
let cellSize;
let gameOver = false;
let gameInterval; // To hold the dragon's movement timer

// Player will now have its position set randomly at the start
const player = { x: 0, y: 0 };

// NEW: A single dragon object with more properties
const dragon = {
    x: 0,
    y: 0,
    alive: true,
    // The top-left corner of its 3x3 patrol zone
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
    draw();
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

    // Draw the item pictograms on the map if the player is on top
    for (const [key, item] of itemMap.entries()) {
        const [x, y] = key.split(',').map(Number);
        if (player.x === x && player.y === y) {
            ctx.drawImage(item.image, x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Draw the dragon (if alive) and the player
    if (dragon.alive) {
        ctx.drawImage(dragonImage, dragon.x * cellSize, dragon.y * cellSize, cellSize, cellSize);
    }
    ctx.drawImage(playerImage, player.x * cellSize, player.y * cellSize, cellSize, cellSize);

    // Draw win screen
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${cellSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
    }
}

// --- NEW: Dragon Movement Logic ---
function moveDragon() {
    if (!dragon.alive || gameOver) return;

    // Pick a random direction: -1 (left/up), 0 (stay), or 1 (right/down)
    const moveX = Math.floor(Math.random() * 3) - 1;
    const moveY = Math.floor(Math.random() * 3) - 1;

    const newX = dragon.x + moveX;
    const newY = dragon.y + moveY;

    // Check if the new position is INSIDE the 3x3 patrol zone
    if (newX >= dragon.zoneX && newX < dragon.zoneX + 3 &&
        newY >= dragon.zoneY && newY < dragon.zoneY + 3) {
        dragon.x = newX;
        dragon.y = newY;
    }
    // No "else" needed - if the move is invalid, the dragon just waits for the next turn.

    draw(); // Redraw the game after the dragon moves
}


// --- GAME LOGIC FUNCTIONS ---
function handleMove(dx, dy) {
    if (gameOver) return;
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX;
        player.y = newY;
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

    // UPDATED: Slaying logic for a single dragon
    if (dragon.alive && collectedItemTypes.size === allItemTypes.length) {
        // If player moves onto the dragon's square
        if (player.x === dragon.x && player.y === dragon.y) {
            dragon.alive = false; // The dragon is defeated!
            gameOver = true;     // You win!
            clearInterval(gameInterval); // Stop the dragon from moving
        }
    }
    draw();
}

function updateStatus() {
    if (collectedItemTypes.has('wire')) document.getElementById('icon-wire').style.display = 'inline';
    if (collectedItemTypes.has('stick')) document.getElementById('icon-stick').style.display = 'inline';
    if (collectedItemTypes.has('stone')) document.getElementById('icon-stone').style.display = 'inline';
}

// --- STARTUP LOGIC ---
function setupGame() {
    // 1. Set a random 3x3 patrol zone for the dragon
    // Max starting corner is 8 (so the 3x3 zone ends at 10)
    dragon.zoneX = Math.floor(Math.random() * (gridSize - 2));
    dragon.zoneY = Math.floor(Math.random() * (gridSize - 2));

    // 2. Place the dragon randomly within its zone
    dragon.x = dragon.zoneX + Math.floor(Math.random() * 3);
    dragon.y = dragon.zoneY + Math.floor(Math.random() * 3);

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
    // Start the dragon's movement timer
    gameInterval = setInterval(moveDragon, 1000); // The dragon moves every 1 second
}

function loadImage(imageObject, src) {
    return new Promise((resolve, reject) => {
        imageObject.onload = () => resolve(imageObject);
        imageObject.onerror = reject;
        imageObject.src = src;
    });
}

// Load all images before starting
Promise.all([
    loadImage(playerImage, 'player.png'),
    loadImage(dragonImage, 'dragon.png'),
    loadImage(wireImage, 'wire.png'),
    loadImage(stickImage, 'stick.png'),
    loadImage(stoneImage, 'stone.png'),
    loadImage(grassImage, 'grass.png')
]).then(() => {
    console.log("All images loaded successfully!");
    setupGame();
    // Activate controls
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