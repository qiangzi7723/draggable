(function(window) {
    // 加入AMD
    // 需要开放的接口
    // 事件的绑定
    // 加上右键检测
    // input是否添加？
    var Util = function() {

    }

    Util.prototype.checkIsTouch = function() {
        return 'ontouchstart' in window ||
            navigator.maxTouchPoints;
    }

    Util.prototype.hackRequestAnimationFrame = function(arguments) {
        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        if (!window.requestAnimationFrame) {
            var lastTime = 0;
            window.requestAnimationFrame = function(callback) {
                var now = new Date().getTime();
                var time = Math.max(16 - now - lastTime, 0);
                var id = setTimeout(callback, time);
                lastTime = now + time;
                return id;
            }
        }
    }

    Util.prototype.hackTransform = function() {
        var docElem = document.documentElement;
        this.transformProperty = typeof docElem.style.transform == 'string' ?
            'transform' : 'WebkitTransform';
    }

    Util.prototype.hackEventListener = function() {
        if (document.addEventListener) this.eventListener = true;
    }

    Util.prototype.hackStyle = function(elem) {
        if (window.getComputedStyle) {
            return window.getComputedStyle(elem);
        } else {
            return elem.currentStyle;
        }
    }

    // Draggable
    var Draggable = function(elem, options) {
        this.options = options || {};
        this.options.elemString = elem;
        this.init();
    }
    // 为了兼容IE8 只能放弃使用Object.create()实现继承
    // var proto = Draggable.prototype = Object.create(Util.prototype);
    var proto = Draggable.prototype = new Util();
    proto.setTargetDom = function() {
        this.elem = this.getDom(this.options.elemString);
        this.parentMove = this.getDom(this.options.parentMove);
        this.targetDom = this.parentMove || this.elem;
    }
    proto.getDom = function(elem) {
        if (typeof elem === 'string') {
            return document.querySelector(elem);
        } else {
            return elem;
        }
    }
    proto.render = function() {
        var context = this
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
            this.targetDom.style[this.transformProperty] = 'translate3d(' + this.movePoint.x + 'px,' + this.movePoint.y + 'px,' + '0)';
        } else {
            var cssString = 'left:' + (this.movePoint.x + this.elemPosition.x) + 'px;top:' + (this.movePoint.y + this.elemPosition.y) + 'px;';
            // cssText会覆盖原样式 所以需要写+ 另外;是为了兼容IE8的cssText不返回; 不加上会出BUG
            this.targetDom.style.cssText += ';' + cssString;
        }
    }
    // 事件绑定只做两种 分别是mousemove touchmove
    proto.init = function() {
        v = this;
        var context = this;
        this.setTargetDom();
        this.hackEventListener();
        if (!this.eventListener) this.options.backToPosition = true;
        if (this.checkIsTouch()) {
            // 说明是手机端
            this.elem.addEventListener('touchstart', this);
        } else {
            if (this.eventListener) {
                this.elem.addEventListener('mousedown', this);
            } else {
                this.bindAttach();
                // 为了兼容IE8 优雅的代码全部需要改写
                this.elem.attachEvent('onmousedown', this.b_mousedown);
            }
        }
        if (!this.options.cursorCancel) this.elem.style.cursor = 'move';
    }
    proto.bindAttach = function() {
        var context = this;
        var type = ['mousedown', 'mousemove', 'mouseup'];
        for (var i = 0, len = type.length; i < len; i++) {
            this['b_' + type[i]] = (function(i) {
                return function() {
                    context.event = window.event;
                    context[type[i]]();
                }
            }(i))
        }
    }
    proto.dragDown = function(event) {
        this.enable = true;
        this.hackTransform();
        this.addClassName();
        this.setIndex();
        this.style = this.hackStyle(this.targetDom);
        this.elemPosition = this.getPosition(this.style);
        this.startPoint = this.getCoordinate();
        this.movePoint = {
            x: 0,
            y: 0
        };
        this.setPositionProperty();
        this.bindCallBackEvent();
        this.render();
    }
    proto.setIndex=function(){
        // this.elem.style.zIndex=2147483647;
    }
    proto.addClassName=function(){
        if (this.options.addClassName) this.elem.className += ' ' + this.options.addClassName;
    }
    // 绑定之后的事件 比如mousemove和mouseup
    proto.bindCallBackEvent = function() {
        var context = this;
        var type = this.event.type;
        var handleObj = {
            mousedown: ['mousemove', 'mouseup'],
            touchstart: ['touchmove', 'touchend']
        }
        var handles = handleObj[type];
        this.handles = handles;
        // true绑定事件 false解绑事件
        this.bindEvent(true);
    }
    // 绑定以及解绑mousemove mouseup
    proto.bindEvent = function(isBind) {
        var context = this;
        var handles = this.handles;
        if (this.eventListener) {
            var eventListener = isBind ? 'addEventListener' : 'removeEventListener';
            handles.forEach(function(handle) {
                window[eventListener](handle, context);
            })
        } else {
            var eventListener = isBind ? 'attachEvent' : 'detachEvent';
            document[eventListener]('onmousemove', this.b_mousemove);
            document[eventListener]('onmouseup', this.b_mouseup);
        }

    }
    proto.setPositionProperty = function() {
        var p = {
            fix: true,
            absolute: true,
            relative: true
        };
        if (!p[this.style.position]) {
            this.targetDom.style.position = 'relative';
        }
        this.targetDom.style.left = this.elemPosition.x + 'px';
        this.targetDom.style.top = this.elemPosition.y + 'px';
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
        // 在IE8下返回null
        var transform = this.style[this.transformProperty];
        if (!transform || transform.indexOf('matrix') == '-1') {
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
    proto.dragMove = function() {
        var vector = this.getCoordinate();
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
        this.removeClassName();
        this.bindEvent(false);
        this.resetIndex();
        if (this.options.backToPosition) return;
        this.resetPosition();
    }
    proto.removeClassName=function(){
        if (this.options.addClassName) {
            var re = new RegExp("(?:^|\\s)" + this.options.addClassName + "(?:\\s|$)", "g");
            this.elem.className = this.elem.className.replace(re, '');
        }
    }
    proto.resetIndex=function(){
        // this.elem.style.zIndex='';
    }
    proto.resetPosition = function() {
        this.endPoint = {
            x: this.movePoint.x + this.elemPosition.x,
            y: this.movePoint.y + this.elemPosition.y
        }
        this.targetDom.style.cssText+=';left:'+this.endPoint.x + 'px;top:'+this.endPoint.y + 'px;transform:translate3d(0,0,0)';
    }
    // 获取坐标
    proto.getCoordinate = function() {
        if (this.eventListener) {
            return {
                // 最后的0是为了避免当 this.event.pageX==0 的时候会取 touches[0] 的值
                x: this.event.pageX || (this.event.touches && this.event.touches[0].pageX) || 0,
                y: this.event.pageY || (this.event.touches && this.event.touches[0].pageY) || 0
            }
        } else {
            return {
                // 兼容IE8的鼠标位置获取
                x: this.event.clientX + document.documentElement.scrollLeft,
                y: this.event.clientY + document.documentElement.scrollTop
            }
        }

    }
    proto.touchstart = function(event) {
        this.dragDown(event);
    }
    proto.mousedown = function() {
        this.dragDown();
    }
    proto.mousemove = function() {
        this.dragMove();
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
        var type = this.event.type;
        if (type) this[type]();
    }
    window.Draggable = Draggable;
}(window))
