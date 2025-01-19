if (window.Telegram && window.Telegram.WebApp) {
  const app = window.Telegram.WebApp;
  app.ready();

  // Отключаем вертикальные свайпы
  if (app.disableVerticalSwipes) {
    app.disableVerticalSwipes();
  }

  // Включаем подтверждение закрытия приложения
  app.isClosingConfirmationEnabled = true;

  console.log("Telegram Web App API initialized");
} else {
  console.warn("Telegram Web App API не доступен. Проверьте, запускается ли приложение внутри Telegram.");
}

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Snake {
  static LEFT = -1;
  static RIGHT = 1;
  static UP = 2;
  static DOWN = -2;
  static TIC = 100;
  static CELLS_COUNT = 20;
  static head_l = new Image(10, 10);
  static head_r = new Image(10, 10);
  static head_u = new Image(10, 10);
  static head_d = new Image(10, 10);
  static body_img = new Image(10, 10);
  static apple_img = new Image(10, 10);

  head = new Image(10, 10);
  is_game_stated = false;
  is_game_over = false;
  body = [];
  apple;

  constructor(vec, width, height, ctx) {
    this.vec = vec;
    this.set_width_and_height(width, height);
    this.body.push(new Position(5, 5));
    this.create_apple();
    this.ctx = ctx;
    this.load_images();
  }

  load_images() {
    Snake.head_l.src = `img/head${Snake.LEFT}.png`;
    Snake.head_r.src = `img/head${Snake.RIGHT}.png`;
    Snake.head_u.src = `img/head${Snake.UP}.png`;
    Snake.head_d.src = `img/head${Snake.DOWN}.png`;
    Snake.body_img.src = 'img/body.png';
    Snake.apple_img.src = 'img/apple.png';
    this.set_head();
  }

  set_head() {
    if (this.vec == Snake.LEFT) this.head = Snake.head_l;
    else if (this.vec == Snake.RIGHT) this.head = Snake.head_r;
    else if (this.vec == Snake.UP) this.head = Snake.head_u;
    else if (this.vec == Snake.DOWN) this.head = Snake.head_d;
  }

  set_vec(vec) {
    setTimeout(() => {
      this.vec = vec;
      this.set_head();
    }, Snake.TIC);
  }

  set_width_and_height(width, height) {
    this.width = width;
    this.height = height;
    this.size =
      width > canvas.height
        ? Math.floor(height / Snake.CELLS_COUNT)
        : Math.floor(width / Snake.CELLS_COUNT);
  }

  eat() {
    if (this.vec == Snake.RIGHT)
      this.body.unshift(new Position(this.body[0].x + 1, this.body[0].y));
    if (this.vec == Snake.LEFT)
      this.body.unshift(new Position(this.body[0].x - 1, this.body[0].y));
    if (this.vec == Snake.UP)
      this.body.unshift(new Position(this.body[0].x, this.body[0].y - 1));
    if (this.vec == Snake.DOWN)
      this.body.unshift(new Position(this.body[0].x, this.body[0].y + 1));
  }

  move() {
    this.is_game_stated = true;
    this.update();

    for (var i = this.body.length - 1; i > 0; i--) {
      this.body[i].x = this.body[i - 1].x;
      this.body[i].y = this.body[i - 1].y;
    }

    if (this.vec == Snake.RIGHT) this.body[0].x++;
    if (this.vec == Snake.LEFT) this.body[0].x--;
    if (this.vec == Snake.UP) this.body[0].y--;
    if (this.vec == Snake.DOWN) this.body[0].y++;

    this.check_borders();
    this.check_is_eaten();
    this.paint();
    this.check_death();
  }

  check_is_eaten() {
    if (
      Math.abs(this.body[0].x - this.apple.x) < 1 &&
      Math.abs(this.body[0].y - this.apple.y) < 1
    ) {
      this.eat();
      this.create_apple();
    }
  }

  check_borders() {
    if (this.body[0].x >= Math.floor(this.width / this.size))
      this.body[0].x = 0;
    if (this.body[0].y >= Math.floor(this.height / this.size))
      this.body[0].y = 0;
    if (this.body[0].x < 0) this.body[0].x = Math.floor(this.width / this.size);
    if (this.body[0].y < 0) this.body[0].y = Math.floor(this.height / this.size);
  }

  create_apple() {
    let x = Math.floor(this.width / this.size);
    let y = Math.floor(this.height / this.size);
    this.apple = new Position(this.getRandomInt(x), this.getRandomInt(y));
  }

  check_death() {
    for (var i = 1; i < this.body.length; i++) {
      if (
        this.body[0].x == this.body[i].x &&
        this.body[0].y == this.body[i].y
      ) {
        this.game_over();
      }
    }
  }

  game_over() {
    console.log('death');
    this.body = [this.body[0]];
    this.update();
  }

  paint() {
    this.ctx.fillStyle = 'red';

    for (var i = 0; i < this.body.length; i++) {
      if (i == 0) {
        this.ctx.drawImage(
          this.head,
          this.body[0].x * this.size - this.size / 2,
          this.body[0].y * this.size - this.size / 2,
          this.size * 2,
          this.size * 2
        );
      } else {
        this.ctx.drawImage(
          Snake.body_img,
          this.body[i].x * this.size,
          this.body[i].y * this.size,
          this.size,
          this.size
        );
      }
    }
    this.ctx.fillStyle = 'black';
    this.ctx.font = `bold ${this.size}px arial`;
    this.ctx.fillText(
      `score: ${this.body.length - 1}`,
      5,
      this.size
    );
    this.ctx.drawImage(
      Snake.apple_img,
      this.apple.x * this.size,
      this.apple.y * this.size,
      this.size,
      this.size
    );
  }

  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}

const canvas = document.getElementById('game_field');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const snake = new Snake(
  Snake.RIGHT,
  canvas.width,
  canvas.height,
  canvas.getContext('2d')
);

function start() {
  console.log('start');
  timer = setInterval(() => {
    snake.move();
  }, Snake.TIC);
}

window.addEventListener('load', () => {
  console.log('All assets are loaded');
  start();
});

window.addEventListener(
  'resize',
  (event) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    snake.set_width_and_height(canvas.width, canvas.height);
    setTimeout(() => {
      snake.create_apple();
    }, Snake.TIC);
  },
  true
);

window.addEventListener(
  'keydown',
  (event) => {
    let key = event.key;

    if (key === 'ArrowDown' && snake.vec !== Snake.UP) snake.set_vec(Snake.DOWN);
    else if (key === 'ArrowUp' && snake.vec !== Snake.DOWN) snake.set_vec(Snake.UP);
    else if (key === 'ArrowLeft' && snake.vec !== Snake.RIGHT) snake.set_vec(Snake.LEFT);
    else if (key === 'ArrowRight' && snake.vec !== Snake.LEFT) snake.set_vec(Snake.RIGHT);
    else if (key === 'Enter' && !snake.is_game_stated) start();

    event.preventDefault();
  },
  true
);

let xDown = null;
let yDown = null;

window.addEventListener('load', () => {
  const gameStage = document.getElementById('game_field');

  if (!gameStage) {
    console.error('Game field not found');
    return;
  }

  gameStage.addEventListener('touchstart', handleTouchStart, false);
  gameStage.addEventListener('touchmove', handleTouchMove, false);

  console.log('Swipe handlers attached to game field');
});

function handleTouchStart(evt) {
  const firstTouch = evt.touches[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
  console.log('Touch Start:', xDown, yDown);
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    console.log('No touch start coordinates');
    return;
  }

  const xUp = evt.touches[0].clientX;
  const yUp = evt.touches[0].clientY;

  const xDiff = xDown - xUp;
  const yDiff = yDown - yUp;

  console.log('Swipe detected:', { xDiff, yDiff });

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (xDiff > 0) {
      console.log('Swipe LEFT');
      snake.set_vec(Snake.LEFT);
    } else {
      console.log('Swipe RIGHT');
      snake.set_vec(Snake.RIGHT);
    }
  } else {
    if (yDiff > 0) {
      console.log('Swipe UP');
      snake.set_vec(Snake.UP);
    } else {
      console.log('Swipe DOWN');
      snake.set_vec(Snake.DOWN);
    }
  }

  xDown = null;
  yDown = null;
}

document.body.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });
