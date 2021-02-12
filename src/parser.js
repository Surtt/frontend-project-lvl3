export default (rssContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssContent, 'application/xml');

  const error = doc.querySelector('parsererror');
  if (error) {
    throw new Error(error.textContent = 'dataError');
  }

  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;

  const postElements = Array.from(doc.querySelectorAll('item'));
  const posts = postElements.map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    return {
      title, description, link,
    };
  });

  return { title: feedTitle, description: feedDescription, posts };
};
