import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RestClient } from 'app/service/rest-client.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss'],
  providers: [RestClient]
})
export class PrintComponent implements OnInit {

  private docList;

  constructor(
    private restClient: RestClient,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.docList = [];
    const print = window.localStorage.getItem('print');
    if (print) {
      const printData = JSON.parse(print);
      const ids = printData['ids'];
      const fieldName = printData['fieldName'];
      const typeId = printData['typeId'];
      const contents = printData['contents'];
      console.log('contents', contents);
      if (contents && contents instanceof Array) {
        contents.forEach(content => {
          if (content) {
            this.docList.push(this.sanitizer.bypassSecurityTrustHtml(content));
          }
        });
       } else {
        if (ids && ids instanceof Array) {
          ids.forEach(id => {
            const rest = this.restClient.request('dm.Entity', id, 'retrieve', { typeId: typeId });
            rest.then(result => {
              if (result) {
                this.docList.push(this.sanitizer.bypassSecurityTrustHtml(result.properties[fieldName]));
              }
            });
          });
        }
      }
    }
  }

}
