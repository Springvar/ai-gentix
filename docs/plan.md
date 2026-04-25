# @ai-gentix Monorepo - Comprehensive Implementation Plan

## 1. Monorepo Infrastructure

### Root Files
- `turbo.json` - Turborepo pipeline configuration
- `pnpm-workspace.yaml` - pnpm workspaces definition
- `package.json` - Root scripts (build, test, lint across all packages)
- `tsconfig.base.json` - Shared TypeScript config
- `eslint.base.json` - Shared ESLint config

### Root Scripts
- `build`, `build:filter` - Build all or filtered packages
- `test`, `test:watch` - Test all packages
- `lint`, `lint:fix` - Lint all packages
- `clean` - Remove all dist folders
- `publish`, `release` - Publish packages

---

## 2. @ai-gentix/config

Configuration management - schema validation, env loading, defaults.

### Exports
- `loadConfig<T>(schema: ConfigSchema<T>): T`
- `ConfigSchema<T>` - Zod or similar schema
- `EnvLoader` - Load from env files
- `resolveConfig<T>(base: T, overrides: Partial<T>): T`

### Implementation Notes
- Use Zod for schema validation
- Support .env, .env.local, .env.production
- Merge strategy: default → file → env → runtime

---

## 3. @ai-gentix/term

Terminal UI - refactored from current @flowterm/term.

### Current Features to Migrate
- InlineCapture: PTY process spawning with inline output
- PageContainer: Multi-page terminal management
- SplitLayout: Info + terminal split views
- createTerminal: Orchestrates all the above

### Exports
```typescript
createTerminal(options?: TerminalOptions): TerminalManager
createInlineCapture(screen: Screen, options?): InlineCapture
createPageContainer(screen: Screen): PageContainer
createSplitLayout(screen: Screen, options): SplitLayout
```

### Breaking Changes for Renaming
- All exports rename from @flowterm/term → @ai-gentix/term
- Update dependencies in package.json
- Update README references

---

## 4. @ai-gentix/models

Model/LLM abstractions - unified interface for AI models.

### Core Types
```typescript
export interface ModelOptions {
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  model: string;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
}

export interface ChatCompletion {
  id: string;
  model: string;
  choices: Array<{
    message: ChatMessage;
    finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  }>;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  created: number;
}

export interface StreamingChunk {
  id: string;
  delta: { content?: string; role?: string; toolCalls?: ToolCall[] };
  choices: Array<{ index: number; finishReason?: string }>;
}

export interface ModelClient {
  chat(options: ChatOptions): Promise<ChatCompletion>;
  chatStream(options: ChatOptions): AsyncIterable<StreamingChunk>;
  // Plus: embeddings, completions, fine-grained control
}
```

### Provider Support
- OpenAI (GPT-4, GPT-4 Turbo, GPT-3.5)
- Anthropic (Claude 3.5, Claude 3)
- Ollama (local models)
- Custom / function-based

### Implementation Strategy
- Create abstract ModelClient base class
- Provider-specific adapters implement the interface
- Factory function `createModel(options: ModelOptions): ModelClient`
- Unified streaming via AsyncIterable
- Built-in retry logic, rate limiting, error handling

---

## 5. @ai-gentix/agents

Agent management - lifecycle, pools, IPC.

### Core Types
```typescript
export type AgentState = 'idle' | 'running' | 'waiting' | 'paused' | 'error' | 'stopped';

export interface Agent {
  id: string;
  name: string;
  state: AgentState;
  createdAt: Date;
  lastActiveAt: Date;
  capabilities: string[];
  metadata: Record<string, unknown>;
}

export interface AgentOptions {
  name?: string;
  capabilities?: string[];
  model?: ModelOptions;
  maxConcurrent?: number;
  timeout?: number;
}

export interface AgentPool {
  getAgent(id: string): Agent | undefined;
  listAgents(filter?: AgentFilter): Agent[];
  createAgent(options: AgentOptions): Agent;
  removeAgent(id: string): boolean;
  startAgent(id: string): Promise<void>;
  stopAgent(id: string): Promise<void>;
}

export interface MessageBus {
  publish(channel: string, message: unknown): void;
  subscribe(channel: string, handler: (msg: unknown) => void): () => void;
  send(to: string, message: unknown): void;
  request(to: string, message: unknown, timeout?: number): Promise<unknown>;
}

export interface AgentRegistry {
  register(agent: Agent): void;
  unregister(id: string): void;
  get(id: string): Agent | undefined;
  findByCapability(capability: string): Agent[];
}
```

### Features
- Agent lifecycle management (create, start, stop, pause, resume)
- Worker pool with concurrency limits
- Pub/sub message bus for agent-to-agent communication
- Request/response pattern for RPC-style messaging
- Agent heartbeat and health checks
- Capability-based agent discovery

---

## 6. @ai-gentix/memories

Memory management - context, history, vector storage.

### Core Types
```typescript
export interface MemoryEntry {
  id: string;
  type: 'short' | 'long' | 'context';
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
}

export interface MemoryStore {
  add(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'accessedAt' | 'accessCount'>): MemoryEntry;
  get(id: string): MemoryEntry | undefined;
  list(filter?: MemoryFilter): MemoryEntry[];
  update(id: string, data: Partial<MemoryEntry>): MemoryEntry | undefined;
  delete(id: string): boolean;
  search(query: string, limit?: number): MemoryEntry[];
  clear(type?: 'short' | 'long' | 'context'): void;
}

export interface ConversationMemory {
  messages: ChatMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  summarizeOlderThan?: number;
  // Methods to manage conversation context window
  addMessage(msg: ChatMessage): void;
  getContext(): ChatMessage[];
  summarize(): Promise<string>;
  trim(): void;
}

export interface ContextManager {
  shortTerm: MemoryStore;  // Ephemeral, in-memory
  longTerm: MemoryStore;   // Persistent, file/DB
  conversation: ConversationMemory;
  // Combined operations
  remember(content: string, type?: MemoryEntry['type']): void;
  recall(query: string): MemoryEntry[];
  getContextPrompt(): string;
}
```

### Storage Backends
- In-memory (default for short-term)
- File-based (JSON/SQLite for long-term)
- Pluggable adapters for Redis, PostgreSQL, etc.

### Context Window Management
- Automatic trimming when tokens exceeded
- Summarization of older messages
- Priority-based retention (importance scoring)

---

## 7. @ai-gentix/skills

Skill/tool definitions - registry, execution.

### Core Types
```typescript
export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: unknown;
  schema?: JSONSchema;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  parameters: SkillParameter[];
  handler: (params: Record<string, unknown>, context: SkillContext) => Promise<SkillResult>;
  capabilities?: string[];  // Required agent capabilities
  timeout?: number;
}

export interface SkillContext {
  agent: Agent;
  conversation: ConversationMemory;
  memories: MemoryStore;
  tools: ToolRegistry;
  // Execution context
}

export interface SkillResult {
  success: boolean;
  output?: string;
  data?: unknown;
  error?: string;
  nextSkills?: string[];  // Suggested follow-up skills
}

export interface SkillRegistry {
  register(skill: Skill): void;
  unregister(id: string): boolean;
  get(id: string): Skill | undefined;
  list(): Skill[];
  findByCapability(capability: string): Skill[];
  execute(id: string, params: Record<string, unknown>, context: SkillContext): Promise<SkillResult>;
}

export interface ToolRegistry {
  register(tool: Tool): void;
  unregister(id: string): boolean;
  get(id: string): Tool | undefined;
  list(): Tool[];
  call(id: string, params: unknown): Promise<unknown>;
}
```

### Features
- JSON Schema parameter validation
- Skill chaining (one skill suggests next)
- Capability-based skill discovery
- Built-in error handling and retries
- Execution logging

---

## 8. @ai-gentix/permissions

RBAC/ACL - access control, capabilities.

### Core Types
```typescript
export type PermissionAction = 'read' | 'write' | 'execute' | 'admin' | 'delete';

export interface Permission {
  id: string;
  resource: string;
  actions: PermissionAction[];
  conditions?: Record<string, unknown>;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  inherits?: string[];  // Other roles to inherit from
}

export interface User {
  id: string;
  name: string;
  roles: string[];
  capabilities: string[];
  metadata: Record<string, unknown>;
}

export interface PermissionCheck {
  userId: string;
  resource: string;
  action: PermissionAction;
}

export interface PermissionManager {
  // Role management
  createRole(role: Omit<Role, 'id'>): Role;
  updateRole(id: string, data: Partial<Role>): Role | undefined;
  deleteRole(id: string): boolean;
  getRole(id: string): Role | undefined;
  listRoles(): Role[];

  // User management
  assignRole(userId: string, roleId: string): void;
  removeRole(userId: string, roleId: string): void;
  grantCapability(userId: string, capability: string): void;
  revokeCapability(userId: string, capability: string): void;

  // Permission checks
  checkPermission(check: PermissionCheck): boolean;
  getUserPermissions(userId: string): Permission[];
  getUserCapabilities(userId: string): string[];
}
```

### Features
- Role hierarchy (inheritance)
- Resource-scoped permissions
- Conditional permissions (time-based, IP-based, etc.)
- Capability-based access (not just role-based)
- Audit logging

---

## 9. @ai-gentix/toolkit

Unified entry point - re-exports everything.

### Purpose
- Single package install for full toolkit
- Version-aligned exports
- Convenient factory functions for common setups

### Exports
```typescript
// Re-export all packages
export * from '@ai-gentix/config';
export * from '@ai-gentix/term';
export * from '@ai-gentix/models';
export * from '@ai-gentix/agents';
export * from '@ai-gentix/memories';
export * from '@ai-gentix/skills';
export * from '@ai-gentix/permissions';

// Convenience functions
export function createAI(options: AIOptions): AIClient;

export interface AIClient {
  term: TerminalManager;
  agents: AgentPool;
  models: ModelClient;
  memories: ContextManager;
  skills: SkillRegistry;
  permissions: PermissionManager;
}
```

---

## 10. Folder Structure

```
ai-gentix/
├── .github/
│   └── workflows/
├── docs/
│   ├── architecture.md
│   ├── packages/
│   └── examples/
├── packages/
│   ├── config/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── term/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── models/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── agents/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── memories/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── skills/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── permissions/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── toolkit/
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── .gitignore
├── .npmignore
├── eslint.config.js
├── eslint.base.json
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── turbo.json
```

---

## 11. Implementation Phases

### Phase 1: Monorepo Setup
- [ ] Initialize root config files (turbo.json, tsconfig.base.json, etc.)
- [ ] Set up pnpm workspace
- [ ] Configure shared ESLint, Jest/Vitest
- [ ] Create root package.json scripts
- [ ] Test build pipeline

### Phase 2: @ai-gentix/config
- [ ] Create packages/config
- [ ] Implement ConfigSchema with Zod
- [ ] Implement EnvLoader
- [ ] Tests + docs
- [ ] Publish (0.1.0)

### Phase 3: @ai-gentix/term (Migrate)
- [ ] Rename packages/term (from current src/)
- [ ] Update package.json (@flowterm/term → @ai-gentix/term)
- [ ] Update exports and types
- [ ] Run tests
- [ ] Publish (0.1.0)

### Phase 4: @ai-gentix/models
- [ ] Create packages/models
- [ ] Define ModelClient interface
- [ ] Implement OpenAI adapter
- [ ] Implement Anthropic adapter
- [ ] Implement Ollama adapter
- [ ] Streaming, retries, error handling
- [ ] Tests + docs
- [ ] Publish (0.1.0)

### Phase 5: @ai-gentix/agents
- [ ] Create packages/agents
- [ ] Define Agent interface and lifecycle
- [ ] Implement AgentPool
- [ ] Implement MessageBus (pub/sub)
- [ ] Implement AgentRegistry
- [ ] Tests + docs
- [ ] Publish (0.1.0)

### Phase 6: @ai-gentix/memories
- [ ] Create packages/memories
- [ ] Implement MemoryStore
- [ ] Implement ConversationMemory
- [ ] Implement ContextManager
- [ ] Add storage backends
- [ ] Tests + docs
- [ ] Publish (0.1.0)

### Phase 7: @ai-gentix/skills
- [ ] Create packages/skills
- [ ] Define Skill interface
- [ ] Implement SkillRegistry
- [ ] Implement ToolRegistry
- [ ] Parameter validation
- [ ] Tests + docs
- [ ] Publish (0.1.0)

### Phase 8: @ai-gentix/permissions
- [ ] Create packages/permissions
- [ ] Define Role, User, Permission
- [ ] Implement PermissionManager
- [ ] Capability system
- [ ] Tests + docs
- [ ] Publish (0.1.0)

### Phase 9: @ai-gentix/toolkit
- [ ] Create packages/toolkit
- [ ] Re-export all packages
- [ ] Implement createAI factory
- [ ] Tests + docs
- [ ] Publish (0.1.0)

### Phase 10: Polish
- [ ] Update all READMEs
- [ ] Create example applications
- [ ] Add GitHub Actions CI
- [ ] Set up automated publishing
- [ ] Documentation website

---

## 12. Dependencies Strategy

### Shared Dependencies (in root)
- TypeScript
- Jest or Vitest
- ESLint
- Turborepo
- pnpm

### Package Dependencies

| Package | Dependencies |
|--------|--------------|
| @ai-gentix/config | zod |
| @ai-gentix/term | blessed, node-pty |
| @ai-gentix/models | (provider SDKs as needed) |
| @ai-gentix/agents | @ai-gentix/models, @ai-gentix/memories |
| @ai-gentix/memories | (storage libs as needed) |
| @ai-gentix/skills | zod (for schema validation) |
| @ai-gentix/permissions | - |
| @ai-gentix/toolkit | all above (peerDependencies) |

---

## 13. Open Questions

1. **Storage for long-term memories**: Redis? SQLite? File-based? Default to file-based, make pluggable?

2. **Model provider auth**: How to handle API keys - env vars, config file, runtime?

3. **Agent execution model**:spawned processes? Web Workers? Just in-memory objects?

4. **Cross-package TypeScript references**: Use project references for incremental builds?

5. **Browser compatibility**: Which packages need browser builds? Use conditional exports?

6. **Package versions**: Keep all at same version, or independent versioning?