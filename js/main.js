(function (window) {
  window.onload = () => {
    const MIN_SCALE = 20;
    const MAX_SCALE = 200;
    class DrawingBoard {
      constructor() {
        this.range = document.getElementById('range');
        this.rangeVal = document.getElementById('range_val');
        this.canvas = document.getElementById("canvas");
        this.selectSize = document.getElementById('select_size');
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
        const rect = this.resize();
        this.resizeOffscreen(rect);
        this.initEvent();
        this.initRange();
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
      }

      initRange() {
        this.range.addEventListener('input', e => {
          this.scale = Number(e.target.value);
          this.rangeVal.innerText = `${e.target.value}%`;
          this.render();
        });
      }

      initEvent() {
        let evenFlag = false;
        /** 用于记录move时的位移 */
        const mousePoint = {x: 0,y: 0};
        const down = (e) => {
          evenFlag = true;
          mousePoint.x = e.offsetX;
          mousePoint.y = e.offsetY;
        }
        const move = (e) => {
          if (evenFlag) {
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
          evenFlag = false;
          mousePoint.x = 0;
          mousePoint.y = 0;
        }
        // TODO: 移动+缩放
        const wheel = (e) => {
          const {deltaX, deltaY, offsetX, offsetY, ctrlKey, metaKey, deltaMode} = e;
          e.preventDefault(); // 阻止浏览器的缩放行为
          e.stopPropagation(); // 无需冒泡

          if (ctrlKey || metaKey) {
            const scaleFactor = Math.ceil(Math.abs(deltaY) / 10);
            if (deltaY > 0) {
              // 缩小
              if (this.scale > MIN_SCALE && this.scale - scaleFactor >= MIN_SCALE) {
                this.scale -= scaleFactor;
              }
            } else {
              // 放大
              if (this.scale < MAX_SCALE && this.scale + scaleFactor <= MAX_SCALE) {
                this.scale += scaleFactor;
              }
            }
            this.range.value = this.scale;
            this.rangeVal.innerText = `${this.scale}%`;
            const dx = offsetX * this.dpr - this.renderPosition.x;
            const dy = offsetY * this.dpr - this.renderPosition.y;
            const x = dx - dx * this.Scale;
            const y = dy - dy * this.Scale;
            this.renderPositionFormScale.x = x;
            this.renderPositionFormScale.y = y;
            this.render();
          } else {
            // 更新 image 偏移
            this.renderPosition.x -= deltaX;
            this.renderPosition.y -= deltaY;
            this.render();
          }
        }

        this.canvas.addEventListener("mousedown", down);
        this.canvas.addEventListener('touchstart', down);
        this.canvas.addEventListener("mousemove", move);
        this.canvas.addEventListener('touchmove', move);
        this.canvas.addEventListener("wheel", wheel); /// 应该用于scroll;
        this.canvas.addEventListener("mouseup", up);
        // canvas.addEventListener('mouseover', up);
        this.canvas.addEventListener('touchend', up);


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
        this.context.font = "48px serif";
        const offset = this.context.measureText(txt);
        this.context.fillText(txt, this.canvasWidth / 2 - offset.width / 2, this.canvasHeight / 2);
      }

      render() {
        this.clear();
        this.context.save();
        const scale = this.Scale;
        const { x, y } = this.renderPosition;
        const { x: scaleX, y: scaleY } = this.renderPositionFormScale;
        this.context.translate(x + scaleX, y + scaleY);
        this.context.scale(scale, scale);
        this.context.drawImage(
          this.offscreenCanvas,
          0, 0, this.offscreenCanvasWidth, this.offscreenCanvasHeight,
          0, 0, this.offscreenCanvasWidth, this.offscreenCanvasHeight,
        );
        this.context.restore();
        this.cutRect(this.showRect);
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
        drawingBoard.resetCanvas();
        const { context, offscreenCanvas, offscreenContext } = drawingBoard;
        drawingBoard.clear();
        // save
        const width = img.width;
        const height = img.height;
        drawingBoard.resizeOffscreen({ width, height });
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
          console.log('file', file);
          if (file.type.match("image.*")) {
            reader.readAsDataURL(file);
          }
        }
      });
      uploadFile.addEventListener('change', (e) => {
        console.log('file input', e.target.files);
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          console.log('file', file);
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
        console.log('db click');
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
