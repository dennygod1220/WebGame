var socket = io();

var width = 500;
var height = 500;

// 創建遊戲物件
var game = new Phaser.Game(width, height, Phaser.AUTO, 'mygame');
// 玩家 的球
var ball;
//玩家的資訊
var PlayerInfo = {};
//名字
var text;
//鍵盤
var mykeyboard;
var haveSpeed = 60;
//其他玩家
var OtherPlayer = [];
var OtherPlayerInfo = {};
var OtherUserName = [];
var OtherBall = [];
//障礙物
var Bricks = [];
var newBrick = {};
var mybrick = [];
var BrickGroup;
//星星
var star;
var starInfo = {};
// 記分板
var ScoreTab =[];
var Score = 0;
// 定義場景
var state = {
    // 加載場景
    preload: function () {
        //遊戲資源載入
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
            //使遊戲畫面致中
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
        };
        //建立登入畫面時在那邊斗的球球和使用者資訊的送出及接收處理
        this.create = function () {
            game.stage.backgroundColor = '#FFFFFF';
            ball = game.add.sprite(0, 0, 'ball');
            game.physics.enable(ball, Phaser.Physics.ARCADE);
            ball.body.velocity.x = 200;
            ball.body.velocity.y = 100;
            ball.body.collideWorldBounds = true;
            ball.anchor.set(0.5);
            ball.body.bounce.set(1);
            //使用者名稱送出處理處
            $(function () {
                $('#btn').click(function () {
                    name = $.trim($('#inputText').val());
                    if (name) {
                        socket.emit('send name', name);
                        $('#name').hide();
                    } else {
                        game.add.text(50, 50, "請輸入暱稱才能開始玩喔!", {
                            font: "28pt Courier",
                            fill: "#19cb65",
                            stroke: "#119f4e",
                            strokeThickness: 0
                        });
                    }
                });
            });
            //socket偵聽事件，用來接收從Server發出的connect sucess事件，
            //收到後 會將使用者自己的資訊存入PlayerInfo這個全域的物件中，並讓這個物件長出屬性
            socket.on('connect sucess', function (data) {
                PlayerInfo.name = data.Name;
                PlayerInfo.id = data.ID;
                PlayerInfo.x = data.Player_X;
                PlayerInfo.y = data.Player_Y;
                PlayerInfo.connectID = data.connectID;
                PlayerInfo.score = data.score;
                //收到connect sucess事件，就表示登入成功，所以也不用留在這場景了，準備跳到下一個場景created
                game.state.start('created');
            });

        };
    },
    // 開始場景
    created: function () {
        this.create = function () {
            //進入玩遊戲的時間了，先改背景顏色再說
            game.stage.backgroundColor = '#DEDEDE';
            //把使用者的球球見出來 不然玩個屁
            ball = game.add.sprite(PlayerInfo.x, PlayerInfo.y, 'ball');
            ball.anchor.set(0.5);
            //啟用ARCADE物理引擎，不然這棵球球跟死的依樣，這樣才能讓他活過來
            game.physics.enable(ball, Phaser.Physics.ARCADE);
            //讓球球部會因為討厭玩家的醜陋而自己衝出畫布外
            ball.body.collideWorldBounds = true;
            //球球雖然活著，但部會動，所以讓他一開始向著x的方向移動 速度=60
            ball.body.velocity.x = 60;

            //建立名字，人都要有老婆，球球也是，也想要有個會跟著自己跑的老婆
            text = game.add.text(PlayerInfo.x, PlayerInfo.y, PlayerInfo.name, {
                font: "8pt Courier",
                fill: "#00BBFF",
                stroke: "#119f4e",
                strokeThickness: 0
            });
            //讓球球的老婆也活起來
            game.physics.enable(text, Phaser.Physics.ARCADE);


            //建立 鍵盤控制
            mykeyboard = game.input.keyboard.addKeys({
                'up': Phaser.Keyboard.UP,
                'down': Phaser.Keyboard.DOWN,
                'left': Phaser.Keyboard.LEFT,
                'right': Phaser.Keyboard.RIGHT
            });

            //建立其他玩家的球球
            OtherUser();
            //每0.03秒鐘 送一次自己位置給 Server
            setInterval(function () {
                socket.emit('my position', PlayerInfo);
                //每0.03秒鐘 收一次其他玩家的位置並更新
                socket.on('Other Player Position', function (data) {
                    updateOtherPlayerInfo(data.Name, data.ID, data.Player_X, data.Player_Y, data.connectID,data.score);
                });
            }, 30);

            //接收 障礙物位置 和 星星位置
            setInterval(function () {
                socket.emit('give me brick');
                socket.on('for you brick', function (data) {
                    Bricks = data;
                });

                socket.emit('give me star');
                socket.on('for you star', function (data) {
                    starInfo = data;
                });
            }, 100);
            //建立記分板
            createScoreTab();

            createstar();
            createBrick();

        };

        this.update = function () {
            //讓球球的老婆會跟著球球一起私奔
            text.body.x = ball.body.x;
            text.body.y = ball.body.y - 12;
            //呼叫 鍵盤 方法
            ballmove(haveSpeed);
            //更新 球球 的位置
            if (PlayerInfo.x !== Math.floor(ball.body.x) || PlayerInfo.y !== Math.floor(ball.body.y)) {
                PlayerInfo.x = Math.floor(ball.body.x);
                PlayerInfo.y = Math.floor(ball.body.y);
            }

            //更新其他玩家的球

            for (var i = 0; i < OtherPlayer.length; i++) {
                if (OtherPlayer[i] != null) {
                    OtherBall[i].body.x = OtherPlayer[i].x;
                    OtherBall[i].body.y = OtherPlayer[i].y;
                    OtherBall[i].exists = true;
                    OtherUserName[i].body.x = OtherPlayer[i].x;
                    OtherUserName[i].body.y = OtherPlayer[i].y - 14;
                    OtherUserName[i].setText(OtherPlayer[i].Name);
                    OtherUserName[i].exists = true;
                }
                //當 其他儲存其他玩家資料的陣列 是undefined時 將他的球改為不顯示
                else if (typeof OtherPlayer[i] == "undefined") {
                    OtherBall[i].exists = false;
                    OtherUserName[i].exists = false;
                }
            }
            //更新 障礙物的位置
            for (var j = 0; j < Bricks.length; j++) {
                mybrick[j].body.x = Bricks[j].x;
                mybrick[j].body.y = Bricks[j].y;
            }
            //球撞到障礙物
            setInterval(function () {
                game.physics.arcade.collide(ball, BrickGroup, BallHitBrick);
            }, 1000);


            // 更新 星星位置 加上這個if判斷式 是為了避免 一開始還沒收到server給的位置時，starInfo.x為一個未定義物件
            // 避免因為定義 而使client端程式判斷錯誤 而產生不出星星 這個物件
            if (typeof starInfo.x != "undefined") {
                star.body.x = starInfo.x;
                star.body.y = starInfo.y;
            }
            //當球撞到星星
            game.physics.arcade.collide(ball, star, BallHitStar);
            //星星 在 磚塊內
            game.physics.arcade.collide(star, BrickGroup, starINBrick);

            socket.once('score update',function(data){
                PlayerInfo.score = data;
            });
            // 更新分數
            socket.on('update other score',function(data){
                for(var i=0;i<OtherPlayer.length;i++){
                    
                    if(typeof OtherPlayer[i] != "undefined"){
                        if(OtherPlayer[i].connectID == data.connectID){
                            OtherPlayer[i].score = data.score;
                            break;
                        }
                    }
                    
                }
            });
            // 更新記分板
            ScoreTab[0].setText(PlayerInfo.name + " : " +PlayerInfo.score);
            ScoreTab[0].exists = true;
            for(var i=1;i<OtherPlayer.length;i++){
                if(typeof OtherPlayer[i] != "undefined"){
                    ScoreTab[i].setText(OtherPlayer[i].Name+ " : "+OtherPlayer[i].score);
                    ScoreTab[i].exists = true;
                }
            }
            //當收到其他玩家的離線通知時 將client儲存他資料的陣列刪掉
            socket.on('player leave', function (data) {
                delete OtherPlayer[data.ID];
            });
            //讓球球跟著滑鼠跑 手機也可以玩
            /*var test = game.input.onHold;
            if(test){
                game.physics.arcade.moveToPointer(ball,60);
            }*/
            if(game.input.pointer1.isDown){
                game.physics.arcade.moveToPointer(ball,60);
            }

        };


    },

    // 結束場景

    over: function () {
        this.create = function () {
            game.stage.backgroundColor = '#FFFFFF';
            location.reload();
        };
    }

};
/*========================儲存更新其他玩家資料的方法=======================================*/
function updateOtherPlayerInfo(Name, id, x, y, connectID,score) {
    OtherPlayerInfo = {
        Name: Name,
        ID: id,
        x: x,
        y: y,
        connectID: connectID,
        score : score
    };
    OtherPlayer[id] = OtherPlayerInfo;
}
/*------------------------建立記分板--------------------------------*/
function createScoreTab(){
    for(var i=0;i<10;i++){
        ScoreTab[i] = game.add.text(0,i*10,"Score:0",{ font: "10pt Courier", fill: "#19cb65", stroke: "#119f4e", strokeThickness: 0 });
        game.physics.enable(ScoreTab[i],Phaser.Physics.ARCADE);
        ScoreTab[i].exists = false ;
    }
}
/*------------------------星星在磚塊內------------------------------*/
function starINBrick() {
    socket.emit('star in brick');
}

/*-------------------------球撞到星星-------------------------------*/
function BallHitStar() {
    socket.emit('ball hit star');
}
/*-------------------------createstar()-----------------------------*/
function createstar() {
    star = game.add.sprite(100, 0, 'star');
    game.physics.enable(star, Phaser.Physics.ARCADE);
}
/*-----------------------球撞到障礙物--------------------------------*/
function BallHitBrick() {
    alert('你輸了，請重新來過吧');
    game.state.start('over');
}
/*---------------------建立初始障礙物 10 個---------------------------*/
function createBrick() {
    BrickGroup = game.add.group();
    for (var i = 0; i < 10; i++) {
        mybrick[i] = game.add.sprite(0, 0, 'brick');
        game.physics.enable(mybrick[i], Phaser.Physics.ARCADE);
        BrickGroup.add(mybrick[i]);
    }
}

/*--------------------------------------------------------------*/
function ballmove(haveSpeed) {

    if (mykeyboard.up.isDown) {
        ball.body.velocity.y = -haveSpeed;
        ball.body.velocity.x = 0;
    }
    if (mykeyboard.down.isDown) {
        ball.body.velocity.y = haveSpeed;
        ball.body.velocity.x = 0;
    }
    if (mykeyboard.left.isDown) {
        ball.body.velocity.x = -haveSpeed;
        ball.body.velocity.y = 0;
    }
    if (mykeyboard.right.isDown) {
        ball.body.velocity.x = haveSpeed;
        ball.body.velocity.y = 0;
    }
    /*右上*/
    if (mykeyboard.right.isDown && mykeyboard.up.isDown) {
        ball.body.velocity.x = haveSpeed;
        ball.body.velocity.y = -haveSpeed;
    }
    /*右下*/
    if (mykeyboard.right.isDown && mykeyboard.down.isDown) {
        ball.body.velocity.x = haveSpeed;
        ball.body.velocity.y = haveSpeed;
    }
    /*左上*/
    if (mykeyboard.left.isDown && mykeyboard.up.isDown) {
        ball.body.velocity.x = -haveSpeed;
        ball.body.velocity.y = -haveSpeed;
    }
    /*左下*/
    if (mykeyboard.left.isDown && mykeyboard.down.isDown) {
        ball.body.velocity.x = -haveSpeed;
        ball.body.velocity.y = haveSpeed;
    }

}
/*-----------------------建立初始其他玩家使用的球--------------------------------------*/
function OtherUser() {
    // i的大小用來控制此遊戲能有多少其他玩家
    for (var i = 0; i < 10; i++) {
        OtherBall[i] = game.add.sprite(0, 0, 'user');
        game.physics.enable(OtherBall[i], Phaser.Physics.ARCADE);
        //一開始沒其他玩家的話 對此物件先隱藏不做處理
        OtherBall[i].exists = false;
        //其他玩家的名字
        OtherUserName[i] = game.add.text(0, 0, '?', {
            font: "8pt Courier",
            fill: "#FF0000",
            stroke: "#119f4e",
            strokeThickness: 0
        });
        game.physics.enable(OtherUserName[i], Phaser.Physics.ARCADE);
        OtherUserName[i].exists = false;
    }
}



// 添加場景到遊戲物件中

Object.keys(state).map(function (key) {

    game.state.add(key, state[key]);

});

game.state.start('preload');
