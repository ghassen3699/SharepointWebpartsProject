import * as React from 'react';
import styles from './DashboardDemandesRecus.module.scss';
import { IDashboardDemandesRecusProps } from './IDashboardDemandesRecusProps';
import {Dropdown, IDropdownStyles, mergeStyleSets, mergeStyles, DatePicker, TextField } from 'office-ui-fabric-react';
import { Web } from '@pnp/sp/webs';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import GraphService from '../../../services/GraphServices';
import { convertDateFormat, getMatchingIndices, getOrderFilter } from '../../../tools/FunctionTools';


export default class DashboardDemandesRecus extends React.Component<IDashboardDemandesRecusProps, {}> {
  public state = {

    currentPage: 1,
    itemsPerPage: 5,
    DemandeurFilter: '',
    StatusFilter: '',

    openDetailsDiv: false,
    listDemandeData: [] as any,
    listDemandeDataForCurrentUser: [] as any,
    detailsListDemande: [] as any,
    historiqueDemande: [] as any,
    cancelPopUp: false,
    demandeSelectedID: 0,
    DateAction: [],
    disableButtonUpdateDate: true,
    showSpinner: true,
    isOpen: false,
    currentAccordion: 0,
    filenames: [],
    demandeurs: [],
    articlesChangeDateSouhaiter: [],
    disableButtonSaveUpdateDate: true
  };

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


  handleNextPage = () => {
    const { currentPage } = this.state;
    const totalPages = Math.ceil(this.getFilteredData().length / this.state.itemsPerPage);
    if (currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    }
  };

  getFilteredData = () => {
    const { listDemandeData, DemandeurFilter, StatusFilter } = this.state;
    if (DemandeurFilter.length > 0 || StatusFilter.length > 0) {
      return listDemandeData.filter((item) => {
        return item.DemandeurId.toString().toLowerCase().includes(DemandeurFilter.toLowerCase()) &&
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


  handlePageClick = (page:any) => {
    this.setState({ currentPage: page });
  };


  // private handleChangeDate = (date, index) => {
  //   const newDateFormat = new Date(date);
  //   const updatedDateAction = [...this.state.DateAction];
  //   updatedDateAction.splice(index, 0, newDateFormat);
  //   this.setState({ DateAction: updatedDateAction, disableButtonUpdateDate: false });
  // };

  private getNumberOfDaysFromDateAction = (articleIndex) => {
    var listNumberOfDaysData = []
    const listIndexs = getMatchingIndices(this.state.historiqueDemande) ;
    listIndexs.map(historyIndex => {
      listNumberOfDaysData.push(this.state.historiqueDemande[historyIndex])
    })

    const result = {};
    const regex = /article (\d+) aprés (\d+) jour(?:s)?/;

    listNumberOfDaysData.forEach(item => {
      const match = item.match(regex);
      if (match) {
        const idArticle = parseInt(match[1], 10);
        const days = match[2];
        result[idArticle] = days;
      }
    });


    var finalResult = Object.keys(result).map(id => ({
      idArticle: parseInt(id, 10),
      days: result[id]
    }));


    if (finalResult.length === 0){
      return "0"
    }else {
      const dateSouhaiteSaved = finalResult.filter(dates => dates.idArticle === (articleIndex + 1))
      if (dateSouhaiteSaved.length > 0){
        return dateSouhaiteSaved[0].days
      }else return "0"
  
    }
    
  }


  private handleChangeDate = (date, index) => {
    const newDateFormat = date.target.value
    const updatedDateAction = [...this.state.DateAction];
    updatedDateAction.splice(index, 1, newDateFormat);
    this.setState({ DateAction: updatedDateAction, disableButtonUpdateDate: false });
  };


  // En cours
  private submitUpdatesDateSouhaiter = async() => {

    console.log(this.state.articlesChangeDateSouhaiter)
    this.setState({disableButtonSaveUpdateDate: true})
    var DemandeID = this.state.detailsListDemande.ID
    const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
    var resultArray = JSON.parse(historyData[0].Actions);
    this.state.articlesChangeDateSouhaiter.map(articleDate => {
      const date = articleDate.newDateSouhaiter.toString()
      if (parseInt(date) <= 1 ){
        resultArray.push(`L'équipe finance a modifié la date souhaitée de l'article ${articleDate.articleIndex + 1} aprés ${date} jour`);
      }else {
        resultArray.push(`L'équipe finance a modifié la date souhaitée de l'article ${articleDate.articleIndex + 1} aprés ${date} jours`);
      }
    })

    console.log(resultArray)
    const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
      Actions: JSON.stringify(resultArray),
      DelaiLivraisionSouhaite:"Y"
    });
    window.location.reload();

  }

  // private updateDateSouhaite = async (index) => {
  //   var DemandeID = this.state.detailsListDemande.ID
  //   console.log(index)
  //   // Save historique block
  //   const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
  //   if (historyData.length > 0) {
  //     var resultArray = JSON.parse(historyData[0].Actions);
  //     console.log(resultArray)
  //     const date = this.state.DateAction[index].toString()

  //     if (parseInt(date) <= 1 ){
  //       resultArray.push(`L'équipe finance a modifié la date souhaitée de l'article ${index + 1} aprés ${date} jour`);
  //     }else {
  //       resultArray.push(`L'équipe finance a modifié la date souhaitée de l'article ${index + 1} aprés ${date} jours`);
  //     }
  //     const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
  //       Actions: JSON.stringify(resultArray),
  //       DelaiLivraisionSouhaite:"Y"
  //     });

  //     const demandeData = await Web(this.props.url).lists.getByTitle('DemandeAchat').items.filter(`ID eq ${DemandeID}`).get();
  //     console.log(demandeData[0].DateSouhaiteEquipeFinance)
  //     if (demandeData[0].DateSouhaiteEquipeFinance !== null){
  //       var resultDemandeArray = []
  //       resultDemandeArray = JSON.parse(demandeData[0].DateSouhaiteEquipeFinance);
  //       console.log(resultDemandeArray)
  //       let deletedItem = resultDemandeArray.splice(index, 1)[0];
  //       resultDemandeArray.splice(index,0,date);
  //       const saveNewDateSouhaite = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeData[0].ID).update({
  //         DateSouhaiteEquipeFinance: JSON.stringify(resultDemandeArray),
  //       });
  //       window.location.reload();
  //     }else {
  //       var resultDemandeArray = [] ;
  //       resultDemandeArray.push(date)
  //       const saveNewDateSouhaite = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeData[0].ID).update({
  //         DateSouhaiteEquipeFinance: JSON.stringify(resultDemandeArray),
  //       });
  //       window.location.reload();
  //     }
      
  //   };
  // }

  private updateDateSouhaite = async(articleIndex) => {
    console.log('test')
    var newArticlesChangeDateSouhaiter = []
    const date = this.state.DateAction[articleIndex]
    console.log(articleIndex) ;
    const prevArticlesChangeDateSouhaiter = [...this.state.articlesChangeDateSouhaiter] ;
    if (prevArticlesChangeDateSouhaiter.length === 0){
      newArticlesChangeDateSouhaiter.push({
        articleIndex: articleIndex,
        newDateSouhaiter: date
      })
      console.log("1",newArticlesChangeDateSouhaiter)
      this.setState({articlesChangeDateSouhaiter:newArticlesChangeDateSouhaiter})
    }else {
      const updatedUsers = prevArticlesChangeDateSouhaiter.some(
        (article) => article.articleIndex === articleIndex) ? prevArticlesChangeDateSouhaiter.map((article) =>
          article.articleIndex === articleIndex ? { ...article, newDateSouhaiter: date } : article)
        : [...prevArticlesChangeDateSouhaiter, { articleIndex: articleIndex, newDateSouhaiter: date }];
      console.log("2",updatedUsers)
      this.setState({articlesChangeDateSouhaiter:updatedUsers})
    }

    this.setState({disableButtonUpdateDate: !this.state.disableButtonUpdateDate, disableButtonSaveUpdateDate: false})
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
    this.setState({ openDetailsDiv: true, detailsListDemande: selectedDemande, historiqueDemande: historiqueActions })
  }


  private getAllDemandeListData = async () => {
    try {
      const listDemandeData = await Web(this.props.url)
        .lists.getByTitle("DemandeAchat").items
        .top(2000)
        .orderBy("Created", false)
        .expand("Ecole")
        .filter(`
          ((StatusDemandeV1 eq 'Approuvée') and (StatusDemandeV2 eq 'Approuvée') and (StatusDemandeV4 eq 'Approuvée') and ((StatusDemandeV3 eq 'Approuvée') or (StatusDemandeV3 eq '***')))
        `)
        .select("Attachments", "Created", "AuthorId", "DelaiLivraisionSouhaite", "DemandeurId", "DemandeurStringId", "DescriptionTechnique", "Ecole/Title", "Ecole/Ecole", "FamilleProduit", "ID", "Prix", "PrixTotal", "Produit", "Quantite", "SousFamilleProduit", "StatusDemande", "StatusDemandeV1", "StatusDemandeV2", "StatusDemandeV3", "StatusDemandeV4", "Title", "CreerPar", "ReferenceDemande","CentreDeGestion")
        .get();
      this.setState({ listDemandeData });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  // private getDemandeListData = async () => {
  //   var listData = [];
  //   const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
  //   const DemandeIDs = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
  //     .filter(`( (ApprobateurV1/Id eq ${currentUserID} and StatusApprobateurV1 eq 'En cours') or (ApprobateurV2/Id eq ${currentUserID} and StatusApprobateurV2 eq 'En cours') or (ApprobateurV3/Id eq ${currentUserID} and StatusApprobateurV3 eq 'En cours') )`)
  //     .top(2000)
  //     .get();
  //   if (DemandeIDs.length > 0) {
  //     for (const demandeID of DemandeIDs) {
  //       listData.push(parseInt(demandeID.DemandeID));
  //     }
  //   }
  //   console.log(listData)
  //   this.setState({listDemandeDataForCurrentUser:listData})
  // };


  private clearFilterButton = () => {
    this.setState({ StatusFilter: '', FamilleFilter: '' });
  }


  public getDateFormListJSON = (produits: any) => {
    var listProduits = JSON.parse(produits)
    return listProduits
  }


  toggleAccordion = (Accordionindex) => {
    var isStatePrev = this.state.isOpen
    console.log(Accordionindex)

    this.setState({ isOpen: !isStatePrev, currentAccordion: Accordionindex })
  };


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

  private async getAllDemandeurs() {
    try {
        const demandes = await Web(this.props.url).lists.getByTitle("DemandeAchat").items
            .select("Demandeur/Id", "Demandeur/Title") // Select the fields from the "Demandeur" lookup field
            .expand("Demandeur") // Expand the "Demandeur" lookup field
            .getAll();

        console.log(demandes);

         // Group demands by DemandeurID
         const groupedDemandes = {};
         demandes.forEach(demande => {
             const demandeur = demande.Demandeur;
             const demandeurID = demandeur.Id;
             const demandeurName = demandeur.Title;
 
             if (!groupedDemandes[demandeurID]) {
                groupedDemandes[demandeurID] = { key: demandeurID.toString(), text: demandeurName };
             }
         });
 
         // Convert groupedDemandes object into array of objects
         const result = [];
         for (const key in groupedDemandes) {
          if (groupedDemandes.hasOwnProperty(key)) {
            result.push(groupedDemandes[key]);
          }
         }

         if (result.length > 0){
          result.unshift({ key: "Tous", text: "Tous" });
         }
 
         // Now 'result' holds the demands grouped by DemandeurID
         console.log(result);
         return result;
    } catch (error) {
        console.error("Error fetching demandes:", error);
    }
  }

  async componentDidMount() {
    this.getAllDemandeListData();

    const demandeurs = await this.getAllDemandeurs()
    console.log(demandeurs)
    this.setState({demandeurs})


    setTimeout(() => {
      this.setState({ showSpinner: false });
    }, 4000);
  }


  public render(): React.ReactElement<IDashboardDemandesRecusProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };
    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white" }
    });
    const rootClass = mergeStyles({ backgroundColor:"white" });


    const { currentPage, itemsPerPage, listDemandeData, DemandeurFilter, StatusFilter } = this.state;
    var filteredData
    if (DemandeurFilter.length > 0 || StatusFilter.length > 0){
      console.log(DemandeurFilter)
      console.log(StatusFilter) 
      const orderFilter = getOrderFilter(DemandeurFilter, StatusFilter) ;
      if(orderFilter === 1){
        filteredData = listDemandeData
      }else if (orderFilter === 2){
        filteredData = listDemandeData.filter((item:any) => {
          return item.StatusDemande.toString().includes(StatusFilter);
        }); 
      }else if (orderFilter === 3){
        filteredData = listDemandeData.filter((item:any) => {
          return item.DemandeurId.toString().toLowerCase().includes(DemandeurFilter.toLowerCase());
        }); 
      }else{
        filteredData = listDemandeData.filter((item:any) => {
          return item.DemandeurId.toString().toLowerCase().includes(DemandeurFilter.toLowerCase()) && item.StatusDemande.toString().includes(StatusFilter);
        }); 
      }
    }else {
      filteredData = listDemandeData
    }
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const { pageNumbers } = this.getPageNumbers(totalPages);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    

    
    return (
      <div className={styles.dashboardDemandesRecus}>
        <div className={styles.title}><strong>Filtres</strong></div>
        <div className={styles.filters}>
          <label className={styles.title}>Demandeur : </label>
          <div className={styles.statusWrapper}>
          <Dropdown
              styles={dropdownStyles}
              placeholder="Selectionner votre demandeur"
              options={this.state.demandeurs}
              defaultSelectedKey={this.state.DemandeurFilter}
              onChanged={(value) => this.setState({DemandeurFilter:value.key, currentPage: 1})}
              style={{ width: '224.45px' }} // Specify the width you desire
            />
          </div>
          <label className={styles.title}>Statut : </label>
          <div className={styles.statusWrapper}>
            <Dropdown
              styles={dropdownStyles}
              placeholder="Selectionner votre status"
              options={[
                { key: 'TOUS', text: 'TOUS' },
                { key: 'En cours', text: 'En cours' },
                { key: 'Rejetée', text: 'Rejetée' },
                { key: 'A modifier', text: 'A modifier' },
                { key: 'Approuvée', text: 'Approuvée' },
              ]}
              defaultSelectedKey={this.state.StatusFilter}
              style={{ width: '189.84px' }} // Specify the width you desire
              onChanged={(value) => this.setState({ StatusFilter: value.key, currentPage: 1 })}
            />
          </div>
          <button className={styles.btnRef} onClick={() => this.clearFilterButton()}>Rafraichir</button>
        </div>
        <div className={styles.paginations} style={{ textAlign: 'center' }}>
          {this.state.showSpinner && <span className={styles.loader}></span>}
        </div>
        {(listDemandeData.length === 0 && !this.state.showSpinner) && <div style={{ textAlign: 'center' }}><h4>Aucune données trouvées</h4></div>}
        {(listDemandeData.length > 0 && !this.state.showSpinner) &&
          <div id="spListContainer">
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tr><th className={styles.textCenter}>#</th><th>Référence de la demande</th><th>Demandeur</th><th>Centre de gestion</th><th>Date de la Demande</th><th>Statut de la demande</th><th>Détail</th></tr>
              {currentItems.map((demande: any) =>
                <tr>
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
                  <td>{demande.ReferenceDemande}</td>
                  <td>{demande.CreerPar}</td>
                  <td>{demande.CentreDeGestion}</td>
                  <td>{convertDateFormat(demande.Created)}</td>
                  <td className={styles.statut}>
                    <>
                      <div className={styles.cercleYellow}></div>
                      &nbsp;Approuvée
                    </>
                  </td>
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
            {/* <div style={{textAlign:"center"}}><h4>Aucune données trouvées</h4></div> */}
          </div>
        }

        {this.state.openDetailsDiv && <div className={styles.modal}>
          <div className={styles.modalContent} style={{margin:"5% auto 0"}}>
            <span id="close" className={styles.close} onClick={() => this.setState({ openDetailsDiv: false, articlesChangeDateSouhaiter:[] })}>&times;</span>
            {/* <p className={styles.titleComment}>Détails :</p> */}
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td >Famille :</td>
                  <td className={styles.value}>{this.state.detailsListDemande.FamilleProduit}</td>
                </tr>
                <tr>
                  <td >Article(s) :</td>
                  <td className={styles.value}>
                    {this.getDateFormListJSON(this.state.detailsListDemande.Produit).map((produit, index) => <div className={styles.accordion}>
                      <button className={`${styles.accordionButton} ${this.state.isOpen ? styles.active : ''}`} onClick={() => this.toggleAccordion(index)}>
                        <h4>{index + 1}-{produit.DescriptionTechnique}</h4>
                      </button>
                      <div className={`${styles.panel} ${(this.state.isOpen && (this.state.currentAccordion === index)) ? styles.panelOpen : ''}`}>
                        <p className={styles.value}><b>Sous Famille:</b> {produit.SousFamille}</p>
                        <p className={styles.value}><b>Beneficiaire:</b> {produit.Beneficiaire}</p>
                        <p className={styles.value}><b>Description Technique:</b> {produit.comment}</p>
                        <p className={styles.value}><b>Prix: </b>{produit.Prix} DT</p>
                        <p className={styles.value}><b>Quantité: </b>{produit.quantité}</p>
                        <p className={styles.value}><b>Prix total: </b>{(parseInt(produit.quantité) * parseFloat(produit.Prix)).toFixed(2).toString()} DT</p>
                        <p className={styles.value}><b>Délais de livraison souhaité : </b>{produit.DelaiLivraisionSouhaite} Jours</p>
                        <p className={styles.value}>
                          <b>Modifier la date souhaité: </b>
                        </p>
                        <p className={styles.value}>
                          {console.log(index)}
                          <div style={{display:"inline", float:"left"}}>
                            <b>
                            {/* <DatePicker
                              style={{ width: '250px' }}
                              allowTextInput={true}
                              value={this.state.DateAction[index] ? new Date(this.state.DateAction[index]) : new Date()}
                              onSelectDate={(e) => { this.handleChangeDate(e, index) }}
                            /> */}
                              {/* {console.log(this.getNumberOfDaysFromDateAction(index))} */}

                              <TextField 
                                type='number'
                                min={0}
                                style={{ width: '250px', backgroundColor:"white", fontSize:"15px" }}
                                className={controlClass.TextField} 
                                defaultValue={this.getNumberOfDaysFromDateAction(index)}
                                value={this.state.DateAction[index]} 
                                onChange={(e) => { this.handleChangeDate(e, index) }}
                              />
                              {console.log(this.state.DateAction[index])}
                            </b>
                          </div>
                          <div style={{display:"inline", float:"right"}}>
                            <button
                              style={{
                                backgroundColor: this.state.disableButtonUpdateDate ? "gray" : "#7d2935",
                              }}
                              className={styles.btnRef}
                              onClick={() => this.updateDateSouhaite(index)}
                              disabled={this.state.disableButtonUpdateDate}
                            >
                              Enregister la modification
                            </button>
                          </div>
                        </p>
                      </div>



                    </div>)}
                  </td>
                </tr>
                <tr>
                  <td>Envoyer votre Changement :</td>
                  <td className={styles.value}>
                  <button
                    style={{
                      backgroundColor: this.state.disableButtonSaveUpdateDate ? "gray" : "#7d2935",
                    }}
                    className={styles.btnRef}
                    disabled={this.state.disableButtonSaveUpdateDate}
                    onClick={() => this.submitUpdatesDateSouhaiter()}
                    >
                    Valider
                  </button>
                  </td>
                </tr>
                <tr>
                  <td>Prix unitaire estimatif Total :</td>
                  <td className={styles.value}>{(parseFloat(this.state.detailsListDemande.PrixTotal).toFixed(2)).toString()} DT</td>
                </tr>
                <tr>
                  <td >Piéce jointe :</td>
                  <td className={styles.value} > 
                    {this.state.filenames.map((file, index) => (
                        <span key={file} style={{ cursor: 'pointer', color:"black" }} onClick={()=>this.downloadAttachmentFile(this.state.detailsListDemande.ID, index)}>
                          - {file}
                        </span>
                      ))}                  
                  </td>
                </tr>
                <tr>
                  <td >Statut De la demande :</td>
                  {<td className={styles.value}><div className={styles.cercleYellow}></div> &nbsp; Approuvée</td>}
                </tr>
                <tr>
                  <td>Historique de la demande :</td>
                  {this.state.historiqueDemande.length < 4 ? (
                    <div>
                      <td className={styles.value}>
                        {this.state.historiqueDemande.map((action, index) => (
                          <span style={{ 'color': "black" }} key={index}>- {action} <br /></span>
                        ))}
                      </td>
                    </div>
                  ) : (
                    <div style={{ 'maxHeight': '80px', 'width': '103%', 'overflowY': 'auto', 'overflowX': 'hidden', 'float': 'left', 'backgroundColor': '#aaa' }}>
                      <td className={styles.value}>
                        {this.state.historiqueDemande.map((action, index) => (
                          <span key={index}>- {action} <br /></span>
                        ))}
                      </td>
                    </div>
                  )}
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
      </div>
    );
  }
}
