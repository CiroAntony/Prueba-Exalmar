
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun, ShadingType, BorderStyle } from 'docx';
import { SavedReport } from '../types';

export const exportToExcel = (report: SavedReport) => {
  const data = report.findings.map((f, i) => ({
    'N°': i + 1,
    'Observación': f.condition,
    'Descripción del hallazgo': f.title,
    'Riesgos evaluados': f.effect,
    'Calificación': f.rating,
    'Recomendaciones de auditoría interna': f.recommendations,
    'Planes de acción': f.actionPlans,
    'Responsables': f.responsible,
    'Fecha de implementación': f.implementationDate
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Informe");
  
  worksheet['!cols'] = [
    { wch: 4 }, { wch: 40 }, { wch: 30 }, { wch: 30 }, 
    { wch: 15 }, { wch: 40 }, { wch: 30 }, { wch: 20 }, { wch: 15 }
  ];

  XLSX.writeFile(workbook, `Exalmar_Audit_${report.id}.xlsx`);
};

export const exportToWord = async (report: SavedReport) => {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Crítica': return 'FF0000';
      case 'Alta': return 'FFC000';
      case 'Media': return 'FFFF00';
      case 'Baja': return '00B0F0';
      default: return 'D9D9D9';
    }
  };

  const borders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  };

  const createMemoLine = (label: string, value?: string, isBold?: boolean) => {
    return new Paragraph({
      children: [
        new TextRun({ text: `${label.padEnd(10)}: `, bold: true, size: 20 }),
        new TextRun({ text: value || '', bold: isBold, size: 20 }),
      ],
      spacing: { after: 100 }
    });
  };

  const headerRow = new TableRow({
    children: [
      "N°", "Observación", "Descripción del hallazgo", "Riesgos evaluados", "Calificación", "Recomendaciones de auditoría interna", "Planes de acción", "Responsables", "Fecha de implementación"
    ].map(text => new TableCell({
      children: [new Paragraph({ 
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 16 })],
        alignment: AlignmentType.CENTER
      })],
      shading: { fill: "0070C0", type: ShadingType.CLEAR },
      verticalAlign: AlignmentType.CENTER,
      borders
    }))
  });

  const dataRows = report.findings.map((f, i) => new TableRow({
    children: [
      (i + 1).toString(), f.condition, f.title, f.effect, f.rating, f.recommendations, f.actionPlans, f.responsible, f.implementationDate
    ].map((text, index) => {
      const isRating = index === 4;
      return new TableCell({
        children: [new Paragraph({ 
          children: [new TextRun({ 
            text, 
            size: 14, 
            bold: isRating,
            color: (isRating && (f.rating === 'Crítica' || f.rating === 'Alta' || f.rating === 'Baja')) ? "FFFFFF" : "000000"
          })],
          alignment: (isRating || index === 0 || index >= 7) ? AlignmentType.CENTER : AlignmentType.LEFT
        })],
        shading: isRating ? { fill: getRatingColor(f.rating), type: ShadingType.CLEAR } : undefined,
        verticalAlign: AlignmentType.CENTER,
        borders
      });
    })
  }));

  const doc = new Document({
    sections: [{
      properties: { page: { size: { orientation: "landscape" as any } } },
      children: [
        new Paragraph({
          children: [new TextRun({ text: "PESQUERA EXALMAR S.A.A.", bold: true, size: 24, color: "0070C0" })],
          alignment: AlignmentType.LEFT,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `${report.docCode} INFORME`, bold: true, size: 20 })],
          spacing: { after: 300 }
        }),
        createMemoLine("A", report.to),
        createMemoLine("At.", report.at),
        createMemoLine("Cc.", report.cc),
        new Paragraph({ children: [new TextRun({ text: "", size: 20 })], spacing: { after: 200 } }),
        createMemoLine("De", report.from),
        createMemoLine("Fecha", new Date(report.timestamp).toLocaleDateString()),
        new Paragraph({ children: [new TextRun({ text: "", size: 20 })], spacing: { after: 200 } }),
        createMemoLine("Asunto", report.subject, true),
        createMemoLine("Calificación", report.globalRating, true),
        new Paragraph({ children: [new TextRun({ text: "--------------------------------------------------------------------------------------------------------------------------------", size: 16 })], spacing: { after: 400 } }),
        
        new Paragraph({
          children: [new TextRun({ text: "5. Resultados de la Evaluación", bold: true, size: 24 })],
          spacing: { after: 300 }
        }),
        new Paragraph({
          children: [new TextRun({ text: "Tras evaluar los riesgos y ejecutar los procedimientos de auditoría, se concluye lo siguiente:", size: 18 })],
          spacing: { after: 400 }
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Informe_Exalmar_${report.id}.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
