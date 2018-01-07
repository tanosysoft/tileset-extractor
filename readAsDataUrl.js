module.exports = file => {
  let r = new FileReader();

  return new Promise((res, rej) => {
    r.addEventListener('error', err => rej(err));
    r.addEventListener('load', () => res(r.result), false);

    r.readAsDataURL(file);
  });
};
