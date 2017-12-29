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
/* --------------------------SOCKET.IO---------------------------------------------------*/
var playerInfo = [];
var playerID = 0;
var name;
var brick1_X = [];
var brick1_Y = [];
var brick2_X = [];
var brick2_Y = [];
var star_X ;
var star_Y ;
/*-----------------------------初始 障礙物 位置-----------------*/
function randomBrick(){
for(var i=0;i<5;i++){
    brick1_X[i] = getRandomInt(30,570);
    brick1_Y[i] = getRandomInt(30,570);
    brick2_X[i] = getRandomInt(30,570);
    brick2_Y[i] = getRandomInt(30,570);
}
}
randomBrick();
/*-----------------------------初始 星星 位置--------------------*/
function randomStar(){
    star_X = getRandomInt(20,580);
    star_Y = getRandomInt(20,580);
}
randomStar();
/*-------------------------------------------------------------*/

io.on('connection', function (socket) {
    console.log('a user is connect , this socket id is : ' + socket.id);

    //接收玩家的名字
    socket.on('send name', function (data) {
        console.log('a user name is: ' + data);
        //每多一個連線playerID就加1
        playerID++;
        name = data;
        playerInfo[socket.id] = playerID;
        //針對此玩家發送起始座標
        io.sockets.connected[socket.id].emit('connect sucess', {
            name: name,
            id: playerID,
            x: getRandomInt(40, 560),
            y: getRandomInt(40, 560)
        });
        //發送所有地形障礙物位置給玩家  
        //socket.on('I need brick position',function(){     
            socket.emit('test',{brick1_X:brick1_X,brick1_Y:brick1_Y,brick2_X:brick2_X,brick2_Y:brick2_Y});  
            setInterval(function(){
                socket.emit('test',{brick1_X:brick1_X,brick1_Y:brick1_Y,brick2_X:brick2_X,brick2_Y:brick2_Y});
            } ,1000);
           
        //});
        //接收到使用者想要星星的位置後 發送給他
        //socket.on('I need star position',function(){
            socket.emit('this is star position',{x:star_X,y:star_Y});
            setInterval(function(){
                socket.emit('this is star position',{x:star_X,y:star_Y});
            },1000);
        //});
    });


    //每個玩家都會隨時發送自己當前的座標給server ， 並透過 server廣播給其他玩家
    socket.on('user ball position', function (data) {
        socket.broadcast.emit('other user position', data);
    });
    //Client斷線事件
    socket.on('disconnect', function (data) {
        console.log(playerInfo[socket.id] + ' user is disconnect');
        socket.broadcast.emit('user disconnect', {
            id: playerInfo[socket.id]
        });
    });
});

/*------------------------------亂數方法------------------------*/
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
