import test from 'node:test';
import assert from 'node:assert';
import { calculateSubtotal, calculateTotal, formatCurrency } from '../lib/services/invoice/calculator';

test('calculateSubtotal computes correct sum of items', () => {
  const items = [
    { id: '1', description: 'Web Dev', quantity: 1, rate: 5000000, amount: 5000000 },
    { id: '2', description: 'Hosting', quantity: 2, rate: 250000, amount: 500000 },
  ];
  
  const subtotal = calculateSubtotal(items);
  assert.strictEqual(subtotal, 5500000);
});

test('calculateTotal applies tax and discount correctly', () => {
  const subtotal = 1000000;
  const tax = 110000; // 11% tax
  const discount = 50000;
  
  const total = calculateTotal(subtotal, tax, discount);
  assert.strictEqual(total, 1060000);
});

test('calculateTotal never returns negative total', () => {
  const subtotal = 1000000;
  const tax = 0;
  const discount = 2000000; // Huge discount
  
  const total = calculateTotal(subtotal, tax, discount);
  assert.strictEqual(total, 0);
});

test('formatCurrency formats IDR correctly', () => {
  const amount = 5000000;
  const formatted = formatCurrency(amount, 'IDR');
  
  // Intl format can include non-breaking spaces or regular spaces depending on node version, 
  // so we check if it starts with Rp and ends with 5.000.000 (ignoring exact whitespace)
  assert.match(formatted, /Rp\s*5\.000\.000/);
});
