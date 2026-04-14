import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class StudentsOverviewService {
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
                        type: 'bar',
                        height: 302,
                        stacked: true,
                        toolbar: {
                            show: false
                        }
                    },
                    colors: ['#3584FC', '#FD5812'],
                    plotOptions: {
                        bar: {
                            borderRadius: 6,
                            columnWidth: '12px',
                            borderRadiusApplication: 'end',
                            borderRadiusWhenStacked: 'all'
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    grid: {
                        strokeDashArray: 7,
                        borderColor: '#ECEEF2',
                        xaxis: {
                            lines: {
                                show: true
                            }
                        },
                        yaxis: {
                            lines: {
                                show: false
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
                            offsetY: -0.5,
                            shape: 'diamond'
                        }
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
                                colors: '#8695AA',
                                fontSize: '12px'
                            }
                        }
                    },
                    yaxis: {
                        show: false,
                        labels: {
                            style: {
                                colors: '#64748B',
                                fontSize: '12px'
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
                            formatter: function (value: any) {
                                return Math.abs(value); // Display absolute values in the tooltip
                            }
                        }
                    }
                };

                // Destroy existing chart instance (if any)
                if (this.chartInstance) {
                    this.chartInstance.destroy();
                }

                // Initialize and render the chart
                const chart = new ApexCharts(
                    document.querySelector('#students_overview_chart'),
                    options
                );
                chart.render();
                this.chartInstance = chart;
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }
}