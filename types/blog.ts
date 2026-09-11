export interface WordPressFeaturedMediaDetails {
  width?: number;
  height?: number;
  file?: string;
  sizes?: Record<
    string,
    {
      file?: string;
      width: number;
      height: number;
      mime_type?: string;
      source_url: string;
    }
  >;
}

export interface WordPressFeaturedMedia {
  id: number;
  date?: string;
  slug?: string;
  type?: string;
  link?: string;
  title?: {
    rendered?: string;
  };
  author?: number;
  caption?: {
    rendered?: string;
  };
  alt_text?: string;
  media_type?: string;
  mime_type?: string;
  media_details?: WordPressFeaturedMediaDetails;
  source_url: string;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  url?: string;
  description?: string;
  link?: string;
  slug?: string;
  avatar_urls?: Record<string, string>;
  is_super_admin?: boolean;
}

export interface WordPressTerm {
  id: number;
  link?: string;
  name: string;
  slug: string;
  taxonomy?: string;
}

export interface WordPressEmbedded {
  author?: WordPressAuthor[];
  "wp:featuredmedia"?: WordPressFeaturedMedia[];
  "wp:term"?: WordPressTerm[][];
}

export interface BlogPost {
  id: number;
  date: string;
  date_gmt?: string;
  guid?: {
    rendered?: string;
  };
  modified: string;
  modified_gmt?: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected?: boolean;
  };
  excerpt: {
    rendered: string;
    protected?: boolean;
  };
  author: number;
  featured_media: number;
  comment_status?: string;
  ping_status?: string;
  sticky?: boolean;
  template?: string;
  format?: string;
  meta?: Record<string, unknown>;
  categories: number[];
  tags: number[];
  _embedded?: WordPressEmbedded;
}

export interface GetBlogPostsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
}

export interface GetBlogPostsResult {
  posts: BlogPost[];
  total: number;
  totalPages: number;
}
