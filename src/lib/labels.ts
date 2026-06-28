import type { Site, SiteLabels } from "./types";

const DEFAULT_LABELS: Required<SiteLabels> = {
  collection: "Series",
  item: "Lesson",
  path: "Your lessons",
  continue: "Pick up where you left off",
  markWatched: "I finished this video",
  markUnwatched: "Finished ✓",
  markActivityDone: "I'm done with this worksheet",
  markActivityUndone: "Done ✓",
  upNext: "Up next",
  progress: "finished",
  allItems: "All lessons",
  welcomeBack: "Welcome back",
  activity: "Worksheet",
  downloadWorksheet: "Download a printable copy",
  yourNotes: "Write your notes",
  savedLocally: "Saved",
  done: "Done",
  stepOf: "Step {current} of {total}",
  forgotPassword: "Forgot password?",
  writeNotes: "Write your notes here",
  printCopy: "Print a copy",
  notesAutoSave: "Your notes save automatically.",
  continueLesson: "Continue",
  lessonsFinished: "You've finished {done} of {total} lessons",
};

export function getLabels(site: Site): Required<SiteLabels> {
  return { ...DEFAULT_LABELS, ...site.labels };
}

export function formatLabel(
  template: string,
  vars: Record<string, string | number>,
): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(`{${k}}`, String(v)),
    template,
  );
}
