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

// Use 'let' so we can modify the array when a dragon is defeated
let dragons = [
 { x: 0, y: 0 },
 { x: gridSize - 1, y: 0 },
 { x: 0, y: gridSize - 1 },
 { x: gridSize - 1, y: gridSize - 1 }
];

const hiddenItems = [];
const itemMap = new Map();
// Use a Set to store unique collected item types
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
  // Convert Set to array, capitalize first letter, and join
  const itemsText = [...collectedItemTypes].map(item => item.charAt(0).toUpperCase() + item.slice(1)).join(', ');
  statusDisplay.textContent = `Items Collected: ${itemsText}`;
 }

 if (collectedItemTypes.size === allItemTypes.length) {
    statusDisplay.textContent += ' - You can now defeat dragons!';
    statusDisplay.style.color = '#28a745'; // Green color for "ready" status
 }
}

function draw() {
 // Fill the background with green
 ctx.fillStyle = '#2a5d2a'; // A nice green color
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 // Draw black grid lines so every cell is visible
 ctx.strokeStyle = '#000';
 ctx.lineWidth = 2;
 for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
   ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
  }
 }

 // Draw the dragons
 for (const dragon of dragons) {
  ctx.fillStyle = 'red';
  ctx.fillRect(dragon.x * cellSize, dragon.y * cellSize, cellSize, cellSize);
 }

 // Draw the player
 ctx.fillStyle = player.color;
 ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);

 // Show the item type on the current cell if it exists and hasn't been found
 const playerPosKey = `${player.x},${player.y}`;
 if (itemMap.has(playerPosKey)) {
  const item = itemMap.get(playerPosKey);
  if (!item.discovered) {
      item.discovered = true;
      collectedItemTypes.add(item.type);
      updateStatus();
  }
  // Keep displaying the item text on the square
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

function handleKeyDown(e) {
  if (gameOver) return; // Stop player movement if game is won

 let newX = player.x;
 let newY = player.y;

 switch (e.key) {
  case 'ArrowUp': newY--; break;
  case 'ArrowDown': newY++; break;
  case 'ArrowLeft': newX--; break;
  case 'ArrowRight': newX++; break;
 }

 // Boundary check
 if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
  player.x = newX;
  player.y = newY;
 }
 
 // Dragon-slaying logic
 if (collectedItemTypes.size === allItemTypes.length) {
    // Attempt to slay a dragon
    const originalDragonCount = dragons.length;
    dragons = dragons.filter(d => !(d.x === player.x && d.y === player.y));
    
    if (dragons.length < originalDragonCount) { // A dragon was slain
        if (dragons.length === 0) {
            // All dragons defeated
            gameOver = true;
        }
    }
 }

 draw();
}

// Initial Setup
document.addEventListener('keydown', handleKeyDown);
updateStatus();
draw();
