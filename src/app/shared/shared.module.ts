import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastContainerComponent } from '../modules/shared/toast-container/toast-container.component';
import { ActionButtonComponent } from './components/action-button/action-button.component';

@NgModule({
  declarations: [ToastContainerComponent],
  imports: [
    CommonModule,
    NgbModule,
    NgbToastModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    ActionButtonComponent
  ],
  exports: [
    CommonModule,
    NgbModule,
    NgbToastModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    ActionButtonComponent,
    ToastContainerComponent
  ]
})
export class SharedModule { }
