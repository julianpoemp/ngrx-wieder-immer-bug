export interface UploadTableCell {
  type: string;
  value: string;
  context: any | undefined;
  dragEntered: boolean;
  style: {
    width: number;
  };
  selected: boolean;
  focused: boolean;
}

export interface UploadTableTaskNumCell extends UploadTableCell {
  context: { label: string; value: string }[];
}

export interface UploadTableTaskConfigLabelCell extends UploadTableCell {
  context: { label: string; value: string }[];
}

export interface UploadTableTaskTypeCell extends UploadTableCell {
  context: { label: string; value: string }[];
}

export interface UploadTableRow {
  cells: UploadTableCell[];
  style: {
    height: number;
  };

  taskDto: {
    properties?: any;
    inputs?: any[];
    outputs?: any[];
  };

  upload:
    | {
        status: 'waiting' | 'uploading' | 'failed' | 'finished';
        progress: number;
      }
    | undefined;
}
