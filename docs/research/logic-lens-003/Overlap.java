import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

// Run unchanged corpus classes with their declared input types in separate JVMs.
public class Overlap {
    static String call(Method method, int day) throws Exception {
        LocalDateTime when = LocalDateTime.of(2000, 1, day, 0, 0);
        Object value = method.getParameterTypes()[0] == Date.class
                ? Date.from(when.toInstant(ZoneOffset.UTC)) : when;
        return (String) method.invoke(null, value);
    }

    public static void main(String[] args) throws Exception {
        Class<?> type = args[0].equals("buggy") ? Date.class : LocalDateTime.class;
        Method method = TimestampFormatter.class.getMethod("format", type);
        System.out.println("sequential A " + call(method, 1));
        System.out.println("sequential B " + call(method, 2));
        Thread first = new Thread(() -> {
            try {
                System.out.println("overlap A " + call(method, 1));
            } catch (Exception error) {
                throw new AssertionError(error);
            }
        }, "call-A");
        first.start();
        if (System.in.read() < 0) throw new AssertionError("missing debugger signal");
        System.out.println("overlap B " + call(method, 2));
        first.join();
    }
}
