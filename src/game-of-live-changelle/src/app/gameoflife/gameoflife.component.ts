import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, Inject } from '@angular/core';
import { GameoflifeService } from '../gameoflife.service';
import { DOCUMENT } from '@angular/platform-browser';
import * as io from "socket.io-client";

@Component({
  selector: 'app-gameoflife',
  templateUrl: './gameoflife.component.html',
  styleUrls: ['./gameoflife.component.css']
})
export class GameoflifeComponent implements OnInit {
  golMap: any;
  playerColor: any;
  joinned: boolean = false;
  newUser = { nickname: '', room: '' };
  msgData = { room: '', nickname: '', message: '' };
  socket: any;
  prredfinedpattern = [
    {"name": "Block", "w": 2, "h": 2, "pattern": [[true, true],[true, true]]}
    , {"name": "Blinker", "w": 3, "h": 1, "pattern": [[true, true, true]]}
    , {"name": "Glider", "w": 3, "h": 3, "pattern": [[false, true, false],[false, false, true],[true, true, true]]}
    , {"name": "Blinker", "w": 10, "h": 3, "pattern": [[false, false, true, false, false, false, false, true, false, false],[true, true, false, true, true, true, true, false, true, true],[false, false, true, false, false, false, false, true, false, false]]}
  ];
  draggedPattern = [];
  draggingData: any;
  calculatedTile = [];
  previousDragedTile = {"x": undefined, "y": undefined};
  mapWidth: number;
  mapHeight: number;
  hostname: string;

  constructor(private golService: GameoflifeService, @Inject(DOCUMENT) private document) {
    this.hostname = document.location.hostname;
    this.socket = io('http://' + this.hostname + ':4000');
  }

  ngOnInit() {
    var user = JSON.parse(localStorage.getItem("user"));
    this.golService.getInitMap().then((res) => {
      var data: any = res;
      this.golMap = data.golMap;
      this.playerColor = data.color;
      this.mapWidth = data.width;
      this.mapHeight = data.height;
    }, (err) => {
      console.log(err);
    });
    this.socket.on('new-life-tile', function (data) {
      this.golMap[data.x][data.y] = data;
    }.bind(this));
    this.socket.on('update-tile', function (data) {
      for (var i = 0; i < data.tileToDie.length; i++){
        this.golMap[data.tileToDie[i].x][data.tileToDie[i].y].value = false;
      }
      for (var i = 0; i < data.tileToBorn.length; i++){
        this.golMap[data.tileToBorn[i].x][data.tileToBorn[i].y].value = true;
        this.golMap[data.tileToBorn[i].x][data.tileToBorn[i].y].color = data.tileToBorn[i].color;
      }
    }.bind(this));
  }

  markLifeTile(x, y){
    // console.log('push-life-tile');
    this.socket.emit('push-life-tile', { "x": x, "y": y, "color": this.playerColor });
  }
  checkTileCanPlacePattern(x: number, y: number, data: any): boolean{
    let isvaliddrag: boolean = true;
    for (var i = 0; i < data.length; i++){
      for (var j = 0; j < data[i].length; j++){
        if (x + i >= this.golMap.length){
          isvaliddrag = false;
          break;
        }
        if (y + j >= this.golMap[x + i].length){
          isvaliddrag = false;
          break;
        }
        if (this.golMap[x + i][y + j].value && data[i][j]){
          isvaliddrag = false;
        }
      }
    }
    return isvaliddrag;
  }
  onDragStart(event, data: any) {
    // console.log("Start Drag");
    this.draggingData = data;
  }
  onDrop(event, data: any, x: number, y: number) {
    // console.log("On Drop");
    let dataTransfer = this.draggingData;
    var isvaliddrag = this.checkTileCanPlacePattern(x, y, this.draggingData);
    if (isvaliddrag){
      for (var i = 0; i < this.draggingData.length; i++){
        for (var j = 0; j < this.draggingData[i].length; j++){
          if (this.draggingData[i][j]){
            this.socket.emit('push-life-tile', { "x": x + i, "y": y + j, "color": this.playerColor });
          }
        }
      }
    }
    this.draggingData = undefined;
    for (var i = 0; i < this.calculatedTile.length; i++){
      this.golMap[this.calculatedTile[i].x][this.calculatedTile[i].y].isDropped = false;
      this.golMap[this.calculatedTile[i].x][this.calculatedTile[i].y].isDropAllowed = false;
    }
    this.calculatedTile = [];
    this.previousDragedTile = {"x": undefined, "y": undefined};
    // console.log("On Drop End");
    event.preventDefault();
  }
  allowDrop(event, x: number, y: number) {
    // console.log("allowDrop");
    event.preventDefault();
    if (this.previousDragedTile.x == x && this.previousDragedTile.y == y){
      return;
    }
    this.previousDragedTile.x = x;
    this.previousDragedTile.y = y;
    for (var i = 0; i < this.calculatedTile.length; i++){
      // console.log("Clear: %s, %s", this.calculatedTile[i].x, this.calculatedTile[i].y);
      this.golMap[this.calculatedTile[i].x][this.calculatedTile[i].y].isDropped = false;
      this.golMap[this.calculatedTile[i].x][this.calculatedTile[i].y].isDropAllowed = false;
    }
    this.calculatedTile = [];
    var isvaliddrag = this.checkTileCanPlacePattern(x, y, this.draggingData);
    for (var i = 0; i < this.draggingData.length; i++){
      for (var j = 0; j < this.draggingData[i].length; j++){
        // console.log("Clear: %s, %s", x + i, y + j);
        if (x + i >= this.golMap.length){
          continue;
        }
        if (y + j >= this.golMap[x + i].length){
          continue;
        }
        this.calculatedTile.push({"x": x + i, "y": y + j});
        this.golMap[x + i][y + j].isDropped = true;
        if (isvaliddrag){
          this.golMap[x + i][y + j].isDropAllowed = true;
        }
      }
    }
  }
  onDragLeave(event){
    for (var i = 0; i < this.calculatedTile.length; i++){
      this.golMap[this.calculatedTile[i].x][this.calculatedTile[i].y].isDropped = false;
      this.golMap[this.calculatedTile[i].x][this.calculatedTile[i].y].isDropAllowed = false;
    }
    this.calculatedTile = [];
    this.previousDragedTile = {"x": undefined, "y": undefined};
  }
  radomPattern(data){
    let x: number;
    let y: number;
    do{
      x = Math.round(Math.random() * (this.mapHeight - data.length));
      y = Math.round(Math.random() * (this.mapWidth - data[0].length));
    }while (this.checkTileCanPlacePattern(x, y, data) == false);
    for (var i = 0; i < data.length; i++){
      for (var j = 0; j < data[i].length; j++){
        if (data[i][j]){
          this.socket.emit('push-life-tile', { "x": x + i, "y": y + j, "color": this.playerColor });
        }
      }
    }
  }
  markAsDropSuccess(x, y){
    var result = false;
    if (this.golMap[x][y].isDropped){
      if (this.golMap[x][y].isDropAllowed){
        result = true;
      }
    }
    return result;
  }
  markAsDropFail(x, y){
    var result = false;
    if (this.golMap[x][y].isDropped){
      if (!this.golMap[x][y].isDropAllowed){
        result = true;
      }
    }
    return result;
  }
}
