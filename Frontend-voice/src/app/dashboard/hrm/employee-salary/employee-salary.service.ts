import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class EmployeeSalaryService {

    private isBrowser: boolean;
    private chart: any; // Reference to the chart instance

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
                        height: 298,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: series[0].data.map((_, index) =>
                        index === Math.floor(series[0].data.length / 2) ? '#9135E8' : '#E9D5FF'
                    ),
                    plotOptions: {
                        bar: {
                            columnWidth: "22px",
                            borderRadius: 4,
                            distributed: true,
                            horizontal: false
                        }
                    },
                    grid: {
                        show: false,
                        borderColor: "#ECEEF2"
                    },
                    dataLabels: {
                        enabled: false
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
                        show: false,
                        // tickAmount: 5,
                        labels: {
                            formatter: (val:any) => {
                                return '$' + val + 'K'
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
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val + "k";
                            }
                        }
                    },
                    legend: {
                        show: false,
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

                this.chart = new ApexCharts(document.querySelector('#employee_salary_chart'), options);
                this.chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: { name: string; data: number[] }[], categories: string[]): void {
        if (this.chart) {
            this.chart.updateOptions({
                series: series,
                xaxis: {
                    categories: categories
                }
            });
        }
    }

}