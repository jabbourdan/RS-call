import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PerformanceOverviewService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: { name: string, data: number[][] }[], xaxisRange: { min: number, max: number }): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: series,
                    chart: {
                        type: 'bubble',
                        height: 369,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        '#757DFF', '#5DA8FF', '#BF85FB', '#1E8308', '#FE7A36', '#174EDE'
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    grid: {
                        show: true,
                        strokeDashArray: 7,
                        borderColor: "#ECEEF2"
                    },
                    xaxis: {
                        tickAmount: 4,
                        min: xaxisRange.min,
                        max: xaxisRange.max,
                        axisTicks: {
                            show: false,
                            color: '#DDE4FF'
                        },
                        axisBorder: {
                            show: true,
                            color: '#DDE4FF'
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
                            show: true,
                            color: '#DDE4FF'
                        },
                        axisTicks: {
                            show: false,
                            color: '#DDE4FF'
                        }
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
                    // tooltip: {
                    //     y: {
                    //         formatter: function(val) {
                    //             return "$" + val + "k";
                    //         }
                    //     }
                    // }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#performance_overview_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: { name: string, data: number[][] }[], xaxisRange: { min: number, max: number }): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series,
                xaxis: {
                    min: xaxisRange.min,
                    max: xaxisRange.max
                }
            });
        }
    }

}