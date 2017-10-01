// iphone6系の解像度を指標値として持つ。この値との倍率で切り取り範囲を考える。
let INDEX_WIDTH = 750;
let INDEX_HEIGHT = 1334;

let obj1 = document.getElementById("imgFile");

obj1.addEventListener("change", function(evt) {
  let file = evt.target.files;
  let reader = new FileReader();

  reader.readAsDataURL(file[0]);

  reader.onload = function() {
    let dataUrl = reader.result;
    analysisImg(dataUrl)
  }
}, false);

function analysisImg(imgSrc) {
  $("#view1").text("ID : ")
  $("#view2").text("総合値 : ")

  let resultCallbackID = function(result, smartPhone) {

    let text = "";

    if (!smartPhone) {
      for (str of result.text.trim().split(" ")) {
        if (str.length == 9) {
          text = str;
        }
      }
    } else {
      text = result.text.trim();
    }

    if (text.length != 9) {
      text = "0";
    }

    $("#view1").text($("#view1").text() + text)
  };

  let positionID = function(img) {
    let hScale = img.height / INDEX_HEIGHT;
    let wScale = img.width / INDEX_WIDTH;

    // for smartPhone
    if (roundAtPointOne(hScale) == roundAtPointOne(wScale)) {
      return {
        smartPhone: true,
        idTop: 130 * hScale,
        idBottom: 165 * hScale,
        idLeft: 470 * wScale,
        idWidth: 645 * wScale
      }
    }

    // for tablet
    return {
      smartPhone: false,
      idTop: 130 * hScale,
      idBottom: 165 * hScale,
      idLeft: img.width / 2,
      idWidth: img.width
    }
  }

  analysis(imgSrc, positionID, resultCallbackID)

  let resultCallbackParam = function(result, smartPhone) {

    let text = "";

    if (!smartPhone) {
      for (str of result.text.trim().split(" ")) {
        if (str.length >= 6) {
          text = str.replace(",", "");
        }
      }
    } else {
      text = result.text.trim().replace(" ", "")
    }

    $("#view2").text($("#view2").text() + text)
  };

  let positionParam = function(img) {
    let hScale = img.height / INDEX_HEIGHT;
    let wScale = img.width / INDEX_WIDTH;

    // for smartPhone
    if (roundAtPointOne(hScale) == roundAtPointOne(wScale)) {
      return {
        smartPhone: true,
        idTop: 340 * hScale,
        idBottom: 375 * hScale,
        idLeft: 165 * wScale,
        idWidth: 330 * wScale
      }
    }

    // for tablet
    return {
      smartPhone: false,
      idTop: 340 * hScale,
      idBottom: 375 * hScale,
      idLeft: 0,
      idWidth: img.width / 2
    }
  }

  analysis(imgSrc, positionParam, resultCallbackParam)
}

function roundAtPointOne(num) {

  return Math.round(num * 10) / 10;
}

function analysis(src, positionCallBack, resultCallbackID) {

  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");

  canvas.width = INDEX_WIDTH;
  let img = new Image();

  img.src = src;


  img.onload = function() {

    let position = positionCallBack(img)
    let height = position.idBottom - position.idTop;
    let width = position.idWidth - position.idLeft;
    ctx.drawImage(img, position.idLeft, position.idTop, width, height, 0, 0, width, height);
    $('body').append(canvas);
    tesser(canvas.toDataURL(), resultCallbackID, position.smartPhone);
  };
}

function tesser(url, callback, smartPhone) {
  Tesseract
    .recognize(url, {
      tessedit_char_whitelist: "1234567890,"
    })
    .progress(function(p) {
      // 進歩状況の表示
      // console.log("progress", p)
    })
    // 結果のコールバック
    .then(function(result) {
      callback(result, smartPhone);
    });

}
