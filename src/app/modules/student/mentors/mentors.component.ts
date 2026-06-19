import { Component, OnInit } from '@angular/core';
import { faArrowRight, faBriefcase, faCalendarCheck, faMagnifyingGlass, faStar, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { take } from 'rxjs';
import { Mentor } from '../../../services/mentor/mentor.model';
import { MentorService } from '../../../services/mentor/mentor.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-mentors',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './mentors.component.html',
  styleUrls: [ './mentors.component.scss' ]
})
export class MentorsComponent implements OnInit {

  mentors: Mentor[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  skeletonCards = Array.from({ length: 6 });

  protected readonly faMagnifyingGlass = faMagnifyingGlass;
  protected readonly faBriefcase = faBriefcase;
  protected readonly faUserGroup = faUserGroup;
  protected readonly faStar = faStar;
  protected readonly faCalendarCheck = faCalendarCheck;
  protected readonly faArrowRight = faArrowRight;

  constructor(private mentorService: MentorService) {
  }

  ngOnInit(): void {
    this.mentorService.getAllMentors().pipe(take(1)).subscribe({
      next: mentors => {
        this.mentors = mentors ?? [];
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load mentors. Please try again later.';
        console.error('Error loading mentors:', err);
        this.loading = false;
      }
    });
  }

  get visibleMentors(): Mentor[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.mentors;
    }

    return this.mentors.filter(mentor => {
      const expertise = (mentor.expertise ?? []).map(item => item.expertiseName ?? '').join(' ');
      const disciplines = (mentor.disciplines ?? []).map(item => item.disciplineName ?? '').join(' ');
      const fluency = (mentor.fluency ?? []).map(item => item.fluencyName ?? '').join(' ');

      return [
        mentor.fullName,
        mentor.positionTitle,
        mentor.company,
        mentor.bio,
        expertise,
        disciplines,
        fluency
      ]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(query));
    });
  }

  get totalMentors(): number {
    return this.mentors.length;
  }

  get isFiltered(): boolean {
    return !!this.searchQuery.trim();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
  }

  resetSearch(): void {
    this.searchQuery = '';
  }

  getExpertiseTags(mentor: Mentor): string[] {
    return (mentor.expertise ?? [])
      .map(item => item.expertiseName)
      .filter((item): item is string => !!item)
      .slice(0, 2);
  }

  trackByMentor(index: number, mentor: Mentor): number | string {
    return mentor.userId ?? mentor.fullName ?? index;
  }
}
