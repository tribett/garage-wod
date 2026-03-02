import type { Program } from '@/types/program'

export const returnToCrossfitProgram: Program = {
  id: 'return-to-crossfit',
  name: 'Return to CrossFit',
  author: 'GRGWOD',
  description:
    'A 12-week program designed to safely rebuild your CrossFit fitness from scratch. Starts with simple movement patterns and light loads, progresses through engine-building conditioning, and finishes with benchmark-style workouts.',
  version: '1.0.0',
  phases: [
    // =========================================================================
    // PHASE 1: "Just Move Again" (Weeks 1-4)
    // =========================================================================
    {
      name: 'Just Move Again',
      description:
        'Rebuild movement patterns and base conditioning with light loads, moderate reps, and built-in rest. Focus on consistency over intensity.',
      weekStart: 1,
      weekEnd: 4,
      weeks: [
        // ----- WEEK 1 -----
        {
          weekNumber: 1,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w1d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w1d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w1d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w1d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w1d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Goblet Squats',
                  description: 'Focus on depth and upright torso. Use a light kettlebell.',
                  movements: [
                    { id: 'w1d1-skill-goblet', name: 'Goblet Squats', sets: 4, reps: 10, weight: 'Light KB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Thruster / Push-up / Step-up',
                  description: 'Rest 90 seconds between rounds. Move at a steady pace.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w1d1-wod-thruster', name: 'DB Thrusters', reps: 10, weight: 'Light DB' },
                    { id: 'w1d1-wod-pushup', name: 'Push-ups', reps: 10 },
                    { id: 'w1d1-wod-stepup', name: 'Box Step-ups', reps: 10, notes: 'Use bench', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w1d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w1d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w1d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w1d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w1d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w1d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w1d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w1d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w1d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'KB Swings',
                  description: 'Russian-style swings to eye level. Hinge at the hips.',
                  movements: [
                    { id: 'w1d2-skill-kbswing', name: 'KB Swings', sets: 4, reps: 10 },
                  ],
                },
                {
                  type: 'wod',
                  name: '4 Rounds – Row / Swing / Squat',
                  description: 'Rest 60 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 4 },
                  movements: [
                    { id: 'w1d2-wod-row', name: 'Row', distance: '200m' },
                    { id: 'w1d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w1d2-wod-goblet', name: 'Goblet Squats', reps: 10, rest: 60 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w1d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w1d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w1d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w1d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w1d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w1d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w1d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w1d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w1d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'DB Hang Power Clean',
                  description: 'Start from above the knee. Focus on hip drive and fast elbows.',
                  movements: [
                    { id: 'w1d3-skill-hpc', name: 'DB Hang Power Clean', sets: 3, reps: 8, weight: 'Light DB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Deadlift / Clean / Jump Rope',
                  description: 'Rest 90 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w1d3-wod-dl', name: 'DB Deadlifts', reps: 10, weight: 'Light DB' },
                    { id: 'w1d3-wod-hpc', name: 'DB Hang Power Cleans', reps: 10, weight: 'Light DB' },
                    { id: 'w1d3-wod-su', name: 'Single-unders', reps: 50, notes: 'Jump rope', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w1d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w1d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w1d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w1d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 2 -----
        {
          weekNumber: 2,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w2d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w2d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w2d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w2d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w2d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Goblet Squats',
                  description: 'Focus on depth and upright torso. Use a light kettlebell.',
                  movements: [
                    { id: 'w2d1-skill-goblet', name: 'Goblet Squats', sets: 4, reps: 10, weight: 'Light KB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Thruster / Push-up / Step-up',
                  description: 'Rest 90 seconds between rounds. Move at a steady pace.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w2d1-wod-thruster', name: 'DB Thrusters', reps: 10, weight: 'Light DB' },
                    { id: 'w2d1-wod-pushup', name: 'Push-ups', reps: 10 },
                    { id: 'w2d1-wod-stepup', name: 'Box Step-ups', reps: 10, notes: 'Use bench', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w2d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w2d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w2d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w2d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w2d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w2d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w2d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w2d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w2d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'KB Swings',
                  description: 'Russian-style swings to eye level. Hinge at the hips.',
                  movements: [
                    { id: 'w2d2-skill-kbswing', name: 'KB Swings', sets: 4, reps: 10 },
                  ],
                },
                {
                  type: 'wod',
                  name: '4 Rounds – Row / Swing / Squat',
                  description: 'Rest 60 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 4 },
                  movements: [
                    { id: 'w2d2-wod-row', name: 'Row', distance: '200m' },
                    { id: 'w2d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w2d2-wod-goblet', name: 'Goblet Squats', reps: 10, rest: 60 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w2d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w2d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w2d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w2d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w2d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w2d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w2d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w2d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w2d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'DB Hang Power Clean',
                  description: 'Start from above the knee. Focus on hip drive and fast elbows.',
                  movements: [
                    { id: 'w2d3-skill-hpc', name: 'DB Hang Power Clean', sets: 3, reps: 8, weight: 'Light DB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Deadlift / Clean / Jump Rope',
                  description: 'Rest 90 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w2d3-wod-dl', name: 'DB Deadlifts', reps: 10, weight: 'Light DB' },
                    { id: 'w2d3-wod-hpc', name: 'DB Hang Power Cleans', reps: 10, weight: 'Light DB' },
                    { id: 'w2d3-wod-su', name: 'Single-unders', reps: 50, notes: 'Jump rope', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w2d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w2d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w2d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w2d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 3 -----
        {
          weekNumber: 3,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w3d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w3d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w3d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w3d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w3d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Goblet Squats',
                  description: 'Focus on depth and upright torso. Use a light kettlebell.',
                  movements: [
                    { id: 'w3d1-skill-goblet', name: 'Goblet Squats', sets: 4, reps: 10, weight: 'Light KB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Thruster / Push-up / Step-up',
                  description: 'Rest 90 seconds between rounds. Move at a steady pace.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w3d1-wod-thruster', name: 'DB Thrusters', reps: 10, weight: 'Light DB' },
                    { id: 'w3d1-wod-pushup', name: 'Push-ups', reps: 10 },
                    { id: 'w3d1-wod-stepup', name: 'Box Step-ups', reps: 10, notes: 'Use bench', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w3d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w3d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w3d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w3d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w3d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w3d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w3d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w3d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w3d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'KB Swings',
                  description: 'Russian-style swings to eye level. Hinge at the hips.',
                  movements: [
                    { id: 'w3d2-skill-kbswing', name: 'KB Swings', sets: 4, reps: 10 },
                  ],
                },
                {
                  type: 'wod',
                  name: '4 Rounds – Row / Swing / Squat',
                  description: 'Rest 60 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 4 },
                  movements: [
                    { id: 'w3d2-wod-row', name: 'Row', distance: '200m' },
                    { id: 'w3d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w3d2-wod-goblet', name: 'Goblet Squats', reps: 10, rest: 60 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w3d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w3d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w3d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w3d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w3d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w3d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w3d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w3d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w3d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'DB Hang Power Clean',
                  description: 'Start from above the knee. Focus on hip drive and fast elbows.',
                  movements: [
                    { id: 'w3d3-skill-hpc', name: 'DB Hang Power Clean', sets: 3, reps: 8, weight: 'Light DB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Deadlift / Clean / Jump Rope',
                  description: 'Rest 90 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w3d3-wod-dl', name: 'DB Deadlifts', reps: 10, weight: 'Light DB' },
                    { id: 'w3d3-wod-hpc', name: 'DB Hang Power Cleans', reps: 10, weight: 'Light DB' },
                    { id: 'w3d3-wod-su', name: 'Single-unders', reps: 50, notes: 'Jump rope', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w3d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w3d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w3d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w3d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 4 -----
        {
          weekNumber: 4,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w4d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w4d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w4d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w4d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w4d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Goblet Squats',
                  description: 'Focus on depth and upright torso. Use a light kettlebell.',
                  movements: [
                    { id: 'w4d1-skill-goblet', name: 'Goblet Squats', sets: 4, reps: 10, weight: 'Light KB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Thruster / Push-up / Step-up',
                  description: 'Rest 90 seconds between rounds. Move at a steady pace.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w4d1-wod-thruster', name: 'DB Thrusters', reps: 10, weight: 'Light DB' },
                    { id: 'w4d1-wod-pushup', name: 'Push-ups', reps: 10 },
                    { id: 'w4d1-wod-stepup', name: 'Box Step-ups', reps: 10, notes: 'Use bench', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w4d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w4d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w4d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w4d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w4d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w4d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w4d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w4d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w4d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'KB Swings',
                  description: 'Russian-style swings to eye level. Hinge at the hips.',
                  movements: [
                    { id: 'w4d2-skill-kbswing', name: 'KB Swings', sets: 4, reps: 10 },
                  ],
                },
                {
                  type: 'wod',
                  name: '4 Rounds – Row / Swing / Squat',
                  description: 'Rest 60 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 4 },
                  movements: [
                    { id: 'w4d2-wod-row', name: 'Row', distance: '200m' },
                    { id: 'w4d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w4d2-wod-goblet', name: 'Goblet Squats', reps: 10, rest: 60 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w4d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w4d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w4d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w4d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w4d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w4d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w4d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w4d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w4d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'DB Hang Power Clean',
                  description: 'Start from above the knee. Focus on hip drive and fast elbows.',
                  movements: [
                    { id: 'w4d3-skill-hpc', name: 'DB Hang Power Clean', sets: 3, reps: 8, weight: 'Light DB' },
                  ],
                },
                {
                  type: 'wod',
                  name: '3 Rounds – Deadlift / Clean / Jump Rope',
                  description: 'Rest 90 seconds between rounds.',
                  scoring: { type: 'rounds', rounds: 3 },
                  movements: [
                    { id: 'w4d3-wod-dl', name: 'DB Deadlifts', reps: 10, weight: 'Light DB' },
                    { id: 'w4d3-wod-hpc', name: 'DB Hang Power Cleans', reps: 10, weight: 'Light DB' },
                    { id: 'w4d3-wod-su', name: 'Single-unders', reps: 50, notes: 'Jump rope', rest: 90 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w4d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w4d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w4d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w4d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    // =========================================================================
    // PHASE 2: "Building the Engine" (Weeks 5-8)
    // =========================================================================
    {
      name: 'Building the Engine',
      description:
        'Introducing AMRAPs and EMOMs with more conditioning pressure. Barbell movements on the rack appear in skill work. Intensity increases while maintaining smart recovery.',
      weekStart: 5,
      weekEnd: 8,
      weeks: [
        // ----- WEEK 5 -----
        {
          weekNumber: 5,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w5d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w5d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w5d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w5d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w5d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Back Squat',
                  description: 'Use the rack. Moderate weight — focus on depth and bracing.',
                  movements: [
                    { id: 'w5d1-skill-bsq', name: 'Back Squat', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 10 – Thruster / Burpee / Ring Row',
                  description: 'As many rounds as possible in 10 minutes. Keep moving!',
                  scoring: { type: 'amrap', duration: 600 },
                  movements: [
                    { id: 'w5d1-wod-thruster', name: 'DB Thrusters', reps: 10 },
                    { id: 'w5d1-wod-burpee', name: 'Burpees', reps: 10 },
                    { id: 'w5d1-wod-ringrow', name: 'Ring Rows', reps: 10, notes: 'Or banded pull-ups on rack' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w5d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w5d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w5d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w5d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w5d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w5d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w5d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w5d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w5d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Bench Press',
                  description: 'Use the rack. Moderate weight — control the eccentric.',
                  movements: [
                    { id: 'w5d2-skill-bench', name: 'Bench Press', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'EMOM 12 – Swing / Push-up / Row',
                  description: 'Every minute on the minute for 12 minutes. Rotate through 3 stations (4 full rounds).',
                  scoring: { type: 'emom', duration: 720, interval: 60, rounds: 4 },
                  movements: [
                    { id: 'w5d2-wod-kbswing', name: 'KB Swings', reps: 12, notes: 'Minute 1' },
                    { id: 'w5d2-wod-pushup', name: 'Push-ups', reps: 10, notes: 'Minute 2' },
                    { id: 'w5d2-wod-row', name: 'Row', distance: '200m', notes: 'Minute 3' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w5d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w5d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w5d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w5d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w5d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w5d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w5d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w5d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w5d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Barbell Deadlift',
                  description: 'Use the rack or floor. Moderate weight — flat back, drive through heels.',
                  movements: [
                    { id: 'w5d3-skill-dl', name: 'Barbell Deadlift', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 8 – Row / Swing / Squat',
                  description: 'As many rounds as possible in 8 minutes.',
                  scoring: { type: 'amrap', duration: 480 },
                  movements: [
                    { id: 'w5d3-wod-row', name: 'Row', distance: '250m' },
                    { id: 'w5d3-wod-kbswing', name: 'KB Swings', reps: 12 },
                    { id: 'w5d3-wod-airsquat', name: 'Air Squats', reps: 10 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w5d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w5d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w5d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w5d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 6 -----
        {
          weekNumber: 6,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w6d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w6d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w6d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w6d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w6d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Back Squat',
                  description: 'Use the rack. Moderate weight — focus on depth and bracing.',
                  movements: [
                    { id: 'w6d1-skill-bsq', name: 'Back Squat', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 10 – Thruster / Burpee / Ring Row',
                  description: 'As many rounds as possible in 10 minutes. Keep moving!',
                  scoring: { type: 'amrap', duration: 600 },
                  movements: [
                    { id: 'w6d1-wod-thruster', name: 'DB Thrusters', reps: 10 },
                    { id: 'w6d1-wod-burpee', name: 'Burpees', reps: 10 },
                    { id: 'w6d1-wod-ringrow', name: 'Ring Rows', reps: 10, notes: 'Or banded pull-ups on rack' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w6d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w6d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w6d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w6d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w6d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w6d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w6d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w6d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w6d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Bench Press',
                  description: 'Use the rack. Moderate weight — control the eccentric.',
                  movements: [
                    { id: 'w6d2-skill-bench', name: 'Bench Press', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'EMOM 12 – Swing / Push-up / Row',
                  description: 'Every minute on the minute for 12 minutes. Rotate through 3 stations (4 full rounds).',
                  scoring: { type: 'emom', duration: 720, interval: 60, rounds: 4 },
                  movements: [
                    { id: 'w6d2-wod-kbswing', name: 'KB Swings', reps: 12, notes: 'Minute 1' },
                    { id: 'w6d2-wod-pushup', name: 'Push-ups', reps: 10, notes: 'Minute 2' },
                    { id: 'w6d2-wod-row', name: 'Row', distance: '200m', notes: 'Minute 3' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w6d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w6d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w6d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w6d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w6d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w6d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w6d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w6d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w6d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Barbell Deadlift',
                  description: 'Use the rack or floor. Moderate weight — flat back, drive through heels.',
                  movements: [
                    { id: 'w6d3-skill-dl', name: 'Barbell Deadlift', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 8 – Row / Swing / Squat',
                  description: 'As many rounds as possible in 8 minutes.',
                  scoring: { type: 'amrap', duration: 480 },
                  movements: [
                    { id: 'w6d3-wod-row', name: 'Row', distance: '250m' },
                    { id: 'w6d3-wod-kbswing', name: 'KB Swings', reps: 12 },
                    { id: 'w6d3-wod-airsquat', name: 'Air Squats', reps: 10 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w6d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w6d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w6d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w6d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 7 -----
        {
          weekNumber: 7,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w7d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w7d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w7d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w7d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w7d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Back Squat',
                  description: 'Use the rack. Moderate weight — focus on depth and bracing.',
                  movements: [
                    { id: 'w7d1-skill-bsq', name: 'Back Squat', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 10 – Thruster / Burpee / Ring Row',
                  description: 'As many rounds as possible in 10 minutes. Keep moving!',
                  scoring: { type: 'amrap', duration: 600 },
                  movements: [
                    { id: 'w7d1-wod-thruster', name: 'DB Thrusters', reps: 10 },
                    { id: 'w7d1-wod-burpee', name: 'Burpees', reps: 10 },
                    { id: 'w7d1-wod-ringrow', name: 'Ring Rows', reps: 10, notes: 'Or banded pull-ups on rack' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w7d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w7d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w7d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w7d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w7d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w7d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w7d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w7d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w7d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Bench Press',
                  description: 'Use the rack. Moderate weight — control the eccentric.',
                  movements: [
                    { id: 'w7d2-skill-bench', name: 'Bench Press', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'EMOM 12 – Swing / Push-up / Row',
                  description: 'Every minute on the minute for 12 minutes. Rotate through 3 stations (4 full rounds).',
                  scoring: { type: 'emom', duration: 720, interval: 60, rounds: 4 },
                  movements: [
                    { id: 'w7d2-wod-kbswing', name: 'KB Swings', reps: 12, notes: 'Minute 1' },
                    { id: 'w7d2-wod-pushup', name: 'Push-ups', reps: 10, notes: 'Minute 2' },
                    { id: 'w7d2-wod-row', name: 'Row', distance: '200m', notes: 'Minute 3' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w7d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w7d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w7d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w7d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w7d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w7d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w7d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w7d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w7d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Barbell Deadlift',
                  description: 'Use the rack or floor. Moderate weight — flat back, drive through heels.',
                  movements: [
                    { id: 'w7d3-skill-dl', name: 'Barbell Deadlift', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 8 – Row / Swing / Squat',
                  description: 'As many rounds as possible in 8 minutes.',
                  scoring: { type: 'amrap', duration: 480 },
                  movements: [
                    { id: 'w7d3-wod-row', name: 'Row', distance: '250m' },
                    { id: 'w7d3-wod-kbswing', name: 'KB Swings', reps: 12 },
                    { id: 'w7d3-wod-airsquat', name: 'Air Squats', reps: 10 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w7d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w7d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w7d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w7d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 8 -----
        {
          weekNumber: 8,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w8d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w8d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w8d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w8d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w8d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Back Squat',
                  description: 'Use the rack. Moderate weight — focus on depth and bracing.',
                  movements: [
                    { id: 'w8d1-skill-bsq', name: 'Back Squat', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 10 – Thruster / Burpee / Ring Row',
                  description: 'As many rounds as possible in 10 minutes. Keep moving!',
                  scoring: { type: 'amrap', duration: 600 },
                  movements: [
                    { id: 'w8d1-wod-thruster', name: 'DB Thrusters', reps: 10 },
                    { id: 'w8d1-wod-burpee', name: 'Burpees', reps: 10 },
                    { id: 'w8d1-wod-ringrow', name: 'Ring Rows', reps: 10, notes: 'Or banded pull-ups on rack' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w8d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w8d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w8d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w8d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w8d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w8d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w8d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w8d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w8d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Bench Press',
                  description: 'Use the rack. Moderate weight — control the eccentric.',
                  movements: [
                    { id: 'w8d2-skill-bench', name: 'Bench Press', sets: 4, reps: 8, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'EMOM 12 – Swing / Push-up / Row',
                  description: 'Every minute on the minute for 12 minutes. Rotate through 3 stations (4 full rounds).',
                  scoring: { type: 'emom', duration: 720, interval: 60, rounds: 4 },
                  movements: [
                    { id: 'w8d2-wod-kbswing', name: 'KB Swings', reps: 12, notes: 'Minute 1' },
                    { id: 'w8d2-wod-pushup', name: 'Push-ups', reps: 10, notes: 'Minute 2' },
                    { id: 'w8d2-wod-row', name: 'Row', distance: '200m', notes: 'Minute 3' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w8d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w8d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w8d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w8d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w8d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w8d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w8d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w8d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w8d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Barbell Deadlift',
                  description: 'Use the rack or floor. Moderate weight — flat back, drive through heels.',
                  movements: [
                    { id: 'w8d3-skill-dl', name: 'Barbell Deadlift', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'AMRAP 8 – Row / Swing / Squat',
                  description: 'As many rounds as possible in 8 minutes.',
                  scoring: { type: 'amrap', duration: 480 },
                  movements: [
                    { id: 'w8d3-wod-row', name: 'Row', distance: '250m' },
                    { id: 'w8d3-wod-kbswing', name: 'KB Swings', reps: 12 },
                    { id: 'w8d3-wod-airsquat', name: 'Air Squats', reps: 10 },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w8d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w8d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w8d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w8d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    // =========================================================================
    // PHASE 3: "CrossFit Is Back" (Weeks 9-12)
    // =========================================================================
    {
      name: 'CrossFit Is Back',
      description:
        'Benchmark-style workouts with shorter rest, heavier effort, and more variety. For-time pieces and Tabata intervals push your rediscovered engine.',
      weekStart: 9,
      weekEnd: 12,
      weeks: [
        // ----- WEEK 9 -----
        {
          weekNumber: 9,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w9d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w9d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w9d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w9d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w9d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Front Squat',
                  description: 'Use the rack. Focus on elbows up and core braced.',
                  movements: [
                    { id: 'w9d1-skill-fsq', name: 'Front Squat', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'For Time – 21-15-9 Thrusters & Burpees',
                  description: '12 minute time cap. Go hard!',
                  scoring: { type: 'forTime', duration: 720 },
                  movements: [
                    { id: 'w9d1-wod-thruster', name: 'DB Thrusters', reps: '21-15-9' },
                    { id: 'w9d1-wod-burpee', name: 'Burpees', reps: '21-15-9' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w9d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w9d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w9d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w9d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w9d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w9d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w9d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w9d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w9d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Push Press',
                  description: 'Use the rack. Dip-drive-press. Lock out overhead.',
                  movements: [
                    { id: 'w9d2-skill-pp', name: 'Push Press', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: '5 Rounds For Time – Swing / Box Jump / Row',
                  description: '15 minute time cap. Push the pace on the row.',
                  scoring: { type: 'forTime', duration: 900, rounds: 5 },
                  movements: [
                    { id: 'w9d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w9d2-wod-boxjump', name: 'Box Jumps', reps: 10, notes: 'Or step-ups' },
                    { id: 'w9d2-wod-row', name: 'Row', distance: '200m' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w9d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w9d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w9d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w9d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w9d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w9d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w9d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w9d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w9d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Power Clean',
                  description: 'From the floor with barbell. Moderate weight — speed under the bar.',
                  movements: [
                    { id: 'w9d3-skill-pc', name: 'Power Clean', sets: 4, reps: 5, weight: 'Moderate barbell' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'Double Tabata – Squats & Push-ups, then Swings & Sit-ups',
                  description: 'Tabata 1: 8 rounds of 20s work / 10s rest alternating Air Squats and Push-ups. Rest 2 minutes. Tabata 2: 8 rounds alternating KB Swings and Sit-ups.',
                  scoring: { type: 'tabata', rounds: 8, workInterval: 20, restInterval: 10 },
                  movements: [
                    { id: 'w9d3-wod-airsquat', name: 'Air Squats', notes: 'Tabata 1 – odd rounds' },
                    { id: 'w9d3-wod-pushup', name: 'Push-ups', notes: 'Tabata 1 – even rounds' },
                    { id: 'w9d3-wod-rest', name: 'Rest', duration: 120, notes: 'Between Tabatas' },
                    { id: 'w9d3-wod-kbswing', name: 'KB Swings', notes: 'Tabata 2 – odd rounds' },
                    { id: 'w9d3-wod-situp', name: 'Sit-ups', notes: 'Tabata 2 – even rounds' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w9d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w9d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w9d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w9d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 10 -----
        {
          weekNumber: 10,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w10d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w10d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w10d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w10d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w10d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Front Squat',
                  description: 'Use the rack. Focus on elbows up and core braced.',
                  movements: [
                    { id: 'w10d1-skill-fsq', name: 'Front Squat', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'For Time – 21-15-9 Thrusters & Burpees',
                  description: '12 minute time cap. Go hard!',
                  scoring: { type: 'forTime', duration: 720 },
                  movements: [
                    { id: 'w10d1-wod-thruster', name: 'DB Thrusters', reps: '21-15-9' },
                    { id: 'w10d1-wod-burpee', name: 'Burpees', reps: '21-15-9' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w10d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w10d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w10d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w10d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w10d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w10d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w10d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w10d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w10d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Push Press',
                  description: 'Use the rack. Dip-drive-press. Lock out overhead.',
                  movements: [
                    { id: 'w10d2-skill-pp', name: 'Push Press', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: '5 Rounds For Time – Swing / Box Jump / Row',
                  description: '15 minute time cap. Push the pace on the row.',
                  scoring: { type: 'forTime', duration: 900, rounds: 5 },
                  movements: [
                    { id: 'w10d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w10d2-wod-boxjump', name: 'Box Jumps', reps: 10, notes: 'Or step-ups' },
                    { id: 'w10d2-wod-row', name: 'Row', distance: '200m' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w10d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w10d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w10d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w10d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w10d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w10d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w10d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w10d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w10d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Power Clean',
                  description: 'From the floor with barbell. Moderate weight — speed under the bar.',
                  movements: [
                    { id: 'w10d3-skill-pc', name: 'Power Clean', sets: 4, reps: 5, weight: 'Moderate barbell' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'Double Tabata – Squats & Push-ups, then Swings & Sit-ups',
                  description: 'Tabata 1: 8 rounds of 20s work / 10s rest alternating Air Squats and Push-ups. Rest 2 minutes. Tabata 2: 8 rounds alternating KB Swings and Sit-ups.',
                  scoring: { type: 'tabata', rounds: 8, workInterval: 20, restInterval: 10 },
                  movements: [
                    { id: 'w10d3-wod-airsquat', name: 'Air Squats', notes: 'Tabata 1 – odd rounds' },
                    { id: 'w10d3-wod-pushup', name: 'Push-ups', notes: 'Tabata 1 – even rounds' },
                    { id: 'w10d3-wod-rest', name: 'Rest', duration: 120, notes: 'Between Tabatas' },
                    { id: 'w10d3-wod-kbswing', name: 'KB Swings', notes: 'Tabata 2 – odd rounds' },
                    { id: 'w10d3-wod-situp', name: 'Sit-ups', notes: 'Tabata 2 – even rounds' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w10d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w10d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w10d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w10d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 11 -----
        {
          weekNumber: 11,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w11d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w11d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w11d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w11d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w11d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Front Squat',
                  description: 'Use the rack. Focus on elbows up and core braced.',
                  movements: [
                    { id: 'w11d1-skill-fsq', name: 'Front Squat', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'For Time – 21-15-9 Thrusters & Burpees',
                  description: '12 minute time cap. Go hard!',
                  scoring: { type: 'forTime', duration: 720 },
                  movements: [
                    { id: 'w11d1-wod-thruster', name: 'DB Thrusters', reps: '21-15-9' },
                    { id: 'w11d1-wod-burpee', name: 'Burpees', reps: '21-15-9' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w11d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w11d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w11d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w11d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w11d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w11d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w11d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w11d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w11d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Push Press',
                  description: 'Use the rack. Dip-drive-press. Lock out overhead.',
                  movements: [
                    { id: 'w11d2-skill-pp', name: 'Push Press', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: '5 Rounds For Time – Swing / Box Jump / Row',
                  description: '15 minute time cap. Push the pace on the row.',
                  scoring: { type: 'forTime', duration: 900, rounds: 5 },
                  movements: [
                    { id: 'w11d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w11d2-wod-boxjump', name: 'Box Jumps', reps: 10, notes: 'Or step-ups' },
                    { id: 'w11d2-wod-row', name: 'Row', distance: '200m' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w11d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w11d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w11d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w11d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w11d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w11d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w11d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w11d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w11d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Power Clean',
                  description: 'From the floor with barbell. Moderate weight — speed under the bar.',
                  movements: [
                    { id: 'w11d3-skill-pc', name: 'Power Clean', sets: 4, reps: 5, weight: 'Moderate barbell' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'Double Tabata – Squats & Push-ups, then Swings & Sit-ups',
                  description: 'Tabata 1: 8 rounds of 20s work / 10s rest alternating Air Squats and Push-ups. Rest 2 minutes. Tabata 2: 8 rounds alternating KB Swings and Sit-ups.',
                  scoring: { type: 'tabata', rounds: 8, workInterval: 20, restInterval: 10 },
                  movements: [
                    { id: 'w11d3-wod-airsquat', name: 'Air Squats', notes: 'Tabata 1 – odd rounds' },
                    { id: 'w11d3-wod-pushup', name: 'Push-ups', notes: 'Tabata 1 – even rounds' },
                    { id: 'w11d3-wod-rest', name: 'Rest', duration: 120, notes: 'Between Tabatas' },
                    { id: 'w11d3-wod-kbswing', name: 'KB Swings', notes: 'Tabata 2 – odd rounds' },
                    { id: 'w11d3-wod-situp', name: 'Sit-ups', notes: 'Tabata 2 – even rounds' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w11d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w11d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w11d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w11d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
        // ----- WEEK 12 -----
        {
          weekNumber: 12,
          days: [
            {
              dayNumber: 1,
              name: 'Monday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w12d1-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w12d1-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w12d1-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w12d1-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w12d1-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Front Squat',
                  description: 'Use the rack. Focus on elbows up and core braced.',
                  movements: [
                    { id: 'w12d1-skill-fsq', name: 'Front Squat', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'For Time – 21-15-9 Thrusters & Burpees',
                  description: '12 minute time cap. Go hard!',
                  scoring: { type: 'forTime', duration: 720 },
                  movements: [
                    { id: 'w12d1-wod-thruster', name: 'DB Thrusters', reps: '21-15-9' },
                    { id: 'w12d1-wod-burpee', name: 'Burpees', reps: '21-15-9' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w12d1-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w12d1-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w12d1-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w12d1-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 2,
              name: 'Wednesday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w12d2-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w12d2-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w12d2-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w12d2-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w12d2-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Push Press',
                  description: 'Use the rack. Dip-drive-press. Lock out overhead.',
                  movements: [
                    { id: 'w12d2-skill-pp', name: 'Push Press', sets: 4, reps: 6, weight: 'Moderate' },
                  ],
                },
                {
                  type: 'wod',
                  name: '5 Rounds For Time – Swing / Box Jump / Row',
                  description: '15 minute time cap. Push the pace on the row.',
                  scoring: { type: 'forTime', duration: 900, rounds: 5 },
                  movements: [
                    { id: 'w12d2-wod-kbswing', name: 'KB Swings', reps: 10 },
                    { id: 'w12d2-wod-boxjump', name: 'Box Jumps', reps: 10, notes: 'Or step-ups' },
                    { id: 'w12d2-wod-row', name: 'Row', distance: '200m' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w12d2-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w12d2-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w12d2-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w12d2-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
            {
              dayNumber: 3,
              name: 'Friday',
              blocks: [
                {
                  type: 'warmup',
                  name: 'Row & Mobility',
                  movements: [
                    { id: 'w12d3-warmup-row', name: 'Row', distance: '500m', notes: 'Easy pace' },
                    { id: 'w12d3-warmup-hipcirc', name: 'Hip Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w12d3-warmup-armcirc', name: 'Arm Circles', reps: 10, notes: 'Each direction' },
                    { id: 'w12d3-warmup-airsquat', name: 'Air Squats', reps: 10 },
                    { id: 'w12d3-warmup-inchworm', name: 'Inchworms', reps: 5 },
                  ],
                },
                {
                  type: 'skill',
                  name: 'Power Clean',
                  description: 'From the floor with barbell. Moderate weight — speed under the bar.',
                  movements: [
                    { id: 'w12d3-skill-pc', name: 'Power Clean', sets: 4, reps: 5, weight: 'Moderate barbell' },
                  ],
                },
                {
                  type: 'wod',
                  name: 'Double Tabata – Squats & Push-ups, then Swings & Sit-ups',
                  description: 'Tabata 1: 8 rounds of 20s work / 10s rest alternating Air Squats and Push-ups. Rest 2 minutes. Tabata 2: 8 rounds alternating KB Swings and Sit-ups.',
                  scoring: { type: 'tabata', rounds: 8, workInterval: 20, restInterval: 10 },
                  movements: [
                    { id: 'w12d3-wod-airsquat', name: 'Air Squats', notes: 'Tabata 1 – odd rounds' },
                    { id: 'w12d3-wod-pushup', name: 'Push-ups', notes: 'Tabata 1 – even rounds' },
                    { id: 'w12d3-wod-rest', name: 'Rest', duration: 120, notes: 'Between Tabatas' },
                    { id: 'w12d3-wod-kbswing', name: 'KB Swings', notes: 'Tabata 2 – odd rounds' },
                    { id: 'w12d3-wod-situp', name: 'Sit-ups', notes: 'Tabata 2 – even rounds' },
                  ],
                },
                {
                  type: 'cooldown',
                  name: 'Walk & Stretch',
                  movements: [
                    { id: 'w12d3-cool-walk', name: 'Easy Walk or Row', duration: 120 },
                    { id: 'w12d3-cool-hipflex', name: 'Hip Flexor Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w12d3-cool-chest', name: 'Chest Doorway Stretch', duration: 30, notes: 'Each side' },
                    { id: 'w12d3-cool-child', name: "Child's Pose", duration: 30 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
