# Draggable

打造轻量级的原生拖拽库

## Install

直接从`src`文件夹中引入即可

## Usage

    <div id='app'></div>

可以直接传入选择器

    new Draggable('#app');

或者传入DOM节点

    var elem=document.querySelector('#app');
    new Draggable(elem);

如果需要为多个元素添加拖拽，请循环遍历

    var elem=document.querySelectorAll('.app');
    for(var i=0,len=elem.length;i<len;i++){
        new Draggable(elem[i]);
    }

## API

## API一览
    new Draggable('#app',{
        axis:'x',
        grid:{x:40},
        addClassName:'is-dragging',
        backToPosition:true,
        cursorCancel:false,
        parentMove:'#container'
    });


### backToPosition

默认的拖拽动画是通过`transform`属性实现的，所以如果想使用`position`属性实现拖拽动画可以使用该参数

    new Draggable('#app',{
        backToPosition:true
    });

**在IE8下会自动回退到使用`position`实现拖拽**

### parentMove

通过设置`parentMove`可以设置移动的父元素，如

    new Draggable('#app',{
        parentMove:'#container'
    });

表明当点击`app`元素时，`app`元素不会被拖拽，拖拽移动的是整个的`container`元素，这个API在需要定义顶部拖拽条的时候很有用

### axis

设置该参数表明只允许某个方向可拖拽

    new Draggable('#app',{
        axis:'x'
    });

### grid

设置拖拽的时候移动的单位

    new Draggable('#app',{
        grid:{x:40,y:40}
    });

### addClassName

为拖拽的过程添加`className`，方便增加拖拽样式

    new Draggable('#app',{
        addClassName:'is-dragging'
    });

### cursor

在初始化的时候默认为可拖拽的元素添加`cursor:move`属性，如果需要取消可以

    new Draggable('#app',{
        cursorCancel:true
    });

## 后期版本迭代

- safari上还存在bug。
- 兼容IE8。 已经完成。
- 增加AMD规范。
- 增加事件绑定接口。
- 增加container接口。
- 添加完善的错误输出，方便调试。
- 加上zIndex接口，让移动元素总在最顶层。
