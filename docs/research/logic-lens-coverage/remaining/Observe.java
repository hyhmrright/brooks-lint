import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public class Observe {
    public static void main(String[] args) throws Exception {
        boolean legacy = args[0].equals("buggy");
        Instant base = Instant.parse("2000-01-01T00:00:00Z");
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger wrong = new AtomicInteger();
        AtomicInteger calls = new AtomicInteger();
        Thread[] threads = new Thread[4];
        for (int i = 0; i < threads.length; i++) {
            Instant when = base.plusSeconds(i * 86400L);
            String expected = "2000-01-0" + (i + 1) + " 00:00:00";
            Object value = legacy ? Date.from(when) : LocalDateTime.ofInstant(when, ZoneOffset.UTC);
            var method = TimestampFormatter.class.getMethod("format", value.getClass());
            threads[i] = new Thread(() -> {
                try {
                    start.await();
                    for (int j = 0; j < 1000; j++) {
                        try {
                            if (!expected.equals(method.invoke(null, value))) wrong.incrementAndGet();
                        } catch (java.lang.reflect.InvocationTargetException e) {
                            wrong.incrementAndGet();
                        }
                        calls.incrementAndGet();
                    }
                } catch (ReflectiveOperationException | InterruptedException e) {
                    throw new AssertionError(e);
                }
            });
            threads[i].start();
        }
        start.countDown();
        for (Thread t : threads) t.join();
        if (calls.get() != 4000) throw new AssertionError("incomplete run");
        System.out.println(wrong.get());
    }
}
