type Status = "inbox" | "doing" | "blocked" | "done";
type SourceType = "github" | "jira" | "slack" | "custom";

type Item = {
  id: string;
  title: string;
  status: Status;
  source: {
    type: SourceType;
    externalId: string;
    display: string;
  };
  createdAt: string;
  updatedAt: string;
};

type Board = {
  columns: Status[];
  items: Item[];
  queueDepth: number;
  deadLetterCount: number;
  mode: "local-file" | "aws-final";
};

type HistoryEntry = {
  id: string;
  type: string;
  occurredAt: string;
  summary: string;
};

type Notification = {
  level: "info" | "warn" | "alert";
  title: string;
  detail: string;
};

type DashboardState = {
  board: Board | null;
  statusMessage: string;
  lastSync: string;
  selectedItemId: string | null;
  draggingItemId: string | null;
  selectedHistory: HistoryEntry[];
  filterQuery: string;
  notifications: Notification[];
};

declare global {
  interface Window {
    __WORKSHOP_CONFIG__?: {
      apiBaseUrl?: string;
      backendUrl?: string;
    };
  }
}

const statusLabels: Record<Status, string> = {
  inbox: "Inbox",
  doing: "Doing",
  blocked: "Blocked",
  done: "Done",
};

const state: DashboardState = {
  board: null,
  statusMessage: "Loading board state...",
  lastSync: "never",
  selectedItemId: null,
  draggingItemId: null,
  selectedHistory: [],
  filterQuery: "",
  notifications: [],
};

const appRoot = document.querySelector<HTMLDivElement>("#app");
const apiBaseUrl = window.__WORKSHOP_CONFIG__?.apiBaseUrl?.replace(/\/+$/, "") ?? "";
const backendUrl = window.__WORKSHOP_CONFIG__?.backendUrl?.replace(/\/+$/, "") ?? "http://127.0.0.1:7001";
const isLocalHost = /^(127\.0\.0\.1|localhost)$/.test(window.location.hostname);

if (!appRoot) {
  throw new Error("Expected #app container");
}

const appContainer = appRoot;

function render(): void {
  const board = state.board ?? {
    columns: ["inbox", "doing", "blocked", "done"] as Status[],
    items: [],
    queueDepth: 0,
    deadLetterCount: 0,
    mode: "local-file" as const,
  };
  const selectedItem = board.items.find((item) => item.id === state.selectedItemId) ?? null;
  const visibleItems = state.filterQuery
    ? board.items.filter((item) => {
        const query = state.filterQuery.toLowerCase();
        return item.title.toLowerCase().includes(query) || item.source.display.toLowerCase().includes(query);
      })
    : board.items;

  appContainer.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div>
          <span class="eyebrow">Stage 0 local reference app</span>
          <h1>AWS TypeScript Workshop Board</h1>
          <p class="subtle">Drag cards across the board. The metrics and webhook controls stay available, but the Kanban flow is the center of the page.</p>
        </div>
        <div class="topbar-actions">
          <label class="search">
            <input id="search-input" type="search" placeholder="Search items..." value="${escapeHtml(state.filterQuery)}" />
          </label>
          <button id="open-event-panel">Simulate Event</button>
          <button class="secondary reset-button" id="reset-board">Reset board</button>
        </div>
      </header>

      <section class="metrics-strip">
        <div class="metric-chip">
          <span class="label">Mode</span>
          <span class="value">${board.mode}</span>
        </div>
        <div class="metric-chip">
          <span class="label">Queue</span>
          <span class="value">${board.queueDepth}</span>
        </div>
        <div class="metric-chip">
          <span class="label">DLQ</span>
          <span class="value">${board.deadLetterCount}</span>
        </div>
        <div class="metric-chip">
          <span class="label">Last sync</span>
          <span class="value">${state.lastSync}</span>
        </div>
      </section>

      <main class="workspace">
        <section class="board-stage">
          <div class="board-intro">
            <div>
              <h2>Kanban board</h2>
              <p class="subtle">Board-first layout, drag-and-drop movement, and a details panel on the right.</p>
            </div>
            <div class="status-banner">
              <strong>Status</strong>
              <span>${state.statusMessage}</span>
            </div>
          </div>

          <section class="board">
            ${(board.columns ?? []).map((column) => renderColumn(column, visibleItems)).join("")}
          </section>
        </section>

        <aside class="sidebar">
          <article class="panel detail-panel">
            <h2>Selected item</h2>
            ${selectedItem ? renderSelectedItem(selectedItem) : `<p class="subtle">Select a card to inspect it. You can also drag it to a different column.</p>`}
          </article>

          <article class="panel" id="event-panel">
            <h2>Simulate external event</h2>
            <p class="subtle">This hits the public webhook endpoint. The backend worker picks it up from the local queue.</p>
            <form id="event-form">
              <label>
                Title
                <input name="title" value="Webhook task from GitHub" required />
              </label>
              <label>
                Source type
                <select name="sourceType">
                  <option value="github">GitHub</option>
                  <option value="jira">Jira</option>
                  <option value="slack">Slack</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label>
                External id
                <input name="externalId" value="workshop#demo" required />
              </label>
              <button type="submit">Queue external event</button>
            </form>
          </article>
        </aside>
      </main>

      ${renderNotifications(state.notifications)}

      <footer class="debug-footer">
        <span>debug:</span>
        <a href="${apiBaseUrl}/api/logs" target="_blank" rel="noopener">bff logs</a>
        ${isLocalHost
          ? `<a href="${backendUrl}/internal/logs" target="_blank" rel="noopener">backend logs</a>`
          : `<span class="muted" title="backend is private in this stage">backend logs ✕</span>`}
      </footer>
    </div>
  `;

  const eventForm = document.querySelector<HTMLFormElement>("#event-form");
  const resetButton = document.querySelector<HTMLButtonElement>("#reset-board");
  const searchInput = document.querySelector<HTMLInputElement>("#search-input");
  const openEventPanel = document.querySelector<HTMLButtonElement>("#open-event-panel");

  eventForm?.addEventListener("submit", handleEventSubmit);
  resetButton?.addEventListener("click", handleReset);
  searchInput?.addEventListener("input", handleSearch);
  openEventPanel?.addEventListener("click", handleOpenEventPanel);

  for (const select of Array.from(document.querySelectorAll<HTMLSelectElement>("[data-status-select]"))) {
    select.addEventListener("change", handleStatusSelect);
  }

  for (const card of Array.from(document.querySelectorAll<HTMLElement>("[data-card-id]"))) {
    card.addEventListener("click", handleSelectCard);
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
  }

  for (const column of Array.from(document.querySelectorAll<HTMLElement>("[data-column]"))) {
    column.addEventListener("dragover", handleDragOver);
    column.addEventListener("dragleave", handleDragLeave);
    column.addEventListener("drop", handleDrop);
  }
}

function renderColumn(column: Status, items: Item[]): string {
  const columnItems = items.filter((item) => item.status === column);
  return `
    <article class="column" data-column="${column}">
      <div class="column-header">
        <h3>${statusLabels[column]}</h3>
        <span class="subtle">${columnItems.length}</span>
      </div>
      <div class="card-list">
        ${columnItems.map((item) => renderCard(item)).join("") || `<p class="subtle">No items</p>`}
      </div>
    </article>
  `;
}

function renderNotifications(notifications: Notification[]): string {
  if (notifications.length === 0) {
    return "";
  }
  return `
    <section class="notifications">
      ${notifications
        .map(
          (n) => `
        <div class="notification ${n.level}">
          <strong>${escapeHtml(n.title)}</strong>
          <span>${escapeHtml(n.detail)}</span>
        </div>`,
        )
        .join("")}
    </section>
  `;
}

function renderCard(item: Item): string {
  return `
    <section class="card ${state.selectedItemId === item.id ? "selected" : ""}" data-card-id="${item.id}" draggable="true">
      <span class="tag ${item.source.type}">${item.source.type}</span>
      <h4>${item.title}</h4>
      <p class="subtle">${item.source.display}</p>
      <p class="subtle">Updated ${new Date(item.updatedAt).toLocaleTimeString()}</p>
    </section>
  `;
}

function renderSelectedItem(item: Item): string {
  return `
    <div class="selected-card">
      <span class="tag ${item.source.type}">${item.source.type}</span>
      <h3>${item.title}</h3>
      <label class="detail-control">
        <span>Status</span>
        <select data-status-select="${item.id}">
          ${renderStatusOptions(item.status)}
        </select>
      </label>
      <dl class="detail-list">
        <div>
          <dt>Source</dt>
          <dd>${item.source.display}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>${new Date(item.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>${new Date(item.updatedAt).toLocaleString()}</dd>
        </div>
      </dl>
      <div class="history-block">
        <h4>History</h4>
        ${state.selectedHistory.length > 0 ? `
          <ul class="history-list">
            ${state.selectedHistory.map((entry) => `
              <li>
                <strong>${escapeHtml(entry.summary)}</strong>
                <span>${new Date(entry.occurredAt).toLocaleString()}</span>
              </li>
            `).join("")}
          </ul>
        ` : `<p class="subtle">No history loaded.</p>`}
      </div>
      <p class="subtle">Drag this card to another column or update it from the detail panel.</p>
    </div>
  `;
}

function renderStatusOptions(currentStatus: Status): string {
  return (Object.keys(statusLabels) as Status[])
    .map((status) => `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${statusLabels[status]}</option>`)
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

async function loadBoard(message = "Board refreshed."): Promise<void> {
  const [boardResponse, notificationsResponse] = await Promise.all([
    fetch(apiUrl("/api/board")),
    fetch(apiUrl("/api/notifications")),
  ]);
  if (!boardResponse.ok) {
    throw new Error(`Failed to fetch board (${boardResponse.status})`);
  }

  state.board = await boardResponse.json() as Board;
  state.notifications = notificationsResponse.ok
    ? ((await notificationsResponse.json()).notifications ?? [])
    : [];
  state.statusMessage = message;
  state.lastSync = new Date().toLocaleTimeString();
  render();
}

async function moveItem(itemId: string, nextStatus: Status): Promise<void> {
  const board = state.board;
  const item = board?.items.find((candidate) => candidate.id === itemId);

  if (!item) {
    return;
  }

  try {
    const response = await fetch(apiUrl(`/api/items/${itemId}/status`), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      throw new Error(`Status update failed (${response.status})`);
    }

    const retryCount = response.headers.get("x-retry-count") ?? "0";
    state.selectedItemId = itemId;
    await loadBoard(`Moved ${item.title} to ${statusLabels[nextStatus]}. BFF retries: ${retryCount}`);
    await loadSelectedItemDetails(itemId);
  } catch (error) {
    state.statusMessage = error instanceof Error ? error.message : "Status update failed";
    render();
  }
}

async function handleSelectCard(event: Event): Promise<void> {
  const card = event.currentTarget as HTMLElement;
  const itemId = card.dataset.cardId ?? null;
  state.selectedItemId = itemId;
  render();
  if (itemId) {
    await loadSelectedItemDetails(itemId);
  }
}

function handleDragStart(event: DragEvent): void {
  const card = event.currentTarget as HTMLElement;
  const itemId = card.dataset.cardId;

  if (!itemId || !event.dataTransfer) {
    return;
  }

  state.draggingItemId = itemId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", itemId);
  card.classList.add("dragging");
}

function handleDragEnd(event: DragEvent): void {
  state.draggingItemId = null;
  const card = event.currentTarget as HTMLElement;
  card.classList.remove("dragging");

  for (const column of Array.from(document.querySelectorAll<HTMLElement>("[data-column]"))) {
    column.classList.remove("drag-over");
  }
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  const column = event.currentTarget as HTMLElement;
  column.classList.add("drag-over");
}

function handleDragLeave(event: DragEvent): void {
  const column = event.currentTarget as HTMLElement;
  column.classList.remove("drag-over");
}

async function handleDrop(event: DragEvent): Promise<void> {
  event.preventDefault();
  const column = event.currentTarget as HTMLElement;
  column.classList.remove("drag-over");

  const nextStatus = column.dataset.column as Status | undefined;
  const itemId = event.dataTransfer?.getData("text/plain") ?? state.draggingItemId;

  if (!itemId || !nextStatus || !state.board) {
    return;
  }

  const currentItem = state.board.items.find((candidate) => candidate.id === itemId);
  if (!currentItem || currentItem.status === nextStatus) {
    return;
  }

  await moveItem(itemId, nextStatus);
}

async function handleStatusSelect(event: Event): Promise<void> {
  const select = event.currentTarget as HTMLSelectElement;
  const itemId = select.dataset.statusSelect;
  const nextStatus = select.value as Status;

  if (!itemId) {
    return;
  }

  await moveItem(itemId, nextStatus);
}

function handleSearch(event: Event): void {
  const input = event.currentTarget as HTMLInputElement;
  state.filterQuery = input.value;
  render();
}

function handleOpenEventPanel(): void {
  document.querySelector<HTMLElement>("#event-panel")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

async function loadSelectedItemDetails(itemId: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/items/${itemId}`));

  if (!response.ok) {
    state.selectedHistory = [];
    render();
    return;
  }

  const payload = await response.json() as { history?: HistoryEntry[] };
  state.selectedHistory = payload.history ?? [];
  render();
}

async function handleEventSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const formData = new FormData(form);

  try {
    const response = await fetch(apiUrl("/webhooks/external"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("title"),
        sourceType: formData.get("sourceType"),
        externalId: formData.get("externalId"),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook enqueue failed (${response.status})`);
    }

    state.statusMessage = "External event queued. Worker will process it on the next poll.";
    render();
    window.setTimeout(() => {
      void loadBoard("Board refreshed after async event processing.");
    }, 1800);
  } catch (error) {
    state.statusMessage = error instanceof Error ? error.message : "Webhook enqueue failed";
    render();
  }
}

async function handleReset(): Promise<void> {
  const response = await fetch(apiUrl("/api/board/reset"), { method: "POST" });
  if (!response.ok) {
    state.statusMessage = `Reset failed (${response.status})`;
    render();
    return;
  }

  await loadBoard("Reset board state from seed data.");
}

void loadBoard().catch((error) => {
  state.statusMessage = error instanceof Error ? error.message : "Unable to load board";
  render();
});
