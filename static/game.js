const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth > 600 ? 600 : window.innerWidth - 20;
canvas.height = 500;

let score = 0;
let level = 1;
const maxLevel = 25;

let paddle = {
  width: 100,
  height: 15,
  x: canvas.width / 2 - 50,
  y: canvas.height - 20,
  dx: 6,
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  radius: 10,
  dx: 4,
  dy: -4,
};

const brick = {
  width: 75,
  height: 20,
  padding: 10,
  offsetTop: 40,
  offsetLeft: 30,
};

let bricks = [];

const levelConfigs = Array.from({ length: maxLevel }, (_, i) => ({
  rows: 3 + Math.floor(i / 2),
  columns: 5 + (i % 3),
}));

let rightPressed = false;
let leftPressed = false;
let gameOver = false;  // Flag to prevent multiple redirects

function initBricksForLevel(level) {
  const { rows, columns } = levelConfigs[level - 1];
  bricks = [];

  for (let c = 0; c < columns; c++) {
    bricks[c] = [];
    for (let r = 0; r < rows; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  brick.rowCount = rows;
  brick.columnCount = columns;
}
initBricksForLevel(level);

function drawPaddle() {
  ctx.fillStyle = "#00FFFF";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4081";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brick.columnCount; c++) {
    for (let r = 0; r < brick.rowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        const brickX = c * (brick.width + brick.padding) + brick.offsetLeft;
        const brickY = r * (brick.height + brick.padding) + brick.offsetTop;
        b.x = brickX;
        b.y = brickY;

        const gradient = ctx.createLinearGradient(brickX, brickY, brickX + brick.width, brickY);
        gradient.addColorStop(0, "#ff8a00");
        gradient.addColorStop(1, "#e52e71");

        ctx.fillStyle = gradient;
        ctx.fillRect(brickX, brickY, brick.width, brick.height);
        ctx.strokeStyle = "#fff3";
        ctx.strokeRect(brickX, brickY, brick.width, brick.height);
      }
    }
  }
}

function drawScore() {
  ctx.font = "18px 'Segoe UI'";
  ctx.fillStyle = "#fff";
  ctx.fillText(`Score: ${score}`, 20, 25);
  ctx.fillText(`Level: ${level}`, canvas.width - 100, 25);
}

function updatePaddle() {
  if (rightPressed && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.dx;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

function updateBallSpeed(level) {
  const baseSpeed = 4;        // Moderate starting speed
  const increment = 0.3;      // Speed increase per level
  const maxSpeed = 8;         // Cap speed

  const speed = Math.min(baseSpeed + (level - 1) * increment, maxSpeed);
  const angle = Math.atan2(ball.dy, ball.dx);

  ball.dx = speed * Math.cos(angle);
  ball.dy = -Math.abs(speed * Math.sin(angle));
}

function moveBall() {
  if (gameOver) return;  // Stop update if game is over

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx *= -1;
  if (ball.y - ball.radius < 0) ball.dy *= -1;

  if (
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width &&
    ball.y + ball.radius > paddle.y &&
    ball.y + ball.radius < paddle.y + paddle.height
  ) {
    ball.dy *= -1;

    // Adjust ball dx depending on where it hits the paddle
    let hitPos = ball.x - (paddle.x + paddle.width / 2);
    ball.dx = hitPos * 0.15;
  }

  if (ball.y - ball.radius > canvas.height) {
    gameOver = true;
    localStorage.setItem("finalScore", score);
    window.location.href = "/game";  // Redirect to your game over page
    return;
  }

  let allCleared = true;
  for (let c = 0; c < brick.columnCount; c++) {
    for (let r = 0; r < brick.rowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        allCleared = false;
        if (
          ball.x > b.x &&
          ball.x < b.x + brick.width &&
          ball.y > b.y &&
          ball.y < b.y + brick.height
        ) {
          ball.dy *= -1;
          b.status = 0;
          score += 10;
        }
      }
    }
  }

  if (allCleared) {
    level++;
    if (level > maxLevel) {
      window.location.href = "/gamewin";
    } else {
      initBricksForLevel(level);
      resetBallAndPaddle();
    }
  }
}

function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 30;
  updateBallSpeed(level);
  paddle.x = canvas.width / 2 - paddle.width / 2;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  updatePaddle();
  moveBall();
  requestAnimationFrame(draw);
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// Mouse movement control
document.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.width / 2;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
});

draw();
