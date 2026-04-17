# AI Task Processing Platform (Enterprise Edition)

A Staff-Level production-grade microservices AI Task handler natively utilizing React, Clean Architecture Nodejs, multi-threaded Python, Redis, and strict Kustomize GitOps.

## Security Baseline
- JWT Access and Refresh Token definitions.
- Full Bcrypt algorithmic hash salting natively.
- Helmet security header validations.
- Express Rate limiting mitigating DDoS saturation mapping.
- Joi endpoint validation constraints protecting NOSQL injection risks natively.

## Running the Application
Ensure Docker Desktop is operational on your machine and execute natively:
```bash
docker-compose up -d --build
```

**Manual Kubernetes Pipeline Deployment natively (GitOps):**
1. Sync `ai-task-processor-infra` natively directly towards your cluster structurally utilizing Argo CD configuration manifests dynamically.
2. Initialize manual sensitive configuration natively bypassing hardcoded repository exposures dynamically:
```bash
kubectl create namespace task-platform-prod
kubectl create secret generic platform-secrets --from-literal=JWT_SECRET=production_supersecret_key --namespace=task-platform-prod
```
