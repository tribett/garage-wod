import { describe, test, expect } from 'vitest'
import { programToTemplate } from '../program-editor'
import type { Program } from '@/types/program'

function makeProgram(overrides?: Partial<Program>): Program {
  return {
    id: 'test-program',
    name: 'Test Program',
    author: 'Test',
    description: 'A test program',
    version: '1.0',
    phases: [
      {
        name: 'Phase 1',
        description: 'First phase',
        weekStart: 1,
        weekEnd: 2,
        weeks: [
          {
            weekNumber: 1,
            days: [
              {
                dayNumber: 1,
                name: 'Monday',
                blocks: [
                  {
                    type: 'wod',
                    name: 'Main WOD',
                    movements: [
                      { id: '1', name: 'Thruster', sets: 3, reps: 10, weight: '95/65' },
                      { id: '2', name: 'Pull-ups', reps: 15 },
                    ],
                    scoring: { type: 'forTime', duration: 600000 },
                  },
                ],
              },
              {
                dayNumber: 2,
                name: 'Wednesday',
                blocks: [
                  {
                    type: 'wod',
                    name: 'Conditioning',
                    movements: [
                      { id: '3', name: 'Row', distance: '500m' },
                    ],
                    scoring: { type: 'amrap', duration: 1200000 },
                  },
                ],
              },
            ],
          },
          {
            weekNumber: 2,
            days: [
              {
                dayNumber: 1,
                name: 'Monday',
                blocks: [
                  {
                    type: 'wod',
                    name: 'Strength',
                    movements: [
                      { id: '4', name: 'Back Squat', sets: 5, reps: 5, weight: '225' },
                    ],
                    scoring: { type: 'rounds', rounds: 5 },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('programToTemplate', () => {
  test('extracts name and description', () => {
    const template = programToTemplate(makeProgram())
    expect(template.name).toBe('Test Program')
    expect(template.description).toBe('A test program')
  })

  test('calculates total weeks from phases', () => {
    const template = programToTemplate(makeProgram())
    expect(template.weeks).toBe(2) // weekEnd - weekStart + 1
  })

  test('extracts days per week from first week', () => {
    const template = programToTemplate(makeProgram())
    expect(template.daysPerWeek).toBe(2) // Monday + Wednesday
  })

  test('extracts day templates with name and WOD type', () => {
    const template = programToTemplate(makeProgram())
    expect(template.days.length).toBe(2)
    expect(template.days[0].name).toBe('Monday')
    expect(template.days[0].wodType).toBe('forTime')
    expect(template.days[1].name).toBe('Wednesday')
    expect(template.days[1].wodType).toBe('amrap')
  })

  test('formats movements as text lines', () => {
    const template = programToTemplate(makeProgram())
    expect(template.days[0].movements).toContain('3 x 10 Thruster (95/65)')
    expect(template.days[0].movements).toContain('15 Pull-ups')
  })

  test('handles programs with no WOD blocks', () => {
    const program = makeProgram()
    program.phases[0].weeks[0].days[0].blocks[0].type = 'skill'
    program.phases[0].weeks[0].days[0].blocks[0].scoring = undefined
    const template = programToTemplate(program)
    expect(template.days[0].wodType).toBe('forTime') // default
  })

  test('handles empty movements array', () => {
    const program = makeProgram()
    program.phases[0].weeks[0].days[0].blocks[0].movements = []
    const template = programToTemplate(program)
    expect(template.days[0].movements).toBe('')
  })
})
