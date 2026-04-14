import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class IncomeSourcesService {

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
                        42, 47, 52, 58
                    ],
                    chart: {
                        width: 333,
                        type: 'polarArea'
                    },
                    labels: [
                        '$95k', '$60k', '$45k', '$22k'
                    ],
                    fill: {
                        opacity: 1
                    },
                    stroke: {
                        width: 0
                    },
                    tooltip: {
                        enabled: true,
                        custom: ({ series, seriesIndex, w }: { series: number[]; seriesIndex: number; w: any }) => {
                            const category = w.globals.labels[seriesIndex];
                            const value = series[seriesIndex];
                            const total = w.globals.series.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `
                                <div style="padding: 10px; font-size: 13px; color: #333333; background: #ffffff; border-radius: 5px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);">
                                    <strong>${category}</strong><br/>
                                    Value: $${value}K<br/>
                                    Contribution: ${percentage}%
                                </div>
                            `;
                        }
                    },
                    legend: {
                        show: true,
                        position: 'left',
                        fontSize: '12px',
                        horizontalAlign: 'bottom',
                        offsetX: -24,
                        offsetY: 15,
                        customLegendItems: ['Product Sales', 'Investments', 'Salary', 'Consulting'],
                        itemMargin: {
                            horizontal: 0,
                            vertical: 5
                        },
                        labels: {
                            colors: '#ECEEF2'
                        },
                        markers: {
                            size: 6,
                            offsetX: -3,
                            offsetY: -1,
                            shape: 'square'
                        }
                    },
                    plotOptions: {
                        polarArea: {
                            rings: {
                                strokeWidth: 0
                            },
                            spokes: {
                                strokeWidth: 0
                            }
                        }
                    },
                    theme: {
                        monochrome: {
                            enabled: true,
                            shadeTo: 'light',
                            shadeIntensity: 0.6
                        }
                    },
                    dataLabels: {
                        enabled: false,
                        style: {
                            fontSize: '11px'
                        },
                        dropShadow: {
                            enabled: false
                        },
                        formatter: function (val:any, opts:any) {
                            return opts.w.globals.labels[opts.seriesIndex];
                        },
                        background: {
                            padding: 5,
                            opacity: 1,
                            foreColor: '#ffffff',
                            borderWidth: 0
                        }
                    }
                };
                // Initialize and render the chart
                const chart = new ApexCharts(document.querySelector('#income_sources_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}