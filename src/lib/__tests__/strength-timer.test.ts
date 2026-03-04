import {
  createSession,
  completeSet,
  finishRest,
  isSessionComplete,
  getSessionProgress,
} from '../strength-timer'

describe('createSession', () => {
  it('initializes correct number of sets', () => {
    const session = createSession('Back Squat', 5, 90)
    expect(session.sets).toHaveLength(5)
    expect(session.totalSets).toBe(5)
  })

  it('all sets start uncompleted', () => {
    const session = createSession('Bench Press', 3, 60)
    for (const set of session.sets) {
      expect(set.completed).toBe(false)
    }
  })

  it('currentSet starts at 1', () => {
    const session = createSession('Deadlift', 4, 120)
    expect(session.currentSet).toBe(1)
  })

  it('stores movementName and restSeconds', () => {
    const session = createSession('Overhead Press', 3, 90)
    expect(session.movementName).toBe('Overhead Press')
    expect(session.restSeconds).toBe(90)
  })

  it('sets have correct setNumber values', () => {
    const session = createSession('Squat', 4, 60)
    expect(session.sets.map((s) => s.setNumber)).toEqual([1, 2, 3, 4])
  })

  it('isResting starts as false', () => {
    const session = createSession('Clean', 3, 90)
    expect(session.isResting).toBe(false)
  })
})

describe('completeSet', () => {
  it('marks current set as completed', () => {
    const session = createSession('Squat', 3, 90)
    const updated = completeSet(session)
    expect(updated.sets[0].completed).toBe(true)
  })

  it('enters rest when not last set', () => {
    const session = createSession('Squat', 3, 90)
    const updated = completeSet(session)
    expect(updated.isResting).toBe(true)
  })

  it('does NOT enter rest on last set', () => {
    let session = createSession('Squat', 2, 90)
    // Complete set 1
    session = completeSet(session)
    // Move to set 2
    session = finishRest(session)
    // Complete set 2 (last set)
    session = completeSet(session)
    expect(session.isResting).toBe(false)
  })

  it('does not modify other sets', () => {
    const session = createSession('Squat', 3, 90)
    const updated = completeSet(session)
    expect(updated.sets[1].completed).toBe(false)
    expect(updated.sets[2].completed).toBe(false)
  })
})

describe('finishRest', () => {
  it('increments currentSet', () => {
    let session = createSession('Squat', 3, 90)
    session = completeSet(session) // complete set 1, enter rest
    session = finishRest(session)
    expect(session.currentSet).toBe(2)
  })

  it('clears isResting', () => {
    let session = createSession('Squat', 3, 90)
    session = completeSet(session)
    expect(session.isResting).toBe(true)
    session = finishRest(session)
    expect(session.isResting).toBe(false)
  })
})

describe('isSessionComplete', () => {
  it('returns false when sets remaining', () => {
    const session = createSession('Squat', 3, 90)
    expect(isSessionComplete(session)).toBe(false)
  })

  it('returns false when partially completed', () => {
    let session = createSession('Squat', 3, 90)
    session = completeSet(session)
    expect(isSessionComplete(session)).toBe(false)
  })

  it('returns true when all sets done', () => {
    let session = createSession('Squat', 2, 90)
    session = completeSet(session)
    session = finishRest(session)
    session = completeSet(session)
    expect(isSessionComplete(session)).toBe(true)
  })
})

describe('getSessionProgress', () => {
  it('returns zero for fresh session', () => {
    const session = createSession('Squat', 4, 90)
    const progress = getSessionProgress(session)
    expect(progress.completedSets).toBe(0)
    expect(progress.percentage).toBe(0)
  })

  it('returns correct count and percentage after partial completion', () => {
    let session = createSession('Squat', 4, 90)
    session = completeSet(session)
    const progress = getSessionProgress(session)
    expect(progress.completedSets).toBe(1)
    expect(progress.percentage).toBe(25)
  })

  it('returns 100% when all complete', () => {
    let session = createSession('Squat', 2, 60)
    session = completeSet(session)
    session = finishRest(session)
    session = completeSet(session)
    const progress = getSessionProgress(session)
    expect(progress.completedSets).toBe(2)
    expect(progress.percentage).toBe(100)
  })
})

describe('full workflow', () => {
  it('create -> complete -> rest -> complete -> ... -> done', () => {
    let session = createSession('Back Squat', 3, 90)

    // Initial state
    expect(session.currentSet).toBe(1)
    expect(session.isResting).toBe(false)
    expect(isSessionComplete(session)).toBe(false)

    // Complete set 1
    session = completeSet(session)
    expect(session.sets[0].completed).toBe(true)
    expect(session.isResting).toBe(true)
    expect(session.currentSet).toBe(1) // still on set 1 until rest finishes

    // Finish rest after set 1
    session = finishRest(session)
    expect(session.currentSet).toBe(2)
    expect(session.isResting).toBe(false)

    // Complete set 2
    session = completeSet(session)
    expect(session.sets[1].completed).toBe(true)
    expect(session.isResting).toBe(true)

    // Finish rest after set 2
    session = finishRest(session)
    expect(session.currentSet).toBe(3)
    expect(session.isResting).toBe(false)

    // Complete set 3 (last set)
    session = completeSet(session)
    expect(session.sets[2].completed).toBe(true)
    expect(session.isResting).toBe(false) // no rest after final set

    // Session should be complete
    expect(isSessionComplete(session)).toBe(true)
    const progress = getSessionProgress(session)
    expect(progress.completedSets).toBe(3)
    expect(progress.percentage).toBe(100)
  })
})
