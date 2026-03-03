/**
 * Maps CrossFit movements to scaling progressions.
 * Options are ordered from the Rx (hardest) version to the most accessible.
 */
export const MOVEMENT_SCALING: Record<string, string[]> = {
  // ── Gymnastics ──────────────────────────────────────────
  'Pull-up': ['Strict Pull-up', 'Kipping Pull-up', 'Ring Row', 'Banded Pull-up', 'Jumping Pull-up'],
  'Chest-to-Bar Pull-up': ['Chest-to-Bar', 'Kipping Pull-up', 'Banded Pull-up', 'Ring Row'],
  'Muscle-up': ['Muscle-up', 'Chest-to-Bar Pull-up + Dip', 'Pull-up + Dip', 'Banded Muscle-up'],
  'Bar Muscle-up': ['Bar Muscle-up', 'Chest-to-Bar + Dip', 'Pull-up + Push-up'],
  'Handstand Push-up': ['Strict HSPU', 'Kipping HSPU', 'Box HSPU', 'Pike Push-up', 'Seated DB Press'],
  'Handstand Walk': ['Handstand Walk', 'Wall Walk', 'Bear Crawl'],
  'Ring Dip': ['Ring Dip', 'Bar Dip', 'Box Dip', 'Banded Ring Dip'],
  'Toes-to-Bar': ['Toes-to-Bar', 'Knees-to-Elbow', 'Hanging Knee Raise', 'V-up'],
  'Rope Climb': ['Rope Climb (legless)', 'Rope Climb', 'Rope Pull from Floor', 'Ring Row + Plank'],
  'Pistol': ['Pistol Squat', 'Pistol to Box', 'Single-Leg Squat to Chair', 'Air Squat'],
  'L-sit': ['L-sit', 'Tuck L-sit', 'Knee Raise Hold'],

  // ── Olympic Lifts ──────────────────────────────────────
  'Snatch': ['Squat Snatch', 'Power Snatch', 'Hang Power Snatch', 'DB Snatch'],
  'Clean': ['Squat Clean', 'Power Clean', 'Hang Power Clean', 'DB Clean'],
  'Clean & Jerk': ['Clean & Jerk', 'Power Clean & Push Jerk', 'Hang Clean & Press', 'DB Clean & Press'],
  'Thruster': ['Barbell Thruster', 'DB Thruster', 'KB Goblet Thruster', 'Air Squat + Press'],

  // ── Squats ──────────────────────────────────────────────
  'Overhead Squat': ['Overhead Squat', 'Front Squat', 'Goblet Squat', 'Air Squat'],
  'Front Squat': ['Front Squat', 'Goblet Squat', 'Air Squat'],
  'Back Squat': ['Back Squat', 'Goblet Squat', 'Box Squat', 'Air Squat'],

  // ── Deadlifts ──────────────────────────────────────────
  'Deadlift': ['Deadlift', 'Romanian Deadlift', 'KB Deadlift', 'Good Morning'],
  'Sumo Deadlift High Pull': ['Barbell SDHP', 'KB SDHP', 'DB Upright Row'],

  // ── Push Movements ──────────────────────────────────────
  'Push-up': ['Push-up', 'Knee Push-up', 'Incline Push-up', 'Wall Push-up'],
  'Shoulder Press': ['Strict Press', 'Push Press', 'Seated DB Press'],
  'Bench Press': ['Barbell Bench', 'DB Bench', 'Floor Press', 'Push-up'],

  // ── Conditioning ────────────────────────────────────────
  'Double-under': ['Double-under', 'Penguin Jump', 'Single-under (2:1 ratio)'],
  'Box Jump': ['Box Jump', 'Box Jump (lower)', 'Box Step-up', 'Broad Jump'],
  'Wall Ball': ['Wall Ball (20/14)', 'Wall Ball (14/10)', 'Goblet Squat + Press'],
  'Burpee': ['Burpee', 'Step-back Burpee', 'No Push-up Burpee', 'Squat Thrust'],
  'Kettlebell Swing': ['Russian Swing', 'American Swing', 'DB Swing', 'Deadlift'],

  // ── Other ───────────────────────────────────────────────
  'Lunge': ['Barbell Lunge', 'DB Lunge', 'Walking Lunge', 'Step-up'],
  'Turkish Get-up': ['Full TGU', 'Half TGU', 'TGU with no weight'],
}
