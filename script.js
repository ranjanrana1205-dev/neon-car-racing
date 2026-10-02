
const game = document.getElementById("game");
const player = document.getElementById("player");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const message = document.getElementById("message");

let playerLane = 1;
let enemies = [];
let score = 0;
let running = false;
let animationId;
let lastTime = 0;
let spawnTimer = 0;
let enemySpeed = 220;

let best = Number(localStorage.getItem("neonBest") || 0);
bestEl.textContent = best;

const lanes = [25, 50, 75];

function setPlayerLane() {
  player.style.left = `calc(${lanes[playerLane]}% - 22px)`;
}

function movePlayer(direction) {
  if (!running) return;
  playerLane = Math.max(0, Math.min(2, playerLane + direction));
  setPlayerLane();
}

document.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) {
    event.preventDefault();
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    movePlayer(-1);
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    movePlayer(1);
  }

  if (!running && event.key === "Enter") startGame();
});

document.getElementById("leftBtn")
  .addEventListener("click", () => movePlayer(-1));

document.getElementById("rightBtn")
  .addEventListener("click", () => movePlayer(1));

function spawnEnemy() {
  const enemy = document.createElement("div");
  enemy.className = "car enemy";

  const lane = Math.floor(Math.random() * 3);
  enemy.dataset.lane = lane;
  enemy.style.left = `calc(${lanes[lane]}% - 22px)`;
  enemy.style.top = "-80px";

  game.appendChild(enemy);
  enemies.push(enemy);
}

function isCollision(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();

  return (
    r1.left < r2.right - 6 &&
    r1.right > r2.left + 6 &&
    r1.top < r2.bottom - 6 &&
    r1.bottom > r2.top + 6
  );
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);

  if (score > best) {
    best = score;
    localStorage.setItem("neonBest", best);
    bestEl.textContent = best;
  }

  message.textContent = `Game Over! Score: ${score}`;
  startBtn.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

function gameLoop(timestamp) {
  if (!running) return;

  const delta = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  spawnTimer += delta;

  if (spawnTimer > Math.max(0.42, 0.95 - score / 500)) {
    spawnEnemy();
    spawnTimer = 0;
  }

  enemySpeed = 220 + Math.min(score * 0.5, 180);

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const top = parseFloat(enemy.style.top) || -80;

    enemy.style.top = `${top + enemySpeed * delta}px`;

    if (isCollision(player, enemy)) {
      endGame();
      return;
    }

    if (top > game.clientHeight) {
      enemy.remove();
      enemies.splice(i, 1);
      score += 10;
      scoreEl.textContent = score;
    }
  }

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  cancelAnimationFrame(animationId);

  enemies.forEach(enemy => enemy.remove());
  enemies = [];

  score = 0;
  playerLane = 1;
  spawnTimer = 0;
  enemySpeed = 220;
  lastTime = 0;

  scoreEl.textContent = score;
  message.textContent = "";
  setPlayerLane();

  overlay.classList.add("hidden");
  running = true;

  animationId = requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", startGame);
setPlayerLane();
