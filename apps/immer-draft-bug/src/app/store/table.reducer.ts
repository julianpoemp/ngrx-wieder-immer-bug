import {
  UploadTableCell,
  UploadTableRow,
  UploadTableTaskConfigLabelCell,
  UploadTableTaskNumCell,
  UploadTableTaskTypeCell
} from '../table';
import {initialUndoRedoState, undoRedo, UndoRedoState} from 'ngrx-wieder';
import {TableActions} from './table.actions';
import {createFeature, on} from '@ngrx/store';
import {sum} from '../functions';

export interface TableState extends UndoRedoState {
  status: 'loading' | 'loaded' | 'uploading';
  upload:
    | {
    running: number;
    waiting: number;
    failed: number;
    finished: number;
  }
    | undefined;
  table: {
    rows: UploadTableRow[];
    header: UploadTableCell[];
    taskNumCounter: number;
    columnOptions: {
      name: string;
      cell: UploadTableCell;
    }[];
    staticColumnTypes: string[];
    selected: {
      column: number | undefined;
      row: number | undefined;
    };
  };
  tools: any[];
  projectRoles: any[];
  droppedFiles: (FileSystemEntry | null)[];
  gui: {
    lastFocusedCell:
      | {
      row: number;
      column: number;
    }
      | undefined;
    verticalScrollEnabled: boolean;
    additionalColumns: string[];
    fullWidth: number;
  };
}

const initialState: TableState = {
  status: 'loading',
  upload: undefined,
  table: {
    rows: [],
    header: [],
    taskNumCounter: 0,
    columnOptions: [
      {
        name: 'task_num',
        cell: {
          type: 'task_num',
          value: 'task_num',
        } as UploadTableTaskNumCell,
      },
      {
        name: 'task_type',
        cell: {
          type: 'task_type',
          value: 'task_type',
        } as UploadTableTaskTypeCell,
      },
      {
        name: 'task_status',
        cell: {
          type: 'task_status',
          value: 'task_status',
          context: [
            {
              label: 'draft',
              value: 'draft',
            },
            {
              label: 'free',
              value: 'free',
            },
            {
              label: 'busy',
              value: 'busy',
            },
            {
              label: 'pause',
              value: 'pause',
            },
            {
              label: 'finished',
              value: 'finished',
            },
            {
              label: 'failed',
              value: 'failed',
            },
            {
              label: 'postponed',
              value: 'postponed',
            },
          ],
        } as UploadTableTaskTypeCell,
      },
      {
        name: 'task_config_label',
        cell: {
          type: 'task_config_label',
          value: 'task_config_label',
        } as UploadTableTaskConfigLabelCell,
      },
      {
        name: 'task_worker_username',
        cell: {
          type: 'task_worker_username',
          value: 'task_worker_username',
        } as UploadTableCell,
      },
    ],
    staticColumnTypes: ['task_num', 'task_inputs', 'task_config_label', 'task_type', 'task_status'],
    selected: {
      column: undefined,
      row: undefined,
    },
  },
  tools: [],
  projectRoles: [],
  droppedFiles: [],
  gui: {
    lastFocusedCell: undefined,
    verticalScrollEnabled: false,
    additionalColumns: [
      'task_worker_username',
      'task_outputs',
      'task_nexttask',
      'task_use_outputs_from_task',
      'task_pid',
      'task_code',
      'task_comment',
    ],
    fullWidth: 0,
  },
  ...initialUndoRedoState,
};

// initialize ngrx-wieder with custom config
const {createUndoRedoReducer} = undoRedo({
  allowedActionTypes: [
    TableActions.addRow.do.type,
    TableActions.addColumn.do.type,
    TableActions.removeSelectedRow.do.type,
    TableActions.removeSelectedColumn.do.type,
    TableActions.removeSelectedColumn.do.type,
    TableActions.changeCell.do.type,
    TableActions.readFileGroups.do.type,
    TableActions.changeRow.do.type,
  ],
});

const createRow: (state: TableState) => UploadTableRow = (state: TableState) => {
  return {
    upload: undefined,
    style: {height: 30},
    taskDto: {},
    cells: [
      ...state.table.header.map((a) => {
        const cellOptions = state.table.columnOptions.find((b) => b.name === a.value) ?? undefined;
        const value = a.value === 'task_num' ? state.table.taskNumCounter.toString() : '';

        const result = {
          type: a.value,
          value: value,
          context: cellOptions?.cell.context,
          dragEntered: false,
          style: {
            width: a?.style?.width ?? 10,
          },
          selected: false,
          focused: false,
        };

        return result;
      }),]
  }
};

const addRow: (state: TableState) => TableState = (state: TableState) => {
  state.table.rows.push({
    upload: undefined,
    style: {height: 30},
    taskDto: {},
    cells: [
      ...state.table.header.map((a) => {
        const cellOptions = state.table.columnOptions.find((b) => b.name === a.value) ?? undefined;
        const value = a.value === 'task_num' ? state.table.taskNumCounter.toString() : '';

        const result = {
          type: a.value,
          value: value,
          context: cellOptions?.cell.context,
          dragEntered: false,
          style: {
            width: a?.style?.width ?? 10,
          },
          selected: false,
          focused: false,
        };

        return result;
      }),]
  });
  return state;
};

function removeRow(state: TableState, index: number) {
  state = {
    ...state,
    table: {
      ...state.table,
      selected: {
        ...state.table,
        row: index < state.table.rows.length ? index : index - 1,
        column: undefined,
      },
      rows: [...state.table.rows.slice(0, index), ...state.table.rows.slice(index + 1)],
    },
  };

  index = index < state.table.rows.length ? index : index - 1;
  if (index < state.table.rows.length) {
    state = {
      ...state,
      table: {
        ...state.table,
        rows: [
          ...state.table.rows.slice(0, index),
          {
            ...state.table.rows[index],
            cells: state.table.rows[index].cells.map((a) => ({
              ...a,
              selected: true,
            })),
          },
          ...state.table.rows.slice(index + 1),
        ],
      },
    };
  }

  return state;
}

function addColumn(state: TableState, type: string) {
  const cell = state.table.columnOptions.find((a) => a.cell.type === type)?.cell;
  const context = cell?.context;

  return {
    ...state,
    table: {
      ...state.table,
      header: [
        ...state.table.header,
        {
          type: 'header',
          value: type,
          context,
          onDrop: undefined,
          dragEntered: false,
          style: {
            width: cell?.style?.width ?? 10,
          },
          selected: false,
          focused: false,
        },
      ],
      rows: state.table.rows.map((a) => ({
        ...a,
        cells: [
          ...a.cells,
          {
            type,
            value: '',
            context,
            onDrop: undefined,
            dragEntered: false,
            style: {
              width: cell?.style?.width ?? 10,
            },
            selected: false,
            focused: false,
          },
        ],
      })),
    },
  };
}

function removeColumn(state: TableState, index: number) {
  if (index > state.table.staticColumnTypes.length) {
    state = {
      ...state,
      table: {
        ...state.table,
        header: [...state.table.header.slice(0, index), ...state.table.header.slice(index + 1)],
        rows: state.table.rows.map((a) => ({
          ...a,
          cells: [...a.cells.slice(0, index), ...a.cells.slice(index + 1)],
        })),
        selected: {
          ...state.table.selected,
          column: undefined,
        },
      },
    };

    if (index < state.table.header.length) {
      state = {
        ...state,
        table: {
          ...state.table,
          selected: {
            ...state.table,
            row: undefined,
            column: index,
          },
          rows: state.table.rows.map((a) => ({
            ...a,
            cells: a.cells.map((b, i) => ({
              ...b,
              selected: index === i,
            })),
          })),
        },
      };
    }
  }

  return state;
}

function getColumnWidth(cell: UploadTableCell, type: 'header' | 'column', header: UploadTableCell[], innerWidth: number) {
  const check = type === 'header' ? cell.value : cell.type;
  return getMinWidthOfColumnType(check) ?? getEqualColumnWidth(header, innerWidth);
}

function getEqualColumnWidth(header: UploadTableCell[], innerWidth: number) {
  const rowNumColumnWidth = 57;
  let fixedWidth = 0;
  let equalColumns = 0;

  header.map((a) => {
    const w = getMinWidthOfColumnType(a.value);
    if (w) {
      fixedWidth += w;
    } else {
      equalColumns++;
    }
    return a;
  });

  const eqWidth = innerWidth - rowNumColumnWidth - fixedWidth;
  const eqColumnWidth = eqWidth / equalColumns;

  return Math.max(250, eqColumnWidth);
}

function getMinWidthOfColumnType(type: string) {
  switch (type) {
    case 'task_num':
      return 100;
    case 'task_pid':
      return 100;
    case 'task_nexttask':
      return 100;
    case 'task_status':
      return 150;
    case 'task_use_outputs_from_task':
      return 200;
    default:
      return undefined;
  }
}

function updateContext(state: TableState, name: string, newContext: any) {
  let columnOptions: {
    name: string;
    cell: UploadTableCell;
  }[] = [];
  const index = state.table.columnOptions.findIndex((a) => a.name === name);

  if (index > -1) {
    let element = state.table.columnOptions[index];
    element = {
      ...element,
      cell: {
        ...element.cell,
        context: newContext,
      },
    };
    columnOptions = [...state.table.columnOptions.slice(0, index), element, ...state.table.columnOptions.slice(index + 1)];
  } else {
    throw new Error(`Can't find columnOption for ${name}`);
  }

  return {
    ...state,
    table: {
      ...state.table,
      columnOptions,
      rows: state.table.rows.map((a) => ({
        ...a,
        cells: a.cells.map((b) => {
          if (b.type === name) {
            b.context = newContext;
          }
          return b;
        }),
      })),
    },
  };
}

function updateColumnWidth(state: TableState, innerWidth: number): TableState {
  console.log('a');
  state.table.header = state.table.header.map((a) => ({
    ...a,
    style: {
      width: getColumnWidth(a, 'header', state.table.header, innerWidth),
    },
  }));
  console.log('b');
  state.table.columnOptions = state.table.columnOptions.map((a, index) => ({
    ...a,
    style: {
      width: state.table.header[index].style.width,
    },
  }));
  console.log('c');
  state.table.rows = state.table.rows.map((a) => ({
    ...a,
    cells: a.cells.map((b) => ({
      ...b,
      style: {
        ...b.style,
        width: getColumnWidth(b, 'column', state.table.header, innerWidth),
      },
    })),
  }));
  state.gui.fullWidth = 40 + sum(state.table.header.map((a) => a?.style?.width ?? 10))
  console.log('d');

  return state;
}

function disableSelection(state: TableState) {
  const func = (state: TableState) => {
    if (state.table.selected.row !== undefined || state.table.selected.column !== undefined) {
      if (state.table.selected.row !== undefined) {
        return [
          ...state.table.rows.slice(0, state.table.selected.row),
          {
            ...state.table.rows[state.table.selected.row!],
            cells: state.table.rows[state.table.selected.row!].cells.map((a) => ({
              ...a,
              focused: false,
              selected: false,
            })),
          },
          ...state.table.rows.slice(state.table.selected.row! + 1),
        ];
      } else {
        return state.table.rows.map((a) => ({
          ...a,
          cells: [
            ...a.cells.slice(0, state.table.selected.column),
            {
              ...a.cells[state.table.selected.column!],
              focused: false,
              selected: false,
            },
            ...a.cells.slice(state.table.selected.column! + 1),
          ],
        }));
      }
    }
    return state.table.rows;
  };

  state = {
    ...state,
    table: {
      ...state.table,
      selected: {
        row: undefined,
        column: undefined,
      },
      rows: func(state),
    },
  };

  return state;
}

function unfocusRows(state: TableState) {
  return {
    ...state,
    table: {
      ...state.table,
      rows: state.table.rows.map((a) => ({
        ...a,
        cells: a.cells.map((b) => ({
          ...b,
          focused: false,
        })),
      })),
    },
  };
}

function disableFocusOnLastFocusedOne(state: TableState) {
  if (state.gui.lastFocusedCell) {
    state = {
      ...state,
      table: {
        ...state.table,
        rows: [
          ...state.table.rows.slice(0, state.gui.lastFocusedCell.row),
          {
            ...state.table.rows[state.gui.lastFocusedCell.row],
            cells: [
              ...state.table.rows[state.gui.lastFocusedCell.row].cells.slice(0, state.gui.lastFocusedCell.column),
              {
                ...state.table.rows[state.gui.lastFocusedCell.row].cells[state.gui.lastFocusedCell.column],
                focused: false,
              },
              ...state.table.rows[state.gui.lastFocusedCell.row].cells.slice(state.gui.lastFocusedCell.column + 1),
            ],
          },
          ...state.table.rows.slice(state.gui.lastFocusedCell.row + 1),
        ],
      },
    };
  }
  return state;
}

function focusCell(state: TableState, direction: 'top' | 'right' | 'bottom' | 'left') {
  if (state.table.rows.length > 0) {
    // simulate tab navigation
    if (state.gui.lastFocusedCell) {
      state = disableFocusOnLastFocusedOne(state);
      let incrementor = {
        cell: 0,
        row: 0,
      };

      switch (direction) {
        case 'top':
          incrementor = {row: -1, cell: 0};
          break;
        case 'right':
          incrementor = {row: 0, cell: 1};
          break;
        case 'bottom':
          incrementor = {row: 1, cell: 0};
          break;
        case 'left':
          incrementor = {row: -1, cell: 0};
          break;
      }
      let newColumnIndex = state.gui.lastFocusedCell!.column;
      let newRowIndex: number;

      if (['right', 'left'].includes(direction)) {
        newColumnIndex = state.gui.lastFocusedCell!.column + incrementor.cell;

        if (newColumnIndex < 0) {
          newRowIndex = Math.max(0, state.gui.lastFocusedCell!.row - 1);
        } else {
          newRowIndex = Math.floor(newColumnIndex / state.table.rows[0].cells.length);
          newRowIndex = state.gui.lastFocusedCell!.row + newRowIndex;

          if (newColumnIndex >= state.table.rows[0].cells.length) {
            newColumnIndex = 0;
          }

          if (newRowIndex >= state.table.rows.length) {
            newRowIndex = 0;
          }
        }
      } else {
        newRowIndex = Math.max(0, state.gui.lastFocusedCell!.row + incrementor.row);

        if (newRowIndex >= state.table.rows.length) {
          newRowIndex = 0;
        }
      }

      state = {
        ...state,
        gui: {
          ...state.gui,
          lastFocusedCell: {
            ...state.gui.lastFocusedCell!,
            row: newRowIndex,
            column: newColumnIndex,
          },
        },
      };

      state = {
        ...state,
        table: {
          ...state.table,
          rows: [
            ...state.table.rows.slice(0, state.gui.lastFocusedCell!.row),
            {
              ...state.table.rows[state.gui.lastFocusedCell!.row],
              cells: [
                ...state.table.rows[state.gui.lastFocusedCell!.row].cells.slice(0, state.gui.lastFocusedCell!.column),
                {
                  ...state.table.rows[state.gui.lastFocusedCell!.row].cells[state.gui.lastFocusedCell!.column],
                  focused: true,
                },
                ...state.table.rows[state.gui.lastFocusedCell!.row].cells.slice(state.gui.lastFocusedCell!.column + 1),
              ],
            },
            ...state.table.rows.slice(state.gui.lastFocusedCell!.row + 1),
          ],
        },
      };
    } else {
      state = {
        ...state,
        gui: {
          ...state.gui,
          lastFocusedCell: {
            row: 0,
            column: 0,
          },
        },
      };
    }
  }

  return state;
}

export const tableFeature = createFeature({
  name: 'table',
  reducer: createUndoRedoReducer(
    initialState,
    on(TableActions.init.success, (state: TableState, {tools, projectRoles}) => {
      state.table.taskNumCounter = 1;
      state.table.header = state.table.staticColumnTypes.map(
        (a: any) =>
          ({
            type: 'header',
            value: a,
            dragEntered: false,
          } as UploadTableCell)
      );
      state.tools = tools;
      state.projectRoles = projectRoles;
      state.status = "loaded";
      state = addRow(state);
      state = updateColumnWidth(state, window.innerWidth);
      console.log('e');
      return state;
    }),
    on(TableActions.addRow.do, (state) => {
      state = {
        ...state,
        table: {
          ...state.table,
          taskNumCounter: state.table.taskNumCounter + 1,
        },
      };

      return {
        ...state,
        table: {
          ...state.table,
          rows: [...state.table.rows, createRow(state)],
        },
      };
    }),
    on(TableActions.removeSelectedRow.do, (state) => {
      const index = state.table.selected?.row!;
      state = removeRow(state, index);
      return state;
    }),
    on(TableActions.addColumn.do, (state, {_type}) => {
      state = addColumn(state, _type);
      state = {
        ...state,
        gui: {
          ...state.gui,
          additionalColumns: state.gui.additionalColumns.filter((a) => a !== _type),
        },
      };

      return updateColumnWidth(state, window.innerWidth);
    }),
    on(TableActions.removeSelectedColumn.do, (state) => {
      const index = state.table.selected?.column!;

      const name = state.table.header[index].value;
      state = removeColumn(state, index);
      state = {
        ...state,
        gui: {
          ...state.gui,
          additionalColumns: [...state.gui.additionalColumns, name],
        },
      };
      return updateColumnWidth(state, window.innerWidth);
    }),
    on(TableActions.selectColumn.do, (state, {index}) => ({
      ...state,
      table: {
        ...state.table,
        selected: {
          ...state.table.selected,
          row: undefined,
          column: index,
        },
        rows: state.table.rows.map((a) => ({
          ...a,
          cells: a.cells.map((b, i) => ({
            ...b,
            selected: index === i,
          })),
        })),
      },
    })),
    on(TableActions.selectRow.do, (state, {index}) => ({
      ...state,
      table: {
        ...state.table,
        selected: {
          ...state.table.selected,
          column: undefined,
          row: index,
        },
        rows: state.table.rows.map((a, r) => ({
          ...a,
          cells: a.cells.map((b) => ({
            ...b,
            selected: index === r,
            focused: false,
          })),
        })),
      },
    })),
    on(TableActions.startUpload.do, (state: TableState) => ({
      ...state,
      upload: {
        running: 0,
        failed: 0,
        finished: 0,
        waiting: state.table.rows.length,
      },
    })),
    on(TableActions.uploadTask.do, (state: TableState, {index}) => ({
      ...state,
      upload: {
        ...state.upload!,
        running: state.upload!.running + 1,
        waiting: state.upload!.waiting - 1,
      },
      table: {
        ...state.table,
        rows: [
          ...state.table.rows.slice(0, index),
          {
            ...state.table.rows[index],
            upload: {
              status: 'uploading',
              progress: 0,
            },
          },
          ...state.table.rows.slice(index + 1),
        ],
      },
    })),
    on(TableActions.uploadTask.processing, (state: TableState, {index, progress}) => {
      if (progress === undefined) {
        return state;
      }

      return {
        ...state,
        table: {
          ...state.table,
          rows: [
            ...state.table.rows.slice(0, index),
            {
              ...state.table.rows[index],
              upload: {
                status: 'uploading',
                progress,
              },
            },
            ...state.table.rows.slice(index + 1),
          ],
        },
      };
    }),
    on(TableActions.uploadTask.failed, (state: TableState, {index}) => ({
      ...state,
      upload: {
        ...state.upload!,
        running: state.upload!.running - 1,
        failed: state.upload!.failed + 1,
      },
      table: {
        ...state.table,
        rows: [
          ...state.table.rows.slice(0, index),
          {
            ...state.table.rows[index],
            upload: {
              status: 'failed',
              progress: 0,
            },
          },
          ...state.table.rows.slice(index + 1),
        ],
      },
    })),
    on(TableActions.retryFailedUploads.do, (state: TableState) => ({
      ...state,
      upload: {
        ...state.upload!,
        waiting: state.upload!.waiting + state.upload!.failed,
      },
      table: {
        ...state.table,
        rows: state.table.rows.map((row) => {
          if (row.upload!.status === 'failed') {
            return {
              ...row,
              upload: {
                ...row.upload!,
                status: 'uploading',
                progress: 0,
              } as any,
            };
          }
          return row;
        }),
      },
    })),
    on(TableActions.uploadTask.success, (state: TableState, {index}) => ({
      ...state,
      upload: {
        ...state.upload!,
        running: state.upload!.running - 1,
        finished: state.upload!.finished + 1,
      },
      table: {
        ...state.table,
        rows: [
          ...state.table.rows.slice(0, index),
          {
            ...state.table.rows[index],
            upload: {
              status: 'finished',
              progress: 100,
            },
          },
          ...state.table.rows.slice(index + 1),
        ],
      },
    })),
    on(TableActions.updateColumnWidth.do, (state: TableState, {innerWidth}) => {
      return updateColumnWidth(state, innerWidth);
    }),
    on(TableActions.changeRow.do, (state: TableState, {row, index}) => ({
      ...state,
      table: {
        ...state.table,
        rows: [...state.table.rows.slice(0, index), row, ...state.table.rows.slice(index + 1)],
      },
    })),
    on(TableActions.changeCell.do, (state: TableState, {cell, row, column}) => {
      const rowElement = state.table.rows[row];
      let context: any;

      if (cell.type === 'task_config_label') {
        const taskTypeCellIndex = rowElement.cells.findIndex((a) => a.type === 'task_type');
        const toolConfig = cell.type === 'task_config_label' ? state.tools.find((a) => a.name === cell.value) : undefined;

        if (taskTypeCellIndex > -1) {
          context =
            toolConfig?.tool.supportedTaskTypes?.map((a: any) => ({
              label: a,
              value: a,
            })) ?? [];
        } else {
          context = [
            {
              label: 'Missing task_config_label',
              value: '',
            },
          ];
        }

        state = {
          ...state,
          table: {
            ...state.table,
            rows: [
              ...state.table.rows.slice(0, row),
              {
                ...rowElement,
                cells: [
                  ...rowElement.cells.slice(0, taskTypeCellIndex),
                  {
                    ...rowElement.cells[taskTypeCellIndex],
                    context,
                  },
                  ...rowElement.cells.slice(taskTypeCellIndex + 1),
                ],
              },
              ...state.table.rows.slice(row + 1),
            ],
          },
        };
      }

      return {
        ...state,
        table: {
          ...state.table,
          rows: [
            ...state.table.rows.slice(0, row),
            {
              ...rowElement,
              cells: [
                ...state.table.rows[row].cells.slice(0, column),
                {
                  ...cell,
                },
                ...state.table.rows[row].cells.slice(column + 1),
              ],
            },
            ...state.table.rows.slice(row + 1),
          ],
        },
      };
    }),
    on(TableActions.clickCell.do, (state: TableState, {cell, row, column}) => {
      state = disableSelection(state);

      if (state.gui.lastFocusedCell && (state.gui.lastFocusedCell?.row !== row || state.gui.lastFocusedCell?.column !== column)) {
        state = disableFocusOnLastFocusedOne(state);
      }

      state = {
        ...state,
        table: {
          ...state.table,
          rows: [
            ...state.table.rows.slice(0, row),
            {
              ...state.table.rows[row],
              cells: [
                ...state.table.rows[row].cells.slice(0, column),
                {
                  ...state.table.rows[row].cells[column],
                  focused: true,
                },
                ...state.table.rows[row].cells.slice(column + 1),
              ],
            },
            ...state.table.rows.slice(row + 1),
          ],
        },
        gui: {
          ...state.gui,
          lastFocusedCell: {
            row,
            column,
          },
        },
      };

      return state;
    }),
    on(TableActions.focusCellOnRight.do, (state: TableState) => {
      state = disableSelection(state);
      return focusCell(state, 'right');
    }),
    on(TableActions.focusCellBelow.do, (state: TableState) => {
      state = disableSelection(state);
      return focusCell(state, 'bottom');
    }),
    on(TableActions.setVerticalScrollEnabled.do, (state: TableState, {verticalScrollEnabled}) => ({
      ...state,
      gui: {
        ...state.gui,
        verticalScrollEnabled,
      },
    })),
    on(TableActions.readFileGroups.do, (state: TableState, {fileGroups}) => {
      const rows: UploadTableRow[] = [];
      for (const fileGroup of fileGroups) {
        const row: UploadTableRow = createRow(state);
        state = {
          ...state,
          table: {
            ...state.table,
            taskNumCounter: state.table.taskNumCounter + 1,
          },
        };

        if (state.table.selected?.row !== undefined) {
          const selectedRow = state.table.rows[state.table.selected.row];

          // copy data from row
          for (let i = 0; i < row.cells.length; i++) {
            const originCell = selectedRow.cells[i];
            const cell = row.cells[i];

            if (i > 0 && !['task_inputs', 'task_outputs', 'task_nexttask', 'task_use_outputs_from_task'].includes(cell.type)) {
              cell.value = originCell.value;
              cell.context = originCell.context;
            }
          }
        }
        row.taskDto.inputs = fileGroup.files;
        rows.push(row);
      }

      return {
        ...state,
        table: {
          ...state.table,
          rows: [...state.table.rows, ...rows],
        },
      };
    }),
    on(TableActions.undo, (state: TableState) => unfocusRows(state)),
    on(TableActions.redo, (state: TableState) => unfocusRows(state))
  ),
});

export const {
  name, // feature name
  reducer, // feature reducer,
} = tableFeature;
