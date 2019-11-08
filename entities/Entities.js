class Entity {

  constructor(id) {
    this.x = 1280;
    this.y = 1105;
    this.spdX = 0;
    this.spdY = 0;
    this.id = id;
  }

  updateEntity() {
    this.updateEntityPosition();
  }

  updateEntityPosition() {
    this.x += this.spdX;
    this.y += this.spdY;

    if (this.x < 20) {
      this.spdX = -this.spdX;
      this.x = 21;
    }

    if (this.y < 220) {
      this.spdY = -this.spdY;
      this.y = 221;
    }

    if (this.x > 2540) {
      this.spdX = -this.spdX;
      this.x = 2539;
    }

    if (this.y > 2360) {
      this.spdY = -this.spdY;
      this.y = 2359;
    }

  }

  getDistance(point) {
    return Math.sqrt(Math.pow((this.x - point.x), 2) + Math.pow((this.y - point.y), 2));
  }
}

class Player extends Entity {

  constructor(id, username) {
    super(id);
    this.username = username;
    this.number = Math.floor(10 * Math.random());
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressingAttack = false;
    this.mouseAngle = 0;
    this.maxSpd = 10;
    this.hp = 10;
    this.hpMax = 10;
    this.score = 0;
  };

  update(BULLET_LIST, initPack) {
    this.updateSpd();
    this.updateEntity();
    this.pressingAttack && this.shootBullet(this.mouseAngle, BULLET_LIST, initPack);
  }

  shootBullet(angle, BULLET_LIST, initPack) {
    const bullet = new Bullet(angle, this.id);
    bullet.x = this.x;
    bullet.y = this.y;

    BULLET_LIST[bullet.id] = bullet;
    initPack.bullets.push(bullet.getInitPack())
  }

  updateSpd() {
    if (this.pressingRight)
      this.spdX = this.maxSpd;
    else if (this.pressingLeft)
      this.spdX = -this.maxSpd;
    else
      this.spdX = 0;

    if (this.pressingUp)
      this.spdY = -this.maxSpd;
    else if (this.pressingDown)
      this.spdY = this.maxSpd;
    else
      this.spdY = 0;
  }

  getInitPack() {
    return {
      username: this.username,
      id: this.id,
      x: this.x,
      y: this.y,
      number: this.number,
      hp: this.hp = 10,
      hpMax: this.hpMax = 10,
      score: this.score
    }
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.hp,
      score: this.score
    }
  }
}


class Bullet extends Entity {
  constructor(angle, parent) {
    super(Math.random());
    this.parent = parent;
    this.spdX = Math.cos(angle / 180 * Math.PI) * 10;
    this.spdY = Math.sin(angle / 180 * Math.PI) * 10;
    this.timer = 0;
    this.toRemove = false;
    this.range = 10;
  }

  update(PLAYER_LIST) {
    if (this.timer++ > this.range) {
      this.toRemove = true;
    }

    this.updateEntity();

    for (const id in PLAYER_LIST) {
      const player = PLAYER_LIST[id];
      if (this.getDistance(player) < 32 && this.parent !== player.id) {
        player.hp -= 1;
        const shooter = PLAYER_LIST[this.parent];
        if (player.hp <= 0) {

          player.hp = player.hpMax;
          player.x = Math.random() * 500;
          player.y = Math.random() * 500;

          if (shooter) {
            shooter.score += 1;
          }
        }
        this.toRemove = true;
      }
    }
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    }
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    }
  }
}

module.exports = { Entity, Player, Bullet }
