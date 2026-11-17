# Daily upload quota
Route in http/route.mjs. A single batch of 0–100 items is accepted. A larger
batch must be rejected with HTTP 429 before persistence. Items are passed through
unchanged when accepted.
