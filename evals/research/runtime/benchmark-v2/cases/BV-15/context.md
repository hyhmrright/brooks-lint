# Credential rollout handoff

The packet contains a configuration factory, request assembly, and a transport acceptance model. Deployment bootstrap calls createConfig(overlap); bootstrap configuration is maintained outside this packet. In the supplied API, overlap=true permits either rotation credential, while overlap=false accepts only the credential matching the endpoint.

A configuration publish may occur between begin and finish. Old and new endpoints remain available during those requests, and published snapshot objects remain immutable. This packet contains no endpoint removal or credential-revocation process.
