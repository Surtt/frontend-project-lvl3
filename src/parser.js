export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response, 'application/xml');

  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;

  const posts = Array.from(doc.querySelectorAll('item')).map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDate = item.querySelector('pubDate').textContent;
    return {
      postTitle, postDescription, postLink, postDate,
    };
  });

  return { feedTitle, feedDescription, posts };
};
