const socket = io();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const chatForm = document.getElementById('chat-form');
const chatList = document.getElementById('chat-list');
const chatInput = document.getElementById('chat-input');
const signInContainer = document.getElementById('sign-in');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const signInButton = document.getElementById('sign-in-button');
const signUpButton = document.getElementById('sign-up-button');
const profile = document.getElementById('profile');
const game = document.getElementById('game-container');
import { Player, Bullet } from './entities/Entities.js';

//IMAGE ASSETS
const Img = {}
Img.player = new Image();
Img.player.src = './assets/player.png';
Img.bullet = new Image();
Img.bullet.src = './assets/bullet.png';
Img.map = new Image();
Img.map.src = './assets/map.png';
Img.asteroid = new Image();
Img.asteroid.src = './assets/asteroid.png';

signInButton.onclick = e => {
  e.preventDefault();
  const username = usernameInput.value
  const password = passwordInput.value
  socket.emit('signIn', { username, password });
};

socket.on('signInResponse', data => {
  if (data.success) {
    signInContainer.style.display = 'none';
    game.style.display = 'flex';
  } else {
    alert(data.msg)
  }
});

signUpButton.onclick = () => {
  const username = usernameInput.value
  const password = passwordInput.value
  socket.emit('signUp', { username, password });
};

socket.on('signUpResponse', data => {
  alert(data.msg)
});

//ACTIVE SOCKET ID;
let selfId = null;

//CANVAS HEIGHT/WIDTH
let WIDTH = 800;
let HEIGHT = 600;

//ACTIVE PLAYERS AND BULLETS
const PLAYER_LIST = {};
const BULLET_LIST = {};

//DRAW FUNCTIONS

const drawMap = () => {
  const x = WIDTH / 2 - PLAYER_LIST[selfId].x;
  const y = WIDTH / 2 - PLAYER_LIST[selfId].y;
  ctx.drawImage(Img.map, x, y);
};

const drawScore = () => {
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + PLAYER_LIST[selfId].score, 0, 30);
};

// SOCKET EVENT LISTENERS

socket.on('init', data => {
  if (data.selfId) {
    selfId = data.selfId;
  }

  data.players.forEach(initPack => {
    const player = new Player(initPack);
    PLAYER_LIST[player.id] = player;
  });

  data.bullets.forEach(initPack => {
    const bullet = new Bullet(initPack);
    BULLET_LIST[bullet.id] = bullet;
  });
});

socket.on('update', data => {

  for (let i = 0; i < data.players.length; i++) {
    const updatedPlayer = data.players[i];
    const player = PLAYER_LIST[updatedPlayer.id]
    if (player) {
      if (updatedPlayer.x !== undefined) {
        player.x = updatedPlayer.x;
      }
      if (updatedPlayer.y !== undefined) {
        player.y = updatedPlayer.y;
      }
      if (updatedPlayer.hp !== undefined) {
        player.hp = updatedPlayer.hp;
      }
      if (updatedPlayer.score !== undefined) {
        player.score = updatedPlayer.score;
      }
    }
  }

  for (let i = 0; i < data.bullets.length; i++) {
    const updatedBullet = data.bullets[i];
    const bullet = BULLET_LIST[updatedBullet.id]
    if (bullet) {
      if (updatedBullet.x !== undefined) {
        bullet.x = updatedBullet.x;
      }
      if (updatedBullet.y !== undefined) {
        bullet.y = updatedBullet.y;
      }
    }
  }
});

socket.on('remove', data => {
  data.players.forEach(p => {
    delete PLAYER_LIST[p]
  });

  data.bullets.forEach(b => {
    delete BULLET_LIST[b];
  });
});

socket.on('evalAnswer', data => {
  console.log(data);
});

// KEY PRESS AND MOUSE ACTIONS

document.onkeydown = ({ keyCode }) => {
  if (keyCode === 87) {
    socket.emit('keyPress', { inputId: 'up', state: true })
  } else if (keyCode === 83) {
    socket.emit('keyPress', { inputId: 'down', state: true })
  } else if (keyCode === 65) {
    socket.emit('keyPress', { inputId: 'left', state: true })
  } else if (keyCode === 68) {
    socket.emit('keyPress', { inputId: 'right', state: true })
  }
};

document.onkeyup = ({ keyCode }) => {
  switch (keyCode) {
    case 87:
      socket.emit('keyPress', { inputId: 'up', state: false })
    case 83:
      socket.emit('keyPress', { inputId: 'down', state: false })
    case 65:
      socket.emit('keyPress', { inputId: 'left', state: false })
    case 68:
      socket.emit('keyPress', { inputId: 'right', state: false })
  }
};

document.onmousedown = () => {
  socket.emit('keyPress', { inputId: 'attack', state: true });
};

document.onmouseup = () => {
  socket.emit('keyPress', { inputId: 'attack', state: false });
};

document.onmousemove = event => {
  let x = -400 + event.clientX - 8;
  let y = -330 + event.clientY - 8;
  const angle = Math.atan2(y, x) / Math.PI * 180;

  socket.emit('keyPress', { inputId: 'mouseAngle', state: angle })
};

// CHAT ACTIONS

chatInput.addEventListener('focus', () => {
  socket.emit('typing', { state: true })
});

chatInput.addEventListener('blur', () => {
  socket.emit('typing', { state: false })
});

socket.on('addToChat', data => {
  const player = PLAYER_LIST[data.id];

  const chatMessage = document.createElement('li');
  chatMessage.id = 'chat-message';
  chatMessage.textContent = `${player.username} : ${data.message}`;

  chatList.appendChild(chatMessage);
  chatInput.value = '';
});

chatForm.onsubmit = event => {
  event.preventDefault();
  console.log('submitted');
  if (chatInput.value[0] === '/') {
    socket.emit('evalServer', chatInput.value.slice(1));
  } else {
    socket.emit('sendMessageToServer', chatInput.value);
  }
};

// GAME LOOP

setInterval(() => {
  if (!selfId) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawMap();
  drawScore();

  for (const id in PLAYER_LIST) {
    PLAYER_LIST[id].render(PLAYER_LIST, selfId, ctx, WIDTH, HEIGHT, Img);
  };

  for (const id in BULLET_LIST) {
    BULLET_LIST[id].render(PLAYER_LIST, selfId, ctx, WIDTH, HEIGHT, Img);
  };

}, 1000 / 30);
