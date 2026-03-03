import { Injectable } from '@nestjs/common';
import { AiSkill, SkillMeta, SkillResult } from '../base/ai-skill.interface';
import { ProjectContext } from '../../core/ai-context.service';
import { FileTool } from '../../tools/file/file.tool';

// ============================================================
// DevOps Config Generator Skill
// Sinh Dockerfile, docker-compose, CI config
// ============================================================
@Injectable()
export class DevopsGeneratorSkill implements AiSkill {
  meta: SkillMeta = {
    id: 'devops.generator',
    name: 'DevOps Config Generator',
    group: 'devops',
    description: 'Generate Dockerfile, docker-compose.yml, and CI/CD configs',
  };

  constructor(private readonly fileTool: FileTool) {}

  canHandle(userInput: string): boolean {
    const keywords = ['docker', 'ci', 'deploy', 'devops', 'pipeline', 'github actions'];
    return keywords.some((kw) => userInput.toLowerCase().includes(kw));
  }

  async execute(userInput: string, context: ProjectContext): Promise<SkillResult> {
    const changes = [];

    const lower = userInput.toLowerCase();

    if (lower.includes('docker')) {
      changes.push(
        {
          filePath: 'server/Dockerfile',
          action: 'create' as const,
          content: this.generateBackendDockerfile(),
        },
        {
          filePath: 'client/Dockerfile',
          action: 'create' as const,
          content: this.generateFrontendDockerfile(),
        },
        {
          filePath: 'docker-compose.yml',
          action: 'create' as const,
          content: this.generateDockerCompose(),
        },
      );
    }

    if (lower.includes('ci') || lower.includes('github') || lower.includes('pipeline')) {
      changes.push({
        filePath: '.github/workflows/ci.yml',
        action: 'create' as const,
        content: this.generateGithubCI(),
      });
    }

    return {
      messages: [
        `Generated DevOps configs: ${changes.map((c) => c.filePath).join(', ')}`,
      ],
      proposedChanges: changes,
      skillUsed: this.meta.id,
    };
  }

  private generateBackendDockerfile(): string {
    return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
`;
  }

  private generateFrontendDockerfile(): string {
    return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
  }

  private generateDockerCompose(): string {
    return `version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: admin_platform
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`;
  }

  private generateGithubCI(): string {
    return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm test

  test-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
`;
  }
}
