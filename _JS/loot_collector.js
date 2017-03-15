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

// buffs/debuffs
const basePlayerStats = $.extend({}, playerStats);
const possibleBuffs = ['maxLife', 'vitality', 'speed', 'defense', 'dexterity', 'attack'];
var buffTextStyle = {font: '16px Verdana', fill: '#00FF00'};
var debuffTextStyle = {font: '16px Verdana', fill: '#FF0000'};

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

// lessons (for between rounds)
// [Lesson, Question, [Correct Answer, Answer, Answer, Answer]]
const lessons =
    [['Game controls:\n\n- Use WASD to move; click to shoot\n- Press space to go from a lesson to its question or a question\'s answer to the next round\n- Press 1, 2, 3, or 4 to answer questions\n- Rounds start five seconds after the question is finished\n- Lessons start five seconds after the round is finished\n- Correct answers give one random stuff buff\n- Boss kills give three random stat buffs', 'Which keys are used for movement?', ['WASD', 'arrow keys', 'WSQE', 'UHJK']],
        ['Always follow naming conventions when creating variables in JavaScript. Names should be in camelcase, meaning that the first word should be lowercase and the first letters of the following words should be uppercase.\n\nFor example: thisIsAVariable, thisIsAnotherVariable, thisIsAFunction(), etc.', 'Which of the following is in camelcase?', ['camelCase', 'Camelcase', 'CaMeLcAsE', 'camelcase']],
        ['To make a function run after a certain amount of time, use the function \'setTimeout(function, milliseconds, param1, param2,...)\'. This runs \'function\' after \'milliseconds\' milliseconds. \'param1\', \'param2\', etc. are parameters to pass to the function.\n\nWhen using \'setTimeout()\', do NOT put parentheses after the function name - put any parameters after \'milliseconds\'.', 'Which of the following will run the function \'delayedFunction(\'parameter\')\' after 5 seconds?', ['setTimeout(delayedFunction, 5000, \'parameter\');', 'setTimeout(delayedFunction(), 5000);', 'setTimeout(delayedFunction(\'parameter\'), 5000);', 'setTimeout(delayedFunction, 5, \'parameter\');']],
        ['If you want to get the value of a text box in JavaScript, you need to add an ID to your input tag (for example: \'<' + 'input type="text" id="text-input"/>\'). You can then access its value by using \'document.getElementById(\'text-input\').value\'.\n\nNote that the \'id\' and \'name\' attributes are not the same. For getting text input values, use \'id\', not \'name\'.', 'Which of the following gets the value of a text input with id \'input\'?', ['document.getElementById(\'input\').value', 'document.getElementsByName(\'input\').value', 'input.value', 'document.getValue(\'input\')']],
        ['To make a constant (unchangeable value) in JavaScript, use the keyword \'const\' instead of \'var\'. For example, writing \'const degreesInACircle = 360\' makes a value \'degreesInACircle\' which is always 360 no matter what.', 'Which of the following defines a constant value \'sqrt2\' with a value of \'Math.sqrt(2)\'?', ['const sqrt2 = Math.sqrt(2)', 'constant sqrt2 = Math.sqrt(2)', 'const var sqrt2 = Math.sqrt(2)', 'var sqrt2 = Math.sqrt(2)']],
        ['If a JavaScript file ends in \'.min.js\', it is \'minified\'. This means that any unnecessary characters (spaces, line breaks, etc.) have been removed to make the file smaller and easier to download. Never modify these files, because they are usually libraries that should\'nt be changed. Minified files can be linked to HTML files in the same way as normal JavaScript files.', 'What is the file extension for minified JavaScript files?', ['.min.js', '.min', '.minified.js', '.minified']]];
const lessonTextStyle = {font: '24pt Verdana', fill: 'white', wordWrap: true, wordWrapWidth: 800};
var lessonText;
var lessonTexts;
var question;
var answers;
var randomNumbers;
var correctAnswerNumber;

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
        roundState = 'lesson';
        startLesson();
    }, 5000);

    // play some dank music
    document.getElementById('dank-music').play();
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

            // time (in milliseconds) to wait before starting lesson
            var lessonWait = 5000;

            // waits 6.2 seconds instead of 5 if the round is a boss round (for triple buff)
            if ((round - 1) % 5 === 0) {
                tripleBuff();
                lessonWait = 6200;
            }

            // set round state to lesson to prevent checking for round end
            roundState = 'lesson';
            setTimeout(function () {
                startLesson();
            }, lessonWait);
        }

    // pressing space goes from lesson to question
    if (spaceKey.isDown && roundState === 'lesson') {
        lessonText.kill();
        startQuestion();
    }

    // pressing 1, 2, 3, or 4 chooses an answer to a question
    chooseAnswer:
        if (roundState === 'question') {
            var chosenNumber;

            // converts key presses into index numbers
            if (oneKey.isDown) {
                chosenNumber = 0;
            } else if (twoKey.isDown) {
                chosenNumber = 1;
            } else if (threeKey.isDown) {
                chosenNumber = 2;
            } else if (fourKey.isDown) {
                chosenNumber = 3;
            } else {
                chosenNumber = -1;
            }

            // if none of the answer keys are being pressed, there is no reason to continue
            if (chosenNumber === -1) {
                break chooseAnswer;
            }

            lessonText.kill();
            checkAnswer(chosenNumber);
        }

    // pressing space while viewing correct answer starts the round (after a five-second delay)
    if (spaceKey.isDown && roundState === 'answer') {
        roundState = 'between';
        lessonText.kill();
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
 * randomizes order of array elements
 */
Array.prototype.shuffle = function () {
    for (var index = this.length - 1; index > 0; index--) {
        var randomIndex = Math.floor(Math.random() * (index + 1));
        var temp = this[index];
        this[index] = this[randomIndex];
        this[randomIndex] = temp;
    }
    return this;
};

/**
 * creates lesson text
 */
function startLesson() {
    // get all text needed for lesson
    lessonTexts = lessons[round - 1];
    lessonText = game.add.text(50, 50, lessonTexts[0], lessonTextStyle);

    // refresh player bullet pool
    playerBullets.destroy(true);
    createPlayerBullets();
}

/**
 * turns a number into answer text
 * if newline is true, it will add a new line after the text
 */
function numberToAnswer(number, newline) {
    return ((number + 1).toString() + ') ' + answers[randomNumbers[number]]).concat(newline ? '\n' : '');
}

/**
 * creates question text and answer choices
 */
function startQuestion() {
    roundState = 'question';
    question = lessonTexts[1];
    answers = lessonTexts[2];
    // list of numbers 0 to 3 in random order
    randomNumbers = [0, 1, 2, 3].shuffle();

    var message = question + '\n\n';

    // find the index where the correct answer will be
    // also, add answers to text that will be displayed
    for (var index = 0; index < randomNumbers.length; index++) {
        // add an answer on a new line
        message = message.concat(numberToAnswer(index, true));
        if (randomNumbers[index] === 0) {
            correctAnswerNumber = index;
        }
    }

    // add text
    lessonText = game.add.text(50, 50, message, lessonTextStyle);
}

/**
 * buffs or debuffs the player's stats after a question
 */
function buffStats(buff) {
    // get a random buffable stat
    var stat = possibleBuffs[game.rnd.integerInRange(0, possibleBuffs.length - 1)];
    // amount by which stat changes
    var statChange = (buff ? 1 : -1) * basePlayerStats[stat] / 10;
    // make sure the stat doesn't go negative
    if (!buff && Math.abs(statChange) > getStat('stat')) {
        statChange = getStat('stat');
    }

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
    var buffText = game.add.text(0, 0, (buff ? '+' : '') + statChange.toString() + ' ' + (stat === 'maxLife' ? 'max life' : stat), (buff ? buffTextStyle : debuffTextStyle));
    // text starts at the top of player's sprite
    buffText.y = player.y - buffText.height;
    // center horizontally (on the player)
    buffText.x = player.x - ((buffText.width - player.width) / 2);
    game.physics.enable(buffText, Phaser.Physics.ARCADE);
    // moves upwards
    buffText.body.velocity.y = -50;
    // dies after 0.5 seconds
    setTimeout(function () {
        buffText.kill();
    }, 500);
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
 * checks answer chosen by player
 */
function checkAnswer(chosenNumber) {
    roundState = 'answer';

    var message = question + '\n\n';

    if (chosenNumber === correctAnswerNumber) {
        message = message.concat('Correct!\n');
        message = message.concat('Answer: ' + numberToAnswer(correctAnswerNumber, false));
        buffStats(true);
    } else {
        message = message.concat('Incorrect!\n');
        message = message.concat('Your answer: ' + numberToAnswer(chosenNumber, true));
        message = message.concat('Correct answer: ' + numberToAnswer(correctAnswerNumber, false));
        buffStats(false);
    }

    // add text
    lessonText = game.add.text(50, 50, message, lessonTextStyle);
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