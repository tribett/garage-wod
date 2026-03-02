import { describe, test, expect } from 'vitest'
import { parseMovementLine, buildProgram } from '../program-builder'
import type { ProgramTemplate } from '../program-builder'

// ---------------------------------------------------------------------------
// parseMovementLine
// ---------------------------------------------------------------------------

describe('parseMovementLine', () => {
  test('parses reps + name + weight: "10 Thrusters (95/65)"', () => {
    const m = parseMovementLine('10 Thrusters (95/65)')
    expect(m.reps).toBe(10)
    expect(m.name).toBe('Thrusters')
    expect(m.weight).toBe('95/65')
  })

  test('parses reps + name without weight: "10 Back Squats"', () => {
    const m = parseMovementLine('10 Back Squats')
    expect(m.reps).toBe(10)
    expect(m.name).toBe('Back Squats')
    expect(m.weight).toBeUndefined()
  })

  test('parses name + weight without reps: "Thrusters (95/65)"', () => {
    const m = parseMovementLine('Thrusters (95/65)')
    expect(m.reps).toBeUndefined()
    expect(m.name).toBe('Thrusters')
    expect(m.weight).toBe('95/65')
  })

  test('parses name only: "Run 400m"', () => {
    const m = parseMovementLine('Run 400m')
    expect(m.reps).toBeUndefined()
    expect(m.name).toBe('Run 400m')
    expect(m.weight).toBeUndefined()
  })

  test('handles empty string gracefully', () => {
    const m = parseMovementLine('')
    expect(m.name).toBe('Unknown')
  })

  test('handles whitespace-only string', () => {
    const m = parseMovementLine('   ')
    expect(m.name).toBe('Unknown')
  })

  test('trims whitespace from input', () => {
    const m = parseMovementLine('  15 Pull-ups  ')
    expect(m.reps).toBe(15)
    expect(m.name).toBe('Pull-ups')
  })

  test('handles descriptive weight: "Deadlifts (Heavy DB)"', () => {
    const m = parseMovementLine('5 Deadlifts (Heavy DB)')
    expect(m.reps).toBe(5)
    expect(m.name).toBe('Deadlifts')
    expect(m.weight).toBe('Heavy DB')
  })

  test('always generates a unique id', () => {
    const m1 = parseMovementLine('10 Squats')
    const m2 = parseMovementLine('10 Squats')
    expect(m1.id).toBeDefined()
    expect(m2.id).toBeDefined()
    expect(m1.id).not.toBe(m2.id)
  })
})

// ---------------------------------------------------------------------------
// buildProgram
// ---------------------------------------------------------------------------

describe('buildProgram', () => {
  const template: ProgramTemplate = {
    name: 'Test Program',
    description: 'A test',
    weeks: 3,
    daysPerWeek: [
      {
        name: 'Day 1 - Upper',
        wodType: 'forTime',
        wodName: 'Fran',
        movementLines: ['21 Thrusters (95/65)', '21 Pull-ups'],
        scoring: { duration: 10 },
      },
      {
        name: 'Day 2 - Lower',
        wodType: 'amrap',
        wodName: 'Leg Burner',
        wodDescription: '20 min AMRAP',
        movementLines: ['20 Air Squats', 'Run 400m'],
        scoring: { duration: 20 },
      },
    ],
  }

  test('generates correct number of weeks', () => {
    const prog = buildProgram(template)
    const allWeeks = prog.phases.flatMap((p) => p.weeks)
    expect(allWeeks).toHaveLength(3)
  })

  test('each week has the correct number of days', () => {
    const prog = buildProgram(template)
    for (const phase of prog.phases) {
      for (const week of phase.weeks) {
        expect(week.days).toHaveLength(2)
      }
    }
  })

  test('weeks are numbered sequentially from 1', () => {
    const prog = buildProgram(template)
    const weekNumbers = prog.phases.flatMap((p) => p.weeks.map((w) => w.weekNumber))
    expect(weekNumbers).toEqual([1, 2, 3])
  })

  test('days within each week are numbered sequentially', () => {
    const prog = buildProgram(template)
    const week1 = prog.phases[0].weeks[0]
    expect(week1.days.map((d) => d.dayNumber)).toEqual([1, 2])
  })

  test('day names come from the template', () => {
    const prog = buildProgram(template)
    const week1 = prog.phases[0].weeks[0]
    expect(week1.days[0].name).toBe('Day 1 - Upper')
    expect(week1.days[1].name).toBe('Day 2 - Lower')
  })

  test('wod blocks have correct type and scoring', () => {
    const prog = buildProgram(template)
    const day1 = prog.phases[0].weeks[0].days[0]
    const wodBlock = day1.blocks[0]
    expect(wodBlock.type).toBe('wod')
    expect(wodBlock.scoring?.type).toBe('forTime')
    expect(wodBlock.scoring?.duration).toBe(10)
  })

  test('movements are parsed from movementLines', () => {
    const prog = buildProgram(template)
    const day1 = prog.phases[0].weeks[0].days[0]
    const movements = day1.blocks[0].movements
    expect(movements).toHaveLength(2)
    expect(movements[0].name).toBe('Thrusters')
    expect(movements[0].reps).toBe(21)
    expect(movements[0].weight).toBe('95/65')
    expect(movements[1].name).toBe('Pull-ups')
  })

  test('program metadata matches template', () => {
    const prog = buildProgram(template)
    expect(prog.name).toBe('Test Program')
    expect(prog.description).toBe('A test')
    expect(prog.author).toBe('Custom')
    expect(prog.version).toBe('1.0.0')
  })

  test('single phase spans all weeks', () => {
    const prog = buildProgram(template)
    expect(prog.phases).toHaveLength(1)
    expect(prog.phases[0].weekStart).toBe(1)
    expect(prog.phases[0].weekEnd).toBe(3)
  })

  test('empty movementLines produce no movements', () => {
    const simple: ProgramTemplate = {
      name: 'Empty',
      description: '',
      weeks: 1,
      daysPerWeek: [
        {
          name: 'Rest Day',
          wodType: 'rounds',
          wodName: 'Active Recovery',
          movementLines: [],
        },
      ],
    }
    const prog = buildProgram(simple)
    expect(prog.phases[0].weeks[0].days[0].blocks[0].movements).toHaveLength(0)
  })

  test('blank movementLines are filtered out', () => {
    const withBlanks: ProgramTemplate = {
      name: 'Blanks',
      description: '',
      weeks: 1,
      daysPerWeek: [
        {
          name: 'Day 1',
          wodType: 'forTime',
          wodName: 'Test',
          movementLines: ['10 Squats', '', '  ', '15 Push-ups'],
        },
      ],
    }
    const prog = buildProgram(withBlanks)
    expect(prog.phases[0].weeks[0].days[0].blocks[0].movements).toHaveLength(2)
  })

  test('generates a unique program id', () => {
    const p1 = buildProgram(template)
    const p2 = buildProgram(template)
    expect(p1.id).not.toBe(p2.id)
  })
})
