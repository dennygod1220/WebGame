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
var name = null;
var ball;
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
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
        };
        this.create = function () {

            game.stage.backgroundColor = '#FFFFFF';
/*監聽Server是否傳送連線成功事件，如果有 就會轉到create場景*/
            socket.on('connect sucess', function (data) {
                alert('連線成功:' + data);
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
            ball = game.add.sprite(50, 50, 'ball');
        };
    },

    play: function () {},

    over: function () {}
};


Object.keys(state).map(function (key) {
    game.state.add(key, state[key]);
});
game.state.start('preload');
