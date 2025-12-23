// Matter.js setup
const {
    Engine, Render, Runner, Bodies, Body, Composite,
    Constraint, Events
} = Matter;

const engine = Engine.create();
const world = engine.world;

// Canvas
const canvas = document.getElementById("game");
const width = 450, height = 700;

// Render
const render = Render.create({
    engine: engine,
    canvas: canvas,
    options: {
        width,
        height,
        wireframes: false,
        background: "#222"
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// -----------------------------
// GAME STATE
// -----------------------------
let gameStarted = false;
let lives = 5;
let score = 0;

// UI update
function updateUI() {
    document.getElementById("score").innerText = score;
}

// -----------------------------
// ARENA
// -----------------------------

// Dinding mengerucut
// Kiri dan kanan miring ke dalam
const walls = [
    Bodies.rectangle(width/2, -10, width, 20, { isStatic: true }),
    Bodies.rectangle(width/2, height+10, width, 20, { isStatic: true }),

    // Dinding kiri miring
    Bodies.rectangle(80, 400, 20, 550, {
        isStatic: true,
        angle: -0.25
    }),

    // Dinding kanan miring
    Bodies.rectangle(width-80, 400, 20, 550, {
        isStatic: true,
        angle: 0.25
    }),
];

Composite.add(world, walls);

// -----------------------------
// BALL
// -----------------------------
let ball = null;

function spawnBall() {
    ball = Bodies.circle(width/2, 120, 12, {
        restitution: 0.9,
        friction: 0.002,
        density: 0.002
    });
    Composite.add(world, ball);
}

// -----------------------------
// BUMPERS
// -----------------------------
function bumper(x, y, r) {
    return Bodies.circle(x, y, r, {
        isStatic: true,
        render: { fillStyle: "#ff4444" }
    });
}

Composite.add(world, [
    bumper(150, 220, 28),
    bumper(300, 220, 28),
    bumper(225, 340, 22),
]);

// -----------------------------
// FLIPPERS
// -----------------------------
function createFlipper(x, y, dir) {
    const flipper = Bodies.rectangle(x, y, 90, 20, {
        render: { fillStyle: "#66ccff" }
    });

    const pivot = Bodies.circle(x, y, 5, {
        isStatic: true,
        render: { visible: false }
    });

    const hinge = Constraint.create({
        bodyA: flipper,
        bodyB: pivot,
        stiffness: 1,
        length: 0
    });

    Composite.add(world, [flipper, pivot, hinge]);
    return flipper;
}

const leftFlipper = createFlipper(170, 580, -1);
const rightFlipper = createFlipper(280, 580, 1);

// FLIPPER CONTROL
document.addEventListener("keydown", e => {
    if (!gameStarted) return;

    if (e.key === "ArrowLeft") {
        Body.setAngularVelocity(leftFlipper, -1.8);
    }
    if (e.key === "ArrowRight") {
        Body.setAngularVelocity(rightFlipper, 1.8);
    }
    if (e.code === "Space") {
        // Launch ball
        Body.setVelocity(ball, { x: 0, y: -18 });
    }
});

// -----------------------------
// DEATH ZONE
// -----------------------------
const deathZone = Bodies.rectangle(width/2, height - 10, width, 20, {
    isStatic: true,
    isSensor: true, // bola bisa tembus
    render: { visible: false }
});
Composite.add(world, deathZone);

// Detect ball falling
Events.on(engine, "collisionStart", event => {
    event.pairs.forEach(pair => {
        if (pair.bodyA === deathZone || pair.bodyB === deathZone) {
            loseLife();
        }
    });
});

// -----------------------------
// LIFE SYSTEM
// -----------------------------
function loseLife() {
    lives--;
    Composite.remove(world, ball);
    
    if (lives > 0) {
        spawnBall();
    } else {
        gameOver();
    }
}

function gameOver() {
    alert("GAME OVER! Score: " + score);
    resetGame();
}

// -----------------------------
// PUBLIC FUNCTIONS (called from HTML)
// -----------------------------
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    lives = 5;
    score = 0;
    updateUI();
    spawnBall();
}

function resetGame() {
    location.reload();
}

// -----------------------------
// SIMPLE SCORE SYSTEM
// -----------------------------
Events.on(engine, "collisionStart", event => {
    event.pairs.forEach(pair => {
        const a = pair.bodyA;
        const b = pair.bodyB;

        // Bumper hit = +100
        if (a.label === "Circle Body" && b.isStatic) {
            score += 100;
            updateUI();
        }
    });
});
