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
  h2.textContent = i18next.t('feeds');

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');

  dataFeeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    const h3 = document.createElement('h3');
    h3.textContent = feed.feedTitle;

    const p = document.createElement('p');
    p.textContent = feed.feedDescription;

    li.append(h3);
    li.append(p);
    ul.prepend(li);
  });

  containerFeeds.append(h2);
  containerFeeds.append(ul);
};

const renderPosts = (dataPosts) => {
  console.log(dataPosts);
  containerPosts.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = i18next.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  dataPosts.forEach((post) => {
    console.log(post);
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const link = document.createElement('a');
    link.classList.add('font-weight-bold');
    link.textContent = post.postTitle;
    link.dataset.id = post.id;
    link.setAttribute('href', post.postLink);
    link.setAttribute('target', '_blank');

    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-primary', 'btn-sm');
    btn.textContent = i18next.t('button');
    btn.setAttribute('type', 'button');
    btn.dataset.id = post.id;
    btn.dataset.toggle = 'modal';
    btn.dataset.target = '#modal';
    btn.addEventListener('click', (e) => {
      const { body } = document;
      console.log(body);
      const modal = document.getElementById('modal');
      if (e.target.dataset.id === link.dataset.id) {
        body.classList.toggle('modal-open');
        modal.classList.toggle('show');
        modal.style.display = 'block';
      }
    });

    li.append(link);
    li.append(btn);
    ul.append(li);
  });
  containerPosts.append(h2);
  containerPosts.append(ul);
};

const renderModal = (postId, element) => {
  // element.modalTitle = post.title;
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

const processStateHandle = (processState) => {
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
      break;
    default:
      break;
  }
};

export default (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandle(value);
      break;
    case 'form.valid':
      renderValid(value);
      break;
    case 'form.errors':
      renderErrors(value);
      break;
    case 'rssFeeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value);
      break;
    default:
      break;
  }
};
