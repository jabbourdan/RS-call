import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class TopShippingMethodsService {

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
                        45, 30, 15, 10
                    ],
                    chart: {
                        height: 180,
                        type: "pie",
                    },
                    labels: [
                        "Air", "Road", "Sea", "Rail"
                    ],
                    colors: [
                        "#3584FC", "#FD5812", "#605DFF", "#37D80A"
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
                    plotOptions: {
                        pie: {
                            expandOnClick: false
                        }
                    },
                    stroke: {
                        width: 1,
                        show: true,
                        colors: ["#ffffff"]
                    },
                    legend: {
                        show: true,
                        position: 'right',
                        fontSize: '12px',
                        horizontalAlign: 'bottom',
                        offsetX: 0,
                        offsetY: -15,
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
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + '%'
                            }
                        }
                    }
                };

                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#top_shipping_methods_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}