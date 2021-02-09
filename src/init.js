import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import en from './locales/en.js';
import parser from './parser.js';
import view from './view.js';

// const errorMessages = {
//   network: {
//     error: 'Network Problems. Try again.',
//   },
// };

const validate = (url, feeds) => {
  const schema = yup.string().url().notOneOf(feeds).required();

  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
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
  const promises = state.rssFeeds.map((feed) => { // eslint-disable-line array-callback-return
    axios.get(getProxyUrl(feed.url))
      .then((response) => {
        // const { feedId } = feed;
        const newPosts = parser(response.data.contents).posts;
        const oldPosts = state.posts;
        const diffPosts = _.differenceWith(
          newPosts, oldPosts, (a, b) => a.postTitle === b.postTitle,
        );
        console.log(newPosts);
        console.log(oldPosts);
        console.log(diffPosts);

        if (diffPosts.length > 0) {
          state.posts = [...diffPosts, ...state.posts]; // eslint-disable-line no-param-reassign
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
  console.log(promises);
  Promise.all(promises).finally(() => setTimeout(() => updateFeeds(state), 5000));
};

export default () => {
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
    loading: {
      loadingState: null,
      error: null,
    },
    rssFeeds: [],
    posts: [],
    date: Date.now(),
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

  const watchedState = onChange(state, view);

  const form = document.querySelector('form');

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en,
    },
  })
    .then(() => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const link = formData.get('url');
        watchedState.form.fields.rssLink = link;
        // watchedState.form.processState = 'filling';
        watchedState.form.processState = 'sending';

        const feeds = watchedState.rssFeeds.map(({ url }) => url);
        const errors = validate(link, feeds);

        console.log(errors);
        // if (errors) {
        //   watchedState.form.processState = 'failed';
        //   console.log(state);
        // }

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
          console.log(state);
          watchedState.form.processState = 'failed';
          watchedState.form.errors = errors;
        }
      });
    });
};
