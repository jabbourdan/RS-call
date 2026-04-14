import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ComparativeAnalysisService {

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
                        height: 385,
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
                        borderColor: "#ECEEF2"
                    },
                    fill: {
                        opacity: 1
                    },
                    xaxis: {
                        tickAmount: 8,
                        min: xaxisRange.min,
                        max: xaxisRange.max,
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
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 10,
                            vertical: 8
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
                this.chartInstance = new ApexCharts(document.querySelector('#comparative_analysis_chart'), options);
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