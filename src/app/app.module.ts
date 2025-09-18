import {NgModule} from '@angular/core';
// import {CommonModule} from '@angular/common';
import {RouterLink, RouterModule, RouterOutlet} from '@angular/router';
import {HomeComponent} from './modules/landing/home/home.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from './shared/shared/shared.module';
import {LayoutModule} from './layout/layout.module';
import {routes} from './app.routes';
import {AssessmentComponent} from './modules/admin/assessment/assessment.component';
// import {AssignmentsComponent} from './modules/admin/assignments/assignments.component';
import {NgApexchartsModule} from "ng-apexcharts";
import {HttpClientModule} from "@angular/common/http";
import {AssignmentsComponent} from "./modules/admin/assignments/assignments.component";
import {CommonModule} from "@angular/common";
import { HeaderComponent } from './modules/components/header/header.component';


@NgModule({
  declarations: [
    // AssessmentComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {useHash: false}),
    SharedModule,
    LayoutModule,
    NgApexchartsModule,
    HttpClientModule
  ]
})
export class AppModule {
}
