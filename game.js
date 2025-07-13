// Initialize Kaplay
kaplay({
    background: "#000011",
    width: 800,
    height: 600,
    global: true
});

// Game state
let gameState = {
    wave: 1,
    score: 0,
    gold: 100,
    playerHealth: 100,
    maxHealth: 100,
    shipSpeed: 200,
    fireRate: 0.3,
    damage: 10,
    inventory: [],
    equipment: {
        weapon: null,
        shield: null,
        engine: null
    },
    planetItems: []
};

// Save/Load system
function saveGame() {
    localStorage.setItem('spaceExplorerSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('spaceExplorerSave');
    if (saved) {
        gameState = JSON.parse(saved);
        return true;
    }
    return false;
}

// Item definitions
const itemTypes = {
    weapon: {
        'Laser Cannon': { damage: 15, price: 50, color: [255, 100, 100] },
        'Plasma Gun': { damage: 25, price: 100, color: [100, 255, 100] },
        'Ion Blaster': { damage: 40, price: 200, color: [100, 100, 255] }
    },
    shield: {
        'Basic Shield': { health: 50, price: 75, color: [200, 200, 100] },
        'Energy Shield': { health: 100, price: 150, color: [100, 200, 200] },
        'Quantum Shield': { health: 200, price: 300, color: [200, 100, 200] }
    },
    engine: {
        'Boost Engine': { speed: 50, price: 60, color: [255, 200, 100] },
        'Warp Drive': { speed: 100, price: 120, color: [200, 255, 100] },
        'Quantum Drive': { speed: 200, price: 250, color: [100, 255, 200] }
    },
    consumable: {
        'Health Pack': { heal: 50, price: 25, color: [255, 100, 255] },
        'Gold Ore': { gold: 50, price: 0, color: [255, 215, 0] },
        'Energy Cell': { energy: 100, price: 30, color: [0, 255, 255] }
    }
};

// Generate random planet items
function generatePlanetItems() {
    const items = [];
    const itemCount = rand(5, 12);

    for (let i = 0; i < itemCount; i++) {
        const categories = Object.keys(itemTypes);
        const category = choose(categories);
        const itemNames = Object.keys(itemTypes[category]);
        const itemName = choose(itemNames);

        items.push({
            type: category,
            name: itemName,
            pos: vec2(rand(100, 700), rand(100, 500)),
            ...itemTypes[category][itemName]
        });
    }

    return items;
}

// ===== MAIN MENU SCENE =====
scene("menu", () => {
    add([
        text("SPACE EXPLORER", { size: 48 }),
        pos(center().x, 150),
        anchor("center"),
        color(100, 200, 255)
    ]);

    add([
        text("Survive waves of enemies, explore planets, upgrade your ship!", { size: 16 }),
        pos(center().x, 200),
        anchor("center"),
        color(200, 200, 200)
    ]);

    const newGameBtn = add([
        rect(200, 50),
        pos(center().x, 300),
        anchor("center"),
        color(50, 100, 150),
        area(),
        "button"
    ]);

    add([
        text("NEW GAME", { size: 20 }),
        pos(center().x, 300),
        anchor("center"),
        color(255, 255, 255)
    ]);

    const loadGameBtn = add([
        rect(200, 50),
        pos(center().x, 370),
        anchor("center"),
        color(50, 100, 150),
        area(),
        "button"
    ]);

    add([
        text("LOAD GAME", { size: 20 }),
        pos(center().x, 370),
        anchor("center"),
        color(255, 255, 255)
    ]);

    newGameBtn.onClick(() => {
        gameState = {
            wave: 1,
            score: 0,
            gold: 100,
            playerHealth: 100,
            maxHealth: 100,
            shipSpeed: 200,
            fireRate: 0.3,
            damage: 10,
            inventory: [],
            equipment: {
                weapon: null,
                shield: null,
                engine: null
            },
            planetItems: []
        };
        go("shooter");
    });

    loadGameBtn.onClick(() => {
        if (loadGame()) {
            go("shooter");
        } else {
            add([
                text("No save file found!", { size: 16 }),
                pos(center().x, 450),
                anchor("center"),
                color(255, 100, 100),
                lifespan(2)
            ]);
        }
    });
});

// ===== SHOOTER SCENE =====
scene("shooter", () => {
    let player;
    let enemies = [];
    let bullets = [];
    let enemyBullets = [];
    let lastShot = 0;
    let enemiesKilled = 0;
    let waveEnemyCount = gameState.wave * 3 + 2;

    // Calculate current stats based on equipment
    let currentSpeed = gameState.shipSpeed;
    let currentDamage = gameState.damage;
    let currentMaxHealth = gameState.maxHealth;
    let currentFireRate = gameState.fireRate;

    if (gameState.equipment.weapon) {
        currentDamage += gameState.equipment.weapon.damage || 0;
        currentFireRate = Math.max(0.1, gameState.fireRate - 0.05); // Better weapons fire faster
    }
    if (gameState.equipment.engine) {
        currentSpeed += gameState.equipment.engine.speed || 0;
    }
    if (gameState.equipment.shield) {
        currentMaxHealth += gameState.equipment.shield.health || 0;
        // Heal player if max health increased
        if (gameState.playerHealth < currentMaxHealth) {
            gameState.playerHealth = Math.min(currentMaxHealth, gameState.playerHealth + 50);
        }
    }

    // Create player ship
    player = add([
        rect(20, 30),
        pos(center().x, height() - 100),
        anchor("center"),
        area(),
        color(100, 150, 255),
        "player",
        {
            health: gameState.playerHealth,
            maxHealth: currentMaxHealth,
            speed: currentSpeed,
            damage: currentDamage,
            fireRate: currentFireRate
        }
    ]);

    // Spawn enemies
    function spawnEnemies() {
        for (let i = 0; i < waveEnemyCount; i++) {
            const enemy = add([
                rect(15, 15),
                pos(rand(50, width() - 50), rand(-200, -50)),
                anchor("center"),
                area(),
                color(255, 100, 100),
                "enemy",
                {
                    speed: rand(50, 100),
                    health: Math.floor(gameState.wave / 2) + 1,
                    lastShot: 0
                }
            ]);
            enemies.push(enemy);
        }
    }

    spawnEnemies();

    // UI
    const healthBar = add([
        rect(200, 20),
        pos(20, 20),
        color(100, 100, 100)
    ]);

    const healthFill = add([
        rect((player.health / player.maxHealth) * 200, 20),
        pos(20, 20),
        color(100, 255, 100)
    ]);

    const waveText = add([
        text(`Wave: ${gameState.wave}`, { size: 20 }),
        pos(20, 50),
        color(255, 255, 255)
    ]);

    const scoreText = add([
        text(`Score: ${gameState.score}`, { size: 20 }),
        pos(20, 80),
        color(255, 255, 255)
    ]);

    const goldText = add([
        text(`Gold: ${gameState.gold}`, { size: 20 }),
        pos(20, 110),
        color(255, 215, 0)
    ]);

    // Player movement
    onKeyDown("left", () => {
        if (player.pos.x > 20) {
            player.move(-player.speed, 0);
        }
    });

    onKeyDown("right", () => {
        if (player.pos.x < width() - 20) {
            player.move(player.speed, 0);
        }
    });

    onKeyDown("up", () => {
        if (player.pos.y > 20) {
            player.move(0, -player.speed);
        }
    });

    onKeyDown("down", () => {
        if (player.pos.y < height() - 20) {
            player.move(0, player.speed);
        }
    });

    // Player shooting
    onKeyDown("space", () => {
        if (time() - lastShot > player.fireRate) {
            const bullet = add([
                rect(3, 10),
                pos(player.pos.x, player.pos.y - 20),
                anchor("center"),
                area(),
                color(255, 255, 100),
                "bullet",
                {
                    speed: 400,
                    damage: player.damage
                }
            ]);
            bullets.push(bullet);
            lastShot = time();
        }
    });

    // Update bullets
    onUpdate("bullet", (bullet) => {
        bullet.move(0, -bullet.speed);
        if (bullet.pos.y < 0) {
            bullet.destroy();
            bullets = bullets.filter(b => b !== bullet);
        }
    });

    // Update enemy bullets
    onUpdate("enemyBullet", (bullet) => {
        bullet.move(0, bullet.speed);
        if (bullet.pos.y > height()) {
            bullet.destroy();
            enemyBullets = enemyBullets.filter(b => b !== bullet);
        }
    });

    // Enemy behavior
    onUpdate("enemy", (enemy) => {
        enemy.move(0, enemy.speed);

        // Enemy shooting
        if (time() - enemy.lastShot > 2 && rand() < 0.01) {
            const enemyBullet = add([
                rect(2, 8),
                pos(enemy.pos.x, enemy.pos.y + 10),
                anchor("center"),
                area(),
                color(255, 100, 100),
                "enemyBullet",
                {
                    speed: 200
                }
            ]);
            enemyBullets.push(enemyBullet);
            enemy.lastShot = time();
        }

        // Remove enemies that go off screen
        if (enemy.pos.y > height() + 50) {
            enemy.destroy();
            enemies = enemies.filter(e => e !== enemy);
        }
    });

    // Bullet-enemy collision
    onCollide("bullet", "enemy", (bullet, enemy) => {
        bullet.destroy();
        bullets = bullets.filter(b => b !== bullet);

        enemy.health--;
        if (enemy.health <= 0) {
            enemy.destroy();
            enemies = enemies.filter(e => e !== enemy);
            enemiesKilled++;
            gameState.score += 10;
            gameState.gold += 5;
            scoreText.text = `Score: ${gameState.score}`;
            goldText.text = `Gold: ${gameState.gold}`;
        }
    });

    // Enemy bullet-player collision
    onCollide("enemyBullet", "player", (bullet, player) => {
        bullet.destroy();
        enemyBullets = enemyBullets.filter(b => b !== bullet);

        player.health -= 10;
        gameState.playerHealth = player.health;
        healthFill.width = (player.health / player.maxHealth) * 200;

        if (player.health <= 0) {
            go("gameOver");
        }
    });

    // Enemy-player collision
    onCollide("enemy", "player", (enemy, player) => {
        enemy.destroy();
        enemies = enemies.filter(e => e !== enemy);

        player.health -= 20;
        gameState.playerHealth = player.health;
        healthFill.width = (player.health / player.maxHealth) * 200;

        if (player.health <= 0) {
            go("gameOver");
        }
    });

    // Check wave completion
    onUpdate(() => {
        // Count remaining enemies on screen
        const remainingEnemies = get("enemy").length;

        if (remainingEnemies === 0 && enemiesKilled >= waveEnemyCount) {
            // Add a brief delay and message before transitioning
            add([
                text("Wave Complete! Proceeding to planet...", { size: 24 }),
                pos(center().x, center().y),
                anchor("center"),
                color(100, 255, 100),
                lifespan(2)
            ]);

            wait(2, () => {
                gameState.wave++;
                saveGame();

                // Every 5th wave is a shop
                if (gameState.wave % 5 === 0) {
                    go("shop");
                } else {
                    gameState.planetItems = generatePlanetItems();
                    go("planet");
                }
            });
        }
    });

    // Menu access
    onKeyPress("escape", () => {
        go("pauseMenu");
    });
});

// ===== PLANET EXPLORATION SCENE =====
scene("planet", () => {
    let player;
    let items = [];

    // Create planet background
    add([
        rect(width(), height()),
        pos(0, 0),
        color(50, 80, 50)
    ]);

    // Add some terrain features
    for (let i = 0; i < 20; i++) {
        add([
            rect(rand(20, 60), rand(20, 60)),
            pos(rand(0, width()), rand(0, height())),
            color(30, 60, 30),
            area(),
            "terrain"
        ]);
    }

    // Create player
    player = add([
        circle(10),
        pos(100, 100),
        anchor("center"),
        area(),
        color(100, 150, 255),
        "player"
    ]);

    // Spawn items
    gameState.planetItems.forEach(itemData => {
        const item = add([
            rect(12, 12),
            pos(itemData.pos),
            anchor("center"),
            area(),
            color(itemData.color),
            "item",
            {
                itemData: itemData
            }
        ]);
        items.push(item);
    });

    // UI
    add([
        text("Explore the planet! Collect items and press ENTER to return to space.", { size: 16 }),
        pos(20, 20),
        color(255, 255, 255)
    ]);

    const goldText = add([
        text(`Gold: ${gameState.gold}`, { size: 20 }),
        pos(20, 50),
        color(255, 215, 0)
    ]);

    // Player movement
    const speed = 150;
    onKeyDown("left", () => {
        if (player.pos.x > 10) {
            player.move(-speed, 0);
        }
    });

    onKeyDown("right", () => {
        if (player.pos.x < width() - 10) {
            player.move(speed, 0);
        }
    });

    onKeyDown("up", () => {
        if (player.pos.y > 10) {
            player.move(0, -speed);
        }
    });

    onKeyDown("down", () => {
        if (player.pos.y < height() - 10) {
            player.move(0, speed);
        }
    });

    // Item collection
    onCollide("player", "item", (player, item) => {
        const itemData = item.itemData;

        // Add to inventory
        gameState.inventory.push(itemData);

        // Special effects for consumables
        if (itemData.type === 'consumable') {
            if (itemData.name === 'Health Pack') {
                gameState.playerHealth = Math.min(gameState.maxHealth, gameState.playerHealth + itemData.heal);
            } else if (itemData.name === 'Gold Ore') {
                gameState.gold += itemData.gold;
                goldText.text = `Gold: ${gameState.gold}`;
            }
        }

        item.destroy();
        items = items.filter(i => i !== item);

        add([
            text(`Found: ${itemData.name}`, { size: 14 }),
            pos(player.pos.x, player.pos.y - 30),
            anchor("center"),
            color(255, 255, 100),
            lifespan(2)
        ]);
    });

    // Return to space
    onKeyPress("enter", () => {
        saveGame();
        go("shooter");
    });

    // Access inventory
    onKeyPress("i", () => {
        go("inventory");
    });

    // Access ship screen
    onKeyPress("s", () => {
        go("ship");
    });
});

// ===== SHOP SCENE =====
scene("shop", () => {
    add([
        text("GALACTIC SHOP", { size: 32 }),
        pos(center().x, 50),
        anchor("center"),
        color(255, 215, 0)
    ]);

    add([
        text(`Gold: ${gameState.gold}`, { size: 20 }),
        pos(20, 20),
        color(255, 215, 0)
    ]);

    let yPos = 120;
    const shopItems = [];

    // Generate shop items
    Object.keys(itemTypes).forEach(category => {
        Object.keys(itemTypes[category]).forEach(itemName => {
            const itemData = itemTypes[category][itemName];

            const itemButton = add([
                rect(350, 40),
                pos(50, yPos),
                color(60, 60, 60),
                area(),
                "shopItem",
                {
                    itemData: { type: category, name: itemName, ...itemData }
                }
            ]);

            add([
                text(`${itemName} - ${itemData.price}g`, { size: 16 }),
                pos(60, yPos + 10),
                color(255, 255, 255)
            ]);

            const buyButton = add([
                rect(80, 30),
                pos(420, yPos + 5),
                color(100, 150, 100),
                area(),
                "buyButton",
                {
                    itemData: { type: category, name: itemName, ...itemData }
                }
            ]);

            add([
                text("BUY", { size: 14 }),
                pos(460, yPos + 12),
                anchor("center"),
                color(255, 255, 255)
            ]);

            yPos += 50;
            shopItems.push({ itemButton, buyButton });
        });
    });

    // Buy button functionality
    get("buyButton").forEach(button => {
        button.onClick(() => {
            const itemData = button.itemData;
            if (gameState.gold >= itemData.price) {
                gameState.gold -= itemData.price;
                gameState.inventory.push(itemData);

                add([
                    text(`Bought: ${itemData.name}`, { size: 16 }),
                    pos(center().x, 100),
                    anchor("center"),
                    color(100, 255, 100),
                    lifespan(2)
                ]);

                // Update gold display
                get("goldDisplay").forEach(g => g.destroy());
                add([
                    text(`Gold: ${gameState.gold}`, { size: 20 }),
                    pos(20, 20),
                    color(255, 215, 0),
                    "goldDisplay"
                ]);
            } else {
                add([
                    text("Not enough gold!", { size: 16 }),
                    pos(center().x, 100),
                    anchor("center"),
                    color(255, 100, 100),
                    lifespan(2)
                ]);
            }
        });
    });

    // Continue button
    const continueBtn = add([
        rect(200, 50),
        pos(center().x, height() - 80),
        anchor("center"),
        color(100, 100, 150),
        area(),
        "button"
    ]);

    add([
        text("CONTINUE", { size: 20 }),
        pos(center().x, height() - 80),
        anchor("center"),
        color(255, 255, 255)
    ]);

    continueBtn.onClick(() => {
        saveGame();
        go("shooter");
    });

    // Access inventory
    onKeyPress("i", () => {
        go("inventory");
    });

    // Access ship screen
    onKeyPress("s", () => {
        go("ship");
    });
});

// ===== INVENTORY SCENE =====
scene("inventory", () => {
    add([
        text("INVENTORY", { size: 32 }),
        pos(center().x, 50),
        anchor("center"),
        color(200, 200, 255)
    ]);

    add([
        text("Press E to equip items, U to use consumables, ESC to go back", { size: 14 }),
        pos(center().x, 90),
        anchor("center"),
        color(200, 200, 200)
    ]);

    let yPos = 130;
    let selectedIndex = 0;

    function refreshInventory() {
        // Clear existing inventory display
        get("inventoryItem").forEach(item => item.destroy());
        get("selector").forEach(item => item.destroy());

        yPos = 130;

        gameState.inventory.forEach((item, index) => {
            const isSelected = index === selectedIndex;

            add([
                rect(400, 30),
                pos(200, yPos),
                anchor("center"),
                color(isSelected ? 80 : 40, isSelected ? 80 : 40, isSelected ? 80 : 40),
                "inventoryItem"
            ]);

            add([
                text(`${item.name} (${item.type})`, { size: 16 }),
                pos(210, yPos + 5),
                color(255, 255, 255),
                "inventoryItem"
            ]);

            if (isSelected) {
                add([
                    text(">", { size: 20 }),
                    pos(180, yPos + 5),
                    color(255, 255, 100),
                    "selector"
                ]);
            }

            yPos += 40;
        });
    }

    refreshInventory();

    // Navigation
    onKeyPress("up", () => {
        if (selectedIndex > 0) {
            selectedIndex--;
            refreshInventory();
        }
    });

    onKeyPress("down", () => {
        if (selectedIndex < gameState.inventory.length - 1) {
            selectedIndex++;
            refreshInventory();
        }
    });

    // Equip item
    onKeyPress("e", () => {
        if (gameState.inventory.length > 0) {
            const item = gameState.inventory[selectedIndex];
            if (item.type !== 'consumable') {
                gameState.equipment[item.type] = item;
                gameState.inventory.splice(selectedIndex, 1);
                if (selectedIndex >= gameState.inventory.length) {
                    selectedIndex = Math.max(0, gameState.inventory.length - 1);
                }
                refreshInventory();

                add([
                    text(`Equipped: ${item.name}`, { size: 16 }),
                    pos(center().x, 100),
                    anchor("center"),
                    color(100, 255, 100),
                    lifespan(2)
                ]);
            }
        }
    });

    // Use consumable
    onKeyPress("u", () => {
        if (gameState.inventory.length > 0) {
            const item = gameState.inventory[selectedIndex];
            if (item.type === 'consumable') {
                if (item.name === 'Health Pack') {
                    gameState.playerHealth = Math.min(gameState.maxHealth, gameState.playerHealth + item.heal);
                } else if (item.name === 'Gold Ore') {
                    gameState.gold += item.gold;
                }

                gameState.inventory.splice(selectedIndex, 1);
                if (selectedIndex >= gameState.inventory.length) {
                    selectedIndex = Math.max(0, gameState.inventory.length - 1);
                }
                refreshInventory();

                add([
                    text(`Used: ${item.name}`, { size: 16 }),
                    pos(center().x, 100),
                    anchor("center"),
                    color(100, 255, 100),
                    lifespan(2)
                ]);
            }
        }
    });

    onKeyPress("escape", () => {
        go("menu");
    });
});

// ===== SHIP SCREEN =====
scene("ship", () => {
    add([
        text("SHIP CONFIGURATION", { size: 32 }),
        pos(center().x, 50),
        anchor("center"),
        color(255, 200, 100)
    ]);

    // Display current equipment
    let yPos = 120;

    Object.keys(gameState.equipment).forEach(slot => {
        const item = gameState.equipment[slot];

        add([
            text(`${slot.toUpperCase()}:`, { size: 18 }),
            pos(100, yPos),
            color(255, 255, 255)
        ]);

        add([
            text(item ? item.name : "None", { size: 16 }),
            pos(250, yPos + 2),
            color(item ? [100, 255, 100] : [150, 150, 150])
        ]);

        if (item) {
            const unequipBtn = add([
                rect(80, 25),
                pos(450, yPos - 5),
                color(150, 100, 100),
                area(),
                "unequipButton",
                {
                    slot: slot
                }
            ]);

            add([
                text("REMOVE", { size: 12 }),
                pos(490, yPos + 3),
                anchor("center"),
                color(255, 255, 255)
            ]);

            unequipBtn.onClick(() => {
                gameState.inventory.push(gameState.equipment[slot]);
                gameState.equipment[slot] = null;
                go("ship"); // Refresh
            });
        }

        yPos += 40;
    });

    // Display stats
    yPos += 20;
    add([
        text("CURRENT STATS:", { size: 20 }),
        pos(100, yPos),
        color(255, 255, 100)
    ]);

    yPos += 30;

    // Calculate current stats
    let totalDamage = gameState.damage;
    let totalSpeed = gameState.shipSpeed;
    let totalHealth = gameState.maxHealth;

    if (gameState.equipment.weapon) {
        totalDamage += gameState.equipment.weapon.damage || 0;
    }
    if (gameState.equipment.engine) {
        totalSpeed += gameState.equipment.engine.speed || 0;
    }
    if (gameState.equipment.shield) {
        totalHealth += gameState.equipment.shield.health || 0;
    }

    add([
        text(`Damage: ${totalDamage}`, { size: 16 }),
        pos(100, yPos),
        color(255, 100, 100)
    ]);

    add([
        text(`Speed: ${totalSpeed}`, { size: 16 }),
        pos(100, yPos + 25),
        color(100, 255, 100)
    ]);

    add([
        text(`Max Health: ${totalHealth}`, { size: 16 }),
        pos(100, yPos + 50),
        color(100, 100, 255)
    ]);

    // Back button
    const backBtn = add([
        rect(150, 40),
        pos(center().x, height() - 60),
        anchor("center"),
        color(100, 100, 150),
        area(),
        "button"
    ]);

    add([
        text("BACK", { size: 18 }),
        pos(center().x, height() - 60),
        anchor("center"),
        color(255, 255, 255)
    ]);

    backBtn.onClick(() => {
        go("menu");
    });

    onKeyPress("escape", () => {
        go("menu");
    });
});

// ===== PAUSE MENU SCENE =====
scene("pauseMenu", () => {
    add([
        text("PAUSED", { size: 32 }),
        pos(center().x, 200),
        anchor("center"),
        color(255, 255, 255)
    ]);

    const resumeBtn = add([
        rect(150, 40),
        pos(center().x, 280),
        anchor("center"),
        color(100, 150, 100),
        area(),
        "button"
    ]);

    add([
        text("RESUME", { size: 18 }),
        pos(center().x, 280),
        anchor("center"),
        color(255, 255, 255)
    ]);

    const inventoryBtn = add([
        rect(150, 40),
        pos(center().x, 330),
        anchor("center"),
        color(150, 100, 150),
        area(),
        "button"
    ]);

    add([
        text("INVENTORY", { size: 18 }),
        pos(center().x, 330),
        anchor("center"),
        color(255, 255, 255)
    ]);

    const shipBtn = add([
        rect(150, 40),
        pos(center().x, 380),
        anchor("center"),
        color(150, 150, 100),
        area(),
        "button"
    ]);

    add([
        text("SHIP", { size: 18 }),
        pos(center().x, 380),
        anchor("center"),
        color(255, 255, 255)
    ]);

    const saveBtn = add([
        rect(150, 40),
        pos(center().x, 430),
        anchor("center"),
        color(100, 100, 150),
        area(),
        "button"
    ]);

    add([
        text("SAVE & QUIT", { size: 18 }),
        pos(center().x, 430),
        anchor("center"),
        color(255, 255, 255)
    ]);

    resumeBtn.onClick(() => {
        go("shooter");
    });

    inventoryBtn.onClick(() => {
        go("inventory");
    });

    shipBtn.onClick(() => {
        go("ship");
    });

    saveBtn.onClick(() => {
        saveGame();
        go("menu");
    });

    onKeyPress("escape", () => {
        go("shooter");
    });
});

// ===== GAME OVER SCENE =====
scene("gameOver", () => {
    add([
        text("GAME OVER", { size: 48 }),
        pos(center().x, 200),
        anchor("center"),
        color(255, 100, 100)
    ]);

    add([
        text(`Final Score: ${gameState.score}`, { size: 24 }),
        pos(center().x, 280),
        anchor("center"),
        color(255, 255, 255)
    ]);

    add([
        text(`Waves Survived: ${gameState.wave - 1}`, { size: 20 }),
        pos(center().x, 320),
        anchor("center"),
        color(255, 255, 255)
    ]);

    const restartBtn = add([
        rect(150, 40),
        pos(center().x, 400),
        anchor("center"),
        color(100, 150, 100),
        area(),
        "button"
    ]);

    add([
        text("RESTART", { size: 18 }),
        pos(center().x, 400),
        anchor("center"),
        color(255, 255, 255)
    ]);

    const menuBtn = add([
        rect(150, 40),
        pos(center().x, 450),
        anchor("center"),
        color(150, 100, 100),
        area(),
        "button"
    ]);

    add([
        text("MAIN MENU", { size: 18 }),
        pos(center().x, 450),
        anchor("center"),
        color(255, 255, 255)
    ]);

    restartBtn.onClick(() => {
        gameState = {
            wave: 1,
            score: 0,
            gold: 100,
            playerHealth: 100,
            maxHealth: 100,
            shipSpeed: 200,
            fireRate: 0.3,
            damage: 10,
            inventory: [],
            equipment: {
                weapon: null,
                shield: null,
                engine: null
            },
            planetItems: []
        };
        go("shooter");
    });

    menuBtn.onClick(() => {
        go("menu");
    });

    onKeyPress("r", () => {
        gameState = {
            wave: 1,
            score: 0,
            gold: 100,
            playerHealth: 100,
            maxHealth: 100,
            shipSpeed: 200,
            fireRate: 0.3,
            damage: 10,
            inventory: [],
            equipment: {
                weapon: null,
                shield: null,
                engine: null
            },
            planetItems: []
        };
        go("shooter");
    });

    onKeyPress("escape", () => {
        go("menu");
    });
});

// Start the game
go("menu");
