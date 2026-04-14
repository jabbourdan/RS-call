import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class IncomeVsExpenseService {

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
                        type: 'bar',
                        height: 336,
                        stacked: true,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        '#4936F5', '#C2CDFF'
                    ],
                    plotOptions: {
                        bar: {
                            borderRadius: 3,
                            columnWidth: '24px',
                            borderRadiusApplication: "end",
                            borderRadiusWhenStacked: "all"
                        }
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    grid: {
                        show: true,
                        strokeDashArray: 7,
                        borderColor: "#ECEEF2"
                    },
                    xaxis: {
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
                            show: true,
                            style: {
                                colors: "#8695AA",
                                fontSize: "12px"
                            }
                        }
                    },
                    yaxis: {
                        // tickAmount: 5,
                        // max: 50,
                        // min: 0,
                        labels: {
                            formatter: (val:any) => {
                                return val + 'K'
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
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 15
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
                    // tooltip: {
                    //     y: {
                    //         formatter: function (value) {
                    //             return Math.abs(value) + "k followers";  // Ensure that negative values appear as positive in the tooltip
                    //         }
                    //     }
                    // }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#income_vs_expense_chart'), options);
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