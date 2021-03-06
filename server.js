// 引入http模块
var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server),
    users   = [];       // 保存所有在线用户的昵称

app.use('/', express.static(__dirname));

server.listen(process.env.PORT || 5000);

io.on('connection', function(socket) {

  socket.on('foo', function(data) {
    socket.emit('haha', 'Nice to meet you!');
  });

  socket.on('login', function(nickname) {
    if (users.indexOf(nickname) > -1) {
      socket.emit('loginFailed', '用户已存在！');
    } else {
      socket.userIndex = users.length;
      socket.nickname = nickname;
      users[users.length] = nickname;
      socket.emit('loginSuccessed', nickname);
      io.sockets.emit('system', nickname, users.length, 'login');
    }
  });

  socket.on('postMsg', function(msg) {
    if (msg.length > 0) {
      socket.broadcast.emit('msgBroadcast', msg);


    } else {

    }
  });



  socket.on('disconnect', function() {
    users.splice(socket.userIndex, 1);
    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
  })
});

console.log('Server running at http://127.0.0.1:5000/');
