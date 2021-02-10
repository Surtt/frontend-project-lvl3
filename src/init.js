import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import en from './locales/en.js';
import parser from './parser.js';
import view from './view.js';

const validate = (url, schema) => {
  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const mainValidation = (link, feeds, schema) => {
  const urlSchema = schema.notOneOf(feeds);
  const errors = validate(link, urlSchema);
  return errors;
};

const addFeed = (state, feed) => {
  const {
    feedTitle, feedDescription, posts,
  } = feed;
  const url = state.form.fields.rssLink;

  const feedId = Number(_.uniqueId());

  const newFeed = {
    feedId,
    feedTitle,
    feedDescription,
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
          newPosts, oldPosts, (a, b) => a.postTitle === b.postTitle,
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

export default () => {
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
    body: document.body,
    backdrop: document.createElement('div'),
    modal: document.getElementById('modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    fullArticle: document.querySelector('.full-article'),
    closeBtn: document.querySelectorAll('[data-dismiss="modal"'),
  };

  const schema = yup.string().url();
  const watchedState = onChange(state, view(elements));

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  })
    .then(() => {
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const link = formData.get('url');
        watchedState.form.fields.rssLink = link;

        const feeds = watchedState.rssFeeds.map(({ url }) => url);
        const errors = mainValidation(link, feeds, schema);

        if (!errors) {
          watchedState.process.processState = 'sending';
          axios.get(getProxyUrl(link))
            .then((response) => {
              addFeed(watchedState, parser(response.data.contents));
              updateFeeds(watchedState);
              watchedState.process.processState = 'finished';
              watchedState.process.error = null;
              watchedState.form.valid = true;
              watchedState.form.errors = null;
            })
            .catch((error) => {
              watchedState.process.processState = 'failed';
              watchedState.process.error = error.message;
              watchedState.form.valid = false;
              watchedState.form.errors = null;
              console.log(error);
            });
        } else {
          watchedState.form.errors = errors;
          watchedState.form.valid = false;
        }
      });

      elements.containerPosts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) {
          return;
        }
        watchedState.modalItem = id;
      });
    });
};
