// iphone6系の解像度を指標値として持つ。この値との倍率で切り取り範囲を考える。
let INDEX_WIDTH = 750;
let INDEX_HEIGHT = 1334;

let obj1 = document.getElementById("imgFile");

/**
 * ファイル変更時に呼び出されるイベント.
 */
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

  /**
   * ID読み込み時のコールバック.
   * @param result - 読み込み結果文字列. スマホの場合は9桁文字列が読み込まれているはず.
   * タブレットの場合は[13 123456789 1]のような感じでどこかに9桁文字列があるはず.
   * @param smartPhone - スマホか否か.
   */
  let resultCallbackID = function(result, smartPhone) {

    let text = "undef";

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
      text = "undef";
    }

    $("#view1").text($("#view1").text() + text)
  };

  /**
   * ID読み込み時の位置指定.
   * iphone6と同じ縦横比のものについてはスマホと判定し、同じ位置を読み込む.
   * タブレットの場合、高さは同じように算出できるが横の位置は特定できないため、画面右半分を読み込む.
   * @param img - 対象画像
   */
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

  /**
   * 総合値読み込み時のコールバック.
   * @param result - 読み込み結果文字列. スマホの場合は[123 456] [123,456]のように(カンマが読み込めるかは解像度次第)読み込まれているはず.
   * タブレットの場合は[13 123,456 1]のような感じでどこかに6桁以上の文字列があるはず.
   * @param smartPhone - スマホか否か.
   */
  let resultCallbackParam = function(result, smartPhone) {

    let text = "undef";

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

  /**
   * 総合値読み込み時の位置指定.
   * iphone6と同じ縦横比のものについてはスマホと判定し、同じ位置を読み込む.
   * タブレットの場合、高さは同じように算出できるが横の位置は特定できないため、画面左半分を読み込む.
   * @param img - 対象画像
   */
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
