import { Component } from '@angular/core';
import {Student} from "../../../services/students/IStudent";
import {Subscription} from "rxjs";
import {StudentsService} from "../../../services/students/students.service";
import {SharedModule} from "../../../shared/shared.module";
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-students',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent {
  faPlus = faPlus;
  // faCalendar = Icons.faCalendar;
  // faClock = Icons.faClock;
  // faEnvelope = Icons.faEnvelope;
  // faFile = Icons.faFile;
  // // faArrowRight = Icons.faArrowRight;

  students: Student[] = []; // Plain array
  private subscriptions: Subscription = new Subscription();

  constructor(private studentsService: StudentsService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.subscriptions.add(this.studentsService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        console.log('Students:', this.students);
      },
      error: (err) => console.error('Failed to load students:', err)
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Clean up the subscription
  }

}
