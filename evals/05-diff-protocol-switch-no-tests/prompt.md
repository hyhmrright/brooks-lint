---
max_turns: 20
timeout_seconds: 480
allowed_tools: [Skill, Read, Glob, Grep]
model: sonnet
runs: 3
---
Here's my PR for our little Go Redis client: it adds a proper RESP2 decoder and switches `Client.Do` over to it (before, `Do` only understood single-line replies). `Value` and the `Kind` constants already live in `resp/value.go`, which is unchanged. Ready to merge?

```diff
diff --git a/client.go b/client.go
index 2af07d3..d80edcc 100644
--- a/client.go
+++ b/client.go
@@ -6,7 +6,6 @@ import (
 	"errors"
 	"fmt"
 	"net"
-	"strings"
 	"time"
 
 	"example.com/redisx/resp"
@@ -38,14 +37,14 @@ func (c *Client) Do(ctx context.Context, args ...string) (resp.Value, error) {
 	if err := c.writeCommand(args); err != nil {
 		return resp.Value{}, err
 	}
-	line, err := c.rd.ReadString('\n')
+	v, err := resp.Decode(c.rd)
 	if err != nil {
 		return resp.Value{}, err
 	}
-	if strings.HasPrefix(line, "-") {
-		return resp.Value{}, errors.New(strings.TrimSpace(line[1:]))
+	if v.Kind == resp.Error {
+		return resp.Value{}, errors.New(v.Str)
 	}
-	return resp.Value{Kind: resp.SimpleString, Str: strings.TrimSpace(line[1:])}, nil
+	return v, nil
 }
 
 func (c *Client) writeCommand(args []string) error {
diff --git a/resp/decode.go b/resp/decode.go
new file mode 100644
index 0000000..41f7147
--- /dev/null
+++ b/resp/decode.go
@@ -0,0 +1,112 @@
+package resp
+
+import (
+	"bufio"
+	"errors"
+	"fmt"
+	"io"
+	"strconv"
+)
+
+// ErrProtocol is wrapped by every error caused by malformed input.
+var ErrProtocol = errors.New("resp: protocol error")
+
+// Limits mirror Redis's own defaults, so a corrupt stream fails fast instead of
+// driving huge allocations or unbounded recursion.
+const (
+	maxBulkLen  = 512 << 20
+	maxArrayLen = 1 << 20
+	maxDepth    = 64
+)
+
+// Decode reads exactly one RESP2 value from r.
+func Decode(r *bufio.Reader) (Value, error) {
+	return decode(r, 0)
+}
+
+func decode(r *bufio.Reader, depth int) (Value, error) {
+	prefix, err := r.ReadByte()
+	if err != nil {
+		return Value{}, err
+	}
+	line, err := readLine(r)
+	if err != nil {
+		return Value{}, err
+	}
+
+	switch Kind(prefix) {
+	case SimpleString, Error:
+		return Value{Kind: Kind(prefix), Str: line}, nil
+
+	case Integer:
+		n, err := strconv.ParseInt(line, 10, 64)
+		if err != nil {
+			return Value{}, fmt.Errorf("%w: bad integer %q", ErrProtocol, line)
+		}
+		return Value{Kind: Integer, Int: n}, nil
+
+	case BulkString:
+		n, err := parseLen(line, maxBulkLen)
+		if err != nil {
+			return Value{}, err
+		}
+		if n == -1 {
+			return Value{Kind: BulkString, Null: true}, nil
+		}
+		buf := make([]byte, n+2)
+		if _, err := io.ReadFull(r, buf); err != nil {
+			return Value{}, err
+		}
+		if buf[n] != '\r' || buf[n+1] != '\n' {
+			return Value{}, fmt.Errorf("%w: bulk string not CRLF-terminated", ErrProtocol)
+		}
+		return Value{Kind: BulkString, Str: string(buf[:n])}, nil
+
+	case Array:
+		n, err := parseLen(line, maxArrayLen)
+		if err != nil {
+			return Value{}, err
+		}
+		if n == -1 {
+			return Value{Kind: Array, Null: true}, nil
+		}
+		if depth == maxDepth {
+			return Value{}, fmt.Errorf("%w: arrays nested deeper than %d", ErrProtocol, maxDepth)
+		}
+		// n is untrusted: cap the up-front allocation and let append grow the rest.
+		items := make([]Value, 0, min(n, 64))
+		for i := 0; i < n; i++ {
+			v, err := decode(r, depth+1)
+			if err != nil {
+				return Value{}, err
+			}
+			items = append(items, v)
+		}
+		return Value{Kind: Array, Array: items}, nil
+
+	default:
+		return Value{}, fmt.Errorf("%w: unknown type byte %q", ErrProtocol, prefix)
+	}
+}
+
+// parseLen parses a bulk-string or array length header: -1 (null) or 0..limit.
+func parseLen(line string, limit int) (int, error) {
+	n, err := strconv.Atoi(line)
+	if err != nil || n < -1 || n > limit {
+		return 0, fmt.Errorf("%w: bad length %q", ErrProtocol, line)
+	}
+	return n, nil
+}
+
+// readLine reads a CRLF-terminated header line. ReadSlice bounds the line by the
+// reader's buffer size, so overlong input fails with bufio.ErrBufferFull.
+func readLine(r *bufio.Reader) (string, error) {
+	line, err := r.ReadSlice('\n')
+	if err != nil {
+		return "", err
+	}
+	if len(line) < 2 || line[len(line)-2] != '\r' {
+		return "", fmt.Errorf("%w: line not CRLF-terminated", ErrProtocol)
+	}
+	return string(line[:len(line)-2]), nil
+}
```
