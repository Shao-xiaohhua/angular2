import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RestClient } from 'app/service/rest-client.service';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers: [RestClient]
})
export class ReportComponent implements OnInit {
  checkCode;
  barCode;
  reportList
  constructor(
    private restClient: RestClient
  ) { }

  ngOnInit() {
    this.checkCode = window.localStorage.getItem('CHECKCODE');
    this.barCode = environment.restServiceUrl + 'npm.CodeImageService/collection/barcode?unicode=' + this.checkCode;
    this.reportList = [];
    const report = window.localStorage.getItem('report');
    if (report) {
      const reportData = JSON.parse(report);
      const caseId = reportData['caseId'];
      const partyId = reportData['partyId'];
      const rest = this.restClient.request('npm.IdentityVerificationService', 'collection', 'loadVerification',
      { caseId: caseId, partyId: partyId });
      rest.then(result => {
        if (result) {
          // this.reportList.push(result.result)
          this.reportList = result.result;
        }
      });
    }
  }

}
