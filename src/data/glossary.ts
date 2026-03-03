export interface GlossaryEntry {
  term: string
  definition: string
}

/**
 * Common CrossFit terms and abbreviations with plain-English definitions.
 */
export const GLOSSARY: GlossaryEntry[] = [
  { term: 'AMRAP', definition: 'As Many Rounds (or Reps) As Possible within a set time.' },
  { term: 'Box', definition: 'A CrossFit gym. Called a "box" because they\'re often in warehouse-style spaces.' },
  { term: 'Chipper', definition: 'A workout with many movements done in sequence, typically for time.' },
  { term: 'CrossFit Total', definition: 'The sum of your best Back Squat, Shoulder Press, and Deadlift.' },
  { term: 'DU', definition: 'Double-under — a jump rope pass where the rope goes under your feet twice per jump.' },
  { term: 'EMOM', definition: 'Every Minute On the Minute — start a set of work at the top of each minute and rest the remainder.' },
  { term: 'For Time', definition: 'Complete the prescribed work as fast as possible. Your score is your finish time.' },
  { term: 'HSPU', definition: 'Handstand Push-up — an inverted pressing movement done against a wall.' },
  { term: 'KB', definition: 'Kettlebell — a cast-iron weight shaped like a cannonball with a handle.' },
  { term: 'Kipping', definition: 'Using a hip-driven swing to generate momentum for gymnastics movements like pull-ups.' },
  { term: 'MetCon', definition: 'Metabolic Conditioning — a workout designed to train stamina, endurance, and conditioning.' },
  { term: 'MU', definition: 'Muscle-up — a pull-up that transitions into a dip above the rings or bar.' },
  { term: 'OHS', definition: 'Overhead Squat — squatting with a barbell locked out overhead.' },
  { term: 'PR', definition: 'Personal Record — your all-time best performance on a lift or workout.' },
  { term: 'Rep', definition: 'Repetition — one complete movement cycle (e.g., one squat down and up).' },
  { term: 'RM', definition: 'Rep Max — the most weight you can lift for a given number of reps (e.g., 1RM = one-rep max).' },
  { term: 'Rx', definition: 'As Prescribed — completing a workout exactly as written with no modifications.' },
  { term: 'Rx+', definition: 'Above the prescribed standard — using heavier weight or a harder movement variation.' },
  { term: 'Scaled', definition: 'Modified — adjusting a workout to match your current ability (lighter weight, easier movement).' },
  { term: 'Set', definition: 'A group of consecutive reps performed without rest (e.g., 3 sets of 10 reps).' },
  { term: 'T2B', definition: 'Toes-to-Bar — hanging from a bar and touching your toes to it.' },
  { term: 'Tabata', definition: '8 rounds of 20 seconds work followed by 10 seconds rest (4 minutes total).' },
  { term: 'The Girls', definition: 'Benchmark workouts named after women (Fran, Grace, Helen, etc.) used to measure progress.' },
  { term: 'Hero WOD', definition: 'Workouts dedicated to fallen military, law enforcement, or first responders. Usually long and challenging.' },
  { term: 'WOD', definition: 'Workout of the Day — the main workout programmed for a given training session.' },
]
