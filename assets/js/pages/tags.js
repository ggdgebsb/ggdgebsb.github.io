'use strict';

(function () {
  const postCollector = new Site.PostCollector();
  const tagCollector = new Site.TagCollector();
  const query = queryString.parse(location.search);
  
  main();

  function main() {
    renderTagName('.section-first', query.tag);

    const promises = [
      postCollector.collect(),
      tagCollector.collect()
    ];
  
    Promise.all(promises)
      .then(collected)
      .catch(failedCollect);
  }

  function collected() {
    var posts = query.tag ? postCollector.find(post => {
      return post.tags.includes(query.tag);
    }) : postCollector.getList();
    renderPostList('.section-posts', posts);
  }

  function failedCollect(reason) {
    console.error(reason);
    alert(reason.message);
    history.go(-1);
  }

  function renderTagName(selector, tag) {
    var html = `
      <div class="row">
        <div class="col">
          <h1 class="site-description text-shadow">
            <span>${tag ? `"${tag}"` : 'All Posts'}</span>
          </h1>
        </div>
      </div>
    `;

    var target = document.querySelector(selector);
    target.innerHTML = html;
  }

  function renderPostList(selector, posts) {
    var html = `
      <div class="highlighter-rouge text-center">
        <div class="highlight">
          <pre class="highlight"><code>검색된 포스트가 없습니다.</code></pre>
        </div>
      </div>
    `;
    if (posts.length) {
      html = `
        <ul class="row row-sm-fill card-list">
          ${getPostCardsHtml(posts)}
        </ul>
      `;
    }

    var target = document.querySelector(selector)
    target.innerHTML = html;
  }

  function getPostCardsHtml(posts) {
    let html = [];

    for (const post of posts) {
      let item = `
        <li class="col col-12">
          <div class="card-item">
            ${getPostCardHtml(post)}
          </div>
        </li>
      `;
      html.push(item);
    }

    return html.join('\n');
  }

  function getPostCardHtml(post) {
    let { title, excerpt, date, url, tags } = post;
    date = moment(date).format();
    tags = getPostCardTagsHtml(tags);
    excerpt = excerpt.replace(/\n/g, '')
      .replace(/<h\d.+\/h\d>/g, '')
      .replace(/<[^>]*>/g, '')
      .substr(0, 180);

    return `
      <h5 class="card-date"><span>${date}</span></h5>
<h2 class="card-title">
  <span><a href="${url}">${title}</a></span>
</h2>

<p class="card-excerpt"><span>${excerpt}</span></p>

<hr>
<div class="tag-list">
  <span class="card-meta-label">Tags:</span>
  ${tags}
</div>
    `;
  }

  function getPostCardTagsHtml(tags) {
    let html = [];

    for (const tag of tags) {
      html.push(getPostCardTagHtml(tag));
    }

    return html.join('\n');
  }

  function getPostCardTagHtml(tag) {
    return `
      <span class="tag-item"><a href="/pages/tags?tag=${tag}">${tag}</a></span>
    `;
  }
})();
