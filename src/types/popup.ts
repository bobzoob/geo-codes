export interface ActivityEntry {
  label: string;
  subLabel?: string;
}

export interface PopupData {
  title: string;
  subtitle?: string;
  meta?: string; // "Mentions: Goethe, Schiller"
  body?: string; // full text or description

  // generic list section
  listTitle?: string;
  listItems?: ActivityEntry[];

  url?: string;
}
