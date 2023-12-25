import * as React from 'react';
import styles from './DashboardDemandeCloturees.module.scss';
import { Dropdown, IDropdownStyles, TextField, mergeStyleSets } from 'office-ui-fabric-react';
import { Web } from '@pnp/sp/webs';
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/site-users/web";
import { IDashboardDemandeClotureesProps } from './IDashboardDemandeClotureesProps';

export default class DashboardDemandeCloturees extends React.Component<IDashboardDemandeClotureesProps, {}> {
  public state = {
    currentPage: 1,
    itemsPerPage:5,
    FamilleFilter: '',
    StatusFilter: '',

    openDetailsDiv: false,
    listDemandeData: [] as any, 
    detailsListDemande: [] as any,
    cancelPopUp: false,
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

  // handleNameFilterChange = (e) => {
  //   this.setState({ nameFilter: e.target.value, currentPage: 1 });
  // };

  // handleAgeFilterChange = (e) => {
  //   this.setState({ ageFilter: e.target.value, currentPage: 1 });
  // };

  private openDetailsDiv = async (demandeID: any) => {
    const selectedDemande = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeID).get();
    console.log(selectedDemande)
    this.setState({openDetailsDiv: true, detailsListDemande:selectedDemande})
  }

  private getDemandeListData = async() => {
    const listDemandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.top(2000).select("Id, Demandeur, DateCreation, statusDemande", "FamilleProduit", "StatusDemande").orderBy("Created", false).get();
    console.log(listDemandeData)
    this.setState({listDemandeData})
  }


  private clearFilterButton = () => {
    this.setState({StatusFilter:'', FamilleFilter: ''});
  }


  // public async getUserInfoFromERP1(establishment: any, registrationNumber: any) {
  //   try {
  //     const response = await fetch(this.props.GetUserInfoURL, {
  //       method: 'POST',
  //       headers: new Headers({ "Authorization": `Basic ${btoa(`INTRANET:UCG2021*++`)}`, 'Content-Type': 'application/json', 'Accept': '*/*' }),
  //       body: JSON.stringify({ "establishment": establishment, "registrationNumber": registrationNumber }),
  //     });
  //     console.log('response', response);

  //     let erp = await response.json();
  //     console.log('erp', erp);
  //     // this.setState({
  //     //   JobTitle: erp.data.Fonction,
  //     // });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }


  // private loadUserInfo() {
  //   this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
  //     .then((user:any) => {
  //       //console.log("hi there",user)
  //       // this.setState({
  //       //   userName: user["displayName"],
  //       //   userEmail: user["mail"],
  //       //   userRegistrationNumber: user["employeeId"],
  //       //   userEstablishment: user["companyName"]
  //       // });
  //       console.log(user, "USERinfo from MicrosoftGraph")

  //       console.log('getUserInfoFromERP1');
  //       this.getUserInfoFromERP1(user["companyName"], user["employeeId"]);
  //     });
  // }
  


  async componentDidMount() {
    this.getDemandeListData() ;
    // this.loadUserInfo() ;
  }

  public render(): React.ReactElement<IDashboardDemandeClotureesProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white"}
    };
    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });
    const { currentPage, itemsPerPage, listDemandeData, FamilleFilter, StatusFilter } = this.state;

    var filteredData
    if(FamilleFilter.length > 0 || StatusFilter.length > 0){
      console.log(FamilleFilter)
      console.log(StatusFilter)
      filteredData = listDemandeData.filter((item:any) => {
        return item.FamilleProduit.toLowerCase().includes(FamilleFilter.toLowerCase()) && item.statusDemande.toString().includes(StatusFilter);
      }); 
    }else {
      filteredData = listDemandeData
    }
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
      <div className={styles.dashboardDemandeCloturees}>
        <div className={styles.title}><strong>Filtres</strong></div>
        <div className={styles.filters}>
          <label className={styles.title}>Demandeur : </label>
          <div className={styles.statusWrapper}>
            <Dropdown
              styles={dropdownStyles}
              // className={styles.btnw}
              placeholder="Selectionner un demandeur"
              options={[
                { key: 'test', text: 'test' },
                { key: 'test 2', text: 'test 2' },
              ]}
              defaultSelectedKey={this.state.FamilleFilter}
              onChanged={(value) => this.setState({FamilleFilter:value.key, currentPage: 1})}
            />
          </div>
          <label className={styles.title}>Status : </label>
          <div className={styles.statusWrapper}>
            <Dropdown
              styles={dropdownStyles}
              placeholder="Selectionner votre status"
              options={[
                { key: 'En cours', text: 'En cours' },
                { key: 'Rejeter', text: 'Rejeter' },
                { key: 'A modifier', text: 'A modifier' },
                { key: 'Approuver', text: 'Approuver' },
              ]}
              defaultSelectedKey={this.state.StatusFilter}
              onChanged={(value) => this.setState({StatusFilter:value.key , currentPage: 1})}
            />
          </div>
          <button className={styles.btnRef} onClick={() => this.clearFilterButton()}>Rafraichir</button>
        </div>
        <div id="spListContainer"> 
          <table style={{borderCollapse: "collapse", width:"100%"}}>
            <tr><th className={styles.textCenter}>#</th> <th>Demandeur</th><th>Date de la Demande</th><th>Status de la demande</th><th>Détail</th></tr>
            {currentItems.map((demande:any) =>
              <tr>
                <td></td>
                <td>{demande.FamilleProduit}</td>
                <td>{demande.DateCreation}</td>
                <td className={styles.statut}>
                  {demande.statusDemande === "En cours" && (
                    <>
                      <div className={styles.cercleBleu}></div>
                      &nbsp;{demande.statusDemande}
                    </>
                  )}
                  {demande.statusDemande === "Rejeter" && (
                    <>
                      <div className={styles.cercleRouge}></div>
                      &nbsp;{demande.statusDemande}
                    </>
                  )}
                  {demande.statusDemande === "A modifier" && (
                    <>
                      <div className={styles.cercleVert}></div>
                      &nbsp;{demande.statusDemande}
                    </>
                  )}
                  {demande.statusDemande === "Approuver" && (
                    <>
                      <div className={styles.cercleYellow}></div>
                      &nbsp;{demande.statusDemande}
                    </>
                  )}
                </td>
                <td>
                  <span className={styles.icon}>
                    <svg onClick={() => this.openDetailsDiv(demande.ID)} version="1.1" id="Capa_1"
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
            )}
          </table>
          {/* <div style={{textAlign:"center"}}><h4>Aucune données trouvées</h4></div> */}
        </div>

        {this.state.openDetailsDiv && <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span id="close" className={styles.close} onClick={() => this.setState({openDetailsDiv: false})}>&times;</span>
            {/* <p className={styles.titleComment}>Détails :</p> */}
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td >Famille :</td>
                  <td className={styles.value}>Exemple famille</td>
                </tr>
                <tr>
                  <td >Sous famille :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Réference de l'article :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Bénéficiaire / Destination :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Montant du budget alloué :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Montant du budget consommé :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Montant du budget restant :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Quantité demandée :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Prix estimatifs :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Description Technique :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Détails de livraison souhaité :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Piéce jointe :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Status actuel :</td>
                  <td className={styles.value}><div className={styles.cercleBleu}></div> &nbsp; En cours</td>
                </tr>
                <tr>
                  <td >Historique de la demande :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Commentaire</td>
                  <td className={styles.value}>
                  <TextField 
                      className={controlClass.TextField} 
                      // value={this.state.formData[index - 1]["Comment"]} 
                      multiline 
                      // onChange={(e) => this.handleChangeComment(e, index)}
                    />
                  </td>
                </tr>
                <tr>
                  <td >Approbation</td>
                  <td className={styles.value}>
                    <button style={{'backgroundColor':"green"}} className={styles.btnRef} onClick={() => this.clearFilterButton()}>Approuver</button>
                      &nbsp;
                    <button style={{'backgroundColor':"red"}} className={styles.btnRef} onClick={() => this.clearFilterButton()}>Rejeter</button>
                      &nbsp;
                    <button style={{'backgroundColor':"blue"}} className={styles.btnRef} onClick={() => this.clearFilterButton()}>Demande de modification</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>}

        <div className={styles.paginations}>
          <span id="btn_prev" className={styles.pagination} onClick={this.handlePrevPage}>Prev</span>
          <span id="page">
            {(() => {
                const pageButtons = [];
                for (let page = 0; page < totalPages; page++) {
                  pageButtons.push(
                    <span key={page + 1} onClick={() => this.handlePageClick(page + 1)} className={styles.pagination} style={{color:"#700d1f"}}>{page + 1}</span>
                  );
                }
                return pageButtons;
              })()
            }
          </span>
          <span id="btn_next" className={styles.pagination} onClick={this.handleNextPage}>Next</span>
        </div>
      </div>
    );
  }
}
