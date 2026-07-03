import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCertificate,
  faChartLine,
  faCreditCard,
  faFile,
  faHouse,
  faLaptop,
  faReceipt,
  faUser,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

export type AuthRole = 'admin' | 'mentor' | 'mentee';

export interface SidebarNavItem {
  label: string;
  route: string;
  icon: IconDefinition;
  exact?: boolean;
  activePrefixes?: string[];
}

export type SidebarThemeClass = 'sidebar--admin' | 'sidebar--mentor' | 'sidebar--mentee';

export interface SidebarRoleConfig {
  role: AuthRole;
  title: string;
  homeRoute: string;
  themeClass: SidebarThemeClass;
  logoSrc: string;
  logoAlt: string;
  items: SidebarNavItem[];
}

export const AUTH_SIDEBAR_CONFIG: Record<AuthRole, SidebarRoleConfig> = {
  admin: {
    role: 'admin',
    title: 'Admin Dashboard',
    homeRoute: '/admin/overview',
    themeClass: 'sidebar--admin',
    logoSrc: 'assets/images/logo/logo.png',
    logoAlt: 'Career Nava admin logo',
    items: [
      { label: 'Overview', icon: faHouse, route: '/admin/overview', exact: true },
      { label: 'Mentors', icon: faUser, route: '/admin/mentors' },
      { label: 'Sessions', icon: faChartLine, route: '/admin/sessions' },
      { label: 'Payments', icon: faCreditCard, route: '/admin/payments', activePrefixes: [ '/admin/payments' ] },
      { label: 'Payment Events', icon: faReceipt, route: '/admin/payment-events', activePrefixes: [ '/admin/payment-events' ] },
      { label: 'Scholarships', icon: faFile, route: '/admin/scholarships' },
      { label: 'Blogs / Resources', icon: faFile, route: '/admin/blogs' }
    ]
  },
  mentor: {
    role: 'mentor',
    title: 'Mentor Dashboard',
    homeRoute: '/mentor/overview',
    themeClass: 'sidebar--mentor',
    logoSrc: 'assets/images/logo/logo-variant.png',
    logoAlt: 'Career Nava mentor logo',
    items: [
      { label: 'Overview', icon: faHouse, route: '/mentor/overview', exact: true },
      { label: 'Profile', icon: faUser, route: '/mentor/profile' },
      { label: 'Sessions', icon: faFile, route: '/mentor/sessions' }
    ]
  },
  mentee: {
    role: 'mentee',
    title: 'Mentee Dashboard',
    homeRoute: '/mentee/mentors',
    themeClass: 'sidebar--mentee',
    logoSrc: 'assets/images/logo/logo.png',
    logoAlt: 'Career Nava mentee logo',
    items: [
      {
        label: 'Mentors',
        icon: faUsers,
        route: '/mentee/mentors',
        activePrefixes: [ '/mentee/mentors' ]
      },
      {
        label: 'Scholarships',
        icon: faCertificate,
        route: '/mentee/scholarships',
        activePrefixes: [ '/mentee/scholarships', '/mentee/scholarship-details' ]
      },
      { label: 'Sessions', icon: faLaptop, route: '/mentee/sessions' }
    ]
  }
};
