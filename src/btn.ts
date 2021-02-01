import {
    IDisposable
  } from '@phosphor/disposable';
  
//   import {
//     JupyterFrontEnd, JupyterFrontEndPlugin
//   } from '@jupyterlab/application';
  
  import {
    ToolbarButton
  } from '@jupyterlab/apputils';
  
  import { 
    addIcon 
  } from '@jupyterlab/ui-components';
  
  import {
    DocumentRegistry
  } from '@jupyterlab/docregistry';
  
  import {
    NotebookPanel, INotebookModel//, NotebookActions
  } from '@jupyterlab/notebook';
    
  export
  class RunAllCellsButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {

      let tblInformation2Code = (tbl: HTMLElement)=>{
        var lines = tbl.firstElementChild.lastElementChild.children;
        var inputCode: string = "";
        var outputCode: string = "";
        for (var l of lines){
          var inputs = [];
          for (var i of l.getElementsByTagName('input')){
            inputs.push(i.value);
          }
          var codeL: string = "assert "+inputs[0]+"=="+inputs[5]+"\n";
          if (inputs[1].toLowerCase()==="i"){
            inputCode+=codeL;  
          }
          else if (inputs[1].toLocaleLowerCase()==="o"){
            outputCode+=codeL;
          }          
        }
        return {inputCode, outputCode};
      }

      let getWrapperLastCellIndex = (panel:NotebookPanel, headerIndex: number)=>{
        console.log(headerIndex);
        const headerLevel: number = panel.model.cells.get(headerIndex).value.text.split(' ')[0].length;
        var lastCellIndex = headerIndex;
        for (var i=headerIndex+1; i<panel.model.cells.length; i++){
          // if markdown header with higher level
          if (panel.model.cells.get(i).type ==='markdown' && panel.model.cells.get(i).value.text.startsWith('#') && panel.model.cells.get(i).value.text.split(' ')[0].length < headerLevel){
            break;
          };
          lastCellIndex = i;
        };
        return lastCellIndex;
      }

      // Create the on-click callback for the toolbar button.
      let runAllCells = (panel: NotebookPanel) => {

        var p = panel;

        function realRunAllCells(){
          /**
           * TODO
           * 3. store table information in header
           * 4. table information to code
           */

          /**
           * check active cell type
           * if not markdown, return
           */ 
          if (p.content.activeCell.model.type !='markdown'){
            return;
          }

          // get active cell index
          // var activeHeaderIndex = p.content.activeCellIndex;

          // get active cell id
          var activeHeaderID = p.content.activeCell.model.id;

          /**
           * look for inputDiv
           * if exist, display it,
           * else, create one
           */
          if (document.getElementsByClassName('input-div '+ p.content.activeCell.model.id).length>0){
            Array.from(document.getElementsByClassName('input-div '+p.content.activeCell.model.id) as HTMLCollectionOf<HTMLElement>)[0].style.display='revert';
            return;
          }

          // create div for type specification
          var inputDiv = document.createElement('div');
          inputDiv.classList.add('input-div');
          inputDiv.classList.add(activeHeaderID);
          // create input table
          let tbl = document.createElement('table');
          tbl.className = 'hey-tbl';
          tbl.style.width  = '100%';
          // add header to input table
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
          // create table body
          let tFoot = tbl.createTFoot();
          // create 'Add' button. Add input row to table. 
          let btn = document.createElement('button');
          btn.innerHTML = 'Add';
          btn.onclick = ()=> {
            let newRow = tFoot.insertRow();
            for (let i = 0; i < 6; i++){
              let c = newRow.insertCell(i);
              c.appendChild(document.createElement('input'));
              c.lastElementChild.classList.add('input-div');
              c.lastElementChild.setAttribute('type', 'text');
            }
          };
          // create 'Set' button. 
          let btnSet = document.createElement('button');
          btnSet.innerHTML = 'Set';
          btnSet.onclick = ()=> {
            /**
             * if cell created before, edit that cell
             * else, create a new cell
             */
            var {inputCode, outputCode} = tblInformation2Code(Array.from(document.getElementsByClassName('input-div '+p.content.activeCell.model.id) as HTMLCollectionOf<HTMLElement>)[0]);
            console.log(outputCode);
            if (p.content.activeCell.model.metadata.has('input-id') && p.content.activeCell.model.metadata.has('output-id')){
              for (let i=0; i<p.model.cells.length; i++){
                if (p.model.cells.get(i).id==p.content.activeCell.model.metadata.get('input-id')){
                  p.model.cells.get(i).value.text = inputCode;
                }
                else if (p.model.cells.get(i).id==p.content.activeCell.model.metadata.get('output-id')){
                  p.model.cells.get(i).value.text = outputCode;
                }
              };
            }
            else {
              // insert cell for input var
              p.model.cells.insert(1+p.content.activeCellIndex, p.model.contentFactory.createCodeCell({}));
              // code for input 
              var newCell = p.model.cells.get(1+p.content.activeCellIndex);
              newCell.value.text = inputCode;
              // add newCell id to header metadata
              p.content.activeCell.model.metadata.set('input-id', newCell.id);
              // insert cell for output var
              var lastCellIndex = getWrapperLastCellIndex(p, p.content.activeCellIndex);
              p.model.cells.insert(1+lastCellIndex, p.model.contentFactory.createCodeCell({}));
              newCell = p.model.cells.get(1+lastCellIndex);
              newCell.value.text = outputCode;
              p.content.activeCell.model.metadata.set('output-id', newCell.id);
            }

            // hide specification table
            Array.from(document.getElementsByClassName('input-div '+p.content.activeCell.model.id) as HTMLCollectionOf<HTMLElement>)[0].style.display='none';
            // move specification table before new cell
            // p.content.node.insertBefore( document.getElementsByClassName('input-div '+p.content.activeCell.model.id)[0], p.content.node.children[1+p.content.activeCellIndex])
            // change active cell to input cell
            p.content.activeCellIndex = 1+p.content.activeCellIndex;
          }

          inputDiv.appendChild(tbl);
          inputDiv.appendChild(btn);
          inputDiv.appendChild(btnSet);
          p.content.activeCell.node.appendChild(inputDiv);
          // p.content.activeCell.node.after(inputDiv);
          // p.content.node.insertBefore(inputDiv, p.content.node.children[activeHeaderIndex+1]);
        }

        return realRunAllCells;

      };
      // Create the toolbar button 
      let button = new ToolbarButton({
        className: 'runAllCellsButton',
        icon: addIcon,
        onClick: runAllCells(panel),
        tooltip: 'Run All Cells'
      });
      
      // Add the toolbar button to the notebook
      panel.toolbar.insertItem(10, 'runAllCells', button);
      
      // The ToolbarButton class implements `IDisposable`, so the
      // button *is* the extension for the purposes of this method.
      return button;
    }
  }
  
