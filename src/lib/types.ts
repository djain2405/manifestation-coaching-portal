export type EmbedProvider = "youtube" | "vimeo" | "loom";

export type Embed = {
  provider: EmbedProvider;
  id: string;
};

export type ItemType = "watch" | "activity";

export type ActivityPromptKind = "shorttext" | "longtext" | "checkbox";

export type ActivityPrompt = {
  id: string;
  label: string;
  kind: ActivityPromptKind;
  placeholder?: string;
};

export type ActivitySubmitConfig = {
  enabled: boolean;
  method?: "email" | "webhook";
  endpoint?: string;
};

export type ActivityContent = {
  intro?: string;
  prompts: ActivityPrompt[];
  pdf?: string;
  pdfLabel?: string;
  estimatedMinutes?: number;
  submit?: ActivitySubmitConfig;
};

export type CollectionCover = {
  gradient?: string;
  image?: string;
};

export type SiteLabels = {
  collection?: string;
  item?: string;
  path?: string;
  continue?: string;
  markWatched?: string;
  markUnwatched?: string;
  markActivityDone?: string;
  markActivityUndone?: string;
  upNext?: string;
  progress?: string;
  allItems?: string;
  welcomeBack?: string;
  activity?: string;
  downloadWorksheet?: string;
  yourNotes?: string;
  savedLocally?: string;
  done?: string;
  stepOf?: string;
  forgotPassword?: string;
  writeNotes?: string;
  printCopy?: string;
  notesAutoSave?: string;
  continueLesson?: string;
  lessonsFinished?: string;
};

export type Site = {
  title: string;
  tagline: string;
  passwordHint: string;
  theme?: string;
  labels?: SiteLabels;
};

export type Item = {
  id?: string;
  slug: string;
  type?: ItemType;
  title: string;
  description: string;
  embed?: Embed;
  durationMinutes?: number;
  subtitle?: string;
  emoji?: string;
  highlight?: string;
  activity?: ActivityContent;
};

export type Collection = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  items: Item[];
  accent?: string;
  cover?: CollectionCover;
};

/** @deprecated Use Collection */
export type Course = Collection;
/** @deprecated Use Item */
export type Lesson = Item;

export type Curriculum = {
  site: Site;
  collections: Collection[];
};

export type CourseProgress = {
  completed: string[];
  lastLesson: string | null;
};

export type ActivityDraft = Record<string, string | boolean>;

/** Raw JSON may use legacy `courses` + `lessons` */
export type RawCurriculum = {
  site: Site;
  collections?: Array<{
    slug: string;
    title: string;
    description: string;
    items?: Item[];
    lessons?: Item[];
    accent?: string;
    cover?: CollectionCover;
  }>;
  courses?: Array<{
    slug: string;
    title: string;
    description: string;
    items?: Item[];
    lessons?: Item[];
    accent?: string;
    cover?: CollectionCover;
  }>;
};
