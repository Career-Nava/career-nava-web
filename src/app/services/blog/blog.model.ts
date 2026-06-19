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
  readingTime?: string;
  createdDate?: string;
  updatedAt?: string;
  contentBlockCount?: number;
  status?: string;
  isPublished?: boolean;
}
