import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastContainerComponent } from '../modules/shared/toast-container/toast-container.component';

@NgModule({
  declarations: [ToastContainerComponent],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
  ],
  exports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    ToastContainerComponent
  ]
})
export class SharedModule { }
