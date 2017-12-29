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
//球 移動速度值

//其他玩家球的位置
var otherBallX = 0;
var otherBallY = 0;
//自身的id
var playerid;
//其他人的id
var otherUserID = 0;
var OtherBall = [];
//其他玩家的name
var OtherUserName = [];
var othername;
//鍵盤
var mykeyboard;
/*---地形有關---*/
var bricks = null;
var bricknum = 5;
var newbrick=[];
var newbrick2=[];
//接收server傳送的 障礙物位置
var brickPosition_X=[];
var brickPosition_Y=[];
var brickPosition2_X=[];
var brickPosition2_Y=[];
/*---------------星星-------------------------*/
var star;
var star_x;
var star_y;
/*-------------------------移動速度------------------------------------*/
var haveSpeed = 80;
/*------------------------分數----------------------------------------*/
var Score = 0;
var ScoreText ;
var ScoreTab =[];
/*--------------------------場景--------------------------------------*/

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
                playerid = initialInfo.id;
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
            ball.body.velocity.x = 60;

            /*創建 名字 */
            text = game.add.text(ballinitialX, ballinitialY, name, '#fff');
            text.fontSize = 10;
            text.align = "center";
            game.physics.enable(text, Phaser.Physics.ARCADE);

            //建立其他玩家的球 
            for (var i = 0; i < 10; i++) {
                OtherBall[i] = game.add.sprite(0, 0, 'user');
                game.physics.enable(OtherBall[i], Phaser.Physics.ARCADE);
                //一開始沒其他玩家的話 對此物件先隱藏不做處理
                OtherBall[i].exists = false;
                //其他玩家的名字
                OtherUserName[i] = game.add.text(0, 0, '?', '#fff');
                OtherUserName[i].fontSize = 10;
                OtherUserName[i].align = "center";
                game.physics.enable(OtherUserName[i], Phaser.Physics.ARCADE);
                OtherUserName[i].exists = false;
            }
            /*--------------呼叫 創建 地形障礙物 -----------------------------*/
            
 
            radomBricks();
            
            /*--------------------創建 鍵盤---------------------------------*/
            mykeyboard = game.input.keyboard.addKeys({
                'up': Phaser.Keyboard.UP,
                'down': Phaser.Keyboard.DOWN,
                'left': Phaser.Keyboard.LEFT,
                'right': Phaser.Keyboard.RIGHT
            });
            /*--------------------創建 星星 ----------------------------------*/
            star = game.add.sprite(0,0,'star');
            star.anchor.set(0.5);
            game.physics.enable(star, Phaser.Physics.ARCADE);
            star.exists = false;
            /*-------------------創建 分數版-----------------------------------*/
            for(var i=0;i<10;i++){
                ScoreTab[i] = game.add.text(0,i*10,"Score:0",{ font: "10pt Courier", fill: "#19cb65", stroke: "#119f4e", strokeThickness: 0 });
                game.physics.enable(ScoreTab[i],Phaser.Physics.ARCADE);
                ScoreTab[i].exists = false ;
            }
        };


        this.update = function () {
            //向server 發送我要 障礙物位置 請求
            //socket.emit('I need brick position');

            socket.on('test',function(data){
                for(var i =0 ;i<5;i++){
                    brickPosition_X[i] = data.brick1_X[i];
                    brickPosition_Y[i] = data.brick1_Y[i];
                    brickPosition2_X[i] = data.brick2_X[i];
                    brickPosition2_Y[i] = data.brick2_Y[i];
                }
            });
            //更新 障礙物位置
            for(var i =0 ;i<5;i++){
                newbrick[i].body.x=brickPosition_X[i];
                newbrick[i].body.y = brickPosition_Y[i];
                newbrick[i].exists = true;
                newbrick2[i].body.x=brickPosition2_X[i];
                newbrick2[i].body.y = brickPosition2_Y[i];
                newbrick2[i].exists = true;
            }
            //啟動 障礙物 和 球 的碰撞偵測
            game.physics.arcade.collide(ball,bricks,ballhitbricks);
            //更新 星星位置
            //socket.emit('I need star position');
            socket.on('this is star position',function (starPosition) {
                star_x = starPosition.x;
                star_y = starPosition.y;
            });
            star.body.x = star_x;
            star.body.y = star_y;
            star.exists = true;
           // star.body.immovable = true;
            game.physics.arcade.collide(star,ball,ballHitStar);
            //讓名字和球一起移動
            text.body.x = ball.body.x;
            text.body.y = ball.body.y;
            //將 自己的球 位置 ID 傳送給server
            socket.emit('user ball position', {
                name: name,
                id: playerid,
                x: ball.body.x,
                y: ball.body.y,
                score:Score
            });
            //收聽廣播 收聽其他玩家球的位置 並將其他玩家的位置 和ID 存到全域變數中
            socket.on('other user position', function (data) {
                otherBallX = data.x;
                otherBallY = data.y;
                OtherBall[data.id].exists = true;
                otherUserID = data.id;
                OtherUserName[data.id].exists = true;
                OtherUserName[data.id].setText(data.name);
                ScoreTab[data.id].setText(data.name+' score :'+data.score);
                ScoreTab[data.id].exists = true ;
            });
            OtherBall[otherUserID].body.x = otherBallX;
            OtherBall[otherUserID].body.y = otherBallY;
            OtherUserName[otherUserID].body.x = otherBallX;
            OtherUserName[otherUserID].body.y = otherBallY;

            //當其他玩家離開時 讓他的球消失
            socket.on('user disconnect', function (data) {
                console.log('Other user leave' + data.id);
                OtherBall[data.id].exists = false;
                OtherUserName[data.id].exists = false;
                ScoreTab[data.id].exists = false;
            });
            /*自己分數顯示*/
            ScoreTab[playerid].setText(name+' score :'+Score);
            ScoreTab[playerid].exists = true;
            /*呼叫 鍵盤 方法*/
            ballmove(haveSpeed);
        };



    },

    play: function () {

    },

    over: function () {}
};
/*-----------------------------------------------------------------------*/
function ballhitbricks() {
    alert('lose');
    location.reload();
  }

/*------------------鍵盤控制----------------------------------------------*/
function ballmove(haveSpeed) {

    if (mykeyboard.up.isDown) {
        ball.body.velocity.y = -haveSpeed;
        ball.body.velocity.x = 0;
        console.log(ball.body.velocity.y);
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
/*------------------------radomBricks()用來創造障礙物的------------------------------------*/
function radomBricks() {
    bricks = game.add.group();
    for(var i = 0 ; i < bricknum ; i++){
      var x = 0;
      var y = 0;
      newbrick[i] = game.add.sprite(x,y,'brick');
      bricks.add(newbrick[i]);
      game.physics.enable(newbrick[i],Phaser.Physics.ARCADE);
      newbrick[i].body.immovable = false;
      newbrick[i].exists = false;
    }
    for(var j = 0 ; j < bricknum ; j++){
      var x2 = Math.floor(Math.random()*(780-20))+20;
      var y2 = Math.floor(Math.random()*(580-20))+20;
      newbrick2[j] = game.add.sprite(x2,y2,'brick2');
      bricks.add(newbrick2[j]);
      game.physics.enable(newbrick2[j],Phaser.Physics.ARCADE);
      newbrick2[j].body.immovable = true;
      newbrick2[j].exists = false;
    }
    
  }
/*-----------------------------BallHitStar------------------------------*/
function ballHitStar(){
    Score ++;
    socket.emit('eat star',{id:playerid,name:name,score:Score});
    haveSpeed = haveSpeed + 5;

}
/*--------------------------------------------------------------------------------------*/
Object.keys(state).map(function (key) {
    game.state.add(key, state[key]);
});
game.state.start('preload');
