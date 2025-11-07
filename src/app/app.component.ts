import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PingService } from "./services/ping.service";
import { SharedModule } from "./shared/shared/shared.module";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet, SharedModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Career Nava';

  constructor(
    private pingService: PingService
  ) {
  }

  ngOnInit(): void {
    this.pingService.pingServer();
  }
}

