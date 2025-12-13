import { Component } from '@angular/core';
import { BlogService } from '../../../services/blog/blog.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent {
  blogs: any[] = [];

  constructor(private blogService: BlogService) {
  }

  ngOnInit() {
    this.blogService.getBlogs().subscribe(data => {
      this.blogs = data;
    });
  }
}
