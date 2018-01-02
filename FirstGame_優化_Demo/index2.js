/*基本連線設定_使用SOCKET.IO*/
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var PORT = 9999;
var io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

server.listen(PORT);
/* --------------------------變數---------------------------------------------------*/
var PlayerInfo;
var Player = [];
var PlayerName;
var Bricks =[];
var newBrick ={};
var star ={};
var ConnectCount = 0;
/*-----------------------------初始 障礙物 位置-----------------*/
function randomBrick() {
    for (var i = 0; i < 10; i++) {
        newBrick = {
            x : getRandomInt(40,460),
            y : getRandomInt(40,460)
        };
        Bricks[i] = newBrick;
    }
}
/*-----------------------------初始 星星 位置--------------------*/
function randomStar() {
    star = {
        x:getRandomInt(20, 480),
        y:getRandomInt(20, 480),
    };
}

/*------------------------------亂數方法------------------------*/
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/*-------------------------玩家資訊------------------------------------*/
function initPlayer(Name, id, x, y, connectID) {
    PlayerInfo = {
        Name: Name,
        ID: id,
        Player_X: x,
        Player_Y: y,
        connectID: connectID,
        score : 0
    };
    Player.push(PlayerInfo);
}
/*-----------------------主程式--------------------------------------*/
randomStar();
randomBrick();

io.on('connection', function (socket) {
    console.log('a user is connect , this socket id is : ' + socket.id);
    ConnectCount++;

    //收到玩家的名字後
    socket.on('send name', function (data) {
        //將收到的名字存入變數PlayerName
        PlayerName = data;
        //執行initPlayer()，使這位玩家的資訊能夠存入Server的陣列中，
        //這邊可以看到initPlayer()方法要傳入好多參數阿，5個
        //分別是 名字、玩家ID、亂數產生的x、亂數產生的y、連線通道的ID
        initPlayer(PlayerName, ConnectCount, getRandomInt(20, 480), getRandomInt(20, 480), socket.id);
        //將陣列洗乾淨，免得有undefined的無定義元素出現，導致Server的js出錯
        Player.sort();
        //將玩家的資訊傳送給這位玩家自己的client端js
        for (var i = 0; i < Player.length; i++) {
            if (Player[i].connectID === socket.id) {
                io.sockets.connected[socket.id].emit('connect sucess', Player[i]);
                break;
            }
        }

        //接收玩家位置
        socket.on('my position', function (data) {
            for (var i = 0; i < Player.length; i++) {
                if (Player[i].connectID === socket.id) {
                    Player[i].Player_X = data.x;
                    Player[i].Player_Y = data.y;
                    Player[i].score = data.score;
                    socket.broadcast.emit('Other Player Position',Player[i]);
                    break;
                }
            }
        });

        //發送目前障礙物位置
        socket.on('give me brick',function(){
            io.sockets.connected[socket.id].emit('for you brick',Bricks);
        });
        //發送星星位置
        socket.on('give me star',function(){
            io.sockets.connected[socket.id].emit('for you star',star);
        });
        //接收 玩家吃星星事件 重新給定星星和磚塊位置
        setInterval(function(){
            socket.once('ball hit star',function(){
                randomBrick();
                randomStar();
                for (var i = 0; i < Player.length; i++) {
                    if (Player[i].connectID === socket.id) {
                        Player[i].score ++;
                        io.sockets.connected[socket.id].emit('score update',Player[i].score);
                        socket.broadcast.emit('update other score',Player[i]);
                        break;
                    }
                }
            });
        },1000);

        //接收 星星和磚塊再一起
        socket.on('star in brick',function(){
            randomStar();
        });

        //玩家 關閉瀏覽器或是離開網頁時
        socket.on('disconnect', function (data) {
            //將此玩家從Server端的陣列中移除，並且將陣列再次洗牌，避免刪除後造成陣列元素的undefine而使Server報錯
            for (var i = 0; i < Player.length; i++) {
                if (Player[i].connectID === socket.id) {
                    socket.broadcast.emit('player leave',Player[i]);
                    delete Player[i];
                    Player.sort();
                    break;
                }
            }
            console.log('a user is disconnect');
        });
    });

});
