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
