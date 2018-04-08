import { Component, OnInit } from '@angular/core';
import { RestClient } from './../../service/rest-client.service';
import { SafeHtml } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss'],
  providers: [RestClient]
})
export class ArchivesComponent implements OnInit {
  private barCode: string;
  private index: number;

  private noteContent: SafeHtml;

  constructor(private sanitizer: DomSanitizer, private restClient: RestClient) { }

  ngOnInit() {
    this.index = 0;
    const checkCode: string = window.localStorage.getItem('CHECKCODE');
    this.barCode = `${environment.restServiceUrl}npm.CodeImageService/collection/barcode?unicode=${checkCode}`;
    const caseId = window.localStorage.getItem('caseId');
    this.restClient.request('npm.RiskInformedService', 'collection', 'loadRiskInformed', {caseId}).then(res => {
      if (res.code === 1) {
        this.noteContent = this.sanitizer.bypassSecurityTrustHtml(res.result.properties.content)
      }
    })
  }

  private nextPage () {
    this.index++;
  }

  private prevPage () {
    this.index--;
  }

  private goto (index) {
    this.index = index;
  }

}
