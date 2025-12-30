declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface AutoTableOptions {
    startY?: number
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    theme?: 'striped' | 'grid' | 'plain'
    headStyles?: any
    bodyStyles?: any
    footStyles?: any
    columnStyles?: any
    margin?: { top?: number; right?: number; bottom?: number; left?: number }
    tableWidth?: 'auto' | 'wrap' | number
    showHead?: 'everyPage' | 'firstPage' | 'never'
    showFoot?: 'everyPage' | 'lastPage' | 'never'
    didDrawPage?: (data: any) => void
    didDrawCell?: (data: any) => void
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): jsPDF

  export default autoTable
}
