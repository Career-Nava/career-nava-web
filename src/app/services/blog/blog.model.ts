import { UserModel } from "../user/user.model";

export interface BlogContent {
  contentOrder: number;
  contentText: string;
}

export interface Blog {
  blogId?: number;
  authorId?: number | null;
  author?: UserModel | null;

  title?: string;
  slug?: string;
  coverImage?: string | null;
  blockQuote?: string;
  category?: string | null;
  readingTime?: string | null;

  // publishedAt?: string;
  createdAt?: string;
  // updatedAt?: string;

  /** Child entities */
  contents?: BlogContent[];
}

export interface AdminBlog {
  blogId?: number;
  title?: string;
  slug?: string;
  authorId?: number;
  authorName?: string;
  category?: string;
  coverImage?: string;
  quote?: string;
  blockQuote?: string;
  readingTime?: string;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  archivedAt?: string | null;
  contents?: BlogContent[];
  contentBlockCount?: number;
  status?: string;
  isPublished?: boolean;
}

export interface AdminBlogUpsert {
  authorId?: number | null;
  title?: string | null;
  slug?: string | null;
  coverImage?: string | null;
  blockQuote?: string | null;
  category?: string | null;
  readingTime?: string | null;
  status?: string | null;
  contents?: BlogContent[] | null;
}
