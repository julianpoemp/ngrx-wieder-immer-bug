import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {TableState} from './store/table.reducer';
import {TableActions} from './store/table.actions';

interface RootState {
    authentication: any;
    app: any;
    api: any;
    accounts?: any;
    projects?: any;
    appTokens?: any;
    tools?: any;
    roles?: any;
}

export interface ExpandedRootState extends RootState {
    table: TableState;
}

@Component({
    selector: 'ngrx-wieder-immer-bug-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private store: Store<ExpandedRootState>) {

    }

    initialize() {
        this.store.dispatch(TableActions.init.success({
            tools: [],
            projectRoles: []
        }));
    }
}

