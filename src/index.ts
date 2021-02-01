import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { Menu, Panel } from '@lumino/widgets';
import { INotebookTracker } from '@jupyterlab/notebook';
import {RunAllCellsButtonExtension} from './btn';

/**
 * Activate the widgets example extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'widgets-example',
  autoStart: true,
  requires: [ICommandPalette, IMainMenu, INotebookTracker],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    mainMenu: IMainMenu,
    // panel: NotebookPanel,
    // nt: INotebookTools,
    tracker: INotebookTracker
  ) => {
    let buttonExtension = new RunAllCellsButtonExtension();
    app.docRegistry.addWidgetExtension('Notebook', buttonExtension);

    const { commands, shell } = app;
    const command = 'widgets:open-tab';
    // debugger;
    // console.log(panel);
    console.log(tracker);
    commands.addCommand(command, {
      label: 'Open a Tab Widget',
      caption: 'Open the Widgets Example Tab',
      execute: () => {
        const widget = new ExampleWidget(app, tracker);
        shell.add(widget, 'main');
      }
    });
    palette.addItem({ command, category: 'Extension Examples' });

    const exampleMenu = new Menu({ commands });

    exampleMenu.title.label = 'Widget Example';
    mainMenu.addMenu(exampleMenu, { rank: 80 });
    exampleMenu.addItem({ command });
  }
};

export default extension;

class ExampleWidget extends Panel {
  constructor(app: JupyterFrontEnd, tracker: INotebookTracker) {
    super();
    this.addClass('jp-example-view');
    this.id = 'simple-widget-example';
    this.title.label = 'Widget Example View';
    this.title.closable = true;

    let tbl = document.createElement('table');
    tbl.className = 'hey-tbl';
    tbl.style.width  = '100%';
    // tbl.createTHead()
    let headRow = tbl.createTHead().insertRow();
    let cell = headRow.insertCell(0);
    cell.title = 'Name';
    cell.innerHTML = 'Name';
    cell = headRow.insertCell(1);
    cell.title = 'I/O';
    cell.innerHTML = 'I/O';
    cell = headRow.insertCell(2);
    cell.title = 'Type';
    cell.innerHTML = 'Type';
    cell = headRow.insertCell(3);
    cell.title = 'Size';
    cell.innerHTML = 'Size';
    cell = headRow.insertCell(4);
    cell.title = 'Shape';
    cell.innerHTML = 'Shape';
    cell = headRow.insertCell(5);
    cell.title = 'Content';
    cell.innerHTML = 'Content';

    let tFoot = tbl.createTFoot();

    this.node.appendChild(tbl);

    let btn = document.createElement('button');
    btn.innerHTML = 'Add';
    btn.onclick = ()=> {
      let newRow = tFoot.insertRow();
      for (let i = 0; i < 6; i++){
        let c = newRow.insertCell(i);
        c.appendChild(document.createElement('input'));
      }
    };
    this.node.appendChild(btn);

    let btn2 = document.createElement('button');
    btn2.innerHTML = 'Set';
    btn2.onclick = ()=> {
      console.log('hello');
      // console.log(app);
      // console.log(panel);
      // console.log(nt);
      // console.log(tracker);
      // debugger;
    };
    this.node.appendChild(btn2);

  
  }
}