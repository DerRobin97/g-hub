import type { SheetRegistry } from '../../app/OverlayContext';
import {
  AlertsSheet,
  AssetsSheet,
  ComposeSheet,
  CreateHubSheet,
  PostSheet,
  SearchSheet,
  TasksSheet,
  TeamSheet,
  WorkTimeSheet,
} from './Sheets';
import { NewsDetailSheet } from '../news/News';
import { AIAssistantSheet } from '../ai/AIAssistant';
import { ProfileEditSheet, DarstellungSheet } from '../profile/ProfileSheets';

/** Registry aller Overlay-Sheets (Name → Komponente), analog zur SHEETS-Map im Prototyp. */
export const SHEET_REGISTRY: SheetRegistry = {
  create: CreateHubSheet,
  compose: ComposeSheet,
  search: SearchSheet,
  alerts: AlertsSheet,
  team: TeamSheet,
  assets: AssetsSheet,
  tasks: TasksSheet,
  worktime: WorkTimeSheet,
  post: PostSheet,
  newsDetail: NewsDetailSheet,
  ai: AIAssistantSheet,
  profileEdit: ProfileEditSheet,
  darstellung: DarstellungSheet,
};
