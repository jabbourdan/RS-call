import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class RevenueService {

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
                    series: [80, 20],
                    chart: {
                        height: 90,
                        type: "donut"
                    },
                    labels: [
                        "Revenue", "Revenue"
                    ],
                    colors: [
                        "#58F229", "#D8FFC8"
                    ],
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val + "M";
                            }
                        }
                    },
                    stroke: {
                        width: 0
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
                    dataLabels: {
                        enabled: false
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#restaurant_revenue_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}