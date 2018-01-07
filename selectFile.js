let readAsDataUrl = require('./readAsDataUrl');

module.exports = cb => {
  let input = document.createElement('input');

  input.type = 'file';
  input.style.display = 'none';

  input.addEventListener('change', ev => {
    let file = input.files[0];

    readAsDataUrl(file).then(url => {
      input.remove();
      cb(url);
    })
    .catch(err => {
      input.remove();
      console.error(err);
    });
  });

  document.body.appendChild(input);
  input.click();
};
