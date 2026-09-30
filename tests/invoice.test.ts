import test from 'node:test';
import assert from 'node:assert';
import { INVOICE_STATUS_MAP, PROPOSAL_STATUS_MAP } from '../types/status';

test('INVOICE_STATUS_MAP contains correct definitions', () => {
  assert.ok(INVOICE_STATUS_MAP['DRAFT'], 'DRAFT status missing');
  assert.strictEqual(INVOICE_STATUS_MAP['PAID'].label, 'Lunas');
  assert.match(INVOICE_STATUS_MAP['OVERDUE'].badgeClass, /rose/); // Should use danger colors
});

test('PROPOSAL_STATUS_MAP has expected keys and labels', () => {
  assert.ok(PROPOSAL_STATUS_MAP['SENT']);
  assert.strictEqual(PROPOSAL_STATUS_MAP['ACCEPTED'].label, 'Diterima');
  assert.match(PROPOSAL_STATUS_MAP['ACCEPTED'].colorVar, /--color-success/);
});
