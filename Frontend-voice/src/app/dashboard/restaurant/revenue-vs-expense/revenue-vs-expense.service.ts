import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class RevenueVsExpenseService {

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
                        type: "bar",
                        height: 335,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#FFAA72", "#90C7FF"
                    ],
                    plotOptions: {
                        bar: {
                            borderRadius: 5,
                            horizontal: false,
                            columnWidth: "50%",
                            borderRadiusApplication: "end",
                            borderRadiusWhenStacked: "all"
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
                    grid: {
                        show: true,
                        borderColor: "#ECF0FF"
                    },
                    xaxis: {
                        categories: categories,
                        axisTicks: {
                            show: true,
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
                        // max: 90,
                        min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val + 'k'
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
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val + "k";
                            }
                        }
                    },
                    legend: {
                        show: true,
                        position: 'bottom',
                        fontSize: '12px',
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
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#restaurant_revenue_vs_expense_chart'), options);
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