//var socket = io.connect("ws://localhost:9999");

var game = new Phaser.Game(400, 600, Phaser.AUTO, 'mygame');

//定義場景
var state = {
    //加載
    preload: function () {
        this.create = function () {
            //背景顏色是紅色
            game.stage.backgroundColor = "#FF9797";
            //3秒鐘後換成create場景
            setTimeout(function () {
                game.state.start('create');
            }, 3000);
        };
    },

    //開始
    create: function () {
        this.create = function () {
            //背景顏色為橙色
            game.stage.backgroundColor = '#FF8000';
            //3秒後場景轉為play
            setTimeout(() => {
                game.state.start('play');
            }, 3000);
        }
    },
    play: function () {
        this.create = function () {
            //場景變黃色
            game.stage.backgroundColor = '#FFFF37';
            setTimeout(() => {
                game.state.start('over');
            }, 3000);
        };
    },
    over: function () {
        this.create = function () {
            game.stage.backgroundColor = '#9AFF02';
            alert('結束');
        }
    }
};

Object.keys(state).map(function (key) {
    game.state.add(key, state[key]);
});
//啟動遊戲
game.state.start('preload');