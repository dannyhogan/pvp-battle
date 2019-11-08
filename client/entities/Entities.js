export class Player {
  constructor(initPack) {
    this.id = initPack.id,
      this.username = initPack.username,
      this.x = initPack.x,
      this.y = initPack.y,
      this.hp = initPack.hp,
      this.hpMax = initPack.hpMax,
      this.score = initPack.score,
      this.number = initPack.number
  }

  render(PLAYER_LIST, selfId, ctx, WIDTH, HEIGHT, Img) {
    const x = this.x - PLAYER_LIST[selfId].x + WIDTH / 2;
    const y = this.y - PLAYER_LIST[selfId].y + HEIGHT / 2;

    const hpBarWidth = 30 * this.hp / this.hpMax;
    ctx.fillStyle = 'red';

    const width = Img.player.width * 2;
    const height = Img.player.height * 2;

    ctx.fillRect(x - hpBarWidth / 2, y - 40, hpBarWidth, 4);
    ctx.drawImage(Img.player,
      0, 0, Img.player.width, Img.player.height,
      x - width / 2, y - height / 2, width, height);
  }
}

export class Bullet {
  
  constructor(initPack, BULLET_LIST) {
    this.id = initPack.id,
      this.x = initPack.x,
      this.y = initPack.y
  };

  render(PLAYER_LIST, selfId, ctx, WIDTH, HEIGHT, Img) {

    const width = Img.bullet.width * 2;
    const height = Img.bullet.height * 2;

    const x = this.x - PLAYER_LIST[selfId].x + WIDTH / 2;
    const y = this.y - PLAYER_LIST[selfId].y + HEIGHT / 2;

    ctx.drawImage(Img.bullet,
      0, 0, Img.bullet.width, Img.bullet.height,
      x - width / 2, y - height / 2, width, height);
  }
}
