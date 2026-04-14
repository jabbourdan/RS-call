import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ActiveUsersService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(seriesData: number[], categories: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [
                        {
                            name: "Users",
                            data: seriesData
                        }
                    ],
                    chart: {
                        type: "bar",
                        height: 320,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: [
                        "#605DFF"
                    ],
                    plotOptions: {
                        bar: {
                            borderRadius: 5,
                            columnWidth: "12px"
                        }
                    },
                    grid: {
                        show: true,
                        borderColor: "#ECF0FF"
                    },
                    dataLabels: {
                        enabled: false
                    },
                    xaxis: {
                        categories: categories,
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
                                return val + 'K'
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
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "k";
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
                            offsetY: -0.5,
                            shape: 'diamond'
                        }
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#active_users_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(seriesData: number[], categories: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: [
                    {
                        name: "Users",
                        data: seriesData
                    }
                ],
                xaxis: {
                    categories: categories
                }
            });
        }
    }

}