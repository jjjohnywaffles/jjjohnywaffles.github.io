const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// Load the bird image
const birdImage = new Image();
birdImage.src = 'bird.png'; // Path to your bird image file

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
let pipeWidth = 75; // Wider pipes
let pipeGap = 180; // Larger gap between pipes
let pipeSpeed = 1.8; // Adjusted pipe speed for the larger game

let score = 0;

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
    gameLoop();
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

// Function to spawn pipes
function spawnPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 100) + 50);
    pipes.push({
        x: canvas.width,
        y: pipeHeight,
        passed: false,
    });
}

// Function to update and draw the game
function gameLoop() {
    if (isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 4, canvas.height / 2);
        startButton.disabled = false;
        startButton.style.visibility = 'visible';
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bird (using the custom image)
    const birdWidth = birdRadius * 2; // Scale image width
    const birdHeight = birdRadius * 2; // Scale image height
    ctx.drawImage(birdImage, birdX - birdRadius, birdY - birdRadius, birdWidth, birdHeight);

    // Draw and move pipes
    ctx.fillStyle = 'green';
    pipes.forEach((pipe, index) => {
        // Draw top and bottom pipes
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
        ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height);
    
        // Move pipes to the left
        pipe.x -= pipeSpeed;
    
        // Check if the bird passed the pipe (scoring)
        if (!pipe.passed && pipe.x + pipeWidth < birdX) {
            score++;
            pipe.passed = true;
            updateScore();
        }
    
        // Collision detection with the visible part of the pipes
        const withinPipeX = birdX + birdRadius > pipe.x && birdX - birdRadius < pipe.x + pipeWidth;
        const hitTopPipe = birdY - birdRadius < pipe.y;
        const hitBottomPipe = birdY + birdRadius > pipe.y + pipeGap;
    
        if (withinPipeX && (hitTopPipe || hitBottomPipe)) {
            isGameOver = true;
        }
    
        // Remove pipes that are fully off-screen
        if (pipe.x + pipeWidth < -10) { // Buffer of -10 to avoid flickering
            pipes.splice(index, 1);
        }
    });

    // Spawn pipes at intervals
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        spawnPipe();
    }

    // Bird movement
    birdY += birdVelocity;
    birdVelocity = Math.min(birdVelocity + gravity, maxVelocity);

    if (birdY + birdRadius > canvas.height || birdY - birdRadius < 0) {
        isGameOver = true;
    }

    requestAnimationFrame(gameLoop);
}
