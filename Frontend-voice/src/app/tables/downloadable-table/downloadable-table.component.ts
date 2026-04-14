import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-downloadable-table',
    imports: [],
    templateUrl: './downloadable-table.component.html',
    styleUrl: './downloadable-table.component.scss'
})
export class DownloadableTableComponent {

    // Download Table as PDF
    downloadPDF() {
        const doc = new jsPDF();
        
        // Get the table element by ID (or querySelector)
        const table = document.getElementById('my-table');

        // Add title or any additional text to the PDF
        doc.text('Static Table Data', 20, 10);

        // Use jsPDF-AutoTable to convert the HTML table to PDF
        (doc as any).autoTable({
            html: '#my-table', // This will automatically extract the table structure from HTML
            startY: 20, // Optional: set where the table should start
        });

        // Save the generated PDF
        doc.save('static-table-data.pdf');
    }

    // Download Table as CSV
    downloadCSV() {
        const table = document.getElementById('my-table') as HTMLTableElement;
        let csv = '';
        
        // Loop through table rows (thead and tbody)
        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];
            const cells = row.cells;
            const rowData = [];

            // Loop through each cell in the row and format the data
            for (let j = 0; j < cells.length; j++) {
                rowData.push(cells[j].innerText);
            }

            // Join the data as a comma-separated string and add to CSV
            csv += rowData.join(',') + '\n';
        }

        // Create a Blob object with the CSV content and trigger a download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table-data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Download Table as Excel
    downloadExcel() {
        // Get the table element
        const table = document.getElementById('my-table') as HTMLTableElement;

        // Create a new workbook
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();

        // Convert the HTML table to a worksheet
        const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TableData');

        // Generate and download the Excel file
        XLSX.writeFile(workbook, 'table-data.xlsx');
    }

    // Download Table as Print
    printTableInNewWindow() {
        // Get the table HTML
        const tableHtml = document.getElementById('my-table')!.outerHTML;

        // Open a new window
        const printWindow = window.open('', '', 'width=800,height=600');

        // Ensure the new window was successfully opened
        if (printWindow) {
            // Create the content of the new window
            const content = `
                <html>
                    <head>
                    <title>Print Table</title>
                        <style>
                            table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            th, td {
                                padding: 8px;
                                text-align: left;
                                border: 1px solid black;
                            }
                            @media print {
                                body {
                                    font-size: 12px;
                                    margin: 0;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${tableHtml}
                    </body>
                </html>
            `;

            // Write the content into the new window
            printWindow.document.open();
            printWindow.document.write(content);
            printWindow.document.close();

            // Add an event listener to print and close the window after printing
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.onafterprint = () => {
                    printWindow.close();
                };
            };
        }
    }

}