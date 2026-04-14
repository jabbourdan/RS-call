import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class RoomsAvailabilityService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(percentage: number): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: [percentage],
                    chart: {
                        height: 380,
                        type: "radialBar"
                    },
                    plotOptions: {
                        radialBar: {
                            startAngle: -135,
                            endAngle: 135,
                            dataLabels: {
                                name: {
                                    offsetY: -10,
                                    fontSize: "14px",
                                    color: '#64748B',
                                    fontWeight: "400"
                                },
                                value: {
                                    fontSize: "36px",
                                    color: '#3A4252',
                                    fontWeight: "700",
                                    formatter: function(val:any) {
                                        return val + "%";
                                    }
                                }
                            },
                            track: {
                                background: '#EEFFE5'
                            }
                        }
                    },
                    colors: [
                        "#37D80A"
                    ],
                    labels: [
                        "Total Booked"
                    ],
                    stroke: {
                      dashArray: 7
                    }
                };

                // Initialize and render the chart
                this.chartInstance = new ApexCharts(document.querySelector('#rooms_availability_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChart(percentage: number): void {
        if (this.chartInstance) {
            this.chartInstance.updateOptions({
                series: [percentage]
            });
        }
    }

}