// --- 1. BASIC SETUP ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');
const dragonImg = document.getElementById('dragon-sprite');
const catImg = document.getElementById('cat-sprite');
const robotImg = document.getElementById('robot-sprite');
const moveSound = document.getElementById('move-sound');
const gameOverSound = document.getElementById('game-over-sound');

// --- 2. GAME CONFIGURATION ---
const TILE_SIZE = 40;
const MAP_NUM_ROWS = 15;
const MAP_NUM_COLS = 20;
canvas.width = MAP_NUM_COLS * TILE_SIZE;
canvas.height = MAP_NUM_ROWS * TILE_SIZE;

// --- 3. GAME STATE ---
let isGameOver = false;
const player = {
    x: TILE_SIZE * 1,
    y: TILE_SIZE * 7,
    width: TILE_SIZE,
    height: TILE_SIZE,
    speed: 4,
    dx: 0,
    dy: 0,
    isMoving: false
};

// Enemy objects with much shorter decision intervals
const cat = {
    img: catImg,
    x: TILE_SIZE * 18,
    y: TILE_SIZE * 1,
    width: TILE_SIZE,
    height: TILE_SIZE,
    speed: 4.4,
    dx: 0,
    dy: 0,
    decisionInterval: 50, // Thinks very frequently
    lastDecisionTime: 0
};

const robot = {
    img: robotImg,
    x: TILE_SIZE * 18,
    y: TILE_SIZE * 13,
    width: TILE_SIZE,
    height: TILE_SIZE,
    speed: 3.6,
    dx: 0,
    dy: 0,
    decisionInterval: 100, // Thinks frequently
    lastDecisionTime: 0
};

const enemies = [cat, robot];
const levelMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// --- 4. DRAWING FUNCTIONS ---
function drawPlayer() {
    ctx.drawImage(dragonImg, player.x, player.y, player.width, player.height);
}

function drawMap() {
    for (let r = 0; r < MAP_NUM_ROWS; r++) {
        for (let c = 0; c < MAP_NUM_COLS; c++) {
            if (levelMap[r][c] === 1) {
                ctx.fillStyle = '#228B22';
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// --- 5. GAME LOGIC ---
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(error => {
        console.log("Sound playback was prevented.", error);
    });
}

function checkPlayerEnemyCollision() {
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            if (!isGameOver) {
                playSound(gameOverSound);
                isGameOver = true;
            }
        }
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    handleWallCollisions(player);
}

function moveEnemies(currentTime) {
    enemies.forEach(enemy => {
        if (currentTime - enemy.lastDecisionTime > enemy.decisionInterval) {
            enemy.lastDecisionTime = currentTime;
            const xDist = player.x - enemy.x;
            const yDist = player.y - enemy.y;
            if (Math.abs(xDist) > Math.abs(yDist)) {
                enemy.dx = Math.sign(xDist) * enemy.speed;
                enemy.dy = 0;
            } else {
                enemy.dy = Math.sign(yDist) * enemy.speed;
                enemy.dx = 0;
            }
        }
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        handleWallCollisions(enemy);
    });
}

function handleWallCollisions(character) {
    const originalDx = character.dx;
    const originalDy = character.dy;
    for (let r = 0; r < MAP_NUM_ROWS; r++) {
        for (let c = 0; c < MAP_NUM_COLS; c++) {
            if (levelMap[r][c] === 1) {
                const wall = {
                    x: c * TILE_SIZE,
                    y: r * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                };
                if (character.x < wall.x + wall.width && character.x + character.width > wall.x &&
                    character.y < wall.y + wall.height && character.y + character.height > wall.y) {

                    character.x -= originalDx;
                    character.y -= originalDy;
                    character.dx = 0;
                    character.dy = 0;

                    // If the character is an enemy, force it to re-think immediately!
                    if (character.decisionInterval !== undefined) {
                        character.lastDecisionTime = 0; // Resetting the timer forces a new decision
                    }
                    return;
                }
            }
        }
    }
}

function showGameOver() {
    gameOverScreen.classList.add('visible');
}

// --- 6. INPUT HANDLERS ---
function startMovement() {
    if (!player.isMoving && (player.dx !== 0 || player.dy !== 0)) {
        playSound(moveSound);
        player.isMoving = true;
    }
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
    else if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    else if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
    else if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
    startMovement();
});
document.addEventListener('keyup', (e) => {
    if (['ArrowRight', 'd', 'ArrowLeft', 'a'].includes(e.key)) player.dx = 0;
    if (['ArrowUp', 'w', 'ArrowDown', 's'].includes(e.key)) player.dy = 0;
    if (player.dx === 0 && player.dy === 0) {
        player.isMoving = false;
    }
});
const upBtn = document.getElementById('up-btn'),
    downBtn = document.getElementById('down-btn'),
    leftBtn = document.getElementById('left-btn'),
    rightBtn = document.getElementById('right-btn');

function addTouchAndMouseListeners(element, actionStart, actionEnd) {
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        actionStart();
        startMovement();
    }, {
        passive: false
    });
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        actionEnd();
        if (player.dx === 0 && player.dy === 0) player.isMoving = false;
    });
    element.addEventListener('mousedown', (e) => {
        e.preventDefault();
        actionStart();
        startMovement();
    });
    element.addEventListener('mouseup', (e) => {
        e.preventDefault();
        actionEnd();
        if (player.dx === 0 && player.dy === 0) player.isMoving = false;
    });
    element.addEventListener('mouseleave', (e) => {
        e.preventDefault();
        actionEnd();
        if (player.dx === 0 && player.dy === 0) player.isMoving = false;
    });
}
addTouchAndMouseListeners(upBtn, () => player.dy = -player.speed, () => player.dy = 0);
addTouchAndMouseListeners(downBtn, () => player.dy = player.speed, () => player.dy = 0);
addTouchAndMouseListeners(leftBtn, () => player.dx = -player.speed, () => player.dx = 0);
addTouchAndMouseListeners(rightBtn, () => player.dx = player.speed, () => player.dx = 0);
restartBtn.addEventListener('click', () => {
    location.reload();
});

// --- 7. THE GAME LOOP ---
function update(currentTime = 0) {
    if (isGameOver) {
        showGameOver();
        return;
    }
    clearCanvas();
    drawMap();
    movePlayer();
    moveEnemies(currentTime);
    drawPlayer();
    drawEnemies();
    checkPlayerEnemyCollision();
    requestAnimationFrame(update);
}

// --- 8. START THE GAME ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Draw the static map immediately so the screen isn't blank.
    drawMap();

    // 2. Helper function to reliably check if an image is loaded.
    function loadImage(imgElement) {
        return new Promise(resolve => {
            if (imgElement.complete) {
                resolve();
            } else {
                imgElement.onload = resolve;
                imgElement.onerror = resolve; // Resolve on error too, to avoid getting stuck
            }
        });
    }

    // 3. Wait for all character images to be ready.
    Promise.all([
        loadImage(dragonImg),
        loadImage(catImg),
        loadImage(robotImg)
    ]).then(() => {
        // 4. Once images are loaded, start the main animation loop.
        update();
    });
});```