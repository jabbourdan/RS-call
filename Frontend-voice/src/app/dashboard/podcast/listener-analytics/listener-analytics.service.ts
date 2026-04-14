import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ListenerAnalyticsService {

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
                    series: series,
                    chart: {
                        type: "bar",
                        height: 360,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#9747FF", "#9CAAFF"
                    ],
                    plotOptions: {
                        bar: {
                            borderRadius: 5,
                            columnWidth: "35%",
                            borderRadiusApplication: 'end'
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        width: 5,
                        show: true,
                        colors: ["transparent"]
                    },
                    xaxis: {
                        categories: categories,
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        axisBorder: {
                            show: true,
                            color: '#D5D9E2'
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
                        // min: 0,
                        // max: 60,
                        tickAmount: 3,
                        labels: {
                            show: true,
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            },
                            formatter: (val:any) => {
                                return val + '%'
                            }
                        },
                        axisBorder: {
                            show: true,
                            color: '#D5D9E2'
                        },
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
                        }
                    },
                    fill: {
                        opacity: 1
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "%";
                            }
                        }
                    },
                    legend: {
                        show: true,
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'left',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 45
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
                    grid: {
                        show: true,
                        strokeDashArray: 10,
                        borderColor: "#ECEEF2"
                    }
                };
                this.chartInstance = new ApexCharts(document.querySelector('#listener_analytics_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: { name: string; data: number[] }[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series,
                xaxis: { categories: categories }
            });
        }
    }

}