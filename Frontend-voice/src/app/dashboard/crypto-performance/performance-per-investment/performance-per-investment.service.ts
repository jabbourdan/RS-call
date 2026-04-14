import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PerformancePerInvestmentService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: { name: string; data: { x: string; y: number[] }[] }[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: series,
                    chart: {
                        type: "rangeBar",
                        height: 411,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#3584FC"
                    ],
                    plotOptions: {
                        bar: {
                            horizontal: false
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        formatter: function (val:any) {
                            return val + "%";
                        },
                        style: {
                            fontSize: '12px',
                            fontWeight: '400'
                        }
                    },
                    legend: {
                        show: false,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
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
                    },
                    grid: {
                        show: true,
                        borderColor: "#ECEEF2"
                    },
                    xaxis: {
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
                        tickAmount: 5,
                        // max: 3000,
                        min: 0,
                        labels: {
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
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "%";
                            }
                        }
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#performance_per_investment_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: { name: string; data: { x: string; y: number[] }[] }[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series
            });
        }
    }

}