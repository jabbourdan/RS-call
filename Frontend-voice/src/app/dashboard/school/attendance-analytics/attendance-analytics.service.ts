import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AttendanceAnalyticsService {
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
                        height: 353,
                        stacked: true,
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: true
                        }
                    },
                    plotOptions: {
                        bar: {
                            borderRadius: 7,
                            horizontal: false,
                            columnWidth: '15px',
                            borderRadiusApplication: 'end'
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    colors: ['#605DFF', '#9CAAFF', '#DDE4FF'],
                    grid: {
                        show: true,
                        strokeDashArray: 7,
                        borderColor: '#ECEEF2'
                    },
                    xaxis: {
                        categories: categories,
                        axisTicks: {
                            show: false,
                            color: '#D5D9E2'
                        },
                        axisBorder: {
                            show: true,
                            color: '#D5D9E2'
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
                        min: 0,
                        labels: {
                            style: {
                                colors: '#64748B',
                                fontSize: '12px'
                            }
                        },
                        axisBorder: {
                            show: true,
                            color: '#D5D9E2'
                        },
                        axisTicks: {
                            show: false,
                            color: '#D5D9E2'
                        }
                    },
                    legend: {
                        show: true,
                        position: 'top',
                        fontSize: '12px',
                        horizontalAlign: 'left',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 5
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

                // Destroy existing chart instance (if any)
                if (this.chartInstance) {
                    this.chartInstance.destroy();
                }

                // Initialize and render the chart
                const chart = new ApexCharts(
                    document.querySelector('#attendance_analytics_chart'),
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