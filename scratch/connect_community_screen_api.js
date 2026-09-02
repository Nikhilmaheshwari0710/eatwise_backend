const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/community/presentation/screens/CommunityScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports at the top
const importsToAdd = `import { CommunityRemoteDataSource, CommunityPostApi, PostCommentApi } from '../../data/datasources/CommunityRemoteDataSource';
import { authMemoryStore } from '../../../auth/data/datasources/AuthMemoryStore';
import { launchImageLibrary } from 'react-native-image-picker';
`;

if (!content.includes('CommunityRemoteDataSource')) {
  content = importsToAdd + content;
}

// 2. Add API state & data source instance inside component
const apiHooksCode = `  const communityDS = React.useMemo(() => new CommunityRemoteDataSource(), []);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [topicsList, setTopicsList] = useState<string[]>(['Toddler Nutrition', 'Picky Eaters', 'Sugar Warnings', 'Ask Pediatrician', 'School Tiffin Recipes']);
  const [selectedPostImage, setSelectedPostImage] = useState<any>(null);

  // Fetch topics and posts from MongoDB API
  const fetchCommunityData = React.useCallback(async (tabName: string = 'For You') => {
    try {
      const session = authMemoryStore ? authMemoryStore.getSession() : null;
      if (!session?.accessToken) return;

      setIsLoadingApi(true);
      const [fetchedTopics, fetchedPosts] = await Promise.all([
        communityDS.getTopics(session.accessToken).catch(() => []),
        communityDS.getPosts(session.accessToken, tabName).catch(() => []),
      ]);

      if (Array.isArray(fetchedTopics) && fetchedTopics.length > 0) {
        setTopicsList(fetchedTopics.map((t: any) => typeof t === 'string' ? t : t.name));
      }

      if (Array.isArray(fetchedPosts) && fetchedPosts.length > 0) {
        const formatted: CommunityPost[] = fetchedPosts.map((p: any) => ({
          id: p.id || p._id,
          authorName: p.authorName || 'Community Parent',
          authorAvatar: p.authorAvatarPresetId
            ? { uri: \`http://10.0.2.2:3000/uploads/avatars/\${p.authorAvatarPresetId}.png\` }
            : p.authorAvatarUrl
            ? { uri: p.authorAvatarUrl }
            : require('../../../../shared/assets/parent_ritika.png'),
          timeAgo: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently',
          category: p.category || 'General',
          title: p.title,
          body: p.body,
          image: p.imageUrl ? { uri: p.imageUrl } : null,
          likesCount: p.likesCount || 0,
          isLiked: p.isLiked || false,
          commentsCount: p.commentsCount || 0,
          actionText: 'View Discussion',
          comments: [],
        }));
        setPosts(formatted);
      }
    } catch (err) {
      console.log('Fetch community API error:', err);
    } finally {
      setIsLoadingApi(false);
    }
  }, [communityDS]);

  React.useEffect(() => {
    fetchCommunityData(activeCategory);
  }, [activeCategory, fetchCommunityData]);
`;

if (!content.includes('const communityDS =')) {
  content = content.replace(
    'const [searchQuery, setSearchQuery] = useState(\'\');',
    'const [searchQuery, setSearchQuery] = useState(\'\');\n' + apiHooksCode
  );
}

// 3. Connect Like Toggle to API
const newLikeToggle = `  const handleToggleLike = async (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
          };
        }
        return post;
      }),
    );

    try {
      const session = authMemoryStore ? authMemoryStore.getSession() : null;
      if (session?.accessToken) {
        await communityDS.toggleLike(session.accessToken, postId);
      }
    } catch (e) {
      console.log('Like toggle API error:', e);
    }
  };`;

content = content.replace(
  /const handleToggleLike = \(postId: string\) => \{[\s\S]*?\};\s*\};/,
  newLikeToggle
);

// 4. Connect Create Post to API
const newCreatePost = `  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostBody.trim()) {
      Alert.alert('Incomplete Post', 'Please provide a title and details for your post.');
      return;
    }

    try {
      const session = authMemoryStore ? authMemoryStore.getSession() : null;
      let createdApiPost: any = null;

      if (session?.accessToken) {
        createdApiPost = await communityDS.createPost(session.accessToken, {
          title: newPostTitle.trim(),
          body: newPostBody.trim(),
          category: newPostCategory,
          topics: selectedTopic ? [selectedTopic] : ['Toddler Nutrition'],
          imageUrl: selectedPostImage?.uri,
        });
      }

      const newPost: CommunityPost = {
        id: createdApiPost?.id || Date.now().toString(),
        authorName: createdApiPost?.authorName || 'Darshan Patel',
        authorAvatar: require('../../../../shared/assets/parent_ritika.png'),
        timeAgo: 'Just now',
        category: newPostCategory,
        title: newPostTitle.trim(),
        body: newPostBody.trim(),
        image: selectedPostImage ? selectedPostImage : null,
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        actionText: 'View Discussion',
        comments: [],
      };

      setPosts([newPost, ...posts]);
      setNewPostTitle('');
      setNewPostBody('');
      setSelectedPostImage(null);
      setIsCreateModalOpen(false);
      Alert.alert('Success', 'Your discussion post has been published!');
    } catch (err: any) {
      console.log('Create post API error:', err);
      Alert.alert('Error', 'Could not create post. Please try again.');
    }
  };`;

content = content.replace(
  /const handleCreatePost = \(\) => \{[\s\S]*?setIsCreateModalOpen\(false\);\s*\};/,
  newCreatePost
);

// 5. Connect Comments to API
const newAddComment = `  const handleAddComment = async () => {
    if (!newCommentText.trim() || !activeDiscussionPost) return;

    const commentText = newCommentText.trim();
    setNewCommentText('');

    const newCommentObj = {
      id: Date.now().toString(),
      author: 'Darshan Patel',
      avatar: require('../../../../shared/assets/parent_ritika.png'),
      time: 'Just now',
      text: commentText,
    };

    setPosts(prev =>
      prev.map(post => {
        if (post.id === activeDiscussionPost.id) {
          const updatedComments = [...(post.comments || []), newCommentObj];
          const updatedPost = {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: updatedComments,
          };
          setActiveDiscussionPost(updatedPost);
          return updatedPost;
        }
        return post;
      }),
    );

    try {
      const session = authMemoryStore ? authMemoryStore.getSession() : null;
      if (session?.accessToken) {
        await communityDS.addComment(session.accessToken, activeDiscussionPost.id, commentText);
      }
    } catch (e) {
      console.log('Add comment API error:', e);
    }
  };`;

content = content.replace(
  /const handleAddComment = \(\) => \{[\s\S]*?setActiveDiscussionPost\(updatedPost\);\s*\}\s*\};\s*\}/,
  newAddComment
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Connected CommunityScreen.tsx with NestJS MongoDB API!');
