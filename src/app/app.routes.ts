import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeLayoutComponent } from './layout/home/home-layout.component';
import { LayoutComponent } from './layout/layout.component';
import { AdminBlogsComponent } from './modules/admin/blogs/blogs.component';
import { AdminEventTypeDetailComponent } from './modules/admin/event-type-detail/event-type-detail.component';
import { AdminEventTypesComponent } from './modules/admin/event-types/event-types.component';
import { AdminMentorsComponent } from './modules/admin/mentors/mentors.component';
import { OverviewComponent } from './modules/admin/overview/overview.component';
import { AdminPaymentEventDetailComponent } from './modules/admin/payment-event-detail/payment-event-detail.component';
import { AdminPaymentEventsComponent } from './modules/admin/payment-events/payment-events.component';
import { AdminPaymentDetailComponent } from './modules/admin/payment-detail/payment-detail.component';
import { AdminPaymentsComponent } from './modules/admin/payments/payments.component';
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
import { AccountProfileComponent } from './modules/shared/account-profile/account-profile.component';
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
      { path: 'blog/:slug', component: BlogDetailsComponent }
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
      { path: 'profile', component: AccountProfileComponent },
      { path: 'scholarships/:id', component: ScholarshipDetailsComponent },
      { path: 'scholarships', component: ScholarshipsComponent },
      { path: 'scholarship-details/:id', component: ScholarshipDetailsComponent }
    ]
  },

  {
    path: 'admin', canActivate: [ authGuard ], data: { roles: [ 'admin' ], layoutRole: 'admin' }, component: LayoutComponent, children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'profile', component: AccountProfileComponent },
      { path: 'mentors', component: AdminMentorsComponent },
      { path: 'event-types', component: AdminEventTypesComponent },
      { path: 'event-types/:eventTypeId', component: AdminEventTypeDetailComponent },
      { path: 'sessions', component: AdminSessionsComponent },
      { path: 'payments', component: AdminPaymentsComponent },
      { path: 'payments/:paymentId', component: AdminPaymentDetailComponent },
      { path: 'payment-events', component: AdminPaymentEventsComponent },
      { path: 'payment-events/:paymentEventId', component: AdminPaymentEventDetailComponent },
      { path: 'scholarships', component: AdminScholarshipsComponent },
      { path: 'scholarships/preview/:id', component: ScholarshipDetailsComponent },
      { path: 'blogs', component: AdminBlogsComponent },
      { path: 'mentors/preview/:id', component: MentorDetailsComponent },
    ]
  },

  {
    path: 'mentor', canActivate: [ authGuard ], data: { roles: [ 'mentor' ], layoutRole: 'mentor' }, component: LayoutComponent, children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: MentorOverviewComponent },
      { path: 'profile/preview', component: MentorDetailsComponent },
      { path: 'profile', component: MentorProfileComponent },
      { path: 'account', component: AccountProfileComponent },
      { path: 'sessions', component: MentorSessionsComponent },
    ]
  },

  { path: '**', component: PageNotFoundComponent },
];
