window.onload = function() {
  IM.init();
  IM.emojiInit();
  IM.receive();
  IM.login();
  IM.onKeyDown();
  IM.postMessage();
  IM.forbidZoom();
  IM.imgFileSelect();
  IM.emojiShow();
  IM.emojiSelect();
}

// 定义 IM 命名空间
var IM = {};

IM.init = function() {
  // 建立到服务器的 socket 连接
  IM.socket = io.connect();

  // 监听 socket 的 connect 事件，表示连接已建立
  IM.socket.on('connect', function() {
    // 已经连接到服务器
    // document.getElementsByTagName('div')[2].className = 'show';
    document.getElementById('info').className = 'hide';
    $('#loginArea').fadeIn(2000);
    // document.getElementById('loginArea').className = 'show';
    document.getElementById('nickname').focus();
  })
};

IM.emojiInit = function() {
  var smojiSrc = '';

  for (var i = 0; i < 40; ++i) {
    smojiSrc = './emoji/' + (i + 1) + '.gif';
    $('#emojiSelectArea')[0].innerHTML += '<a href="">' + "<img style='padding:10px' src="+ smojiSrc +">" + '</a>';
  }
}

IM.forbidZoom = function() {
  window.onmousewheel = document.onmousewheel = function(e) {
    e=e || window.event;
    if(e.wheelDelta && event.ctrlKey){//IE/Opera/Chrome
     event.returnValue=false;
    }else if(e.detail){//Firefox
     event.returnValue=false;
    }
  }
};

IM.onKeyDown = function() {
  $('#writeContent').keypress(function(event) {
      var keycode = (event.keyCode ? event.keyCode : event.which);

      if(keycode == '13'){    // 按下 enter 键
        IM.sendButtonClicked();
        event.preventDefault();
      }
  });

  $('#nickname').keypress(function(event) {
      var keycode = (event.keyCode ? event.keyCode : event.which);

      if(keycode == '13'){    // 按下 enter 键
        IM.loginButtonClicked();
      }
  });
};

IM.formatDateTime = function(date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  var minute = date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  var seconds = date.getSeconds();
  seconds = seconds < 10 ? ('0' + seconds) : seconds;
  return y + '-' + m + '-' + d+' '+h+':'+minute+':'+seconds;
};

IM.receive = function() {
  IM.socket.on('loginFailed', function(data) {
    document.getElementById('info').innerHTML = '昵称已经被使用！';
  });

  IM.socket.on('loginSuccessed', function(nickname) {
    document.getElementsByTagName('div')[0].className = '';
    document.getElementsByTagName('div')[1].className = 'hide';
    IM.nickname = nickname;
    document.title = 'IM 聊天室 ---- ' + nickname;
    document.getElementById('writeContent').focus();
  });

  IM.socket.on('system', function(nickname, userLength, state) {
    var showContent = document.getElementById('showContent');
    var date = IM.formatDateTime(new Date());

    document.getElementById('userOnlineNum').innerHTML = userLength;
    if (state === 'login') {
      showContent.innerHTML += '<span style="color: #5b6169">' + '系统提示' + ' ( ' + date + ' ) ' + ': ' + nickname + ' 进入房间' + '</span>' + '<br>' ;
    } else {
      showContent.innerHTML += '<span style="color: #5b6169">' + '系统提示： ' + nickname + ' 离开了' + '</span>' + '<br>';
    }
  });

  IM.socket.on('msgBroadcast', function(msg) {
    document.getElementById('showContent').innerHTML += msg;
    $('#showContent')[0].scrollTop = $('#showContent')[0].scrollHeight;       // 对话框滚动条始终保持在最底部
  });
}

IM.loginButtonClicked = function() {
  var nickname = document.getElementById('nickname');

  if (nickname.value.length > 0) {
    IM.socket.emit('login', nickname.value)
  } else {
    nickname.focus();
    alert('请输入您的昵称！');
  }
}

IM.login = function() {
  var loginBtn = document.getElementById('loginBtn');

  loginBtn.onclick = function() {
    IM.loginButtonClicked();
  };
};

IM.sendButtonClicked = function(imgSrc) {
  var message = document.getElementById('writeContent');
  var msg = '';


  if (message.value.length > 0 || imgSrc !== undefined) {
    var showContent = document.getElementById('showContent');
    var date = IM.formatDateTime(new Date());
    var reg = /\[emoji:\d+\]/g;

    switch (IM.nickname) {
      case '刘轩':
        IM.nickname = '<span style="color: #70bdff">' + IM.nickname + '</span>';
        break;
      case '法国大种马':
        IM.nickname = '<span style="color: #ff7070">' + IM.nickname + '</span>';
        break;
      default:
        break;
    }

    if (imgSrc === undefined) {
      msg = '<span style="color: #fff670">' + IM.nickname + '&nbsp;' + '&nbsp;' + '&nbsp;' + '&nbsp;' + date +
            '</span>' + '<br>' + '<span style="padding-left: 20px">' + message.value + '</span>' + '<br>';
    } else {
      msg = '<span style="color: #fff670">' + IM.nickname + '&nbsp;' + '&nbsp;' + '&nbsp;' + '&nbsp;' + date +
            '</span>' + '<br>' + '<span style="padding-left: 20px">' + message.value + '</span>' + '<br>' +
            "<img src="+ imgSrc +" alt='uploadImg'>" + '<br>';
    }




      console.log(reg.exec(msg));





    showContent.innerHTML += msg;
    IM.socket.emit('postMsg', msg);
  } else {
    alert('请输入内容后再发送！');
  }

  $('#showContent')[0].scrollTop = $('#showContent')[0].scrollHeight;       // 对话框滚动条始终保持在最底部
  message.value = '';
  message.focus();
}

IM.postMessage = function() {
  var sendBtn = document.getElementById('sendBtn');

  sendBtn.onclick = function() {
    IM.sendButtonClicked();
  }
}

IM.imgFileSelect = function() {
  var imgFile = $('#selectImgFile')[0];

  imgFile.onchange = function() {
    if (imgFile.files.length > 0) {
      var file = imgFile.files[0];
      var reader = new FileReader();

      if (!reader) {
        alert('您的浏览器不支持 FileReader!');
        return ;
      }

      reader.onload = function(e) {
        IM.sendButtonClicked(this.result);
      }

      reader.readAsDataURL(file);
    }
  }
}


IM.emojiShow = function() {
  $('#emoji')[0].onclick = function() {
    $('#emojiSelectArea').toggle(400);
  }
}

IM.emojiSelect = function() {
  var emojiShow = $('#emojiSelectArea')[0];
  var emojiArr = emojiShow.getElementsByTagName('a');

  for (var i = 0; i < emojiArr.length; ++i) {
    emojiArr[i].index = i;
    emojiArr[i].onclick = function(e) {
      var emojiID = this.index;

      document.getElementById('writeContent').value += '[emoji:' + emojiID + ']';

      e.preventDefault();
    }
  }
}
