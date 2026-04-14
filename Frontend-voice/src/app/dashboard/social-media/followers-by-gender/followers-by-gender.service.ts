import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class FollowersByGenderService {

    private isBrowser: boolean;
    private chart: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(data: number[]): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: data,
                    chart: {
                        height: 205,
                        type: "pie"
                    },
                    labels: [
                        "Male Followers", "Female Followers"
                    ],
                    colors: [
                        "#605DFF", "#AD63F6"
                    ],
                    legend: {
                        show: false,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 7,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'diamond'
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "%";
                            }
                        }
                    },
                    stroke: {
                        width: 1
                    }
                };
                
                this.chart = new ApexCharts(document.querySelector('#followers_by_gender_chart'), options);
                this.chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    async updateChart(data: number[]): Promise<void> {
        if (this.chart) {
            this.chart.updateSeries(data);
        } else {
            await this.loadChart(data);
        }
    }

}