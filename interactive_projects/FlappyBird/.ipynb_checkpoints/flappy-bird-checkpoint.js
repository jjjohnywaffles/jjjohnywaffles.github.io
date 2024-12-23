const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// Load the bird image
const birdImage = new Image();
birdImage.src = 'images/bird.png'; // Path to your bird image file

// Game variables
let birdX = 100; // Starting position
let birdY = 200;
let birdRadius = 20; // This determines the bird's display size
let gravity = 0.15; 
let birdVelocity = 0;
let maxVelocity = 2.5; // Limit falling speed
let isGameOver = false;
let gameStarted = false;

let pipes = [];
let pipeWidth = 65; // Wider pipes
let pipeGap = 180; // Larger gap between pipes
let pipeSpeed = 1.8; // Adjusted pipe speed for the larger game

let score = 0;
let lastTime = 0; // Stores the timestamp of the previous frame

// Start button functionality
startButton.addEventListener('click', () => {
    gameStarted = true;
    isGameOver = false;
    birdY = 200; // Reset bird position
    birdVelocity = 0;
    pipes = [];
    score = 0;
    updateScore();
    startButton.disabled = true;
    startButton.style.visibility = 'hidden';
    lastTime = 0; // Reset the timer
    requestAnimationFrame(gameLoop); // Start the game loop with a timestamp
});

// Space bar and mouse click functionality
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted && !isGameOver) {
        birdVelocity = -5; // Adjust jump strength
    }
});

canvas.addEventListener('click', () => {
    if (gameStarted && !isGameOver) {
        birdVelocity = -5; // Adjust jump strength
    }
});

// Function to update the score
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Load the pipe image
const bottomPipeImage = new Image();
bottomPipeImage.src = 'images/bottompipe.png'; // Path to the bottom pipe image

const topPipeImage = new Image();
topPipeImage.src = 'images/toppipe.png'; // Path to the top pipe image

const topExtendPipeImage = new Image();
topExtendPipeImage.src = 'images/topextendpipe.png'; // Path to the top extendable section

const bottomExtendPipeImage = new Image();
bottomExtendPipeImage.src = 'images/bottomextendpipe.png'; // Path to the bottom extendable section

const backgroundImage = new Image();
backgroundImage.src = 'images/valley.png'; // Path to the background image

// Ensure the background image is drawn initially
backgroundImage.onload = () => {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

// Function to draw a tall pipe dynamically
function drawPipe(ctx, x, y, width, height, isTopPipe) {
    const extendPipeImage = isTopPipe ? topExtendPipeImage : bottomExtendPipeImage;
    const capHeight = 20; // Height of the pipe's cap (adjust based on your images)

    if (isTopPipe) {
        // For top pipes, start drawing from the bottom upwards
        // Draw the top cap
        ctx.drawImage(topPipeImage, x, y + height - capHeight, width, capHeight);

        // Tile the middle section upwards
        let currentY = y + height - capHeight;
        while (currentY > y) {
            const drawHeight = Math.min(extendPipeImage.height, currentY - y);
            ctx.drawImage(extendPipeImage, x, currentY - drawHeight, width, drawHeight);
            currentY -= drawHeight;
        }
    } else {
        // For bottom pipes, draw from top to bottom
        // Draw the bottom cap
        ctx.drawImage(bottomPipeImage, x, y, width, capHeight);

        // Tile the middle section downwards
        let currentY = y + capHeight;
        while (currentY < y + height) { // Adjust the condition to include the remaining height
            const drawHeight = Math.min(extendPipeImage.height, y + height - currentY);
            ctx.drawImage(extendPipeImage, x, currentY, width, drawHeight);
            currentY += drawHeight;
        }
    }
}


// Function to spawn pipes
let lastPipeY = canvas.height / 2; // Initialize the last pipe's Y position

function spawnPipe() {
    // Define the base vertical shift range
    const baseShift = 250; // Standard vertical shift
    const randomShift = Math.random() < 0.3 ? 100 : 0; // Occasionally allow a larger shift (20% chance)

    // Define the minimum vertical shift between pipes
    const minVerticalShift = 75; // Ensure pipes don't appear at the same height

    let pipeHeight;
    do {
        // Calculate a new pipe height
        pipeHeight = lastPipeY + Math.floor((Math.random() * 2 - 1) * (baseShift + randomShift));

        // Ensure the new pipe height stays within the canvas bounds
        pipeHeight = Math.max(50, Math.min(pipeHeight, canvas.height - pipeGap - 50));

        // Repeat if the height shift is less than the minimum vertical shift
    } while (Math.abs(pipeHeight - lastPipeY) < minVerticalShift);

    // Create the pipes with x, y, and height properties
    pipes.push({
        x: canvas.width,
        y: pipeHeight, // Top pipe's bottom edge
        height: pipeHeight, // Top pipe's height
        isTopPipe: true, // Mark this as a top pipe
        passed: false,
    });

    pipes.push({
        x: canvas.width,
        y: pipeHeight + pipeGap, // Bottom pipe's top edge
        height: canvas.height - (pipeHeight + pipeGap), // Bottom pipe's height
        isTopPipe: false, // Mark this as a bottom pipe
        passed: false,
    });

    // Update the last pipe's position
    lastPipeY = pipeHeight;
}



// Function to update and draw the game
function gameLoop(timestamp) {
    if (lastTime === 0) lastTime = timestamp; // Initialize the lastTime on the first frame

    const deltaTime = (timestamp - lastTime) / 1000; // Time elapsed in seconds
    lastTime = timestamp; // Update the lastTime to the current frame

    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 4, canvas.height / 2);
        startButton.disabled = false;
        startButton.style.visibility = 'visible';
        return;
    }

    // Clear the canvas and draw the background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Draw the bird
    const birdWidth = birdRadius * 2;
    const birdHeight = birdRadius * 2;
    ctx.drawImage(birdImage, birdX - birdRadius, birdY - birdRadius, birdWidth, birdHeight);

    // Draw and move pipes
    pipes.forEach((pipe, index) => {
        drawPipe(ctx, pipe.x, pipe.isTopPipe ? pipe.y - pipe.height : pipe.y, pipeWidth, pipe.height, pipe.isTopPipe);

        // Move pipes to the left (scaled by deltaTime)
        pipe.x -= pipeSpeed * deltaTime;

        // Check if the bird passed the pipe (scoring)
        if (!pipe.passed && !pipe.isTopPipe && pipe.x + pipeWidth < birdX) {
            score++;
            pipe.passed = true;
            updateScore();
        }

        // Collision detection
        const withinPipeX = birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + pipeWidth;
        const hitTopPipe = pipe.isTopPipe && birdY - birdRadius < pipe.y;
        const hitBottomPipe = !pipe.isTopPipe && birdY + birdRadius > pipe.y;

        if (withinPipeX && (hitTopPipe || hitBottomPipe)) {
            isGameOver = true;
        }
    });

    // Filter out pipes that are off-screen
    pipes = pipes.filter(pipe => pipe.x + pipeWidth >= -10);

    // Spawn pipes at intervals
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        spawnPipe();
    }

    // Bird movement (scaled by deltaTime)
    birdY += birdVelocity * deltaTime;
    birdVelocity = Math.min(birdVelocity + gravity * deltaTime, maxVelocity);

    if (birdY + birdRadius > canvas.height || birdY - birdRadius < 0) {
        isGameOver = true;
    }

    // Request the next frame
    requestAnimationFrame(gameLoop);
}

