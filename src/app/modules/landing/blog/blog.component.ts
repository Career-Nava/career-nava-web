import { Component, OnInit } from '@angular/core';
import { Blog } from "../../../services/blog/blog.model";
import { BlogService } from '../../../services/blog/blog.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];

  constructor(private blogService: BlogService) {
  }

  ngOnInit() {
    this.blogService.getAllBlogs().subscribe({
      next: blogs => {
        this.blogs = this.getLatestBlogs(blogs, 3);
      },
      error: () => (this.blogs = [])
    });
  }

  private getLatestBlogs(blogs: Blog[], count: number): Blog[] {
    return blogs
      .filter(blog => blog.createdAt) // safety check
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    // .slice(0, count);
  }
}
