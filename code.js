window.onload = function() {
  document.body.focus();
  var canv = id("canvas"), preview = id("nextFigure");
  var ctx = canv.getContext('2d'), prv = preview.getContext('2d');
  var w = canv.width, h = canv.height;
  var bgp_w = null, bgp_h = null;
  const tetris = {
    width: 10,
    height: 20,
    x: 0,
    y: 0,
    data: null,
    speed: 333,
    originalSpeed: 333,
    score: 0,
    blocks: [
      [[1,1,0],[0,1,1]],
      [[0,1,1],[1,1,0]],
      [[1,1],[1,1]],
      [[0,1,0],[1,1,1]],
      [[1],[1],[1],[1]],
      [[1,0],[1,0],[1,1]],
      [[0,1],[0,1],[1,1]],
    ],
    block: {
      w: 0,
      h: 0,
      hw: 0,
      hh: 0,
      data: null,
    },
    selectedBlock: null,
    nextBlock: null,
    colors: [
      "#e04654", "#f1c421", "#5b81ea", "#52cc52", "#d844d8", "blueviolet", "chartreuse"
    ]
  };
  tetris.nextBlock = randomInt(tetris.blocks.length);

  function rotateArray(matrix) {
    let result = [];
    for(let i = 0; i < matrix[0].length; i++) {
        let row = matrix.map(e => e[i]).reverse();
        result.push(row);
    }
    return result;
  }

  function updateFrame() {
    for (var x=0; x<tetris.width; x++) {
      for (var y=0; y<tetris.height; y++) {
        if (tetris.data[y][x] == 1) tetris.data[y][x] = 0;
      }
    }
    for (var x=0; x<tetris.block.w; x++) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.block.data[y][x] == 1) tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x] = 1;
      }
    }
    draw();
  }

  document.addEventListener("keydown", function(e){
    console.log(e.key);
    var block = false;
    if (e.key == "ArrowLeft" && tetris.x-tetris.block.w+tetris.block.hw > 0) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.data[tetris.y-tetris.block.hh+y][tetris.x+tetris.block.hw-tetris.block.w-1] == 2) block = true;
      }
      if (!block) {
        tetris.x--;
        updateFrame();
      }
    }
    if (e.key == "ArrowRight" && tetris.x+tetris.block.hw < tetris.width) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.data[tetris.y-tetris.block.hh+y][tetris.x+tetris.block.hw] == 2) block = true;
      }
      if (!block) {
        tetris.x++;
        updateFrame();
      }
    }
    if (e.key == "ArrowUp") {
      var rotate = true;
      var block = rotateArray(tetris.block.data);
      var block_h = block.length, block_w = block[0].length;
      for (var y=0; y<block_h; y++) {
        for (var x=0; x <block_w; x++) {
          if (block[y][x] && (tetris.data[tetris.y-block_h+Math.floor(block_h/2)+y][tetris.x-block_w+Math.floor(block_w/2)+x] == 2 || tetris.data[tetris.y-block_h+Math.floor(block_h/2)+y][tetris.x-block_w+Math.floor(block_w/2)+x] == undefined)) rotate = false;
        }
      }
      if (rotate) {
        tetris.block.data = block;
        tetris.block.w = block_w, tetris.block.h = block_h, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
        updateFrame();
      }
    }
    if (e.key == "ArrowDown") {
      tetris.speed = tetris.originalSpeed / 10;
    }
  });
  document.addEventListener("keyup", function(e){
    if (e.key == "ArrowDown") {
      tetris.speed = tetris.originalSpeed;
    }
  });
  tetris.data = new Array(tetris.height);
  for (var i=0; i<tetris.height; i++) tetris.data[i] = new Array(tetris.width);
  for (var y=0; y<tetris.height; y++) {
    for (var x=0; x<tetris.width; x++) tetris.data[y][x] = 0;
  }

  function draw() {
    ctx.clearRect(0,0,w,h);
    var s = w / tetris.width;
    for (var x=0; x<tetris.width; x++) {
      for (var y=0; y<tetris.height; y++) {
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        if (tetris.data[y][x]) {
          ctx.strokeStyle = "white";
          if (tetris.data[y][x] == 1) {ctx.fillStyle = tetris.colors[tetris.selectedBlock]; ctx.fillRect(s*x,s*y,s,s);}
          else if (tetris.data[y][x] == 2) {
            ctx.fillStyle = "grey";
            //ctx.drawImage(bg, s*x*bgp_w, s*y*bgp_h, s*bgp_w, s*bgp_w, s*x, s*y, s, s);
            ctx.fillRect(s*x,s*y,s,s);
          }
          ctx.drawImage(texture, s*x, s*y, s, s);
        }
        ctx.strokeRect(s*x,s*y,s,s);
      }
    }
  }

  function initFigure() {
    tetris.speed = tetris.originalSpeed;
    tetris.selectedBlock = tetris.nextBlock;
    tetris.nextBlock = randomInt(tetris.blocks.length);
    tetris.block.data = tetris.blocks[tetris.selectedBlock].slice();
    tetris.block.w = tetris.block.data[0].length, tetris.block.h = tetris.block.data.length, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
    tetris.x = tetris.width / 2; tetris.y = tetris.block.hh;
    var nX = tetris.blocks[tetris.nextBlock][0].length, nY = tetris.blocks[tetris.nextBlock].length;
    preview.width = nX * 20; preview.height = nY * 20;
    prv.clearRect(0,0,preview.width,preview.height);
    prv.strokeStyle = "white"; prv.fillStyle = tetris.colors[tetris.nextBlock];
    for (var y=0; y<nY; y++) {
      for (var x=0; x<nX; x++) {
        if (tetris.blocks[tetris.nextBlock][y][x]) {
          prv.fillRect(x*20,y*20,20,20);
          prv.strokeRect(x*20,y*20,20,20);
        }
      }
    }
    id("score").innerText = "Ваш счёт: " + tetris.score;
    for (var y=0; y<tetris.height; y++) {
      var row = true;
      for (var x=0; x<tetris.width; x++) {
        if (tetris.data[y][x] == 1) tetris.data[y][x] = 2;
        if (!tetris.data[y][x]) row = false;
      }
      if (row) {
        tetris.score += 100;
        for (var i=0; i<tetris.width; i++) tetris.data[y][i] = 0;
        for (var Y=y-1; Y>0; Y--) {
          for (var X=0; X<tetris.width; X++) {
            if (tetris.data[Y][X] == 2) {
              tetris.data[Y][X] = 0; tetris.data[Y+1][X] = 2;
            }
          }
        }
      }
    }
    for (var x=0; x<tetris.block.w; x++) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.block.data[y][x] == 1) tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x] = 1;
      }
      if (tetris.data[tetris.y+tetris.block.hw][tetris.x-tetris.block.w+tetris.block.hw+x] == 2) {alert("Вы проиграли. Ваш счёт: " + (tetris.score-10)); location.reload(); return;}
    }
    draw();
    setTimeout(fall, tetris.speed);
  }

  function fall() {
    var block = false;
    if (tetris.y+tetris.block.h-tetris.block.hh<tetris.height) {
      for (var y=0; y<tetris.block.h; y++) {
        for (var x=0; x<tetris.block.w; x++) {
          if (tetris.data[tetris.y-tetris.block.hh+y+1][tetris.x-tetris.block.w+tetris.block.hw+x] == 2 && tetris.block.data[y][x]) block = true;
        }
      }
      if (!block) {
        for (var x=tetris.x-tetris.block.w+tetris.block.hw; x<tetris.x+tetris.block.w-tetris.block.hw; x++) {
          for (var y=tetris.y-tetris.block.hh; y<tetris.y+tetris.block.h-tetris.block.hh; y++) {
            if (tetris.data[y][x] == 1) tetris.data[y][x] = 0;
          }
        }
        tetris.y++;
        for (var x=0; x<tetris.block.w; x++) {
          for (var y=0; y<tetris.block.h; y++) {
            if (tetris.block.data[y][x] == 1) tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x] = 1;
          }
        }
        draw(); setTimeout(fall, tetris.speed);
         return;
      }
    }
    tetris.score += 10;
    draw();
    initFigure();
    //setTimeout(initFigure, tetris.speed);
  }

  const texture =  new Image();
  const bg = new Image();
  texture.src = "texture.png";
  bg.src = "bg.png";
  texture.onload = initFigure;
  bg.onload = function() {bgp_h = bg.height / h; bgp_w = bg.width / w;}

  //initFigure();
}
