import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class TodaysPaymentService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: any[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                const options = {
                    series,
                    chart: {
                        type: "area",
                        height: 320,
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#ffffff"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: "smooth",
                        width: [2, 2, 0],
                        dashArray: [0, 6, 0]
                    },
                    grid: {
                        show: true,
                        borderColor: "#ffffff1a"
                    },
                    fill: {
                        type: 'gradient',
                        gradient: {
                            stops: [0, 90, 100],
                            shadeIntensity: 1,
                            opacityFrom: 0.5,
                            opacityTo: 0.2
                        }
                    },
                    xaxis: {
                        categories,
                        axisTicks: {
                            show: false,
                            color: '#ffffff1a'
                        },
                        axisBorder: {
                            show: false,
                            color: '#ffffff1a'
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
                        tickAmount: 5,
                        // max: 100,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val + 'K'
                            },
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#ffffff1a'
                        },
                        axisTicks: {
                            show: false,
                            color: '#ffffff1a'
                        }
                    },
                    legend: {
                        show: true,
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'left',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'circle'
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "k";
                            }
                        },
                        marker: {
                            show: true,
                            fillColors: ['#BE84F9']
                        }
                    }
                };
                this.chartInstance = new ApexCharts(document.querySelector('#todays_payment_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: any[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series,
                xaxis: { categories }
            });
        }
    }

}