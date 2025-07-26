
**script.js**
```javascript
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status');

const gridSize = 11;
const cellSize = canvas.width / gridSize;
let gameOver = false;

const player = {
 x: 5,
 y: 5,
 color: 'yellow'
};

let dragons = [
 { x: 0, y: 0 },
 { x: gridSize - 1, y: 0 },
 { x: 0, y: gridSize - 1 },
 { x: gridSize - 1, y: gridSize - 1 }
];

const hiddenItems = [];
const itemMap = new Map();
const collectedItemTypes = new Set();
const allItemTypes = ['wire', 'stink', 'stone'];

// Ensure at least one of each item type is placed
allItemTypes.forEach(type => {
 let placed = false;
 while (!placed) {
  const x = Math.floor(Math.random() * gridSize);
  const y = Math.floor(Math.random() * gridSize);
  const isDragonSquare = dragons.some(d => d.x === x && d.y === y);
  const isPlayerStart = (x === player.x && y === player.y);
  if (!isDragonSquare && !isPlayerStart && !itemMap.has(`${x},${y}`)) {
      const item = { x, y, type, discovered: false };
      hiddenItems.push(item);
      itemMap.set(`${x},${y}`, item);
      placed = true;
  }
 }
});

function updateStatus() {
 if (collectedItemTypes.size === 0) {
  statusDisplay.textContent = 'Items Collected: None';
 } else {
  const itemsText = [...collectedItemTypes].map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(', ');
  statusDisplay.textContent = `Items Collected: ${itemsText}`;
 }

 if (collectedItemTypes.size === allItemTypes.length) {
    statusDisplay.textContent += ' - You can now defeat dragons!';
    statusDisplay.style.color = '#28a745';
 }
}

function draw() {
 ctx.fillStyle = '#2a5d2a';
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 ctx.strokeStyle = '#000';
 ctx.lineWidth = 2;
 for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
   ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
  }
 }

 for (const dragon of dragons) {
  ctx.fillStyle = 'red';
  ctx.fillRect(dragon.x * cellSize, dragon.y * cellSize, cellSize, cellSize);
 }

 ctx.fillStyle = player.color;
 ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);

 const playerPosKey = `${player.x},${player.y}`;
 if (itemMap.has(playerPosKey)) {
  const item = itemMap.get(playerPosKey);
  if (!item.discovered) {
      item.discovered = true;
      collectedItemTypes.add(item.type);
      updateStatus();
  }
  ctx.fillStyle = 'blue';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(item.type, item.x * cellSize + cellSize / 2, item.y * cellSize + cellSize / 2);
 }
 
 if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
 }
}

// --- Player Movement Logic ---
function movePlayer(dx, dy) {
    if (gameOver) return;

    let newX = player.x + dx;
    let newY = player.y + dy;

    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX;
        player.y = newY;
    }
    
    if (collectedItemTypes.size === allItemTypes.length) {
        const originalDragonCount = dragons.length;
        dragons = dragons.filter(d => !(d.x === player.x && d.y === player.y));
        if (dragons.length < originalDragonCount && dragons.length === 0) {
            gameOver = true;
        }
    }
    draw();
}

// --- Event Listeners ---
// Keyboard Listener
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
    }
});

// Touch Control Listeners
document.getElementById('up-btn').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('down-btn').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('left-btn').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('right-btn').addEventListener('click', () => movePlayer(1, 0));

// Initial Setup
updateStatus();
draw();
