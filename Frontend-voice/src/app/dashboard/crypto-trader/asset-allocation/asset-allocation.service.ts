import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class AssetAllocationService {

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
                    series: [30, 25, 20, 15, 10],
                    chart: {
                        height: 205,
                        type: "pie"
                    },
                    labels: [
                        "BTC 30%", "ETH 25%", "USDC 20%", "ADA 15%", "SHIB 10%"
                    ],
                    colors: [
                        "#605DFF", "#757DFF", "#9CAAFF", "#C2CDFF", "#DDE4FF"
                    ],
                    legend: {
                        show: true,
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 8
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
                const chart = new ApexCharts(document.querySelector('#ct_asset_allocation_chart'), options);
                chart.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

}