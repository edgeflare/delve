import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { options } from './option';

@Component({
  selector: 'e-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  template: `<div style="height: calc(100vh - 4rem);" echarts [options]="options"></div>`,
  styles: ``,
  providers: [
    provideEcharts(),
  ]
})
export class ChartComponent implements OnInit {
  options!: EChartsOption;

  ngOnInit(): void {
    this.options = options;
  }
}