import java.text.SimpleDateFormat;
import java.util.Date;

public class TimestampFormatter {
    // Shared instance to "avoid recreating the formatter on every request".
    private static final SimpleDateFormat FMT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    /** Called concurrently from many request-handler threads. */
    public static String format(Date when) {
        return FMT.format(when);
    }
}
