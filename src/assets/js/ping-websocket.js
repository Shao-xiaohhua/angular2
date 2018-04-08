(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports){
        module.exports = factory();
    } else {
        global.HomoloWebSocket = factory();
    }
})(this, function () {
    
    function HomoloWebSocket() {
        
        var ws;
        
        var lockReconnect = false;//避免重复连接
        
        var wsUrl;
        
        var self = this;

        var eventTarget = document.createElement('div');
        eventTarget.addEventListener('open',       function(event) { self.onopen(event); });
        eventTarget.addEventListener('message',    function(event) { self.onmessage(event); });
        
        this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
        this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
        this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
        
        function generateEvent(s, args) {
        	var evt = document.createEvent("CustomEvent");
        	evt.initCustomEvent(s, false, false, args);
        	return evt;
        };

        this.start  = function(url){
            try {
                self.wsUrl = url;
                ws = new WebSocket(url);
                initEventHandle();
            } catch (e) {
                reConnect();
            } 
        }
        
        function initEventHandle() {
            ws.onclose = function () {
                reConnect();
            };
            ws.onerror = function () {
                reConnect();
            };
            ws.onopen = function () {
                //心跳检测重置
                heartCheck.reset().start();
                eventTarget.dispatchEvent(generateEvent('open'));
            };
            ws.onmessage = function (event) {
                //如果获取到消息，心跳检测重置
                //拿到任何消息都说明当前连接是正常的
                heartCheck.reset().start();
                if(event && event.data != 'ping'){
                    var e = generateEvent('message');
                    e.data = event.data;
                    eventTarget.dispatchEvent(e);
                }
            }
        }

        function reConnect() {
            if(lockReconnect) return;
            lockReconnect = true;
            //没连接上会一直重连，设置延迟避免请求过多
            setTimeout(function () {
                self.start(self.wsUrl);
                lockReconnect = false;
            }, 1000);
        }
        
        //心跳检测
        var heartCheck = {
            timeout: 3000,
            timeoutObj: null,
            serverTimeoutObj: null,
            reset: function(){
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                return this;
            },
            start: function(){
                var me = this;
                this.timeoutObj = setTimeout(function(){
                    // console.log('send ping');
                    //这里发送一个心跳，后端收到后，返回一个心跳消息，
                    //onmessage拿到返回的心跳就说明连接正常
                    ws.send("ping");
                    me.serverTimeoutObj = setTimeout(function(){
                        //如果超过一定时间还没重置，说明后端主动断开了
                        ws.close();
                        //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                    }, me.timeout)
                }, this.timeout)
            }
        }
        /* this.onopen = function () {
           console.log('onopen');
        }
        
        this.onmessage = function (event) {
           console.log('onmessage', event);
        } */
        
    }
    HomoloWebSocket.prototype.onopen = function() {
        console.log('onopen111');
    };
    HomoloWebSocket.prototype.onmessage = function(event) {
        
    };
    return HomoloWebSocket;
})
