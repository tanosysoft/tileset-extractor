let md5 = require('spark-md5');

let isInteger = x => x % 1 === 0;

module.exports = (img, options = {}) =>
  new Promise((res, rej) => {
    let tileSize = options.tileSize || 32;
    let tilesPerFrame = options.tilesPerFrame || 4;

    let ret = {
      tileSize,
      width: img.width,
      height: img.height,
      widthInTiles: img.width / tileSize,
      heightInTiles: img.height / tileSize,
      areaInTiles: null,
      tilesByCoords: {},
      tilesByHash: {},
    };

    ret.areaInTiles = ret.widthInTiles * ret.heightInTiles;

    if (
      !isInteger(ret.widthInTiles)
      || !isInteger(ret.heightInTiles)
    ) {
      throw new Error(
        `Map width and height must be multiples of ` +
        `tile size`
      );
    }

    if (!ret.areaInTiles) {
      return res(ret);
    }

    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let i = 0;

    requestAnimationFrame(function frame() {
      try {
        console.log(
          `Hashing tile`, i, `of`, ret.areaInTiles
        );

        for (let j = 0; j < tilesPerFrame; ++j) {
          let x = i % ret.widthInTiles;
          let y = Math.floor(i / ret.widthInTiles);

          let tileImgData = ctx.getImageData(
            x * tileSize,
            y * tileSize,
            tileSize,
            tileSize
          );

          let hash = md5.ArrayBuffer.hash(
            tileImgData.data
          );

          ret.tilesByCoords[`${x}/${y}`] = { hash };
          ret.tilesByHash[hash] = { x, y };

          if (++i >= ret.areaInTiles) {
            return res(ret);
          }
        }

        requestAnimationFrame(frame);
      }
      catch(err) {
        rej(err);
      }
    });
  });
