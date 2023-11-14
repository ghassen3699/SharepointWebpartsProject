import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';

import styles from './DashboardDemandeurWebPart.module.scss';
import { ISPList } from './models/isp-list.model';
import { FormatDate } from '../formulaireDemandeur/components/FormulaireDemandeur';

export interface IDashboardDemandeurWebPartProps {
  description: string;
}

export interface ISPLists { value: ISPList[]; }

export default class DashboardDemandeurWebPart extends BaseClientSideWebPart<IDashboardDemandeurWebPartProps> {

  private listFiltered = new Array();
  private pageList = new Array();
  private current_page = 1;
  private items_per_page = 20;

  private numPages() {
    return Math.ceil(this.listFiltered.length / this.items_per_page);
  }


  private prevPage() {
    if (this.current_page > 1) {
      this.current_page--;
      this.loadList();
    }
  }


  private nextPage() {
    if (this.current_page < this.numPages()) {
      this.current_page++;
      this.loadList();
    }
  }


  private loadList() {
    let begin = ((this.current_page - 1) * this.items_per_page);
    let end = begin + this.items_per_page;
    this.pageList = this.listFiltered.slice(begin, end);
    this.appendTable(this.pageList);
    this.check();       // determines the states of the pagination buttons
  }

  private check() {
    if (<HTMLInputElement>document.getElementById("next")) {
      (<HTMLInputElement>document.getElementById("next")).disabled = this.current_page == this.numPages() ? true : false;
      (<HTMLInputElement>document.getElementById("previous")).disabled = this.current_page == 1 ? true : false;
    }
    let htmlPages = (<HTMLInputElement>document.getElementById("page"));
    let pageNumber = "";
    let n = this.numPages();
    let numberOfDisplayNumber = 3;
    let nbrAfterAndBeforeCurrent = (numberOfDisplayNumber - 1) / 2;
    let begin = this.current_page - nbrAfterAndBeforeCurrent <= 1 ? 1 : this.current_page + nbrAfterAndBeforeCurrent >= n ? n - numberOfDisplayNumber + 1 : this.current_page - nbrAfterAndBeforeCurrent;
    let end = begin + numberOfDisplayNumber - 1 >= n ? n : begin + numberOfDisplayNumber - 1;
    if (begin > 1) pageNumber += `<span class="${styles.pagination}" style="color:#700d1f"  id="pn${1}" >` + 1 + `</span>`;
    if (begin > 2) pageNumber += `<span > ... </span>`;
    for (let i = begin; i <= end; i++) {
      let bg = this.current_page === i ? "#700d1f" : "#fff";
      let color = this.current_page === i ? "#fff" : "#700d1f";
      pageNumber += `<span class="${styles.pagination}" style="background:` + bg + `;color:` + color + `" id="pn${i}" >` + i + `</span>`;
    }
    if (end < (n - 1)) pageNumber += `<span  > ... </span>`;
    if (end < n) pageNumber += `<span class="${styles.pagination}" style="color:#700d1f"  id="pn${n}" >` + n + `</span>`;
    htmlPages.innerHTML = pageNumber;
    for (let i = begin; i <= end; i++) {
      document.getElementById("pn" + i).addEventListener('click', () => this.page_per_number(i));
    }
    if (begin > 1) document.getElementById("pn" + 1).addEventListener('click', () => this.page_per_number(1));
    if (end < n) document.getElementById("pn" + n).addEventListener('click', () => this.page_per_number(n));
  }


  public page_per_number(n:any) {
    this.current_page = n;
    this.loadList();
  }


  public render(): void {
    this.domElement.innerHTML = `<div class="${styles.dashboardDemandeur}">
          <div class="${styles.title}"><strong>Filtres</strong></div>
          <div class="${styles.filters}">
            <label class="${styles.title}">Statut : </label>
            <div class="${styles.statusWrapper}"  id="statusWrapper"></div>
            <label class="${styles.title}">Date de départ : </label>
            <input class="${styles.startDate}" type="date" id="startDate" >
            <label class="${styles.title}">Date de fin : </label>
            <input  class="${styles.startDate}" type="date" id="endDate" >
            <div class="${styles.title}" id="SoldeDeConges"></div>
            <button class="${styles.btnRef}" id=refreshbutton>Rafraichir</button>
          </div>
          <div id="spListContainer" > </div>
          <div class="${styles.paginations}">
            <span id="btn_prev" class="${styles.pagination}">Prev</span>
            <span id="page"></span>
            <span id="btn_next" class="${styles.pagination}">Next</span>
          </div>
          <div id="myModal" class="${styles.modal}"></div>
        </div>`;

    this._setSearchBtnEventHandlers();
    document.getElementById('btn_prev').addEventListener('click', () => this.prevPage());
    document.getElementById('btn_next').addEventListener('click', () => this.nextPage());

  }

  protected onInit(): Promise<void> {
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  public async checkPayroll(establishment: any, transactionNo: any, ID: any) {
    try {
      const response = await fetch("https://apiintra-test.universitecentrale.net:8050/api/services/CheckPayroll", {
        method: 'POST',
        headers: new Headers({ "Authorization": `Basic ${btoa(`testUCG:testUCG`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
        body: JSON.stringify({ "establishment": establishment, "TransactionNo": transactionNo }),
      });
      let test = await response.json();
      console.log(ID, test.data.statut);
      if (test.data.statut != "true") {
        document.getElementById('cancel' + ID).innerHTML = `
          <span class="${styles.btnRefuse} ${styles.icon}" id=${"CancelValidé" + ID}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg></span>`;
        document.getElementById('CancelValidé' + ID).addEventListener('click', () => {
          this.UpdateFromWindowToSharepointField(ID, "RequestStatus", "En cours", 'Annulation');
        });
        let lien = this.context.pageContext.web.absoluteUrl + '/SitePages/Modification-demande-de-conge.aspx?RequestId=' + ID;
        document.getElementById("modify" + ID).innerHTML = `
          <a href="${lien}" id="mylink${ID}">
            <span class="${styles.btnApprove}" id="EditValidé${ID}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
            </svg>
            </span>
          </a>`;
      } else {
        document.getElementById("modify" + ID).innerHTML = `
          <a href="#" id="mylink${ID}">
            <span class="${styles.btnApprove}" id="EditValidé${ID}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
            </svg>
            </span>
          </a>`;
        const modal = document.getElementById("myModalAlert");
        document.getElementById('mylink' + ID).addEventListener('click', (e) => {
          e.preventDefault();
          modal.innerHTML = `
              <div class="${styles.modalContent}">
                <span id="close" class="${styles.close}">&times;</span>
                  <h1 style='text-align:left ; color : #7d2935'>Paie clôturée</h1>
                  <div style='font-size:14px ; color : #615c5d;'>Il n’est pas possible de modifier ou d’annuler votre demande !</div>
              </div>`;
          modal.style.display = 'block';
          document.getElementById("close").addEventListener('click', () => modal.style.display = "none");
        });
        document.getElementById('cancel' + ID).innerHTML = `
          <span class="${styles.btnRefuse}  ${styles.icon}" id=${"CancelValidé" + ID}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg></span>`;
        document.getElementById('CancelValidé' + ID).addEventListener('click', () => {
          modal.innerHTML = `
              <div class="${styles.modalContent}">
                <span id="close" class="${styles.close}">&times;</span>
                  <h1 style='text-align:left ; color : #7d2935'>Paie clôturée</h1>
                  <div style ='font-size:14px ; color : #615c5d;'>Il n’est pas possible de modifier ou d’annuler votre demande !</div>
              </div>`;
          modal.style.display = 'block';
          document.getElementById("close").addEventListener('click', () => modal.style.display = "none");
        });
      }
    } catch (error) {
      console.log(ID, 'error checkPayroll');
      console.log(error);
    }
  }

  private _renderListAsync(): void {
    this.current_page = 1;
    if (Environment.type == EnvironmentType.SharePoint || Environment.type == EnvironmentType.ClassicSharePoint) {
      this._getListData().then((response) => {
        this._renderList(response.value);
        this.domElement.querySelector('#refreshbutton').innerHTML = 'rafraichir';
      });
    }
  }

  private _getListData(): Promise<ISPLists> {
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + "/_api/web/lists/GetByTitle('VacationList')/Items?$expand=Author,AttachmentFiles&$select=*,Author/Title,AttachmentFiles&$filter=AuthorId eq '" + this.context.pageContext.legacyPageContext["userId"] + "'&$orderby=Created desc", SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _renderList(items: ISPList[]): void {

    // date filters
    const startDateElement = (document.getElementById("startDate")) as HTMLSelectElement;
    const startDateValue = startDateElement.value;
    const startDate = new Date(startDateValue);

    const endDateElement = (document.getElementById("endDate")) as HTMLSelectElement;
    const endDateValue = endDateElement.value;
    const endDate = new Date(endDateValue);

    // select box members
    var searchboxVal = '';
    var e = (document.getElementById("spDropdown")) as HTMLSelectElement;

    if (e != undefined && e != null) {
      var sel = e.selectedIndex;
      var opt = e.options[sel];
      searchboxVal = (<HTMLOptionElement>opt).value;
    }
    // select box status
    var statusVal = '';
    var statusElement = (document.getElementById("status")) as HTMLSelectElement;

    if (statusElement != undefined && statusElement != null) {
      sel = statusElement.selectedIndex;
      opt = statusElement.options[sel];
      statusVal = (<HTMLOptionElement>opt).value;
    }

    this.listFiltered = items.filter(item => {
      let date = new Date(item.StartDate);
      let dateF = new Date(item.EndDate);
      const validMember = (searchboxVal == undefined || searchboxVal == null || searchboxVal == '' || searchboxVal === item.Author.Title || searchboxVal === 'Tous');
      const validStartDate = (startDateValue === '' || date.getDate() >= startDate.getDate());
      const validEndDate = (endDateValue === '' || dateF.getDate() <= endDate.getDate());
      const validStatus = (statusVal == undefined || statusVal == null || statusVal == '' || statusVal === item.RequestStatus || statusVal === 'Tous');
      if (validMember && validStartDate && validEndDate && validStatus) {
        return true;
      }
      return false;
    });
    this.loadList();
  }

  private appendTable(items: ISPList[]): void {
    let html: string = '';
    let lien = this.context.pageContext.web.absoluteUrl + '/SitePages/Modification-demande-de-conge.aspx?';
    if (items.length == 0) {
      html += `<div style="text-align:center;"><h4>Aucune données trouvées</h4></div>`;
    } else {
      html += '<table width=100% style="border-collapse: collapse;">';
      html += `<tr><th class="${styles.textCenter}">#</th> <th>Motif d'absence</th><th>Date de début</th><th>Date de fin</th><th>Jours de congés</th><th>Statut d'approbation</th><th></th><th></th></tr>`;

      items.map(item => {
        let date = new Date(item.StartDate);
        let dateDebut = FormatDate(date);
        let dateF = new Date(item.EndDate);
        let dateFin = FormatDate(dateF);
        let Statut = '';
        if (item.RequestStatus == "En cours") {
          Statut = '<div class="' + styles.cercleBleu + '"></div>  ' + item.RequestStatus;
        } else if (item.RequestStatus == "Validé") {
          Statut = '<div class="' + styles.cercleVert + '"></div>  ' + item.RequestStatus;
        } else if (item.RequestStatus == "Rejeté") {
          Statut = '<div class="' + styles.cercleRouge + '"></div>  ' + item.RequestStatus;
        } else if (item.RequestStatus == "Annulé") {
          Statut = '<div class="' + styles.cercleYellow + '"></div>  ' + item.RequestStatus;
        }
        // console.log(new Date(new Date(dateF).getTime() + (60 * 60 * 24 * 1000)), (new Date()), (new Date(dateF).getTime() + (60 * 60 * 24 * 1000)) > (new Date().getTime()));
        html += `
        <tr><td class="${styles.textCenter}">`;
        html += item.AttachmentFiles.length ?
          `<svg version="1.1" class="${styles.icon}" id="file${item.ID}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 512 512" style="height:14px" xml:space="preserve">
                <g><g>
                  <path d="M446.661,37.298c-49.731-49.731-130.641-49.731-180.372,0L76.378,227.208c-5.861,5.861-5.861,15.356,0,21.217
                    c5.861,5.861,15.356,5.861,21.217,0l189.91-189.91c36.865-36.836,101.073-36.836,137.938,0c38.023,38.023,38.023,99.901,0,137.924
                    l-265.184,268.17c-22.682,22.682-62.2,22.682-84.881,0c-23.4-23.4-23.4-61.467,0-84.867l254.576-257.577
                    c8.498-8.498,23.326-8.498,31.825,0c8.776,8.776,8.776,23.063,0,31.84L117.826,400.958c-5.06,5.06-5.06,16.156,0,21.217
                    c5.861,5.861,15.356,5.861,21.217,0l243.952-246.954c20.485-20.485,20.485-53.789,0-74.273c-19.839-19.839-54.449-19.81-74.258,0
                    L54.161,358.524c-34.826,34.826-34.826,92.474,0,127.301C71.173,502.837,93.781,512,117.825,512s46.654-9.163,63.651-26.174
                    L446.66,217.655C496.391,167.924,496.391,87.028,446.661,37.298z"/>
                </g></g>
              </svg>`: '';
        html += `</td>
          <td>${item.CtgVacation} ${item.TrancheHoraire === '1' ? 'matin' : item.TrancheHoraire === '2' ? 'après midi' : ''}</td>
          <td>${dateDebut} </td>
          <td>${dateFin} </td>
          <td>${item.NbrDays}</td>
          <td class='${styles.statut}'>${Statut}</td>
          ${item.RequestStatus == "En cours" ? `
          <td>
            <a href="${lien + 'RequestId=' + item.ID}">
              <span class="${styles.btnApprove}" id="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                </svg>
              </span>
            </a>
          </td>
          <td>
            <span class="${styles.btnRefuse}" id=${"Cancel" + item.ID}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg></span>
          </td>`
            : item.RequestStatus == "Validé" && item.IdERP ?
              `<td id='modify${item.ID}'></td>
              <td id='cancel${item.ID}'></td>` : '<td></td><td></td>'}
              </tr>`;
      });
      html += `</table><div id="myModalAlert" class="${styles.modalAlert}"></div></div>`;
    }

    const listContainer: Element = this.domElement.querySelector('#spListContainer');
    listContainer.innerHTML = html;
    for (let i = 0; i < items.length; i++) {
      let item: any = items[i];
      if (item.AttachmentFiles.length) {
        document.getElementById("file" + item.ID).addEventListener('click', () => this.appendFiles(item.AttachmentFiles));
      }
      if (item.RequestStatus == 'En cours') {
        document.getElementById('Cancel' + item.ID).addEventListener('click', () => {
          this.UpdateFromWindowToSharepointField(item.ID, "RequestStatus", "Annulé", "");
        });
      }
      if (item.RequestStatus == 'Validé' && item.IdERP) {
        this.checkPayroll(item.establishment, item.IdERP, item.ID);
      }
    }
  }


  private appendFiles(AttachmentFiles: any): void {
    console.log('popup', AttachmentFiles);
    const modal = document.getElementById("myModal");
    let html = `<div class="${styles.modalContent1}">
                  <span id="close" class="${styles.close}">&times;</span>
                  <p class="${styles.titleComment}">Attachement :</p>`;
    AttachmentFiles.forEach((AttachmentFile: any) => {
      html += `<div class="${styles.linkFile}"><a target="_blank" href="${AttachmentFile.ServerRelativeUrl}">
                <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="width: 13px;margin-right: 4px;" xml:space="preserve">
                  <g><g><path d="M382.56,233.376C379.968,227.648,374.272,224,368,224h-64V16c0-8.832-7.168-16-16-16h-64c-8.832,0-16,7.168-16,16v208h-64c-6.272,0-11.968,3.68-14.56,9.376c-2.624,5.728-1.6,12.416,2.528,17.152l112,128c3.04,3.488,7.424,5.472,12.032,5.472c4.608,0,8.992-2.016,12.032-5.472l112-128C384.192,245.824,385.152,239.104,382.56,233.376z"/></g></g>
                  <g><g><path d="M432,352v96H80v-96H16v128c0,17.696,14.336,32,32,32h416c17.696,0,32-14.304,32-32V352H432z"/></g></g>
                </svg>${this.decodeName(AttachmentFile.FileName)}</a></div>`;
    });
    html += `</div>`;
    modal.innerHTML = html;
    modal.style.display = "block";
    document.getElementById("close").addEventListener('click', () => modal.style.display = "none");
    window.addEventListener('click', (e) => {
      if (e.target == modal) {
        modal.style.display = "none";
      }
    });
  }

  private decodeName(name: any) {
    var extention = name.split('.').pop();
    var decodedFileName = atob(name.split('.').slice(0, -1).join('.')) + '.' + extention;
    return decodedFileName;
  }

  public async UpdateFromWindowToSharepointField(ID: any, Field: any, Value: any, ModificationRequest: any) {

    // //console.log("ReactionsContent",Reaction.toString())
    // const spOpts: ISPHttpClientOptions = {
    //  body: "{ '"+ Field +"':'" + Value + "' }"
    // };
    // const response = await this.context.spHttpClient.post(this.context.pageContext.web.serverRelativeUrl + "/_api/web/lists/GetByTitle('VacationList')/items("+ID+")",
    //   SPHttpClient.configurations.v1,
    //   spOpts);
    // const responseJSON = await response.json();
    // console.log('updateresponse ',responseJSON)

    // document.getElementById(ElementID).innerHTML = "Chargement..."
    this.context.spHttpClient.post(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('VacationList')/items(${ID})`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata',
          'odata-version': '',
          'IF-MATCH': '*',
          'X-HTTP-Method': 'MERGE'
        },
        body: "{ '" + Field + "':'" + Value + "' , 'Manager1Approval':'En cours','ModificationRequest':'" + ModificationRequest + "'  }"
      }).then((response: SPHttpClientResponse): void => {
        console.log("update ", response);
        this.render();
      });
  }

  private _setSearchBtnEventHandlers(): void {
    this.domElement.querySelector('#refreshbutton').addEventListener('click', () => {
      this.domElement.querySelector('#refreshbutton').innerHTML = 'loading...';
      this._renderListAsync();
    });
    this.domElement.querySelector('#statusWrapper').addEventListener('change', () => {
      this._renderListAsync();
    });
    this.domElement.querySelector('#startDate').addEventListener('change', () => {
      this._renderListAsync();
    });
    this.domElement.querySelector('#endDate').addEventListener('change', () => {
      this._renderListAsync();
    });
  }

  public createDropDown(id: string, items: string[]): string {
    let dropdown: string = `<select class="btnw" id="${id}">`;
    items.forEach(option => dropdown += `<option id="${option}">${option}</option>`);
    dropdown += `</select>`;
    return dropdown;
  }
  
}
