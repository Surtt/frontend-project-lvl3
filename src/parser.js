export default (response) => {
  const parser = new DOMParser();
  return parser.parseFromString(response, 'application/xml');
};
