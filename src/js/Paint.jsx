/**
 * 簡単なペイントアプリケーション
 *  ペイントチャットでの活用を考慮している．
 */
// CSSの定義を読み込む．
import '../css/Paint.css';

import { useState, useRef, useImperativeHandle, forwardRef } from 'react';

export const Paint = forwardRef(({
  // canvasの大きさのデフォルト値
  width = 300, height = 200,
  // canvasの描画コンテキストの指定
  lineCap = 'round',
  lineJoin = 'round',
  lineColor = '#ff0000', // penColorの初期値
  lineWidth = 1, // penSizeの初期値
  // ペイントチャットで使用する時，関数を指定する．
  drawLine, clearCanvas }, ref) => {

  // canvas要素へのref
  const canvasRef = useRef(null);
  // 最後に描いた線の終点（次に描く線の始点）
  const lastPosRef = useRef(null);
  // ペンの色
  const [penColor, setPenColor] = useState(lineColor);
  // ペンのサイズ
  const [penSize, setPenSize] = useState(lineWidth);

  // ペンの色を変更する．
  const changeColor = (event) => {
    setPenColor(event.target.value);
  };

  // ペンのサイズを変更する．
  const changePenSize = (event) => {
    setPenSize(event.target.value);
  };

  /// Canvasに線を描く
  // マウスイベントの座標をCanvas内の座標に変換する．
  const getCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const style = getComputedStyle(canvas);
    const bleft = parseFloat(style.borderLeftWidth);
    const btop = parseFloat(style.borderTopWidth);
    const pleft = parseFloat(style.paddingLeft);
    const ptop = parseFloat(style.paddingTop);
    const offsetX = rect.left + bleft + pleft;
    const offsetY = rect.top + btop + ptop;
    const posx = event.clientX - offsetX;
    const posy = event.clientY - offsetY;
    // Canvasが拡大・縮小表示されている場合の補正を行う．
    const bright = parseFloat(style.borderRightWidth);
    const bbottom = parseFloat(style.borderBottomWidth);
    const pright = parseFloat(style.paddingRight);
    const pbottom = parseFloat(style.paddingBottom);
    const x = posx * canvas.width / (rect.width - (bleft + bright + pleft + pright));
    const y = posy * canvas.height / (rect.height - (btop + bbottom + ptop + pbottom));
    return { x, y };
  };

  // mousedownのイベントリスナー
  const mousedown = (event) => {
    // 描画モードに入る．
    // canvas要素外にマウスが動くことも想定し，documentに対して，mousemoveとmouseupのイベントリスナーを設定する．
    document.addEventListener('mousemove', mousemove, false);
    document.addEventListener('mouseup', mouseup, false);
    // ブラウザによってはテキスト選択が始まるのを防ぐ．
    event.preventDefault();
    // マウスが押された座標を記録しておく．
    const pos = getCoords(event);
    lastPosRef.current = pos;
  };

  // mousemoveのイベントリスナー
  const mousemove = (event) => {
    const pos = getCoords(event);
    // lastPosから現在のマウスの位置まで線を描く．
    drawLine(
      lastPosRef.current.x,
      lastPosRef.current.y,
      pos.x,
      pos.y,
      penColor,
      penSize
    );
    // lastPosを更新する．
    lastPosRef.current = pos;
  };

  // mouseupのイベントリスナー
  const mouseup = () => {
    // mousemoveとmouseupのイベントリスナーを削除し，描画モードを抜ける．
    document.removeEventListener('mousemove', mousemove, false);
    document.removeEventListener('mouseup', mouseup, false);
  };

  // (x0, y0) から (x1, y1)まで線を描く．
  const drawLineInternal = (x0, y0, x1, y1, color, size) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();
  };

  // drawLineが指定されていない時は，drawLineInternalに設定する．
  if (!drawLine) {
    drawLine = drawLineInternal;
  }

  /// Canvasのクリア
  const clearCanvasInternal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // clearCanvasが指定されていない時は，clearCanvasInternalに設定する．
  if (!clearCanvas) {
    clearCanvas = clearCanvasInternal;
  }

  /// コンポーネントの外から呼び出せるメソッドを定義する．
  // drawLineとclearCanvasを対象とする
  useImperativeHandle(ref, () => {
    return {
      drawLine: drawLineInternal,
      clearCanvas: clearCanvasInternal
    };
  }, []);

  // 画像の取得
  const getImageDataURL = () => {
    return canvasRef.current.toDataURL();
  };
  // 画像の設定
  const putImageDataURL = (dataURL) => {
    const image = new Image();
    image.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(image, 0, 0);
    };
    image.src = dataURL;
  };

  // コンポーネントの外から呼び出せるメソッドを定義する．
  useImperativeHandle(ref, () => {
    return {
      drawLine: drawLineInternal,
      clearCanvas: clearCanvasInternal,
      getImageDataURL: getImageDataURL,
      putImageDataURL: putImageDataURL
    };
  }, []);

  return (
    <div className="paint">
      <canvas ref={canvasRef} onMouseDown={mousedown} width={width} height={height} />
      <div className="paint-control">
        <label>
          色
          <input type="color" value={penColor} onChange={changeColor} />
        </label>
        <label>
          ペンサイズ
          <input type="number" min={1} max={9}
            onChange={changePenSize} value={penSize} />
        </label>
        <button type="button" onClick={clearCanvas}>
          クリア
        </button>
      </div>
    </div>
  );
});
