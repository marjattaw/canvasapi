// Canvas ja konteksti
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Kuvan lataus
const playerImage = new Image();
playerImage.src = "images/enzio.png"; // Pelaajan kuvan tiedoston nimi

const backgroundImage = new Image();
backgroundImage.src = "images/taustakuva.png"; // Taustakuvan tiedoston nimi

// Pelin muuttujat
let score = 0;
let gameSpeed = 3;
let gravity = 0.5;
let isJumping = false;
let jumpVelocity = -10;

// Taustan sijaintimuuttujat
let backgroundX = 0;

// Tekstin näyttämiseen liittyvät muuttujat
let showLevelText = true;
let levelTextOpacity = 1;

let showCrashText = false;
let crashTextOpacity = 1;
let crashTextShake = 0;

// Pelaajan hahmo
const player = {
    x: 50,
    y: canvas.height - 50,
    width: 60,
    height: 60,
    velocityY: 0,
    draw() {
        // Piirrä hahmo kuvan avulla
        ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
    },
    update() {
        if (isJumping) {
            this.velocityY += gravity; // Lisää painovoima hyppyyn
            this.y += this.velocityY; // Päivitä Y-koordinaatti
            if (this.y >= canvas.height - this.height) { // Palaa maahan
                this.y = canvas.height - this.height;
                this.velocityY = 0;
                isJumping = false;
            }
        }
        this.draw();
    }
};

// Esteet
const obstacles = [];
function createObstacle() {
    const obstacleHeight = Math.random() * 50 + 20;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - obstacleHeight,
        width: 30,
        height: obstacleHeight,
        color: "green",
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    });
}

// Piirrä liikkuva tausta
function drawBackground() {
    // Piirrä kaksi taustaa vierekkäin
    ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    // Siirrä taustaa vasemmalle
    backgroundX -= gameSpeed;

    // Nollaa taustan sijainti, kun ensimmäinen osa menee ulos näkyvistä
    if (backgroundX <= -canvas.width) {
        backgroundX = 0;
    }
}

// Piirrä tason teksti
function drawLevelText() {
    if (showLevelText) {
        ctx.save();
        ctx.globalAlpha = levelTextOpacity; // Aseta tekstin läpinäkyvyys
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("TASO 1", canvas.width / 2, canvas.height / 2);
        ctx.restore();

        // Vähennä tekstin läpinäkyvyyttä
        levelTextOpacity -= 0.01;
        if (levelTextOpacity <= 0) {
            showLevelText = false; // Piilota teksti
        }
    }
}

// Piirrä törmäysteksti
function drawCrashText() {
    if (showCrashText) {
        ctx.save();
        ctx.globalAlpha = crashTextOpacity; // Aseta tekstin läpinäkyvyys
        ctx.font = "48px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";

        // Tärinäefekti
        const shake = Math.sin(crashTextShake) * 5;
        ctx.fillText("JÄIT KIINNI", canvas.width / 2 + shake, canvas.height / 2 + shake);
        ctx.restore();

        // Vähennä tekstin läpinäkyvyyttä
        crashTextOpacity -= 0.01;
        crashTextShake += 0.5;
        if (crashTextOpacity <= 0) {
            showCrashText = false; // Piilota teksti
        }
    }
}

// Pelin päivitys
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Tyhjennä canvas

    // Piirrä liikkuva tausta
    drawBackground();

    // Piirrä tason teksti
    drawLevelText();

    // Piirrä törmäysteksti
    drawCrashText();

    // Päivitä pelaaja
    player.update();

    // Päivitä esteet
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacle.x -= gameSpeed; // Liikuta esteitä vasemmalle
        obstacle.draw();

        // Törmäyksen tunnistus
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            showCrashText = true; // Näytä "JÄIT KIINNI" -teksti
            crashTextOpacity = 1; // Resetoi läpinäkyvyys
            crashTextShake = 0; // Resetoi tärinä
            resetGame();
            return;
        }

        // Poista esteet, jotka menevät ulos ruudusta
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            score++; // Kasvata pisteitä
            document.getElementById("score").textContent = score;
        }
    }

    // Luo uusia esteitä
    if (Math.random() < 0.01) {
        createObstacle();
    }

    requestAnimationFrame(updateGame); // Animaatiolooppi
}

// Nollaa peli
function resetGame() {
    score = 0;
    gameSpeed = 3;
    obstacles.length = 0; // Tyhjennä esteet
    player.y = canvas.height - player.height;
    backgroundX = 0; // Nollaa taustan sijainti
    document.getElementById("score").textContent = score;
}

// Hyppy-toiminto
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !isJumping) {
        isJumping = true;
        player.velocityY = jumpVelocity; // Aseta hyppyvoima
    }
});

// Aloita peli
updateGame();
