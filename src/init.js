import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import en from './locales/en.js';
import parser from './parser.js';
import view from './view.js';
import 'bootstrap';

const mainValidation = (link, feeds) => {
  const schema = yup.string().url().required();
  const urlSchema = schema.notOneOf(feeds);
  try {
    urlSchema.validateSync(link);
    return null;
  } catch (e) {
    return e.message;
  }
};

const addFeed = (state, feed) => {
  const {
    title, description, posts,
  } = feed;
  const url = state.form.fields.rssLink;

  const feedId = Number(_.uniqueId());

  const newFeed = {
    feedId,
    title,
    description,
    url,
  };

  state.rssFeeds.push(newFeed);

  const newPosts = posts.map((post) => ({ ...post, feedId, id: Number(_.uniqueId()) }));
  state.posts.unshift(...newPosts);
};

const getProxyUrl = (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;

const updateFeeds = (state) => {
  const promises = state.rssFeeds.map((feed) => { // eslint-disable-line array-callback-return
    axios.get(getProxyUrl(feed.url))
      .then((response) => {
        const newPosts = parser(response.data.contents).posts;
        const oldPosts = state.posts;
        const diffPosts = _.differenceWith(
          newPosts, oldPosts, (a, b) => a.title === b.title,
        );

        if (diffPosts.length > 0) {
          state.posts = [...diffPosts, ...state.posts]; // eslint-disable-line no-param-reassign
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
  Promise.all(promises).finally(() => setTimeout(() => updateFeeds(state), 5000));
};

export default () => i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en,
  },
})
  .then(() => {
    const state = {
      form: {
        fields: {
          rssLink: '',
        },
        valid: true,
        errors: null,
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

    const watchedState = onChange(state, view(elements));

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const link = formData.get('url');
      watchedState.form.fields.rssLink = link;

      const feeds = watchedState.rssFeeds.map(({ url }) => url);
      const errors = mainValidation(link, feeds);

      if (!errors) {
        watchedState.process.processState = 'sending';
        watchedState.form.valid = true;
        axios.get(getProxyUrl(link))
          .then((response) => {
            addFeed(watchedState, parser(response.data.contents));

            watchedState.process.processState = 'finished';
            watchedState.process.error = null;
            watchedState.form.errors = null;
            console.log(state);
          })
          .catch((error) => {
            watchedState.process.processState = 'failed';
            watchedState.process.error = error.message === 'dataError' ? 'dataError' : 'networkError';
            watchedState.form.errors = null;
            console.log(error);
            console.log(state);
          });
      } else {
        watchedState.form.errors = errors;
        watchedState.form.valid = false;
        console.log(state);
      }
    });

    elements.containerPosts.addEventListener('click', (e) => {
      const { id } = e.target.dataset;

      if (!id) {
        return;
      }

      const currentPost = watchedState.posts.find(({ id: postId }) => postId === Number(id));

      if (!currentPost) {
        return;
      }

      watchedState.modalItem = currentPost;

      watchedState.readPosts.push(Number(id));
    });
    setTimeout(() => updateFeeds(watchedState), 5000);
  });
