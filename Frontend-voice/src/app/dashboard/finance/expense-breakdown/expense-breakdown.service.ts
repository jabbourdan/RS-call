import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ExpenseBreakdownService {

    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    chart: {
                        type: 'pie',
                        height: 231,
                    },
                    series: [
                        30, 25, 20, 25
                    ],
                    labels: [
                        'Sales', 'Salaries', 'Miscellaneous', 'Marketing'
                    ],
                    colors: [
                        '#AD63F6', '#BF85FB', '#D7B5FD', '#E9D5FF'
                    ],
                    legend: {
                        show: true,
                        position: 'bottom',
                        fontSize: '12px',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'square'
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '12px'
                        },
                        dropShadow: {
                            enabled: false
                        }
                    },
                    stroke: {
                        width: 0,
                    },
                    tooltip: {
                        enabled: true,
                        y: {
                            formatter: function (val:any) {
                                return val + "%";
                            }
                        }
                    },
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                offset: -5
                            },
                            expandOnClick: true
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#expense_breakdown_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}