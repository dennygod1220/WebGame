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
    });

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
