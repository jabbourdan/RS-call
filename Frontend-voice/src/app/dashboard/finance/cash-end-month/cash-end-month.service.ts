import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class CashEndMonthService {

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
                        42.9, 20.0, 37.1
                    ],
                    chart: {
                        type: 'donut',
                        height: 240
                    },
                    labels: [
                        'Cash Inflows', 'Cash Outflows', 'Remaining Cash'
                    ],
                    colors: [
                        '#37D80A', '#FD5812', '#605DFF'
                    ],
                    stroke: {
                        width: 0
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
                        enabled: true,
                        style: {
                            fontSize: '12px'
                        },
                        dropShadow: {
                            enabled: false
                        },
                        formatter: function (val:any) {
                            return val.toFixed(1) + '%';
                        },
                        offset: 0,
                        textAnchor: 'middle'
                    },
                    tooltip: {
                        y: {
                            formatter: function(val:any) {
                                return val + "%";
                            }
                        }
                    },
                    legend: {
                        show: true,
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
                const chart = new ApexCharts(document.querySelector('#cash_end_month_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}