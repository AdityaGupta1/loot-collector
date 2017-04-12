/**
 * player bullet creation
 */
function playerShoot() {
    if (!game.input.activePointer.isDown || roundState !== 'enemies') {
        return;
    }

    if (game.time.now <= nextFire || playerBullets.countDead() <= 0 || !player.alive) {
        return;
    }

    nextFire = game.time.now + fireRate;
    // get first dead bullet from pool
    var bullet = playerBullets.getFirstDead();
    // revive bullet
    bullet.reset(player.x + (player.width / 2), player.y + (player.height / 2
        ));
    // point towards mouse and start moving
    game.physics.arcade.moveToPointer(bullet, 300);
    // fix rotation
    bullet.anchor.set(0.5);
    // radians, not degrees
    bullet.rotation = game.physics.arcade.angleToPointer(bullet) + (pi / 4);
    game.world.sendToBack(bullet);
}

/**
 * eight-way movement with normalized diagonal speed
 */
function eightWayMovement() {
    var movement = 0;
    var speed = getStat('speed') * 10;
    var diagonalSpeed = speed / sqrt2;

    // create a unique movement number for each key combination
    if (wKey.isDown) {
        movement += 1;
    }

    if (sKey.isDown) {
        movement += 2;
    }

    if (aKey.isDown) {
        movement += 4;
    }

    if (dKey.isDown) {
        movement += 8;
    }

    // switch on each unique number
    switch (movement) {
        // up
        case 1:
        // left-right-up
        case 13:
            player.body.velocity.x = 0;
            player.body.velocity.y = -speed;
            break;
        // down
        case 2:
        // left-right-down
        case 14:
            player.body.velocity.x = 0;
            player.body.velocity.y = speed;
            break;
        // right
        case 4:
        // up-down-right
        case 7:
            player.body.velocity.x = -speed;
            player.body.velocity.y = 0;
            break;
        // left
        case 8:
        // up-down-left
        case 11:
            player.body.velocity.x = speed;
            player.body.velocity.y = 0;
            break;
        // up-down
        case 3:
        // left-right
        case 12:
        // all four
        case 15:
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            break;
        // up-left
        case 5:
            player.body.velocity.x = -diagonalSpeed;
            player.body.velocity.y = -diagonalSpeed;
            break;
        // up-right
        case 9:
            player.body.velocity.x = diagonalSpeed;
            player.body.velocity.y = -diagonalSpeed;
            break;
        // down-left
        case 6:
            player.body.velocity.x = -diagonalSpeed;
            player.body.velocity.y = diagonalSpeed;
            break;
        // down-right
        case 10:
            player.body.velocity.x = diagonalSpeed;
            player.body.velocity.y = diagonalSpeed;
            break;
        // none
        default:
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
    }
}

/**
 * regenerate health
 */
function regenLife() {
    if (!player.alive) {
        return;
    }

    if (game.time.now > nextRegen) {
        nextRegen = game.time.now + (1 / getStat('vitality')) * 2000;
        if (getStat('life') < getStat('maxLife')) {
            changeStat('life', 1);
        }
    }

    // just in case someone tries to inspect element insane amounts of health
    if (getStat('life') > getStat('maxLife')) {
        setStat('life', getStat('maxLife'))
    }
}

var oldPlayerStats;
var admin = false;

/**
 * admin mode (for debug purposes, should only be used from console); insane fire rate + damage, near-invulnerability
 */
function adminMode() {
    // if the player is already an admin, this function doesn't need to do anything
    if (admin) {
        return;
    }

    // shallow copy (changing one does not affect the other)
    oldPlayerStats = $.extend({}, playerStats);

    setStat('dexterity', 10000);
    setStat('attack', 100);
    setStat('maxLife', 1000000);
    setStat('life', 1000000);
    setStat('defense', 0);
    setStat('vitality', 1000);

    // used in normalMode()
    admin = true;
}

/**
 * normal mode (reverts to stats before admin mode)
 */
function normalMode() {
    // if the player isn't an admin, this function doesn't need to do anything
    if (!admin) {
        return;
    }

    // shallow copy (changing one does not affect the other)
    playerStats = $.extend({}, oldPlayerStats);

    admin = false;
}

/**
 * called when an enemy bullet hits the player
 */
function playerDamageHandler(player, enemyBullet) {
    enemyBullet.kill();
    var damage = enemyBullet.damage;
    var defense = getStat('defense');
    // defense subtracts from damage, but the enemy bullet has to deal at least 10% of its original damage
    var finalDamage = Math.round((damage - defense) < (damage * 0.1) ? ((damage) * 0.1) : ((damage) - defense));

    // decrement life by finalDamage
    changeStat('life', -finalDamage);

    // check if player is dead
    if (getStat('life') <= 0) {
        player.kill();
        createFinishGameText(false);
        roundState = 'lose';
    }

    // create damage text
    createDamageText(player.x, player.y, player.width, finalDamage);
}

/**
 * create player bullet pool
 */
function createPlayerBullets() {
    // add player bullet group
    playerBullets = game.add.group();
    playerBullets.enableBody = true;
    game.physics.enable(playerBullets, Phaser.Physics.ARCADE);

    // 500 bullet pool
    playerBullets.createMultiple(500, 'player_bullet');
    playerBullets.setAll('checkWorldBounds', true);
    playerBullets.setAll('outOfBoundsKill', true);
}