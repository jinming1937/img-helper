## IMG-Helper

给墨水屏快速裁图

### 使用

直接使用浏览器打开index.html

1. 可以拖放、截图ctrl+v上传图片
2. 缩放画布
3. 旋转画布
4. 选择想要的尺寸
5. 下载，文件名为 img-AAAxBBB-1766242297483.png

### 支持添加更多尺寸

在index.html里，照着已经有的option格式添加

```html
<optgroup label="其它常用尺寸">
    <option value="640x384">640x384</option>
    <!-- 这里可以添加更多尺寸... -->
</optgroup>
```