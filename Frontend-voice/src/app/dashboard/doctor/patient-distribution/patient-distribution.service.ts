import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PatientDistributionService {

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
                        height: 304,
                        type: "donut"
                    },
                    labels: labels,
                    colors: [
                        "#605DFF", "#58F229", "#5DA8FF"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        width: 5,
                        show: true,
                        colors: ["#ffffff"]
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
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 8
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

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#patient_distribution_chart'), options);
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