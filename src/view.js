const containerFeeds = document.querySelector('.feeds');
const containerPosts = document.querySelector('.posts');
const form = document.querySelector('form');
const input = form.querySelector('input');
const feedback = document.querySelector('.feedback');

const renderSuccessText = () => {
  feedback.classList.add('text-success');
  feedback.textContent = 'Rss has been loaded';
};

const renderFeeds = (dataFeeds) => {
  containerFeeds.innerHTML = '';
  console.log(dataFeeds);
  const h2 = document.createElement('h2');
  h2.textContent = 'Feeds';

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');

  dataFeeds.forEach((feed) => {
    console.log(feed.title);
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const h3 = document.createElement('h3');
    h3.textContent = feed.title;

    const p = document.createElement('p');
    p.textContent = feed.description;

    li.append(h3);
    li.append(p);
    ul.prepend(li);
  });

  containerFeeds.append(h2);
  containerFeeds.append(ul);
};

const renderPosts = (dataPosts) => {
  containerPosts.innerHTML = '';
  console.log(dataPosts);
  const h2 = document.createElement('h2');
  h2.textContent = 'Posts';

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  dataPosts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const link = document.createElement('a');
    link.classList.add('font-weight-bold');
    link.textContent = post.title;
    link.setAttribute('href', post.link);
    link.setAttribute('target', '_blank');

    li.append(link);
    ul.prepend(li);
  });
  containerPosts.append(h2);
  containerPosts.append(ul);
};

const processStateHandle = (processState, dataFeeds, dataPosts) => {
  switch (processState) {
    case 'failed':
      console.log(processState);
      break;
    case 'filling':
      console.log(processState);
      break;
    case 'sending':
      console.log(processState);
      form.reset();
      break;
    case 'finished':
      renderSuccessText();
      renderFeeds(dataFeeds);
      renderPosts(dataPosts);
      break;
    default:
      break;
  }
};

const renderErrors = (element, error) => {
  if (Object.keys(error).length === 0) {
    return;
  }
  const { message } = error.rssLink;
  element.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = message;
  console.log(message);
};

const renderValid = () => {
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.textContent = '';
};

export default (dataFeeds, dataPosts) => (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandle(value, dataFeeds, dataPosts);
      console.log(value);
      console.log(dataFeeds);
      break;
    case 'form.valid':
      console.log(value);
      renderValid();
      break;
    case 'form.errors':
      renderErrors(input, value);
      break;
    default:
      break;
  }
};
