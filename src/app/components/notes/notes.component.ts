import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, DoCheck, HostListener, OnDestroy } from '@angular/core';
import { RestClient } from './../../service/rest-client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NzMessageService } from '../message/nz-message.service';
import { environment } from '../../../environments/environment';
import { MachineService } from './../../service/machine.service';
declare let jQuery: any;

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  providers: [MachineService, NzMessageService, RestClient]
})

export class NotesComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  @ViewChild('editHeight') editHeight: ElementRef;
  @ViewChild('question') question: ElementRef;
  @ViewChild('answer') answer: ElementRef;

  private editOffset: number;
  private talkNote: any = {
    id : '',
    content : '',
  };
  private jsonData: any;
  private isFullscreen: boolean;
  private testTalks;
  private index: number;
  public item: Object = {};
  private talkTemplateId: any;
  private talkNoteId: any;
  private talkNoteStatus: any;
  private formData: any;
  private isSaveTalkNote: boolean;
  private isRestBuild: boolean;
  private isStart: boolean;
  private signConfig: any;
  private interval: any;
  constructor(
    private restClient: RestClient,
    private sanitizer: DomSanitizer,
    private machineService: MachineService,
    private _message: NzMessageService
  ) { }

  ngOnInit() {
    this.isStart = false;
    this.talkNoteStatus = 'Draft';
    this.initNote();
    this.respone();
  }

  ngAfterViewInit () {
    this.calcEditOffset();
  }

  ngDoCheck () {
    this.calcEditOffset();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  private initNote() {
    this.testTalks = [];
    this.index = 0;
    this.signConfig = {};
    this.isFullscreen = false;
    this.isSaveTalkNote = false;
    this.isRestBuild = false;
    const caseId = window.localStorage.getItem('caseId');
    const resp = this.restClient.request('npm.QANoteService', 'collection', 'loadQANoteList'
    , { caseId : caseId });
    resp.then(res => {
      if (res.code === 1) {
        const result = res.result;
        this.talkNoteId = result.talkNoteId;
        this.talkTemplateId = result.talkTemplateId;
        this.talkNoteStatus = result.talkNoteStatus;
        this.signConfig['autograph'] = result.talkNote.properties.autograph;
        this.signConfig['autographDate'] = result.talkNote.$displays.autographDate;
        if (this.talkNoteStatus === 'Completed') {
          this.signConfig['isResetSign'] = false;
          this.isStart = true;
        }
        result['qaNote'].forEach(element => {
          this.testTalks.push(element);
        });
        if (this.testTalks.length > this.index && this.talkNoteStatus === 'Draft') {
          this.setItem(this.testTalks[this.index]);
        }
      }
    });
  }

  private calcEditOffset () {
    if (!this.editHeight) {
      return;
    }
    this.editOffset = this.editHeight.nativeElement.offsetHeight - 110;
  }

  private setTalk (item, i): void {
    if (!this.question || !this.answer) {
      return;
    }
    this.testTalks[this.index].question = this.question.nativeElement.innerHTML;
    this.testTalks[this.index].answer = this.answer.nativeElement.innerHTML;
    this.saveQANote(this.index, false);
    this.index = i;
    this.setItem(item);
    // console.log('this.testTalks-->', item, this.testTalks[this.index]);
  }

  private addNote (): void {
    if (!this.question || !this.answer) {
      return;
    }
    this.testTalks.push({
      question: '新增问题',
      answer: '新增问题答案',
      isCompleted: false
    });
    if (this.index >= this.testTalks.length - 1) {
      return;
    }
    this.testTalks[this.index].isCompleted = true;
    this.testTalks[this.index].question = this.question.nativeElement.innerHTML;
    this.testTalks[this.index].answer = this.answer.nativeElement.innerHTML;
    this.saveQANote(this.index, true);
    this.index = this.testTalks.length - 1;
    this.setItem(this.testTalks[this.index]);
  }

  saveCurrentNote() {
    this.testTalks[this.index].isCompleted = true;
    this.testTalks[this.index].question = this.question.nativeElement.innerHTML;
    this.testTalks[this.index].answer = this.answer.nativeElement.innerHTML;
    this.saveQANote(this.index, false);
  }

  private next (): void {
    if (!this.question || !this.answer) {
      return;
    }
    if (this.index >= this.testTalks.length - 1) {
      return;
    }
    this.testTalks[this.index].isCompleted = true;
    this.testTalks[this.index].question = this.question.nativeElement.innerHTML;
    this.testTalks[this.index].answer = this.answer.nativeElement.innerHTML;
    this.saveQANote(this.index, true);
    this.index++;
    this.setItem(this.testTalks[this.index]);
  }

  private prev (): void {
    if (!this.question || !this.answer) {
      return;
    }
    if (this.index < 1) {
      return;
    }
    this.testTalks[this.index].isCompleted = true;
    this.testTalks[this.index].question = this.question.nativeElement.innerHTML;
    this.testTalks[this.index].answer = this.answer.nativeElement.innerHTML;
    this.saveQANote(this.index, true);
    this.index--;
    this.setItem(this.testTalks[this.index]);
  }

  private toggleFS (): void {
    this.isFullscreen = !this.isFullscreen;
  }

  get caseTypeId(): String {
    return window.localStorage.getItem('caseTypeId');
 }

 get caseId(): String {
  return window.localStorage.getItem('caseId');
}

 get docType(): String {
   return '1f35d9266f064cdc920c93a4659197ee';
 }

  loadTalkTemp (event) {
    if (this.talkTemplateId === event) {
      return;
    }
    this.talkTemplateId = event;
    this.testTalks = [];
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.QATemplateService', 'collection', 'loadQATemplateList'
    , { talkTemplateId: this.talkTemplateId, caseId : caseId }).then(res => {
      if (res.code === 1) {
        const result = res.result;
        result.forEach(element => {
          this.testTalks.push(element);
        });
        if (this.testTalks.length > this.index) {
          this.setItem(this.testTalks[this.index]);
        }
      }
    });
  }
  formValueChange (formValues) {
    this.formData = formValues;
  }
  HTMLDecode(text) {
    let temp = document.createElement('div');
    temp.innerHTML = text;
    const output = temp.innerText || temp.textContent;
    temp = null;
    return output;
  }

  clientRead() {
    this.machineService.redirect('notes', this.talkNoteId, null);
    this.isStart = true;
    this.interval = setInterval(() => {
    this.restClient.request('npm.TalkNoteService', 'collection', 'retrieve', {talkNoteId: this.talkNoteId})
      .then(res => {
        if (res.code === 1) {
          this.talkNoteStatus = res.result.properties.status;
          if (this.talkNoteStatus === 'Completed') {
            this.signConfig['autograph'] = res.result.properties.autograph;
            this.signConfig['autographDate'] = res.result.$displays.autographDate;
            this.signConfig['isResetSign'] = false;
            clearInterval(this.interval);
          }
        }
      })
    }, 3000);
  }

  restBuild() {
    if (!this.question || !this.answer) {
      return;
    }
    this.isRestBuild = true;
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.QANoteService', 'collection', 'build'
    , { qaNote: this.answer.nativeElement.innerHTML, caseId : caseId, data : this.formData }).then(res => {
      if (res.code === 1) {
        const result = res.result;
        this.item['answer'] = this.sanitizer.bypassSecurityTrustHtml(result.answer);
        this.testTalks[this.index].isCompleted = true;
        this.testTalks[this.index].question = this.question.nativeElement.innerHTML;
        this.testTalks[this.index].answer = this.answer.nativeElement.innerHTML;
        this.saveQANote(this.index, false);
      }
      this.isRestBuild = false;
    });
  }
  saveTalkNote() {
    if (!this.question || !this.answer) {
      return;
    }
    this.isSaveTalkNote = true;
    this.testTalks[this.index].isCompleted = true;
    this.testTalks[this.index].question = this.question.nativeElement.innerHTML;
    this.testTalks[this.index].answer = this.answer.nativeElement.innerHTML;
    this.saveQANote(this.index, false);
    const caseId = window.localStorage.getItem('caseId');
    const parmas = {};
    parmas['caseId'] = caseId;
    parmas['talkNoteId'] = this.talkNoteId;
    parmas['talkTemplateId'] = this.talkTemplateId;
    parmas['qaNoteArray'] = this.testTalks;
    this.restClient.request('npm.QANoteService', 'collection', 'saveTalkNote'
    , parmas).then(res => {
      if (res.code === 1) {
        const result = res.result;
        this.talkNoteStatus = result.talkNoteStatus;
        this.signConfig['autograph'] = result.talkNote.properties.autograph;
        this.signConfig['autographDate'] = result.talkNote.$displays.autographDate;
        this.testTalks = [];
        result.qaNote.forEach(element => {
          this.testTalks.push(element);
        });
        /* if (this.testTalks.length > this.index) {
          this.setItem(this.testTalks[this.index]);
        } */
      }
      this.isSaveTalkNote = false;
      this.isStart = false;
    });
  }
  private resetSign() {
    this.signConfig['isResetSign'] = true;
    const r = this.restClient.request('npm.TalkNoteService', 'collection', 'updateStatusToSubmitted', {talkNoteId: this.talkNoteId});
    r.then(res => {
        if (res.code === 1) {
          this.talkNoteStatus = res.result.properties.status;
          this.clientRead();
        }
      });
  };
  saveQANote(index, isClick) {
    if (this.talkNoteStatus === 'Completed') {
      return;
    }
    const caseId = window.localStorage.getItem('caseId');
    const parmas = {};
    parmas['caseId'] = caseId;
    parmas['talkNoteId'] = this.talkNoteId;
    parmas['talkTemplateId'] = this.talkTemplateId;
    parmas['qaNote'] = this.testTalks[index];
    this.restClient.request('npm.QANoteService', 'collection', 'saveQANote'
    , parmas).then(res => {
      if (res.code === 1) {
        const result = res.result;
        this.talkNoteId = result.talkNoteId;
        this.talkNoteStatus = result.talkNoteStatus;
        this.testTalks[index] = result.qaNote;
        if (!isClick) {
            this.machineService.redirect('note', null , {qaNoteId: result.qaNote['id']});
        }
      }
    });
  }
  printTalkNote () {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([this.talkNoteId]) +
    '&typeId=318eedf9e25a42ddb93918cab988f30c', '_blank');
  }
  setItem(currentNote) {
    this.item['id'] = currentNote['id'];
    this.item['fields'] = currentNote['fields'];
    this.item['bussinessType'] = currentNote['bussinessType'];
    this.item['question'] = this.sanitizer.bypassSecurityTrustHtml(currentNote['question']);
    this.item['answer'] = this.sanitizer.bypassSecurityTrustHtml(currentNote['answer']);
    if (this.talkNoteStatus !== 'Completed') {
      this.saveQANote(this.index, false);
    }
  }

  resetEdit() {
    const parmas = {};
    parmas['talkNoteId'] = this.talkNoteId;
    this.restClient.request('npm.QANoteService', 'collection', 'resetTalkNote'
    , parmas).then(res => {
      if (res.code === 1) {
        this.talkNoteStatus = 'Draft';
        this.isStart = false;
        this.initNote();
      }
    });
  }
  respone () {
    if (jQuery(document).width() < 1400) {
      this.isFullscreen = true
    } else {
      this.isFullscreen = false
    }
  }
}
