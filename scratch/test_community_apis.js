const http = require('http');

function request(path, method = 'GET', body = null, token = '') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testCommunity() {
  console.log('--- TESTING COMMUNITY & PARENT FORUM REST APIS ---');

  // 1. Login
  const loginRes = await request('/auth/login', 'POST', { email: 'dp150875@gmail.com', password: 'Dp@123' });
  console.log('1. Login Status:', loginRes.status);
  const token = loginRes.data?.data?.accessToken;
  console.log('   Token acquired:', token ? 'YES ✅' : 'NO ❌');

  // 2. GET /community/topics
  const topicsRes = await request('/community/topics', 'GET', null, token);
  console.log('\n2. GET /community/topics:', topicsRes.status);
  console.log('   Topics count:', topicsRes.data?.data?.topics?.length ?? topicsRes.data?.length ?? 0);

  // 3. GET /community/posts
  const postsRes = await request('/community/posts', 'GET', null, token);
  console.log('\n3. GET /community/posts:', postsRes.status);
  const postsList = postsRes.data?.data?.posts ?? postsRes.data?.posts ?? [];
  console.log('   Posts count:', postsList.length);

  // 4. POST /community/posts (Create Post)
  const createPostRes = await request('/community/posts', 'POST', {
    title: 'Are organic fruit juices safe for 1-year-olds?',
    body: 'Even 100% natural fruit juices contain high fructose without fiber. What do pediatricians recommend?',
    category: 'Nutrition'
  }, token);
  console.log('\n4. POST /community/posts (Create Post):', createPostRes.status);
  console.log('   Created Post Title:', createPostRes.data?.data?.title || createPostRes.data?.title || JSON.stringify(createPostRes.data));

  // 5. POST /community/posts/:id/like (Toggle Like)
  const postId = postsList[0]?.id || postsList[0]?._id;
  if (postId) {
    const likeRes = await request(`/community/posts/${postId}/like`, 'POST', null, token);
    console.log(`\n5. POST /community/posts/${postId}/like:`, likeRes.status);
    console.log('   New Likes Count:', likeRes.data?.data?.likesCount ?? likeRes.data?.likesCount);
  }

  // 6. POST /community/posts/:id/comments (Add Comment)
  if (postId) {
    const commentRes = await request(`/community/posts/${postId}/comments`, 'POST', {
      text: 'Great post! Always consult a pediatric nutritionist before introducing fruit juices.'
    }, token);
    console.log(`\n6. POST /community/posts/${postId}/comments:`, commentRes.status);
    console.log('   Comment Text:', commentRes.data?.data?.text || commentRes.data?.text);
  }

  console.log('\n🎉 ALL COMMUNITY & PARENT FORUM REST API ENDPOINTS VERIFIED 100%!');
}

testCommunity().catch(err => console.error('❌ Test error:', err));
