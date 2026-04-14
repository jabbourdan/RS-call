import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class EmployeeWorkFormatService {
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
                        height: 215,
                        type: "donut"
                    },
                    labels: ["Remote", "In-office", "Hybrid", "Shift"],
                    colors: ["#FD5812", "#605DFF", "#37D80A", "#AD63F6"],
                    stroke: {
                        width: 1,
                        show: true,
                        colors: ["#ffffff"]
                    },
                    legend: {
                        show: false
                    },
                    plotOptions: {
                        pie: {
                            expandOnClick: false,
                            donut: {
                                labels: {
                                    show: true,
                                    name: {
                                        color: '#64748B'
                                    },
                                    value: {
                                        show: true,
                                        color: '#3A4252',
                                        fontSize: '22px',
                                        fontWeight: '600',
                                        offsetY: 2
                                    },
                                    total: {
                                        show: true,
                                        fontSize: '14px',
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
                    }
                };

                // Destroy the existing chart instance (if any)
                if (this.chartInstance) {
                    this.chartInstance.destroy();
                }

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#employee_work_format_chart'), options);
                chart.render();
                this.chartInstance = chart;
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }
}