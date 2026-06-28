import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeLayoutComponent } from './layout/home/home-layout.component';
import { LayoutComponent } from './layout/layout.component';
import { AdminBlogsComponent } from './modules/admin/blogs/blogs.component';
import { AdminMentorsComponent } from './modules/admin/mentors/mentors.component';
import { OverviewComponent } from './modules/admin/overview/overview.component';
import { AdminScholarshipsComponent } from './modules/admin/scholarships/scholarships.component';
import { AdminSessionsComponent } from './modules/admin/sessions/sessions.component';
import { AuthLayoutComponent } from './modules/auth/auth-layout/auth-layout.component';
import { SignInComponent } from './modules/auth/sign-in/sign-in.component';
import { SignUpComponent } from './modules/auth/sign-up/sign-up.component';
import { AboutComponent } from './modules/landing/about/about.component';
import { BlogDetailsComponent } from './modules/landing/blog/blog-details/blog-details.component';
import { BlogComponent } from './modules/landing/blog/blog.component';
import { HomeComponent } from './modules/landing/home/home.component';
import { MentorOverviewComponent } from './modules/mentor/mentor-overview/mentor-overview.component';
import { MentorProfileComponent } from './modules/mentor/mentor-profile/mentor-profile.component';
import { MentorSessionsComponent } from './modules/mentor/mentor-sessions/mentor-sessions.component';
import { PageNotFoundComponent } from './modules/page-not-found/page-not-found.component';
import { MentorDetailsComponent } from './modules/student/mentors/mentor-details/mentor-details.component';
import { MentorsComponent } from './modules/student/mentors/mentors.component';
import { ScholarshipDetailsComponent } from './modules/student/scholarships/scholarship-details/scholarship-details.component';
import { ScholarshipsComponent } from './modules/student/scholarships/scholarships.component';
import { StudentSessionsComponent } from './modules/student/student-sessions/student-sessions.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: '', component: HomeLayoutComponent, children: [
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'blog', component: BlogComponent },
      { path: 'blog/:slug', component: BlogDetailsComponent },
      { path: 'scholarships/:id', component: ScholarshipDetailsComponent }
    ]
  },

  {
    path: '', component: AuthLayoutComponent, children: [
      { path: 'sign-in', component: SignInComponent },
      { path: 'sign-up', component: SignUpComponent },
    ]
  },

  {
    path: 'mentee', canActivate: [ authGuard ], data: { roles: [ 'mentee' ], layoutRole: 'mentee' }, component: LayoutComponent, children: [
      { path: '', redirectTo: 'mentors', pathMatch: 'full' },
      { path: 'mentors', component: MentorsComponent },
      { path: 'mentors/mentor-details/:id', component: MentorDetailsComponent },
      { path: 'sessions', component: StudentSessionsComponent },
      { path: 'scholarships/:id', component: ScholarshipDetailsComponent },
      { path: 'scholarships', component: ScholarshipsComponent },
      { path: 'scholarship-details/:id', component: ScholarshipDetailsComponent }
    ]
  },

  {
    path: 'admin', canActivate: [ authGuard ], data: { roles: [ 'admin' ], layoutRole: 'admin' }, component: LayoutComponent, children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'mentors', component: AdminMentorsComponent },
      { path: 'sessions', component: AdminSessionsComponent },
      { path: 'scholarships', component: AdminScholarshipsComponent },
      { path: 'blogs', component: AdminBlogsComponent },
    ]
  },

  {
    path: 'mentor', canActivate: [ authGuard ], data: { roles: [ 'mentor' ], layoutRole: 'mentor' }, component: LayoutComponent, children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: MentorOverviewComponent },
      { path: 'profile', component: MentorProfileComponent },
      { path: 'sessions', component: MentorSessionsComponent },
    ]
  },

  { path: '**', component: PageNotFoundComponent },
];
