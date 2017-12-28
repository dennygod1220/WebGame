var socket = io();
$(function () {
    $('#btn').click(function () {
        name = $.trim($('#inputText').val());
        if (name) {
            socket.emit('send name', name);
            $('#name').hide();
        }
    });

});



var game = new Phaser.Game(600, 600, Phaser.AUTO, 'mygame');
//儲存自己的名字
var name = null;
//自己的球
var ball;
var BallGroup;
//自己的球的初始位置
var ballinitialX, ballinitialY;
//其他玩家球的位置
var otherBallX = 0;
var otherBallY = 0;
var OtherBall;
var state = {

    preload: function () {
        this.preload = function () {
            game.load.image("ball", "img/ball.png");
            game.load.image("brick", "img/brick.png");
            game.load.image("brick2", "img/brick2.png");
            game.load.image("up", "img/up.png");
            game.load.image("left", "img/left.png");
            game.load.image("down", "img/down.png");
            game.load.image("right", "img/right.png");
            game.load.image("star", "img/star.png");
            game.load.image('user', 'img/user.png');
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
        };
        this.create = function () {

            game.stage.backgroundColor = '#FFFFFF';
            /*監聽Server是否傳送連線成功事件，如果有 就會轉到create場景，並且會傳入玩家的初始位置*/
            socket.on('connect sucess', function (initialInfo) {
                alert('連線成功:' + initialInfo.name);
                ballinitialX = initialInfo.x;
                ballinitialY = initialInfo.y;
                game.state.start('create');
            });

        };
    },

    create: function () {
        this.preload = function () {

        };
        this.create = function () {
            game.stage.backgroundColor = '#FFFFE0';
            console.log("This Player Name : " + name);
            /*創建 自己的 球 */
            ball = game.add.sprite(ballinitialX, ballinitialY, 'ball');
            ball.anchor.set(0.5);
            game.physics.enable(ball, Phaser.Physics.ARCADE);
            ball.body.collideWorldBounds = true;
            ball.body.velocity.x = 100;
            ball.body.bounce.set(1);

            /*創建 名字 */
            text = game.add.text(ballinitialX, ballinitialY, name, '#fff');
            text.fontSize = 10;
            text.align = "center";
            game.physics.enable(text, Phaser.Physics.ARCADE);

            //建立其他玩家的球
            OtherBall = game.add.sprite(0, 0, 'user');
            game.physics.enable(OtherBall, Phaser.Physics.ARCADE);

        };

        this.update = function () {
            //讓名字和球一起移動
            text.body.x = ball.body.x;
            text.body.y = ball.body.y;
            //將 自己的球 位置傳送給server
            socket.emit('user ball position', {
                name:name,
                x: ball.body.x,
                y: ball.body.y
            });
            //收聽廣播 收聽其他玩家球的位置 並將其他玩家的位置存到全域變數中
            socket.on('other user position', function (data) {
                console.log(data.name);
                otherBallX = data.x;
                otherBallY = data.y;
            });
            OtherBall.body.x = otherBallX;
            OtherBall.body.y = otherBallY;
        };


    },

    play: function () {

    },

    over: function () {}
};

/*
var userList = {};

function addUser(id) {
    var sprite = game.add.sprite(x, y, 'img');
    sprite.anchor.x = 0.5;
    userList[id] = sprite;
}

function init(playerList) {
    playerList.forEach(function (player) {
        addUser(player);
    }, this);
}
*/

Object.keys(state).map(function (key) {
    game.state.add(key, state[key]);
});
game.state.start('preload');
