import _ from 'lodash';
import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
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
  const state = {
    form: {
      processState: 'filling',
      processError: null,
      fields: {
        rssLink: '',
      },
      valid: true,
      errors: {},
    },
    rssFeeds: [],
    posts: [],
  };

  const watchedState = onChange(state, view);

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
    console.log(state);
    console.log(link);
    axios.get(link)
      .then(() => {
        // console.log(res.data);
        watchedState.form.processState = 'finished';
        fetch(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(link)}`)
          .then((response) => {
            if (response.ok) return response.json();
            throw new Error('Network response was not ok.');
          })
          .then((data) => console.log(data.contents));
        // return res;
      })
      .catch((error) => {
        watchedState.form.processError = errorMessages.network.error;
        watchedState.form.processState = 'failed';
        return error;
      });
  });
};
