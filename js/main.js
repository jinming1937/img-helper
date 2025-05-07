(function (window) {
  window.onload = () => {
    const MIN_SCALE = 20;
    const MAX_SCALE = 200;
    class DrawingBoard {
      constructor() {
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.offscreenCanvas = new OffscreenCanvas(256, 256);
        this.offscreenContext = this.offscreenCanvas.getContext("2d");
        this.dpr = window.devicePixelRatio || 2;
        this.scale = 100;
        this.showRect = false;
        this.exportPosition = {
          x: 0,
          y: 0,
          width: 400,
          height: 300,
        }
        this.imageOffset = {
          x: 0,
          y: 0,
        }
        const rect = this.resize();
        this.resizeOffscreen(rect);
        this.initEvent();
      }

      initEvent() {
        let evenFlag = false;
        let mousePoint = {
          x: 0,
          y: 0,
        };
        const imageOffset = this.imageOffset;
        const dpr = this.dpr;
        const down = (e) => {
          evenFlag = true;
          mousePoint.x = e.offsetX;
          mousePoint.y = e.offsetY;
        }

        const move = (e) => {
          if (evenFlag) {
            const { offsetX, offsetY } = e;
            let changeX = (offsetX - mousePoint.x) * dpr / this.scale * 100;
            let changeY = (offsetY - mousePoint.y) * dpr / this.scale * 100;

            // 本次移动带来的s
            const x = imageOffset.x - changeX;
            const y = imageOffset.y - changeY;
            // // 更新mouse偏移
            mousePoint.x = offsetX;
            mousePoint.y = offsetY;

            imageOffset.x = x;
            imageOffset.y = y;
            this.render(x, y);
          }
        }

        const up = (e) => {
          evenFlag = false;
          mousePoint.x = 0;
          mousePoint.y = 0;
        }

        const wheel = (e) => {
          const {
            deltaX,
            deltaY,
            offsetX,
            offsetY,
            ctrlKey,
            metaKey,
            deltaMode,
          } = e;
          e.preventDefault(); // 阻止浏览器的缩放行为
          e.stopPropagation(); // 无需冒泡

          if (ctrlKey || metaKey) {
            const scaleFactor = Math.ceil(Math.abs(deltaY) / 20);
            console.log('scale', scaleFactor);
            if (deltaY > 0) {
              if (this.scale > MIN_SCALE) {
                this.scale -= scaleFactor;
              }
            } else {
              if (this.scale < MAX_SCALE) {
                this.scale += scaleFactor;
              }
            }
            let { x, y } = imageOffset;
            this.render(x, y);
          } else {
            let { x, y } = imageOffset;
            x += deltaX;
            y += deltaY;
            // const moveMaxWidth = this.offscreenCanvas.width - this.canvas.width;
            // const moveMaxHeight = this.offscreenCanvas.height - this.canvas.height;
            // x:[0 ~ moveMaxWidth], y: [0 ~ moveMaxHeight]
            // if (
            //   (deltaX < 0 && x < 0) ||
            //   (deltaX > 0 && x > moveMaxWidth) ||
            //   (deltaY < 0 && y < 0) ||
            //   (deltaY > 0 && y > moveMaxHeight)
            // ) {
            //   return;
            // }
            // 更新 image 偏移
            imageOffset.x = Math.floor(x);
            imageOffset.y = Math.floor(y);

            this.render(x, y);
          }
        }

        this.canvas.addEventListener("mousedown", down);
        this.canvas.addEventListener("touchstart", down);
        this.canvas.addEventListener("mousemove", move);
        this.canvas.addEventListener("touchmove", move);
        this.canvas.addEventListener("wheel", wheel);
        this.canvas.addEventListener("mouseup", up);
        // canvas.addEventListener('mouseover', up);
        this.canvas.addEventListener("touchend", up);


        const useCut = document.getElementById('useCut');
        useCut.addEventListener('click', e => {
          this.showRect = !this.showRect;
          const { width, height } = this.canvas;
          this.exportPosition.x = width / 2 - this.exportPosition.width;
          this.exportPosition.y = height / 2 - this.exportPosition.height;

          this.render(imageOffset.x, imageOffset.y);
        });

        const exportImg = document.getElementById('export');
        // const signatureImage= document.getElementById('signatureImage');
        exportImg.addEventListener('click', () => {
          const { x, y, width, height } = this.exportPosition;
          const myImageData = this.context.getImageData(x, y, width * this.dpr, height * this.dpr);
          
          const offline = new OffscreenCanvas(width * this.dpr, height * this.dpr);
          const offContext = offline.getContext('2d');
          offContext.putImageData(myImageData, 0, 0);
          // offContext.scale(0.5, 0.5);
          // offContext.

          const canView = document.createElement('canvas');
          canView.width = width;
          canView.height = height;
          const ctx = canView.getContext('2d');
          ctx.drawImage(offline, 0, 0, width * this.dpr, height * this.dpr, 0, 0, width, height);

          const dataURL = canView.toDataURL('image/png');
          // signatureImage.width = width;
          // signatureImage.height = height;
          // 创建一个 <a> 元素
          const link = document.createElement('a');
          // 将 DataURL 赋值给 <a> 元素的 href 属性
          link.href = dataURL;
          // 设置下载的文件名
          link.download = 'signature.png';
          // 将签名图片元素的 src 属性设置为画布内容的 DataURL
          // signatureImage.src = canView.toDataURL('image/png');
          // 触发 <a> 元素的点击事件，以便下载图片
          link.click();
        })
      }

      cutRect() {
        if (this.showRect) {
          // const { width, height } = this.canvas;
          const { x, y, width, height } = this.exportPosition;
          this.context.save();
          this.context.beginPath();
          this.context.moveTo(x, y);
          this.context.rect(x, y, width * this.dpr, height * this.dpr);
          this.context.stroke();
          this.context.restore();
        }
      }

      resize() {
        const rect = this.canvas.getBoundingClientRect(); // css 大小
        const width = Math.floor(rect.width) * this.dpr; // SSAA
        const height = Math.floor(rect.height) * this.dpr; // SSAA
        this.canvas.width = width;
        this.canvas.height = height;
        return { width, height };
      }

      setSize({ width, height }) {
        this.canvas.width = width;
        this.canvas.height = height;
      }

      resizeOffscreen({ width, height }) {
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;
        // TODO:
        // const minWidth = Math.min(width, this.canvas.width);
        // const minHeight = Math.min(width, this.canvas.width);
        // this.minScale = Math.min(width  * 100, * 100);
      }

      clear(ctx) {
        ctx.clearRect(0, 0, Number(this.canvas.width), Number(this.canvas.height));
      }

      drawText(ctx, txt) {
        const offset = ctx.measureText(txt);
        ctx.font = "48px serif";
        ctx.fillText(txt, this.canvas.width / 2 - offset.width * this.dpr, this.canvas.height / 2);
        // ctx.beginPath();
        // ctx.moveTo(this.canvas.width / 2 - offset.width * this.dpr, this.canvas.height / 2);
        // ctx.rect(this.canvas.width / 2 - offset.width * this.dpr, this.canvas.height / 2, offset.width * this.dpr, 48);
        // ctx.stroke();
      }

      renderText() {
        this.drawText(this.context, "拖拽/粘贴图片上传....");
      }

      render(x, y) {
        const minWidth = Math.min(
          this.canvas.width,
          this.offscreenCanvas.width
        );
        const minHeight = Math.min(
          this.canvas.height,
          this.offscreenCanvas.height
        );
        this.context.save();
        this.clear(this.context);
        this.context.scale(this.scale / 100, this.scale / 100);
        this.context.drawImage(
          this.offscreenCanvas,
          x, y, minWidth / this.scale * 100, minHeight / this.scale * 100,
          0, 0, minWidth / this.scale * 100, minHeight / this.scale * 100,
        );

        this.context.restore();
        this.cutRect();
      }
    }

    class DropBox {
      constructor(option) {
        this.dropzone = document.getElementById("dropzone");
        this.sizeDom = document.getElementById("size");
        this.board = option.board;
        this.initEvent();
      }

      initEvent() {
        function preventDefaults(e) {
          e.preventDefault();
          e.stopPropagation();
        }

        const reader = new FileReader();
        var img = new Image();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        img.onload = () => {
          const { canvas, context, offscreenCanvas, offscreenContext } = this.board;
          this.board.clear(context);
          // save
          const width = img.width * 2;
          const height = img.height * 2;
          this.board.resizeOffscreen({ width, height });
          offscreenContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
          console.log('wh', this.board.offscreenCanvas.width, this.board.offscreenCanvas.height);

          // 不缩放
          context.drawImage(
            offscreenCanvas,
            0, 0, width, height, // dpr
            0, 0, width, height,
          );
          this.sizeDom.value = `img:${img.width}x${img.height},canvas:${canvas.width}x${canvas.height}`;
        };
        // 阻止默认的拖放行为
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
          this.dropzone.addEventListener(eventName, preventDefaults, false);
        });

        // 当有文件被拖入时添加样式
        this.dropzone.addEventListener("dragenter", () => {
          this.dropzone.classList.add("dragover");
        });

        // 当文件离开时移除样式
        this.dropzone.addEventListener("dragleave", () => {
          this.dropzone.classList.remove("dragover");
        });

        // 处理文件拖放事件
        this.dropzone.addEventListener("drop", (e) => {
          this.dropzone.classList.remove("dragover");
          const files = e.dataTransfer.files;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.match("image.*")) {
              reader.readAsDataURL(file);
            }
          }
        });

        document.addEventListener('paste', (e) => {
          console.log('paste');
          if (e.clipboardData) {
            console.log('paste');
            const {types, items, files} = e.clipboardData;
            if (types.length > 0 && items.length > 0 && files.length > 0) {
              const file = files[0];
              if (['image/png', 'image/jpeg'].indexOf(file.type) !== -1) {
                // 是一张图片
                if (file.type.toLowerCase().match(/(jpe?g|png|gif|webp)/g)) {
                  if (file.type.match("image.*")) {
                    reader.readAsDataURL(file);
                  }
                }
              }
            }
          }
        })
      }
    }

    const drawingBoard = new DrawingBoard();
    drawingBoard.renderText();
    new DropBox({ board: drawingBoard });
  };
})(window);
