import assert from 'node:assert/strict';
import { test } from 'node:test';
import { merch } from '../src/config/event.ts';
import { getWorkshopDate, isWorkshopFinished } from '../src/lib/workshops.ts';

test('un taller solo finaliza después de su día calendario en Perú', () => {
  const date = '2026-11-14';
  assert.equal(isWorkshopFinished(date, new Date('2026-11-13T23:59:59-05:00')), false);
  assert.equal(isWorkshopFinished(date, new Date('2026-11-14T00:00:00-05:00')), false);
  assert.equal(isWorkshopFinished(date, new Date('2026-11-14T16:00:00-05:00')), false);
  assert.equal(isWorkshopFinished(date, new Date('2026-11-14T23:59:59.999-05:00')), false);
  assert.equal(isWorkshopFinished(date, new Date('2026-11-15T00:00:00-05:00')), true);
});

test('la medianoche UTC no adelanta el estado del taller en Perú', () => {
  assert.equal(getWorkshopDate(new Date('2026-11-15T04:59:59.999Z')), '2026-11-14');
  assert.equal(getWorkshopDate(new Date('2026-11-15T05:00:00Z')), '2026-11-15');
});

test('se compara la fecha completa entre meses y años', () => {
  assert.equal(isWorkshopFinished('2026-11-30', new Date('2026-12-01T00:00:00-05:00')), true);
  assert.equal(isWorkshopFinished('2026-12-31', new Date('2027-01-01T00:00:00-05:00')), true);
  assert.equal(isWorkshopFinished('2027-01-01', new Date('2026-12-31T23:59:59-05:00')), false);
});

test('el cronograma marca cada tarjeta por separado y conserva las futuras', () => {
  const workshops = merch.find((item) => item.label === 'Talleres')!.flyer!.workshops!;
  const finishedDates = (now: string) => workshops
    .filter((workshop) => isWorkshopFinished(workshop.date, new Date(now)))
    .map((workshop) => workshop.date);

  assert.deepEqual(finishedDates('2026-11-07T16:00:00-05:00'), []);
  assert.deepEqual(finishedDates('2026-11-14T16:00:00-05:00'), ['2026-11-07']);
  assert.deepEqual(finishedDates('2026-11-21T16:00:00-05:00'), ['2026-11-07', '2026-11-14']);
  assert.deepEqual(finishedDates('2026-11-22T00:00:00-05:00'), ['2026-11-07', '2026-11-14', '2026-11-21']);
});
