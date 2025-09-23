import { Routes } from '@angular/router';
import { HomeLayoutComponent } from './layout/home-layout/home-layout.component';
import { HomeComponent } from './modules/landing/home/home.component';
import { SignInComponent } from './modules/auth/sign-in/sign-in.component';
import { AssessmentComponent } from './modules/admin/assessment/assessment.component';
import { LayoutComponent } from './layout/layout.component';
import { OverviewComponent } from './modules/admin/overview/overview.component';
import { ClassesComponent } from './modules/admin/classes/classes.component';
import { AssignmentsComponent } from './modules/admin/assignments/assignments.component';
import { ExamsComponent } from './modules/admin/exams/exams.component';
import { ProfileComponent } from './modules/admin/profile/profile.component';
import {TeacherLayoutComponent} from "./layout/teacher/teacher-layout/teacher-layout.component";
import {AdminLayoutComponent} from "./layout/admin/admin-layout/admin-layout.component";
import {StudentOverviewComponent} from "./modules/student/student-overview/student-overview.component";
import {TeacherOverviewComponent} from "./modules/teacher/teacher-overview/teacher-overview.component";
import {StudentsComponent} from "./modules/teacher/students/students.component";
import {StudentAssignmentComponent} from "./modules/student/student-assignment/student-assignment.component";
import { AboutComponent } from './modules/landing/about/about.component';
import { BlogComponent } from './modules/landing/blog/blog.component';
import { MentorsComponent } from './modules/student/mentors/mentors.component';
import { StudentSessionsComponent } from './modules/student/student-sessions/student-sessions.component';
import { MentorDetailsComponent } from './modules/student/mentors/mentor-details/mentor-details.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },

    {path: '', component: HomeLayoutComponent, children:
        [
            { path: 'home', component: HomeComponent },
            { path: 'about', component: AboutComponent },
            { path: 'blog', component: BlogComponent }
        ]
    },

  // Auth Dashboard
    {path: 'sign-in', component: SignInComponent},

  // Admin Dashboard 
    {path: 'admin', component: AdminLayoutComponent, children: [
        {path: 'assessment', component: AssessmentComponent},
        {path: 'overview', component: OverviewComponent},
        {path: 'classes', component: ClassesComponent},
        {path: 'assignments', component: AssignmentsComponent},
        {path: 'exams', component: ExamsComponent},
        {path: 'profile', component: ProfileComponent},
    ]},

  // Teacher Dashboard
  {path: 'teacher', component: TeacherLayoutComponent, children: [
      {path: 'overview', component: TeacherOverviewComponent},
      {path: 'students', component: StudentsComponent},
    ]
  },

  // Student Dashboard
  {path: 'student', component: LayoutComponent, children: [
      {path: 'overview', component: StudentOverviewComponent}, 
      {path: 'assignments', component: StudentAssignmentComponent},
      { path:'mentors', component: MentorsComponent },
      { path:'mentors/mentor-details/:id', component: MentorDetailsComponent },
      { path:'sessions', component: StudentSessionsComponent },
    ]
  },

//   { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];
