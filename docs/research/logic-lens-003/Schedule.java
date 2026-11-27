import com.sun.jdi.Bootstrap;
import com.sun.jdi.Method;
import com.sun.jdi.VirtualMachine;
import com.sun.jdi.event.*;
import com.sun.jdi.request.EventRequest;
import java.io.BufferedReader;
import java.io.InputStreamReader;

// Pause only A inside the formatter. B must return before A can continue.
public class Schedule {
    static void replay(String variant) throws Exception {
        boolean legacy = variant.equals("buggy");
        String library = legacy ? "java.text.SimpleDateFormat" : "java.time.format.DateTimeFormatter";
        String checkpoint = legacy ? "subFormat" : "formatTo";
        var launcher = Bootstrap.virtualMachineManager().defaultConnector();
        var args = launcher.defaultArguments();
        args.get("main").setValue("Overlap " + variant);
        args.get("options").setValue("-cp . -Duser.timezone=UTC -Duser.language=en -Duser.country=US");
        VirtualMachine vm = launcher.launch(args);
        Process child = vm.process();
        try (var output = new BufferedReader(new InputStreamReader(child.getInputStream()))) {
            var requests = vm.eventRequestManager();
            var prepare = requests.createClassPrepareRequest();
            prepare.addClassFilter(library);
            prepare.enable();
            boolean paused = false;
            boolean done = false;
            while (!done) {
                var events = vm.eventQueue().remove(15000);
                if (events == null) throw new AssertionError("formatter checkpoint timed out");
                for (var event : events) {
                    if (event instanceof ClassPrepareEvent prepared) {
                        var methods = prepared.referenceType().methodsByName(checkpoint);
                        if (methods.size() != 1) throw new AssertionError("ambiguous JDK checkpoint");
                        Method method = methods.get(0);
                        var bp = requests.createBreakpointRequest(method.location());
                        bp.setSuspendPolicy(EventRequest.SUSPEND_EVENT_THREAD);
                        bp.enable();
                    } else if (event instanceof BreakpointEvent at && at.thread().name().equals("call-A")) {
                        at.request().disable();
                        paused = true;
                        child.getOutputStream().write('\n');
                        child.getOutputStream().flush();
                        // The first two lines are the sequential controls. Waiting for B's
                        // third line holds A at the breakpoint throughout the second call.
                        for (String prefix : new String[]{"sequential A ", "sequential B ", "overlap B "}) {
                            String line = output.readLine();
                            if (line == null || !line.startsWith(prefix)) throw new AssertionError(line);
                            System.out.println(line);
                        }
                    } else if (event instanceof VMDeathEvent) {
                        done = true;
                    }
                }
                events.resume();
            }
            String last = output.readLine();
            if (!paused || child.waitFor() != 0 || last == null || !last.startsWith("overlap A "))
                throw new AssertionError("incomplete schedule: " + last);
            System.out.println(last);
        } finally {
            child.destroyForcibly();
        }
    }

    public static void main(String[] args) throws Exception {
        replay(args[0]);
    }
}
