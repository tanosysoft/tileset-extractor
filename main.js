let analyze = require('./analyze');
let imgFromUrl = require('./imgFromUrl');
let selectFile = require('./selectFile');
let { $, $$ } = require('./makeItRain');

let extractTileset = () => {
  let img = $('.srcImg');

  if (!img.isLoaded) {
    alert(`You must select an image first.`);
    return;
  }

  let enableBtns = enabled => {
    for (let btn of $$('button')) {
      btn.disabled = !enabled;
    }
  };

  enableBtns(false);

  analyze(img)
    .then(analysis => {
      enableBtns(true);
      console.log(analysis);
    })
    .catch(err => {
      enableBtns(true);
      console.error(err);
    });
};

document.addEventListener('DOMContentLoaded', () => {
  $('.srcImgSelectBtn').addEventListener('click', () => {
    selectFile(dataUrl => {
      imgFromUrl(dataUrl).then(img => {
        img.classList.add('srcImg');

        let oldImg = $('.srcImg');
        oldImg.parentElement.replaceChild(img, oldImg);
      })
      .catch(err => console.error(err));
    });
  });

  $('.extractBtn').addEventListener('click', () => {
    extractTileset();
  });
});
