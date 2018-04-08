import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RestClient } from './../../service/rest-client.service';
@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss'],
  providers: [RestClient]
})
export class DocComponent implements OnInit {

  private docIds: any;
  private docs: any;
  private helpLink;
  constructor(
    private restClient: RestClient,
  ) { }

  ngOnInit() {
    this.docIds = [];
    this.docs = [];
    this.helpLink = environment.serverUrl;
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.DocumnetService', 'collection', 'loadDocument', {caseId: caseId}).then(res => {
      if (res.code === 1) {
        res.result.forEach(element => {
          this.docs.push({
            id : element.id,
            name : element.name
          });
          this.docIds.push(element.id);
        });
      }
    })
  }
  private createDoc (): void {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.DocAutoCreateService', 'collection', 'createDoc', {caseId: caseId}).then(res => {
      if (res.code === 1) {
        this.docIds = [];
        this.docs = [];
        this.restClient.request('npm.DocumnetService', 'collection', 'loadDocument', {caseId: caseId}).then(result => {
          if (result.code === 1) {
            result.result.forEach(element => {
              this.docs.push({
                id : element.id,
                name : element.name
              });
              this.docIds.push(element.id);
            });
          }
        })
      }
    })
  }
  private createDocument (): void {
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.DocAutoCreateService', 'collection', 'createDocument', {caseId: caseId,
      templateTypeId: '816f06764db44323b246590860b1ba3d'}).then(res => {
      if (res.code === 1) {
        this.docIds = [];
        this.docs = [];
        this.restClient.request('npm.DocumnetService', 'collection', 'loadDocument', {caseId: caseId}).then(result => {
          if (result.code === 1) {
            result.result.forEach(element => {
              this.docs.push({
                id : element.id,
                name : element.name
              });
              this.docIds.push(element.id);
            });
          }
        })
      }
    })
  }
  private print (docId): void {
    // const printData = JSON.stringify({ids: [docId], typeId: 'bd6014657f8d4c199a87013ab3f35982', fieldName: 'content'});
    // window.localStorage.setItem('print', printData);
    // window.open(environment.ctxpath + '/#/print', '_blank');
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify([docId]), '_blank');
  }
  private printAll (): void {
    window.open(environment.serverUrl + '/print/print.jsp?ids=' + JSON.stringify(this.docIds), '_blank');
  }
}
