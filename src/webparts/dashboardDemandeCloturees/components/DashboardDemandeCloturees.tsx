import * as React from 'react';
import styles from './DashboardDemandeCloturees.module.scss';
import styles2 from '../../demandeurDashboard/components/DemandeurDashboard.module.scss';

import { Dropdown, IDropdownStyles, TextField, mergeStyleSets } from 'office-ui-fabric-react';
import { Web } from '@pnp/sp/webs';
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/site-users/web";
import { IDashboardDemandeClotureesProps } from './IDashboardDemandeClotureesProps';
import { getClosedPurchaseRequests } from '../../../services/getClosedPurchaseRequests';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';

const datepickerStrings: IDatePickerStrings = {
  months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  shortMonths: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
  days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  shortDays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  goToToday: 'Aller à aujourd\'hui',
  prevMonthAriaLabel: 'Aller au mois précédent',
  nextMonthAriaLabel: 'Aller au mois suivant',
  prevYearAriaLabel: 'Aller à l\'année précédente',
  nextYearAriaLabel: 'Aller à l\'année suivante',
  closeButtonAriaLabel: 'Fermer le sélecteur de date',
};


export default class DashboardDemandeCloturees extends React.Component<IDashboardDemandeClotureesProps, {}> {
  public state = {
    currentPage: 1,
    itemsPerPage:5,
    dateDebutFilter: '',
    dateFinFilter: '',
    StatusFilter: '',

    openDetailsDiv: false,
    listDemandeData: [] as any, 
    detailsListDemande: [] as any,
    cancelPopUp: false,
    isOpen: false,
    currentAccordion : 0,
    getDataClicked: false
  }; 

  handleNextPage = () => {
    const { currentPage } = this.state;
    const { listDemandeData, itemsPerPage } = this.state;
    const totalPages = Math.ceil(listDemandeData.length / itemsPerPage);
    if (currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    }
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


  handleDateDebutFilterChange = (date) => {
    console.log(date)
    date = new Date(date) ;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    const formattedDate = `${formattedDay}/${formattedMonth}/${year}`; 
    this.setState({ dateDebutFilter: formattedDate});
  };


  private convertStringDateToNormalDate = (dateString) => {
    if (dateString === "") return null ;
    const parts = dateString.split("/");

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return date
  }
 

  handleDateFinFilterChange = (date) => {
    console.log(date)
    date = new Date(date) ;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    const formattedDate = `${formattedDay}/${formattedMonth}/${year}`; 
    this.setState({ dateFinFilter: formattedDate});
  };


  private openDetailsDiv = async (index: any) => {
    const listCommandeData = this.state.listDemandeData ;
    if (listCommandeData.length > 0){
      const selectedCommand = listCommandeData[index]
      console.log(selectedCommand)
      this.setState({openDetailsDiv: true, detailsListDemande:selectedCommand})
    }
  }

  // private getDemandeListData = async() => {
  //   const listDemandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.top(2000).select("Id, Demandeur, DateCreation, statusDemande", "FamilleProduit", "StatusDemande").orderBy("Created", false).get();
  //   console.log(listDemandeData)
  //   this.setState({listDemandeData})
  // }


  private getCommandesListData = async() => {
    const data = await getClosedPurchaseRequests(this.state.dateDebutFilter, this.state.dateFinFilter, this.state.StatusFilter) ;
    console.log(data)
    if (data.Status === "200"){
      console.log(200)
      this.setState({listDemandeData:data.PurchaseOrders, getDataClicked: true})
    }else {
      console.log(400)
      this.setState({listDemandeData:[], getDataClicked: true})
    }
  }

  private getBeneficaire = () => {
    var listBenef = [{
      key: "COM",
      text: "COM",
    },
    {
      key: "AAC TUNIS",
      text: "AAC TUNIS",
    },
    {
      key: "IMSET TUNIS",
      text: "IMSET TUNIS",
    },
    {
      key: "SIEGE",
      text: "SIEGE",
    },
    {
      key: "AAC NABEUL",
      text: "AAC NABEUL",
    },
    {
      key: "POLYTECH",
      text: "POLYTECH",
    },
    {
      key: "CLC",
      text: "CLC",
    },
    {
      key: "HEALTH",
      text: "HEALTH",
    },
    {
      key: "DG",
      text: "DG",
    },
    {
      key: "EXECUTIVE",
      text: "EXECUTIVE",
    },
    {
      key: "IT",
      text: "IT",
    },
    {
      key: "DSP",
      text: "DSP",
    },
    {
      key: "IMSET NABEUL",
      text: "IMSET NABEUL",
    },
    {
      key: "IMSET GABES",
      text: "IMSET GABES",
    },
    {
      key: "IMSET SOUSSE",
      text: "IMSET SOUSSE",
    },
    {
      key: "IMSET SFAX",
      text: "IMSET SFAX",
    },
    {
      key: "CC",
      text: "CC",
    },{
      key: "MSC",
      text: "MSC",
    }]
    return listBenef
  }
  

  private clearFilterButton = () => {
    this.setState({StatusFilter:'', dateDebutFilter: '',dateFinFilter: '', listDemandeData:[], getDataClicked:false});
  }

  toggleAccordion = (Accordionindex) => {
    var isStatePrev = this.state.isOpen
    console.log(Accordionindex)

    this.setState({isOpen: !isStatePrev, currentAccordion:Accordionindex})
  };

  async componentDidMount() {
    // this.getDemandeListData() ;
    // this.loadUserInfo() ;
  }

  public render(): React.ReactElement<IDashboardDemandeClotureesProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white"}
    };
    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });
    const { currentPage, itemsPerPage, listDemandeData, dateDebutFilter, dateFinFilter ,StatusFilter } = this.state;

    // var filteredData
    // if(dateDebutFilter.length > 0 || StatusFilter.length > 0 || dateFinFilter.length > 0){
    //   console.log(dateDebutFilter)
    //   console.log(dateFinFilter)
    //   console.log(StatusFilter)
    //   filteredData = listDemandeData.filter((item:any) => {
    //     return item.FamilleProduit.toLowerCase().includes(dateDebutFilter.toLowerCase()) && item.statusDemande.toString().includes(StatusFilter);
    //   }); 
    // }else {
    //   filteredData = listDemandeData
    // }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = listDemandeData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(listDemandeData.length / itemsPerPage);

    return (
      <div className={styles.dashboardDemandeCloturees}>
        <div className={styles.title}><strong>Filtres</strong></div>
        <div className={styles.filters}>
          <label className={styles.title}>Date debut : </label>
          <div className={styles.statusWrapper}>
            <DatePicker
              value={this.convertStringDateToNormalDate(this.state.dateDebutFilter)}
              placeholder="Sélectionner une date"
              onSelectDate={(date) => this.handleDateDebutFilterChange(date)}
              strings={datepickerStrings}
              style={{ width: '150px' }} // Specify the width you desire
            />
          </div>

          <label className={styles.title}>Date fin : </label>
          <div className={styles.statusWrapper}>
            <DatePicker
              value={this.convertStringDateToNormalDate(this.state.dateFinFilter)}
              placeholder="Sélectionner une date"
              onSelectDate={(date) => this.handleDateFinFilterChange(date)}
              strings={datepickerStrings}
              style={{ width: '150px' }} // Specify the width you desire
            />
          </div>

          <label className={styles.title}>Centre de gestion : </label>
          <div className={styles.statusWrapper}>
            <Dropdown
              styles={dropdownStyles}
              placeholder="Selectionner votre status"
              options={this.getBeneficaire()}
              defaultSelectedKey={this.state.StatusFilter}
              style={{ width: '189.84px' }} // Specify the width you desire
              onChanged={(value) => this.setState({StatusFilter:value.key , currentPage: 1})}
            />
          </div>
          <button className={styles.btnRef} onClick={() => this.getCommandesListData()}>Obtenir des données</button>
          <div className={styles.statusWrapper}>
            &nbsp;
            <button className={styles.btnRef} onClick={() => this.clearFilterButton()}>Rafraichir</button>
          </div>
        </div>

        
        <div id="spListContainer"> 
          {/* Error message when user didn't add any filter */}
          {
            (this.state.StatusFilter === '' || this.state.dateDebutFilter === '' || this.state.dateFinFilter === '') && 
            <div style={{textAlign:'center'}}><h4>Saisissez vos filtres pour obtenir les informations.</h4></div>
          }

          {/* Error message when user add to startDate, endDate and Centre de gestion */}
          {
            (this.state.StatusFilter !== '' && this.state.dateDebutFilter !== '' && this.state.dateFinFilter !== '' && !this.state.getDataClicked) &&
            <div style={{textAlign:'center'}}><h4>Saisissez vos filtres pour obtenir les informations.</h4></div>
          }

          {/* Error message when data is empty */}
          {
            (this.state.StatusFilter !== '' && this.state.dateDebutFilter !== '' && this.state.dateFinFilter !== '' && this.state.getDataClicked && currentItems.length === 0) &&
            <div style={{textAlign:'center'}}><h4>Aucune données trouvées</h4></div>
          }

          {/* Show data */}
          {currentItems.length > 0 &&
            <table style={{borderCollapse: "collapse", width:"100%"}}>
              <tr><th>№ de la commande</th><th>Date de la commande</th><th>Status de la commande</th><th>Centre de gestion</th><th>Détail</th></tr>
              {currentItems.length > 0 && 
                currentItems.map((demande:any, index:any) =>
                  <tr>
                    <td>{demande.PurchaseOrderNo}</td>
                    <td>{demande.PurchaseOrderDate}</td>
                    <td className={styles.statut}>
                      {demande.StatusPurchaseRequest === "Lancée" && (
                        <>
                          <div className={styles.cercleBleu}></div>
                          &nbsp;{demande.StatusPurchaseRequest}
                        </>
                      )}
                      {demande.StatusPurchaseRequest === "Totalement réceptionnée" && (
                        <>
                          <div className={styles.cercleRouge}></div>
                          &nbsp;{demande.StatusPurchaseRequest}
                        </>
                      )}
                      {demande.StatusPurchaseRequest === "Partiellement réceptionnée" && (
                        <>
                          <div className={styles.cercleVert}></div>
                          &nbsp;{demande.StatusPurchaseRequest}
                        </>
                      )}
                      {demande.StatusPurchaseRequest === "clôturée" && (
                        <>
                          <div className={styles.cercleYellow}></div>
                          &nbsp;{demande.StatusPurchaseRequest}
                        </>
                      )}
                    </td>
                    <td>
                      {demande.RespCenter}
                    </td>
                    <td>
                      <span className={styles.icon}>
                        <svg onClick={() => this.openDetailsDiv(index)} version="1.1" id="Capa_1"
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{height:"16px",width:"16px"}} xmlSpace="preserve">
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
                              <path d="M266.007,438h-54c-5.522,0-10,4.477-10,10s4.478,10,10,10h54c5.522,0,10-4.477,10-10S271.529,438,266.007,438z"/>
                            </g>
                          </g>
                          <g>
                            <g>
                              <path d="M266.007,382h-142c-5.522,0-10,4.477-10,10s4.478,10,10,10h142c5.522,0,10-4.477,10-10S271.529,382,266.007,382z"/>
                            </g>
                          </g>
                          <g>
                            <g>
                              <path d="M266.007,326h-142c-5.522,0-10,4.477-10,10s4.478,10,10,10h142c5.522,0,10-4.477,10-10S271.529,326,266.007,326z"/>
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
                              <path d="M266.007,270h-142c-5.522,0-10,4.477-10,10s4.478,10,10,10h142c5.522,0,10-4.477,10-10S271.529,270,266.007,270z"/>
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
                )
              }
            </table>
          }
        </div>

        {this.state.openDetailsDiv && <div className={styles.modal}>
        <div className={styles.modalContent}>
        <div className={styles.entete} > <span className={styles.titledetail}>Les demandes de cette commande :</span>
            <span id="close" className={styles.close} onClick={() => this.setState({openDetailsDiv: false})}>&times;</span>
            </div>
            {/* <p className={styles.titleComment}>Détails :</p> */}
        <div className={styles.contentmodal}>   <div className={styles.value}>
                  {this.state.detailsListDemande.PurchaseOrderLines.map((produit, index) => <div className={styles.accordion}>
                     {console.log(produit, index)}
                      <button className={`${styles.accordionButton} ${this.state.isOpen ? styles.active : ''}`} onClick={() => this.toggleAccordion(index)}>
                        <h4>Demande №{produit.PurchaseRequestNo}</h4>
                      </button>
                      <div className={`${styles.panel} ${(this.state.isOpen && (this.state.currentAccordion === index)) ? styles.panelOpen : ''}`}>
                        <p className={styles.value}><b>Réference de la demandeur:</b> {produit.Demandeur}</p>
                        <p className={styles.value}><b>Famille de la demande:</b> {produit.Family}</p>
                        <p className={styles.value}><b>Description de l'article:</b> {produit.ItemDescription}</p>
                        <p className={styles.value}><b>Date de la demande:</b> {produit.PurchaseDate}</p>
                        <p className={styles.value}><b>№ de la demande:</b> {produit.PurchaseRequestNo}</p>
                        <p className={styles.value}><b>Quantité dilevrer: </b>{produit.QuantityDelivered}</p>
                        <p className={styles.value}><b>Quantité demandée: </b>{produit.QuantityRequested}</p>
                      </div>
                    </div>)}
                  </div></div>
          </div>
        </div>}

        <div className={styles.paginations}>
            <span
              id="btn_prev"
              className={styles.pagination}
              onClick={this.handlePrevPage}>
              Prev
            </span>

            <span id="page">
              {(() => {
                  const pageButtons = [];
                  for (let page = 0; page < totalPages; page++) {
                    pageButtons.push(
                      <span 
                        key={page + 1} 
                        onClick={() => this.handlePageClick(page + 1)} 
                        className={currentPage === page + 1 ? styles.pagination2 : styles.pagination}
                      >
                        {page + 1}
                      </span>
                    );
                  }
                  return pageButtons;
                })()
              }
            </span>

            <span
              id="btn_prev"
              className={styles.pagination}
              onClick={this.handleNextPage}>
              Next
            </span>
          </div>
      </div>
    );
  }
}
