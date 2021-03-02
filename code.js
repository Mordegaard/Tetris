window.onload = function() {
  var canv = id("canvas");
  var ctx = canv.getContext('2d');
  ctx.strokeStyle = "black";
  var w = canv.width, h = canv.height;
  const tetris = {
    width: 10,
    height: 20,
    x: 0,
    y: 0,
    data: null,
    speed: 333,
    originalSpeed: 333,
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
    colors: [
      "red", "orange", "blue", "green", "purple", "blueviolet", "chartreuse"
    ]
  };

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
      tetris.block.data = rotateArray(tetris.block.data);
      tetris.block.w = tetris.block.data[0].length, tetris.block.h = tetris.block.data.length, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
      updateFrame();
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

  function draw() {
    ctx.clearRect(0,0,w,h);
    var s = w / tetris.width;
    for (var x=0; x<tetris.width; x++) {
      for (var y=0; y<tetris.height; y++) {
        if (tetris.data[y][x] == 1) {ctx.fillStyle = tetris.colors[tetris.selectedBlock]; ctx.fillRect(s*x,s*y,s,s);}
        else if (tetris.data[y][x] == 2) {ctx.fillStyle = "grey"; ctx.fillRect(s*x,s*y,s,s);}
        ctx.strokeRect(s*x,s*y,s,s);
      }
    }
  }

  function initFigure() {
    for (var y=0; y<tetris.height; y++) {
      var row = true;
      for (var x=0; x<tetris.width; x++) {
        if (tetris.data[y][x] == 1) tetris.data[y][x] = 2;
        if (!tetris.data[y][x]) row = false;
      }
      if (row) {
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
    tetris.speed = tetris.originalSpeed;
    tetris.selectedBlock = randomInt(tetris.blocks.length);
    tetris.block.data = tetris.blocks[tetris.selectedBlock].slice();
    tetris.block.w = tetris.block.data[0].length, tetris.block.h = tetris.block.data.length, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
    tetris.x = tetris.width / 2; tetris.y = tetris.block.hh;
    for (var x=0; x<tetris.block.w; x++) {
      for (var y=0; y<tetris.block.h; y++) {
        console.log(tetris.y-tetris.block.hh+y)
        if (tetris.block.data[y][x] == 1) tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x] = 1;
      }
      if (tetris.data[tetris.y+tetris.block.hw][tetris.x-tetris.block.w+tetris.block.hw+x] == 2) {alert("YOU DIED"); location.reload();}
    }
    draw();
    setTimeout(fall, tetris.speed);
  }

  function fall() {
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
    var block = false;
    //console.log(tetris.y+tetris.block.hh, tetris.height);
    if (tetris.y+tetris.block.h-tetris.block.hh<tetris.height) {
      for (var y=0; y<tetris.block.h; y++) {
        for (var x=0; x<tetris.block.w; x++) {
          if (tetris.data[tetris.y-tetris.block.hh+y+1][tetris.x-tetris.block.w+tetris.block.hw+x] == 2 && tetris.block.data[y][x]) block = true;
        }
      }
      if (!block) {draw(); setTimeout(fall, tetris.speed); return;}
    }
    draw();
    setTimeout(initFigure, tetris.speed);
  }

  initFigure();
}
