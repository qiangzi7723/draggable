(function(window) {
    // 目标 兼容到IE8
    // 需要开放的接口
    // axis只允许哪条轴移动
    // 事件的绑定
    // grid移动单位
    // 兼容transform
    // 兼容transform延伸的问题 完全兼容transfrom 比如scale属性
    // 目前可以兼容元素设置了translate的情况 但是如果元素还设置了scale等的话暂时无法兼容
    // 解决方案有两种 完美兼容transform所有属性 或者开启替代方案，完全使用position实现整个拖拽
    // 选择器的问题
    // Util
    var Util = function() {

    }

    Util.prototype.checkIsTouch = function() {
        return 'ontouchstart' in window // works on most browsers
            ||
            navigator.maxTouchPoints; // works on IE10/11 and Surface
    }

    Util.prototype.hackRequestAnimationFrame = function(arguments) {
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        if (!window.requestAnimationFrame) {
            // fallback
        }
    }

    Util.prototype.hackTransform = function() {
        var docElem = document.documentElement;
        this.transformProperty = typeof docElem.style.transform == 'string' ?
            'transform' : 'WebkitTransform';
    }

    // Draggable
    var Draggable = function(elem, options) {
        this.options = options||{};
        // elem有可能传选择器，也有可能传节点 节点可单个可多个
        if (typeof elem === 'string') {
            // 说明是选择器
            this.elem = document.querySelector(elem);
        }else{
            this.elem=elem;
        }
        this.init();
    }
    // 通过Object.create实现原型的继承
    var proto = Draggable.prototype = Object.create(Util.prototype);
    proto.render = function() {
        var context = this;
        // 兼容requestAnimationFrame
        this.hackRequestAnimationFrame();
        this._render = function() {
            if (!context.enable) {
                // 通过直接return取消定时器
                return;
            }
            context.setTransform();
            requestAnimationFrame(context._render);
        }
        requestAnimationFrame(this._render);
    }
    proto.setTransform = function() {
        if (!this.options.backToPosition) {
            this.elem.style[this.transformProperty] = 'translate3d(' + this.movePoint.x + 'px,' + this.movePoint.y + 'px,' + '0)';
        } else {
            this.elem.style.left = this.movePoint.x + this.elemPosition.x + 'px';
            this.elem.style.top = this.movePoint.y + this.elemPosition.y + 'px';
        }
    }
    // 事件绑定只做两种 分别是mousemove touchmove
    proto.init = function() {
        if (this.checkIsTouch()) {
            // 说明是手机端
            this.elem.addEventListener('touchstart', this);
        } else {
            this.elem.addEventListener('mousedown', this);
        }
        if(!this.options.cursorCancel) this.elem.style.cursor='move';
    }
    proto.dragDown = function(event) {
        this.hackTransform();
        this.enable = true;
        // 需要把初始的position记录下来 并且转化transform以及设置position
        if(this.options.addClassName){
            this.elem.className += ' '+this.options.addClassName;
        }
        this.style = window.getComputedStyle(this.elem);
        this.elem.style.zIndex=2147483647;
        this.elemPosition = this.getPosition(this.style);
        this.startPoint = this.getCoordinate();
        this.movePoint = {
            x: 0,
            y: 0
        };
        this.setPositionProperty(this.style);
        this.bindCallBackEvent(event);
        this.render();
    }
    // 绑定之后的事件 比如mousemove和mouseup
    proto.bindCallBackEvent = function(event) {
        var context = this;
        var type = event.type;
        var handleObj = {
            mousedown: ['mousemove', 'mouseup'],
            touchstart: ['touchmove', 'touchend']
        }
        var handles = handleObj[type];
        this.handles = handles;
        handles.forEach(function(handle) {
            window.addEventListener(handle, context);
        })
    }
    proto.setPositionProperty = function(style) {
        var p = {
            fix: true,
            absolute: true,
            relative: true
        };
        if (!p[style.position]) {
            this.elem.style.position = 'relative';
        }
        this.elem.style.left = this.elemPosition.x + 'px';
        this.elem.style.top = this.elemPosition.y + 'px';
    }
    // getPosition除了获取元素的position值之外 还需要考虑transform的影响
    proto.getPosition = function(style) {
        var position = {};
        position.x = style.left == 'auto' ? 0 : parseInt(style.left, 10);
        position.y = style.top == 'auto' ? 0 : parseInt(style.top, 10);
        if (this.options.backToPosition) {
            // 说明开启了回退position，所以不需要叠加transform属性
            return position;
        }
        // 把初始的transform值放到position中
        position = this.addTransform(position);
        return position;
    }
    proto.addTransform = function(position) {
        var transform = this.style[this.transformProperty];
        if (transform.indexOf('matrix') == '-1') {
            // 说明transform属性不存在
            return position;
        }
        // 如果是2D的transform，那么translate的值的索引以4开始，否则就是3d，以12开始
        var translateIndex = transform.indexOf('matrix3d') == '-1' ? 4 : 12;
        var transformArray = transform.split(',');
        // 拖拽结束的时候还需要手动的还原transform的值
        this.translateX = parseInt(transformArray[translateIndex], 10);
        // 获取到的值可能是100)这样的情况，带了最后的括号
        this.translateY = parseInt(transformArray[translateIndex + 1], 10);
        position.x += this.translateX;
        position.y += this.translateY;
        return position;
    }
    proto.dragMove = function(event) {
        var vector = this.getCoordinate(this.event);
        var moveVector = {
            x: vector.x - this.startPoint.x,
            y: vector.y - this.startPoint.y
        }
        moveVector = this.setGrid(moveVector);
        // 这里每次move的时候都需要进行两次的三木判断 性能上是否有一定的影响
        this.movePoint.x = this.options.axis == 'y' ? 0 : moveVector.x;
        this.movePoint.y = this.options.axis == 'x' ? 0 : moveVector.y;
    }
    proto.setGrid = function(moveVector) {
        if (!this.options.grid) return moveVector;
        var grid = this.options.grid;
        var vector = {};
        vector.x = grid.x ? Math.round(moveVector.x / grid.x) * grid.x : moveVector.x;
        vector.y = grid.y ? Math.round(moveVector.y / grid.y) * grid.y : moveVector.y;
        return vector;
    }
    // 解绑事件 设置position 清除定时器
    proto.dragUp = function() {
        var context = this;
        this.enable = false;
        if(this.options.addClassName){
            var re = new RegExp("(?:^|\\s)"+this.options.addClassName+"(?:\\s|$)","g");
            this.elem.className = this.elem.className.replace(re,'');
        }
        // 解绑事件
        this.handles.forEach(function(handle) {
            window.removeEventListener(handle, context);
        })
        // 开启了回退position 一切与transform有关的操作都不需要
        if (this.options.backToPosition) return;
        // 把transform转换为position
        this.resetPosition();
    }
    proto.resetPosition = function() {
        this.endPoint = {
            x: this.movePoint.x + this.elemPosition.x,
            y: this.movePoint.y + this.elemPosition.y
        }
        this.elem.style.left = this.endPoint.x + 'px';
        this.elem.style.top = this.endPoint.y + 'px';
        this.elem.style.transform = 'translate3d(0,0,0)';
        this.elem.style.zIndex='';
    }
    // 获取坐标
    proto.getCoordinate = function() {
        return {
            x: this.event.pageX || this.event.touches[0].pageX,
            y: this.event.pageY || this.event.touches[0].pageY
        }
    }
    proto.touchstart = function(event) {
        this.dragDown(event);
    }
    proto.mousedown = function(event) {
        this.dragDown(event);
    }
    proto.mousemove = function(event) {
        this.dragMove(event);
    }
    proto.touchmove = function() {
        this.dragMove();
    }
    proto.mouseup = function() {
        this.dragUp();
    }
    proto.touchend = function() {
        this.dragUp();
    }
    // 通过handleEvent绑定事件
    proto.handleEvent = function(event) {
        this.event = event;
        if (this[event.type]) {
            this[event.type](event);
        }
    }
    window.Draggable = Draggable;
}(window))
