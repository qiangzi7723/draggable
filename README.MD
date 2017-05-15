# Draggable

打造跨平台的轻量级原生拖拽库

## Summary

自己写的一个拖拽库，基于原生JS实现，无任何依赖，同时还做了IE8的兼容，在IE8的情况下`transform`回退到`position`实现。拖拽的动画通过绑定在`render`函数上的`requestAnimationFrame`实现而不是使用`mousemove`回调。另外库里面还写了很多的注释，方便对源码的解读与交流。如果你觉得这个库写的不错或者有值得学习的经验不妨点下右上角的`star`，谢谢各位。

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
        parentMove:'#container',
        backToPosition:false,
        axis:'x',
        grid:{x:40},
        addClassName:'is-dragging',
        cursorCancel:false,
    });

### backToPosition

默认的拖拽动画是通过`transform`属性实现的，所以如果想使用`position`属性实现拖拽动画可以使用该参数

    new Draggable('#app',{
        backToPosition:true
    });

**在IE8下会自动使用`position`实现拖拽**

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

- 增加AMD规范。
- 增加事件绑定接口。
- 添加完善的错误输出，方便调试。
- 加上zIndex接口，让移动元素总在最顶层。
