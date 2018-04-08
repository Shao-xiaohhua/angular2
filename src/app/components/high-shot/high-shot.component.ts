import { Component, OnInit, Input, EventEmitter, ViewChild, AfterContentInit } from '@angular/core';

@Component({
    selector: 'app-high-shot',
    templateUrl: './high-shot.component.html',
    styleUrls: ['./high-shot.component.scss']
})
export class HighShotComponent implements OnInit, AfterContentInit {

    @Input() deviceId: string;
    @Input() showDevice: string;
    private topNum = 0;
    private leftNum = 0;
    private plugin: any;
    private view: any;
    private device: any;
    private video: any;
    private imageData: any;
    private isDeskew: boolean;
    private isFacePicture: boolean;
    constructor() { }

    ngOnInit() {
        this.isDeskew = false;
        this.isFacePicture = false;
        this.deviceId = 'high-shot';
    }
    ngAfterContentInit() {
        this.start();
    }

    private addEvent(name, func) {
        if (this.plugin != null && this.plugin.attachEvent) {
            this.plugin.attachEvent('on' + name, func);
        } else {
            this.plugin.addEventListener(name, func, false);
        }
    }

    private loadPlugin(): void {
        this.plugin = document.getElementById(this.deviceId);
    }

    private loadView(): void {
        this.view = document.getElementById(this.deviceId);
    }
    start() {
        const me = this;
        setTimeout(() => {
            me.loadPlugin();
            me.loadView();
            me.plugin.Global_SetWindowName(me.deviceId);
            me.view.View_SetText('正在打开设备,请稍等...', 0);
            me.addEvent('DevChange', (type, idx, dbt) => {
                if (dbt === 2) {
                    console.log('设备丢失,请检查是否正常链接...');
                }
                const dev = me.plugin.Global_CreateDevice(type, idx);
                if (dev) {
                    const name = me.plugin.Device_GetFriendlyName(dev);
                    const displayName = me.plugin.Device_GetDisplayName(dev);
                    const eloamType = me.plugin.Device_GetEloamType(dev);
                    if (type === 1 && name === 'T882') {
                        me.device = dev;
                        const nResolution = me.plugin.Device_GetResolutionCountEx(me.device, 0);
                        const subType = me.plugin.Device_GetSubtype(me.device);
                        me.video = me.plugin.Device_CreateVideo(me.device, nResolution, subType);
                        if (me.video) {
                            me.view.View_SelectVideo(me.video);
                        }
                    } else {
                        me.plugin.Device_Release(dev);
                    }
                }
            });
            if (me.plugin.Global_InitDevs()) {
                me.plugin.InitFaceDetect();
            }
            if (!me.plugin.Global_VideoCapInit()) {
                console.log('初始化失败');
            }
        }, 1000);
    }
}
