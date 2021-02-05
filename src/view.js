import i18next from 'i18next';

const containerFeeds = document.querySelector('.feeds');
const containerPosts = document.querySelector('.posts');
const form = document.querySelector('form');
const input = document.querySelector('[aria-label="url"]');
const btnAdd = document.querySelector('[aria-label="add"]');
const feedback = document.querySelector('.feedback');

const { body } = document;
const backdrop = document.createElement('div');
const modal = document.getElementById('modal');
const modalTitle = document.querySelector('.modal-title');
const modalBody = document.querySelector('.modal-body');
const fullArticle = document.querySelector('.full-article');
const closeBtn = document.querySelectorAll('[data-dismiss="modal"');

const uiState = {
  posts: [],
};

// const renderSuccessText = () => {
//   feedback.classList.add('text-success');
//   feedback.textContent = i18next.t('success');
//   input.classList.remove('is-invalid');
//   feedback.classList.remove('text-danger');
// };

const makeVisited = (postId) => {
  const { posts } = uiState;
  const link = document.querySelector(`[data-id="${postId}"]`);
  link.classList.add('font-weight-normal');
  link.classList.remove('font-weight-bold');
  uiState.posts = [...posts, postId];
};

const openModal = (post, link) => (e) => {
  body.append(backdrop);
  if (e.target.dataset.id === link.dataset.id) {
    makeVisited(post.id);
    body.classList.toggle('modal-open');
    modal.classList.toggle('show');
    modal.style.display = 'block';
    modalTitle.textContent = post.postTitle;
    modalBody.textContent = post.postDescription;
    fullArticle.href = post.postLink;
    backdrop.classList.add('modal-backdrop', 'fade', 'show');
  }
};

const closeModal = () => {
  body.classList.toggle('modal-open');
  modal.classList.toggle('show');
  modal.style.display = 'none';
  backdrop.remove();
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
  containerPosts.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = i18next.t('posts');

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  dataPosts.forEach((post) => {
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

    btn.addEventListener('click', openModal(post, link));

    closeBtn.forEach((element) => {
      element.addEventListener('click', closeModal);
    });

    li.append(link);
    li.append(btn);
    ul.append(li);
  });
  containerPosts.append(h2);
  containerPosts.append(ul);
};

const renderErrors = (error) => {
  console.log(feedback);
  feedback.textContent = '';
  if (!error) {
    return;
  }
  input.removeAttribute('readonly');
  input.classList.add('is-invalid');
  feedback.classList.add('text-danger');
  feedback.textContent = i18next.t(error);
};

// const renderValid = (valid) => {
//   // console.log(valid);
//   // if (!valid) {
//   //   input.classList.add('is-invalid');
//   //   feedback.classList.add('text-danger');
//   // } else {
//   // if (valid) {
//   //   input.classList.remove('is-invalid');
//   //   feedback.classList.remove('text-danger');
//   // }
//   // }
// };

const processStateHandle = (processState) => {
  console.log(processState);
  switch (processState) {
    case 'failed':
      btnAdd.setAttribute('disable', 'false');
      console.log(btnAdd.disabled);
      btnAdd.disabled = false;
      input.removeAttribute('readonly');
      break;
    case 'filling':
      btnAdd.setAttribute('disable', 'false');
      btnAdd.disabled = false;
      break;
    case 'sending':
      // btnAdd.setAttribute('disable', 'true');
      if (!btnAdd.disabled) {
        btnAdd.disabled = true;
        console.log(btnAdd.disabled);
      }
      // btnAdd.setAttribute('disabled', true);
      // input.setAttribute('readonly', 'readonly');
      feedback.innerHTML = null;
      break;
    case 'finished':
      btnAdd.disabled = false;
      input.removeAttribute('readonly');
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t('success');
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      form.reset();
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
    // case 'form.valid':
    //   console.log(valid);
    //   renderSuccessText();
    //   break;
    case 'form.errors':
      renderErrors(value);
      break;
    case 'rssFeeds':
      renderFeeds(value);
      break;
    case 'posts':
      renderPosts(value);
      break;
    case 'form.processError':
      console.log(value);
      input.setAttribute('readonly', 'readonly');
      break;
    default:
      break;
  }
};
