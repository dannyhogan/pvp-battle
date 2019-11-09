require('dotenv').config();
require('./utils/connect')();
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {});
const { signUp, signIn } = require('./services/users');
const { Entity, Player, Bullet } = require('./entities/Entities');

app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/game.html');
});

const PORT = process.env.PORT || 2000;
server.listen(PORT);
console.log(`Server started on port ${PORT}.`);

// ACTIVE SOCKETS, PLAYERS, AND BULLETS //

const SOCKET_LIST = {};
const PLAYER_LIST = {};
const BULLET_LIST = {};

io.sockets.on('connection', socket => {

  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on('signIn', async data => {
    const validUser = await signIn(data)
    if (validUser) {
      onPlayerConnect(socket, validUser);
      socket.emit('signInResponse', { success: true })
    } else {
      socket.emit('signInResponse', { msg: 'Incorrect username or password, please try again.', success: false })
    }
  });

  socket.on('signUp', async data => {
    const user = await signUp(data);
    if (user) {
      socket.emit('signUpResponse', { msg: 'Sign up successful, please log in.' })
    } else {
      socket.emit('signUpResponse', { msg: 'That username is taken, please try another.' })
    }
  })

  socket.on('disconnect', () => {
    delete SOCKET_LIST[socket.id];
    onPlayerDisconnect(socket);
  });

  socket.on('sendMessageToServer', data => {;
    for (const id in SOCKET_LIST) {
      SOCKET_LIST[id].emit('addToChat',{ id: socket.id, message: data });
    }
  });

  const DEBUG = true;
  socket.on('evalServer', data => {
    if (!DEBUG) return;
    const res = eval(data);
    socket.emit('evalAnswer', res);
  });

});

const onPlayerConnect = (socket, user) => {

  const player = new Player(socket.id, user.username);
  PLAYER_LIST[socket.id] = player;

  initPack.players.push(player.getInitPack());

  socket.on('keyPress', data => {
    if (data.inputId === 'left') {
      player.pressingLeft = data.state;
    } else if (data.inputId === 'right') {
      player.pressingRight = data.state;
    } else if (data.inputId === 'up') {
      player.pressingUp = data.state;
    } else if (data.inputId === 'down') {
      player.pressingDown = data.state;
    } else if (data.inputId === 'attack') {
      player.pressingAttack = data.state;
    } else if (data.inputId === 'mouseAngle') {
      player.mouseAngle = data.state;
    }
  });

  socket.on('typing', data => {
    player.typing = data.state;
  })

  socket.emit('init', {
    selfId: socket.id,
    players: initPlayers(),
    bullets: initBullets()
  })

}

const initPlayers = () => {
  const players = [];
  for (const id in PLAYER_LIST) {
    players.push(PLAYER_LIST[id].getInitPack());
  }
  return players;
}

const updatePlayers = () => {
  const pack = [];
  for (const id in PLAYER_LIST) {
    const player = PLAYER_LIST[id];
    player.update(BULLET_LIST, initPack)
    pack.push(player.getUpdatePack());
  }
  return pack;
}

const onPlayerDisconnect = socket => {
  delete PLAYER_LIST[socket.id];
  removePack.players.push(socket.id);
}


const initBullets = () => {
  const bullets = [];
  for (const id in BULLET_LIST) {
    bullets.push(BULLET_LIST[id].initPack());
  }
  return bullets;
}

const updateBullets = () => {
  const pack = [];
  for (const id in BULLET_LIST) {
    const bullet = BULLET_LIST[id];
    if (bullet.toRemove === true) {
      removePack.bullets.push(bullet.id);
      delete BULLET_LIST[id];
    }
    bullet.update(PLAYER_LIST);
    pack.push(bullet.getUpdatePack());
  }
  return pack;
}

const initPack = { players: [], bullets: [] };
const removePack = { players: [], bullets: [] };

setInterval(() => {
  const updatePack = {
    players: updatePlayers(),
    bullets: updateBullets()
  }

  for (let i in SOCKET_LIST) {
    const socket = SOCKET_LIST[i];
    socket.emit('init', initPack);
    socket.emit('update', updatePack);
    socket.emit('remove', removePack);
  }

  initPack.players = [];
  initPack.bullets = [];
  removePack.players = [];
  removePack.bullets = [];

}, 1000 / 30);

module.exports = server;
