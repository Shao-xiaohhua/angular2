import { Component, OnInit, DoCheck, Input, Output, EventEmitter } from '@angular/core';
import { Material, Materials, Page } from '../../model/material';
import { ProjectService } from '../../service/project.service';
import { OcrResultService } from '../../service/ocr-result.service';
import { RestClient } from './../../service/rest-client.service';
import { SwiperService } from '../../service/swiper.service';

@Component({
  selector: 'app-photo-swiper',
  templateUrl: './photo-swiper.component.html',
  styleUrls: ['./photo-swiper.component.scss'],
  providers: [ProjectService, OcrResultService, RestClient, SwiperService]
})

export class PhotoSwiperComponent implements OnInit, DoCheck {
  @Input() isAside: boolean;
  @Output() prevClick = new EventEmitter<any>();
  @Output() nextClick = new EventEmitter<any>();

  private materials: Materials[];
  private matterList: Page[];
  private currentMatterItem;
  private initWidth: number;
  private matterBannerWidth: number;
  private matterItemWidth: number;
  private positionValue: number;
  private matterThumWidth: number;
  private thumPosition: number;

  private thumIndex: number;
  private thumLeftIndex: number;

  private showPrev = true;
  private showNext = true;
  // 查证
  private isLoading: boolean;

  constructor(
    private _project: ProjectService,
    private ocrResultService: OcrResultService,
    private restClient: RestClient,
    private _swiper: SwiperService
  ) { }

  ngOnInit() {
    this.isLoading = false;
    this.initWidth = 100;
    this.positionValue = 0;
    this.thumPosition = 0;
    this.thumIndex = 4;
    this.thumLeftIndex = 0;
    this.matterList = [];
  }

  ngDoCheck() {
    this.matterList = this._project.getProject().materialPageHasPic;
    const thumWidth = 66
    const thumMargin = 10
    this.matterItemWidth = 100 / this.matterList.length
    this.currentMatterItem = this.matterList[this._swiper.getIndex()]
    this.matterBannerWidth = this.initWidth * this.matterList.length
    this.matterThumWidth = thumWidth * this.matterList.length + thumMargin * this.matterList.length
    if (this.matterList.length === 1) {
      this.showPrev = false;
      this.showNext = false;
    }
  }

  private updateIndex(i): void {
    this.currentMatterItem = this.matterList[i];
    this.positionValue = i * 100
    this._swiper.initIndex(i);
    this.thumPositionSlide(i);
    this.nextClick.emit(this.currentMatterItem);
  }

  private thumPositionSlide (i): void {
    if (i === this.thumIndex) {
      if (this.thumLeftIndex > (this.matterList.length - 6)) {
        return;
      }
      this.thumIndex += 1;
      this.thumLeftIndex += 1;
      this.thumPosition = 76 * this.thumLeftIndex;
    } else if (i === this.thumLeftIndex) {
      if (i === 0) {
        return;
      }
      if (this.thumLeftIndex < 0) {
        return;
      }
      this.thumLeftIndex -= 1;
      this.thumPosition = 76 * this.thumLeftIndex;
      if (this.thumLeftIndex === 0) {
        this.thumIndex = 4;
      }
    }
  }

  private next(): void {
    this._swiper.addIndex();
    if (this._swiper.getIndex() > (this.matterList.length - 1)) {
      this._swiper.initIndex(0);
      this.thumPosition = 0;
    }
    this.thumPositionSlide(this._swiper.getIndex());
    this.currentMatterItem = this.matterList[this._swiper.getIndex()];
    this.positionValue = this._swiper.getIndex() * 100;
    this.nextClick.emit(this.currentMatterItem);
  }

  private prev(): void {
    this._swiper.decIndex();
    if (this._swiper.getIndex() < 0) {
      this._swiper.initIndex(this.matterList.length - 1);
      this.thumPosition = 76 * (this.matterList.length - 5);
    }
    this.thumPositionSlide(this._swiper.getIndex());
    this.currentMatterItem = this.matterList[this._swiper.getIndex()];
    this.positionValue = this._swiper.getIndex() * 100;
    this.prevClick.emit(this.currentMatterItem);
  }

  private getOcr(): void {
    this.isLoading = true;
    let {pic} = this.currentMatterItem;
    pic = pic.substring(22);
    this.ocrResultService.getOcrResult(pic).then(res => {
      this.currentMatterItem.result = res.result;
      this.isLoading = false;
    })
  }

}
