import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../../../services/blog/blog.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './blog-details.component.html',
  styleUrls: [ './blog-details.component.scss' ]
})
export class BlogDetailsComponent {
  blog: any;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService
  ) {
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.blogService.getBlogs().subscribe(blogs => {
      this.blog = blogs.find((b: any) => b.id === id);
    });
  }
}
