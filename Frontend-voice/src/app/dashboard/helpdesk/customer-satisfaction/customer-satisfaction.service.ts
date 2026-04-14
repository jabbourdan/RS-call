import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class CustomerSatisfactionService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(series: number[], labels: string[]): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                const options = {
                    series: series,
                    chart: {
                        height: 152,
                        type: "donut"
                    },
                    labels: labels,
                    colors: [
                        "#AD63F6", "#C2CDFF", "#FFAA72", "#0dcaf0"
                    ],
                    stroke: {
                        width: 1,
                        show: true,
                        colors: ["transparent"]
                    },
                    legend: {
                        show: false,
                        position: 'top',
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
                            size: 7,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'diamond'
                        }
                    },
                    plotOptions: {
                        pie: {
                            expandOnClick: false,
                            donut: {
                                size: '73%',
                                labels: {
                                    show: false,
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
                        enabled: true,
                        y: {
                            formatter: function(val:any) {
                                return val + "%";
                            }
                        }
                    }
                };

                this.chartInstance = new ApexCharts(document.querySelector('#hd_customer_satisfaction_chart'), options);
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