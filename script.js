// This wrapper ensures the script runs only after the page is fully loaded.
window.addEventListener('DOMContentLoaded', () => {

    // Get all the necessary HTML elements
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    const statusDisplay = document.getElementById('status');

    // Game variables
    const gridSize = 11;
    const cellSize = canvas.width / gridSize;
    let gameOver = false;

    // Player and game objects
    const player = { x: 5, y: 5, color: 'yellow' };
    let dragons = [
        { x: 0, y: 0 }, { x: gridSize - 1, y: 0 },
        { x: 0, y: gridSize - 1 }, { x: gridSize - 1, y: gridSize - 1 }
    ];
    const itemMap = new Map();
    const collectedItemTypes = new Set();
    const allItemTypes = ['wire', 'stink', 'stone'];

    // --- Game Logic Functions ---

    function setupItems() {
        allItemTypes.forEach(type => {
            let placed = false;
            while (!placed) {
                const x = Math.floor(Math.random() * gridSize);
                const y = Math.floor(Math.random() * gridSize);
                const isDragonSquare = dragons.some(d => d.x === x && d.y === y);
                const isPlayerStart = (x === player.x && y === player.y);
                if (!isDragonSquare && !isPlayerStart && !itemMap.has(`${x},${y}`)) {
                    itemMap.set(`${x},${y}`, { type, discovered: false });
                    placed = true;
                }
            }
        });
    }

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
        // Draw green background and grid lines
        ctx.fillStyle = '#2a5d2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
        // Draw dragons and player
        dragons.forEach(dragon => {
            ctx.fillStyle = 'red';
            ctx.fillRect(dragon.x * cellSize, dragon.y * cellSize, cellSize, cellSize);
        });
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x * cellSize, player.y * cellSize, cellSize, cellSize);
        // Check for and draw discovered items
        const playerPosKey = `${player.x},${player.y}`;
        if (itemMap.has(playerPosKey)) {
            const item = itemMap.get(playerPosKey);
            ctx.fillStyle = 'blue';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(item.type, player.x * cellSize + cellSize / 2, player.y * cellSize + cellSize / 1.5);
        }
        // Draw win screen
        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '50px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2);
        }
    }

    // --- Central Movement Function ---
    function movePlayer(dx, dy) {
        if (gameOver) return;
        // Update player position
        let newX = player.x + dx;
        let newY = player.y + dy;
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
        // Check for dragon slaying
        if (collectedItemTypes.size === allItemTypes.length) {
            const originalDragonCount = dragons.length;
            dragons = dragons.filter(d => !(d.x === player.x && d.y === player.y));
            if (dragons.length < originalDragonCount && dragons.length === 0) {
                gameOver = true;
            }
        }
        // Redraw the game
        draw();
    }

    // --- EVENT LISTENERS ---

    // 1. Keyboard Controls
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp': movePlayer(0, -1); break;
            case 'ArrowDown': movePlayer(0, 1); break;
            case 'ArrowLeft': movePlayer(-1, 0); break;
            case 'ArrowRight': movePlayer(1, 0); break;
        }
    });

    // 2. Touch Controls
    document.getElementById('up-btn').addEventListener('touchstart', e => { e.preventDefault(); movePlayer(0, -1); });
    document.getElementById('down-btn').addEventListener('touchstart', e => { e.preventDefault(); movePlayer(0, 1); });
    document.getElementById('left-btn').addEventListener('touchstart', e => { e.preventDefault(); movePlayer(-1, 0); });
    document.getElementById('right-btn').addEventListener('touchstart', e => { e.preventDefault(); movePlayer(1, 0); });

    // --- Initial Game Start ---
    setupItems();
    updateStatus();
    draw();
});
