import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class OnTimeDeliveryService {

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
                    series: [
                        85, 15
                    ],
                    chart: {
                        type: 'pie',
                        height: 182
                    },
                    labels: [
                        'Delivered', 'Cancelled'
                    ],
                    colors: [
                        '#37D80A', '#FF4023'
                    ],
                    dataLabels: {
                        enabled: true,
                        style: {
                            fontSize: '11px'
                        },
                        dropShadow: {
                            enabled: false
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + '%'
                            }
                        }
                    },
                    legend: {
                        show: true,
                        position: 'left',
                        fontSize: '12px',
                        horizontalAlign: 'bottom',
                        offsetX: -25,
                        offsetY: 0,
                        itemMargin: {
                            horizontal: 0,
                            vertical: 5
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -2,
                            offsetY: .5,
                            shape: 'square'
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#on_time_delivery_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}