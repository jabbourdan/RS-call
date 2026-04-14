import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PerformanceMetricsService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: { name: string; data: number[] }[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: series,
                    chart: {
                        height: 371,
                        type: "line",
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#37D80A", "#FF4023", "#605DFF"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        width: 2,
                        curve: "smooth",
                        dashArray: [0, 0, 0]
                    },
                    markers: {
                        size: 3,
                        hover: {
                            sizeOffset: 3
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val + "k";
                            }
                        }
                    },
                    grid: {
                        show: true,
                        borderColor: "#ECEEF2"
                    },
                    xaxis: {
                        categories: categories,
                        axisTicks: {
                            show: true,
                            color: '#64748B'
                        },
                        axisBorder: {
                            show: true,
                            color: '#64748B'
                        },
                        labels: {
                            show: true,
                            style: {
                                colors: "#3A4252",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        // tickAmount: 5,
                        // max: 3000,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return "$" + val + "k";
                            },
                            style: {
                                colors: "#3A4252",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#64748B'
                        },
                        axisTicks: {
                            show: false,
                            color: '#64748B'
                        }
                    },
                    legend: {
                        show: true,
                        position: 'bottom',
                        fontSize: '12px',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 10,
                            vertical: 10
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

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#performance_metrics_chart'), options);
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