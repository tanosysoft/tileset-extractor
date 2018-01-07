module.exports = url => new Promise((res, rej) => {
  let img = new Image();
  img.src = url;

  img.addEventListener('load', () => {
    img.isLoaded = true;
    res(img);
  });

  img.addEventListener('error', ev => rej(ev));
});
