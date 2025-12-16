import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, take } from "rxjs";
import { Blog } from "../../../../services/blog/blog.model";
import { BlogService } from '../../../../services/blog/blog.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './blog-details.component.html',
  styleUrls: [ './blog-details.component.scss' ]
})
export class BlogDetailsComponent implements OnInit {
  blog?: Blog;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map(params => params.get('slug') || ''),
        filter(slug => slug.length > 0),
        switchMap(slug =>
          this.blogService.getAllBlogs().pipe(
            map(blogs => blogs.find(b => b.slug === slug)) // find blog by slug
          )
        ),
        take(1)
      )
      .subscribe({
          next: blog => {
            this.blog = blog;
            this.isLoading = false;
          },
          error: err => {
            console.error('Error loading blog', err);
            this.isLoading = false;
            // this.hasError = true;
          }
        }
      );
  }
}
