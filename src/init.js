import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import en from './locales/en.js';
import parser from './parser.js';
import view from './view.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const errorMessages = {
  network: {
    error: 'Network Problems. Try again.',
  },
};

const validate = (urls, fields) => {
  let errors = {};
  const schema = yup.string().url().notOneOf(urls);

  try {
    schema.validateSync(fields);
  } catch (e) {
    errors = { ...errors, e };
  }

  return errors;
};

const addFeed = (state, feed) => {
  console.log(feed);
  const { feedTitle, feedDescription, posts } = feed;
  const url = state.form.fields.rssLink;

  const feedId = Number(_.uniqueId());

  const newFeed = {
    feedId,
    feedTitle,
    feedDescription,
    url,
  };

  // const neewPost = {
  //   id: Number(_.uniqueId()),
  //   title: postTitle.textContent,
  //   description: postDescription.textContent,
  //   link: postLink.textContent,
  //   listId: newFeed.id,
  // };
  state.rssFeeds.unshift(newFeed);
  posts.forEach((post) => {
    console.log(post);
    const newPost = { ...post, feedId };
    state.posts.unshift(newPost);
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
    watchedState.form.processState = 'filling';

    const addedUrls = watchedState.rssFeeds.map(({ url }) => url);
    const errors = validate(addedUrls, watchedState.form.fields.rssLink);
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.errors = errors;

    if (Object.keys(errors).length === 0) {
      watchedState.form.valid = true;
      watchedState.form.processState = 'sending';

      console.log(state);
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(link)}`)
        .then((response) => {
          // const doc = parser(response.data.contents);
          // console.log(doc);
          // const feedTitle = doc.querySelector('title');
          // const feedDescription = doc.querySelector('description');

          // const newFeed = {
          //   id: Number(_.uniqueId()),
          //   title: feedTitle.textContent,
          //   description: feedDescription.textContent,
          //   url: link,
          // };
          // console.log(response.data.contents);
          addFeed(watchedState, parser(response.data.contents));

          // const items = doc.querySelectorAll('item');
          // items.forEach((item) => {
          //   const postTitle = item.querySelector('title');
          //   const postDescription = item.querySelector('description');
          //   const postLink = item.querySelector('link');

          //   const neewPost = {
          //     id: Number(_.uniqueId()),
          //     title: postTitle.textContent,
          //     description: postDescription.textContent,
          //     link: postLink.textContent,
          //     listId: newFeed.id,
          //   };

          //   watchedState.posts.push(neewPost);
          // });

          // watchedState.rssFeeds.push(newFeed);

          console.log(state);

          watchedState.form.processState = 'finished';
        })
        .catch((error) => {
          watchedState.form.processError = errorMessages.network.error;
          watchedState.form.processState = 'failed';
          return error;
        });
    }
  });
};
