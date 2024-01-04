import * as React from 'react';
import styles from './ApprobateurDashboard.module.scss';
import { IApprobateurDashboardProps } from './IApprobateurDashboardProps';
import { Dropdown, IDropdownStyles, TextField, mergeStyleSets } from 'office-ui-fabric-react';
import { Web } from '@pnp/sp/webs';
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/site-users/web";
import GraphService from '../../../services/GraphServices';

export default class ApprobateurDashboard extends React.Component<IApprobateurDashboardProps, {}> {

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
    itemsPerPage:5,
    FamilleFilter: '',
    StatusFilter: '',
    currentApprobateurOrder: 0,

    openDetailsDiv: false,
    listDemandeData: [] as any, 
    listDemandeDataForCurrentUser : [] as any,
    detailsListDemande: [] as any,
    historiqueDemande: [] as any ,
    cancelPopUp: false,
    demandeSelectedID: 0,
    commentAction:""
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


  private handleChangeComment = (event:any) => {
    this.setState({
      commentAction: event.target.value
    });
  }


  private getApprobateurOrder = async () => {
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
  
    const DemandeIDs = await Web(this.props.url)
      .lists.getByTitle("WorkflowApprobation")
      .items.filter(`
        ( 
          (ApprobateurV1/Id eq ${currentUserID} and (StatusApprobateurV1 eq 'En cours' or StatusApprobateurV1 eq 'Approuver' or StatusApprobateurV1 eq 'Rejeter' or StatusApprobateurV1 eq 'A modifier'))
        )
      `)
      .top(2000)
      .select('DemandeID', 'StatusApprobateurV1', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id')
      .get();
    console.log("data1",DemandeIDs)
  
    if (DemandeIDs.length > 0){
      this.setState({ currentApprobateurOrder:1 });
    }else {
      const DemandeIDs = await Web(this.props.url)
        .lists.getByTitle("WorkflowApprobation")
        .items.filter(`
          ( 
            (ApprobateurV2/Id eq ${currentUserID} and (StatusApprobateurV2 eq 'En cours' or StatusApprobateurV2 eq 'Approuver' or StatusApprobateurV2 eq 'Rejeter' or StatusApprobateurV2 eq 'A modifier'))
          )
        `)
        .top(2000)
        .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id')
        .get();
        console.log(DemandeIDs)
      if (DemandeIDs.length > 0){
        this.setState({ currentApprobateurOrder:2 });
      }else {
        const DemandeIDs = await Web(this.props.url)
        .lists.getByTitle("WorkflowApprobation")
        .items.filter(`
          ( 
            (ApprobateurV3/Id eq ${currentUserID} and (StatusApprobateurV3 eq 'En cours' or StatusApprobateurV3 eq 'Approuver' or StatusApprobateurV3 eq 'Rejeter' or StatusApprobateurV3 eq 'A modifier'))
          )
        `)
        .top(2000)
        .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id')
        .get();
        console.log(DemandeIDs)

        if (DemandeIDs.length > 0){
          this.setState({ currentApprobateurOrder:3 });
        }
      }
    }
  }


  private openDetailsDiv = async (demandeID: any) => {
    const selectedDemande = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeID).get();
    console.log(selectedDemande)
    const historiqueDemande = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.filter(`DemandeID eq '${demandeID}'`).get(); 
    var historiqueActions
    if (historiqueDemande.length === 1){
      historiqueActions = JSON.parse(historiqueDemande[0].Actions)
      // console.log(historiqueActions)
    }
    this.setState({openDetailsDiv: true, detailsListDemande:selectedDemande, historiqueDemande:historiqueActions})
  }


  private getAllDemandeListData = async() => {
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
    const DemandeIDs = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
      .filter(`
          ( 
              (ApprobateurV1/Id eq ${currentUserID} and (StatusApprobateurV1 eq 'En cours' or StatusApprobateurV1 eq 'Approuver' or StatusApprobateurV1 eq 'Rejeter' or StatusApprobateurV1 eq 'A modifier')) or 
              (ApprobateurV2/Id eq ${currentUserID} and (StatusApprobateurV2 eq 'En cours' or StatusApprobateurV2 eq 'Approuver' or StatusApprobateurV2 eq 'Rejeter' or StatusApprobateurV2 eq 'A modifier')) or 
              (ApprobateurV3/Id eq ${currentUserID} and (StatusApprobateurV3 eq 'En cours' or StatusApprobateurV3 eq 'Approuver' or StatusApprobateurV3 eq 'Rejeter' or StatusApprobateurV3 eq 'A modifier'))
          )
      `)
      .top(2000)
      .select('DemandeID','StatusApprobateurV1','StatusApprobateurV2','StatusApprobateurV3')
      .get();
    console.log(DemandeIDs)
    const listDemandeDataPromises = DemandeIDs.map(async (demande) => {
      return await Web(this.props.url).lists.getByTitle("DemandeAchat").items
        .top(2000)
        .orderBy("Created", false)
        .expand("Ecole")
        .select("Attachments", "AuthorId", "DelaiLivraisionSouhaite", "DemandeurId", "DemandeurStringId", "DescriptionTechnique", "Ecole/Title", "Ecole/Ecole", "FamilleProduit", "ID", "Prix", "PrixTotal", "Produit", "Quantite", "SousFamilleProduit", "StatusDemande", "Title")
        .getById(demande.DemandeID)();
    });
    
    // Wait for all promises to resolve
    const listDemandeData = await Promise.all(listDemandeDataPromises);
    console.log(listDemandeData)
    this.setState({listDemandeData})
  }


  private getCurrentDate() {
    const currentDate = new Date();
    
    // Get day, month, and year components
    const day = ('0' + currentDate.getUTCDate()).slice(-2);
    const month = ('0' + (currentDate.getUTCMonth() + 1)).slice(-2); // Months are zero-based
    const year = currentDate.getUTCFullYear();
  
    // Assemble the date in the desired format
    const formattedDate = `${day}/${month}/${year}`;
  
    return formattedDate;
  }

  // private getAllDemandeListData = async () => {
  //   var data = [];
  //   const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
  //   const DemandeIDs = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
  //     .filter(`
  //         ( 
  //             (ApprobateurV1/Id eq ${currentUserID} and (StatusApprobateurV1 eq 'En cours' or StatusApprobateurV1 eq 'Approuver' or StatusApprobateurV1 eq 'Rejeter')) or 
  //             (ApprobateurV2/Id eq ${currentUserID} and (StatusApprobateurV2 eq 'En cours' or StatusApprobateurV2 eq 'Approuver' or StatusApprobateurV2 eq 'Rejeter')) or 
  //             (ApprobateurV3/Id eq ${currentUserID} and (StatusApprobateurV3 eq 'En cours' or StatusApprobateurV3 eq 'Approuver' or StatusApprobateurV3 eq 'Rejeter'))
  //         )
  //     `)
  //     .top(2000)
  //     .select('DemandeID','StatusApprobateurV1','StatusApprobateurV2','StatusApprobateurV3')
  //     .get();
  //   console.log(DemandeIDs)
  //   // Use Promise.all to wait for all asynchronous operations
  //   const listDemandeDataPromises = DemandeIDs.map(async (demande) => {
  //     return await Web(this.props.url).lists.getByTitle("DemandeAchat").items
  //       .top(2000)
  //       .orderBy("Created", false)
  //       .expand("Ecole")
  //       .select("Attachments", "AuthorId", "DelaiLivraisionSouhaite", "DemandeurId", "DemandeurStringId", "DescriptionTechnique", "Ecole/Title", "Ecole/Ecole", "FamilleProduit", "ID", "Prix", "PrixTotal", "Produit", "Quantite", "SousFamilleProduit", "StatusDemande", "Title")
  //       .getById(demande.DemandeID)();
  //   });

  //   // Wait for all promises to resolve
  //   const listDemandeData = await Promise.all(listDemandeDataPromises);
  //   console.log(listDemandeData)
  //   this.setState({ listDemandeData });
  // };



  private getDemandeListData = async () => {
    var listData = [];
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
    const DemandeIDs = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
      .filter(`( (ApprobateurV1/Id eq ${currentUserID} and StatusApprobateurV1 eq 'En cours') or (ApprobateurV2/Id eq ${currentUserID} and StatusApprobateurV2 eq 'En cours') or (ApprobateurV3/Id eq ${currentUserID} and StatusApprobateurV3 eq 'En cours') )`)
      .top(2000)
      .get();
    if (DemandeIDs.length > 0) {
      for (const demandeID of DemandeIDs) {
        listData.push(parseInt(demandeID.DemandeID));
      }
    }
    console.log(listData)
    this.setState({listDemandeDataForCurrentUser:listData})
  };


  private clearFilterButton = () => {
    this.setState({StatusFilter:'', FamilleFilter: ''});
  }


  public getDateFormListJSON = (produits: any) => {
    var listProduits = JSON.parse(produits)
    return listProduits
  }


  public ApprouveValidation = async() => {
    var DemandeID = this.state.detailsListDemande.ID
    var UserDisplayName = ""
    var UserDisplayName2 = ""
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;


    const Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
    .filter(`( (ApprobateurV1/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV2/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV3/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) )`)
    .get();

    if(Demande[0].ApprobateurV1Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
      UserDisplayName2 = (await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV2Id[0]).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "En cours de " + UserDisplayName2,
        StatusDemandeV1:"Approuver",
        StatusDemandeV2:"En cours"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande Approuver par "+UserDisplayName + " le " + this.getCurrentDate());
        resultArray.push("Demande En cours de l'approbation de "+ UserDisplayName2 + " a partir de " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV1: "Approuver",
        StatusApprobateurV2: "En cours",
      });

      window.location.reload()

    }else if (Demande[0].ApprobateurV2Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
      UserDisplayName2 = (await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV3Id[0]).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "En cours de " + UserDisplayName2,
        StatusDemandeV2:"Approuver",
        StatusDemandeV3:"En cours"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande Approuver par "+UserDisplayName + " le " + this.getCurrentDate());
        resultArray.push("Demande En cours de l'approbation de "+ UserDisplayName2 + " a partir de " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV2: "Approuver",
        StatusApprobateurV3: "En cours"
      });

      window.location.reload()

    }else if (Demande[0].ApprobateurV3Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "Approuver par " + UserDisplayName,
        StatusDemandeV3:"Approuver",
        StatusEquipeFinance: "En cours"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande Approuver par "+UserDisplayName + " le " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV3: "Approuver",
      });

      window.location.reload()

    }
  }


  public RejectValidation = async() => {
    var DemandeID = this.state.detailsListDemande.ID
    var UserDisplayName = ""
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;


    const Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
    .filter(`( (ApprobateurV1/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV2/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV3/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) )`)
    .get();

    if(Demande[0].ApprobateurV1Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "Rejeter par "+UserDisplayName,
        StatusDemandeV1: "Rejeter"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande Rejeter par "+UserDisplayName + " le " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV1: "Rejeter",
      });

      window.location.reload()

    }else if (Demande[0].ApprobateurV2Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "Rejeter par "+UserDisplayName,
        StatusDemandeV2: "Rejeter"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande Rejeter par "+UserDisplayName + " le " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV2: "Rejeter",
      });

      window.location.reload()

    }else if (Demande[0].ApprobateurV3Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "Rejeter par "+UserDisplayName,
        StatusDemandeV3: "Rejeter"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande Rejeter par "+UserDisplayName + " le " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV3: "Rejeter",
      });

      window.location.reload()

    }    
  }

  public ModifierValidation = async() => {
    var DemandeID = this.state.detailsListDemande.ID
    var UserDisplayName = ""
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;


    const Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
    .filter(`( (ApprobateurV1/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV2/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV3/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) )`)
    .get();

    if(Demande[0].ApprobateurV1Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "A modifier par "+UserDisplayName,
        StatusDemandeV1: "A modifier"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("A modifier par "+UserDisplayName + " le " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV1: "A modifier",
      });

      window.location.reload()

    }else if (Demande[0].ApprobateurV2Id.includes(currentUserID)){
      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "A modifier par "+UserDisplayName,
        StatusDemandeV2: "A modifier"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande A modifier par "+UserDisplayName + " le " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });


      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV2: "A modifier",
      });

      window.location.reload()

    }else if (Demande[0].ApprobateurV3Id.includes(currentUserID)){

      UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

      const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
        StatusDemande: "A modifier par "+UserDisplayName,
        StatusDemandeV3: "A modifier"
      })
      // Save historique block
      const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
      
      if (historyData.length > 0){
        var resultArray = JSON.parse(historyData[0].Actions);
        resultArray.push("Demande A modifier par "+UserDisplayName + " le " + this.getCurrentDate());
        const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
          Actions: JSON.stringify(resultArray)
        });
      };

      const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
        StatusApprobateurV3: "A modifier",
      });

      window.location.reload()
    }
  }

  public convertDateFormat(inputDate) {
    const dateParts = inputDate.split('T')[0].split('-');
    const day = dateParts[2];
    const month = dateParts[1];
    const year = dateParts[0];
  
    return `${day}/${month}/${year}`;
  }


  async componentDidMount() {
    this.getApprobateurOrder()
    this.getAllDemandeListData() ;
    this.getDemandeListData() ;
  }


  public render(): React.ReactElement<IApprobateurDashboardProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
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
        return item.FamilleProduit.toLowerCase().includes(FamilleFilter.toLowerCase()) && item.StatusDemande.toString().includes(StatusFilter);
      }); 
    }else {
      filteredData = listDemandeData
    }
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);


    return (
      <div className={styles.approbateurDashboard}>
        <div className={styles.title}><strong>Filtres</strong></div>
        <div className={styles.filters}>
          <label className={styles.title}>Demandeur : </label>
          <div className={styles.statusWrapper}>
            <Dropdown
              styles={dropdownStyles}
              placeholder="Selectionner votre demandeur"
              options={[
                { key: 'demandeur 1', text: 'demandeur 1' },
                { key: 'demandeur 2', text: 'demandeur 2' },
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
                <td>{demande.CreerPar}</td>
                <td>{this.convertDateFormat(demande.Created)}</td>
                <td className={styles.statut}>
                {this.state.currentApprobateurOrder === 1 && (
                  <>
                  {console.log(demande.StatusDemandeV1)} 
                    {demande.StatusDemandeV1.includes("En cours") && (
                      <>
                        <div className={styles.cercleBleu}></div>
                        &nbsp;{demande.StatusDemandeV1} de votre action
                      </>
                    )}
                    {demande.StatusDemandeV1.includes("Rejeter") && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{demande.StatusDemandeV1} par vous
                      </>
                    )}
                    {demande.StatusDemandeV1.includes("Annuler") && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{demande.StatusDemandeV1} par le demandeur
                      </>
                    )}
                    {demande.StatusDemandeV1.includes("A modifier") && (
                      <>
                        <div className={styles.cercleVert}></div>
                        &nbsp;{demande.StatusDemandeV1} par vous
                      </>
                    )}
                    {demande.StatusDemandeV1.includes("Approuver") && (
                      <>
                        <div className={styles.cercleYellow}></div>
                        &nbsp;{demande.StatusDemandeV1} par vous
                      </>
                    )}
                  </>
                )}
                {this.state.currentApprobateurOrder === 2 && (
                  <>
                  {console.log(demande.StatusDemandeV2)}
                  {demande.StatusDemandeV2.includes("En cours") && (
                    <>
                      <div className={styles.cercleBleu}></div>
                      &nbsp;{demande.StatusDemandeV2} de votre action
                    </>
                  )}
                  {demande.StatusDemandeV2.includes("Rejeter") && (
                    <>
                      <div className={styles.cercleRouge}></div>
                      &nbsp;{demande.StatusDemandeV2} par vous
                    </>
                  )}
                  {demande.StatusDemandeV2.includes("Annuler") && (
                    <>
                      <div className={styles.cercleRouge}></div>
                      &nbsp;{demande.StatusDemandeV2} par le demandeur
                    </>
                  )}
                  {demande.StatusDemandeV2.includes("A modifier") && (
                    <>
                      <div className={styles.cercleVert}></div>
                      &nbsp;{demande.StatusDemandeV2} par vous
                    </>
                  )}
                  {demande.StatusDemandeV2.includes("Approuver") && (
                    <>
                      <div className={styles.cercleYellow}></div>
                      &nbsp;{demande.StatusDemandeV2} par vous
                    </>
                  )}
                </>
                )}
                {console.log("TEST1",this.state.currentApprobateurOrder)}
                {console.log("TEST2",demande.StatusDemandeV3)}
                {this.state.currentApprobateurOrder === 3 && (
                  <>
                  {demande.StatusDemandeV3.includes("En cours") && (
                    <>
                      <div className={styles.cercleBleu}></div>
                      &nbsp;{demande.StatusDemandeV3} de votre action
                    </>
                  )}
                  {demande.StatusDemandeV3.includes("Rejeter") && (
                    <>
                      <div className={styles.cercleRouge}></div>
                      &nbsp;{demande.StatusDemandeV3} par vous
                    </>
                  )}
                  {demande.StatusDemandeV3.includes("Annuler") && (
                    <>
                      <div className={styles.cercleRouge}></div>
                      &nbsp;{demande.StatusDemandeV3} par le demandeur
                    </>
                  )}
                  {demande.StatusDemandeV3.includes("A modifier") && (
                    <>
                      <div className={styles.cercleVert}></div>
                      &nbsp;{demande.StatusDemandeV3} par vous
                    </>
                  )}
                  {demande.StatusDemandeV3.includes("Approuver") && (
                    <>
                      <div className={styles.cercleYellow}></div>
                      &nbsp;{demande.StatusDemandeV3} par vous
                    </>
                  )}
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
                  <td className={styles.value}>{this.state.detailsListDemande.FamilleProduit}</td>
                </tr>
                <tr>
                  <td >Sous famille :</td>
                  <td className={styles.value}>{this.state.detailsListDemande.SousFamilleProduit}</td>
                </tr>
                <tr>
                  <td >Réference de l'article :</td>
                  <td className={styles.value}> {this.getDateFormListJSON(this.state.detailsListDemande.Produit).map(produit => <>- {produit.DescriptionTechnique}<br></br></>)} </td>
                </tr>
                <tr>
                  <td >Bénéficiaire / Destination :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Prix estimatifs Total :</td>
                  <td className={styles.value}>{this.state.detailsListDemande.PrixTotal}DT</td>
                </tr>
                <tr>
                  <td >Délais de livraison souhaité :</td>
                  <td className={styles.value}>{this.state.detailsListDemande.DelaiLivraisionSouhaite}Jours</td>
                </tr>
                <tr>
                  <td >Piéce jointe :</td>
                  <td className={styles.value}>data</td>
                </tr>
                <tr>
                  <td >Status actuel :</td>
                  { (this.state.detailsListDemande.StatusDemande.includes("En cours")) && <td className={styles.value}><div className={styles.cercleBleu}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("Approuver")) && <td className={styles.value}><div className={styles.cercleVert}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("Annuler" )) && <td className={styles.value}><div className={styles.cercleRouge}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("Rejeter")) && <td className={styles.value}><div className={styles.cercleRouge}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("A modifier" )) && <td className={styles.value}><div className={styles.cercleYellow}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                </tr>
                <tr>
                  <td >Historique de la demande :</td>
                  <td className={styles.value}>{this.state.historiqueDemande.map(action => <>- {action} <br></br></>)}</td>
                </tr>
                {this.state.listDemandeDataForCurrentUser.includes(this.state.detailsListDemande.ID) && (
                  <>
                    <tr>
                      <td >Commentaire</td>
                      <td className={styles.value}>
                      <TextField 
                          className={controlClass.TextField} 
                          value={this.state.commentAction}
                          multiline 
                          onChange={(e) => this.handleChangeComment(e)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Approbation</td>
                      <td className={styles.value}>
                        <button style={{ backgroundColor: this.state.commentAction.length > 0 ? "green" : "gray" }}className={styles.btnRef} onClick={() => this.ApprouveValidation()} disabled={this.state.commentAction.length > 0 ? false : true}>                          
                          Approuver
                        </button>
                        &nbsp;
                        <button style={{ backgroundColor: this.state.commentAction.length > 0 ? "red" : "gray" }}className={styles.btnRef} onClick={() => this.RejectValidation()} disabled={this.state.commentAction.length > 0 ? false : true}>                          
                          Rejeter
                        </button>
                        &nbsp;
                        <button style={{ backgroundColor: this.state.commentAction.length > 0 ? "blue" : "gray" }}className={styles.btnRef} onClick={() => this.ModifierValidation()} disabled={this.state.commentAction.length > 0 ? false : true}>                          
                          Demande de modification
                        </button>
                      </td>
                    </tr>
                  </>
                )}
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