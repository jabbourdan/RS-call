import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SessionsByChannelService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async initializeChart(initialData: { series: number[]; labels: string[] }): Promise<void> {
        if (this.isBrowser) {
            try {
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: initialData.series,
                    chart: {
                        height: 257,
                        type: "donut"
                    },
                    labels: initialData.labels,
                    colors: [
                        "#3584FC", "#37D80A", "#BF85FB", "#90C7FF", "#605DFF", "#FE7A36"
                    ],
                    stroke: {
                        width: 1,
                        show: true,
                        colors: ["#ffffff"]
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
                    }
                };
                this.chartInstance = new ApexCharts(document.querySelector('#sessions_by_channel_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error initializing ApexCharts:', error);
            }
        }
    }

    updateChartData(series: number[], labels: string[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: series,
                labels: labels
            });
        }
    }

}