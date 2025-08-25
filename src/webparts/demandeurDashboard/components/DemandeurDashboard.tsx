import * as React from 'react';
import styles from './DemandeurDashboard.module.scss';
import { IDemandeurDashboardProps } from './IDemandeurDashboardProps';
import { DefaultPalette, Dropdown, IDropdownStyles, AnimationClassNames, DatePicker, mergeStyleSets, ComboBox } from 'office-ui-fabric-react';
import { Web } from '@pnp/sp/webs';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import { convertDateFormat, exportJsonToExcel, getCurrentDate, getOrderFilter, updateString } from '../../../tools/FunctionTools';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import SweetAlert2 from 'react-sweetalert2';
import { getFamily } from '../../../services/getAllProductFamily';
var img = require('../../../image/UCT_image.png');

export default class DemandeurDashboard extends React.Component<IDemandeurDashboardProps, {}> {

  public state = {

    currentPage: 1,
    itemsPerPage: 10,
    FamilleFilter: '',
    StatusFilter: '',

    openDetailsDiv: false,
    listDemandeData: [] as any,
    detailsListDemande: [] as any,
    historiqueDemande: [] as any,
    cancelPopUp: false,
    demandeSelectedID: 0,
    showSpinner: true,
    filenames: [],
    isOpen: false,
    currentAccordion: 0,
    RemplacantPoUp: false,
    startDate: null,
    endDate: null,
    replacedBy: [] as any,
    replacedByUserName: "",
    checkActionCurrentUser: true,
    showAnotePopUp: false,
    showValidationPopUpRemplaçant: false,
    spinnerAction: false,
    disableButton: true,
    disableRemplacantButtonLoader: false
  };

  // private showContent = (e) => {
  //   this.setState({
  //     content: !this.state.content
  //   });
  // };

  handleNextPage = () => {
    const { currentPage } = this.state;
    const totalPages = Math.ceil(this.getFilteredData().length / this.state.itemsPerPage);
    if (currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    }
  };

  getFilteredData = () => {
    const { listDemandeData, FamilleFilter, StatusFilter } = this.state;
    if (FamilleFilter.length > 0 || StatusFilter.length > 0) {
      return listDemandeData.filter((item) => {
        return item.FamilleProduit.toLowerCase().includes(FamilleFilter.toLowerCase()) &&
          item.StatusDemande.toString().includes(StatusFilter);
      });
    }
    return listDemandeData;
  };

  handlePrevPage = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      this.setState({ currentPage: currentPage - 1 });
    }
  };


  handlePageClick = (page: any) => {
    this.setState({ currentPage: page });
  };


  private rejectDemande = async (demandeID: any) => {
    if (demandeID > 0) {
      this.setState({ spinnerAction: true, disableButton: false })
      const updateDemande = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeID).update({
        StatusDemande: "Annuler"
      })
      const list = Web(this.props.url).lists.getByTitle('HistoriqueDemande');
      const historyData = await list.items.filter(`DemandeID eq ${demandeID}`).get();
      if (historyData.length > 0) {
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande Annulée par le demandeur" + " le " + getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        })
        const WorkflowApprobationData = await Web(this.props.url).lists.getByTitle('WorkflowApprobation').items.filter(`DemandeID eq ${demandeID}`).get();
        const resultWorkflowApprobationData = await Web(this.props.url).lists.getByTitle('WorkflowApprobation').items.getById(WorkflowApprobationData[0].ID).delete();
        window.location.reload()
      }
    }
  }


  private openDetailsDiv = async (demandeID: any) => {
    const selectedDemande = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeID).get();
    console.log(selectedDemande)
    const historiqueDemande = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.filter(`DemandeID eq '${demandeID}'`).get();
    var historiqueActions
    if (historiqueDemande.length === 1) {
      historiqueActions = JSON.parse(historiqueDemande[0].Actions)
      // console.log(historiqueActions)
    }
    const filenames = await this.getAttachementFileName(demandeID)
    this.setState({ openDetailsDiv: true, detailsListDemande: selectedDemande, historiqueDemande: historiqueActions, filenames: filenames })
  }


  // Check if the current user in list of remplaçant if true get the list of demands of the other demander
  private checkRemplacantDemandes = async (): Promise<any[]> => {
    try {
      const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to midnight      

      const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
        .filter(`RemplacantId eq ${currentUserID} and TypeRemplacement eq 'D'`)
        .orderBy('Created', false)
        .top(1)
        .get();

      if (remplacantTest.length > 0) {
        const item = remplacantTest[0];
        const dateDeDebut = new Date(item.DateDeDebut);
        const dateDeFin = new Date(item.DateDeFin);

        dateDeDebut.setHours(0, 0, 0, 0); // Normalize to midnight
        dateDeFin.setHours(0, 0, 0, 0); // Normalize to midnight


        // Ensure the dates are valid
        if (!isNaN(dateDeDebut.getTime()) && !isNaN(dateDeFin.getTime())) {
          const isNowInRange = now >= dateDeDebut && now <= dateDeFin;

          console.log(`Is now within the range: ${isNowInRange}`);
          if (isNowInRange) {
            console.log(remplacantTest);
            return remplacantTest;
          } else {
            return []
          }
        }
      } else return []


    } catch (error) {
      console.error("Error checking remplacant demandes:", error);
      return [];
    }

  }


  private checkUserActions = async () => {
    const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to midnight
    const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
      .filter(`DemandeurId eq ${currentUserID} and TypeRemplacement eq 'D'`)
      .orderBy('Created', false)
      .top(1)
      .get();
    console.log(remplacantTest)

    if (remplacantTest.length > 0) {
      const item = remplacantTest[0];
      const dateDeDebut = new Date(item.DateDeDebut);
      const dateDeFin = new Date(item.DateDeFin);

      dateDeDebut.setHours(0, 0, 0, 0); // Normalize to midnight
      dateDeFin.setHours(0, 0, 0, 0); // Normalize to midnight


      // Ensure the dates are valid
      if (!isNaN(dateDeDebut.getTime()) && !isNaN(dateDeFin.getTime())) {
        const isNowInRange = now >= dateDeDebut && now <= dateDeFin;

        console.log(`Is now within the range: ${isNowInRange}`);
        if (isNowInRange) {
          this.setState({ checkActionCurrentUser: false, showAnotePopUp: true });
        } else {
          console.log(`Now (${now}) is NOT within the range of start date (${dateDeDebut}) and end date (${dateDeFin}).`);
        }


      }
    }
  }


  private getDemandeListData = async () => {
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
    let listDemandeData;
    const checkRemplacant = await this.checkRemplacantDemandes();

    if (checkRemplacant.length > 0) {
      const demandeurId = checkRemplacant[0].DemandeurId;
      listDemandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items
        .filter(`DemandeurId eq ${currentUserID} or DemandeurId eq ${demandeurId}`)
        .orderBy('Created', false)
        .top(1000)
        .get();
    } else {
      listDemandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items
        .filter(`DemandeurId eq ${currentUserID}`)
        .orderBy('Created', false)
        .top(1000)
        .get();
    }

    console.log(listDemandeData);
    this.setState({ listDemandeData });
  }



  private clearFilterButton = () => {
    this.setState({ StatusFilter: '', FamilleFilter: '' });
  }


  public convertDateType = (dateInput: any) => {
    var date = new Date(dateInput);
    const formattedDate = date.toLocaleDateString('en-GB');
    return formattedDate;
  }


  public getDateFormListJSON = (produits: any) => {
    var listProduits = JSON.parse(produits)
    return listProduits
  }

  // open attachement file for each request with an attachement file
  private openAttachementFile = async (itemID: number) => {
    if (itemID > 0) {
      const itemData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(itemID).select("AttachmentFiles").expand("AttachmentFiles").get().then(item => {
        const attachmentFiles = item.AttachmentFiles;
        if (attachmentFiles.length > 0) {

          const attachmentUrl = attachmentFiles[0].ServerRelativeUrl;
          const currentURL = this.props.url
          const tenantUrl = currentURL.split("/sites/")[0];

          const absoluteUrl = `${tenantUrl}${attachmentUrl}`;

          window.open(absoluteUrl, "_blank");
        }
      }).catch(error => {
        console.log(error);
      });
      console.log(itemData)
    }
  }

  private downloadAttachmentFile = async (itemID: number, index) => {
    if (itemID > 0) {
      try {
        const itemData = await Web(this.props.url)
          .lists.getByTitle("DemandeAchat")
          .items.getById(itemID)
          .select("AttachmentFiles")
          .expand("AttachmentFiles")
          .get();

        const attachmentFiles = itemData.AttachmentFiles;

        if (attachmentFiles.length > 0) {
          const attachmentUrl = attachmentFiles[index].ServerRelativeUrl;
          const currentURL = this.props.url;
          const tenantUrl = currentURL.split("/sites/")[0];

          const absoluteUrl = `${tenantUrl}${attachmentUrl}`;

          // Create a hidden link to trigger the download
          const downloadLink = document.createElement("a");
          downloadLink.href = absoluteUrl;
          downloadLink.download = attachmentFiles[index].FileName; // Use the original file name
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      } catch (error) {
        console.log("Error downloading attachment file:", error);
      }
    }
  };


  // Get attachement files from item by her ID
  private getAttachementFileName = async (demandeID) => {
    const attachmentFiles = await Web(this.props.url).lists.getByTitle('DemandeAchat').items.getById(demandeID).attachmentFiles.get();

    // Extract file names from the attachment files
    const fileNames = attachmentFiles.map((attachment) => attachment.FileName);
    return fileNames
  }


  toggleAccordion = (Accordionindex) => {
    var isStatePrev = this.state.isOpen
    console.log(Accordionindex)

    this.setState({ isOpen: !isStatePrev, currentAccordion: Accordionindex })
  };

  // get new user when we change a new user in "Remplacé Par" 
  public _getPeoplePickerItems = async (items: any[]) => {
    if (items.length > 0) {
      if (items[0].id && items[0].text && items[0].secondaryText) {
        let replacedUserData = { ID: items[0].id, name: items[0].text, email: items[0].secondaryText }
        this.setState({ replacedBy: [replacedUserData] })
        this.setState({ replacedByUserName: items[0].text })
      }
    } else {
      this.setState({ replacedBy: [] })
      this.setState({ replacedByUserName: "" })
    }
  }

  private selectedDate = (year, month, day, startOrEndDate) => {
    if (startOrEndDate) {
      const date = year.toString() + "-" + month.toString() + "-" + day.toString();
      const newDateFormat = new Date(date);
      this.setState({ startDate: newDateFormat })
    } else {
      const date = year.toString() + "-" + month.toString() + "-" + day.toString();
      const newDateFormat = new Date(date);
      console.log('new Date format', newDateFormat)
      this.setState({ endDate: newDateFormat })
    }
  }

  private getPageNumbers = (totalPages) => {
    const { currentPage } = this.state;
    const maxPagesToShow = 5; // Adjust this number to show more/less page numbers
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    if (currentPage - 1 <= halfPagesToShow) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (totalPages - currentPage <= halfPagesToShow) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    const pageNumbers = [];
    for (let page = startPage; page <= endPage; page++) {
      pageNumbers.push(page);
    }

    return { pageNumbers, totalPages };
  };


  private ajouterAutreDemandeur = async () => {
    const currentUser = (await Web(this.props.url).currentUser.get()).Id;
    const remplacant = this.state.replacedBy[0].ID;
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;

    if (startDate !== null && endDate !== null && remplacant) {
      this.setState({ disableRemplacantButtonLoader: true })


      // Save data in Remplacant Module Achat list
      const data = await Web(this.props.url).lists.getByTitle("RemplacantsModuleAchat").items.add({
        "DemandeurId": currentUser,
        "RemplacantId": remplacant,
        "DateDeDebut": startDate,
        "DateDeFin": endDate,
        "TypeRemplacement": "D"
      });

      this.setState({ RemplacantPoUp: false, showValidationPopUpRemplaçant: true })

    }
  }


  private getAllFamilleDemande = async () => {
    const familyProducts = await getFamily();
  }



  async componentDidMount() {
    this.checkUserActions();
    this.getDemandeListData();

    setTimeout(() => {
      this.setState({ showSpinner: false });
    }, 4000);
  }


  public render(): React.ReactElement<IDemandeurDashboardProps> {
    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };
    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });


    const { currentPage, itemsPerPage, listDemandeData, FamilleFilter, StatusFilter } = this.state;
    var filteredData
    if (FamilleFilter.length > 0 || StatusFilter.length > 0) {
      console.log(FamilleFilter)
      console.log(StatusFilter)
      const orderFilter = getOrderFilter(FamilleFilter, StatusFilter)
      if (orderFilter === 1) {
        filteredData = listDemandeData
      } else if (orderFilter === 2) {
        filteredData = listDemandeData.filter((item: any) => {
          return item.StatusDemande.toString().includes(StatusFilter);
        });
      } else if (orderFilter === 3) {
        filteredData = listDemandeData.filter((item: any) => {
          return item.FamilleProduit.toLowerCase().includes(FamilleFilter.toLowerCase());
        });
      } else {
        filteredData = listDemandeData.filter((item: any) => {
          return item.FamilleProduit.toLowerCase().includes(FamilleFilter.toLowerCase()) && item.StatusDemande.toString().includes(StatusFilter);
        });
      }
    } else {
      filteredData = listDemandeData
    }

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const { pageNumbers } = this.getPageNumbers(totalPages);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    console.log('test date :', new Date().toISOString())

    return (
      <div className={styles.demandeurDashboard}>
        <div className={styles.title}><strong>Filtres</strong></div>
        <div className={styles.filters}>
          <label className={styles.title}>Famille demande : </label>
          <div className={styles.statusWrapper}>
            <ComboBox
              styles={dropdownStyles}
              placeholder="Selectionner votre famille"
              options={[
                { key: 'TOUS', text: 'TOUS' },
                { key: 'MATERIEL INFORMATIQUE', text: 'MATERIEL INFORMATIQUE' },
                { key: 'SOFTWARE', text: 'SOFTWARE' },
                { key: 'CONSOMATION LABO/STUDIO', text: 'CONSOMATION LABO/STUDIO' },
                { key: 'QUIAINCAILLERIE', text: 'QUIAINCAILLERIE' },
                { key: 'PRODUIT DE NETTOYAGE', text: 'PRODUIT DE NETTOYAGE' },
                { key: 'PUBLICITE', text: 'PUBLICITE' },
                { key: 'RESTAURATION / PATISSERIE', text: 'RESTAURATION / PATISSERIE' },
                { key: 'SEJOUR ET BILLETERIE', text: 'SEJOUR ET BILLETERIE' },
                { key: 'ENTRETIEN & REPARATION', text: 'ENTRETIEN & REPARATION' },
                { key: 'MATERIEL PEDAGOGIQUE  DE FORMATION', text: 'MATERIEL PEDAGOGIQUE  DE FORMATION' },
                { key: 'FOURNITURE DE BUREAU', text: 'FOURNITURE DE BUREAU' },
                { key: 'DOCUMENTS IMPRIMABLE', text: 'DOCUMENTS IMPRIMABLE' },
                { key: 'MEUBLES ET MOBILIERS SCOLAIRES', text: 'MEUBLES ET MOBILIERS SCOLAIRES' },
                { key: 'ETUDE, CONSULTING ,ASSISTANCE ET FORMATION', text: 'ETUDE, CONSULTING ,ASSISTANCE ET FORMATION' },
                { key: 'ARTICLES DE SPORT', text: 'ARTICLES DE SPORT' },
                { key: 'MATERIEL DE TRANSPORT', text: 'MATERIEL DE TRANSPORT' },
                { key: 'CONSTRUCTION ET AMENAGEMENT', text: 'CONSTRUCTION ET AMENAGEMENT' },
                { key: 'ACHATS DIVERS', text: 'ACHATS DIVERS' },
                { key: 'HONORAIRES ET INTERMEDIATIONS', text: 'HONORAIRES ET INTERMEDIATIONS' },
                { key: 'ASSURANCES', text: 'ASSURANCES' },
                { key: 'MATERIEL DE SECURITE', text: 'MATERIEL DE SECURITE' },
                { key: 'GARDIENNAGE', text: 'GARDIENNAGE' },
                { key: 'NETTOYAGE', text: 'NETTOYAGE' },
                { key: 'CARBURANT', text: 'CARBURANT' },
                { key: 'SERVICE', text: 'SERVICE' },
                { key: 'Achat stocké', text: 'Achat stocké' },
                { key: 'Articles de vacation', text: 'Articles de vacation' },
              ]}
              selectedKey={this.state.FamilleFilter}
              onChange={(event, option) => this.setState({ FamilleFilter: option.key, currentPage: 1 })}
              style={{ width: '194.49px' }}
              useComboBoxAsMenuWidth
              allowFreeform
              autoComplete="on"
            />
          </div>
          <label className={styles.title}>Statut : </label>
          <div className={styles.statusWrapper}>
            <ComboBox
              styles={dropdownStyles}
              placeholder="Selectionner votre status"
              options={[
                { key: 'TOUS', text: 'TOUS' },
                { key: 'En cours', text: 'En cours' },
                { key: 'Rejetée', text: 'Rejetée' },
                { key: 'A modifiée', text: 'A modifiée' },
                { key: 'Approuvée', text: 'Approuvée' },
              ]}
              selectedKey={this.state.StatusFilter}
              onChange={(event, option) => this.setState({ StatusFilter: option.key, currentPage: 1 })}
              style={{ width: '189.84px' }} // Specify the width you desire
              useComboBoxAsMenuWidth
              allowFreeform
              autoComplete="on"
            />
          </div>
          <div className={styles.statusWrapper}>
            <button className={styles.btnRef} onClick={() => this.clearFilterButton()}>Rafraichir</button>
            &nbsp;
            <button className={styles.btnRef} onClick={() => window.open("https://universitecentrale.sharepoint.com/sites/Intranet-preprod/SitePages/FormulaireDemandeAchat.aspx")}>Creer une demande</button>
            &nbsp;
            <button
              className={styles.btnRef}
              onClick={() => exportJsonToExcel(filteredData, "dashboard-demandeur-module-achat.xlsx")}
              // onClick={() => exportJsonToExcel(filteredData, "dashboard-demandeur-module-achat.xlsx", "Demandeur")}
              title="Exporter les données au format Excel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 50 50">
                <path d="M 28.8125 0.03125 L 0.8125 5.34375 C 0.339844 5.433594 0 5.863281 0 6.34375 L 0 43.65625 C 0 44.136719 0.339844 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 28.875 49.980469 28.9375 50 29 50 C 29.230469 50 29.445313 49.929688 29.625 49.78125 C 29.855469 49.589844 30 49.296875 30 49 L 30 1 C 30 0.703125 29.855469 0.410156 29.625 0.21875 C 29.394531 0.0273438 29.105469 -0.0234375 28.8125 0.03125 Z M 32 6 L 32 13 L 34 13 L 34 15 L 32 15 L 32 20 L 34 20 L 34 22 L 32 22 L 32 27 L 34 27 L 34 29 L 32 29 L 32 35 L 34 35 L 34 37 L 32 37 L 32 44 L 47 44 C 48.101563 44 49 43.101563 49 42 L 49 8 C 49 6.898438 48.101563 6 47 6 Z M 36 13 L 44 13 L 44 15 L 36 15 Z M 6.6875 15.6875 L 11.8125 15.6875 L 14.5 21.28125 C 14.710938 21.722656 14.898438 22.265625 15.0625 22.875 L 15.09375 22.875 C 15.199219 22.511719 15.402344 21.941406 15.6875 21.21875 L 18.65625 15.6875 L 23.34375 15.6875 L 17.75 24.9375 L 23.5 34.375 L 18.53125 34.375 L 15.28125 28.28125 C 15.160156 28.054688 15.035156 27.636719 14.90625 27.03125 L 14.875 27.03125 C 14.8125 27.316406 14.664063 27.761719 14.4375 28.34375 L 11.1875 34.375 L 6.1875 34.375 L 12.15625 25.03125 Z M 36 20 L 44 20 L 44 22 L 36 22 Z M 36 27 L 44 27 L 44 29 L 36 29 Z M 36 35 L 44 35 L 44 37 L 36 37 Z"></path>
              </svg>
            </button>
          </div>
          {this.state.checkActionCurrentUser && <button className={styles.btnRef} onClick={() => this.setState({ RemplacantPoUp: !this.state.RemplacantPoUp })}>Choisir un remplaçant</button>}
        </div>
        <div className={styles.paginations} style={{ textAlign: 'center' }}>
          {this.state.showSpinner && <span className={styles.loader}></span>}
        </div>
        {(listDemandeData.length === 0 && !this.state.showSpinner) && <div style={{ textAlign: 'center' }}><h4>Aucune données trouvées</h4></div>}
        {(listDemandeData.length > 0 && !this.state.showSpinner) &&
          <div id="spListContainer">
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tr><th className={styles.textCenter}>#</th> <th>№</th><th>Famille demande</th><th>Centre de gestion</th><th>Date de la Demande</th><th>Statut de la demande</th><th>Date d'approbation final</th>{this.state.checkActionCurrentUser && <th>Action</th>}<th>Détail</th></tr>
              {currentItems.map((demande: any, index: any) =>
                <tr>
                  {console.log(demande)}
                  <td>
                    {demande.Attachments && <svg onClick={() => this.openAttachementFile(demande.ID)} version="1.1" className="icon_03c0be98" id="file162" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{ "height": "14px", "cursor": "pointer" }} xmlSpace="preserve">
                      <g>
                        <g>
                          <path d="M446.661,37.298c-49.731-49.731-130.641-49.731-180.372,0L76.378,227.208c-5.861,5.861-5.861,15.356,0,21.217
                          c5.861,5.861,15.356,5.861,21.217,0l189.91-189.91c36.865-36.836,101.073-36.836,137.938,0c38.023,38.023,38.023,99.901,0,137.924
                          l-265.184,268.17c-22.682,22.682-62.2,22.682-84.881,0c-23.4-23.4-23.4-61.467,0-84.867l254.576-257.577
                          c8.498-8.498,23.326-8.498,31.825,0c8.776,8.776,8.776,23.063,0,31.84L117.826,400.958c-5.06,5.06-5.06,16.156,0,21.217
                          c5.861,5.861,15.356,5.861,21.217,0l243.952-246.954c20.485-20.485,20.485-53.789,0-74.273c-19.839-19.839-54.449-19.81-74.258,0
                          L54.161,358.524c-34.826,34.826-34.826,92.474,0,127.301C71.173,502.837,93.781,512,117.825,512s46.654-9.163,63.651-26.174
                          L446.66,217.655C496.391,167.924,496.391,87.028,446.661,37.298z">
                          </path>
                        </g>
                      </g>
                    </svg>}
                  </td>
                  <td>{demande.Id}</td>
                  <td>{demande.FamilleProduit}</td>
                  <td>{demande.CentreDeGestion}</td>
                  <td>{convertDateFormat(demande.Created)}</td>
                  <td className={styles.statut}>
                    {(demande.StatusDemande.includes("En cours")) && (
                      <>
                        <div className={styles.cercleBleu}></div>
                        &nbsp;{demande.StatusDemande}
                      </>
                    )}
                    {(demande.StatusDemande.includes("Rejetée")) && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{demande.StatusDemande}
                      </>
                    )}
                    {(demande.StatusDemande.includes("Annuler")) && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{updateString(demande.StatusDemande)}
                      </>
                    )}
                    {demande.StatusDemande.includes("A modifiée") && (
                      <>
                        <div className={styles.cercleVert}></div>
                        &nbsp;{demande.StatusDemande}
                      </>
                    )}
                    {(demande.StatusDemande.includes("Approuvée")) && (
                      <>
                        <div className={styles.cercleYellow}></div>
                        &nbsp;{demande.StatusDemande}
                      </>
                    )}
                  </td>
                  <td>
                    {demande.DateStatusDemandeV4 !== null
                      ? convertDateFormat(this.state.detailsListDemande.DateStatusDemandeV4)
                      : "N/A"}
                  </td>
                  {this.state.checkActionCurrentUser && (<>
                    <td>
                      {(demande.StatusDemande.includes("En cours")) && (
                        <>
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                            </svg>
                          </span>
                          &nbsp;
                          {demande.StatusDemandeV1.includes("En cours") ? (
                            <span>
                              <svg
                                onClick={() =>
                                  this.setState({ cancelPopUp: true, demandeSelectedID: demande.ID })
                                }
                                style={{ cursor: "pointer" }}
                                color="red"
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-x-square"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
                                />
                                <path
                                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                                />
                              </svg>
                            </span>
                          ) : (
                            <span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-x-square"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
                                />
                                <path
                                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                                />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                      {(demande.StatusDemande.includes("Rejetée")) && (
                        <>
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                            </svg>
                          </span>
                          &nbsp;
                          <span>
                            <svg color="gray" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                          </span>
                        </>
                      )}
                      {(demande.StatusDemande.includes("A modifiée")) && (
                        <>
                          <span onClick={() => window.open("https://universitecentrale.sharepoint.com/sites/Intranet-preprod/SitePages/updateFormDemandeAchat.aspx?itemID=" + demande.ID)}>
                            <svg style={{ cursor: "pointer" }} color='blue' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                            </svg>
                          </span>
                          &nbsp;
                          <span>
                            <svg color="gray" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                          </span>
                        </>
                      )}
                      {(demande.StatusDemande.includes("Approuvée")) && (
                        <>
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                            </svg>
                          </span>
                          &nbsp;
                          <span>
                            <svg color="gray" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                          </span>
                        </>
                      )}
                      {(demande.StatusDemande.includes("Annuler")) && (
                        <>
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                            </svg>
                          </span>
                          &nbsp;
                          <span>
                            <svg color="gray" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                          </span>
                        </>
                      )}
                    </td>
                  </>)}
                  <td>
                    <span className={styles.icon}>
                      <svg onClick={() => this.openDetailsDiv(demande.ID)} version="1.1" id="Capa_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{ height: "16px", width: "16px" }} xmlSpace="preserve">
                        <g>
                          <g>
                            <path d="M414.007,148.75c5.522,0,10-4.477,10-10V30c0-16.542-13.458-30-30-30h-364c-16.542,0-30,13.458-30,30v452
                            c0,16.542,13.458,30,30,30h364c16.542,0,30-13.458,30-30v-73.672c0-5.523-4.478-10-10-10c-5.522,0-10,4.477-10,10V482
                            c0,5.514-4.486,10-10,10h-364c-5.514,0-10-4.486-10-10V30c0-5.514,4.486-10,10-10h364c5.514,0,10,4.486,10,10v108.75
                            C404.007,144.273,408.485,148.75,414.007,148.75z"/>
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M212.007,54c-50.729,0-92,41.271-92,92c0,26.317,11.11,50.085,28.882,66.869c0.333,0.356,0.687,0.693,1.074,1
                            c16.371,14.979,38.158,24.13,62.043,24.13c23.885,0,45.672-9.152,62.043-24.13c0.387-0.307,0.741-0.645,1.074-1
                            c17.774-16.784,28.884-40.552,28.884-66.869C304.007,95.271,262.736,54,212.007,54z M212.007,218
                            c-16.329,0-31.399-5.472-43.491-14.668c8.789-15.585,25.19-25.332,43.491-25.332c18.301,0,34.702,9.747,43.491,25.332
                            C243.405,212.528,228.336,218,212.007,218z M196.007,142v-6.5c0-8.822,7.178-16,16-16s16,7.178,16,16v6.5c0,8.822-7.178,16-16,16
                            S196.007,150.822,196.007,142z M269.947,188.683c-7.375-10.938-17.596-19.445-29.463-24.697c4.71-6.087,7.523-13.712,7.523-21.986
                            v-6.5c0-19.851-16.149-36-36-36s-36,16.149-36,36v6.5c0,8.274,2.813,15.899,7.523,21.986
                            c-11.867,5.252-22.088,13.759-29.463,24.697c-8.829-11.953-14.06-26.716-14.06-42.683c0-39.701,32.299-72,72-72s72,32.299,72,72
                            C284.007,161.967,278.776,176.73,269.947,188.683z"/>
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M266.007,438h-54c-5.522,0-10,4.477-10,10s4.478,10,10,10h54c5.522,0,10-4.477,10-10S271.529,438,266.007,438z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M266.007,382h-142c-5.522,0-10,4.477-10,10s4.478,10,10,10h142c5.522,0,10-4.477,10-10S271.529,382,266.007,382z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M266.007,326h-142c-5.522,0-10,4.477-10,10s4.478,10,10,10h142c5.522,0,10-4.477,10-10S271.529,326,266.007,326z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M88.366,272.93c-1.859-1.86-4.439-2.93-7.079-2.93c-2.631,0-5.211,1.07-7.07,2.93c-1.86,1.86-2.93,4.44-2.93,7.07
                            s1.069,5.21,2.93,7.07c1.87,1.86,4.439,2.93,7.07,2.93c2.64,0,5.21-1.07,7.079-2.93c1.86-1.86,2.931-4.44,2.931-7.07
                            S90.227,274.79,88.366,272.93z"/>
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M88.366,328.93c-1.869-1.86-4.439-2.93-7.079-2.93c-2.631,0-5.2,1.07-7.07,2.93c-1.86,1.86-2.93,4.44-2.93,7.07
                            s1.069,5.21,2.93,7.07c1.87,1.86,4.439,2.93,7.07,2.93c2.64,0,5.21-1.07,7.079-2.93c1.86-1.86,2.931-4.44,2.931-7.07
                            S90.227,330.79,88.366,328.93z"/>
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M88.366,384.93c-1.869-1.86-4.439-2.93-7.079-2.93c-2.631,0-5.2,1.07-7.07,2.93c-1.86,1.86-2.93,4.44-2.93,7.07
                            s1.069,5.21,2.93,7.07c1.859,1.86,4.439,2.93,7.07,2.93c2.64,0,5.22-1.07,7.079-2.93c1.86-1.86,2.931-4.44,2.931-7.07
                            S90.227,386.79,88.366,384.93z"/>
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M266.007,270h-142c-5.522,0-10,4.477-10,10s4.478,10,10,10h142c5.522,0,10-4.477,10-10S271.529,270,266.007,270z" />
                          </g>
                        </g>
                        <g>
                          <g>
                            <path d="M491.002,130.32c-9.715-5.609-21.033-7.099-31.871-4.196c-10.836,2.904-19.894,9.854-25.502,19.569L307.787,363.656
                            c-0.689,1.195-1.125,2.52-1.278,3.891l-8.858,79.344c-0.44,3.948,1.498,7.783,4.938,9.77c1.553,0.896,3.278,1.34,4.999,1.34
                            c2.092,0,4.176-0.655,5.931-1.948l64.284-47.344c1.111-0.818,2.041-1.857,2.73-3.052l125.841-217.963
                            C517.954,167.638,511.058,141.9,491.002,130.32z M320.063,426.394l4.626-41.432l28.942,16.71L320.063,426.394z M368.213,386.996
                            l-38.105-22l100.985-174.91l38.105,22L368.213,386.996z M489.054,177.693l-9.857,17.073l-38.105-22l9.857-17.073
                            c2.938-5.089,7.682-8.729,13.358-10.25c5.678-1.522,11.606-0.74,16.694,2.198c5.089,2.938,8.729,7.682,10.25,13.358
                            C492.772,166.675,491.992,172.604,489.054,177.693z"/>
                          </g>
                        </g>
                      </svg>
                    </span>
                  </td>
                </tr>
              )}
            </table>
          </div>
        }

        {this.state.openDetailsDiv && <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span id="close" className={styles.close} onClick={() => this.setState({ openDetailsDiv: false, isOpen: false, currentAccordion: 0 })}>&times;</span>
            {/* <p className={styles.titleComment}>Détails :</p> */}
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td >Famille :</td>
                  <td className={styles.value}>{this.state.detailsListDemande.FamilleProduit}</td>
                </tr>
                <tr>
                  <td >Article :</td>
                  <td className={styles.value}>
                    {this.getDateFormListJSON(this.state.detailsListDemande.Produit).map((produit, index) => <div className={styles.accordion}>
                      {console.log(produit, index)}
                      <button className={`${styles.accordionButton} ${this.state.isOpen ? styles.active : ''}`} onClick={() => this.toggleAccordion(index)}>
                        <h4>{produit.DescriptionTechnique}</h4>
                      </button>
                      <div className={`${styles.panel} ${(this.state.isOpen && (this.state.currentAccordion === index)) ? styles.panelOpen : ''}`}>
                        <p className={styles.value}><b>Sous Famille:</b> {produit.SousFamille}</p>
                        <p className={styles.value}><b>Beneficiaire:</b> {produit.Beneficiaire}</p>
                        <p className={styles.value}><b>Description Technique:</b> {produit.comment}</p>
                        <p className={styles.value}><b>Prix: </b>{produit.Prix} DT</p>
                        <p className={styles.value}><b>Quantité: </b>{produit.quantité}</p>
                        <p className={styles.value}><b>Prix total: </b>{(parseFloat(produit.quantité) * parseFloat(produit.Prix)).toFixed(2).toString()} DT</p>
                        <p className={styles.value}><b>Délais de livraison souhaité : </b>{produit.DelaiLivraisionSouhaite} Jours</p>
                      </div>
                    </div>)}
                  </td>
                </tr>
                <tr>
                  <td>Prix estimatif Total :</td>
                  <td className={styles.value}>{(parseFloat(this.state.detailsListDemande.PrixTotal).toFixed(2)).toString()} DT</td>
                </tr>
                <tr>
                  <td >Piéce jointe :</td>
                  <td className={styles.value} >
                    {this.state.filenames.map((file, index) => (
                      <>
                        <span key={file} style={{ cursor: 'pointer', color: "black" }} onClick={() => this.downloadAttachmentFile(this.state.detailsListDemande.ID, index)}>
                          - {file}
                        </span>
                        <span key={file} style={{ cursor: 'pointer', color: "black" }} onClick={() => this.downloadAttachmentFile(this.state.detailsListDemande.ID, index)}>
                          <svg style={{ margin: "-9px" }} width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.625 15C5.625 14.5858 5.28921 14.25 4.875 14.25C4.46079 14.25 4.125 14.5858 4.125 15H5.625ZM4.875 16H4.125H4.875ZM19.275 15C19.275 14.5858 18.9392 14.25 18.525 14.25C18.1108 14.25 17.775 14.5858 17.775 15H19.275ZM11.1086 15.5387C10.8539 15.8653 10.9121 16.3366 11.2387 16.5914C11.5653 16.8461 12.0366 16.7879 12.2914 16.4613L11.1086 15.5387ZM16.1914 11.4613C16.4461 11.1347 16.3879 10.6634 16.0613 10.4086C15.7347 10.1539 15.2634 10.2121 15.0086 10.5387L16.1914 11.4613ZM11.1086 16.4613C11.3634 16.7879 11.8347 16.8461 12.1613 16.5914C12.4879 16.3366 12.5461 15.8653 12.2914 15.5387L11.1086 16.4613ZM8.39138 10.5387C8.13662 10.2121 7.66533 10.1539 7.33873 10.4086C7.01212 10.6634 6.95387 11.1347 7.20862 11.4613L8.39138 10.5387ZM10.95 16C10.95 16.4142 11.2858 16.75 11.7 16.75C12.1142 16.75 12.45 16.4142 12.45 16H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM4.125 15V16H5.625V15H4.125ZM4.125 16C4.125 18.0531 5.75257 19.75 7.8 19.75V18.25C6.61657 18.25 5.625 17.2607 5.625 16H4.125ZM7.8 19.75H15.6V18.25H7.8V19.75ZM15.6 19.75C17.6474 19.75 19.275 18.0531 19.275 16H17.775C17.775 17.2607 16.7834 18.25 15.6 18.25V19.75ZM19.275 16V15H17.775V16H19.275ZM12.2914 16.4613L16.1914 11.4613L15.0086 10.5387L11.1086 15.5387L12.2914 16.4613ZM12.2914 15.5387L8.39138 10.5387L7.20862 11.4613L11.1086 16.4613L12.2914 15.5387ZM12.45 16V5H10.95V16H12.45Z" fill="#000000" />
                          </svg>
                        </span>
                      </>
                    ))}
                  </td>
                </tr>
                <tr>
                  <td >Statut actuel :</td>
                  {(this.state.detailsListDemande.StatusDemande.includes("En cours")) && <td className={styles.value}><div className={styles.cercleBleu}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  {(this.state.detailsListDemande.StatusDemande.includes("Approuvée")) && <td className={styles.value}><div className={styles.cercleVert}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  {(this.state.detailsListDemande.StatusDemande.includes("Annuler")) && <td className={styles.value}><div className={styles.cercleRouge}></div> &nbsp; {updateString(this.state.detailsListDemande.StatusDemande)}</td>}
                  {(this.state.detailsListDemande.StatusDemande.includes("Rejetée")) && <td className={styles.value}><div className={styles.cercleRouge}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  {(this.state.detailsListDemande.StatusDemande.includes("A modifiée")) && <td className={styles.value}><div className={styles.cercleYellow}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                </tr>
                <tr>
                  <td>Historique de la demande :</td>
                  <td className={styles.value}>
                    {this.state.historiqueDemande.length < 4 ? (
                      this.state.historiqueDemande.map((action, index) => (
                        <span style={{ 'color': "black" }} key={index}>- {action} <br /></span>
                      ))
                    ) : (
                      <div style={{ maxHeight: '80px', width: '100%', overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#aaa' }}>
                        {this.state.historiqueDemande.map((action, index) => (
                          <span key={index}>- {action} <br /></span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>}

        {!this.state.showSpinner &&
          <div className={styles.paginations}>
            <span
              id="btn_prev"
              className={styles.pagination}
              onClick={this.handlePrevPage}>
              Prev
            </span>

            <span id="page">
              {pageNumbers[0] > 1 && (
                <>
                  <span
                    onClick={() => this.handlePageClick(1)}
                    className={currentPage === 1 ? styles.pagination2 : styles.pagination}
                  >
                    1
                  </span>
                  {pageNumbers[0] > 2 && <span className={styles.pagination}>...</span>}
                </>
              )}

              {pageNumbers.map((page) => (
                <span
                  key={page}
                  onClick={() => this.handlePageClick(page)}
                  className={currentPage === page ? styles.pagination2 : styles.pagination}
                >
                  {page}
                </span>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className={styles.pagination}>...</span>
                  )}
                  <span
                    onClick={() => this.handlePageClick(totalPages)}
                    className={currentPage === totalPages ? styles.pagination2 : styles.pagination}
                  >
                    {totalPages}
                  </span>
                </>
              )}
            </span>

            <span
              id="btn_prev"
              className={styles.pagination}
              onClick={this.handleNextPage}>
              Next
            </span>
          </div>
        }

        {this.state.cancelPopUp &&
          <div className={styles.modalAlert}>
            <div className={styles.modalContent}>
              <span id="close" className={styles.close} onClick={() => this.setState({ cancelPopUp: false, demandeSelectedID: 0 })}>&times;</span>
              <h1 style={{ textAlign: "left", color: "#7d2935" }}>Annulation de demande :</h1>
              <div style={{ fontSize: "14px", "color": "#615c5d" }}>Voulez-vous vraiment annuler cette demmande ?</div>
              <br></br>
              {
                this.state.disableButton && (
                  <div>
                    <button className={styles.btnRef} onClick={() => this.rejectDemande(this.state.demandeSelectedID)}>
                      Annuler la demande
                    </button>
                  </div>
                )
              }

            </div>
          </div>
        }

        {/* PopUp Remplaçant */}
        {this.state.RemplacantPoUp && <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span id="close" className={styles.close} onClick={() => this.setState({ RemplacantPoUp: false })}>&times;</span>
            <h2 style={{ color: "#7d2935" }}> Voulez-vous vraiment Ajouter un autre demandeur ?</h2>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>Mon Remplacant</td>
                  <td>
                    <PeoplePicker
                      // className={styles.value}
                      // styles={dropdownStyles}
                      context={this.props.context}
                      personSelectionLimit={1}
                      required={true}
                      onChange={this._getPeoplePickerItems}
                      defaultSelectedUsers={[this.state.replacedByUserName]}
                      principalTypes={[PrincipalType.User]}
                      resolveDelay={1000}
                      ensureUser={true}
                    />
                  </td>
                </tr>
                <br></br>
                <tr>
                  <td>Date de debut</td>
                  <DatePicker
                    className={controlClass.TextField}
                    placeholder="Du"
                    ariaLabel="Du"
                    value={this.state.startDate}
                    onSelectDate={(e) => { this.selectedDate(e.getFullYear(), e.getMonth() + 1, e.getDate(), true) }}
                    minDate={new Date()}
                  />
                </tr>
                <br></br>
                <tr>
                  <td>Date de fin</td>
                  <DatePicker
                    className={controlClass.TextField}
                    placeholder="Jusqu'a"
                    ariaLabel="Jusqu'a"
                    value={this.state.endDate}
                    onSelectDate={(e) => { this.selectedDate(e.getFullYear(), e.getMonth() + 1, e.getDate(), false) }}
                    minDate={this.state.startDate}
                  />
                </tr>
                <br></br>
                <tr>
                  <td>
                    <button style={{ backgroundColor: !this.state.disableRemplacantButtonLoader ? "#7d2935" : "gray", textAlign: "center" }} disabled={this.state.disableRemplacantButtonLoader} className={styles.btnRef} onClick={() => this.ajouterAutreDemandeur()}>
                      Envoyer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>}

        {(!this.state.checkActionCurrentUser && this.state.showAnotePopUp) && <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => this.setState({ showAnotePopUp: false })}>&times;</span>
            <h3>À noter</h3>
            <ul>
              <li>
                Désolé(e), Monsieur/Madame, vous n'avez pas le droit d'effectuer des actions sur les demandes car vous avez déjà un remplaçant.
                <br></br>
                L'accès aux actions sur les demandes a été affecté à votre remplaçant.
              </li>
            </ul>
            <p> =&gt; Vous pouvez effectuer les actions lorsque la période de remplacement est terminée.</p>
          </div>
        </div>
        }

        <SweetAlert2
          allowOutsideClick={false}
          show={this.state.showValidationPopUpRemplaçant}
          title="Ajouter un remplaçant"
          text="Votre demande d'ajouter un remplaçant est enregistrer avec succés"
          imageUrl={img}
          confirmButtonColor='#7D2935'
          onConfirm={() => window.location.reload()}
          imageWidth="150"
          imageHeight="150"
        />

        {
          this.state.spinnerAction && <div className={styles.paginations} style={{ position: "absolute", top: "38%", right: "50%", transform: "translate(-50%, -50%)" }}>
            <span className={styles.loader}></span>
          </div>
        }

      </div>
    );
  }
}
