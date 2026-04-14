import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class PatientByAgeService {

    private isBrowser: boolean;
    private chartInstance: any;

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    async loadChart(seriesData: number[]): Promise<void> {
        if (this.isBrowser) {
            try {
                // Dynamically import ApexCharts
                const ApexCharts = (await import('apexcharts')).default;

                // Define chart options
                const options = {
                    series: seriesData,
                    chart: {
                        height: 295,
                        type: "pie"
                    },
                    labels: [
                        "0-18 Years", "19-40 Years", "41-60 Years", "60+ Years"
                    ],
                    colors: [
                        "#AD63F6", "#605DFF", "#25B003", "#3584FC"
                    ],
                    dataLabels: {
                        enabled: true,
                        formatter: function (val:any) {
                            return val + "%";
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
                        fontSize: '12px',
                        position: 'bottom',
                        horizontalAlign: 'center',
                        itemMargin: {
                            horizontal: 8,
                            vertical: 7
                        },
                        labels: {
                            colors: '#64748B'
                        },
                        markers: {
                            size: 7,
                            offsetX: -2,
                            offsetY: -.5,
                            shape: 'diamond'
                        },
                        formatter: function(seriesName:any, opts:any) {
                            return [seriesName, ":", opts.w.globals.series[opts.seriesIndex], "%"]
                        },
                        onItemClick: {
                            toggleDataSeries: false
                        },
                        onItemHover: {
                            highlightDataSeries: false
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
                this.chartInstance = new ApexCharts(document.querySelector('#patient_by_age_chart'), options);
                this.chartInstance.render();
            } catch (error) {
                console.error('Error loading ApexCharts:', error);
            }
        }
    }

    updateChartData(seriesData: number[]): void {
        if (this.chartInstance) {
            this.chartInstance.updateSeries(seriesData);
        }
    }

}