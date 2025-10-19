import * as React from 'react';
import styles from './DashboardDemandeCloturees.module.scss';
import styles2 from '../../demandeurDashboard/components/DemandeurDashboard.module.scss';

import { Dropdown, IDropdownStyles, TextField, mergeStyleSets } from 'office-ui-fabric-react';
import { Web } from '@pnp/sp/webs';
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/site-groups";
import { IDashboardDemandeClotureesProps } from './IDashboardDemandeClotureesProps';
import { getClosedPurchaseRequests } from '../../../services/getClosedPurchaseRequests';
import { DatePicker, DayOfWeek, IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import GraphService from '../../../services/GraphServices';
import { DemandeurGroupId } from '../../../API_END_POINTS/AchatModuleEndPoints';

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
    itemsPerPage: 5,
    dateDebutFilter: '',
    dateFinFilter: '',
    StatusFilter: '',
    IdIntranetFilter: '',
    referenceErpFilter: '',

    openDetailsDiv: false,
    listDemandeData: [] as any,
    detailsListDemande: [] as any,
    cancelPopUp: false,
    isOpen: false,
    currentAccordion: 0,
    getDataClicked: false,
    disabledFilters: true,
    currentUserRole: "Demandeur",
    multiUserRolesPopUp: false,
    multiUserRoles: false,
    employeeID: 0,
    currentUserInGroup: false,
    currentUserInGroupPopup: false
  };

  private _graphService = new GraphService(this.props.context);


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

  handlePageClick = (page: any) => {
    this.setState({ currentPage: page });
  };


  handleDateDebutFilterChange = (date) => {
    console.log(date)
    date = new Date(date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
    this.setState({ dateDebutFilter: formattedDate });
  };


  private convertStringDateToNormalDate = (dateString) => {
    if (dateString === "") return null;
    const parts = dateString.split("/");

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return date
  }


  handleDateFinFilterChange = (date) => {
    console.log(date)
    date = new Date(date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
    this.setState({ dateFinFilter: formattedDate });
  };


  private openDetailsDiv = async (demande: any) => {
    console.log(demande)
    const listCommandeData = this.state.listDemandeData;
    if (listCommandeData.length > 0) {
      this.setState({ openDetailsDiv: true, detailsListDemande: demande })
    }
  }

  private handleChangeUserRole(role) {
    this.setState({ currentUserRole: role.key, currentPage: 1, listDemandeData: [], getDataClicked: false, disabledFilters: true, IdIntranetFilter: '', referenceErpFilter: '', dateDebutFilter: '', dateFinFilter: '' });
    if (role.key === "Demandeur") {
      // this.setState({ DemandeurFilter: '', StatusFilter: '' })
      console.log('Demandeur')
    } else if (role.key === "Approuver") {
      // this.setState({ DemandeurFilter: '', StatusFilter: '' })
      console.log('Approuver')
    }
  }

  // private getDemandeListData = async() => {
  //   const listDemandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.top(2000).select("Id, Demandeur, DateCreation, statusDemande", "FamilleProduit", "StatusDemande").orderBy("Created", false).get();
  //   console.log(listDemandeData)
  //   this.setState({listDemandeData})
  // }


  private getCommandesListData = async () => {
    console.log(
      this.state.employeeID, this.state.currentUserRole, this.state.dateDebutFilter, this.state.dateFinFilter
    )
    const data = await getClosedPurchaseRequests(this.state.employeeID, this.state.currentUserRole, this.state.dateDebutFilter, this.state.dateFinFilter);
    console.log(data)
    if (data.Status === "200") {
      console.log(200)
      this.setState({ listDemandeData: data.PurchaseOrders, getDataClicked: true, disabledFilters: false })
    } else {
      console.log(400)
      this.setState({ listDemandeData: [], getDataClicked: true })
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
    }, {
      key: "MSC",
      text: "MSC",
    }]
    return listBenef
  }


  private clearFilterButton = () => {
    this.setState({ IdIntranetFilter: '', referenceErpFilter: '', StatusFilter: '', dateDebutFilter: '', dateFinFilter: '', listDemandeData: [], getDataClicked: false, disabledFilters: true, currentPage: 1 });
  }

  toggleAccordion = (Accordionindex) => {
    var isStatePrev = this.state.isOpen
    console.log(Accordionindex)

    this.setState({ isOpen: !isStatePrev, currentAccordion: Accordionindex })
  };

  private getAllApprouverListData = async () => {
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
    const DemandeIDs = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
      .filter(`
          ( 
            (ApprobateurV1/Id eq ${currentUserID} and (StatusApprobateurV1 eq 'En cours' or StatusApprobateurV1 eq 'Approuvée' or StatusApprobateurV1 eq 'Rejetée' or StatusApprobateurV1 eq 'A modifier')) or 
            (ApprobateurV2/Id eq ${currentUserID} and (StatusApprobateurV2 eq 'En cours' or StatusApprobateurV2 eq 'Approuvée' or StatusApprobateurV2 eq 'Rejetée' or StatusApprobateurV2 eq 'A modifier')) or 
            (ApprobateurV3/Id eq ${currentUserID} and (StatusApprobateurV3 eq 'En cours' or StatusApprobateurV3 eq 'Approuvée' or StatusApprobateurV3 eq 'Rejetée' or StatusApprobateurV3 eq 'A modifier')) or
            (ApprobateurV4/Id eq ${currentUserID} and (StatusApprobateurV4 eq 'En cours' or StatusApprobateurV4 eq 'Approuvée' or StatusApprobateurV4 eq 'Rejetée' or StatusApprobateurV4 eq 'A modifier'))
          )
      `)
      .top(1000)
      .orderBy("Created", false)
      .select('DemandeID', 'StatusApprobateurV1', 'StatusApprobateurV2', 'StatusApprobateurV3', 'StatusApprobateurV4')
      .get();
    console.log(DemandeIDs)
    const listDemandeDataPromises = DemandeIDs.map(async (demande) => {
      return await Web(this.props.url).lists.getByTitle("DemandeAchat").items
        .top(1000)
        .orderBy("Created", false)
        .expand("Ecole")
        .select("Attachments", "AuthorId", "DelaiLivraisionSouhaite", "DemandeurId", "DemandeurStringId", "DescriptionTechnique", "Ecole/Title", "Ecole/Ecole", "FamilleProduit", "ID", "Prix", "PrixTotal", "Produit", "Quantite", "SousFamilleProduit", "StatusDemande", "Title", "CentreDeGestion", "budgetSelected", "budgetSelectedID", "ReferenceDemande")
        .getById(demande.DemandeID).get();
    });

    // Wait for all promises to resolve
    const listDemandeData = await Promise.all(listDemandeDataPromises);
    console.log(listDemandeData)
    return listDemandeData
    // this.setState({ listDemandeData })
  }


  // Get current user demandeur list
  private getDemandeurListData = async () => {
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
    const listDemandeData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items
      .filter(`DemandeurId eq ${currentUserID}`)
      .orderBy('Created', false)
      .top(100)
      .get();

    console.log(listDemandeData);
    // this.setState({ listDemandeData });
    return listDemandeData
  }


  // Get all users in a group
  private getListUsersInGroup = async (groupId) => {
    const group = await this._graphService.getGroupMembers(groupId);
    return group
  }


  private checkIfCurrentUserInGroup = async () => {
    try {
      const usersInGroup = await this.getListUsersInGroup(DemandeurGroupId);
      console.log(usersInGroup)
      const currentUserEmail = this.props.context.pageContext.legacyPageContext["userPrincipalName"];
      const userInGroup = usersInGroup.filter(user => user.mail && user.mail.toLowerCase() === currentUserEmail.toLowerCase());
      if (userInGroup.length === 0) {
        return false
      }

      return true
    } catch (error) {
      console.log(error)
      return false
    }

  }

  async componentDidMount() {
    const userInGroup = await this.checkIfCurrentUserInGroup();
    console.log('user in group: ', userInGroup)
    if (userInGroup) {
      this.setState({ currentUserRole: "", employeeID: "", currentUserInGroup: true, currentUserInGroupPopup: true })

    } else {
      const demandeurListData = await this.getDemandeurListData();
      const approuverListData = await this.getAllApprouverListData();
      const user = await this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);
      // await this.getDemandeListDataForApprouverRole();

      console.log('user info: ', user)
      console.log(demandeurListData)
      console.log(approuverListData)

      if (demandeurListData.length > 0 && approuverListData.length > 0) {
        console.log('Approbateur et Demandeur')
        this.setState({ multiUserRoles: true, multiUserRolesPopUp: true, currentUserRole: "Demandeur", employeeID: user["employeeId"] })

      } else if (demandeurListData.length > 0 && approuverListData.length === 0) {
        console.log('Demandeur')
        this.setState({ currentUserRole: "Demandeur", employeeID: user["employeeId"] })

      } else if (demandeurListData.length === 0 && approuverListData.length > 0) {
        console.log('Approbateur')
        this.setState({ currentUserRole: "Approuver", employeeID: user["employeeId"] })
      }

      // this.setState({ employeeID: "1690" })
    }
  }

  public render(): React.ReactElement<IDashboardDemandeClotureesProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" }
    };
    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });
    const { currentPage, itemsPerPage, listDemandeData, IdIntranetFilter, referenceErpFilter } = this.state;

    var filteredData
    if (IdIntranetFilter.length > 0 || referenceErpFilter.length > 0) {
      console.log(IdIntranetFilter)
      console.log(referenceErpFilter)
      console.log(listDemandeData)
      if (IdIntranetFilter.length === 0) {
        filteredData = listDemandeData.filter((item: any) => {
          return item.RéfRequestERP.toLowerCase().includes(referenceErpFilter.toLowerCase());
        });
      } else if (referenceErpFilter.length === 0) {
        filteredData = listDemandeData.filter((item: any) => {
          return item.IdRequestIntranet.toLowerCase().includes(IdIntranetFilter.toLowerCase());
        });
      } else {
        filteredData = listDemandeData.filter((item: any) => {
          return item.IdRequestIntranet.toLowerCase().includes(IdIntranetFilter.toLowerCase()) && item.RéfRequestERP.toLowerCase().includes(referenceErpFilter.toLowerCase());
        });
      }
    } else {
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

          {this.state.multiUserRoles && <>
            <label className={styles.title}>Rôle : </label>
            <div className={styles.statusWrapper}>
              <Dropdown
                styles={dropdownStyles}
                placeholder="Selectionner votre status"
                options={[
                  { key: 'Demandeur', text: 'Demandeur' },
                  { key: 'Approbateur', text: 'Approbateur' },
                ]}
                defaultSelectedKey={this.state.currentUserRole}
                style={{ width: '150px' }} // Specify the width you desire
                onChanged={(value) => this.handleChangeUserRole(value)}
              />
            </div>
          </>}


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

          <label className={styles.title}>ID Intranet : </label>
          <div className={styles.statusWrapper}>
            <TextField
              disabled={this.state.disabledFilters}
              placeholder="Rechercher par ID Intranet"
              value={this.state.IdIntranetFilter}
              // value={this.state.FamilleFilter === 'TOUS' ? '' : this.state.FamilleFilter}
              onChange={(e, newValue) => this.setState({ IdIntranetFilter: newValue, currentPage: 1 })}
              style={{ width: '150px', fontSize: "12px" }}
            />
          </div>

          <label className={styles.title}>Réference ERP : </label>
          <div className={styles.statusWrapper}>
            <TextField
              disabled={this.state.disabledFilters}
              placeholder="Rechercher par réference ERP"
              value={this.state.referenceErpFilter}
              // value={this.state.FamilleFilter === 'TOUS' ? '' : this.state.FamilleFilter}
              onChange={(e, newValue) => this.setState({ referenceErpFilter: newValue, currentPage: 1 })}
              style={{ width: '150px', fontSize: "12px" }}
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
            ((this.state.currentUserInGroup === false) && (this.state.currentUserRole === '' || this.state.employeeID === 0 || this.state.dateDebutFilter === '' || this.state.dateFinFilter === '')) &&
            <div style={{ textAlign: 'center' }}><h4>Saisissez vos filtres pour obtenir les informations.</h4></div>
          }

          {
            ((this.state.currentUserInGroup === true) && (this.state.dateDebutFilter === '' || this.state.dateFinFilter === '')) &&
            <div style={{ textAlign: 'center' }}><h4>Saisissez vos filtres pour obtenir les informations.</h4></div>
          }

          {/* Error message when user add to startDate, endDate and Centre de gestion */}
          {
            (this.state.currentUserRole !== '' && this.state.employeeID !== 0 && this.state.dateDebutFilter !== '' && this.state.dateFinFilter !== '' && !this.state.getDataClicked) &&
            <div style={{ textAlign: 'center' }}><h4>Saisissez vos filtres pour obtenir les informations.</h4></div>
          }

          {/* Error message when data is empty */}
          {
            (this.state.currentUserRole !== '' && this.state.employeeID !== 0 && this.state.dateDebutFilter !== '' && this.state.dateFinFilter !== '' && this.state.getDataClicked && currentItems.length === 0) &&
            <div style={{ textAlign: 'center' }}><h4>Aucune données trouvées</h4></div>
          }


          {currentItems.length > 0 &&
            <table style={{ width: "112%", borderCollapse: "collapse", textAlign: "center" }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: "#7d2935", color: "#fff", padding: "8px", border: "1px solid #ddd" }}>Demande Achat</th>
                  <th style={{ backgroundColor: "#7d2935", color: "#fff", padding: "8px", border: "1px solid #ddd" }}>Dossier(s) Achat</th>
                  <th style={{ backgroundColor: "#7d2935", color: "#fff", padding: "8px", border: "1px solid #ddd" }}>Commande(s)</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((demande, demandeIndex) => (
                  <tr key={demandeIndex}>
                    {/* --- Demande Achat --- */}
                    <td style={{ verticalAlign: "top", padding: "5px", border: "1px solid #ddd" }}>
                      <table style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
                        <thead>
                          <tr>
                            <th style={{ backgroundColor: "#9b9a9a" }}>Centre de gestion</th>
                            <th style={{ backgroundColor: "#9b9a9a" }}>Id Intranet</th>
                            <th style={{ backgroundColor: "#9b9a9a" }}>Date création</th>
                            <th style={{ backgroundColor: "#9b9a9a" }}>Réf ERP</th>
                            <th style={{ backgroundColor: "#9b9a9a" }}>Date approbation</th>
                            <th style={{ backgroundColor: "#9b9a9a" }}>Statut DA</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{demande.RespCenter}</td>
                            <td>{demande.IdRequestIntranet || "N/A"}</td>
                            <td>{demande.CreatedDateIntranet}</td>
                            <td>{demande.RéfRequestERP}</td>
                            <td>{demande.DateApprovalIntranet?.split(" ")[0]}</td>
                            <td>{demande.StatutDA}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {/* --- Dossiers Achat --- */}
                    <td style={{ verticalAlign: "top", padding: "5px", border: "1px solid #ddd" }}>
                      {demande.DossiersAchats?.length > 0 ? (
                        <table style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
                          <thead>
                            <tr>
                              <th style={{ backgroundColor: "#9b9a9a" }}>Réf dossier</th>
                              <th style={{ backgroundColor: "#9b9a9a" }}>Date dossier</th>
                              <th style={{ backgroundColor: "#9b9a9a" }}>Statut dossier</th>
                              <th style={{ backgroundColor: "#9b9a9a" }}>Motif d'annulation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {demande.DossiersAchats.map((dossier, dossierIndex) => (
                              <tr key={dossierIndex}>
                                <td>{dossier.RefDossierAchat}</td>
                                <td>{dossier.DateDossierAchat?.split(" ")[0]}</td>
                                <td>{dossier.StatutDossierAchat}</td>
                                <td>{dossier.MotifSiAnnuler || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontStyle: "italic", color: "#777" }}>Aucun dossier</p>
                      )}
                    </td>

                    {/* --- Commandes Achat --- */}
                    <td style={{ verticalAlign: "top", padding: "5px", border: "1px solid #ddd" }}>
                      {demande.DossiersAchats?.some(d => d.CommandesAchats?.length > 0) ? (
                        <table style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
                          <thead>
                            <tr>
                              <th style={{ backgroundColor: "#9b9a9a" }}>Date commande</th>
                              <th style={{ backgroundColor: "#9b9a9a" }}>Réf commande</th>
                              <th style={{ backgroundColor: "#9b9a9a" }}>Statut commande</th>
                            </tr>
                          </thead>
                          <tbody>
                            {demande.DossiersAchats.map((dossier, dossierIndex) =>
                              dossier.CommandesAchats?.map((commande, cmdIndex) => (
                                <tr key={`${dossierIndex}-${cmdIndex}`}>
                                  <td>{commande.DateCommande?.split(" ")[0]}</td>
                                  <td>{commande.RefCommande}</td>
                                  <td>{commande.StatutCommande}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontStyle: "italic", color: "#777" }}>Aucune commande</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>




          }


        </div>

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

        {this.state.currentUserInGroupPopup && <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={() => this.setState({ currentUserInGroupPopup: false })}>&times;</span>
            <h3>À noter</h3>
            <ul>
              <li>
                En tant que membre du groupe <strong>Dashboard Achat</strong>, vous avez accès à la
                <strong>consultation des demandes clôturées</strong> uniquement.
                <br />
                Cette visibilité vous permet de suivre l’historique et l’état final des demandes.
              </li>
            </ul>
            <p>=&gt; Vous pouvez donc visualiser toutes les demandes clôturées depuis votre tableau de bord.</p>
          </div>
        </div>}


      </div>
    );
  }
}
