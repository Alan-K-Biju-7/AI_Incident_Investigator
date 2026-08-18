# Security

Uploads are untrusted. The API limits body and file size, rejects traversal-like names, assigns server filenames, keeps artifacts outside normal records, and returns generic errors. Evidence text is always presented to models inside a data boundary with an explicit instruction that document content cannot change system behavior. Production additions should include malware scanning, MIME sniffing, archive expansion budgets, tenant-scoped authorization, envelope encryption, secret redaction, and audit retention policies.
