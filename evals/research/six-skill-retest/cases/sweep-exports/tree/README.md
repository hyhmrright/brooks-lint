# Reporting
The primary source writes both headers and rows for InvoiceHub. InvoiceHub
requires id,total,region in that order even when requests choose different
field orders. The archival path uses independently governed headers. It must
preserve the caller-provided order until the external owner confirms a change.
Input field lists are permutations of the three names. Inputs do not contain
newlines. CSV cell escaping is shared across both paths.
