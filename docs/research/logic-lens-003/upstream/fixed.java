import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class TimestampFormatter {
    // DateTimeFormatter is immutable and thread-safe — safe to share across threads.
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** Called concurrently from many request-handler threads. */
    public static String format(LocalDateTime when) {
        return FMT.format(when);
    }
}
