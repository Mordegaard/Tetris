var firebaseConfig = {
    apiKey: "AIzaSyAP32_lqMymoNq6o0GnuTfvCzfomwDvbac",
    authDomain: "mordegaard-blgspt.firebaseapp.com",
    databaseURL: "https://mordegaard-blgspt.firebaseio.com",
    projectId: "mordegaard-blgspt",
    storageBucket: "mordegaard-blgspt.appspot.com",
    messagingSenderId: "666333481438",
    appId: "1:666333481438:web:30fee7393125fa23c2354f",
    measurementId: "G-B56B297SCK"
  };
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var speed = 333;

window.onload = function() {
  document.body.focus();
  var canv = id("canvas"), preview = id("nextFigure"), ctch = id("catchFigure");
  var ctx = canv.getContext('2d'), prv = preview.getContext('2d'), cat = ctch.getContext('2d');
  var w = canv.width, h = canv.height;
  var bgp_w = null, bgp_h = null;
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
      "#e04654", "#f1c421", "#5b81ea", "#52cc52", "#d844d8", "blueviolet", "chartreuse"
    ],
    catch: {
      index: undefined,
      catched: false,
    },
    stats: {
      blocks: 0,
      rows: 0,
      score: 0,
    },
    mode: {
      hentai: false,
    }
  };
  tetris.nextBlock = randomInt(tetris.blocks.length);

  function quickSort(arr) {
    if (arr.length < 2) return arr;
    let min = 1;
    let max = arr.length - 1;
    let rand = Math.floor(min + Math.random() * (max + 1 - min));
    let pivot = arr[rand];
    const left = [];
    const right = [];
    arr.splice(arr.indexOf(pivot), 1);
    arr = [pivot].concat(arr);
    for (let i = 1; i < arr.length; i++) {
      if (pivot.score > arr[i].score) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
    return quickSort(left).concat(pivot, quickSort(right));
  }

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
    tetris.stats.blocks++;
    tetris.speed = tetris.originalSpeed;
    if (!ct) {
      tetris.block.index = tetris.nextBlock;
      tetris.nextBlock = randomInt(tetris.blocks.length);
    } else {
      var temp = tetris.block.index;
      tetris.block.index = tetris.catch.index;
      tetris.catch.index = temp;
    }
    tetris.block.data = tetris.blocks[tetris.block.index].slice();
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
          prv.drawImage(texture,x*20,y*20,20,20);
          prv.strokeRect(x*20,y*20,20,20);
        }
      }
    }
    for (var x=0; x<tetris.block.w; x++) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.block.data[y][x] == 1) tetris.data[tetris.y-tetris.block.hh+y][tetris.x-tetris.block.w+tetris.block.hw+x] = 1;
      }
      if (tetris.data[tetris.y+tetris.block.hw][tetris.x-tetris.block.w+tetris.block.hw+x] == 2) {
        endgame();
        return;
      }
    }
  }

  document.addEventListener("keydown", function(e){
    var block = false;
    //console.log(e.keyCode)
    if (!tetris.theEnd && (e.key == "ArrowLeft" || e.keyCode == 65) && tetris.x-tetris.block.w+tetris.block.hw > 0) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.block.data[y][0] && tetris.data[tetris.y-tetris.block.hh+y][tetris.x+tetris.block.hw-tetris.block.w-1] == 2) block = true;
      }
      if (!block) {
        tetris.x--;
        updateFrame();
      }
    }
    if (!tetris.theEnd && (e.key == "ArrowRight" || e.keyCode == 68) && tetris.x+tetris.block.hw < tetris.width) {
      for (var y=0; y<tetris.block.h; y++) {
        if (tetris.block.data[y][tetris.block.w-1] && tetris.data[tetris.y-tetris.block.hh+y][tetris.x+tetris.block.hw] == 2) block = true;
      }
      if (!block) {
        tetris.x++;
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
          if (block[y][x] && (tetris.data[Y][X] == 2 || tetris.data[Y][X] == undefined)) rotate = false;
        }
      }
      if (rotate) {
        tetris.block.data = block;
        tetris.block.w = block_w, tetris.block.h = block_h, tetris.block.hw = Math.floor(tetris.block.w/2), tetris.block.hh = Math.floor(tetris.block.h/2);
        updateFrame();
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
        console.log(tetris.data);
        draw();
      } else if (!tetris.catch.catched) {
        tetris.catch.catched = true;
        for (var x=0; x<tetris.width; x++) {
          for (var y=0; y<tetris.height; y++) {
            if (tetris.data[y][x] == 1) {tetris.data[y][x] = 0;}
          }
        }
        createBlock(true);
        draw();
      }
      var nX = tetris.blocks[tetris.catch.index][0].length, nY = tetris.blocks[tetris.catch.index].length;
      ctch.width = nX * 20; ctch.height = nY * 20;
      cat.clearRect(0,0,ctch.width,ctch.height);
      cat.strokeStyle = "white"; cat.fillStyle = tetris.colors[tetris.catch.index];
      for (var y=0; y<nY; y++) {
        for (var x=0; x<nX; x++) {
          if (tetris.blocks[tetris.catch.index][y][x]) {
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
    ctx.clearRect(0,0,w,h);
    var s = w / tetris.width;
    for (var x=0; x<tetris.width; x++) {
      for (var y=0; y<tetris.height; y++) {
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        if (tetris.data[y][x]) {
          ctx.strokeStyle = "white";
          if (tetris.data[y][x] == 1) {ctx.fillStyle = tetris.colors[tetris.block.index]; ctx.fillRect(s*x,s*y,s,s);}
          else if (tetris.data[y][x] == 2) {
            ctx.fillStyle = "grey";
            //ctx.drawImage(bg, s*x*bgp_w, s*y*bgp_h, s*bgp_w, s*bgp_w, s*x, s*y, s, s);
            ctx.fillRect(s*x,s*y,s,s);
          } else if (tetris.data[y][x] == 5) {
            ctx.fillStyle = "#ffffff48";
            ctx.fillRect(s*x,s*y,s,s);
          }
          ctx.drawImage(texture, s*x, s*y, s, s);
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
        if (tetris.data[y][x] == 1) tetris.data[y][x] = 2;
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
            if (tetris.data[Y][X] == 2) {
              tetris.data[Y][X] = 0; tetris.data[Y+1][X] = 2;
            }
          }
        }
      }
    }
    createBlock();
    if (rows > 1) tetris.stats.score += Math.floor(50 * (1+rows/2));
    id("score").innerText = "Ваш счёт: " + tetris.stats.score;
    draw();
    setTimeout(fall, tetris.speed);
    }
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
    tetris.stats.score += 10;
    draw();
    initFigure();
    //setTimeout(initFigure, tetris.speed);
  }

  function updateScore() {
    id("leaderboard").innerHTML = "";
    var index = 1;
    id("stats").innerText = `
    Всего фигур: ${tetris.stats.blocks}
    Сбито строк: ${tetris.stats.rows}
    `;
    database.ref('tetris').once('value', function(snapshot) {
      var data = snapshot.val();
      if (data != null) {
        var scores = [];
        snapshot.forEach(function(cSnapshot) {
          scores.push(cSnapshot.val());
          /*var d = cSnapshot.val();
          var block = document.createElement("div");
          block.classList.add("player", "flexed");
          block.innerHTML = `<span>${index++}. ${d.name}</span> <span>${d.score}</span>`;
          id("leaderboard").append(block);*/
        });
        scores = quickSort(scores);
        scores.forEach((d,ind)=>{
          var block = document.createElement("div");
          block.classList.add("player", "flexed");
          block.innerHTML = `<span>${scores.length-index++ + 1}. ${d.name}</span> <span>${d.score}</span>`;
          id("leaderboard").prepend(block);
        });
      }
    });
  }

  function endgame() {
    tetris.theEnd = true;
    id("overflow").changeVisible(true);
    id("overflowScore").innerText = tetris.stats.score;
    updateScore();
  }

  function newgame() {
    tetris.theEnd = false;
    id("overflow").changeVisible(false);
    id("addScore").changeVisible(true);
    id("form").changeVisible(false);
    tetris.originalSpeed = speed; tetris.speed = speed;
    tetris.stats.score = 0; tetris.stats.blocks = 0; tetris.stats.rows = 0;
    tetris.catch.index = undefined; tetris.catch.catch = false;
    tetris.data = new Array(tetris.height);
    for (var i=0; i<tetris.height; i++) tetris.data[i] = new Array(tetris.width);
    for (var y=0; y<tetris.height; y++) {
      for (var x=0; x<tetris.width; x++) tetris.data[y][x] = 0;
    }
    initFigure();
  }

  id("restart").onclick = newgame;
  id("addScore").addEventListener("click", function(){
    this.changeVisible(false);
    id("form").changeVisible(true);
  });
  id("form").addEventListener("submit", function(e){
    e.preventDefault();
    var score = tetris.stats.score;
    var nick = id("nick").value;
    if (nick) {
      firebase.auth().signInAnonymously()
      .then((user) => {
        var usr = user.user.uid;
        database.ref('tetris/'+usr).once('value', function(snapshot) {
            database.ref('tetris/'+usr).set({
              name: nick,
              score: score,
            });
          });
        }).then(updateScore);
    }
    return false;
  });

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
    ],
    count: 9,
    enabled: false,
  }
  sounds.files[0].src = "sounds/Its so fucking deep.mp3";
  sounds.files[1].src = "sounds/Headshot.mp3";
  sounds.files[2].src = "sounds/Spank.mp3";
  sounds.files[3].src = "sounds/Thats amazing.mp3";
  sounds.files[4].src = "sounds/hurt.mp3";
  sounds.files[5].src = "sounds/unstoppable.mp3";
  sounds.files[6].src = "sounds/hit.mp3";
  sounds.files[7].src = "sounds/Double kill.mp3";
  sounds.files[8].src = "sounds/WOO.mp3";

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
  const bg = new Image();
  texture.src = "images/texture.png";
  //bg.src = "bg.png";
  //bg.onload = function() {bgp_h = bg.height / h; bgp_w = bg.width / w;}
  texture.onload = newgame;
}
