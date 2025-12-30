import { Routes } from '@angular/router';
import { authGuard } from "./guards/auth.guard";
import { AdminLayoutComponent } from "./layout/admin/admin-layout/admin-layout.component";
import { HomeLayoutComponent } from './layout/home/home-layout.component';
import { LayoutComponent } from './layout/layout.component';
import { MentorLayoutComponent } from "./layout/mentor/mentor-layout/mentor-layout.component";
import { OverviewComponent } from './modules/admin/overview/overview.component';
import { AuthLayoutComponent } from './modules/auth/auth-layout/auth-layout.component';
import { SignInComponent } from "./modules/auth/sign-in/sign-in.component";
import { SignUpComponent } from './modules/auth/sign-up/sign-up.component';
import { AboutComponent } from './modules/landing/about/about.component';
import { BlogDetailsComponent } from './modules/landing/blog/blog-details/blog-details.component';
import { BlogComponent } from './modules/landing/blog/blog.component';
import { HomeComponent } from './modules/landing/home/home.component';
import { ScholarshipDetailsComponent } from './modules/scholarships/scholarship-details/scholarship-details.component';
import { ScholarshipsComponent } from './modules/scholarships/scholarships/scholarships.component';
import { MentorDetailsComponent } from './modules/student/mentors/mentor-details/mentor-details.component';
import { MentorsComponent } from './modules/student/mentors/mentors.component';
import { StudentSessionsComponent } from './modules/student/student-sessions/student-sessions.component';
import { CoachOverviewComponent } from "./modules/coaches/coach-overview/coach-overview.component";

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: '', component: HomeLayoutComponent, children:
      [
        { path: 'home', component: HomeComponent },
        { path: 'about', component: AboutComponent },
        { path: 'blog', component: BlogComponent },
        { path: 'blog/:slug', component: BlogDetailsComponent }
      ]
  },

  // Auth Dashboard
  {
    path: '', component: AuthLayoutComponent, children: [
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
    ]
  },

  // Mentee Dashboard
  {
    path: 'mentee', component: LayoutComponent, children: [
      { path: 'mentors', component: MentorsComponent },
      { path: 'mentors/mentor-details/:id', component: MentorDetailsComponent },
      { path: 'sessions', component: StudentSessionsComponent },
      { path: 'scholarships', component: ScholarshipsComponent },
      { path: 'scholarship-details/:id', component: ScholarshipDetailsComponent }
    ]
  },

  // Admin Dashboard
  {
    path: 'admin', canActivate: [ authGuard ], component: AdminLayoutComponent, children: [
      { path: 'overview', component: OverviewComponent },
    ]
  },

  // Teacher Dashboard
  {
    path: 'mentor', canActivate: [ authGuard ], component: MentorLayoutComponent, children: [
      { path: 'overview', component: CoachOverviewComponent },
    ]
  },


//   { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];
