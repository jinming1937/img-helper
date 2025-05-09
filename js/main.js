(function (window) {
  window.onload = () => {
    const MIN_SCALE = 20;
    const MAX_SCALE = 200;
    class DrawingBoard {
      constructor() {
        this.range = document.getElementById('range');
        this.sizeRateDom = document.getElementById("size_rate");
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
        const rect = this.resize();
        this.resizeOffscreen(rect);
        this.initEvent();
        this.initRnage();
      }

      get Scale() {
        return this.scale / 100;
      }

      resetCanvas() {
        this.range.value = 100;
        this.scale = 100;
        this.renderPosition.x = 0;
        this.renderPosition.y = 0;
        this.selectSize.value = 0;
        this.showRect = false;
      }

      initRnage() {
        this.range.addEventListener('input', e => {
          this.scale = Number(e.target.value);
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
            // this.showPosition();
          }
        }

        const up = (e) => {
          evenFlag = false;
          mousePoint.x = 0;
          mousePoint.y = 0;
        }

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
            const x = offsetX - offsetX * this.Scale;
            const y = offsetY - offsetY * this.Scale;
            this.renderPosition.x = Math.floor(x * this.dpr);
            this.renderPosition.y = Math.floor(y * this.dpr);
            this.render();
          } else {
            // 更新 image 偏移
            this.renderPosition.x -= deltaX;
            this.renderPosition.y -= deltaY;
            this.render();
          }
          this.showPosition();
        }

        this.canvas.addEventListener("mousedown", down);
        this.canvas.addEventListener("touchstart", down);
        this.canvas.addEventListener("mousemove", move);
        this.canvas.addEventListener("touchmove", move);
        this.canvas.addEventListener("wheel", wheel);
        this.canvas.addEventListener("mouseup", up);
        // canvas.addEventListener('mouseover', up);
        this.canvas.addEventListener("touchend", up);


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
        exportImg.addEventListener('click', () => {
          const { x, y, width, height } = this.exportPosition;
          const imageData = this.context.getImageData(x, y, width * this.dpr, height * this.dpr);
          
          const offline = new OffscreenCanvas(width * this.dpr, height * this.dpr);
          const offContext = offline.getContext('2d');
          offContext.putImageData(imageData, 0, 0);

          const canView = document.createElement('canvas');
          canView.width = width;
          canView.height = height;
          const ctx = canView.getContext('2d');
          ctx.drawImage(offline, 0, 0, width * this.dpr, height * this.dpr, 0, 0, width, height);

          const dataURL = canView.toDataURL('image/png');
          const link = document.createElement('a');
          // 将 DataURL 赋值给 <a> 元素的 href 属性
          link.href = dataURL;
          // 设置下载的文件名
          link.download = 'signature.png';
          // 将签名图片元素的 src 属性设置为画布内容的 DataURL
          // signatureImage.src = canView.toDataURL('image/png');
          // 触发 <a> 元素的点击事件，以便下载图片
          link.click();
        });
      }

      showPosition() {
        this.sizeRateDom.value = `rate:${Math.ceil(this.Scale * 100)},x:${Math.floor(this.renderPosition.x)},y:${Math.floor(this.renderPosition.y)}`;
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
        this.context.translate(x, y);
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
      drawingBoard.drawText("拖拽/粘贴图片上传...."); // 默认文案

      const dropzone = document.getElementById("dropzone");
      const sizeDom = document.getElementById("size");

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
        const { canvas, context, offscreenCanvas, offscreenContext } = drawingBoard;
        drawingBoard.clear();
        // save
        const width = img.width * 2;
        const height = img.height * 2;
        drawingBoard.resizeOffscreen({ width, height });
        // img 放大2倍，放入离屏canvas
        offscreenContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);

        // 不缩放, 画到主屏上
        context.drawImage(
          offscreenCanvas,
          0, 0, width, height,
          0, 0, width, height,
        );
        sizeDom.value = `img:${img.width}x${img.height},canvas:${canvas.width}x${canvas.height}`;
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
      })
    }
    main();
  };
})(window);
