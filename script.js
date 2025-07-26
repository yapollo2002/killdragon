// --- Element Selection ---
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');

// --- Game State & Images ---
const gridSize = 11;
let cellSize;
let gameOver = false;

const player = { x: 5, y: 5 };
let dragons = [
    { x: 0, y: 0 }, { x: gridSize - 1, y: 0 },
    { x: 0, y: gridSize - 1 }, { x: gridSize - 1, y: gridSize - 1 }
];
const itemMap = new Map();
const collectedItemTypes = new Set();
// THIS ARRAY HAS BEEN CHANGED
const allItemTypes = ['wire', 'stick', 'stone'];

// Create Image objects for all our pictograms
const playerImage = new Image();
const dragonImage = new Image();
const wireImage = new Image();
const stickImage = new Image(); // Changed from stinkImage
const stoneImage = new Image();

// THIS OBJECT HAS BEEN CHANGED
const itemImages = {
    wire: wireImage,
    stick: stickImage, // Changed from stink
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

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? '#6b8e23' : '#f0e68c';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
    }

    for (const [key, item] of itemMap.entries()) {
        const [x, y] = key.split(',').map(Number);
        if (player.x === x && player.y === y) {
            ctx.drawImage(item.image, x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    dragons.forEach(dragon => ctx.drawImage(dragonImage, dragon.x * cellSize, dragon.y * cellSize, cellSize, cellSize));
    ctx.drawImage(playerImage, player.x * cellSize, player.y * cellSize, cellSize, cellSize);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${cellSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
    }
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

function updateStatus() {
    // THIS FUNCTION HAS BEEN CHANGED
    if (collectedItemTypes.has('wire')) {
        document.getElementById('icon-wire').style.display = 'inline';
    }
    if (collectedItemTypes.has('stick')) { // Changed from stink
        document.getElementById('icon-stick').style.display = 'inline'; // Changed from icon-stink
    }
    if (collectedItemTypes.has('stone')) {
        document.getElementById('icon-stone').style.display = 'inline';
    }
}

// --- STARTUP LOGIC ---
function setupGame() {
    allItemTypes.forEach(type => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * gridSize);
            const y = Math.floor(Math.random() * gridSize);
            if (!dragons.some(d => d.x === x && d.y === y) && !(player.x === x && player.y === y) && !itemMap.has(`${x},${y}`)) {
                itemMap.set(`${x},${y}`, { type: type, image: itemImages[type], discovered: false });
                placed = true;
            }
        }
    });
    resizeCanvas();
}

function loadImage(imageObject, src) {
    return new Promise((resolve, reject) => {
        imageObject.onload = () => resolve(imageObject);
        imageObject.onerror = reject;
        imageObject.src = src;
    });
}

// THIS LOADER HAS BEEN CHANGED
Promise.all([
    loadImage(playerImage, 'player.png'),
    loadImage(dragonImage, 'dragon.png'),
    loadImage(wireImage, 'wire.png'),
    loadImage(stickImage, 'stick.png'), // Changed from stink
    loadImage(stoneImage, 'stone.png')
]).then(() => {
    console.log("All images loaded successfully!");
    setupGame();
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