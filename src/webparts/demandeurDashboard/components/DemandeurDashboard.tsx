import * as React from 'react';
import styles from './DemandeurDashboard.module.scss';
import { IDemandeurDashboardProps } from './IDemandeurDashboardProps';
import { Dropdown, IDropdownStyles } from 'office-ui-fabric-react';

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

    openDetailsDiv: false,
    listData: [] as any, 
  }; 

  private openDetailsDiv(){
    console.log('clicked')
    this.setState({openDetailsDiv: true})
  }


  public render(): React.ReactElement<IDemandeurDashboardProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };

    return (
      <div className={styles.demandeurDashboard}>
        <div className={styles.title}><strong>Filtres</strong></div>
        <div className={styles.filters}>
          <label className={styles.title}>Famille demande : </label>
          <div className={styles.statusWrapper}>
          <Dropdown
            styles={dropdownStyles}
            // label="Controlled example"
            placeholder="Selectionner votre famille"
            options={[]}
            // onChanged={(value) => this.setStateRaison(value)}
          />
          </div>
          <label className={styles.title}>Status : </label>
          <div className={styles.statusWrapper}>
            <Dropdown
              styles={dropdownStyles}
              // label="Controlled example"
              placeholder="Selectionner votre status"
              options={[]}
              // onChanged={(value) => this.setStateRaison(value)}
            />
          </div>
          <div className={styles.statusWrapper}>
            <button className={styles.btnRef}>Rafraichir</button>
          </div>
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
              <td onClick={() => this.openDetailsDiv()}>
                <span className={styles.icon}>
                  <svg version="1.1" id="Capa_1"
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
              </tbody>
            </table>
          </div>
        </div>}

        <div className={styles.paginations}>
          <span id="btn_prev" className={styles.pagination}>Prev</span>
          <span id="page">
            <span className={styles.pagination} style={{color:"#700d1f"}}  id="pn${1}" >1</span>
          </span>
          <span id="btn_next" className={styles.pagination}>Next</span>
        </div>

        {/* <div className={styles.modalAlert}>
          <div className={styles.modalContent}>
            <h1 style={{textAlign:"left", color : "#7d2935"}}>Paie clôturée</h1>
            <div style={{fontSize:"14px", "color" : "#615c5d"}}>Il n’est pas possible de modifier ou d’annuler votre demande !</div>
          </div>
        </div> */}

      </div>
    );
  }
}
