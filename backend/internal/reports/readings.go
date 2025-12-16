package reports

import (
	"github.com/Edwin9301/Zen/backend/internal/repository"
	"github.com/Edwin9301/Zen/backend/pkg"
)

type readingReport struct {
	*excelGenerator
	data []*repository.Reading
}

func newReadingReport(data []*repository.Reading) *readingReport {
	return &readingReport{
		excelGenerator: newExcelGenerator(),
		data:           data,
	}
}

func (r *readingReport) generateExcel(sheetName string) ([]byte, error) {
	r.createSheet(sheetName)

	columns := []string{}
	reading := r.data[0].Payload.(map[string]interface{})
	for key, _ := range reading {
		columns = append(columns, key)
	}

	headerColumns := append([]string{"Timestamp"}, columns...)

	r.file.SetColWidth(r.currentSheet, "A", string(rune(65+len(headerColumns)-1)), 20)
	r.file.SetColStyle(r.currentSheet, "A", r.createDateStyle())

	r.writeHeader(headerColumns, r.createHeaderStyle())

	for i, record := range r.data {
		rowData := []interface{}{
			record.Timestamp,
		}
		payload := record.Payload.(map[string]interface{})
		for _, col := range columns {
			rowData = append(rowData, payload[col])
		}
		r.writeRow(i+2, rowData)
	}

	buffer, err := r.file.WriteToBuffer()
	if err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error writing to buffer excel: %s", err)
	}

	if err := r.closeExcel(); err != nil {
		return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "error closing excel file: %v", err)
	}

	return buffer.Bytes(), err

	// if err := r.file.SaveAs("readings_report.xlsx"); err != nil {
	// 	return nil, pkg.Errorf(pkg.INTERNAL_ERROR, "failed to generate Excel report")
	// }

	// return nil, r.closeExcel()
}
