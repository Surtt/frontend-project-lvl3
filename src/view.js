const processStateHandle = (processState) => {
  switch (processState) {
    case 'failed':
      console.log(processState);
      break;
    case 'filling':
      console.log(processState);
      break;
    case 'sanding':
      console.log(processState);
      break;
    case 'finished':
      console.log(processState);
      break;
    default:
      break;
  }
};

const input = document.querySelector('input');
const errorElement = document.querySelector('.feedback');

const renderErrors = (element, error) => {
  if (Object.keys(error).length === 0) {
    return;
  }
  const { message } = error.rssLink;
  element.classList.add('is-invalid');
  errorElement.classList.add('text-danger');
  errorElement.textContent = message;
  console.log(message);
};

const renderValid = () => {
  input.classList.remove('is-invalid');
  errorElement.classList.remove('text-danger');
  errorElement.textContent = '';
};

export default (path, value) => {
  switch (path) {
    case 'form.processState':
      processStateHandle(value);
      console.log(value);
      break;
    case 'form.valid':
      console.log(value);
      renderValid();
      break;
    case 'form.errors':
      renderErrors(input, value);
      break;
    default:
      break;
  }
};
