# Kaplay Game Development Guide

Kaplay is a modern JavaScript game library that makes it easy to create 2D games with a simple and intuitive API. This guide will walk you through creating your first game using Kaplay.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Basic Setup](#basic-setup)
3. [Core Concepts](#core-concepts)
4. [Creating Your First Game](#creating-your-first-game)
5. [Game Objects and Components](#game-objects-and-components)
6. [Input Handling](#input-handling)
7. [Sprites and Animation](#sprites-and-animation)
8. [Sound and Music](#sound-and-music)
9. [Collision Detection](#collision-detection)
10. [Scene Management](#scene-management)
11. [Advanced Features](#advanced-features)
12. [Complete Example Game](#complete-example-game)

## Getting Started

### Installation

You can use Kaplay in several ways:

#### CDN (Recommended for beginners)
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Kaplay Game</title>
</head>
<body>
    <script src="https://unpkg.com/kaplay@3001.0.12/dist/kaplay.js"></script>
    <script>
        // Your game code here
    </script>
</body>
</html>
```

#### NPM
```bash
npm install kaplay
```

#### Other Package Managers
```bash
yarn add kaplay
pnpm add kaplay
bun add kaplay
```

#### Quick Project Setup
```bash
npx create-kaplay my-game
```

### TypeScript Support

For TypeScript projects, you can import global types:

```typescript
import "kaplay/global";

vec2(10, 10); // typed!
```

Or import specific types:
```typescript
import type { TextCompOpt } from "kaplay"
import type * as KA from "kaplay" // namespace import

interface MyTextCompOpt extends KA.TextCompOpt {
  fallback: string;
}
```

Configure your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["./node_modules/kaplay/dist/declaration/global.d.ts"]
  }
}
```

## Basic Setup

### Initializing Kaplay

#### Global Mode (Recommended for beginners)
```javascript
// Initialize with global functions
kaplay({
    background: "#6d80fa",
    width: 800,
    height: 600,
    global: true
});

// Functions are available globally
add([sprite("player")]);
```

#### Non-Global Mode
```javascript
const k = kaplay({
    background: "#6d80fa",
    width: 800,
    height: 600,
    global: false
});

// Use the returned instance
k.add([k.sprite("player")]);
```

### Basic Game Structure

```javascript
// Start a game
kaplay({
    background: "#6d80fa"
});

// Load an image
loadSprite("bean", "https://play.kaplayjs.com/bean.png");

// Add a sprite to the scene
add([
    sprite("bean") // it renders as a sprite
]);
```

## Core Concepts

### Game Objects and Components

Kaplay uses a component-based architecture. Game objects are created by combining components:

```javascript
// Add a Game Object to the scene from a list of components
const player = add([
    rect(40, 40),        // it renders as a rectangle
    pos(100, 200),       // it has a position (coordinates)
    area(),              // it has a collider
    body(),              // it is a physical body which responds to physics
    health(8),           // it has 8 health points
    // Give it tags for easier group behaviors
    "friendly",
    // Give plain objects fields for associated data
    {
        dir: vec2(-1, 0),
        dead: false,
        speed: 240
    }
]);
```

### Creating Objects Without Adding to Scene

```javascript
const obj = make([sprite("bean"), pos(120, 60)]);
// Later add it to the scene
add(obj);
```

## Creating Your First Game

Let's create a simple game step by step:

### 1. Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>My First Kaplay Game</title>
</head>
<body>
    <script src="https://unpkg.com/kaplay@3001.0.12/dist/kaplay.js"></script>
    <script>
        // Initialize the game
        kaplay({
            background: "#87CEEB",
            width: 800,
            height: 600
        });

        // Load assets
        loadSprite("player", "https://play.kaplayjs.com/bean.png");
        loadSprite("enemy", "https://play.kaplayjs.com/ghosty.png");
        loadSprite("coin", "https://play.kaplayjs.com/coin.png");

        // Create player
        const player = add([
            sprite("player"),
            pos(100, 300),
            area(),
            body(),
            "player"
        ]);

        // Add some enemies
        for (let i = 0; i < 3; i++) {
            add([
                sprite("enemy"),
                pos(300 + i * 100, 300),
                area(),
                "enemy"
            ]);
        }

        // Add coins
        for (let i = 0; i < 5; i++) {
            add([
                sprite("coin"),
                pos(200 + i * 80, 200),
                area(),
                "coin"
            ]);
        }
    </script>
</body>
</html>
```

## Game Objects and Components

### Common Components

#### Visual Components
```javascript
// Sprite component
sprite("player")

// Rectangle
rect(40, 40)

// Circle
circle(16)

// Text
text("Hello World", {
    size: 24,
    font: "Arial"
})
```

#### Transform Components
```javascript
// Position
pos(100, 200)

// Scale
scale(2)        // uniform scale
scale(2, 3)     // different x and y scale

// Rotation (in degrees)
rotate(45)

// Anchor point
anchor("center")
```

#### Physics Components
```javascript
// Area for collision detection
area()

// Physics body
body()

// Static body (doesn't move)
body({ isStatic: true })

// Solid (blocks other solid objects)
solid()
```

#### Game Logic Components
```javascript
// Health system
health(100)

// Timer component
timer()

// State machine
state("idle")
```

### Working with Game Objects

#### Finding Objects
```javascript
// Get all objects with tag "enemy"
const enemies = get("enemy");

// Get with options
const enemies = get("enemy", {
    recursive: true,    // search in children too
    liveUpdate: true   // auto-update when objects are added/destroyed
});

// Get first object with tag
const player = get("player")[0];
```

#### Object Hierarchy (Scene Graph)
```javascript
const player = add([sprite("player"), pos(160, 120)]);

// Add children to player
const sword = player.add([
    sprite("sword"),
    pos(20, 20),    // relative to parent
    rotate(20)
]);

const hat = player.add([
    sprite("hat"),
    pos(0, -10)     // relative to parent
]);

// Children move with parent
player.moveBy(100, 200);

// Children are destroyed with parent
player.destroy();
```

## Input Handling

### Keyboard Input

```javascript
// Key press (single press)
onKeyPress("space", () => {
    player.jump();
});

// Key down (continuous)
onKeyDown("w", () => {
    player.move(0, -100);
});

// Multiple keys
onKeyPress(["w", "up"], () => {
    player.jump();
});

// Key release
onKeyRelease("space", () => {
    // Do something when space is released
});
```

### Mouse Input

```javascript
// Mouse press
onMousePress(() => {
    const mousePos = mousePos();
    // Do something at mouse position
});

// Mouse move
onMouseMove(() => {
    const pos = mousePos();
    cursor.pos = pos;
});
```

### Custom Button Bindings

```javascript
// Define custom buttons
kaplay({
    buttons: {
        jump: {
            keyboard: ["space", "up"],
            gamepad: ["south"]
        },
        attack: {
            keyboard: ["x"],
            gamepad: ["west"]
        }
    }
});

// Use custom buttons
onButtonPress("jump", () => {
    player.jump();
});

// Check last input device
onButtonPress(() => {
    const device = getLastInputDeviceType(); // "keyboard", "mouse", or "gamepad"
    // Update UI accordingly
});
```

### Gamepad Support

```javascript
onGamepadButtonPress("south", (btn, gamepad) => {
    console.log(`Button pressed on gamepad ${gamepad.index}`);
    player.jump();
});
```

## Sprites and Animation

### Loading Sprites

#### Single Sprite
```javascript
loadSprite("player", "sprites/player.png");
```

#### Sprite with Animation Frames
```javascript
loadSprite("player", [
    "sprites/player_idle.png",
    "sprites/player_run.png",
    "sprites/player_jump.png"
]);
```

#### Sprite Atlas
```javascript
loadSprite("hero", "hero.png", {
    sliceX: 9,
    anims: {
        idle: { from: 0, to: 3, speed: 3, loop: true },
        run: { from: 4, to: 7, speed: 10, loop: true },
        hit: 8
    }
});
```

#### Advanced Sprite Atlas
```javascript
loadSpriteAtlas("/sprites/dungeon.png", {
    wizard: {
        x: 128,
        y: 140,
        width: 144,
        height: 28,
        sliceX: 9,
        anims: {
            bouncy: {
                frames: [8, 5, 0, 3, 2, 3, 0, 5],
                speed: 10,
                loop: true
            }
        }
    }
});
```

### Using Animations

```javascript
// Add sprite with animation
const player = add([
    sprite("hero", { anim: "idle" }),
    pos(100, 100)
]);

// Play animation
player.play("run");

// Check current animation
console.log(player.getCurAnim().name);

// Check if animation exists
if (player.hasAnim("walk")) {
    player.play("walk");
}

// Handle animation end
player.onAnimEnd((anim) => {
    if (anim === "attack") {
        player.play("idle");
    }
});
```

### 9-Slice Scaling

```javascript
loadSprite("panel", "/sprites/panel.png", {
    slice9: {
        left: 8,
        right: 8,
        top: 8,
        bottom: 8
    }
});

const panel = add([sprite("panel")]);

// Resize without distorting corners
panel.width = 200;
panel.height = 150;
```

## Sound and Music

### Loading Audio

```javascript
// Load sound effects
loadSound("jump", "sounds/jump.wav");
loadSound("coin", "sounds/coin.wav");

// Load streaming music (doesn't block loading)
loadMusic("bgm", "music/background.mp3");
```

### Playing Audio

```javascript
// Play sound effect
play("jump");

// Play with options
play("coin", {
    volume: 0.5,
    speed: 1.2,
    loop: false
});

// Play music
const music = play("bgm", {
    loop: true,
    volume: 0.3
});

// Control playback
music.volume = 0.5;
music.speed = 2;
music.loop = true;
music.stop();
```

## Collision Detection

### Basic Collision

```javascript
// Objects need area() component for collision
const player = add([
    sprite("player"),
    pos(100, 100),
    area(),
    "player"
]);

const enemy = add([
    sprite("enemy"),
    pos(200, 100),
    area(),
    "enemy"
]);

// Handle collision
player.onCollide("enemy", (enemy) => {
    // Player hit enemy
    player.hurt(1);
});
```

### Advanced Collision

```javascript
// Custom collision area
add([
    sprite("player"),
    area({
        scale: 0.5,           // 50% of sprite size
        offset: vec2(0, 12),  // offset from center
        width: 32,            // custom width
        height: 48            // custom height
    })
]);

// Ignore certain collisions
add([
    sprite("player"),
    area({
        collisionIgnore: ["cloud", "particle"]
    })
]);

// Get all current collisions
for (const collision of player.getCollisions()) {
    const target = collision.target;
    if (target.is("chest")) {
        target.open();
    }
}
```

### Physics Resolution

```javascript
// Both objects need solid() for automatic collision resolution
const player = add([
    sprite("player"),
    area(),
    body(),
    solid(),
    "player"
]);

const wall = add([
    sprite("wall"),
    area(),
    solid(),
    "wall"
]);

// Movement with automatic collision resolution
onKeyDown("left", () => {
    player.move(-120, 0); // Automatically handles collision with walls
});

// Prevent collision resolution conditionally
player.onBeforePhysicsResolve((collision) => {
    if (collision.target.is("platform") && player.isJumping()) {
        collision.preventResolution(); // Allow jumping through platforms
    }
});
```

## Scene Management

### Defining Scenes

```javascript
// Define a scene
scene("game", () => {
    // Game scene content
    const player = add([
        sprite("player"),
        pos(100, 100),
        area(),
        body()
    ]);

    // Scene-specific input
    onKeyPress("space", () => {
        player.jump();
    });
});

scene("menu", () => {
    // Menu scene content
    add([
        text("Press SPACE to start"),
        pos(center()),
        anchor("center")
    ]);

    onKeyPress("space", () => {
        go("game");
    });
});

// Start with menu scene
go("menu");
```

### Scene Transitions

```javascript
// Go to scene
go("game");

// Go to scene with data
go("game", { level: 2, score: 1000 });

// In the scene, access the data
scene("game", (data) => {
    const level = data.level || 1;
    const score = data.score || 0;
});
```

## Advanced Features

### Layers

```javascript
// Define layers (back to front)
layers([
    "bg",      // background
    "game",    // main game objects
    "ui"       // user interface
], "game");    // default layer

// Assign objects to layers
add([sprite("background"), layer("bg")]);
add([sprite("player"), layer("game")]);
add([text("Score: 0"), layer("ui")]);
```

### Custom Components

```javascript
function alwaysRight() {
    return {
        id: "alwaysRight",
        require: ["pos"],  // depends on pos component
        update() {
            this.move(100, 0);
        }
    };
}

// Use custom component
add([
    sprite("enemy"),
    pos(100, 100),
    alwaysRight()
]);
```

### Tweening and Animation

```javascript
// Tween object properties
onMousePress(() => {
    tween(
        player.pos.x,
        mousePos().x,
        1,                              // duration
        (val) => player.pos.x = val,    // setter
        easings.easeOutBounce           // easing function
    );
});

// Animate component properties
const rotatingBean = add([sprite("bean")]);
rotatingBean.animate("angle", [0, 360], {
    duration: 2,
    direction: "forward"
});
```

### Timers

```javascript
// Wait timer
const timer = wait(2, () => {
    console.log("2 seconds passed!");
});

// Loop timer
const loop = loop(1, () => {
    console.log("Every second");
});

// Control timers
timer.paused = true;
timer.resume();
loop.cancel();
```

### Shaders

```javascript
// Load custom shader
loadShader("invert", null, `
vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 c = def_frag();
    return vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);
}
`);

// Apply as post-effect
usePostEffect("invert");

// Apply to specific object
add([
    sprite("player"),
    shader("flashy", () => ({
        u_time: time()  // dynamic uniform
    }))
]);
```

### Level Creation

```javascript
// Define level layout
addLevel([
    "@  ^ $$",
    "======="
], {
    tileWidth: 32,
    tileHeight: 32,
    tiles: {
        "=": () => [sprite("grass"), area(), body({ isStatic: true })],
        "$": () => [sprite("coin"), area(), "coin"],
        "@": () => [sprite("player"), area(), body(), "player"]
    },
    wildcardTile: (symbol) => {
        if (symbol === "^") {
            return [sprite("spike"), area(), "danger"];
        }
    }
});
```

## Complete Example Game

Here's a complete simple platformer game:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Kaplay Platformer</title>
</head>
<body>
    <script src="https://unpkg.com/kaplay@3001.0.12/dist/kaplay.js"></script>
    <script>
        // Initialize game
        kaplay({
            background: "#87CEEB",
            width: 800,
            height: 600
        });

        // Load assets
        loadSprite("player", "https://play.kaplayjs.com/bean.png");
        loadSprite("enemy", "https://play.kaplayjs.com/ghosty.png");
        loadSprite("coin", "https://play.kaplayjs.com/coin.png");
        loadSound("jump", "https://play.kaplayjs.com/jump.wav");
        loadSound("coin", "https://play.kaplayjs.com/coin.wav");

        // Game variables
        let score = 0;

        // Create player
        const player = add([
            sprite("player"),
            pos(100, 400),
            area(),
            body(),
            "player",
            {
                speed: 200,
                jumpForce: 400
            }
        ]);

        // Create ground
        add([
            rect(800, 100),
            pos(0, 500),
            area(),
            body({ isStatic: true }),
            color(0, 255, 0),
            "ground"
        ]);

        // Create platforms
        const platforms = [
            { x: 200, y: 400, w: 100, h: 20 },
            { x: 400, y: 300, w: 100, h: 20 },
            { x: 600, y: 200, w: 100, h: 20 }
        ];

        platforms.forEach(platform => {
            add([
                rect(platform.w, platform.h),
                pos(platform.x, platform.y),
                area(),
                body({ isStatic: true }),
                color(139, 69, 19),
                "platform"
            ]);
        });

        // Create enemies
        for (let i = 0; i < 3; i++) {
            add([
                sprite("enemy"),
                pos(300 + i * 200, 450),
                area(),
                "enemy",
                {
                    dir: 1,
                    speed: 50
                }
            ]);
        }

        // Create coins
        for (let i = 0; i < 5; i++) {
            add([
                sprite("coin"),
                pos(150 + i * 150, 350),
                area(),
                "coin",
                {
                    collected: false
                }
            ]);
        }

        // Score display
        const scoreText = add([
            text(`Score: ${score}`),
            pos(20, 20),
            layer("ui")
        ]);

        // Player controls
        onKeyDown("left", () => {
            player.move(-player.speed, 0);
        });

        onKeyDown("right", () => {
            player.move(player.speed, 0);
        });

        onKeyPress("space", () => {
            if (player.isGrounded()) {
                player.jump(player.jumpForce);
                play("jump");
            }
        });

        // Enemy movement
        onUpdate("enemy", (enemy) => {
            enemy.move(enemy.dir * enemy.speed, 0);

            // Reverse direction at edges
            if (enemy.pos.x > 700 || enemy.pos.x < 100) {
                enemy.dir *= -1;
            }
        });

        // Coin rotation
        onUpdate("coin", (coin) => {
            if (!coin.collected) {
                coin.angle += 180 * dt();
            }
        });

        // Collisions
        player.onCollide("enemy", () => {
            // Game over
            go("gameOver");
        });

        player.onCollide("coin", (coin) => {
            if (!coin.collected) {
                coin.collected = true;
                coin.destroy();
                score += 10;
                scoreText.text = `Score: ${score}`;
                play("coin");
            }
        });

        // Fall death
        player.onUpdate(() => {
            if (player.pos.y > height()) {
                go("gameOver");
            }
        });

        // Game Over scene
        scene("gameOver", () => {
            add([
                text("Game Over!"),
                pos(center()),
                anchor("center"),
                color(255, 0, 0)
            ]);

            add([
                text(`Final Score: ${score}`),
                pos(center().x, center().y + 50),
                anchor("center")
            ]);

            add([
                text("Press R to restart"),
                pos(center().x, center().y + 100),
                anchor("center")
            ]);

            onKeyPress("r", () => {
                score = 0;
                go("game");
            });
        });

        // Start the game
        scene("game", () => {
            // Game scene is already set up above
        });

        go("game");
    </script>
</body>
</html>
```

## Best Practices

### Performance Tips

1. **Use object pooling** for frequently created/destroyed objects
2. **Limit the number of objects** on screen at once
3. **Use layers** to control rendering order efficiently
4. **Optimize collision detection** by using appropriate area sizes

### Code Organization

1. **Separate scenes** into different functions or files
2. **Use components** to create reusable game object behaviors
3. **Group related functionality** using tags
4. **Keep game state** in a centralized location

### Asset Management

1. **Preload all assets** before starting the game
2. **Use sprite atlases** for better performance
3. **Optimize image sizes** for web delivery
4. **Use appropriate audio formats** (MP3 for music, WAV for effects)

## Debugging

### Debug Mode

```javascript
// Enable debug mode
debug.inspect = true;

// Custom debug key
kaplay({
    debugKey: "l"  // Press 'l' to toggle debug mode
});

// Display custom properties
const obj = add([
    sprite("bean"),
    {
        health: 100,    // will show in debug
        damage: 10      // will show in debug
    }
]);
```

### Useful Debug Functions

```javascript
// Log to console
debug.log("Player position:", player.pos);

// Get root object
const root = getTreeRoot();

// Check object tags
console.log(player.tags);

// Get world area
const area = player.worldArea();
if (area.shape === "rect") {
    const width = area.p2.x - area.p1.x;
    const height = area.p2.y - area.p1.y;
}
```

This guide covers the essential concepts and features of Kaplay. The library is designed to be beginner-friendly while providing powerful features for more complex games. Start with simple projects and gradually incorporate more advanced features as you become comfortable with the basics.

For more detailed documentation and examples, visit the [official Kaplay documentation](https://kaplayjs.com/).
