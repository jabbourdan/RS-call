import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SpendingBreakdownService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: number[], labels: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: series,
                    chart: {
                        height: 284,
                        type: "donut"
                    },
                    labels: labels,
                    colors: [
                        "#37D80A", "#FE7A36", "#3584FC", "#FF4023", "#AD63F6", "#605DFF"
                    ],
                    stroke: {
                        width: 2,
                        show: true,
                        colors: ["#ffffff"]
                    },
                    dataLabels: {
                        enabled: false
                    },
                    plotOptions: {
                        pie: {
                            expandOnClick: false,
                            donut: {
                                labels: {
                                    show: false,
                                    name: {
                                        color: '#64748B'
                                    },
                                    value: {
                                        show: true,
                                        color: '#3A4252',
                                        fontSize: '28px',
                                        fontWeight: '600',
                                        formatter: (val:any, opts:any) => {
                                            const total = opts.w.globals.seriesTotals.reduce((a:any, b:any) => a + b, 0);
                                            const percentage = ((val / total) * 100).toFixed(1); // Calculate percentage
                                            return `${val}k (${percentage}%)`; // Show value in currency + percentage
                                        }
                                    },
                                    total: {
                                        show: true,
                                        color: '#64748B',
                                        formatter: (w:any) => {
                                            return `${w.globals.seriesTotals.reduce((a:any, b:any) => a + b, 0)}k`; // Show total in currency
                                        }
                                    }
                                }
                            }
                        }
                    },
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'left',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 0,
                            vertical: 7
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
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "%";
                            }
                        }
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#cc_spending_breakdown_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(series: number[], labels: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series,
                labels: labels
            });
        }
    }

}