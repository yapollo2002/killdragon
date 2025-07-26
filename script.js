const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const gridSize = 11;
const cellSize = canvas.width / gridSize;
const player = {
 x: 0,
 y: 0,
 color: 'yellow'
};
const dragons = [
 { x: 0, y: 0 },
 { x: gridSize - 1, y: 0 },
 { x: 0, y: gridSize - 1 },
 { x: gridSize - 1, y: gridSize - 1 }
];
const hiddenItems = [];
for (let i = 0; i < gridSize; i++) {
 for (let j = 0; j < gridSize; j++) {
 if (Math.random() > 0.5) {
 hiddenItems.push({
 x: i,
 y: j,
 type: ['wire', 'stink', 'stone'][Math.floor(Math.random() * 3)]
 });
 }
 }
}
function draw() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);
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
 for (const item of hiddenItems) {
 if (item.x === player.x && item.y === player.y) {
 ctx.fillStyle = 'blue';
 ctx.fillText(item.type, item.x * cellSize, item.y * cellSize);
 }
 }
}
function handleKeyDown(e) {
 switch (e.key) {
 case 'ArrowUp':
 player.y--;
 break;
 case 'ArrowDown':
 player.y++;
 break;
 case 'ArrowLeft':
 player.x--;
 break;
 case 'ArrowRight':
 player.x++;
 break;
 }
 draw();
}
document.addEventListener('keydown', handleKeyDown);
draw();