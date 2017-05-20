import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';

import { GameoflifeService } from './gameoflife.service';
import { GameoflifeComponent } from './gameoflife/gameoflife.component';

@NgModule({
  declarations: [
    AppComponent,
    GameoflifeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [GameoflifeService, {"provide": Window, "useValue": window}],
  bootstrap: [AppComponent]
})
export class AppModule { }
