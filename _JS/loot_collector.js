// canvas dimensions
const canvasWidth = 1000;
const canvasHeight = 600;

// initialize game
var game = new Phaser.Game(canvasWidth, canvasHeight, Phaser.AUTO, 'loot-collector', {
    preload: preload,
    create: create,
    update: update
});

// sprites
var player;
var playerBullets;
var enemies;

// title screen text
var titleText;
var titleTextStyle = {font: '64px Verdana', fill: '#FFFFFF'};
var nameText;
var nameTextHeight = 32;
var nameTextStyle = {font: nameTextHeight.toString() + 'px Verdana', fill: '#FFFFFF'};

// keys
var wKey;
var aKey;
var sKey;
var dKey;
var spaceKey;
var oneKey;
var twoKey;
var threeKey;
var fourKey;

// player stats
var playerStats = {
    'maxLife': 1000,
    'life': 1000,
    'vitality': 40,
    'speed': 40,
    'defense': 10,
    'dexterity': 50,
    'attack': 50
};

// buffs
const basePlayerStats = $.extend({}, playerStats);
const possibleBuffs = ['maxLife', 'vitality', 'speed', 'defense', 'dexterity', 'attack'];
var buffTextStyle = {font: '16px Verdana', fill: '#00FF00'};

// game over/you win text
var winTextStyle = {font: '72px Verdana', fill: '#00FF00'};
var loseTextStyle = {font: '72px Verdana', fill: '#FF0000'};

// player firing
var fireRate = 0;
var nextFire = 0;

// health
var nextRegen = 0;
var playerHealthBar;
var damageTextStyle = {font: '16px Verdana', fill: '#FF0000'};

// enemy bullets
var enemyBulletList = [];

// rounds
var round = 1;
var maxRound = 6;
var roundState = 'title';

// math
const pi = Math.PI;
const sqrt2 = Math.round(Math.sqrt(2) * 1000) / 1000; // round to two decimal places

function getStat(stat) {
    return playerStats[stat];
}

function setStat(stat, value) {
    playerStats[stat] = value;
}

function changeStat(stat, change) {
    setStat(stat, getStat(stat) + change);
}

/**
 * load images
 */
function preload() {
    // player
    game.load.image('wizard', '_img/player/wizard.png');

    // player bullets
    game.load.image('player_bullet', '_img/player_bullet/player_bullet.png');

    // enemies
    game.load.image('small_demon', '_img/enemy/small_demon.png');
    game.load.image('fire_skull', '_img/enemy/fire_skull.png');
    game.load.image('crystal_minion', '_img/enemy/crystal_minion.png');
    game.load.image('crystal_golem', '_img/enemy/crystal_golem.png');
    game.load.image('blue_skull', '_img/enemy/blue_skull.png');
    game.load.image('reaper', '_img/enemy/reaper.png');
    game.load.image('stone_mage', '_img/enemy/stone_mage.png');
    game.load.image('sentinel', '_img/enemy/sentinel.png');
    game.load.image('haunted_wisp', '_img/enemy/haunted_wisp.png');
    game.load.image('alien', '_img/enemy/alien.png');

    // enemy bullets
    game.load.image('small_demon_bullet', '_img/enemy_bullet/small_demon_bullet.png');
    game.load.image('fire_skull_bullet', '_img/enemy_bullet/fire_skull_bullet.png');
    game.load.image('crystal_minion_bullet', '_img/enemy_bullet/crystal_minion_bullet.png');
    game.load.image('crystal_golem_bullet', '_img/enemy_bullet/crystal_golem_bullet.png');
    game.load.image('blue_skull_bullet', '_img/enemy_bullet/blue_skull_bullet.png');
    game.load.image('reaper_bullet', '_img/enemy_bullet/reaper_bullet.png');
    game.load.image('stone_mage_bullet', '_img/enemy_bullet/stone_mage_bullet.png');
    game.load.image('sentinel_bullet', '_img/enemy_bullet/sentinel_bullet.png');
    game.load.image('haunted_wisp_red_bullet', '_img/enemy_bullet/haunted_wisp_red_bullet.png');
    game.load.image('haunted_wisp_purple_bullet', '_img/enemy_bullet/haunted_wisp_purple_bullet.png');
    game.load.image('alien_bullet', '_img/enemy_bullet/alien_bullet.png');
}

/**
 * create sprites, bind keys, general pre-game stuff
 */
function create() {
    // background color
    game.stage.backgroundColor = '#C6C6C6';

    // all enemies will be part of this group
    enemies = game.add.group();

    // add player
    player = game.add.sprite(500, 300, 'wizard');
    player.bringToTop();
    game.physics.enable(player, Phaser.Physics.ARCADE);

    createPlayerBullets();

    // bind keys
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    oneKey = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    twoKey = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
    threeKey = game.input.keyboard.addKey(Phaser.Keyboard.THREE);
    fourKey = game.input.keyboard.addKey(Phaser.Keyboard.FOUR);

    player.body.collideWorldBounds = true;

    // health bar config (color, position, etc.)
    var playerHealthBarConfig = {
        width: 200,
        height: 20,
        x: 110,
        y: 20,
        bg: {
            color: '#800000'
        },
        bar: {
            color: '#FF0000'
        },
        animationDuration: 50,
        flipped: false
    };

    // create health bar
    playerHealthBar = new HealthBar(game, playerHealthBarConfig);

    createTitleText();

    setTimeout(function () {
        titleText.kill();
        nameText.kill();
        // first lesson
        roundState = 'enemies';
        startRound();
    }, 5000);
}

/**
 * creates title text
 */
function createTitleText() {
    // add text
    titleText = game.add.text(0, 0, 'Loot Collector', titleTextStyle);
    // center text horizontally
    titleText.x = (canvasWidth - titleText.width) / 2;
    // center text vertically
    titleText.y = (canvasHeight - (titleText.height + nameTextHeight + 8)) / 2;
    setTimeout(createNameText, 2000);

}

function createNameText() {
    // add text
    nameText = game.add.text(0, 0, 'by Aditya Gupta', nameTextStyle);
    // center text horizontally
    nameText.x = (canvasWidth - nameText.width) / 2;
    // center text vertically
    nameText.y = (titleText.y + titleText.height + 8);
}

/**
 * creates a damage text which moves upwards then disappears
 */
function createDamageText(x, y, width, damage) {
    // add text
    var damageText = game.add.text(0, 0, '-' + damage, damageTextStyle);
    // center horizontally (on the player/damaged enemy)
    damageText.x = x - ((damageText.width - width) / 2);
    // text starts at the top of player/damaged enemy's sprite
    damageText.y = y - damageText.height;
    game.physics.enable(damageText, Phaser.Physics.ARCADE);
    // moves upwards
    damageText.body.velocity.y = -50;
    // dies after 0.5 seconds
    setTimeout(function () {
        damageText.kill();
    }, 500);
}

/**
 * general update
 */
function update() {
    // check if player is touching enemy bullets
    for (var i = 0; i < enemyBulletList.length; i++) {
        game.physics.arcade.overlap(player, enemyBulletList[i], playerDamageHandler, null, this);
    }

    // check if player bullets are touching enemies
    game.physics.arcade.overlap(enemies, playerBullets, enemyDamageHandler, null, this);

    // update health bar
    playerHealthBar.setPercent((getStat('life') / getStat('maxLife')) * 100);

    // update fire rate
    fireRate = (1 / getStat('dexterity')) * 20000;

    // player movement, shooting, health regeneration
    eightWayMovement();
    playerShoot();
    regenLife();

    // check if all enemies are dead; if so, advance to lesson
    advanceRound:
        if (allEnemiesDead() && roundState === 'enemies') {
            round++;
            // win game if round is greater than max round
            if (round > maxRound) {
                createFinishGameText(true);
                roundState = 'win';
                break advanceRound;
            }

            // triple buff on boss rounds (multiples of 5)
            if ((round - 1) % 5 === 0) {
                tripleBuff();
            } else {
                buffStats();
            }

            // set round state to lesson to prevent checking for round end
            roundState = 'round end';
        }

    // pressing space between rounds starts the next round (after a five-second delay)
    if (spaceKey.isDown && roundState === 'round end') {
        roundState = 'between';
        setTimeout(startRound, 5000);
    }
}

/**
 * spawns enemies for the round
 */
function startRound() {
    roundState = 'enemies';

    // createEnemies(number, sprite, maxHealth, movementType, movementSpeed, bullet, bulletSpeed, bulletDamage, fireDelay, defense, shots, arc);
    switch (round) {
        case 1:
            createEnemies(10, 'small_demon', 200, 'random', 300, createEnemyBulletGroup('small_demon_bullet'), 250, 25, 1000, 5, 1, 0);
            createEnemies(2, 'fire_skull', 500, 'random', 100, createEnemyBulletGroup('fire_skull_bullet'), 100, 20, 500, 10, 3, pi / 6);
            break;
        case 2:
            createEnemies(7, 'crystal_minion', 400, 'random', 150, createEnemyBulletGroup('crystal_minion_bullet'), 200, 50, 2000, 10, 2, pi / 4);
            createEnemies(1, 'crystal_golem', 1000, 'random', 75, createEnemyBulletGroup('crystal_golem_bullet'), 100, 70, 1000, 20, 9, pi / 8);
            break;
        case 3:
            createEnemies(7, 'blue_skull', 300, 'random', 400, createEnemyBulletGroup('blue_skull_bullet'), 400, 30, 500, 5, 1, 0);
            createEnemies(1, 'reaper', 700, 'random', 200, createEnemyBulletGroup('reaper_bullet'), 200, 50, 1000, 10, 12, pi / 6);
            break;
        case 4:
            createEnemies(5, 'stone_mage', 500, 'random', 100, createEnemyBulletGroup('stone_mage_bullet'), 100, 40, 1250, 10, 3, pi / 12);
            createEnemies(1, 'sentinel', 1500, 'stationary', 0, createEnemyBulletGroup('sentinel_bullet'), 50, 100, 1750, 25, 8, pi / 4);
            break;
        case 5:
            createEnemies(1, 'haunted_wisp', 2500, 'random', 250, [createEnemyBulletGroup('haunted_wisp_red_bullet'), createEnemyBulletGroup('haunted_wisp_purple_bullet')], [400, 200], [50, 100], 250, 20, [1, 24], pi / 12);
            break;
        case 6:
            createEnemies(5, 'alien', 500, 'random', 200, createEnemyBulletGroup('alien_bullet'), 200, 65, 2000, 20, 5, pi / 6);
            break;
    }
}

/**
 * buffs the player's stats after a round ends
 */
function buffStats() {
    // get a random buffable stat
    var stat = possibleBuffs[game.rnd.integerInRange(0, possibleBuffs.length - 1)];
    // amount by which stat changes
    var statChange = basePlayerStats[stat] / 10;

    // stat change affects actual player stats, not admin player stats
    if (!admin) {
        changeStat(stat, statChange);
    } else {
        oldPlayerStats[stat] = oldPlayerStats[stat] + statChange;
    }

    // if the stat is max health, change actual health as well
    if (stat === 'maxLife') {
        // stat change affects actual player stats, not admin player stats
        if (!admin) {
            changeStat('life', statChange);
        } else {
            oldPlayerStats['life'] = oldPlayerStats['life'] + statChange;
        }
    }

    // add text (changes 'maxLife' to 'max life' for readability)
    var buffText = game.add.text(0, 0, '+' + statChange.toString() + ' ' + (stat === 'maxLife' ? 'max life' : stat), buffTextStyle);
    // text starts at the top of player's sprite
    buffText.y = player.y - buffText.height;
    // center horizontally (on the player)
    buffText.x = player.x - ((buffText.width - player.width) / 2);
    game.physics.enable(buffText, Phaser.Physics.ARCADE);
    // moves upwards
    buffText.body.velocity.y = -25;
    // disappears after 1 second
    setTimeout(function () {
        buffText.kill();
    }, 1000);
}

/**
 * buffs player stats three times (only happens after a boss kill)
 */
function tripleBuff() {
    var count = 0;

    // 1.5 second delay between buffs so player can read buff text
    var buffInterval = setInterval(function () {
        buffStats(true);
        count++;

        // clear interval once player has been buffed three times
        if (count === 3) {
            clearInterval(buffInterval);
        }
    }, 400);
}

/**
 * creates text when game is finished (whether player wins or loses)
 */
function createFinishGameText(win) {
    // add text
    var finishGameText = game.add.text(0, 0, (win ? 'You win!' : 'Game over!'), (win ? winTextStyle : loseTextStyle));
    // center text horizontally
    finishGameText.x = (canvasWidth - finishGameText.width) / 2;
    // center text vertically
    finishGameText.y = (canvasHeight - finishGameText.height) / 2;
}