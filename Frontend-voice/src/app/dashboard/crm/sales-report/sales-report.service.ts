import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SalesReportService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: { name: string; data: number[] }[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series,
                    chart: {
                        height: 360,
                        type: "line",
                        zoom: {
                            enabled: false
                        },
                        toolbar: {
                            show: true
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    colors: [
                        "#605DFF", "#FE7A36"
                    ],
                    stroke: {
                        curve: "straight",
                        width: 2
                    },
                    grid: {
                        show: true,
                        borderColor: "#F6F7F9"
                    },
                    markers: {
                        size: 4,
                        strokeWidth: 0,
                        shape: ["circle", "square"],
                        hover: {
                            size: 5
                        }
                    },
                    xaxis: {
                        categories,
                        axisTicks: {
                            show: false,
                            color: '#B1BBC8'
                        },
                        axisBorder: {
                            show: false,
                            color: '#B1BBC8'
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
                        // tickAmount: 6,
                        // max: 150,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val + 'k'
                            },
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
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
                    }
                };
                this.chartInstance = new ApexCharts(document.querySelector('#crm_sales_report_chart'), options);
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
                xaxis: {
                    categories
                }
            });
        }
    }

}