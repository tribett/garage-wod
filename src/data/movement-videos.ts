/**
 * Maps common CrossFit movement names to YouTube video IDs.
 *
 * Primary source: official CrossFit YouTube channel (@crossfit).
 * https://www.youtube.com/@crossfit
 *
 * Where no official CrossFit video exists for a movement, videos are
 * sourced from other trusted fitness channels (noted inline).
 */
export const MOVEMENT_VIDEOS: Record<string, string> = {
  // ── Squats ──────────────────────────────────────────────
  'Air Squat': 'rMvwVtlqjTE',
  'Front Squat': 'uYumuL_G_V0',
  'Overhead Squat': 'pn8mqlG0nkE',
  'Back Squat': 'QmZAiBqPvZw',
  'Goblet Squat': 'PKmrXTLmmJA', // CrossFit — The Goblet Squat

  // ── Presses ──────────────────────────────────────────────
  'Shoulder Press': '5yWaNOvgFCM',
  'Push Press': 'iaBVSJm78ko',
  'Push Jerk': 'VrHNJXoSyXw',
  'Split Jerk': 'GUDkOtraHHY',
  'Bench Press': 'SCVCLChPQFY',
  'Handstand Push-up': '0wDEO6shVjc',

  // ── Deadlifts & Pulls ─────────────────────────────────────
  'Deadlift': '1ZXobu7JvvE',
  'Sumo Deadlift High Pull': 'gh55vVlwlQg',
  'Clean': 'Ty14ogq_Vok',
  'Power Clean': 'KwYJTpQ_x5A',
  'Hang Clean': 'DaKC_BEN5bk',
  'Clean and Jerk': 'PjY1rH4_MOA',
  'Snatch': 'GhxhiehJcQY',
  'Power Snatch': 'TL8SMp7RdXQ',
  'Hang Snatch': 'IucshEToDyM',

  // ── Gymnastics ──────────────────────────────────────────
  'Pull-up': 'HRV5YKKaeVw',
  'Chest-to-Bar Pull-up': 'xf69XHAs5w8',
  'Muscle-up': 'vJTJFc2wmk4',
  'Bar Muscle-up': 'o69WaY_7k2c',
  'Ring Dip': 'EznLCDBAPIU',
  'Ring Row': 'sEAOZc77wk8', // CrossFit — The Ring Row
  'Toes-to-Bar': '6dHvTlsMvNY',
  'Knees-to-Elbow': '_DUlB4YpZRw',
  'Rope Climb': 'zBoTgBpkn7o',
  'Handstand Walk': 'FdgJ9jZIT-Q',
  'Wall Walk': 'NK_OcHEm8yM', // CrossFit — The Wall Walk
  'Pistol': 'keSzg7MaoVQ',
  'L-sit': '_HbccxgnCg0',

  // ── Common CrossFit Movements ──────────────────────────
  'Thruster': 'L219ltL15zk',
  'Wall Ball': 'EqjGKsiIMCE',
  'Kettlebell Swing': 'mKDIuUbH94Q',
  'Box Jump': 'NBY9-kTuHEk',
  'Box Step-up': '5qjqDHOUh-A', // CrossFit — The Box Step-Up
  'Burpee': 'auBLPXO8Fww',
  'Push-up': '0pkjOk0EiAk',
  'Sit-up': 'VIZX2Ru9qU8',
  'GHD Sit-up': 'oFwt7WfnPcc',
  'Back Extension': 'ivDB23Kcv-A', // CrossFit — The GHD Back Extension
  'Double-under': '82jNjDS19lg',
  'Single-under': '_7cpagB7WUg', // CrossFit — From Single-Unders to Double-Unders
  'Medicine-ball Clean': 'KVGhkHSrDJo',

  // ── Cardio / Monostructural ──────────────────────────────
  'Row': 'fxfhQMbATCw', // CrossFit — Rowing Technique Tips

  // ── Carries & Holds ────────────────────────────────────
  'Turkish Get-up': 'saYKvqSscuY',

  // ── Dumbbell / Accessory ───────────────────────────────
  'Dumbbell Snatch': '3mlhF3dptAo',
  'Dumbbell Thruster': 'u3wKkZjE8QM',
  'Dumbbell Clean': 'SYxObzJ3gn0',
  'Lunge': '7EmwtpAI8cM',
  'Walking Lunge': 'DlhojghkaQ0',
  'Step-up': 'h7Gx1j4A8fA', // CrossFit — Step-Up Progression
}
