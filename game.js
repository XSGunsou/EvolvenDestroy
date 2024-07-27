const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemy', 'assets/enemy.png');
}

function create() {
    const canvas = this.sys.game.canvas;

    // Add event listener for user gesture
    canvas.addEventListener('click', initAudioContext);

    function initAudioContext() {
        // Initialize your audio context here if needed
        // game.sound.context.resume();
        canvas.removeEventListener('click', initAudioContext);
    }

    this.player = this.physics.add.sprite(window.innerWidth / 2, window.innerHeight / 2, 'player').setScale(1.5);
    this.player.health = 100;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.WASD = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.bullets = this.physics.add.group({
        classType: Phaser.Physics.Arcade.Image,
        maxSize: 10,
        runChildUpdate: true
    });
    this.enemies = this.physics.add.group({
        classType: Phaser.Physics.Arcade.Image,
        runChildUpdate: true
    });

    // Spawn initial enemies
    this.spawnEnemies();

    this.physics.add.collider(this.bullets, this.enemies, (bullet, enemy) => {
        bullet.destroy();
        enemy.health -= 10;
        if (enemy.health <= 0) {
            enemy.destroy();
        }
    });

    this.input.on('pointerdown', (pointer) => {
        const bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            this.physics.moveTo(bullet, pointer.worldX, pointer.worldY, 600);
        }
    });

    this.playerHealthBar = this.add.graphics();
    this.enemies.children.iterate((enemy) => {
        enemy.health = 50;
        enemy.healthBar = this.add.graphics();
    });
}

function update() {
    this.player.setVelocity(0);

    if (this.WASD.A.isDown) {
        this.player.setVelocityX(-160);
    } else if (this.WASD.D.isDown) {
        this.player.setVelocityX(160);
    }

    if (this.WASD.W.isDown) {
        this.player.setVelocityY(-160);
    } else if (this.WASD.S.isDown) {
        this.player.setVelocityY(160);
    }

    // Make the player face the mouse pointer
    this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.mousePointer.worldX, this.input.mousePointer.worldY) + Math.PI / 2;

    this.updateHealthBars();
}

function spawnEnemies() {
    const maxEnemies = 10;
    const enemyPositions = [];

    for (let i = 0; i < maxEnemies; i++) {
        let x, y;
        do {
            x = Phaser.Math.Between(0, window.innerWidth);
            y = Phaser.Math.Between(0, window.innerHeight);
        } while (enemyPositions.some(pos => Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < 50));

        enemyPositions.push({ x, y });
        const enemy = this.enemies.get(x, y, 'enemy');
        if (enemy) {
            enemy.setActive(true);
            enemy.setVisible(true);
            enemy.health = 50;
            enemy.healthBar = this.add.graphics();
        }
    }
}

function updateHealthBars() {
    this.playerHealthBar.clear();
    this.playerHealthBar.fillStyle(0x00ff00);
    this.playerHealthBar.fillRect(this.player.x - 32, this.player.y - 50, this.player.health / 2, 5);

    this.enemies.children.iterate((enemy) => {
        if (enemy.active) {
            enemy.healthBar.clear();
            enemy.healthBar.fillStyle(0xff0000);
            enemy.healthBar.fillRect(enemy.x - 16, enemy.y - 50, enemy.health / 2, 5);
        }
    });
}
