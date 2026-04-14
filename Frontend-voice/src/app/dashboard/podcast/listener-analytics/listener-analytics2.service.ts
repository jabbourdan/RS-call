import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ListenerAnalytics2Service {

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
                    series: [75, 25],
                    chart: {
                        height: 80,
                        type: "donut"
                    },
                    labels: [
                        "Men", "Woman"
                    ],
                    stroke: {
                        width: 0,
                        show: true,
                        colors: ["#ffffff"]
                    },
                    colors: [
                        "#AD63F6", "#3584FC"
                    ],
                    plotOptions: {
                        pie: {
                            expandOnClick: false,
                            donut: {
                                size: '80%'
                            }
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'right',
                        horizontalAlign: 'center',
                        offsetX: -9,
                        offsetY: -5,
                        itemMargin: {
                            horizontal: 0,
                            vertical: 5
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 5,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'circle'
                        },
                        customLegendItems: ['Men: 75%', 'Women: 25%'],
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#listener_analytics_chart2'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}