/*********************************************
 *  DOM ELEMENTS & IMAGES
 *********************************************/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');

// Bird image
const birdImage = new Image();
birdImage.src = 'images/bird.png'; // Path to your bird image

// Pipe images
const bottomPipeImage = new Image();
bottomPipeImage.src = 'images/bottompipe.png';

const topPipeImage = new Image();
topPipeImage.src = 'images/toppipe.png';

const topExtendPipeImage = new Image();
topExtendPipeImage.src = 'images/topextendpipe.png';

const bottomExtendPipeImage = new Image();
bottomExtendPipeImage.src = 'images/bottomextendpipe.png';

// Background
const backgroundImage = new Image();
backgroundImage.src = 'images/valley.png';

/*********************************************
 *  GAME VARIABLES
 *********************************************/
// Bird positions & movement (in px or px/sec)
let birdX = 100;     // Starting x-position
let birdY = 200;     // Starting y-position
let birdRadius = 20; // For collision size

// We’ll use time-based physics now:
// - gravity (px/sec^2)
// - birdVelocity (px/sec)
// - maxVelocity (px/sec)
let gravity = 2400;       
let birdVelocity = 0;    
let maxVelocity = 500;   

// If you’d like smaller or bigger jumps, tweak this:
const jumpStrength = 600; // px/sec upward

let isGameOver = false;
let gameStarted = false;

// Pipes
let pipes = [];
let pipeWidth = 65;
let pipeGap = 180;

// pipeSpeed is now “px/sec”
let pipeSpeed = 360; 

let score = 0;

// Keep track of the last pipe’s Y to vary the next pipe
let lastPipeY = canvas.height / 2;

// For delta-time calculations
let lastTime = 0;

/*********************************************
 *  INITIAL DRAW (just so canvas isn't blank)
 *********************************************/
backgroundImage.onload = () => {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
};

/*********************************************
 *  START BUTTON
 *********************************************/
startButton.addEventListener('click', () => {
  gameStarted = true;
  isGameOver = false;
  birdY = 200; 
  birdVelocity = 0;
  pipes = [];
  score = 0;
  updateScore();

  startButton.disabled = true;
  startButton.style.visibility = 'hidden';

  // Reset the time so our first frame has correct dt
  lastTime = performance.now();

  // Start the animation loop
  requestAnimationFrame(gameLoop);
});

/*********************************************
 *  CONTROLS (Space / Click)
 *********************************************/
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && gameStarted && !isGameOver) {
    // Jump upward at jumpStrength px/sec
    birdVelocity = -jumpStrength;
  }
});

canvas.addEventListener('click', () => {
  if (gameStarted && !isGameOver) {
    birdVelocity = -jumpStrength;
  }
});

/*********************************************
 *  SCORE DISPLAY
 *********************************************/
function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

/*********************************************
 *  DRAW PIPE (WITH EXTENDABLE SECTION)
 *********************************************/
function drawPipe(ctx, x, y, width, height, isTopPipe) {
  const extendPipeImage = isTopPipe ? topExtendPipeImage : bottomExtendPipeImage;
  const capHeight = 20; // top/bottom cap height

  if (isTopPipe) {
    // Top pipe: draw from bottom to top
    ctx.drawImage(topPipeImage, x, y + height - capHeight, width, capHeight);
    let currentY = y + height - capHeight;
    while (currentY > y) {
      const drawHeight = Math.min(extendPipeImage.height, currentY - y);
      ctx.drawImage(extendPipeImage, x, currentY - drawHeight, width, drawHeight);
      currentY -= drawHeight;
    }
  } else {
    // Bottom pipe: draw from top to bottom
    ctx.drawImage(bottomPipeImage, x, y, width, capHeight);
    let currentY = y + capHeight;
    while (currentY < y + height) {
      const drawHeight = Math.min(extendPipeImage.height, y + height - currentY);
      ctx.drawImage(extendPipeImage, x, currentY, width, drawHeight);
      currentY += drawHeight;
    }
  }
}

/*********************************************
 *  SPAWN PIPE
 *********************************************/
function spawnPipe() {
  // Some random vertical shift logic
  const baseShift = 250;
  const randomShift = Math.random() < 0.3 ? 100 : 0;
  const minVerticalShift = 75; // so pipes aren’t too close in height

  let pipeHeight;
  do {
    pipeHeight = lastPipeY + Math.floor((Math.random() * 2 - 1) * (baseShift + randomShift));
    pipeHeight = Math.max(50, Math.min(pipeHeight, canvas.height - pipeGap - 50));
  } while (Math.abs(pipeHeight - lastPipeY) < minVerticalShift);

  // Top pipe
  pipes.push({
    x: canvas.width,
    y: pipeHeight,
    height: pipeHeight,
    isTopPipe: true,
    passed: false
  });

  // Bottom pipe
  pipes.push({
    x: canvas.width,
    y: pipeHeight + pipeGap,
    height: canvas.height - (pipeHeight + pipeGap),
    isTopPipe: false,
    passed: false
  });

  lastPipeY = pipeHeight;
}

/*********************************************
 *  GAME LOOP (TIME-BASED)
 *********************************************/
function gameLoop(timestamp) {
  // Calculate time elapsed (ms) since last frame
  if (!lastTime) lastTime = timestamp; 
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  // Convert to seconds
  const dtSec = dt / 1000;

  // If game is over, draw “Game Over” and stop
  if (isGameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvas.width / 4, canvas.height / 2);

    startButton.disabled = false;
    startButton.style.visibility = 'visible';
    return; // stop the loop
  }

  /**************************
   * UPDATE SECTION
   **************************/
  // 1) Move pipes (pipeSpeed is px/sec)
  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed * dtSec;
  });

  // 2) Remove offscreen pipes
  pipes = pipes.filter(pipe => pipe.x + pipeWidth >= -10);

  // 3) Spawn new pipes if needed
  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
    spawnPipe();
  }

  // 4) Bird physics
  //    - Apply gravity (px/sec^2)
  birdVelocity = Math.min(birdVelocity + gravity * dtSec, maxVelocity);
  birdY += birdVelocity * dtSec;

  // 5) Collision + scoring
  pipes.forEach((pipe) => {
    // If it's a bottom pipe and the bird passes its right edge, increment score
    if (!pipe.passed && !pipe.isTopPipe && (pipe.x + pipeWidth < birdX)) {
      pipe.passed = true;
      score++;
      updateScore();
    }

    // Collision detection
    const withinPipeX =
      (birdX + birdRadius > pipe.x) &&
      (birdX - birdRadius < pipe.x + pipeWidth);

    const hitTopPipe = pipe.isTopPipe && (birdY - birdRadius < pipe.y);
    const hitBottomPipe = !pipe.isTopPipe && (birdY + birdRadius > pipe.y);

    if (withinPipeX && (hitTopPipe || hitBottomPipe)) {
      isGameOver = true;
    }
  });

  // Bird hits top or bottom of the canvas
  if (birdY + birdRadius > canvas.height || birdY - birdRadius < 0) {
    isGameOver = true;
  }

  /**************************
   * DRAW SECTION
   **************************/
  // Clear canvas + draw background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Draw pipes
  pipes.forEach((pipe) => {
    const drawY = pipe.isTopPipe ? (pipe.y - pipe.height) : pipe.y;
    drawPipe(ctx, pipe.x, drawY, pipeWidth, pipe.height, pipe.isTopPipe);
  });

  // Draw bird
  const birdDiameter = birdRadius * 2;
  ctx.drawImage(
    birdImage,
    birdX - birdRadius,
    birdY - birdRadius,
    birdDiameter,
    birdDiameter
  );

  // Keep looping until game is over
  requestAnimationFrame(gameLoop);
}
