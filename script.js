const canvas = document.getElementById("snake-canvas");
const ctx = canvas.getContext("2d");
const gameOver = document.getElementById("game-over");

const CELL_SIZE = 10;
const COLS = canvas.width / CELL_SIZE;
const ROWS = canvas.height / CELL_SIZE;

let snake = [{ x: 5, y: 5 }];
let direction = "right";
let food = getRandomFood();
let score = 0;
let smallFoodEaten = 0;
let gameLoop;
let bigFood = null;
let bigFoodTimer = null;
let bigFoodAnimationFrame = 0;

// Sound effects
const eatSound = new Audio(
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
    Array(1e3).join(123)
);
const gameOverSound = new Audio(
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
    Array(1e3).join(231)
);
const bigFoodAppearSound = new Audio(
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
    Array(1e3).join(147)
);

function getRandomFood() {
  return {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS),
  };
}

function draw() {
  // Clear canvas
  ctx.fillStyle = "#8fbc8f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "black";
  snake.forEach((segment) => {
    ctx.fillRect(
      segment.x * CELL_SIZE,
      segment.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  });

  // Draw food
  ctx.fillStyle = "darkgreen";
  ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  // Draw big food if exists
  if (bigFood) {
    ctx.fillStyle = "red";
    const pulseFactor = Math.sin(bigFoodAnimationFrame * 0.2) * 0.2 + 0.8;
    const size = CELL_SIZE * 2 * pulseFactor;
    ctx.fillRect(
      bigFood.x * CELL_SIZE + (CELL_SIZE - size / 2),
      bigFood.y * CELL_SIZE + (CELL_SIZE - size / 2),
      size,
      size
    );
    bigFoodAnimationFrame++;
  }

  // Draw score
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.fillText(`Score: ${score}`, 5, 15);
}

function move() {
  const head = { ...snake[0] };

  switch (direction) {
    case "up":
      head.y--;
      break;
    case "down":
      head.y++;
      break;
    case "left":
      head.x--;
      break;
    case "right":
      head.x++;
      break;
  }

  // Check if snake hit the wall
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    endGame();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    eatSound.play();
    food = getRandomFood();
    score++;
    smallFoodEaten++;
    if (smallFoodEaten === 7) {
      spawnBigFood();
      smallFoodEaten = 0;
    }
  } else if (
    bigFood &&
    (head.x === bigFood.x || head.x === bigFood.x + 1) &&
    (head.y === bigFood.y || head.y === bigFood.y + 1)
  ) {
    eatSound.play();
    snake.push({ ...snake[snake.length - 1] });
    snake.push({ ...snake[snake.length - 1] });
    score += 2;
    clearTimeout(bigFoodTimer);
    bigFood = null;
  } else {
    snake.pop();
  }

  if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);
  draw();
}

function spawnBigFood() {
  bigFood = getRandomFood();
  bigFoodAnimationFrame = 0;
  bigFoodAppearSound.play();
  bigFoodTimer = setTimeout(() => {
    bigFood = null;
  }, 6000);
}

function endGame() {
  clearInterval(gameLoop);
  if (bigFoodTimer) {
    clearTimeout(bigFoodTimer);
  }
  gameOverSound.play();
  gameOver.style.display = "block";
}

function changeDirection(newDirection) {
  const opposites = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  if (newDirection !== opposites[direction]) {
    direction = newDirection;
  }
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      changeDirection("up");
      break;
    case "ArrowDown":
    case "s":
      changeDirection("down");
      break;
    case "ArrowLeft":
    case "a":
      changeDirection("left");
      break;
    case "ArrowRight":
    case "d":
      changeDirection("right");
      break;
    case "Enter":
    case " ":
      restartGame();
      break;
  }
});

document
  .getElementById("up")
  .addEventListener("click", () => changeDirection("up"));
document
  .getElementById("down")
  .addEventListener("click", () => changeDirection("down"));
document
  .getElementById("left")
  .addEventListener("click", () => changeDirection("left"));
document
  .getElementById("right")
  .addEventListener("click", () => changeDirection("right"));

function restartGame() {
  if (gameOver.style.display === "block") {
    snake = [{ x: 5, y: 5 }];
    direction = "right";
    food = getRandomFood();
    bigFood = null;
    score = 0;
    smallFoodEaten = 0;
    if (bigFoodTimer) {
      clearTimeout(bigFoodTimer);
    }
    gameOver.style.display = "none";
    gameLoop = setInterval(move, 200);
  }
}

document.getElementById("select").addEventListener("click", restartGame);

gameLoop = setInterval(move, 200);
draw();
