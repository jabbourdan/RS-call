import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class NewAdmissionsService {
    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(data: number[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: data,
                    chart: {
                        height: 380,
                        type: 'donut'
                    },
                    labels: ['Music', 'History', 'Art', 'English', 'Mathematics'],
                    colors: ['#90C7FF', '#AD63F6', '#605DFF', '#FD5812', '#37D80A'],
                    stroke: {
                        show: false
                    },
                    plotOptions: {
                        pie: {
                            expandOnClick: false,
                            donut: {
                                size: '75%',
                                labels: {
                                    show: true,
                                    name: {
                                        color: '#64748B'
                                    },
                                    value: {
                                        show: true,
                                        color: '#3A4252',
                                        fontSize: '28px',
                                        fontWeight: '600'
                                    },
                                    total: {
                                        show: true,
                                        color: '#64748B'
                                    }
                                }
                            }
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        show: true,
                        fontSize: '13px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 10,
                            vertical: 9
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 7,
                            offsetX: -2,
                            offsetY: -0.5,
                            shape: 'diamond'
                        },
                        formatter: function (seriesName: any, opts: any) {
                            return (
                                seriesName +
                                ': <strong>' +
                                    opts.w.globals.series[opts.seriesIndex] +
                                '</strong>'
                            );
                        }
                    }
                };

                // Destroy existing chart instance (if any)
                if (this.chartInstance) {
                    this.chartInstance.destroy();
                }

                // Initialize and render the chart
                const chart = new ApexCharts(
                    document.querySelector('#new_admissions_chart'),
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