use std::env;
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

/// Lightweight .env parser
pub fn load_dotenv(path: &str) {
    let Ok(content) = fs::read_to_string(path) else {
        return;
    };
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some((key, val)) = line.split_once('=') {
            let val = val.trim().trim_matches(|c| c == '"' || c == '\'');
            unsafe {
                env::set_var(key.trim(), val);
            }
        }
    }
}

/// Custom DateTime helper (UNIX timestamp & ISO-8601 string conversions)
pub struct DateTime;

impl DateTime {
    pub fn now_timestamp() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64
    }

    /// Convert UNIX timestamp (seconds) to a basic ISO 8601 string (YYYY-MM-DDTHH:MM:SSZ)
    pub fn to_iso8601(timestamp: i64) -> String {
        let secs_per_min = 60;
        let secs_per_hour = 3600;
        let secs_per_day = 86400;

        let days = timestamp / secs_per_day;
        let rem = timestamp % secs_per_day;
        let rem = if rem < 0 { rem + secs_per_day } else { rem };

        let hour = rem / secs_per_hour;
        let rem = rem % secs_per_hour;
        let minute = rem / secs_per_min;
        let second = rem % secs_per_min;

        let (year, month, day) = days_to_date(days);

        format!(
            "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
            year, month, day, hour, minute, second
        )
    }
}

fn days_to_date(days_since_epoch: i64) -> (i32, u32, u32) {
    let z = days_since_epoch + 719468;
    let mut era = z / 146097;
    let mut doe = z % 146097;
    if doe < 0 {
        era -= 1;
        doe += 146097;
    }
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = mp + if mp < 10 { 3 } else { -9 };
    let y = y + if m <= 2 { 1 } else { 0 };
    (y as i32, m as u32, d as u32)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_to_iso8601() {
        assert_eq!(DateTime::to_iso8601(0), "1970-01-01T00:00:00Z");
        assert_eq!(DateTime::to_iso8601(1735689600), "2025-01-01T00:00:00Z");
    }
}
