import React from 'react'
import jsPDF from 'jspdf'
import type { WeeklyReport } from '../types/timesheet'
import think41Logo from '../assets/think41-logo.png'
import headerBg from '../assets/header-bg.png'

interface PdfExporterProps {
  weeklyReport: WeeklyReport
}

const PdfExporter: React.FC<PdfExporterProps> = ({ weeklyReport }) => {
  // Function to convert image to base64
  const getImageDataUrl = (imgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = imgSrc
    })
  }

  const generatePdf = async () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)

    // Helper function to clean markdown formatting
    const cleanMarkdown = (text: string): string => {
      return text.replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** markdown bold
    }

    // Removed unused addMultilineText function

    // Clean header with Think41 branding - gradient background
    try {
      const headerBgDataUrl = await getImageDataUrl(headerBg)
      pdf.addImage(headerBgDataUrl, 'PNG', 0, 0, pageWidth, 35) // Full width header background
    } catch (error) {
      console.error('Failed to load header background:', error)
      // Fallback to solid color if background fails to load
      pdf.setFillColor(90, 97, 231) // #5a61e7 purple background
      pdf.rect(0, 0, pageWidth, 35, 'F')
    }
    
    // Add Think41 logo (rectangular)
    try {
      const logoDataUrl = await getImageDataUrl(think41Logo)
      pdf.addImage(logoDataUrl, 'PNG', 10, 12, 28, 14) // x, y, width, height - made rectangular
    } catch (error) {
      console.error('Failed to load logo:', error)
      // Fallback to text if logo fails to load
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Think41', margin, 15)
    }
    
    // Title text (centered)
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    const titleText = 'Weekly Timesheet Report'
    const titleWidth = pdf.getTextWidth(titleText)
    const titleX = (pageWidth - titleWidth) / 2
    pdf.text(titleText, titleX, 22)
    
    // Add simple decorative line (centered)
    pdf.setDrawColor(255, 255, 255)
    pdf.setLineWidth(0.5)
    const lineStart = titleX - 20
    const lineEnd = titleX + titleWidth + 20
    pdf.line(lineStart, 25, lineEnd, 25)
    
    // Reset colors and line width
    pdf.setTextColor(0, 0, 0)
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.1)
    
    // Report info section - simplified and clean
    let currentY = 50
    
    // Simple info section with light background (bigger box)
    pdf.setFillColor(250, 250, 251) // Very light gray
    pdf.rect(margin, currentY, contentWidth, 38, 'F')
    pdf.setDrawColor(229, 231, 235) // Light border
    pdf.rect(margin, currentY, contentWidth, 38)
    
    currentY += 8
    
    // Client and Employee info - no emojis, clean text
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(75, 85, 99) // Consistent gray
    
    pdf.text('Client:', margin + 5, currentY)
    pdf.setFont('helvetica', 'normal')
    pdf.text(weeklyReport.clientName, margin + 30, currentY)
    
    currentY += 7
    pdf.setFont('helvetica', 'bold')
    pdf.text('Employee:', margin + 5, currentY)
    pdf.setFont('helvetica', 'normal')
    pdf.text(weeklyReport.employeeName, margin + 30, currentY)
    
    currentY += 7
    pdf.setFont('helvetica', 'bold')
    pdf.text('Period:', margin + 5, currentY)
    pdf.setFont('helvetica', 'normal')
    
    const weekStart = new Date(weeklyReport.startDate)
    const weekEnd = new Date(weeklyReport.endDate)
    const weekText = `${weekStart.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    })} - ${weekEnd.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`
    pdf.text(weekText, margin + 30, currentY)
    
    // Stats section - Total hours and leave days (inside the grey box, moved down slightly)
    const statsWidth = 35
    const statsHeight = 15
    const statsX = margin + contentWidth - statsWidth - 5 // Inside the grey box
    const statsStartY = currentY - 19 // Position slightly lower within the grey box
    
    // Total hours box
    pdf.setFillColor(0, 96, 199) // #0060C7 blue
    pdf.rect(statsX, statsStartY, statsWidth, statsHeight, 'F')
    
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.text('Total Hours', statsX + 2, statsStartY + 5)
    pdf.setFontSize(10)
    pdf.text(weeklyReport.totalHours + 'h', statsX + 2, statsStartY + 12)
    
    // Leave days box (if any) - positioned below total hours
    if (weeklyReport.totalLeaveDays > 0) {
      const leaveDaysY = statsStartY + statsHeight + 2
      pdf.setFillColor(199, 0, 104) // #c70068 for leave card
      pdf.rect(statsX, leaveDaysY, statsWidth, statsHeight, 'F')
      
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.text('Leave Days', statsX + 2, leaveDaysY + 5)
      pdf.setFontSize(10)
      pdf.text(weeklyReport.totalLeaveDays.toString(), statsX + 2, leaveDaysY + 12)
    }
    
    pdf.setTextColor(0, 0, 0) // Reset color
    currentY += 33 // Increased spacing for bigger grey box
    
    // Executive Summary section
    if (weeklyReport.executiveSummary && weeklyReport.executiveSummary !== 'Generating summary...') {
      pdf.setFillColor(239, 246, 255) // Light blue background
      pdf.rect(margin, currentY, contentWidth, 35, 'F')
      pdf.setDrawColor(59, 130, 246) // Blue border
      pdf.rect(margin, currentY, contentWidth, 35)
      
      currentY += 8
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(30, 64, 175) // Dark blue
      pdf.setFontSize(11)
      pdf.text('Executive Summary', margin + 5, currentY)
      
      currentY += 6
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(51, 65, 85) // Dark gray
      pdf.setFontSize(9)
      
      // Word wrap the summary
      const summaryLines = pdf.splitTextToSize(weeklyReport.executiveSummary, contentWidth - 10)
      summaryLines.forEach((line: string, index: number) => {
        if (currentY + (index * 4) > currentY + 15) return // Prevent overflow
        pdf.text(line, margin + 5, currentY + (index * 4))
      })
      
      currentY += 30
      pdf.setTextColor(0, 0, 0) // Reset color
    }
    
    // Clean table design - consistent with Think41 colors
    const tableTop = currentY
    const baseRowHeight = 8
    const colWidths = {
      date: 40,
      summary: contentWidth - 40 - 40 - 25, // More space for summary
      location: 40,
      hours: 25
    }
    
    // Table header - Updated color theme
    pdf.setFillColor(0, 96, 199) // #0060C7 for table header
    pdf.rect(margin, tableTop, contentWidth, 12, 'F')
    
    // Header text - no emojis
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    
    let colX = margin
    pdf.text('Date', colX + 3, tableTop + 8)
    colX += colWidths.date
    pdf.text('Summary', colX + 3, tableTop + 8)
    colX += colWidths.summary
    pdf.text('Location', colX + 3, tableTop + 8)
    colX += colWidths.location
    pdf.text('Hours', colX + 3, tableTop + 8)
    
    // Reset text settings
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    
    // Table data with dynamic row heights - include all entries
    currentY = tableTop + 12
    
    weeklyReport.entries.forEach((entry, index) => {
      // Calculate required height for summary text
      let rowHeight = baseRowHeight
      if (entry.isWeekend || entry.isLeave) {
        // Weekend and leave entries have simple text, use base height
        rowHeight = baseRowHeight
      } else {
        // Work entries may have longer summaries with multiple task categories
        const cleanSummary = cleanMarkdown(entry.summary || 'No summary')
        const taskLines = cleanSummary.split('\n').filter(line => line.trim() !== '')
        let totalLines = 0
        
        taskLines.forEach((taskLine) => {
          const parts = taskLine.split(':')
          if (parts.length > 1) {
            // Task name line + comment lines
            totalLines += 1 // Task name
            const commentText = parts[1].trim()
            if (commentText) {
              const commentLines = pdf.splitTextToSize(commentText, colWidths.summary - 4)
              totalLines += commentLines.length
            }
          } else {
            // Regular text lines
            const regularLines = pdf.splitTextToSize(taskLine.trim(), colWidths.summary - 4)
            totalLines += regularLines.length
          }
          totalLines += 0.5 // Space between task categories
        })
        
        rowHeight = Math.max(baseRowHeight, totalLines * 4 + 4)
      }
      
      // Check if we need a new page
      if (currentY + rowHeight > pageHeight - 40) {
        pdf.addPage()
        currentY = margin
      }
      
      // Row colors based on entry type
      if (index % 2 === 0) {
        pdf.setFillColor(255, 255, 255) // White
      } else {
        pdf.setFillColor(249, 250, 251) // Very light gray
      }
      pdf.rect(margin, currentY, contentWidth, rowHeight, 'F')
      
      // Clean row borders
      pdf.setDrawColor(229, 231, 235) // Light gray border
      pdf.rect(margin, currentY, contentWidth, rowHeight)
      
      // Vertical separators
      colX = margin + colWidths.date
      pdf.line(colX, currentY, colX, currentY + rowHeight)
      colX += colWidths.summary
      pdf.line(colX, currentY, colX, currentY + rowHeight)
      colX += colWidths.location
      pdf.line(colX, currentY, colX, currentY + rowHeight)
      
      // Cell content
      const cellY = currentY + 5
      colX = margin
      
      // Date
      const date = new Date(entry.date)
      const dateText = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
      pdf.setFont('helvetica', 'normal')
      pdf.text(dateText, colX + 2, cellY)
      colX += colWidths.date
      
      // Summary with special handling for weekends and leave days
      if (entry.isWeekend) {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(107, 114, 128) // Gray text for weekends
        pdf.text('Weekend', colX + 2, cellY)
        pdf.setTextColor(0, 0, 0) // Reset color
      } else if (entry.isLeave) {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(199, 0, 104) // #c70068 text for leave
        pdf.text('On Leave', colX + 2, cellY)
        pdf.setTextColor(0, 0, 0) // Reset color
      } else {
        // Regular work day - parse and format the summary to handle multiple task lines
        const cleanSummary = cleanMarkdown(entry.summary || 'No summary')
        const taskLines = cleanSummary.split('\n').filter(line => line.trim() !== '')
        let textY = cellY
        
        taskLines.forEach((taskLine) => {
          const parts = taskLine.split(':')
          if (parts.length > 1) {
            // Task name part (before colon) - bold
            pdf.setFont('helvetica', 'bold')
            const taskNameText = parts[0].trim() + ':'
            pdf.text(taskNameText, colX + 2, textY)
            textY += 4
            
            // Comments part (after colon) - normal
            pdf.setFont('helvetica', 'normal')
            const commentText = parts[1].trim()
            if (commentText) {
              const commentLines = pdf.splitTextToSize(commentText, colWidths.summary - 4)
              commentLines.forEach((line: string) => {
                pdf.text(line, colX + 2, textY)
                textY += 4
              })
            }
          } else {
            // No colon, treat as regular text
            pdf.setFont('helvetica', 'normal')
            const regularLines = pdf.splitTextToSize(taskLine.trim(), colWidths.summary - 4)
            regularLines.forEach((line: string) => {
              pdf.text(line, colX + 2, textY)
              textY += 4
            })
          }
          textY += 2 // Add small space between task categories
        })
      }
      
      colX += colWidths.summary
      
      // Location - simple text, no colors
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(0, 0, 0)
      pdf.text(entry.location, colX + 2, cellY)
      colX += colWidths.location
      
      // Hours
      pdf.setFont('helvetica', 'bold')
      pdf.text(entry.totalHours.toString(), colX + 2, cellY)
      
      currentY += rowHeight
    })
    
    // Total row - Updated theme
    currentY += 2
    pdf.setFillColor(0, 96, 199) // #0060C7 for total row
    pdf.rect(margin, currentY, contentWidth, 10, 'F')
    
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.text('TOTAL HOURS', margin + 3, currentY + 7)
    pdf.text(`${weeklyReport.totalHours} hours`, pageWidth - margin - 30, currentY + 7)
    
    // Clean footer with Think41 branding - gradient background
    try {
      const footerBgDataUrl = await getImageDataUrl(headerBg)
      pdf.addImage(footerBgDataUrl, 'PNG', 0, pageHeight - 15, pageWidth, 15) // Full width footer background
    } catch (error) {
      console.error('Failed to load footer background:', error)
      // Fallback to solid color if background fails to load
      pdf.setFillColor(63, 93, 162) // #3f5da2 for footer
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F')
    }
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Think41', margin, pageHeight - 6)
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text('Powered by Think41 Timesheet Generator', margin + 25, pageHeight - 6)
    
    // Page numbers
    const pageCount = (pdf as any).getNumberOfPages?.() || 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 20,
        pageHeight - 6
      );
    }
    
    // Generate filename
    const filename = `timesheet_${weeklyReport.employeeName.replace(/[^a-zA-Z0-9]/g, '_')}_${weeklyReport.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${weeklyReport.startDate}.pdf`
    
    // Save the PDF
    pdf.save(filename)
  }

  return (
    <button
      onClick={generatePdf}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export PDF
    </button>
  )
}

export default PdfExporter