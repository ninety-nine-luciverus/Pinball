// Setup Matter.js
const { Engine, Render, Runner, Bodies, Composite, Body, Events, Constraint } = Matter;

const engine = Engine.create();
const world = engine.world;

// Canvas setup
const width = 450;
const height = 700;

const render = Render.create({
    element: document.body,
    canvas: document.getElementById("game"),
    engine: engine,
    options: {
        width,
        height,
        wireframes: false,
        background: "#222"
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    Bodies.rectangle(width/2, -10, width, 20, { isStatic: true }),
    Bodies.rectangle(width/2, height+10, width, 20, { isStatic: true }),
    Bodies.rectangle(-10, height/2, 20, height, { isStatic: true }),
    Bodies.rectangle(width+10, height/2, 20, height, { isStatic: true })
];
Composite.add(world, walls);

// Ball
const ball = Bodies.circle(width/2, 100, 12, {
    restitution: 0.9,
    friction: 0.01,
    density: 0.002
});
Composite.add(world, ball);

// Bumper
function bumper(x, y, r) {
    return Bodies.circle(x, y, r, {
        isStatic: true,
        render: { fillStyle: "#ff4444" }
    });
}

Composite.add(world, [
    bumper(150, 250, 30),
    bumper(300, 250, 30),
    bumper(225, 380, 25)
]);

// Flippers
function createFlipper(x, y, isLeft) {
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

const leftFlipper = createFlipper(170, 580, true);
const rightFlipper = createFlipper(280, 580, false);

// Controls
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
        Body.setAngularVelocity(leftFlipper, -1.8);
    }
    if (e.key === "ArrowRight") {
        Body.setAngularVelocity(rightFlipper, 1.8);
    }
});

