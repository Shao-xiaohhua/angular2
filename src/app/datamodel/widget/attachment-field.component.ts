/**
 * https://github.com/valor-software/ng2-file-upload
 */
import { Component, Input, OnInit, OnChanges, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Widget, WidgetType } from '../../model/widget';
import { environment } from '../../../environments/environment';

import { FileUploader, FileItem } from 'ng2-file-upload';
import { MetaLoader } from './../../service/meta-loader.service';
import { RestClient } from './../../service/rest-client.service';


import { ToastsManager } from 'ng2-toastr/ng2-toastr';


declare var require: any;
const $ = require('jquery');

@Component({
    selector: 'widget-attachmentfield',
    templateUrl: './attachment-field.component.html'
})
export class AttachmentFieldComponent implements AfterViewInit {
    public uploader: FileUploader = new FileUploader({
        url: environment.restServiceUrl + 'tk.File/collection/upload',
        method: 'POST',
        itemAlias: 'uploadedfile',
        authTokenHeader: 'X-CSRF-TOKEN',
        authToken: MetaLoader.CSRF_TOKEN,
        removeAfterUpload: false,
    });
    @Input() widget: Widget<any>;
    @Input() form: FormGroup;
    widgetType = WidgetType;
    $el: any;
    multiple = '';

    public ids: any[] = [];
    public files: any[] = new Array();
    // knOptions = { // 上传圆形进度条　弃用
    //     value: 0,
    //     max: 100,
    //     textColor: '#1c84c6',
    //     barColor: '#1c84c6',
    //     size: 27,
    //     trackWidth: 5,
    //     barWidth: 5,
    //     readOnly: true
    // };


    ngAfterViewInit() {
        this.$el = $(this.el.nativeElement);
        this.initFiles();
    }

    initFiles() {
        let fileIds = this.form.value[this.widget.fieldName];
        if (fileIds && fileIds.length > 0) {
            if (!(fileIds instanceof Array)) {
                fileIds = [fileIds];
            }
            const infos = this.restClient.request('tk.File', 'null', 'info', {ids: fileIds});
            infos.then(result => {
                if (result && result instanceof Array) {
                    result.forEach(r => {
                        this.files.push({
                            fileId: r['id'],
                            fileName: r['name'],
                            fileSize: r['size'],
                            fileType: r['type'],
                            isSuccess: true,
                            uploadResult: r
                        });
                    });
                }
            });
            // console.log('initFiles', this.files);
        }
    }

    onClickUpload(event: any) {
        this.$el.find('.file-input').click();
    }

    selectedFileOnChanged(event: any) {
        if (this.uploader.queue) {
            if (!this.widget.array) {
                const queue = this.uploader.queue[this.uploader.queue.length - 1];
                this.uploader.queue = [queue];
                this.files = [];
            }
            this.uploader.queue.forEach((queue: any) => {
                if (queue) {
                    if (queue['file'] && this.files.indexOf(queue) < 0) {
                        queue['fileName'] = queue['file']['name'];
                        queue['fileSize'] = queue['file']['size'];
                        queue['fileType'] = queue['file']['type'];
                        this.files.push(queue);
                    }
                    if (!queue.isSuccess) {
                        this.uploadFile(queue);
                    }
                }
            });
        }
        // console.log('selectedFileOnChanged--:', this.files);
    }


    uploadFile(queue: any) {
        if (queue) {
            const attachment = this;
            queue.onSuccess = function(response, status, headers) {
                const result = JSON.parse(response);
                console.log('error>>', result);
                queue['uploadResult'] =  result;
                if (status === 200 && result.error === 0) {
                    attachment.update();
                } else {
                    attachment.removeFile({}, queue);
                    attachment.toastr.warning(result.message, '文件上传错误', {toastLife: 10000});
                }
            }
            queue.upload();
        }
    }

    setValue() {
        if (this.widget.array) {
            this.form.value[this.widget.fieldName] = this.ids;
        } else {
            this.form.value[this.widget.fieldName] = this.ids && this.ids.length > 0 ? this.ids[0] : null;
        }
    }

    removeFile(event: any, file: any) {
        this.files.splice(this.files.indexOf(file), 1);
        if (file instanceof FileItem) {
            this.uploader.removeFromQueue(file);
        }
        this.update();
    }

    update() {
        this.ids = [];
        this.files.forEach((file) => {
            if (file['uploadResult'] && file['uploadResult']['fileId']) {
                this.ids.push(file['uploadResult']['fileId']);
            }
        });
        this.setValue();
        // console.log('update--:', this.ids, this.form.value[this.widget.fieldName]);
    }


    constructor(
        private el: ElementRef,
        private restClient: RestClient,
        public toastr: ToastsManager,
    ) {}


    getDownloadUrl(file: any) {
        if (file['uploadResult'] && file['uploadResult']['url']) {
            return file['uploadResult']['url'] + 'download';
        }
        return 'javascript:void(0);';
    }

    get getUploadBtnName() {
        let name = '上传';
        if (this.files.length > 0) {
            name = this.widget.array ? '继续添加' : '替换';
        }
        return name;
    }

    get isValid() {
        return this.form.controls[this.widget.fieldName].valid;
    }
    get isDirty() {
        return this.form.controls[this.widget.fieldName].dirty;
    }
    get isTouched() {
        return this.form.controls[this.widget.fieldName].touched;
    }
}
