import i18next from 'i18next';

export default (elements) => (path, value) => {
  const {
    containerFeeds, containerPosts, input, btnAdd, feedback,
    body, backdrop, modal, modalTitle, modalBody, fullArticle, closeBtn,
  } = elements;

  const makeVisited = (postId) => {
    const link = document.querySelector(`[data-id="${postId}"]`);
    link.classList.add('font-weight-normal');
    link.classList.remove('font-weight-bold');
  };

  const openModal = (post, link) => (e) => {
    body.append(backdrop);
    if (e.target.dataset.id === link.dataset.id) {
      // makeVisited(post.id);
      body.classList.add('modal-open');
      modal.classList.add('show');
      modal.style.display = 'block';
      modalTitle.textContent = post.title;
      modalBody.textContent = post.description;
      fullArticle.href = post.link;
      backdrop.classList.add('modal-backdrop', 'fade', 'show');
    }
  };

  const closeModal = () => {
    body.classList.remove('modal-open');
    modal.classList.remove('show');
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

      btn.addEventListener('click', openModal(post, link));

      li.append(link);
      li.append(btn);
      ul.append(li);
    });
    containerPosts.append(h2);
    containerPosts.append(ul);
  };

  closeBtn.forEach((element) => {
    element.addEventListener('click', closeModal);
  });

  // const renderSuccessText = () => {
  //   feedback.classList.add('text-success');
  //   // input.classList.remove('is-invalid');
  //   // feedback.classList.remove('text-danger');
  //   feedback.textContent = i18next.t('success');
  //   console.log(feedback);
  // };

  const renderErrors = (error) => {
    feedback.textContent = '';
    if (!error) {
      return;
    }
    feedback.textContent = i18next.t(error);
  };

  const renderValid = (valid) => {
    console.log(valid);
    if (!valid) {
      input.classList.add('is-invalid');
      feedback.classList.add('text-danger');
    } else {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18next.t('success');
    }
  };

  const processStateHandle = (processState) => {
    switch (processState) {
      case 'failed':
        console.log(processState);
        renderErrors(i18next.t('errors.dataError'));
        btnAdd.removeAttribute('disabled');
        btnAdd.disabled = false;
        input.removeAttribute('readonly');
        break;
      case 'sending':
        console.log(processState);
        feedback.classList.remove('text-success', 'text-danger');
        btnAdd.setAttribute('disabled', true);
        input.setAttribute('readonly', 'readonly');
        feedback.innerHTML = null;
        break;
      case 'finished':
        console.log(processState);
        btnAdd.removeAttribute('disabled');
        input.removeAttribute('readonly');
        feedback.textContent = i18next.t('success');
        input.classList.remove('is-invalid');
        feedback.classList.add('text-success');
        input.value = null;
        input.focus();
        break;
      default:
        break;
    }
  };

  switch (path) {
    case 'process.processState':
      processStateHandle(value);
      break;
    case 'form.valid':
      console.log(value);
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
    case 'modalItem':
      makeVisited(value);
      break;
    default:
      break;
  }
};
