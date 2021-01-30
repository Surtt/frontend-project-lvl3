import i18next from 'i18next';

const containerFeeds = document.querySelector('.feeds');
const containerPosts = document.querySelector('.posts');
const form = document.querySelector('form');
const input = form.querySelector('input');
const feedback = document.querySelector('.feedback');

const renderSuccessText = () => {
  feedback.classList.add('text-success');
  feedback.textContent = i18next.t('success');
};

const renderFeeds = (dataFeeds) => {
  containerFeeds.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = 'Feeds';

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');

  dataFeeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const h3 = document.createElement('h3');
    h3.textContent = feed.title; // i18next.t('key')

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
    ul.append(li);
  });
  containerPosts.append(h2);
  containerPosts.append(ul);
};

const renderErrors = (error) => {
  feedback.textContent = '';
  if (Object.keys(error).length === 0) {
    return;
  }

  feedback.textContent = i18next.t(`errors.${error.e.type}`);
};

const renderValid = (valid) => {
  if (!valid) {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
  } else {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
  }
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

export default (dataFeeds, dataPosts) => (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandle(value, dataFeeds, dataPosts);
      break;
    case 'form.valid':
      renderValid(value);
      break;
    case 'form.errors':
      renderErrors(value);
      break;
    default:
      break;
  }
};
