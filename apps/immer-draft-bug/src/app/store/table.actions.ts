import {createAction, createActionGroup, emptyProps, props} from '@ngrx/store';
import {UploadTableCell, UploadTableRow} from '../table';
import {HttpErrorResponse} from '@angular/common/http';

export interface UploadTableRowProps {
    project_id: string;
    index: number;
    row: UploadTableRow;
}

export class TableActions {
    public static init = createActionGroup({
        source: 'upload-table/init',
        events: {
            do: emptyProps(),
            success: props<{
                tools: any[];
                projectRoles: any[];
            }>(),
            error: props<Error>(),
        },
    });

    public static addRow = createActionGroup({
        source: 'upload-table/add row',
        events: {
            do: emptyProps(),
        },
    });

    public static removeSelectedRow = createActionGroup({
        source: 'upload-table/remove row',
        events: {
            do: emptyProps(),
        },
    });

    public static addColumn = createActionGroup({
        source: 'upload-table/add column',
        events: {
            do: props<{
                _type: string;
            }>(),
        },
    });

    public static removeSelectedColumn = createActionGroup({
        source: 'upload-table/remove column',
        events: {
            do: emptyProps(),
        },
    });

    public static selectColumn = createActionGroup({
        source: 'upload-table/select column',
        events: {
            do: props<{
                index: number;
            }>(),
        },
    });

    public static selectRow = createActionGroup({
        source: 'upload-table/select row',
        events: {
            do: props<{
                index: number;
            }>(),
        },
    });

    public static updateColumnWidth = createActionGroup({
        source: 'upload-table/update column width',
        events: {
            do: props<{
                innerWidth: number;
            }>(),
        },
    });

    public static changeCell = createActionGroup({
        source: 'upload-table/change cell',
        events: {
            do: props<{
                cell: UploadTableCell;
                row: number;
                column: number;
            }>(),
        },
    });

    public static changeRow = createActionGroup({
        source: 'upload-table/change row',
        events: {
            do: props<{
                row: UploadTableRow;
                index: number;
            }>(),
        },
    });

    public static clickCell = createActionGroup({
        source: 'upload-table/cell click',
        events: {
            do: props<{
                cell: UploadTableCell;
                row: number;
                column: number;
            }>(),
        },
    });

    public static focusCellOnRight = createActionGroup({
        source: 'upload-table/focus cell right',
        events: {
            do: emptyProps(),
        },
    });

    public static focusCellBelow = createActionGroup({
        source: 'upload-table/focus cell below',
        events: {
            do: emptyProps(),
        },
    });

    public static setVerticalScrollEnabled = createActionGroup({
        source: 'upload-table/set vertical scroll enabled',
        events: {
            do: props<{
                verticalScrollEnabled: boolean;
            }>(),
        },
    });

    public static readFileGroups = createActionGroup({
        source: 'upload-table/add rows',
        events: {
            do: props<{
                fileGroups: {
                    name: string;
                    files: any[];
                }[];
            }>(),
        },
    });

    public static startUpload = createActionGroup({
        source: 'upload-table/start upload',
        events: {
            do: emptyProps(),
            success: emptyProps(),
            cancel: emptyProps(),
        },
    });

    public static uploadTask = createActionGroup({
        source: 'upload-table/upload task',
        events: {
            do: props<UploadTableRowProps>(),
            success: props<{
                index: number;
                row: UploadTableRow;
                result: any;
            }>(),
            failed: props<{
                index: number;
                row: UploadTableRow;
                error: HttpErrorResponse;
            }>(),
            processing: props<{
                index: number;
                progress: number | undefined;
            }>(),
        },
    });

    public static retryFailedUploads = createActionGroup({
        source: 'upload-table/retry failed uploads',
        events: {
            do: emptyProps(),
        },
    });

    public static undo = createAction('UNDO');
    public static redo = createAction('REDO');
}

