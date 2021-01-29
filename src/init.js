import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
// import en from './locales/en.js';
import parser from './parser.js';
import view from './view.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const schema = yup.object().shape({
  rssLink: yup.string().url('Must be valid URL').nullable(),
});

const errorMessages = {
  network: {
    error: 'Network Problems. Try again.',
  },
};

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          // TODO shoul add texts
          feeds: {
            // title: state.rssFeeds,
            // description: state.rssFeeds,
          },
        },
      },
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
      errors: [],
    },
    rssFeeds: [],
    posts: [],
  };

  const watchedState = onChange(state, view(state.rssFeeds, state.posts));

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url');
    watchedState.form.fields.rssLink = link;
    const errors = validate(watchedState.form.fields);
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.errors = errors;

    if (Object.keys(errors).length === 0) {
      watchedState.form.valid = true;
    }

    watchedState.form.processState = 'sending';

    // TODO should make error
    // const addedUrls = watchedState.rssFeeds.map(({ url }) => console.log(url));
    watchedState.rssFeeds.forEach((feed) => {
      if (feed.url === link) {
        console.log('Rss already exists');
      }
    });

    console.log(state);
    axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(link)}`)
      .then((response) => {
        const doc = parser(response.data.contents);
        const feedTitle = doc.querySelector('title');
        const feedDescription = doc.querySelector('description');

        const newFeed = {
          id: Number(_.uniqueId()),
          title: feedTitle.textContent,
          description: feedDescription.textContent,
          url: link,
        };

        const items = doc.querySelectorAll('item');
        items.forEach((item) => {
          const postTitle = item.querySelector('title');
          const postDescription = item.querySelector('description');
          const postLink = item.querySelector('link');

          const neewPost = {
            id: Number(_.uniqueId()),
            title: postTitle.textContent,
            description: postDescription.textContent,
            link: postLink.textContent,
            listId: newFeed.id,
          };

          watchedState.posts.push(neewPost);
        });

        watchedState.rssFeeds.push(newFeed);

        console.log(state);

        watchedState.form.processState = 'finished';
      })
      .catch((error) => {
        watchedState.form.processError = errorMessages.network.error;
        watchedState.form.processState = 'failed';
        return error;
      });
  });
};
