import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class GameoflifeService {

  constructor(private http: Http) { }

  getInitMap(){
    return new Promise((resolve, reject) => {
      this.http.get('/gameoflife/initClient')
        .map(res => res.json())
        .subscribe(res => {
          resolve(res);
        }, (err) => {
          reject(err);
        });
    });
  }
}
