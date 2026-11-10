Every request must use one published configuration snapshot for both endpoint and credential. During rotation, each endpoint accepts only the credential in the same snapshot. lookupEndpoint may be followed by a publish before lookupCredential. Publishing retains both immutable objects; no endpoint is removed during in-flight requests.

The deployment sets overlap=false.
