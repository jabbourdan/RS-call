import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class TopPerformingService {

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
                        35000, 25000, 18000
                    ],
                    chart: {
                        type: 'donut',
                        height: 200
                    },
                    labels: [
                        'Electronics', 'Clothing', 'Home Goods'
                    ],
                    colors: [
                        '#AD63F6', '#37D80A', '#3584FC'
                    ],
                    stroke: {
                        width: 2
                    },
                    plotOptions: {
                        pie: {
                            endAngle: 90,
                            startAngle: -90,
                            expandOnClick: false,
                            donut: {
                                size: '65%'
                            },
                        }
                    },
                    dataLabels: {
                        enabled: false,
                        style: {
                            fontSize: '12px'
                        },
                        dropShadow: {
                            enabled: false
                        },
                        formatter: function (val:any) {
                            return '$' + val.toFixed(1);
                        },
                        offset: 0,
                        textAnchor: 'middle'
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return "$" + val;
                            }
                        }
                    },
                    legend: {
                        show: false,
                        position: 'bottom',
                        fontSize: '12px',
                        horizontalAlign: 'center',
                        offsetX: 0,
                        offsetY: -95,
                        itemMargin: {
                            horizontal: 8,
                            vertical: 0
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 6,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'square'
                        }
                    }
                };
                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#pos_system_top_performing_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}