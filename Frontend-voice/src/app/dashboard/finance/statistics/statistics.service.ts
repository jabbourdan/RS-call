import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class StatisticsService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: any[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
          try {
            const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series,
                    chart: {
                        type: "bar",
                        height: 402,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#9CAAFF", "#605DFF"
                    ],
                    plotOptions: {
                        bar: {
                            columnWidth: "19.96px"
                        }
                    },
                    grid: {
                        show: true,
                        borderColor: "#F6F7F9"
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        width: 4,
                        show: true,
                        colors: ["transparent"]
                    },
                    xaxis: {
                        categories,
                        axisTicks: {
                            show: true,
                            color: '#F6F7F9'
                        },
                        axisBorder: {
                            show: false,
                            color: '#F6F7F9'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        tickAmount: 6,
                        // max: 1200,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val;
                            },
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#F6F7F9'
                        },
                        axisTicks: {
                            show: false,
                            color: '#F6F7F9'
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val;
                            }
                        }
                    },
                    legend: {
                        show: true,
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'center',
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
                            shape: 'square'
                        }
                    }
                };
                this.chartInstance = new ApexCharts(document.querySelector('#statistics_chart'), options);
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