import * as React from 'react';
import styles from './DemandeurDashboard.module.scss';
import { IDemandeurDashboardProps } from './IDemandeurDashboardProps';

export default class DemandeurDashboard extends React.Component<IDemandeurDashboardProps, {}> {
  public state = {

    // formData : [{
    //   FamilleSelected: [] as any,
    //   SousFamilleSelected : [] as any,
    //   ArticleSelected: [] as any,
    //   BeneficiareSelected : [] as any,
    //   Comment: "",
    //   quantity: "",
    //   price: "" ,
    //   DateSouhaite: new Date() ,
    //   fileData: "" as any,
    //   fileName: "",
    // }],

    // ID: 0,
    // userUPN: "",
    // userId: "",
    // userName: "",
    // userEmail: "",
    // JobTitle: "",

    // file: "" as null,
    // loadingFile: false,
    // fileName: "",
    // MontantAlloue: 0 ,
    // MontantConsommer: 0 ,
    // MontantRestant: 0 ,
    // counterProducts: 1 ,
    // errors: { file: "" }

    currentPage: 1,
    nameFilter: '',
    ageFilter: '',
    listData: [] as any, 
  }; 


  public render(): React.ReactElement<IDemandeurDashboardProps> {
    
    // this.componentDidMount(){

    // }

    return (
      <div className={styles.demandeurDashboard}>
        <div className={styles.title}><strong>Filtres</strong></div>
        <div className={styles.filters}>
          <label className={styles.title}>Statut : </label>
          <div className={styles.statusWrapper}  id="statusWrapper"></div>
          <label className={styles.title}>Date de départ : </label>
          <input className={styles.startDate} type="date" id="startDate" />
          <label className={styles.title}>Date de fin : </label>
          <input className={styles.startDate} type="date" id="endDate" />
          <div className={styles.title} id="SoldeDeConges"></div>
          <button className={styles.btnRef}>Creer une demande</button>
        </div>
        <div id="spListContainer"> 
          <table style={{borderCollapse: "collapse", width:"100%"}}>
            <tr><th className={styles.textCenter}>#</th> <th>Demandeur</th><th>Date de la Demande</th><th>Status de la demande</th><th>Action</th><th>Détail</th></tr>
            <tr>
              <td></td>
              <td>Ghassen Khamassi</td>
              <td>22/22/2222</td>
              <td className={styles.statut}><div className={styles.cercleBleu}></div> &nbsp; En cours</td>
              <td>
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                  </svg>
                </span>
                &nbsp;
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </span>
              </td>
              <td>details</td>
            </tr>
            <tr>
              <td></td>
              <td>Ghassen Khamassi</td>
              <td>22/22/2222</td>
              <td className={styles.statut}><div className={styles.cercleBleu}></div> &nbsp; En cours</td>
              <td>
                <span className={styles.btnApprove}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                  </svg>
                </span>
                &nbsp;
                <span className={styles.btnRefuse}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </span>
              </td>
              <td>details</td>
            </tr>
          </table>  
          
          
          {/* <div style={{textAlign:"center"}}><h4>Aucune données trouvées</h4></div> */}
          
        </div>
        <div className={styles.paginations}>
          <span id="btn_prev" className={styles.pagination}>Prev</span>
          <span id="page">
            <span className={styles.pagination} style={{color:"#700d1f"}}  id="pn${1}" >1</span>
          </span>
          <span id="btn_next" className={styles.pagination}>Next</span>
        </div>

        <div className={styles.modalAlert}>
          <div className={styles.modalContent}>
            <h1 style={{textAlign:"left", color : "#7d2935"}}>Paie clôturée</h1>
            <div style={{fontSize:"14px", "color" : "#615c5d"}}>Il n’est pas possible de modifier ou d’annuler votre demande !</div>
          </div>
        </div>

      </div>
    );
  }
}
