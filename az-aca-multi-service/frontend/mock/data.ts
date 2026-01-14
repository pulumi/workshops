import { Item, HistoryEvent } from '../types';

const now = new Date();
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60000).toISOString();

export const initialItems: Item[] = [
  {
    id: 'item_001',
    title: 'Setup OIDC integration',
    status: 'inbox',
    source: { type: 'github', externalId: 'auth-service#142', display: 'auth-service#142' },
    createdAt: ago(120),
    updatedAt: ago(5),
  },
  {
    id: 'item_002',
    title: 'Fix login timeout bug',
    status: 'doing',
    source: { type: 'jira', externalId: 'AUTH-234', display: 'AUTH-234' },
    createdAt: ago(480),
    updatedAt: ago(30),
  },
  {
    id: 'item_003',
    title: 'Update API rate limits',
    status: 'blocked',
    source: { type: 'github', externalId: 'api-gateway#89', display: 'api-gateway#89' },
    createdAt: ago(1440),
    updatedAt: ago(60),
  },
  {
    id: 'item_004',
    title: 'Deploy staging environment',
    status: 'done',
    source: { type: 'custom', externalId: 'DEPLOY-001', display: 'DEPLOY-001' },
    createdAt: ago(2880),
    updatedAt: ago(120),
  },
  {
    id: 'item_005',
    title: 'Review security audit findings',
    status: 'inbox',
    source: { type: 'jira', externalId: 'SEC-567', display: 'SEC-567' },
    createdAt: ago(60),
    updatedAt: ago(10),
  },
  {
    id: 'item_006',
    title: 'Migrate database schema',
    status: 'doing',
    source: { type: 'github', externalId: 'db-migrations#45', display: 'db-migrations#45' },
    createdAt: ago(720),
    updatedAt: ago(45),
  },
  {
    id: 'item_007',
    title: 'Add monitoring dashboard',
    status: 'inbox',
    source: { type: 'custom', externalId: 'OPS-123', display: 'OPS-123' },
    createdAt: ago(180),
    updatedAt: ago(15),
  },
  {
    id: 'item_008',
    title: 'Refactor auth module',
    status: 'snoozed',
    source: { type: 'github', externalId: 'auth-service#98', display: 'auth-service#98' },
    createdAt: ago(4320),
    updatedAt: ago(1440),
    snoozeUntil: new Date(now.getTime() + 2 * 24 * 60 * 60000).toISOString(),
  },
  {
    id: 'item_009',
    title: 'Update API documentation',
    status: 'inbox',
    source: { type: 'jira', externalId: 'DOCS-789', display: 'DOCS-789' },
    createdAt: ago(240),
    updatedAt: ago(20),
  },
  {
    id: 'item_010',
    title: 'Fix memory leak in worker',
    status: 'blocked',
    source: { type: 'github', externalId: 'worker-pool#67', display: 'worker-pool#67' },
    createdAt: ago(360),
    updatedAt: ago(90),
  },
];

export const initialHistory: Record<string, HistoryEvent[]> = {
  item_001: [
    { id: 'h_001_1', type: 'ItemCreated', occurredAt: ago(120), summary: 'Item created from GitHub webhook' },
    { id: 'h_001_2', type: 'StatusChanged', occurredAt: ago(5), summary: 'Status changed to Inbox' },
  ],
  item_002: [
    { id: 'h_002_1', type: 'ItemCreated', occurredAt: ago(480), summary: 'Item created from Jira sync' },
    { id: 'h_002_2', type: 'StatusChanged', occurredAt: ago(120), summary: 'Moved to Doing' },
    { id: 'h_002_3', type: 'NoteAdded', occurredAt: ago(30), summary: 'Added note: investigating root cause' },
  ],
  item_003: [
    { id: 'h_003_1', type: 'ItemCreated', occurredAt: ago(1440), summary: 'Item created from GitHub webhook' },
    { id: 'h_003_2', type: 'StatusChanged', occurredAt: ago(720), summary: 'Moved to Doing' },
    { id: 'h_003_3', type: 'StatusChanged', occurredAt: ago(60), summary: 'Moved to Blocked - waiting on infra team' },
  ],
  item_004: [
    { id: 'h_004_1', type: 'ItemCreated', occurredAt: ago(2880), summary: 'Item created manually' },
    { id: 'h_004_2', type: 'StatusChanged', occurredAt: ago(1440), summary: 'Moved to Doing' },
    { id: 'h_004_3', type: 'StatusChanged', occurredAt: ago(120), summary: 'Completed successfully' },
  ],
  item_005: [
    { id: 'h_005_1', type: 'ItemCreated', occurredAt: ago(60), summary: 'Item created from Jira sync' },
  ],
  item_006: [
    { id: 'h_006_1', type: 'ItemCreated', occurredAt: ago(720), summary: 'Item created from GitHub webhook' },
    { id: 'h_006_2', type: 'StatusChanged', occurredAt: ago(360), summary: 'Moved to Doing' },
  ],
  item_007: [
    { id: 'h_007_1', type: 'ItemCreated', occurredAt: ago(180), summary: 'Item created manually' },
  ],
  item_008: [
    { id: 'h_008_1', type: 'ItemCreated', occurredAt: ago(4320), summary: 'Item created from GitHub webhook' },
    { id: 'h_008_2', type: 'Snoozed', occurredAt: ago(1440), summary: 'Snoozed for 2 days' },
  ],
  item_009: [
    { id: 'h_009_1', type: 'ItemCreated', occurredAt: ago(240), summary: 'Item created from Jira sync' },
  ],
  item_010: [
    { id: 'h_010_1', type: 'ItemCreated', occurredAt: ago(360), summary: 'Item created from GitHub webhook' },
    { id: 'h_010_2', type: 'StatusChanged', occurredAt: ago(180), summary: 'Moved to Doing' },
    { id: 'h_010_3', type: 'StatusChanged', occurredAt: ago(90), summary: 'Moved to Blocked - need profiler access' },
  ],
};
