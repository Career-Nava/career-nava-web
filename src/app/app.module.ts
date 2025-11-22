import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgApexchartsModule } from "ng-apexcharts";
import { routes } from './app.routes';
import { LayoutModule } from './layout/layout.module';
import { AuthInterceptor } from "./services/auth/auth.interceptor";
import { SharedModule } from "./shared/shared/shared.module";


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { useHash: false }),
    SharedModule,
    LayoutModule,
    NgApexchartsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})
export class AppModule {
}
