import { describe, it, expect } from 'vitest'
import {
  createPartnerState,
  switchPartner,
  getActivePartner,
  getPartnerSummary,
  formatWorkTime,
} from '@/lib/partner-wod'

describe('createPartnerState', () => {
  it('starts with Partner A active', () => {
    const state = createPartnerState()
    expect(getActivePartner(state)).toBe('A')
  })

  it('has zero rounds and work time for both partners', () => {
    const state = createPartnerState()
    expect(state.partnerA).toEqual({ rounds: 0, totalWorkMs: 0 })
    expect(state.partnerB).toEqual({ rounds: 0, totalWorkMs: 0 })
    expect(state.switchCount).toBe(0)
    expect(state.lastSwitchAt).toBe(0)
  })
})

describe('switchPartner', () => {
  it('switches from A to B', () => {
    const state = createPartnerState()
    const next = switchPartner(state, 30000)
    expect(getActivePartner(next)).toBe('B')
  })

  it('switches back from B to A', () => {
    const state = createPartnerState()
    const after1 = switchPartner(state, 30000)
    const after2 = switchPartner(after1, 60000)
    expect(after2.activePartner).toBe('A')
  })

  it('tracks rounds per partner (A works, switch gives A 1 round)', () => {
    const state = createPartnerState()
    const next = switchPartner(state, 30000)
    expect(next.partnerA.rounds).toBe(1)
    expect(next.partnerB.rounds).toBe(0)
  })

  it('calculates work time per partner from switch timestamps', () => {
    const state = createPartnerState()
    const next = switchPartner(state, 30000)
    expect(next.partnerA.totalWorkMs).toBe(30000)
  })

  it('counts total switches', () => {
    const state = createPartnerState()
    const after1 = switchPartner(state, 10000)
    const after2 = switchPartner(after1, 25000)
    const after3 = switchPartner(after2, 40000)
    expect(after3.switchCount).toBe(3)
  })

  it('increments partner rounds correctly on each switch (3 switches)', () => {
    const state = createPartnerState()
    const after1 = switchPartner(state, 10000)
    const after2 = switchPartner(after1, 25000)
    const after3 = switchPartner(after2, 40000)
    expect(after3.partnerA.rounds).toBe(2)
    expect(after3.partnerB.rounds).toBe(1)
  })
})

describe('formatWorkTime', () => {
  it('formats 154000ms as "2:34"', () => {
    expect(formatWorkTime(154000)).toBe('2:34')
  })

  it('formats 0ms as "0:00"', () => {
    expect(formatWorkTime(0)).toBe('0:00')
  })
})

describe('getPartnerSummary', () => {
  it('returns correct totals after multiple switches', () => {
    const state = createPartnerState()
    const after1 = switchPartner(state, 30000)
    const after2 = switchPartner(after1, 75000)
    const after3 = switchPartner(after2, 105000)

    const summary = getPartnerSummary(after3)
    expect(summary).toEqual({
      partnerA: { rounds: 2, workTime: '1:00' },
      partnerB: { rounds: 1, workTime: '0:45' },
      totalSwitches: 3,
    })
  })
})
