// --- Element Selection ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// --- Game State & Images ---
const gridSize = 11;
let cellSize;
let gameOver = false;
let dragonDecisionInterval;

// NEW: Game variables for lives and carrots
let playerLives = 0;
let carrots = []; // This will store the coordinates of each carrot
let canAttack = true; // A cooldown to prevent rapid damage to the dragon

const player = { x: 0, y: 0 };
const dragon = {
    gridX: 0, gridY: 0, pixelX: 0, pixelY: 0,
    targetX: 0, targetY: 0, speed: 1, isMoving: false,
    alive: true, zoneX: 0, zoneY: 0, lives: 3
};

// Create Image objects for all our game assets
const playerImage = new Image();
const dragonImage = new Image();
const grassImage = new Image();
const carrotImage = new Image();
const heartImage = new Image(); // For the dragon's health display

// This function synchronizes the drawing surface with the CSS size
function resizeCanvas() {
    const size = canvas.clientWidth;
    canvas.width = size;
    canvas.height = size;
    cellSize = canvas.width / gridSize;

    dragon.pixelX = dragon.gridX * cellSize;
    dragon.pixelY = dragon.gridY * cellSize;
    dragon.targetX = dragon.gridX * cellSize;
    dragon.targetY = dragon.gridY * cellSize;
    dragon.isMoving = false;

    draw();
}

// --- CORE DRAWING FUNCTION ---
function draw() {
    if (!cellSize) return;

    // Draw the tiled grass background
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.drawImage(grassImage, col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Lighter grid lines
    ctx.lineWidth = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    // Draw all visible carrots
    carrots.forEach(carrot => {
        ctx.drawImage(carrotImage, carrot.x * cellSize, carrot.y * cellSize, cellSize, cellSize);
    });

    // Draw the dragon (if alive) and the player
    if (dragon.alive) {
        ctx.drawImage(dragonImage, dragon.pixelX, dragon.pixelY, cellSize, cellSize);
    }
    ctx.drawImage(playerImage, player.x * cellSize, player.y * cellSize, cellSize, cellSize);

    // Draw the Heads-Up Display (HUD) for lives
    drawHUD();
}

function drawHUD() {
    // Draw player lives (carrots) in the top-left corner
    ctx.drawImage(carrotImage, 5, 5, cellSize * 0.75, cellSize * 0.75);
    ctx.fillStyle = "white";
    ctx.font = `bold ${cellSize * 0.5}px Arial`;
    ctx.textAlign = "left";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText(`: ${playerLives}`, cellSize * 0.75, cellSize * 0.6);
    ctx.fillText(`: ${playerLives}`, cellSize * 0.75, cellSize * 0.6);

    // Draw dragon lives (hearts) in the top-right corner
    for (let i = 0; i < dragon.lives; i++) {
        const xPos = canvas.width - (i + 1) * (cellSize * 0.6);
        ctx.drawImage(heartImage, xPos, 5, cellSize * 0.5, cellSize * 0.5);
    }
}

function drawWinScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = `bold ${cellSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
}

// --- DRAGON MOVEMENT ---
function gameLoop() {
    if (gameOver) {
        drawWinScreen();
        return; // Stop the loop if the game is won
    }
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

function decideDragonMove() {
    if (dragon.isMoving || !dragon.alive) return;
    const newGridX = dragon.zoneX + Math.floor(Math.random() * 3);
    const newGridY = dragon.zoneY + Math.floor(Math.random() * 3);
    if (newGridX !== dragon.gridX || newGridY !== dragon.gridY) {
        dragon.targetX = newGridX * cellSize;
        dragon.targetY = newGridY * cellSize;
        dragon.isMoving = true;
    }
}

// --- PLAYER MOVEMENT & ACTIONS ---
function handleMove(dx, dy) {
    if (gameOver) return;
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX;
        player.y = newY;
    }

    // Check for carrot collection
    const carrotIndex = carrots.findIndex(c => c.x === player.x && c.y === player.y);
    if (carrotIndex > -1) {
        carrots.splice(carrotIndex, 1); // Remove carrot from the array
        playerLives++; // Add a life
    }

    // Check for dragon collision
    if (dragon.alive && player.x === dragon.gridX && player.y === dragon.gridY && canAttack) {
        if (playerLives > 0) { // Can only attack if you have at least one life
            dragon.lives--;
            playerLives--; // Spending a life to attack
            canAttack = false; // Start attack cooldown
            setTimeout(() => { canAttack = true; }, 1000); // 1-second cooldown

            if (dragon.lives <= 0) {
                dragon.alive = false;
                gameOver = true;
                clearInterval(dragonDecisionInterval);
            }
        }
    }
}

// --- STARTUP LOGIC ---
function setupGame() {
    // Reset game state for a new game
    gameOver = false;
    playerLives = 0;
    carrots = [];
    dragon.lives = 3;
    dragon.alive = true;

    // Set a random 3x3 patrol zone for the dragon
    dragon.zoneX = Math.floor(Math.random() * (gridSize - 2));
    dragon.zoneY = Math.floor(Math.random() * (gridSize - 2));
    dragon.gridX = dragon.zoneX + Math.floor(Math.random() * 3);
    dragon.gridY = dragon.zoneY + Math.floor(Math.random() * 3);
    dragon.pixelX = dragon.gridX * cellSize;
    dragon.pixelY = dragon.gridY * cellSize;
    dragon.targetX = dragon.pixelX;
    dragon.targetY = dragon.pixelY;
    dragon.isMoving = false;

    // Place the player randomly
    do {
        player.x = Math.floor(Math.random() * gridSize);
        player.y = Math.floor(Math.random() * gridSize);
    } while (
        player.x >= dragon.zoneX && player.x < dragon.zoneX + 3 &&
        player.y >= dragon.zoneY && player.y < dragon.zoneY + 3
    );

    // Place 2 to 5 carrots randomly
    const carrotCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < carrotCount; i++) {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            const isInDragonZone = x >= dragon.zoneX && x < dragon.zoneX + 3 && y >= dragon.zoneY && y < dragon.zoneY + 3;
            const isOnPlayer = player.x === x && player.y === y;
            const isOccupied = carrots.some(c => c.x === x && c.y === y);
            if (!isInDragonZone && !isOnPlayer && !isOccupied) {
                carrots.push({ x, y });
                placed = true;
            }
        }
    }

    // Start dragon's decision timer
    clearInterval(dragonDecisionInterval);
    dragonDecisionInterval = setInterval(decideDragonMove, 2500);
}

// Loads a single image from a file and returns a Promise
function loadImage(imageObject, src) {
    return new Promise((resolve, reject) => {
        imageObject.onload = () => resolve(imageObject);
        imageObject.onerror = reject;
        imageObject.src = src;
    });
}

// Load all images from files before starting the game
Promise.all([
    loadImage(playerImage, 'player.png'),
    loadImage(dragonImage, 'dragon.png'),
    loadImage(grassImage, 'grass.png'),
    loadImage(carrotImage, 'carrot.png'),
    loadImage(heartImage, 'heart.png')
]).then(() => {
    console.log("All images loaded successfully!");
    resizeCanvas();
    setupGame();
    requestAnimationFrame(gameLoop);

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