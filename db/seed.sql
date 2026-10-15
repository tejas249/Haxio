-- Same starting state the in-memory mock data used to seed on every
-- process start. Safe to re-run: clears and reinserts.

truncate refund_approvals, tickets, accounts cascade;
alter sequence ticket_id_seq restart with 4002;
alter sequence approval_id_seq restart with 1;

insert into accounts (id, company, contact_email, plan, status, open_invoice_cents, suspended_reason, last_login)
values
  ('ACC-1001', 'Northwind Traders', 'ops@northwind.example', 'pro', 'active', 0, null, '2026-10-12T09:14:00Z'),
  ('ACC-1002', 'Bluebird Analytics', 'billing@bluebird.example', 'starter', 'past_due', 4900, null, '2026-10-10T17:02:00Z'),
  ('ACC-1003', 'Granite Logistics', 'it@graniteco.example', 'enterprise', 'suspended', 129900, 'Unpaid invoice INV-8831 from 2026-09-12', '2026-09-29T11:45:00Z'),
  ('ACC-1004', 'Cedar & Co', 'hello@cedarco.example', 'pro', 'active', 0, null, '2026-10-13T20:30:00Z');

insert into tickets (id, account_id, subject, description, priority, status, created_at)
values
  ('TCK-4001', 'ACC-1002', 'Invoice looks wrong', 'Customer flagged a possible duplicate charge on INV-7742.', 'normal', 'open', '2026-10-09T13:00:00Z');
