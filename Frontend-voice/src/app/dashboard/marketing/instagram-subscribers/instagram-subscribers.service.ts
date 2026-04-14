import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class InstagramSubscribersService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: { name: string; data: number[] }[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                const options = {
                    series,
                    chart: {
                        type: 'bar',
                        height: 374,
                        stacked: true,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        '#605DFF', '#C2CDFF'
                    ],
                    plotOptions: {
                        bar: {
                            borderRadius: 3,
                            columnWidth: '24px',
                            borderRadiusApplication: "end",
                            borderRadiusWhenStacked: "all"
                        }
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    grid: {
                        show: true,
                        strokeDashArray: 7,
                        borderColor: "#ECEEF2"
                    },
                    legend: {
                        show: true,
                        position: 'bottom',
                        fontSize: '12px',
                        horizontalAlign: 'left',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 8
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 7,
                            offsetX: -2,
                            offsetY: -0.5,
                            shape: 'diamond'
                        }
                    },
                    xaxis: {
                        categories,
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        axisBorder: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        // tickAmount: 5,
                        // max: 50,
                        // min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return val + 'K'
                            },
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#DDE4FF'
                        },
                        axisTicks: {
                            show: false,
                            color: '#DDE4FF'
                        }
                    },
                    // tooltip: {
                    //     y: {
                    //         formatter: function (value) {
                    //             return Math.abs(value) + "k followers";  // Ensure that negative values appear as positive in the tooltip
                    //         }
                    //     }
                    // }
                };

                this.chartInstance = new ApexCharts(document.querySelector('#instagram_subscribers_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: { name: string; data: number[] }[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series,
                xaxis: { categories }
            });
        }
    }

}