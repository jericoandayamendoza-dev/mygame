
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const livesText = document.getElementById("lives");
const highScoreText = document.getElementById("highScore");

const overlay = document.getElementById("overlay");
const message = document.getElementById("message");
const description = document.getElementById("description");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

let player;
let obstacles;
let score;
let lives;
let level;
let gameRunning = false;
let paused = false;
let animationId;

let keys = {};
let lastSpawn = 0;
let highScore = Number(localStorage.getItem("neonHighScore")) || 0;

highScoreText.textContent = highScore;

function resetGame() {
    player = {
        x: 275,
        y: 390,
        width: 45,
        height: 25,
        speed: 6
    };

    obstacles = [];
    score = 0;
    lives = 3;
    level = 1;
    lastSpawn = 0;

    updateStats();
}

function updateStats() {
    scoreText.textContent = score;
    livesText.textContent = lives;
    levelText.textContent = level;
    highScoreText.textContent = highScore;
}

function drawPlayer() {
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00f7ff";
    ctx.fillStyle = "#00f7ff";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

    ctx.shadowBlur = 0;
}

function createObstacle() {
    const size = Math.random() * 25 + 20;

    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 2 + 2 + level * 0.5
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff36d1";
        ctx.fillStyle = "#ff36d1";

        ctx.fillRect(
            obstacle.x,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );
    });

    ctx.shadowBlur = 0;
}

function movePlayer() {
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        player.x -= player.speed;
    }

    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        player.x += player.speed;
    }

    player.x = Math.max(
        0,
        Math.min(canvas.width - player.width, player.x)
    );
}

function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obstacle = obstacles[i];

        obstacle.y += obstacle.speed;

        if (collision(player, obstacle)) {
            obstacles.splice(i, 1);
            lives--;

            updateStats();

            if (lives <= 0) {
                endGame();
                return;
            }

            continue;
        }

        if (obstacle.y > canvas.height) {
            obstacles.splice(i, 1);
            score += 10;

            level = Math.floor(score / 100) + 1;

            updateStats();

            if (score > highScore) {
                highScore = score;
                localStorage.setItem("neonHighScore", highScore);
            }
        }
    }
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#25254d";
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function gameLoop(timestamp) {
    if (!gameRunning || paused) return;

    drawBackground();
    movePlayer();

    if (timestamp - lastSpawn > Math.max(250, 900 - level * 70)) {
        createObstacle();
        lastSpawn = timestamp;
    }

    updateObstacles();
    drawObstacles();
    drawPlayer();

    if (gameRunning && !paused) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    cancelAnimationFrame(animationId);

    resetGame();

    gameRunning = true;
    paused = false;

    overlay.style.display = "none";
    pauseBtn.textContent = "PAUSE";

    animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;

    cancelAnimationFrame(animationId);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("neonHighScore", highScore);
    }

    updateStats();

    message.textContent = "GAME OVER!";
    description.textContent = "Your Score: " + score;
    startBtn.textContent = "PLAY AGAIN";

    overlay.style.display = "flex";
}

function togglePause() {
    if (!gameRunning) return;

    paused = !paused;

    if (paused) {
        cancelAnimationFrame(animationId);

        message.textContent = "PAUSED";
        description.textContent = "Take a break!";
        startBtn.textContent = "RESUME";
        overlay.style.display = "flex";

        pauseBtn.textContent = "RESUME";
    } else {
        overlay.style.display = "none";
        pauseBtn.textContent = "PAUSE";

        animationId = requestAnimationFrame(gameLoop);
    }
}

startBtn.addEventListener("click", () => {
    if (paused) {
        paused = false;
        overlay.style.display = "none";
        pauseBtn.textContent = "PAUSE";
        animationId = requestAnimationFrame(gameLoop);
    } else {
        startGame();
    }
});

pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", startGame);

document.addEventListener("keydown", event => {
    keys[event.key] = true;

    if (
        ["ArrowLeft", "ArrowRight", " "].includes(event.key)
    ) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", event => {
    keys[event.key] = false;
});

resetGame();
drawBackground();
drawPlayer();
