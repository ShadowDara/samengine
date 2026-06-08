//lib/types.ts

export type SizeUnit =
  | "B"
  | "KB"
  | "MB"
  | "GB"
  | "TB";

export interface Size {
  value: number;
  unit: SizeUnit;
}

export type FileExistence =
  | "required"
  | "optional"
  | "forbidden";

export interface FileTemplate {
  name: string;
  existence: FileExistence;
  size?: Size;
}

export interface FolderTemplate {
  name: string;
  files: FileTemplate[];
  folders: FolderTemplate[];
  size?: Size;
}

export interface FinderTemplate {
  name: string;
  description: string;
  min_version?: string;
  command?: string;
  invert_command: boolean;
  tags: string[];

  size?: Size;

  files: FileTemplate[];
  folders: FolderTemplate[];
}
