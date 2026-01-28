(function (window) {
  window.onload = () => {

    function isUserMobile() {
      const ua = navigator.userAgent.toLowerCase();
      return /mobile|android|iphone|ipod|phone|ipad/i.test(ua);
    }
    const MIN_SCALE = 20;
    const MAX_SCALE = 200;
    class DrawingBoard {
      constructor() {
        this.range = document.getElementById('range');
        this.rangeVal = document.getElementById('range_val');
        this.canvas = document.getElementById("canvas");
        this.selectSize = document.getElementById('select_size');
        this.rotateBtn = document.getElementById('rotate');
        this.context = this.canvas.getContext("2d");
        this.offscreenCanvas = new OffscreenCanvas(256, 256);
        this.offscreenContext = this.offscreenCanvas.getContext("2d");
        this.dpr = Math.floor(window.devicePixelRatio) || 2;
        // 如果dpr是1的话，建议改成2
        this.scale = 100;
        this.showRect = false;
        this.exportPosition = {
          x: 0,
          y: 0,
          width: 400,
          height: 300,
        };
        /** 绘制原点：控制平移 */
        this.renderPosition = {x: 0, y: 0};
        /** 绘制原点：控制缩放 */
        this.renderPositionFormScale = { x: 0, y: 0 };

        this.baseX = 0;
        this.baseY = 0;
        this.baseScale = 100;

        this.rotateAngle = 0;

        this.actionList = [];
        const rect = this.resize();
        this.resizeOffscreen(rect);
        this.initEvent();
      }

      get Scale() {
        return this.scale / 100;
      }

      resetCanvas() {
        this.range.value = 100;
        this.scale = 100;
        this.renderPosition.x = 0;
        this.renderPosition.y = 0;
        this.renderPositionFormScale.x = 0;
        this.renderPositionFormScale.y = 0;
        this.selectSize.value = 0;
        this.showRect = false;
        this.rotateAngle = 0;
      }

      initEvent() {
        let evenFlag = false;
        /** 用于记录move时的位移 */
        const mousePoint = {x: 0,y: 0};
        const down = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          evenFlag = true;
          mousePoint.x = e.offsetX;
          mousePoint.y = e.offsetY;
          // this.actionList.push({x: e.offsetX * this.dpr, y: e.offsetY * this.dpr });
          // this.render();
        }
        const move = (e) => {
          if (evenFlag) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const { offsetX, offsetY } = e;
            const changeX = (offsetX - mousePoint.x) * this.dpr;
            const changeY = (offsetY - mousePoint.y) * this.dpr;
            // 本次移动带来的
            this.renderPosition.x += changeX;
            this.renderPosition.y += changeY;
            // 更新mouse偏移
            mousePoint.x = offsetX;
            mousePoint.y = offsetY;
            this.render();
          }
        }

        const up = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          evenFlag = false;
          mousePoint.x = 0;
          mousePoint.y = 0;
        }
        const touchStart = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          evenFlag = true;
          mousePoint.x = e.touches[0].clientX;
          mousePoint.y = e.touches[0].clientY;
        }
        const touchMove = (e) => {
          if (evenFlag) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const { clientX, clientY } = e.touches[0];
            const changeX = (clientX - mousePoint.x) * this.dpr;
            const changeY = (clientY - mousePoint.y) * this.dpr;
            // 本次移动带来的
            this.renderPosition.x += changeX;
            this.renderPosition.y += changeY;
            // 更新mouse偏移
            mousePoint.x = clientX;
            mousePoint.y = clientY;
            this.render();
          }
        }
        const previousOffset = {
          x: NaN,
          y: NaN,
        }
        this.range.addEventListener('input', e => {
          if (isUserMobile()) {
            // previousOffset.x = this.canvasWidth / 2;
            // previousOffset.y = this.canvasHeight / 2;

            this.setScaleMove(this.canvasWidth / this.dpr / 2, this.canvasHeight / this.dpr / 2, previousOffset, this.scale, Number(e.target.value));
          }
          this.scale = Number(e.target.value);
          this.rangeVal.innerText = `${e.target.value}%`;
          this.render();
        });
        // TODO: 移动+缩放
        const wheel = (e) => {
          const {deltaX, deltaY, offsetX, offsetY, ctrlKey, metaKey, deltaMode} = e;
          // e.preventDefault(); // 阻止浏览器的缩放行为
          e.stopImmediatePropagation(); // 阻止冒泡和其他监听器

          if (ctrlKey || metaKey) {
            const scaleFactor = Math.ceil(Math.abs(deltaY) / 10);
            if (deltaY > 0) {
              // 缩小
              if (scaleFactor !== 0 && this.scale > MIN_SCALE && this.scale - scaleFactor >= MIN_SCALE) {
                this.setScaleMove(offsetX, offsetY, previousOffset, this.scale, this.scale - scaleFactor);
                this.scale -= scaleFactor;
                this.range.value = this.scale;
                this.rangeVal.innerText = `${this.scale}%`;
                previousOffset.x = offsetX;
                previousOffset.y = offsetY;
                this.render();
              }
            } else {
              // 放大
              if (scaleFactor !== 0 && this.scale < MAX_SCALE && this.scale + scaleFactor <= MAX_SCALE) {
                this.setScaleMove(offsetX, offsetY, previousOffset, this.scale, this.scale + scaleFactor);
                this.scale += scaleFactor;
                this.range.value = this.scale;
                this.rangeVal.innerText = `${this.scale}%`;
                previousOffset.x = offsetX;
                previousOffset.y = offsetY;
                this.render();
              }
            }
          } else {
            // 更新 image 偏移
            this.renderPosition.x -= deltaX;
            this.renderPosition.y -= deltaY;
            this.render();
          }
        }

        this.canvas.addEventListener("mousedown", down);
        this.canvas.addEventListener("mousemove", move);
        this.canvas.addEventListener("wheel", wheel); /// 应该用于scroll;
        this.canvas.addEventListener("mouseup", up);
        // canvas.addEventListener('mouseover', up);
        // 移动端
        this.canvas.addEventListener('touchstart', touchStart, { passive: false });
        this.canvas.addEventListener('touchmove', touchMove, { passive: false });
        this.canvas.addEventListener('touchend', up, { passive: false });

        this.rotateBtn.addEventListener('click', () => {
          if (this.rotateAngle === 270) {
            this.rotateAngle = 0;
          } else {
            this.rotateAngle += 90;
          }
          this.render();
        });

        this.selectSize.addEventListener('change', e => {
          const val = e.target.value;
          if (val && val.split('x').length === 2) {
            const [width, height] = val.split('x');
            this.showRect = true;
            this.exportPosition.width = Number(width);
            this.exportPosition.height = Number(height);
            this.exportPosition.x = this.canvasWidth / 2 - (this.exportPosition.width * this.dpr / 2); // 400
            this.exportPosition.y = this.canvasHeight / 2 - (this.exportPosition.height * this.dpr / 2);
            this.render();
          } else {
            this.showRect = false;
          }
        });

        const exportImg = document.getElementById('export');
        const offline = new OffscreenCanvas(400 * this.dpr, 300 * this.dpr);
        const offContext = offline.getContext('2d');

        const canView = document.createElement('canvas');
        const ctx = canView.getContext('2d');
        exportImg.addEventListener('click', () => {
          if(!this.showRect) {
            alert('请选择截图尺寸');
            return;
          }
          const { x, y, width, height } = this.exportPosition;
          const exportWidth = width * this.dpr;
          const exportHeight = height * this.dpr;
          const imageData = this.context.getImageData(x, y, exportWidth, exportHeight);
          offline.width = exportWidth;
          offline.height = exportHeight;
          offContext.putImageData(imageData, 0, 0);

          canView.width = width;
          canView.height = height;
          ctx.drawImage(offline, 0, 0, exportWidth, exportHeight, 0, 0, width, height);

          const link = document.createElement('a');
          // 将 DataURL 赋值给 <a> 元素的 href 属性
          link.href = canView.toDataURL('image/png');
          // 设置下载的文件名
          link.download = `img-${this.selectSize.value}-${Date.now()}.png`;
          // 将签名图片元素的 src 属性设置为画布内容的 DataURL
          // signatureImage.src = canView.toDataURL('image/png');
          // 触发 <a> 元素的点击事件，以便下载图片
          link.click();
        });
      }

      setScaleMove(offsetX, offsetY, previousOffset, previousScale, afterScale) {
        let originPositionX = this.renderPosition.x,
            originPositionY = this.renderPosition.y;

        // 更丝滑
        if (!isNaN(previousOffset.x) && previousOffset.x !== offsetX) {
          this.baseX = this.renderPositionFormScale.x;
          this.baseScale = previousScale;
        }
        if (!isNaN(previousOffset.y) && previousOffset.y !== offsetY) {
          this.baseY = this.renderPositionFormScale.y;
          this.baseScale = previousScale;
        }
        // 转换成向量 [dx, dy]
        const dx = offsetX * this.dpr - originPositionX - this.baseX;
        const dy = offsetY * this.dpr - originPositionY - this.baseY;
        // 缩小
        const x = dx * (1 - afterScale / this.baseScale);
        const y = dy * (1 - afterScale / this.baseScale);
        // 向量平移
        this.renderPositionFormScale.x = Math.floor(x + this.baseX);
        this.renderPositionFormScale.y = Math.floor(y + this.baseY);
      }

      cutRect(showRect) {
        if (showRect) {
          const { x, y, width, height } = this.exportPosition;
          this.context.save();
          this.context.beginPath();
          this.context.moveTo(x, y);
          // 1 * this.dpr
          this.context.rect(x - this.dpr, y - this.dpr, width * this.dpr + 2 * this.dpr, height * this.dpr + 2 * this.dpr);
          this.context.strokeStyle = '#F00';
          this.context.lineWidth = this.dpr;
          this.context.stroke();
          this.context.restore();
        }
      }

      resize() {
        const rect = this.canvas.getBoundingClientRect(); // css 大小
        const width = Math.floor(rect.width) * this.dpr; // SSAA
        const height = Math.floor(rect.height) * this.dpr; // SSAA
        this.setSize({ width, height });
        return { width, height };
      }

      setSize({ width, height }) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvasWidth = width;
        this.canvasHeight = height;
      }

      resizeOffscreen({ width, height }) {
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
        this.offscreenCanvasWidth = width;
        this.offscreenCanvasHeight = height;
      }

      clear() {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      }

      drawText(txt) {
        this.context.save();
        this.context.font = "48px serif";
        const offset = this.context.measureText(txt);
        this.context.fillText(txt, this.canvasWidth / 2 - offset.width / 2, this.canvasHeight / 2);
        this.context.restore();
      }

      render() {
        this.clear();
        this.context.save();
        const scale = this.Scale;
        const { x, y } = this.renderPosition;
        const { x: scaleX, y: scaleY } = this.renderPositionFormScale;
        this.context.translate(x + scaleX, y + scaleY);
        this.context.scale(scale, scale);

        if (this.rotateAngle !== 0) {
          this.context.translate(this.offscreenCanvasWidth / 2, this.offscreenCanvasHeight / 2);
          this.context.rotate(this.rotateAngle * Math.PI / 180);
          this.context.translate(- this.offscreenCanvasWidth / 2, - this.offscreenCanvasHeight / 2);
        }
        
        this.context.drawImage(
          this.offscreenCanvas,
          0, 0, this.offscreenCanvasWidth, this.offscreenCanvasHeight,
          0, 0, this.offscreenCanvasWidth, this.offscreenCanvasHeight,
        );
        this.context.restore();
        this.cutRect(this.showRect);

        // this.actionList.forEach(({x, y}) => {
        //   this.renderLine(x, y);
        // });
      }
      renderLine(x, y) {
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(0, y);
        this.context.lineTo(this.canvasWidth, y);
        this.context.moveTo(x, 0);
        this.context.lineTo(x, this.canvasHeight);
        this.context.font = '26px serif';
        this.context.fillText(`(${x},${y})`, x, y);
        this.context.strokeStyle = '#F00';
        this.context.lineWidth = this.dpr;
        this.context.stroke();
        this.context.restore();
      }
    }

    function main() {
      const drawingBoard = new DrawingBoard();

      const dropzone = document.getElementById("dropzone");
      const uploadFile = document.getElementById('upload_file');

      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const reader = new FileReader();
      const img = new Image();

      reader.onload = (e) => {
        img.src = e.target.result;
      };
      img.onload = () => {
        const { context, offscreenCanvas, offscreenContext } = drawingBoard;
        drawingBoard.resetCanvas();
        drawingBoard.clear();
        // save
        const width = img.width;
        const height = img.height;
        drawingBoard.resizeOffscreen({ width, height });
        // TODO: 多图片支持 && 多图片选择 && 单张缩放旋转处理
        offscreenContext.drawImage(img, 0, 0, width, height, 0, 0, width, height);
        // 不缩放, 画到主屏上
        context.drawImage(offscreenCanvas, 0, 0, width, height, 0, 0, width, height);
      };
      // 阻止默认的拖放行为
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropzone.addEventListener(eventName, preventDefaults, false);
      });

      // 当有文件被拖入时添加样式
      dropzone.addEventListener("dragenter", () => {
        dropzone.classList.add("dragover");
      });

      // 当文件离开时移除样式
      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      // 处理文件拖放事件
      dropzone.addEventListener("drop", (e) => {
        dropzone.classList.remove("dragover");
        const files = e.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.match("image.*")) {
            reader.readAsDataURL(file);
          }
        }
      });
      uploadFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          // 是一张图片
          if (file.type.match("image.*")) {
            reader.readAsDataURL(file);
          }
        }
      });
      // 粘贴
      document.addEventListener('paste', (e) => {
        if (e.clipboardData) {
          const {types, items, files} = e.clipboardData;
          if (types.length > 0 && items.length > 0 && files.length > 0) {
            const file = files[0];
            // 是一张图片
            if (file.type.match("image.*")) {
              reader.readAsDataURL(file);
            }
          }
        }
      });
      document.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      if (window.innerWidth <= 400) {
        document.getElementById('file_upload_box').classList.remove('hide');
        drawingBoard.drawText("上传图片...."); // 默认文案
      } else {
        drawingBoard.drawText("拖拽/粘贴图片上传...."); // 默认文案
      }
    }
    main();
  };
})(window);
