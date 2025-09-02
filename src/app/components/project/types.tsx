export type Field = {
  name: string;
  type?: string;
};

export type Attribute = {
  name: string;
  type?: string;
};
export type Operation = {
  name: string;
  type?: string;
};

export type Link = {
  id: string;
  type: string;
  wholeEnd?: any;
};

export type ComponentItem = {
  id: string;
  name: string;
  type?: string;
  color?: string;
  attributes?: Attribute[];
  operations?: Operation[];
  links?: Link[];
};

export type Project = {
  id: string;
  name: string;
  owner: string;
  content?: Record<string, ComponentItem>;
};

export type ProjectDrawerProps = {
  open: boolean;
  onClose: () => void;
  project: Project;
  selectedComponentKey: string | null;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
  addNewComponent: (linkTo?: string) => void;
  updateLocalStorage: (project: Project) => void;
};
export type AttributesProps = {
  component: ComponentItem;
  updateComponent: (updates: Partial<ComponentItem>) => void;
  translate: (key: string) => string;
};
export type OperationsProps = {
  component: ComponentItem;
  updateComponent: (updates: Partial<ComponentItem>) => void;
  translate: (key: string) => string;
};

export type CanvasProps = {
  project: Project & { content?: Record<string, ComponentItem> };
  selectedComponentKey: string | null;
  setSelectedComponentKey: (key: string | null) => void;
  addNewComponent: (linkTo?: string) => void;
  openRenameMenu: (key: string) => void;
};


export type LineProps = {
  project: Project;
  positions: Record<
    string,
    { x: number; y: number }
  >;
};

export type ToolbarProps = {
  project: Project;
  goBack: () => void;
  selectedComponentKey: string | null;
  setSelectedComponentKey: (key: string | null) => void;
  addNewComponent: () => void;
  canvasRef: React.RefObject<ProjectCanvasHandle>; 
  worldSize: { width: number; height: number };
};

export interface ProjectCanvasHandle {
  canvasRef: HTMLDivElement | null;
  worldSize: { width: number; height: number };
}
export type GithubImportProps = {
  open: boolean;
  onClose: () => void;
  project: Project;
  updateLocalStorage: (updated: Project) => void;
};
