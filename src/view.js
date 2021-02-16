import i18next from 'i18next';
import onChange from 'on-change';

export default (state, elements) => onChange(state, (path) => {
  const {
    containerFeeds, containerPosts, input, btnAdd, feedback, modalTitle, modalBody, fullArticle,
  } = elements;

  const makeVisited = (postId) => {
    const link = document.querySelector(`[data-id="${postId}"]`);
    link.classList.add('font-weight-normal');
    link.classList.remove('font-weight-bold');
  };

  const fillingModal = ({
    description, title, link, id,
  } = {}) => {
    makeVisited(id);
    modalTitle.textContent = title;
    modalBody.textContent = description;
    fullArticle.href = link;
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
    const h2 = document.createElement('h2');
    h2.textContent = i18next.t('posts');

    const ul = document.createElement('ul');
    ul.classList.add('list-group');

    dataPosts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

      const link = document.createElement('a');
      link.classList.add('font-weight-bold');
      link.textContent = post.title;
      link.dataset.id = post.id;
      link.setAttribute('href', post.link);
      link.setAttribute('target', '_blank');

      const btn = document.createElement('button');
      btn.classList.add('btn', 'btn-primary', 'btn-sm');
      btn.textContent = i18next.t('button');
      btn.setAttribute('type', 'button');
      btn.dataset.id = post.id;
      btn.dataset.toggle = 'modal';
      btn.dataset.target = '#modal';

      li.append(link);
      li.append(btn);
      ul.append(li);
    });
    containerPosts.append(h2);
    containerPosts.append(ul);
  };

  const renderSuccessText = () => {
    feedback.classList.add('text-success');
    feedback.textContent = i18next.t('success');
  };

  const renderErrors = (error) => {
    input.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.textContent = i18next.t(`errors.${error}`);
  };

  const renderValid = (valid) => {
    const { error } = state.form;
    if (!valid) {
      renderErrors(error);
      input.classList.add('is-invalid');
      feedback.classList.add('text-danger');
    } else {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
    }
  };

  const processStateHandle = (mainState) => {
    const { processState, error } = mainState.process;
    switch (processState) {
      case 'failed':
        renderErrors(error);
        btnAdd.removeAttribute('disabled');
        input.removeAttribute('readonly');
        break;
      case 'sending':
        feedback.classList.remove('text-success', 'text-danger');
        btnAdd.setAttribute('disabled', true);
        input.setAttribute('readonly', 'readonly');
        feedback.innerHTML = null;
        break;
      case 'finished':
        renderSuccessText();
        btnAdd.removeAttribute('disabled');
        input.removeAttribute('readonly');
        input.classList.remove('is-invalid');
        input.value = null;
        input.focus();
        break;
      default:
        break;
    }
  };

  switch (path) {
    case 'process.processState':
      processStateHandle(state);
      break;
    case 'form.valid':
      renderValid(state.form.valid);
      break;
    case 'rssFeeds':
      renderFeeds(state.rssFeeds);
      break;
    case 'posts':
      renderPosts(state.posts);
      break;
    case 'modalItem':
      fillingModal(state.modalItem);
      break;
    default:
      break;
  }
});
