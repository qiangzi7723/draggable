(function(window) {
    // 需要开放的接口
    // axis只允许哪条轴移动 移动的单位 事件的绑定
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
        var common = this;
        // elem有可能传选择器，也有可能传节点 节点可单个可多个
        if (typeof elem === 'string') {
            // 说明是选择器
            this.elem = document.querySelector(elem);
        }
        this.init();
    }
    // 通过Object.create实现原型的继承
    var proto = Draggable.prototype = Object.create(Util.prototype);
    proto.render = function() {

        var context = this;
        // 兼容requestAnimationFrame
        this.hackRequestAnimationFrame();
        this.hackTransform();
        this._render = function() {
            console.log('render');
            if(!context.enable){
                // 通过直接return取消定时器
                return;
            }
            context.setTransform();
            requestAnimationFrame(context._render);
        }
        requestAnimationFrame(this._render);
    }
    proto.setTransform = function() {
        this.elem.style[this.transformProperty]='translate3d('+this.movePoint.x+'px,'+this.movePoint.y+'px,'+'0)';
    }
    // 事件绑定只做两种 分别是mousemove touchmove
    proto.init = function() {
        if (this.checkIsTouch()) {
            // 说明是手机端
            this.elem.addEventListener('touchstart', this);
        } else {
            this.elem.addEventListener('mousedown', this);
        }
    }
    proto.dragDown = function(event) {
        this.enable=true;
        // 需要把初始的position记录下来 并且转化transform以及设置position
        this.style = window.getComputedStyle(this.elem);
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
        this.handles=handles;
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
    }
    proto.getPosition = function(style) {
        var position = {};
        position.x = style.left == 'auto' ? 0 : parseInt(style.left, 10);
        position.y = style.top == 'auto' ? 0 : parseInt(style.top, 10);
        return position;
    }
    proto.dragMove = function(event) {
        var vector = this.getCoordinate(this.event);
        this.movePoint = {
            x: vector.x - this.startPoint.x,
            y: vector.y - this.startPoint.y,
        }
    }
    // 解绑事件 设置position 清除定时器
    proto.dragUp = function() {
        var context=this;
        this.enable=false;
        // 解绑事件
        this.handles.forEach(function(handle){
            window.removeEventListener(handle,context);
        })
        // 把transform转换为position
        this.resetPosition();
    }
    proto.resetPosition=function(){
        this.endPoint={
            x:this.movePoint.x+this.elemPosition.x,
            y:this.movePoint.y+this.elemPosition.y
        }
        this.elem.style.left=this.endPoint.x+'px';
        this.elem.style.top=this.endPoint.y+'px';
        this.elem.style.transform='translate3d(0,0,0)';
    }
    // 获取坐标
    proto.getCoordinate = function() {
        return {
            x: this.event.pageX,
            y: this.event.pageY
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
    proto.touchend=function(){
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
