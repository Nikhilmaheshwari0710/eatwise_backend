const fs = require('fs');
const path = require('path');

const targetFile = 'd:/backup project/eatwise/eatwise_app/src/features/community/data/datasources/CommunityRemoteDataSource.ts';
const dir = path.dirname(targetFile);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const code = `import { apiClient } from '../../../../shared/network/apiClient';

export interface CommunityTopicApi {
  id: string;
  name: string;
  postCount: number;
  isPopular: boolean;
}

export interface CommunityPostApi {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorAvatarPresetId?: string;
  category: string;
  title: string;
  body: string;
  imageUrl?: string;
  topics: string[];
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PostCommentApi {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  text: string;
  createdAt: string;
}

export class CommunityRemoteDataSource {
  async getTopics(token: string): Promise<CommunityTopicApi[]> {
    const response = await apiClient.request<any>('/community/topics', { method: 'GET' }, token);
    const raw = (response as any).data;
    return Array.isArray(raw?.topics) ? raw.topics : Array.isArray(raw) ? raw : [];
  }

  async getPosts(
    token: string,
    tab: string = 'For You',
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CommunityPostApi[]> {
    const queryParams: string[] = [\`page=\${page}\`, \`limit=\${limit}\`];
    if (tab && tab !== 'For You') queryParams.push(\`tab=\${encodeURIComponent(tab)}\`);
    if (category) queryParams.push(\`category=\${encodeURIComponent(category)}\`);

    const query = \`?\${queryParams.join('&')}\`;
    const response = await apiClient.request<any>(\`/community/posts\${query}\`, { method: 'GET' }, token);
    const raw = (response as any).data;
    return Array.isArray(raw?.posts) ? raw.posts : Array.isArray(raw) ? raw : [];
  }

  async searchPosts(token: string, keyword: string): Promise<CommunityPostApi[]> {
    const response = await apiClient.request<any>(\`/community/posts/search?q=\${encodeURIComponent(keyword)}\`, { method: 'GET' }, token);
    const raw = (response as any).data;
    return Array.isArray(raw?.posts) ? raw.posts : Array.isArray(raw) ? raw : [];
  }

  async createPost(
    token: string,
    payload: { title: string; body: string; category: string; topics?: string[]; imageUrl?: string }
  ): Promise<CommunityPostApi> {
    const response = await apiClient.request<any>('/community/posts', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        category: payload.category || 'General',
        topics: payload.topics || [],
        imageUrl: payload.imageUrl,
      }),
    }, token);
    return (response as any).data;
  }

  async toggleLike(token: string, postId: string): Promise<{ likesCount: number; isLiked: boolean }> {
    const response = await apiClient.request<any>(\`/community/posts/\${postId}/like\`, { method: 'POST' }, token);
    return (response as any).data;
  }

  async getComments(token: string, postId: string): Promise<PostCommentApi[]> {
    const response = await apiClient.request<any>(\`/community/posts/\${postId}/comments\`, { method: 'GET' }, token);
    const raw = (response as any).data;
    return Array.isArray(raw?.comments) ? raw.comments : Array.isArray(raw) ? raw : [];
  }

  async addComment(token: string, postId: string, text: string): Promise<PostCommentApi> {
    const response = await apiClient.request<any>(\`/community/posts/\${postId}/comments\`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }, token);
    return (response as any).data;
  }
}
`;

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ Created CommunityRemoteDataSource.ts successfully!');
