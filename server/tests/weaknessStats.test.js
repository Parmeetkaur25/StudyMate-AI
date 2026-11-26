import test from 'node:test';
import assert from 'node:assert/strict';

import { classify, topicKey } from '../src/utils/weaknessStats.js';

// classify() tests

test('classifies percentage below 50 as weak', () => {
  assert.equal(classify(49), 'weak');
});

test('classifies 50 percent as average', () => {
  assert.equal(classify(50), 'average');
});

test('classifies 74 percent as average', () => {
  assert.equal(classify(74), 'average');
});

test('classifies 75 percent as strong', () => {
  assert.equal(classify(75), 'strong');
});

// topicKey() tests

test('converts subject and topic to lowercase', () => {
  assert.equal(
    topicKey({ subject: 'MATHS', topic: 'Algebra' }),
    'maths|algebra'
  );
});

test('removes extra spaces from subject and topic', () => {
  assert.equal(
    topicKey({ subject: ' Maths ', topic: ' Algebra ' }),
    'maths|algebra'
  );
});

test('handles missing subject and topic safely', () => {
  assert.equal(
    topicKey({}),
    '|'
  );
});