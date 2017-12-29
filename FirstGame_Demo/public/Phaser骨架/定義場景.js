var width = 320;
var height = 568;

// 創建遊戲物件
var game = new Phaser.Game(width, height, Phaser.AUTO, '#game');

// 定義場景
var states = {
	// 加載場景
    preload: function() {},
    // 開始場景
    created: function() {},
    // 遊戲場景
    play: function() {},
    // 結束場景
    over: function() {}
};

// 添加場景到遊戲物件中
Object.keys(states).map(function(key) {
	game.state.add(key, states[key]);
});