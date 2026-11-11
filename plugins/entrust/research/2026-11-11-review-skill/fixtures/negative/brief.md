# Case: delivery retry

The delivery API occasionally returns a temporary-unavailable result. The product requires one retry for that result and no retry for permanent failures. The caller supplies an already validated message. Review the change for correctness, simplicity, design and tests.
