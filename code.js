var speed = 333;
var timer;
var database, usr;
var blocks;
var endpoint = "https://mrdgrd.herokuapp.com";
//var endpoint = "http://localhost:1337";

const anime = {
  src: {
    fullSize: [],
    thumbnail: [],
  },
  loaded: false,
  progress: 1,
  opened: {
    fullSize: [],
    thumbnail: [],
  },
  db: false,
  last: null
};

function generateToken() {
  let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = ""
  for (let i=0; i<32; i++) {
    token += str[randomInt(str.length)];
  }
  return token;
}
function login() {
  usr = Cookies.get("userToken");
  if (!usr) usr = generateToken();
  Cookies.set("userToken", usr, 183);
}

function appendImage(src, src2) {
  var href = document.createElement('a');
  href.setAttribute("href", src); href.setAttribute("target", "_blank");
  href.style.background = `50% 50% / cover url("${src2}")`;
  href.innerHTML = `<img src="images/times.svg" class="remove-image-btn"/>`;
  id("images").append(href);
  href.tag("img")[0].addEventListener("click", function(e){
    e.preventDefault();
    fetch(`${endpoint}/tetris/user/${usr}/images`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({src: src})
    }).then(()=>{
        let i = anime.opened.fullSize.indexOf(src);
        anime.opened.fullSize.splice(i, 1);
        anime.opened.thumbnail.splice(i, 1);
        cl("images-container")[0].cl("title")[0].innerText = "Открытые изображения ["+anime.opened.fullSize.length+"]";
        id("images").children[i].remove();
    });
  });
}

function addImage(src) {
  let index = anime.src.fullSize.indexOf(src);
  let s = src.replace("https://rocky-retreat-60875.herokuapp.com/", ""),
      s2 = anime.src.thumbnail[index];
  let num = anime.opened.fullSize.length;
  anime.src.fullSize.splice(index, 1);
  anime.src.thumbnail.splice(index, 1);
  if(!anime.opened.fullSize.includes(src)) {
    appendImage(s, s2);
    anime.opened.fullSize.push(s); anime.opened.thumbnail.push(s2);
    cl("images-container")[0].cl("title")[0].innerText = "Открытые изображения ["+anime.opened.fullSize.length+"]";
    let obj = {
      src1: s,
      src2: s2,
      num: num,
    };
    fetch(`${endpoint}/tetris/user/${usr}/images`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    });
  }
}

function UpdCol() {
  while (anime.src.fullSize != false) addImage(anime.src.fullSize[0]);
};

window.onload = function() {
  document.body.focus();
  var canv = id("canvas"), preview = id("nextFigure"), ctch = id("catchFigure"), animCanvas = id("animeCanvas");
  var ctx = canv.getContext('2d', {antialias: false, alpha: false}),
      prv = preview.getContext('2d', {antialias: false, alpha: false}),
      cat = ctch.getContext('2d', {antialias: false, alpha: false}),
      animCtx = animCanvas.getContext('2d', {antialias: false, alpha: false});
  var w = canv.width, h = canv.height;
  var bgW = null, bgH = null;
  var progress = id("progressBar").children;
  const tetris = {
    width: 10,
    height: 20,
    x: 0,
    y: 0,
    data: null,
    speed: speed,
    originalSpeed: speed,
    theEnd: false,
    blocks: [
      [[1,1,0],[0,1,1]],
      [[0,1,1],[1,1,0]],
      [[1,1],[1,1]],
      [[0,1,0],[1,1,1]],
      [[1],[1],[1],[1]],
      [[1,0],[1,0],[1,1]],
      [[0,1],[0,1],[1,1]],
    ],
    nightmareBlocks: [
      [[1,1,0],[0,1,0],[0,1,1]],
      [[0,1,1],[0,1,0],[1,1,0]],
      [[1,1],[0,1],[1,1]],
      [[1]],
      [[0,1,0,0],[1,1,1,1],[0,0,1,0]],
      [[0,0,1,0],[1,1,1,1],[0,1,0,0]],
      [[0,1,0],[1,1,1],[0,1,0]],
    ],
    block: {
      w: 0,
      h: 0,
      hw: 0,
      hh: 0,
      data: null,
      index: null,
    },
    nextBlock: null,
    colors: [
      "#e04654", "#f1c421", "#5b81ea", "#52cc52", "#d844d8", "blueviolet", "#e87944",
      "darkred", "green", "#2ac0a5", "#483ca8", "#9183ca", "#bb2880", "#e24819"
    ],
    catch: {
      index: undefined,
      catched: false,
    },
    stats: {
      blocks: 0,
      rows: 0,
      score: 0,
      time: 0,
    },
    mode: 0,
  };
  tetris.nightmareBlocks = [...tetris.blocks, ...tetris.nightmareBlocks];

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

  function createBlock(ct = false) {
    tetris.speed = tetris.originalSpeed;
    if (!ct) {
      tetris.block.index = tetris.nextBlock;
      tetris.nextBlock = randomInt(blocks.length);
    } else {
      var temp = tetris.block.index;
      tetris.block.index = tetris.catch.index;
      tetris.catch.index = temp;
    }
    tetris.block.data = blocks[tetris.block.index].slice();
    tetris.block.w = tetris.block.data[0].length, tetris.block.h = tetris.block.data.length, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
    tetris.x = tetris.width / 2; tetris.y = tetris.block.hh;
    var nX = blocks[tetris.nextBlock][0].length, nY = blocks[tetris.nextBlock].length;
    preview.width = nX * 20; preview.height = nY * 20;
    prv.fillStyle = "#282828";
    prv.fillRect(0,0,preview.width,preview.height);
    prv.strokeStyle = "white"; prv.fillStyle = tetris.colors[tetris.nextBlock];
    for (var y=0; y<nY; y++) {
      for (var x=0; x<nX; x++) {
        if (blocks[tetris.nextBlock][y][x]) {
          prv.fillRect(x*20,y*20,20,20);
          prv.drawImage(texture,x*20,y*20,20,20);
          prv.strokeRect(x*20,y*20,20,20);
        }
      }
    }
    for (var x=0; x<tetris.block.w; x++) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.block.data[y][x] == 1) {
          if (tetris.data[tetris.y+tetris.block.hw][tetris.x-tetris.block.w+tetris.block.hw+x] > 1) {
            endgame();
            return;
          }
          tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x] = 1;

        }
      }
    }
  }

  document.addEventListener("keydown", function(e){
    var block = false;
    //console.log(e.keyCode)
    if (!tetris.theEnd && (e.key == "ArrowLeft" || e.keyCode == 65) && tetris.x-tetris.block.w+tetris.block.hw > 0) {
      for (var y=0; y<tetris.block.h; y++) {
        for (var x=0; x<=tetris.block.w; x++) {
          if (tetris.block.data[y][x] && tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x-1] > 1) block = true;
        }
      }
      if (!block) {
        tetris.x--;
        getFinalPosition();
        updateFrame();
      }
    }
    if (!tetris.theEnd && (e.key == "ArrowRight" || e.keyCode == 68) && tetris.x+tetris.block.hw < tetris.width) {
      for (var y=0; y<tetris.block.h; y++) {
        for (var x=0; x<=tetris.block.w; x++) {
          if (tetris.block.data[y][x] && tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x+1] > 1) block = true;
        }
      }
      if (!block) {
        tetris.x++;
        getFinalPosition();
        updateFrame();
      }
    }
    if (e.key == "ArrowUp" || e.keyCode == 87 && !tetris.theEnd) {
      var rotate = true;
      var block = rotateArray(tetris.block.data);
      var block_h = block.length, block_w = block[0].length;
      for (var y=0; y<block_h; y++) {
        for (var x=0; x <block_w; x++) {
          var X = tetris.x-block_w+Math.floor(block_w/2)+x, Y = tetris.y-Math.floor(block_h/2)+y;
          if (block[y][x] && (tetris.data[Y][X] > 1 || tetris.data[Y][X] == undefined)) {rotate = false;}
        }
      }
      if (rotate) {
        tetris.block.data = block;
        tetris.block.w = block_w, tetris.block.h = block_h, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
        getFinalPosition();
        updateFrame();
      } else {
        rotate = true;
        for (var y=0; y<block_h; y++) {
          for (var x=0; x <block_w; x++) {
            var X = tetris.x-block_w+Math.floor(block_w/2)+x+1, Y = tetris.y-Math.floor(block_h/2)+y;
            if (block[y][x] && (tetris.data[Y][X] > 1 || tetris.data[Y][X] == undefined)) {rotate = false;}
          }
        }
        if (rotate) {
          tetris.block.data = block;
          tetris.x++;
          tetris.block.w = block_w, tetris.block.h = block_h, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
          getFinalPosition();
          updateFrame();
        }
      }
    }
    if (e.key == "ArrowDown" || e.keyCode == 83) {
      tetris.speed = tetris.originalSpeed / 10;
    }
    if (e.keyCode == 32 && !tetris.theEnd) {
      if (tetris.catch.index == undefined) {
        tetris.catch.catched = true;
        tetris.catch.index = tetris.block.index;
        for (var x=0; x<tetris.width; x++) {
          for (var y=0; y<tetris.height; y++) {
            if (tetris.data[y][x] == 1) {tetris.data[y][x] = 0;}
          }
        }
        createBlock();
        getFinalPosition();
        draw();
      } else if (!tetris.catch.catched) {
        tetris.catch.catched = true;
        for (var x=0; x<tetris.width; x++) {
          for (var y=0; y<tetris.height; y++) {
            if (tetris.data[y][x] == 1) {tetris.data[y][x] = 0;}
          }
        }
        createBlock(true);
        getFinalPosition();
        draw();
      }
      var nX = blocks[tetris.catch.index][0].length, nY = blocks[tetris.catch.index].length;
      ctch.width = nX * 20; ctch.height = nY * 20;
      cat.fillStyle = "#282828";
      cat.fillRect(0,0,ctch.width,ctch.height);
      cat.strokeStyle = "white"; cat.fillStyle = tetris.colors[tetris.catch.index];
      for (var y=0; y<nY; y++) {
        for (var x=0; x<nX; x++) {
          if (blocks[tetris.catch.index][y][x]) {
            cat.fillRect(x*20,y*20,20,20);
            cat.drawImage(texture,x*20,y*20,20,20);
            cat.strokeRect(x*20,y*20,20,20);
          }
        }
      }
    }
  });
  document.addEventListener("keyup", function(e){
    if (e.key == "ArrowDown" || e.keyCode == 83) {
      tetris.speed = tetris.originalSpeed;
    }
  });

  function draw() {
    ctx.fillStyle = "#282828";
    ctx.fillRect(0,0,w,h);
    var s = w / tetris.width;
    for (var x=0; x<tetris.width; x++) {
      for (var y=0; y<tetris.height; y++) {
        ctx.strokeStyle = "#3d3d3d";
        if (tetris.data[y][x] > 0) {
          ctx.strokeStyle = "white";
          if (tetris.data[y][x] == 1) {ctx.fillStyle = tetris.colors[tetris.block.index]; ctx.fillRect(s*x,s*y,s,s);}
          else if (tetris.data[y][x] > 1) {
            if (tetris.mode == 1) ctx.drawImage(bg, bgW*s*x,bgH*s*y,bgW*s,bgH*s, s*x,s*y,s,s);
            else {
              ctx.fillStyle = tetris.colors[tetris.data[y][x]-2];
              ctx.fillRect(s*x,s*y,s,s);
            }
          }
          ctx.drawImage(texture, s*x, s*y, s, s);
        } else if (tetris.data[y][x] < 0) {
          ctx.drawImage(texture2, s*x, s*y, s, s);
        }
        ctx.strokeRect(s*x,s*y,s,s);
      }
    }
  }

  function initFigure() {
    if (!tetris.theEnd) {
    tetris.catch.catched = false;
    var sound = true;
    var rows = 0;
    for (var y=0; y<tetris.height; y++) {
      var row = true;
      for (var x=0; x<tetris.width; x++) {
        if (tetris.data[y][x] == 1) tetris.data[y][x] = 2 + tetris.block.index;
        if (!tetris.data[y][x]) row = false;
      }
      if (row) {
        if (sound && sounds.enabled) {
          sound = false;
          sounds.files[randomInt(sounds.count)].play();
        }
        tetris.stats.rows++;
        rows++;
        tetris.originalSpeed -= 2;
        tetris.stats.score += 50;
        for (var i=0; i<tetris.width; i++) tetris.data[y][i] = 0;
        for (var Y=y-1; Y>0; Y--) {
          for (var X=0; X<tetris.width; X++) {
            if (tetris.data[Y][X] > 1) {
              tetris.data[Y+1][X] = tetris.data[Y][X]; tetris.data[Y][X] = 0;
            }
          }
        }
      }
    }
    if (tetris.stats.blocks) tetris.stats.score += 10;
    createBlock();
    getFinalPosition();
    if (tetris.theEnd) return;
    tetris.stats.blocks++;
    if (rows > 1) tetris.stats.score += Math.floor(50 * (1+rows/2));
    if (tetris.stats.score > anime.progress*1000) {
      anime.progress++;
      for (var i=0; i<anime.progress-1; i++) {
        if (i > progress.length-1) break;
        progress[i].changeVisible(true);
      }
      if (tetris.stats.score < 5000) {
        var step = (50 - Math.floor(tetris.stats.score / 100));
        blur(step);
      } else {
        animCtx.drawImage(bg, 0, 0, animCanvas.width, animCanvas.height);
        animCanvas.changeVisible(true);
      }
    }
    id("score").innerText = "Ваш счёт: " + tetris.stats.score;
    draw();
    setTimeout(fall, tetris.speed);
    }
  }

  function getFinalPosition() {
    for (var y=0; y<tetris.height; y++) {
      for (var x=0; x<tetris.width; x++) {
        if (tetris.data[y][x] == -1) tetris.data[y][x] = 0;
      }
    }
    loop1: for (var Y=tetris.y; Y<tetris.height-tetris.block.h+tetris.block.hh; Y++) {
      for (var y=0; y<tetris.block.h; y++) {
        for (var x=0; x<tetris.block.w; x++) {
          if (tetris.data[Y-tetris.block.hh+y+1][tetris.x-tetris.block.w+tetris.block.hw+x] > 1 && tetris.block.data[y][x]) {break loop1;}
        }
      }
    }
    for (var x=0; x<tetris.block.w; x++) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.block.data[y][x] == 1) tetris.data[Y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x] = -1;
      }
    }
  }

  function fall() {
    var block = false;
    if (tetris.y+tetris.block.h-tetris.block.hh<tetris.height) {
      for (var y=0; y<tetris.block.h; y++) {
        for (var x=0; x<tetris.block.w; x++) {
          if (tetris.data[tetris.y-tetris.block.hh+y+1][tetris.x-tetris.block.w+tetris.block.hw+x] > 1 && tetris.block.data[y][x]) block = true;
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
    draw();
    initFigure();
    //setTimeout(initFigure, tetris.speed);
  }

  function updateScore() {
      fetch(`${endpoint}/tetris/leaderboard/${usr}`)
      .then(res=>{return res.json()})
      .then(obj=>{
        id("leaderboard").innerHTML = "";
        id("nightmareLeaderboard").innerHTML = "";

        const scores = obj
          .filter(user => user.score && user.name)
          .sort((a, b) => a.score - b.score);

        const nightmareScores = obj
          .filter(user => user.nightmareScore && user.name)
          .sort((a, b) => a.nightmareScore - b.nightmareScore);

        scores.forEach((user, ind) => {
          const block = document.createElement("div");
          block.classList.add("player", "flexed");
          if (user.you) {
            id("nick").value = user.name;
            block.classList.add("your");
          }
          block.innerHTML = `<span>${scores.length-ind}. ${user.name}</span> <span>${user.score}</span>`;
          id("leaderboard").prepend(block);
        });

        nightmareScores.forEach((user, ind) => {
          var block = document.createElement("div");
          block.classList.add("player", "flexed");
          if (user.you) {
            id("nick").value = user.name;
            block.classList.add("your");
          }
          block.innerHTML = `<span>${nightmareScores.length-ind}. ${user.name}</span> <span>${user.nightmareScore}</span>`;
          id("nightmareLeaderboard").prepend(block);
        });

        setTimeout(()=>[].forEach.call(id("leaderboard").children, (el,ind)=>{
          el.changeCSS({
            'transition-delay': `${ind/20}s`,
            'transform': 'none',
            'opacity': '1',
          });
        }), 10);
      });
    }

  function getPhotos() {
    fetch(`${endpoint}/tetris/user/${usr}`).then(res=>{
      if (!res.ok) return null;
      return res.json();
    }).then(obj=>{
      if (!anime.db && obj !== null) {
        const { images } = obj;
        Object.keys(images).forEach(key => {
          anime.opened.fullSize.push(images[key][0]);
          anime.opened.thumbnail.push(images[key][1]);
        });

        cl("images-container")[0].cl("title")[0].innerText = "Открытые изображения ["+anime.opened.fullSize.length+"]";
        for (let i=0; i<anime.opened.fullSize.length; i++) appendImage(anime.opened.fullSize[i], anime.opened.thumbnail[i]);
      } else id("images").innerText = "Что-то пошло не так";
      anime.db = true;
    });
  }

  function endgame() {
    document.body.style.setProperty("--col", tetris.colors[randomInt(tetris.colors.length)]);
    clearInterval(timer);
    console.log("seconds FROM start: " + tetris.stats.time);
    var m = Math.floor(tetris.stats.time / 60);
    if (m < 10) m = '0'+m;
    var s = tetris.stats.time % 60;
    if (s < 10) s = '0'+s;
    id("stats").innerText = `
    Всего фигур: ${tetris.stats.blocks}
    Сбито строк: ${tetris.stats.rows}
    Время игры: ${m}:${s}
    `;
    tetris.theEnd = true;
    id("overflow").changeVisible(true);
    if (tetris.mode != 2) id("overflowScore").innerText = tetris.stats.score;
    else id("overflowScore").innerText = "Кошмар: " + tetris.stats.score;
    if (tetris.stats.score >= 5000 && tetris.mode == 1) {
      var src = bg.src.replace("https://rocky-retreat-60875.herokuapp.com/", "");
      id("imageContainer").changeVisible(true);
      id("image").src = src;
      addImage(src);
      setTimeout(()=>{id("imageContainer").changeVisible(false)}, 3000);
    }
    updateScore();
  }

  function newgame() {
    if (tetris.mode != 2) {
      blocks = tetris.blocks;
    } else {
      blocks = tetris.nightmareBlocks;
    }
    tetris.nextBlock = randomInt(blocks.length);
    tetris.theEnd = false;
    tetris.stats.time = 0;
    timer = setInterval(()=>{
      tetris.stats.time++;
    }, 1000);
    animCtx.fillStyle = "#282828";
    animCtx.fillRect(0,0,animCanvas.width, animCanvas.height);
    id("restart").innerText = "Заново";
    id("overflow").changeVisible(false);
    id("addScore").changeVisible(true);
    id("form").changeVisible(false);
    animCanvas.changeVisible(false);
    if (tetris.mode == 1) cl("anime-canvas-container")[0].changeVisible(true);
    else cl("anime-canvas-container")[0].changeVisible(false);
    anime.progress = 1;
    [].forEach.call(progress, el => {el.changeVisible(false)});
    tetris.originalSpeed = speed; tetris.speed = speed;
    tetris.stats.score = 0; tetris.stats.blocks = 0; tetris.stats.rows = 0;
    tetris.catch.index = undefined; tetris.catch.catch = false;
    tetris.data = new Array(tetris.height);
    cat.fillStyle = "#282828";
    cat.fillRect(0, 0, ctch.width, ctch.height);
    for (var i=0; i<tetris.height; i++) tetris.data[i] = new Array(tetris.width);
    for (var y=0; y<tetris.height; y++) {
      for (var x=0; x<tetris.width; x++) tetris.data[y][x] = 0;
    }
    initFigure();
  }

  function median(values){
    if(values.length ===0) return 0;
    values.sort(function(a,b){
      return a-b;
    });
    var half = Math.floor(values.length / 2);
    if (values.length % 2) return values[half];
    return (values[half - 1] + values[half]) / 2.0;
  }

  function blur(width) {
    animCtx.drawImage(bg,0,0,animCanvas.width,animCanvas.height);
    var data = animCtx.getImageData(0, 0, animCanvas.width, animCanvas.height);
    var d = data.data;
    for (var i=0; i<animCanvas.height; i+=width) {
      for (var j=0; j<animCanvas.width; j+=width) {
        var ar = [], ag = [], ab = [];
        for (var y=i; y<i+width; y++) {
          if (y > animCanvas.height) break;
          for (var x=j; x<j+width; x++) {
            if (x > animCanvas.width) break;
            ar.push(d[4*(animCanvas.width*y+x)+0]);
            ag.push(d[4*(animCanvas.width*y+x)+1]);
            ab.push(d[4*(animCanvas.width*y+x)+2]);
          }
        }
        var r = median(ar), g = median(ag), b = median(ab);
        for (var y=i; y<i+width; y++) {
          if (y > animCanvas.height) break;
          for (var x=j; x<j+width; x++) {
            if (x >= animCanvas.width) break;
            d[4*(animCanvas.width*y+x)+0] = r;
            d[4*(animCanvas.width*y+x)+1] = g;
            d[4*(animCanvas.width*y+x)+2] = b;
          }
        }
      }
    }
    animCtx.putImageData(data, 0, 0);
  }

  const bg = new Image();
  bg.crossOrigin = "Anonymous";
  bg.onerror = function() {
    console.clear();
    if (bg.src.includes("herokuapp")) return;
    else {bg.src = "https://rocky-retreat-60875.herokuapp.com/"+bg.src;}
  }
  bg.onload = function() {
    newgame();
    bgW = bg.width / w; bgH = bg.height / h;
    if(bg.width > bg.height) {
      animCanvas.width = 400;
      animCanvas.height = bg.height / bg.width * 400;
    } else {
      animCanvas.height = 400;
      animCanvas.width = bg.width / bg.height * 400;
    }
    animCtx.drawImage(bg,0,0,animCanvas.width,animCanvas.height);
    blur(50);
  };

  id("restart").onclick = function() {
    if (tetris.mode == 1) {
      this.innerText = "Загружаю изображения";
      if (!anime.loaded || !anime.src.fullSize.length) {
        console.log("loading images");
        let url = "https://www.reddit.com/r/hentai.json?limit=7";
        if (anime.last) url += "&after="+anime.last;
        fetch(url).then(res=>{return res.json()}).then(json=>{
            Object.keys(json.data.children).forEach((el, ind, arr) => {
              num = arr.length;
              var obj = json.data.children[el];
              if (obj.data.preview && obj.data.preview.enabled) {
                let src1 = obj.data.preview.images[0].source.url.replace('amp;', ''),
                    src2 = obj.data.preview.images[0].resolutions['0'].url.replaceAll('amp;', '');
                anime.src.fullSize.push(src1);
                anime.src.thumbnail.push(src2);
                anime.last = obj.data.name;
              }
            });
            bg.src = anime.src.fullSize[randomInt(anime.src.fullSize.length)];
            anime.loaded = true;
        }).catch(e=>{
          this.innerText = "Заново";
          console.warn("Some errors have appeared while loading images", e);
        });
      } else {
        bg.src = anime.src.fullSize[randomInt(anime.src.fullSize.length)];
      }
    } else newgame();
  };

  function submitScore(e) {
    e.preventDefault();
    let today = new Date().getTime();
    let nick = id("nick").value;
    if (nick) {
      let obj = {
        name: nick,
        [tetris.mode === 2 ? 'nightmareScore' : 'score']: tetris.stats.score,
        date: today,
        lastStats: {
          blocks: tetris.stats.blocks,
          rows: tetris.stats.rows,
          time: tetris.stats.time,
        }
      }
      fetch(`${endpoint}/tetris/user/${usr}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      }).then(updateScore);
    }
    return false;
  };

  [].forEach.call(name("gamemode"), (item,i) => {
    item.addEventListener("click", function() {
      tetris.mode = i;
    });
  });
  [].forEach.call(name("leaderboard"), (item,i) => {
    item.addEventListener("click", function() {
      [].forEach.call(cl("leaderboard"), (el,ind) => {el.changeVisible(false)});
      cl("leaderboard")[i].changeVisible(true);
    });
  });

  id("addScore").addEventListener("click", function(){
    this.changeVisible(false);
    id("form").changeVisible(true);
  });
  id("leaderboardFolder").addEventListener("click", function(){
    cl("leaderboard-container")[0].changeVisible(true);
    cl("images-container")[0].changeVisible(false);

    id("leaderboardFolder").changeVisible(true);
    id("imagesFolder").changeVisible(false);
  });
  id("imagesFolder").addEventListener("click", function(){
    cl("leaderboard-container")[0].changeVisible(false);
    cl("images-container")[0].changeVisible(true);

    id("leaderboardFolder").changeVisible(false);
    id("imagesFolder").changeVisible(true);
  });
  id("form").addEventListener("submit", submitScore);
  id("sendResult").addEventListener("click", submitScore);

  const sounds = {
    files: [
      new Audio(),
      new Audio(),
      new Audio(),
      new Audio(),
      new Audio(),
      new Audio(),
      new Audio(),
      new Audio(),
      new Audio(),
      new Audio(),
    ],
    count: 10,
    enabled: false,
  }
  sounds.files[0].src = "sounds/Its so fucking deep.mp3";
  sounds.files[1].src = "sounds/Headshot.mp3";
  sounds.files[2].src = "sounds/Spank.mp3";
  sounds.files[3].src = "sounds/Thats amazing.mp3";
  sounds.files[4].src = "sounds/hurt.mp3";
  sounds.files[5].src = "sounds/unstoppable.mp3";
  sounds.files[6].src = "sounds/hit.mp3";
  sounds.files[7].src = "sounds/tanks.m4a";
  sounds.files[8].src = "sounds/slidan.m4a";
  sounds.files[9].src = "sounds/WOO.mp3";

  id("sound").addEventListener("click", function(){
    if (sounds.enabled) {
      sounds.enabled = false;
      this.changeVisible(false);
    } else {
      sounds.enabled = true;
      this.changeVisible(true);
    }
  });

  const texture =  new Image();
  const texture2 = new Image();
  texture.src = "images/texture.png";
  texture2.src = "images/texture2.png";

  login();
  endgame();
  getPhotos();
}
