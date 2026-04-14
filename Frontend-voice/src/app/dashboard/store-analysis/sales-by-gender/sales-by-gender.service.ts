import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SalesByGenderService {

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
                    series: [70, 30],
                    chart: {
                        height: 132,
                        type: "donut"
                    },
                    labels: [
                        "Male", "Female"
                    ],
                    colors: [
                        "#3584FC", "#AD63F6"
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'right',
                        horizontalAlign: 'center',
                        offsetX: 0,
                        offsetY: 15,
                        itemMargin: {
                            horizontal: 0,
                            vertical: 5
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
                const chart = new ApexCharts(document.querySelector('#sales_by_gender_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}