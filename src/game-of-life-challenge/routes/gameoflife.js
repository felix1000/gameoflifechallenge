var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const gameloop = require('node-gameloop');
const mapwidth = 30;
const mapheight = 40;

var qt = [];
var currentpleyers = [];
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function initGame(){
  for (var i = 0; i < mapwidth; i++){
    var temp = [];
    for (var j = 0; j < mapheight; j++){
      temp.push({"x": i, "y": j, "value": false});
      // qt.put({"x": i, "y": j, "w": 0, "h": 0, "value": false});
    }
    qt.push(temp);
  }
}
function findNeighbours(x, y){
  var result = [];
  for (var i = x - 1; i <= x + 1; i++){
    if (i < 0 || i >= mapwidth){
      continue;
    }
    for (var j = y - 1; j <= y + 1; j++){
      if (j < 0 || j >= mapheight){
        continue;
      }
      if (i == x && j == y){
        continue;
      }
      // if (qt.get({"x": i, "y": j, "w": 0, "h": 0}).value){
      if (qt[i][j].value){
        result.push(qt[i][j]);
      }
    }
  }
  // console.log('countNeighbours(%s, %s) = %s', x, y, result);
  return result;
}
function countNeighbours(x, y){
  return findNeighbours(x, y).length;
}
function analysisTileColor(x,y){
  var neighbours = findNeighbours(x, y);
  var groupping = {};
  // console.log("FindColor[%s, %s]", x, y);
  for (var i = 0; i < neighbours.length; i++){
    // console.log("NeighbourColor[%s, %s]: %s", neighbours[i].x, neighbours[i].y, neighbours[i].color);
    if (neighbours[i].color === undefined){
      continue;
    }
    if (groupping[neighbours[i].color] === undefined){
      groupping[neighbours[i].color] = 1;
    }else{
      groupping[neighbours[i].color]++;
    }
  }
  var r = 0;
  var g = 0;
  var b = 0;
  Object.keys(groupping).forEach(function(key) {
    var strR = key.substr(1, 2);
    var strG = key.substr(3, 2);
    var strB = key.substr(5, 2);
    // console.log("Key[%s, %s, %s]", strR, strG, strB);
    r += parseInt(strR, 16) * groupping[key];
    g += parseInt(strG, 16) * groupping[key];
    b += parseInt(strB, 16) * groupping[key];
    // console.log("Sum[%s, %s, %s]", parseInt(strR, 16) * groupping[key], parseInt(strG, 16) * groupping[key], parseInt(strB, 16) * groupping[key]);
  });
  // console.log("Total[%s, %s, %s]", r, g, b);
  return "#" + pad((Math.round(r / neighbours.length)).toString(16), 2) + pad((Math.round(g / neighbours.length)).toString(16), 2) + pad((Math.round(b / neighbours.length)).toString(16), 2);
  // var max = 0;
  // var maxplayer = [];
  // Object.keys(groupping).forEach(function(key) {
  //   console.log("Sorting [%s]: %s", key, groupping[key]);
  //   var val = groupping[key];
  //   if (val > max){
  //     max = val;
  //     maxplayer = [];
  //     maxplayer.push(key);
  //   }else if (val == max){
  //     maxplayer.push(key);
  //   }
  // });
  // return maxplayer[Math.round(Math.random() * maxplayer.length - 1)];
}

initGame();
let frameCount = 0;
const id = gameloop.setGameLoop(function(delta){
  console.log('frame=%s, delta=%s', frameCount++, delta);
  console.time('game-loop');
  var tileToDie = [];
  var tileToBorn = [];
  for (var i = 0; i < mapwidth; i++){
    for (var j = 0; j < mapheight; j++){
      // var currentTile = qt.get({"x": i, "y": j, "w": 0, "h": 0});
      var currentTile = qt[i][j];
      // console.log(currentTile);
      var neighbours = findNeighbours(i, j).length;
      if (currentTile.value){
        if (neighbours < 2 || neighbours > 3){
          // console.log("qt[%s][%s].value = %s;", i, j, false);
          // qt.put({"x": i, "y": j, "w": 0, "h": 0, "value": false});
          tileToDie.push(currentTile);
        }
      }else{
        if (neighbours == 3){
          // console.log("qt[%s][%s].value = %s;", i, j, true);
          // qt.put({"x": i, "y": j, "w": 0, "h": 0, "value": true});
          tileToBorn.push(currentTile);
        }
      }
    }
  }
  for (var i = 0; i < tileToBorn.length; i++){
    qt[tileToBorn[i].x][tileToBorn[i].y].color = analysisTileColor(tileToBorn[i].x, tileToBorn[i].y);
  }
  for (var i = 0; i < tileToBorn.length; i++){
    qt[tileToBorn[i].x][tileToBorn[i].y].value = true;
  }
  for (var i = 0; i < tileToDie.length; i++){
    qt[tileToDie[i].x][tileToDie[i].y].value = false;
  }
  var strDie = "";
  for (var i = 0; i < tileToDie.length; i++){
    strDie += "[" + tileToDie[i].x + "," + tileToDie[i].y + ";" + tileToDie[i].color + "]";
  }
  var strBorn = "";
  for (var i = 0; i < tileToBorn.length; i++){
    strBorn += "[" + tileToBorn[i].x + "," + tileToBorn[i].y + ";" + tileToBorn[i].color + "]";
  }
  // console.log('io.emit("update-tile", {"tileToDie": %s, "tileToBorn": %s});', strDie, strBorn);
  io.emit('update-tile', {"tileToDie": tileToDie, "tileToBorn": tileToBorn});
  console.timeEnd('game-loop');
  // console.log('End there! (frame=%s, delta=%s)', frameCount++, delta);
}, 1000);

server.listen(4000);

// socket io
io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
  socket.on('push-life-tile', function (data) {
    // console.log(data);
    if (qt[data.x][data.y].value == false){
      qt[data.x][data.y].value = true;
      qt[data.x][data.y].color = data.color;
      io.emit('new-life-tile', {"x": data.x, "y": data.y, "color": data.color, "value": true});
    }
  });
});

router.get("/initClient", function(req, res, next){
  var isUniqueColor = true;
  do{
    var r = Math.round(Math.random() * 255);
    var g = Math.round(Math.random() * 255);
    var b = Math.round(Math.random() * 255);
    var color = pad(r.toString(16), 2) + pad(g.toString(16), 2) + pad(b.toString(16), 2);
    // console.log(color);
    for (var i = 0; i < currentpleyers.length; i++){
      // console.log("Loop Color: " + currentpleyers[i]);
      if (color == currentpleyers[i] || color == "ffffff"){
        isUniqueColor = false;
        break;
      }
    }
  }while (isUniqueColor == false);
  currentpleyers.push(color);
  res.json({"color": "#"+color, "golMap": qt, "width": mapwidth, "height": mapheight});
});
module.exports = router;
