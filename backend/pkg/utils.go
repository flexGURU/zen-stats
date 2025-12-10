package pkg

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

const (
	dateFormat = "2006-01-02"
	// timeFormat = "15:04"
	timeFormat = "2006-01-02T15:04:05Z07:00"
)

func PgTypeNumericToFloat64(n pgtype.Numeric) float64 {
	f, err := n.Float64Value()
	if err != nil {
		log.Println("not float")
		return 0
	}

	return f.Float64
}

func Float64ToPgTypeNumeric(f float64) pgtype.Numeric {
	var amount pgtype.Numeric
	if err := amount.Scan(strconv.FormatFloat(f, 'f', -1, 64)); err != nil {
		log.Println("not float")
		return pgtype.Numeric{
			Valid: false,
		}
	}

	return amount
}

// func PgTimeToTime(t pgtype.Time) time.Time {
// 	if !t.Valid {
// 		return time.Now()
// 	}
// 	tm := time.Unix(0, t.Microseconds*1000).UTC()
// 	return tm
// }

func PgTimeToTime(t pgtype.Time) time.Time {
	if !t.Valid {
		return time.Time{}
	}

	totalMicro := t.Microseconds

	// Convert microseconds since midnight to hour, minute, second, microsecond
	hours := int(totalMicro / 3_600_000_000)
	totalMicro %= 3_600_000_000

	minutes := int(totalMicro / 60_000_000)
	totalMicro %= 60_000_000

	seconds := int(totalMicro / 1_000_000)
	microseconds := int(totalMicro % 1_000_000)

	// Build a time.Time using today's date and the extracted time
	now := time.Now()
	return time.Date(
		now.Year(), now.Month(), now.Day(),
		hours, minutes, seconds, microseconds*1000,
		time.Local,
	)
}

func TimeToPgTime(t time.Time) pgtype.Time {
	hour, min, sec := t.Clock()
	microseconds := int64(hour*3600+min*60+sec) * 1_000_000
	return pgtype.Time{
		Microseconds: microseconds,
		Valid:        true,
	}
}

func StrToPgTime(s string) (pgtype.Time, error) {
	// Try HH:MM
	layouts := []string{
		"15:04",
		"15:04:05",
	}

	var parsed time.Time
	var err error

	for _, layout := range layouts {
		parsed, err = time.Parse(layout, s)
		if err == nil {
			return TimeToPgTime(parsed), nil
		}
	}

	return pgtype.Time{}, fmt.Errorf("invalid time format: %s", s)
}

func StrToTime(s string) (time.Time, error) {
	if s == "" {
		return time.Now(), nil
	}

	layouts := []string{
		"2006-01-02",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05Z07:00",
	}

	var parsed time.Time
	var err error

	for _, layout := range layouts {
		parsed, err = time.Parse(layout, s)
		if err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("invalid date format: %s", s)
}

func StrToDate(s string) (time.Time, error) {
	if s == "" {
		return time.Now(), nil
	}

	layouts := []string{
		"2006-01-02",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05Z07:00",
	}

	var parsed time.Time
	var err error

	for _, layout := range layouts {
		parsed, err = time.Parse(layout, s)
		if err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("invalid date format: %s", s)
}

func StrToBool(s string) bool {
	if s == "" {
		return false
	}

	b, err := strconv.ParseBool(s)
	if err != nil {
		log.Println("not bool")
		return false
	}

	return b
}

func StrToUint32(s string) (uint32, error) {
	i, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		log.Println("not uint32")
		return 0, err
	}

	return uint32(i), nil
}

func StrToInt64(s string) (int64, error) {
	i, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		log.Println("not uint32")
		return 0, err
	}

	return int64(i), nil
}
