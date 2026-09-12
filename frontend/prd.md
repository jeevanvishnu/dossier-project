# PRD — ECTC Client Portal Dashboard
> **Product Role:** Senior Product Engineer + UI/UX Designer
> **Platform:** ECTC Pharmaceutical Dossier & Regulatory Submission Platform
> **Design System Reference:** `ui.md` (dark theme, sky blue accent `#38BDF8`, Lexend + Source Sans 3)
> **Stack:** Next.js 15, TypeScript, TailwindCSS v4, DaisyUI, Phosphor Icons

---

## 1. Executive Summary

After a user signs in via the existing `AuthModal`, they are routed to a **private client portal dashboard** at `/dashboard`. This dashboard is the core product experience — it replaces the public-facing marketing site for authenticated users. The dashboard gives pharmaceutical clients a unified workspace to:

- Monitor their active dossier count, storage consumption, and submission timelines
- Track regulatory sequence progress across products and countries
- Manage contracts and subscription tariff status
- Upload and review documents inside dossier workflows
- Receive system alerts, compliance notices, and deadline reminders
- Administer users and roles within their organization

The dashboard must feel **professional, data-dense but readable, and operationally trustworthy** — not consumer-grade. It is a B2B tool used daily by regulatory affairs specialists and compliance officers.

---

## 2. User Personas

| Persona | Role | Primary Goals |
|---|---|---|
| **Regulatory Affairs Manager** | Power user | Track all dossier submissions, deadlines, sequence status |
| **Dossier Specialist** | Daily operator | Upload documents, build sequences, validate eCTD structure |
| **Compliance Officer** | Overseer | Audit trail review, export compliance reports |
| **Account Admin** | IT/Management | User management, subscription status, billing |

---

## 3. Route Architecture

| Route | Page | Auth | Description |
|---|---|---|---|
| `/dashboard` | Overview | Protected | Main KPI overview and activity feed |
| `/dashboard/dossiers` | Dossiers | Protected | Dossier list with filter/search |
| `/dashboard/dossiers/[id]` | Dossier Detail | Protected | Full dossier view with sequences and documents |
| `/dashboard/documents` | Documents | Protected | Document library with upload, versioning |
| `/dashboard/contracts` | Contracts | Protected | Contract list and lifecycle status |
| `/dashboard/subscriptions` | Subscription | Protected | Current plan, usage, upgrade options |
| `/dashboard/users` | Team | Protected (Admin) | User management, roles, invites |
| `/dashboard/audit` | Audit Log | Protected (Admin) | Tamper-evident activity log |
| `/dashboard/settings` | Settings | Protected | Profile, notifications, security |

---

## 4. Dashboard Shell — Persistent Layout

The shell persists across all `/dashboard/*` routes.

### 4.1 Sidebar (Desktop: 240px fixed, Tablet: icon-rail 64px, Mobile: drawer)

**Structure (top to bottom):**
```
[ECTC Logo + Wordmark]
─────────────────────
[Search bar — quick-jump to any dossier]
─────────────────────
Navigation:
  Overview          /dashboard
  Dossiers          /dashboard/dossiers
  Documents         /dashboard/documents
  Contracts         /dashboard/contracts
─────────────────────
  Subscription      /dashboard/subscriptions
  Team              /dashboard/users        [Admin only]
  Audit Log         /dashboard/audit        [Admin only]
─────────────────────
  Settings          /dashboard/settings
─────────────────────
[User Avatar + Name + Plan Badge]
[Sign Out button]
```

**Design specs:**
- Background: `--color-surface` (`#192131`)
- Active item: `--color-accent-light` bg with `--color-accent` left border (`2px solid`) and text
- Inactive item: `--color-secondary` text, hover to `--color-surface-raised` bg
- Logo area: `64px` height, `border-bottom: 1px solid --color-border`
- Bottom user block: `border-top: 1px solid --color-border`, `p-4`, avatar 36px circle
- Plan badge: pill-shaped, accent tinted (e.g., "Tariff M" in sky-blue/10 bg)
- Icon: 20px Phosphor icons, left of label
- Sidebar collapse on tablet to icon-rail (tooltip on hover reveals label)

### 4.2 Topbar (Full-width, 56px height)

```
[Breadcrumb: Overview / Dossiers / ...]    [Notifications bell + count]  [User menu]
```

- Background: `--color-bg` (`#121824`)
- `border-bottom: 1px solid --color-border`
- Breadcrumb: `--color-muted` for parent, `--color-primary` for current page
- Notification bell: Phosphor `Bell` icon, badge count in `--color-accent`
- User menu: Avatar dropdown -> Profile, Settings, Sign Out

### 4.3 Main Content Area

- Background: `--color-bg`
- Padding: `p-6` desktop / `p-4` mobile
- Max-width: none (fills remaining space after sidebar)
- Scrolls independently

---

## 5. Page Specifications

---

### 5.1 Overview Page — `/dashboard`

**Purpose:** At-a-glance health of the account — active dossiers, deadlines, storage, and recent activity.

#### 5.1.1 KPI Stat Cards (4-column grid, collapses to 2 on tablet, 1 on mobile)

| Card | Metric | Icon | Color Signal |
|---|---|---|---|
| Active Dossiers | Count / plan limit (e.g., `9 / 15`) | `FolderOpen` | Accent if < 80% used, Warning if >= 80% |
| Storage Used | GB / total (e.g., `68 GB / 100 GB`) | `HardDrive` | Progress bar inside card |
| Pending Sequences | Count awaiting validation | `ClockCountdown` | Warning amber if > 3 |
| Upcoming Deadlines | Count in next 30 days | `CalendarCheck` | Error red if > 0 |

**Card design:**
- Background: `--color-surface`
- Border: `1px solid --color-border`
- Radius: `--radius-xl` (16px)
- Padding: `p-5`
- Top row: Icon in `--color-accent-light` circle + metric label (Caption, muted)
- Middle: Large number (`font-lexend`, `2rem`, 700, `--color-primary`)
- Bottom: Sub-label or progress bar (`--color-secondary`, `Caption`)
- Hover: `--shadow-md`, `border-accent/30` transition `300ms`

#### 5.1.2 Dossier Progress Overview (below KPI cards)

A horizontally scrollable list of the **5 most recently active dossiers**, each shown as a compact card:

```
[Product Name]   [Country flag(s)]   [Sequence: 3/7 complete]   [Status chip]   [View ->]
```

- Status chip variants: `Active` (accent), `Under Review` (amber), `Approved` (emerald), `Rejected` (red)
- Progress bar showing sequence completion percentage
- Clicking navigates to `/dashboard/dossiers/[id]`

#### 5.1.3 Upcoming Deadlines (right column or below on mobile)

A vertically stacked list of deadline items, sorted by soonest:

```
[Red/amber dot]  [Dossier name]  [Deadline type]  [Date]  [Days remaining badge]
```

- "Days remaining" badge: Red if <= 7 days, Amber if <= 30 days, Muted if > 30 days
- Max 5 items shown; "View all" link to `/dashboard/dossiers?filter=deadline`

#### 5.1.4 Recent Activity Feed (full-width at bottom)

Timestamped activity log of the last 10 actions performed on the account:

```
[Avatar or system icon]  [Action description]  [Dossier/Document link]  [Timestamp]
```

Example entries:
- "You uploaded `Module_3.2.P.2_v2.pdf` to **Atorvastatin 40mg**" — 2 hours ago
- "Sequence 004 validation completed for **Metformin 500mg**" — Yesterday
- "User **a.seitkali@company.kz** was invited to the workspace" — 3 days ago

**Design:** Subtle left border `2px solid --color-border`, icon in small circle, action text `--color-secondary`, link in `--color-accent`, timestamp `--color-muted Caption`

---

### 5.2 Dossiers Page — `/dashboard/dossiers`

**Purpose:** Full list of all dossiers in the client's account, with filtering, search, and sorting.

#### 5.2.1 Page Header
```
[H1: Dossiers]   [+ New Dossier button]
[Filter bar: All | Active | Under Review | Approved | Rejected]   [Search input]   [Sort dropdown]
```

#### 5.2.2 Dossier Table

Columns: **Product Name** | **INN** | **Form / Strength** | **Country** | **Sequences** | **Last Updated** | **Status** | **Actions**

- Rows: hover `--color-surface-raised` bg
- Status chip: pill-shaped, variant-colored
- Actions: icon buttons (View `Eye`, Edit `PencilSimple`, Archive `Archive`)
- Pagination: bottom of table, `10 rows/page` default

**Empty state:** Illustration + "No dossiers yet" message + "Create your first dossier" CTA button

#### 5.2.3 Filter Panel (Collapsible, appears left of table on desktop)

Filter by: Country | Status | Submission Type (eCTD / paper) | Date Range | Assigned User

---

### 5.3 Dossier Detail Page — `/dashboard/dossiers/[id]`

**Purpose:** Full dossier workspace — the core product experience.

#### Layout: 3-column (left: module tree, center: sequence timeline, right: document panel)

**Left Panel — CTD Module Tree (240px)**
- Tree view of CTD/eCTD modules: Module 1 through Module 5
- Each module shows: completion percentage ring, document count
- Clicking a module filters the center and right panels

**Center Panel — Sequence Timeline**

Each sequence displayed as a row:
```
[Sequence #]  [Submission Type]  [Date]  [Validation Status]  [Documents count]  [Actions]
```

- Vertical connecting line between sequences (timeline metaphor)
- Sequence status chips: Draft | Pending Validation | Validated | Submitted | Accepted | Rejected
- Expand row shows document list for that sequence inline

**Right Panel — Document Preview / Upload (Drawer)**

- Appears when a document or sequence is selected
- Shows: file name, size, version, upload date, uploaded by
- Actions: Download, Replace (new version), Delete (with confirmation)
- Upload dropzone at top: drag-and-drop + click to browse
- Supported formats: `.pdf`, `.xml`, `.docx`

---

### 5.4 Documents Page — `/dashboard/documents`

**Purpose:** Global document library across all dossiers.

#### Layout: Left filter tree + Right document grid/list toggle

**Features:**
- View toggle: Grid (thumbnail cards) / List (table rows)
- Filter by: Dossier | Module | File type | Upload date | Uploaded by
- Search: by filename or content tag
- Bulk actions: Download ZIP, Move, Archive
- Version history: click file -> side drawer shows version chain
- Upload button: triggers modal with dossier + module assignment

---

### 5.5 Contracts Page — `/dashboard/contracts`

**Purpose:** Track service contracts with lifecycle status.

#### Layout: Table view with expandable detail rows

Columns: **Contract ID** | **Title** | **Start Date** | **End Date** | **Value** | **Status** | **Actions**

Status variants: `Active`, `Expiring Soon` (< 60 days), `Expired`, `Pending Signature`

**Contract detail drawer:**
- Contract summary, linked dossiers, signatory info, attached PDF
- Timeline: Created -> Sent -> Signed -> Active -> Expired

---

### 5.6 Subscription Page — `/dashboard/subscriptions`

**Purpose:** Current plan status, usage meters, and upgrade path.

#### Layout: 2-column (current plan left, usage right)

**Left: Current Plan Card**
```
Plan: Tariff M
Billing: Annual — Next renewal: 14 Mar 2027
Price: $470 / month
[Upgrade Plan button]  [Cancel button — ghost]
```

**Right: Usage Meters**
- Dossiers Used: `9 / 15` — horizontal progress bar
- Storage Used: `68 / 100 GB` — horizontal progress bar
- Active Users: `7 / 10` — horizontal progress bar

**Below: Plan Comparison**
- Stripped-down version of the public pricing cards, with current plan highlighted
- "Upgrade to Tariff L" CTA if approaching limits

---

### 5.7 Team Management Page — `/dashboard/users`

**Purpose:** Manage organization members, roles, and invitations. Admin-only.

#### Layout: Table + Invite modal

Columns: **Avatar** | **Name** | **Email** | **Role** | **Last Active** | **Status** | **Actions**

Roles: `Admin`, `Manager`, `Specialist`, `Viewer`

Actions per row: Change Role (dropdown), Remove User (confirm modal)

**Invite section:** Email input + Role selector + "Send Invite" button. Pending invites shown below table with resend/revoke options.

---

### 5.8 Audit Log — `/dashboard/audit`

**Purpose:** Tamper-evident, read-only activity log for compliance. Admin-only.

#### Layout: Table + Filter panel

Columns: **Timestamp** | **User** | **Action** | **Resource** | **IP Address** | **Status**

Filters: Date range | User | Action type | Resource type

Export: CSV / PDF export button (top right)

Design note: Monospace font (`JetBrains Mono`) for IP addresses and resource IDs.

---

### 5.9 Settings Page — `/dashboard/settings`

**Purpose:** Personal settings and security.

#### Tabs: Profile | Security | Notifications | API Keys (Admin only)

**Profile tab:**
- Avatar upload (drag-and-drop circle)
- Name, Email (read-only if SSO), Role (read-only)
- Organization name, timezone

**Security tab:**
- Change password form (current -> new -> confirm)
- Active sessions list with revoke per-session option
- 2FA toggle (future)

**Notifications tab:**
- Toggle list: Email notifications for — Deadline reminders | Sequence validated | Document uploaded | Contract expiring | System alerts
- Notification frequency: Instant | Daily digest | Weekly digest

---

## 6. Component Library Extensions

New components required beyond existing ones:

| Component | Description |
|---|---|
| `DashboardShell` | Persistent layout wrapper: sidebar + topbar + content slot |
| `Sidebar` | Collapsible nav with active states, user block, plan badge |
| `Topbar` | Breadcrumb + notification bell + user menu |
| `KpiCard` | Stat card with icon, metric, sub-label, optional progress bar |
| `StatusChip` | Pill chip with variant colors (active/warning/error/success/muted) |
| `DossierRow` | Compact dossier summary card with progress bar |
| `DeadlineItem` | Single deadline row with urgency-colored dot |
| `ActivityFeedItem` | Log entry with avatar, action, link, timestamp |
| `DataTable` | Sortable, filterable table with pagination and row hover |
| `DocumentCard` | File thumbnail card with meta and actions |
| `UsageMeter` | Labelled progress bar with value/limit display |
| `TreeView` | Collapsible module/folder tree |
| `TimelineRow` | Sequence timeline row with expand/collapse |
| `UploadDropzone` | Drag-and-drop file upload area |
| `ConfirmModal` | Generic confirmation dialog (delete, archive) |
| `NotificationDrawer` | Right-side slide-in panel for bell notifications |

---

## 7. Design Tokens & Constraints

All tokens from `ui.md` apply. Additional dashboard-specific constraints:

### 7.1 Data Density

- Tables: row height `52px` default
- KPI cards: fixed height `120px` on desktop
- Sidebar items: `44px` min height (touch target)
- Activity feed items: `56px` per row

### 7.2 Status Color System

| Status | Color | Token |
|---|---|---|
| Active / Success | Emerald | `--color-success` `#10B981` |
| Warning / Expiring | Amber | `--color-warning` `#F59E0B` |
| Error / Rejected | Red | `--color-error` `#EF4444` |
| Pending / Draft | Sky Blue | `--color-accent` `#38BDF8` |
| Archived / Inactive | Muted | `--color-muted` `#64748B` |

### 7.3 Sidebar Behavior

| Breakpoint | State |
|---|---|
| `< 768px` | Hidden by default; opens as full-screen drawer over content |
| `768–1023px` | Icon-rail mode (64px), labels hidden, tooltip on hover |
| `>= 1024px` | Full sidebar (240px), always visible |

### 7.4 Motion

- Sidebar open/close: `300ms ease-in-out`
- Page transitions: `opacity` fade `200ms`
- Table row hover: `background-color 150ms`
- Notification drawer slide-in: `300ms ease-decelerate`
- KPI card hover lift: `box-shadow 300ms, translateY 300ms`

---

## 8. Empty & Loading States

### 8.1 Loading States
- KPI cards: skeleton placeholder (animated gradient shimmer, `--color-surface-raised` base)
- Tables: 5 skeleton rows matching column layout
- Document thumbnails: aspect-ratio preserved skeleton card

### 8.2 Empty States

| Page | Empty State Message | CTA |
|---|---|---|
| Dossiers | "No dossiers created yet" | "Create First Dossier" |
| Documents | "No documents uploaded" | "Upload Documents" |
| Contracts | "No contracts on file" | "Contact Support" |
| Audit Log | "No activity recorded" | — |
| Team | "Only you here so far" | "Invite a Team Member" |

### 8.3 Error States

- 404 (wrong dossier ID): "Dossier not found" with back button
- 403 (non-admin accessing admin route): "Access restricted" with explanation
- 500: "Something went wrong" with retry button

---

## 9. Accessibility Requirements

- All sidebar nav items: `aria-current="page"` on active item
- All data tables: `<th scope="col">` headers, keyboard-navigable rows
- All modals: focus trap, `aria-modal="true"`, ESC to close
- All form inputs: `<label>` associated, error messages linked via `aria-describedby`
- Skip-to-main-content link at top of every dashboard page
- Color is never the sole indicator — always paired with icon or label
- WCAG AA minimum across all dashboard surfaces

---

## 10. Notifications System

### 10.1 Notification Bell (Topbar)
- Phosphor `Bell` icon with numeric badge (`--color-accent` background)
- Click opens `NotificationDrawer` (right-side slide-in panel, 380px wide)

### 10.2 Notification Types

| Type | Icon | Trigger |
|---|---|---|
| Deadline Reminder | `CalendarCheck` (amber) | 30 days, 7 days, 1 day before deadline |
| Sequence Validated | `CheckCircle` (emerald) | Backend validation completes |
| Sequence Rejected | `XCircle` (red) | Validation fails |
| Document Uploaded | `UploadSimple` (accent) | Team member uploads |
| Contract Expiring | `Warning` (amber) | 60 days before contract end |
| System Alert | `Info` (muted) | Maintenance, downtime notices |

### 10.3 Notification Item Design
```
[Icon in colored circle]  [Title — bold, primary]
                          [Description — secondary, 2 lines max]
                          [Timestamp — muted, caption]
```
- Unread: left `3px solid --color-accent` border
- Read: no border
- "Mark all read" link at top of drawer

---

## 11. Implementation Phases

### Phase 1 — Foundation (Sprint 1–2)
- [ ] `DashboardShell` layout component (Sidebar + Topbar + Content)
- [ ] Sidebar navigation with active state, collapse behavior
- [ ] Topbar with breadcrumb, notification bell placeholder, user menu
- [ ] Route setup: `/dashboard` and nested routes
- [ ] Auth guard middleware to protect all `/dashboard/*` routes

### Phase 2 — Overview Dashboard (Sprint 3)
- [ ] `KpiCard` component
- [ ] `StatusChip` component
- [ ] Overview page: 4 KPI cards, dossier progress list, deadlines, activity feed
- [ ] Skeleton loading states for all overview components
- [ ] Empty states

### Phase 3 — Dossier Management (Sprint 4–5)
- [ ] Dossiers list page with `DataTable`, filters, search, sort
- [ ] Dossier detail page: CTD module tree, sequence timeline, document panel
- [ ] `UploadDropzone` component
- [ ] Document card component
- [ ] New Dossier creation modal/wizard

### Phase 4 — Supporting Pages (Sprint 6)
- [ ] Documents global library page
- [ ] Contracts page
- [ ] Subscription / plan usage page
- [ ] Settings page (Profile + Security + Notifications tabs)

### Phase 5 — Admin & Compliance (Sprint 7)
- [ ] Team management page
- [ ] Audit log page (read-only table)
- [ ] Notification system (bell + drawer + types)
- [ ] Export functionality (CSV, PDF)

---

## 12. API Integration Points

All endpoints prefixed `/api` (consumed via `app/lib/axios.ts`).

| Feature | Method | Endpoint |
|---|---|---|
| Auth guard (me) | GET | `/api/auth/me` |
| List dossiers | GET | `/api/dossiers` |
| Get dossier | GET | `/api/dossiers/:id` |
| Create dossier | POST | `/api/dossiers` |
| List sequences | GET | `/api/dossiers/:id/sequences` |
| Upload document | POST | `/api/documents/upload` |
| List documents | GET | `/api/documents` |
| List contracts | GET | `/api/contracts` |
| Get subscription | GET | `/api/subscription/me` |
| List users | GET | `/api/users` (Admin) |
| Invite user | POST | `/api/users/invite` (Admin) |
| Get audit log | GET | `/api/audit` (Admin) |
| Get notifications | GET | `/api/notifications` |
| Mark notifications read | PATCH | `/api/notifications/read` |

---

## 13. Design Anti-Patterns (Dashboard-specific)

Extending `ui.md` Section 8:

| Anti-Pattern | Reason |
|---|---|
| Infinite scroll on data tables | Breaks keyboard navigation and URL-shareable state |
| Inline editing without explicit save button | Data integrity risk in regulatory context |
| Auto-dismissing toasts for destructive actions | User must confirm they saw the result |
| Collapsing sidebar by default on desktop | Loses wayfinding context |
| Chart-first dashboards with no tabular alternative | Fails accessibility, audit requirements |
| Optimistic deletes without undo | Compliance context — data loss unacceptable |
| Session timeout without warning | Forces unexpected re-auth mid-workflow |

---

## 14. Success Metrics

| Metric | Target |
|---|---|
| Dashboard load (LCP) | < 1.5s |
| Dossier search to result | < 400ms |
| Document upload to confirmation | < 3s (< 10MB file) |
| Zero unhandled 401 errors during active session | Via token refresh flow in `axios.ts` |
| WCAG AA compliance | 100% on all dashboard pages |
| Sidebar collapse animation | 0 dropped frames (60fps) |

---

*This PRD is the single source of truth for the ECTC Client Portal Dashboard. Implementation decisions defer to `ui.md` for all design tokens. Backend integration defers to the auth architecture in `auth.controller.ts` and `axios.ts`.*
