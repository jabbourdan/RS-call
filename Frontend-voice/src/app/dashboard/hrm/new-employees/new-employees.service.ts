import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class NewEmployeesService {

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
                        width: 125,
                        height: 125,
                        type: "radialBar"
                    },
                    series: [
                        30
                    ],
                    colors: [
                        "#9135E8"
                    ],
                    plotOptions: {
                        radialBar: {
                            track: {
                                background: "#EDEEF0"
                            },
                            dataLabels: {
                                name: {
                                    show: false
                                },
                                value: {
                                    show: true,
                                    offsetY: 5,
                                    fontWeight: 500,
                                    color: "#9135E8",
                                    fontSize: "14px"
                                }
                            }
                        }
                    },
                    stroke: {
                        lineCap: 'round'
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#new_employees_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}