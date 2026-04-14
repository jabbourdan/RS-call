import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class RealTimeSalesService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: any[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: series,
                    chart: {
                        height: 240,
                        type: "bar",
                        toolbar: {
                            show: false
                        }
                    },
                    plotOptions: {
                        bar: {
                            borderRadius: 5,
                            horizontal: false,
                            columnWidth: '22px',
                            borderRadiusApplication: 'around',
                            borderRadiusWhenStacked: 'all',
                            dataLabels: {
                                position: "top" // top, center, bottom
                            }
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        formatter: function(val:any) {
                            return val + "%";
                        },
                        offsetY: -20,
                        style: {
                            fontSize: "10px",
                            colors: ["#64748B"]
                        }
                    },
                    xaxis: {
                        show: false,
                        categories: categories,
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        axisBorder: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        labels: {
                            show: false,
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        }
                    },
                    colors: [
                        "#3584FC"
                    ],
                    yaxis: {
                        // tickAmount: 5,
                        show: false,
                        // max: 11,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return val + '%'
                            },
                            style: {
                                colors: "#64748B",
                                fontSize: "12px"
                            }
                        },
                        axisBorder: {
                            show: false,
                            color: '#ECEEF2'
                        },
                        axisTicks: {
                            show: false,
                            color: '#ECEEF2'
                        }
                    },
                    grid: {
                        show: false,
                        borderColor: "#ECEEF2"
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#real_time_sales_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChartData(series: any[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series,
                xaxis: {
                    categories: categories
                }
            });
        }
    }

}