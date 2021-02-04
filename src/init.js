import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import en from './locales/en.js';
import parser from './parser.js';
import view from './view.js';

const errorMessages = {
  network: {
    error: 'Network Problems. Try again.',
  },
};

const validate = (url, fields) => {
  // let errors = {};
  const links = fields.map((feed) => feed.url);
  const schema = yup.string().url().notOneOf(links).required();

  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }

  // return errors;
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

  posts.forEach((post) => {
    const newPost = { ...post, feedId, id: Number(_.uniqueId()) };
    state.posts.push(newPost);
  });
};

const getProxyUrl = (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;

const updateFeeds = (state) => {
  state.rssFeeds.forEach((feed) => {
    axios.get(getProxyUrl(feed.url))
      .then((response) => {
        const { feedId } = feed;
        const feedData = parser(response.data.contents);
        const resultFilter = feedData.posts.filter((post) => {
          const result = Date.parse(post.postDate) > state.date;
          return result;
        });
        resultFilter.forEach((post) => {
          const newPost = { ...post, feedId };
          state.posts.unshift(newPost);
          const updateState = state;
          updateState.date = Date.now();
        });

        setTimeout(() => updateFeeds(state), 5000);
      })
      .catch((error) => {
        const updateState = state;
        updateState.form.processError = error.response.status;
        setTimeout(() => updateFeeds(state), 5000);
      });
  });
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  });

  const state = {
    form: {
      processState: 'filling',
      processError: null,
      fields: {
        rssLink: '',
      },
      valid: true,
      errors: null,
    },
    rssFeeds: [],
    posts: [],
    date: Date.now(),
  };

  yup.setLocale({
    string: {
      url: i18next.t('errors.url'),
    },
    mixed: {
      notOneOf: i18next.t('errors.notOneOf'),
      dataError: i18next.t('errors.dataError'),
    },
  });

  const watchedState = onChange(state, view);

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url');
    watchedState.form.fields.rssLink = link;
    // watchedState.form.processState = 'filling';
    watchedState.form.processState = 'sending';

    // const addedUrls = watchedState.rssFeeds.map(({ url }) => url);
    const errors = validate(link, watchedState.rssFeeds);
    // watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.errors = errors;
    console.log(errors);
    if (errors) {
      watchedState.form.processState = 'failed';
      console.log(state);
    }

    if (!errors) {
      // watchedState.form.valid = true;


      axios.get(getProxyUrl(link))
        .then((response) => {
          addFeed(watchedState, parser(response.data.contents));
          updateFeeds(watchedState);
          watchedState.form.processState = 'finished';
          console.log(state);
        })
        .catch((error) => {
          // watchedState.form.processError = errorMessages;
          watchedState.form.processError = 'failed';
          watchedState.form.processState = 'failed';
          watchedState.form.errors = i18next.t('errors.dataError');
          // console.log(error.message);
          console.log(state);
          return error;
        });
    } else {
      console.log(errors);
      watchedState.form.errors = errors;
    }
  });
};
