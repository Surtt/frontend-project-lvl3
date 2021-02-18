import _ from 'lodash';
import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales/index.js';
import parser from './parser.js';
import view from './view.js';
import 'bootstrap';

const getValidator = () => {
  const schema = yup.string().url().required();
  return (link, feeds) => schema.notOneOf(feeds).validateSync(link);
};

const addFeed = (state, feed) => {
  const {
    title, description, items,
  } = feed;
  const url = state.form.fields.rssLink;

  const feedId = _.uniqueId();

  const newFeed = {
    feedId,
    title,
    description,
    url,
  };

  state.rssFeeds.push(newFeed);

  const newPosts = items.map((post) => ({ ...post, feedId, id: _.uniqueId() }));
  state.posts.unshift(...newPosts);
};

const getProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const updateFeeds = (state) => {
  const promises = state.rssFeeds.map((feed) => axios.get(getProxyUrl(feed.url))
    .then((response) => {
      const newPosts = parser(response.data.contents).items;
      const oldPosts = state.posts;
      const diffPosts = _.differenceWith(
        newPosts, oldPosts, (a, b) => a.title === b.title,
      );

      if (diffPosts.length > 0) {
        state.posts.unshift(...diffPosts);
      }
    })
    .catch((error) => {
      console.log(error);
    }));
  Promise.all(promises).finally(() => setTimeout(() => updateFeeds(state), 5000));
};

export default () => i18next.init({
  lng: 'ru',
  debug: true,
  resources,
})
  .then(() => {
    const state = {
      form: {
        fields: {
          rssLink: '',
        },
        valid: true,
        error: null,
      },
      process: {
        processState: null,
        error: null,
      },
      rssFeeds: [],
      posts: [],
      modalItem: null,
      readPosts: [],
    };

    yup.setLocale({
      string: {
        url: 'errors.url',
      },
      mixed: {
        notOneOf: 'errors.notOneOf',
        required: 'errors.required',
      },
    });

    const elements = {
      containerFeeds: document.querySelector('.feeds'),
      containerPosts: document.querySelector('.posts'),
      form: document.querySelector('form'),
      input: document.querySelector('[aria-label="url"]'),
      btnAdd: document.querySelector('[aria-label="add"]'),
      feedback: document.querySelector('.feedback'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      fullArticle: document.querySelector('.full-article'),
    };

    const watchedState = view(state, elements);
    console.log(watchedState);
    const validate = getValidator();

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const link = formData.get('url');
      watchedState.form.fields.rssLink = link;
      watchedState.form.valid = true;
      watchedState.form.error = null;
      watchedState.process.processState = null;

      const feeds = watchedState.rssFeeds.map(({ url }) => url);

      try {
        validate(link, feeds);
        watchedState.process.processState = 'sending';

        axios.get(getProxyUrl(link))
          .then((response) => {
            addFeed(watchedState, parser(response.data.contents));

            watchedState.process.processState = 'finished';
            watchedState.process.error = null;
          })
          .catch((error) => {
            if (error.isAxiosError) {
              watchedState.process.error = 'networkError';
            } else {
              watchedState.process.error = 'dataError';
            }
            watchedState.process.processState = 'failed';
          });
      } catch (error) {
        watchedState.form.error = error.message;
        watchedState.form.valid = false;
      }
    });

    elements.containerPosts.addEventListener('click', (e) => {
      const { id } = e.target.dataset;

      if (!id) {
        return;
      }

      const currentPost = watchedState.posts.find(({ id: postId }) => postId === id);

      if (!currentPost) {
        return;
      }

      watchedState.modalItem = currentPost;

      watchedState.readPosts.push(id);
    });
    setTimeout(() => updateFeeds(watchedState), 5000);
  });
