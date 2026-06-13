// ============================================
// 1. LOADING SCREEN
// ============================================
window.addEventListener("load", function() {
  const loader = document.getElementById("loader");
  loader.classList.add("hidden");
});

// ============================================
// 2. SCROLL ANIMATION
// ============================================
setTimeout(function() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll(".fade-up").forEach(function(el) {
    observer.observe(el);
  });
}, 100);


// ============================================
// 3. ACTIVE NAV
// ============================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const navObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      navLinks.forEach(function(link) {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + entry.target.id) {
          link.classList.add("active");
        }
      });
    }
  });
}, { threshold: 0.3 });

sections.forEach(function(section) {
  navObserver.observe(section);
});

// ============================================
// PORTFOLIO MODAL
// ============================================
function openModal(id) {
  document.getElementById("portfolioOverlay").classList.add("active");
  document.getElementById("modal-" + id).classList.add("active");
  document.body.style.overflow = "hidden";
  // Reasoning: lock scroll body waktu modal terbuka
}

function closeModal() {
  document.getElementById("portfolioOverlay").classList.remove("active");
  document.querySelectorAll(".portfolio-modal").forEach(function(m) {
    m.classList.remove("active");
  });
  document.body.style.overflow = "";
}

// Close with Escape key
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && document.querySelector(".portfolio-modal.active")) {
    closeModal();
  }
});

// ============================================
// 4. SKATE EASTER EGG GAME
// ============================================

// Trigger: klik AZ logo 3x
let logoClickCount = 0;
let logoClickTimer = null;
const navLogo = document.querySelector(".nav-logo-img");
const skateGame = document.getElementById("skateGame");
const gameClose = document.getElementById("gameClose");

navLogo.addEventListener("click", function() {
  logoClickCount++;
  
  clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(function() {
    logoClickCount = 0;
  }, 1000);

  if (logoClickCount === 3) {
    logoClickCount = 0;
    startGame();
  }
});

gameClose.addEventListener("click", function() {
  skateGame.classList.remove("active");
  stopGame();
});

// Game variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameRunning = false;
let gameLoop = null;
let score = 0;
let gameSpeed = 4;
let frames = 0;
let lastObstacleX = 800;


// Player
const player = {
  x: 80,
  y: 220,
  w: 40,
  h: 50,
  vy: 0,
  gravity: 0.6,
  jumpForce: -13,
  grounded: true,
  grinding: false,
  grindTimer: 0,
  wheelRotation: 0,

  jump() {
    if (this.grounded || this.grinding) {
      this.vy = this.jumpForce;
      this.grounded = false;
      this.grinding = false;
    }
  },

  update() {
    if (this.grinding) {
      this.vy = 0;
      this.grindTimer--;
      if (this.grindTimer <= 0) {
        this.grinding = false;
      }
      return;
    }

    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y >= 220) {
      this.y = 220;
      this.vy = 0;
      this.grounded = true;
    }

    if (this.grounded) {
      this.wheelRotation += gameSpeed * 0.15;
    }
  },

  draw() {
    const px = this.x;
    const py = this.y;
    const isAir = !this.grounded && !this.grinding;

    // Grind effect — spark particles
    if (this.grinding) {
      ctx.fillStyle = "#3b82f6";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(
          px + 20 + (Math.random() - 0.5) * 20,
          py + 48 + Math.random() * 6,
          Math.random() * 2 + 1,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Board
    ctx.fillStyle = this.grinding ? "#ffaa00" : "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(px - 5, py + 40, 52, 8, 3);
    ctx.fill();

    // Wheels
    [px + 2, px + 36].forEach(wx => {
      ctx.save();
      ctx.translate(wx + 4, py + 52);
      ctx.rotate(this.wheelRotation);
      ctx.fillStyle = "#f5f4f0";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(-1, -5, 2, 10);
      ctx.fillRect(-5, -1, 10, 2);
      ctx.restore();
    });

    // Body
    ctx.fillStyle = "#f5f4f0";
    ctx.fillRect(px + 8, py + 16, 20, 26);

    // Head
    ctx.fillStyle = "#f5f4f0";
    ctx.beginPath();
    ctx.arc(px + 18, py + 10, 12, 0, Math.PI * 2);
    ctx.fill();

    // Cap
    ctx.fillStyle = this.grinding ? "#ffaa00" : "#3b82f6";
    ctx.fillRect(px + 7, py + 2, 24, 6);
    ctx.fillRect(px + 5, py + 5, 6, 4);

    // Eyes
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.arc(px + 22, py + 10, 2, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = "#f5f4f0";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    if (isAir) {
      ctx.beginPath();
      ctx.moveTo(px + 8, py + 22);
      ctx.lineTo(px - 4, py + 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + 28, py + 22);
      ctx.lineTo(px + 40, py + 14);
      ctx.stroke();
    } else if (this.grinding) {
      // Arms out buat balance saat grinding
      ctx.beginPath();
      ctx.moveTo(px + 8, py + 22);
      ctx.lineTo(px - 8, py + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + 28, py + 22);
      ctx.lineTo(px + 44, py + 20);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(px + 8, py + 22);
      ctx.lineTo(px, py + 32);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + 28, py + 22);
      ctx.lineTo(px + 36, py + 32);
      ctx.stroke();
    }
  }
};

// Obstacles
let obstacles = [];

function spawnObstacle() {
  const minDistance = 300;
  const lastObs = obstacles[obstacles.length - 1];
  
  if (lastObs && lastObs.x > 820 - minDistance) return;

  const types = ["cone", "rail"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "cone") {
    obstacles.push({ x: 820, y: 228, w: 20, h: 32, type: "cone" });
  } else {
    obstacles.push({ x: 820, y: 224, w: 80, h: 8, type: "rail" });
  }
}

function drawObstacle(obs) {
  if (obs.type === "cone") {
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(obs.x + 10, obs.y - 20);
    ctx.lineTo(obs.x, obs.y + 12);
    ctx.lineTo(obs.x + 20, obs.y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(obs.x + 2, obs.y, 16, 4);
  } else if (obs.type === "rail") {
    // Rail glow effect
    ctx.shadowColor = "#888";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#999";
    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
    ctx.fillStyle = "#ccc";
    ctx.fillRect(obs.x, obs.y, obs.w, 2);
    ctx.shadowBlur = 0;
  }
}

function checkCollision(obs) {
  const playerLeft = player.x + 10;
  const playerRight = player.x + 30;
  const playerTop = player.y + 20;
  const playerBottom = player.y + 50;

  const overlapsX = playerLeft < obs.x + obs.w && playerRight > obs.x;
  const overlapsY = playerTop < obs.y + obs.h && playerBottom > obs.y;

  if (!overlapsX || !overlapsY) return false;

  if (obs.type === "cone") {
    // Cone selalu mati
    return true;
  }

  if (obs.type === "rail") {
  
    // trigger grind, bukan mati
    const landingFromAbove = player.vy >= 0 && playerBottom <= obs.y + obs.h + 10;
    if (landingFromAbove && !player.grinding) {
      player.grinding = true;
      player.y = obs.y - 44;
      // snap player ke atas rail
      player.grindTimer = Math.floor(obs.w / gameSpeed) + 5;
      score += 15;
      // bonus 15 poin per grind
      return false;
    }
    // Nabrak rail dari samping = metong
    return !player.grinding;
  }

  return false;
}

function drawGround() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 268, canvas.width, 32);
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(0, 268, canvas.width, 2);
}

function drawScore() {
  document.getElementById("gameScore").textContent = score;
}

function drawGrindLabel() {
  if (player.grinding) {
    ctx.fillStyle = "#ffaa00";
    ctx.font = "bold 16px 'Space Grotesk'";
    ctx.textAlign = "left";
    ctx.fillText("GRIND! +" , 20, 30);
  }
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(gameLoop);
  saveHighScore(score);
  const hs = getHighScore();

  ctx.fillStyle = "rgba(10,10,10,0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#3b82f6";
  ctx.font = "bold 36px 'Space Grotesk'";
  ctx.textAlign = "center";
  ctx.fillText("BAILED!", canvas.width / 2, 100);

  ctx.fillStyle = "#f5f4f0";
  ctx.font = "18px 'Space Grotesk'";
  ctx.fillText("Score: " + score, canvas.width / 2, 145);

  ctx.fillStyle = "#3b82f6";
  ctx.font = "14px 'Space Grotesk'";
  ctx.fillText("Best: " + hs, canvas.width / 2, 175);

  ctx.fillStyle = "#888";
  ctx.font = "14px 'Space Grotesk'";
  ctx.fillText("SPACE to retry", canvas.width / 2, 215);
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();
  player.update();
  player.draw();
  drawGrindLabel();

  // Difficulty label
const level = Math.floor(score / 30) + 1;
ctx.fillStyle = "#333";
ctx.font = "11px 'Space Grotesk'";
ctx.textAlign = "right";
ctx.fillText("LVL " + level, canvas.width - 16, 24);

  frames++;

  // Spawn dengan jarak minimum
    if (frames % 60 === 0) {
    spawnObstacle();
    }

  obstacles = obstacles.filter(obs => {
    if (obs.x + obs.w < 0) {
      lastObstacleX = Math.min(lastObstacleX, 0);
      return false;
    }
    return true;
  });

  obstacles.forEach(obs => {
    obs.x -= gameSpeed;
    lastObstacleX = Math.min(...obstacles.map(o => o.x));
    drawObstacle(obs);
    if (checkCollision(obs)) {
      gameOver();
      gameRunning = false;
    }
  });

  if (frames % 6 === 0) {
  score++;
  
  // Speed naik tiap 20 poin
  gameSpeed = 4 + Math.floor(score / 20) * 0.6;
}

// Spawn interval makin pendek seiring score naik, wayoloo
const spawnInterval = Math.max(120 - Math.floor(score / 15) * 8, 55);

if (frames % spawnInterval === 0) {
  spawnObstacle();
}

  drawScore();

  if (gameRunning) {
    gameLoop = requestAnimationFrame(loop);
  }
}

function startGame() {
  score = 0;
  gameSpeed = 4;
  frames = 0;
  obstacles = [];
  lastObstacleX = 800;
  player.y = 220;
  player.vy = 0;
  player.grounded = true;
  player.grinding = false;
  gameRunning = true;
  skateGame.classList.add("active");
  document.getElementById("gameBest").textContent = getHighScore();
  loop();
}

// High score dari localStorage
function getHighScore() {
  return parseInt(localStorage.getItem("skateHighScore") || "0");
}

function saveHighScore(s) {
  if (s > getHighScore()) {
    localStorage.setItem("skateHighScore", s);
  }
}

function stopGame() {
  gameRunning = false;
  cancelAnimationFrame(gameLoop);
}

document.addEventListener("keydown", function(e) {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    if (!gameRunning && skateGame.classList.contains("active")) {
      startGame();
    } else {
      player.jump();
    }
  }
  if (e.code === "Escape") {
    skateGame.classList.remove("active");
    stopGame();
  }
});

canvas.addEventListener("click", function() {
  if (!gameRunning && skateGame.classList.contains("active")) {
    startGame();
  } else {
    player.jump();
  }
});