import * as React from 'react';
import styles from './ApprobateurDashboard.module.scss';
import styles2 from '../../demandeurDashboard/components/DemandeurDashboard.module.scss';
import { IApprobateurDashboardProps } from './IApprobateurDashboardProps';
import { DatePicker, Dropdown, IDropdownStyles, TextField, mergeStyleSets } from 'office-ui-fabric-react';
import { Web } from '@pnp/sp/webs';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import { convertDateFormat, convertFileToBase64, convertProductListSchema, createObjectFile, getCurrentDate } from '../../../tools/FunctionTools';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import SweetAlert2 from 'react-sweetalert2';
import { sendPerchaseRequest } from '../../../services/postPerchaseRequest';
import GraphService from '../../../services/GraphServices';
var img = require('../../../image/UCT_image.png');

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
    DemandeurFilter: '',
    StatusFilter: '',
    currentApprobateurOrder: 0,

    openDetailsDiv: false,
    listDemandeData: [] as any, 
    listDemandeDataForCurrentUser : [] as any,
    detailsListDemande: [] as any,
    historiqueDemande: [] as any ,
    cancelPopUp: false,
    demandeSelectedID: 0,
    commentAction:"",
    showSpinner: true,

    isOpen: false,
    currentAccordion : 0,
    filenames: [],
    RemplacantPoUp: false,
    startDate: null,
    endDate: null,
    replacedBy: [] as any,
    replacedByUserName: "",

    remplacantName: "",
    checkRemplacant: false,
    showAnotePopUp: false,

    checkActionCurrentUser: true,
    checkActionCurrentUserPopUp: false,
    showValidationPopUpRemplaçant: false,
    demandeurs: [],
    showApprobationPopUp: false,
    showModificationPopUp: false,
    showRejectionPopUp: false,
  }; 

  private _graphService = new GraphService(this.props.context);


  // When user click to next in pagination
  handleNextPage = () => {
    const { currentPage } = this.state;
    const { listDemandeData, itemsPerPage } = this.state;
    const totalPages = Math.ceil(listDemandeData.length / itemsPerPage);
    if (currentPage < totalPages) {
      this.setState({ currentPage: currentPage + 1 });
    }
  };


  // When user click to prev in pagination
  handlePrevPage = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      this.setState({ currentPage: currentPage - 1 });
    }
  };


  // When user click to each number in pagination
  handlePageClick = (page:any) => {
    this.setState({ currentPage: page });
  };


  // Handle change of comment in approbateur action
  private handleChangeComment = (event:any) => {
    this.setState({
      commentAction: event.target.value
    });
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


  // Get if the current approbateur is Approbateur 1, 2 or 3 (the order)
  private getApprobateurOrder = async () => {
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
    console.log(currentUserID)
    const DemandeIDs = await Web(this.props.url)
    .lists.getByTitle("WorkflowApprobation")
    .items.filter(`ApprobateurV1Id/Id eq ${currentUserID} and (StatusApprobateurV1 eq 'En cours' or StatusApprobateurV1 eq 'Approuvée' or StatusApprobateurV1 eq 'Rejetée' or StatusApprobateurV1 eq 'A modifier' or StatusApprobateurV1 eq '')`)
    .top(1) // Limit to only the first item
    .select('DemandeID', 'StatusApprobateurV1','ApprobateurV1Id','ApprobateurV2Id', 'ApprobateurV3Id', 'ApprobateurV4Id')
    .get();

    console.log("data1",DemandeIDs)
  
    if (DemandeIDs.length > 0){
      if (DemandeIDs[0].ApprobateurV1Id[0] === currentUserID) {
        console.log(DemandeIDs[0].ApprobateurV1Id[0])
        this.setState({ currentApprobateurOrder:1 });
      }else{
        const DemandeIDs = await Web(this.props.url)
        .lists.getByTitle("WorkflowApprobation")
        .items.filter(`
          ( 
            (ApprobateurV2Id/Id eq ${currentUserID} and (StatusApprobateurV2 eq 'En cours' or StatusApprobateurV2 eq 'Approuvée' or StatusApprobateurV2 eq 'Rejetée' or StatusApprobateurV2 eq 'A modifier' or StatusApprobateurV2 eq ''))
          )
        `)
        .top(2000)
        .orderBy("Created", false)
        .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id', 'ApprobateurV4Id')
        .get();
        console.log(DemandeIDs)
        if (DemandeIDs.length > 0){
          if (DemandeIDs[0].ApprobateurV2Id[0] === currentUserID) {
            console.log(DemandeIDs[0].ApprobateurV2Id[0])
            this.setState({ currentApprobateurOrder:2 });
          }
        }else {
          const DemandeIDs = await Web(this.props.url)
          .lists.getByTitle("WorkflowApprobation")
          .items.filter(`
            ( 
              (ApprobateurV3Id/Id eq ${currentUserID} and (StatusApprobateurV3 eq 'En cours' or StatusApprobateurV3 eq 'Approuvée' or StatusApprobateurV3 eq 'Rejetée' or StatusApprobateurV3 eq 'A modifier' or StatusApprobateurV3 eq ''))
            )
          `)
          .top(2000)
          .orderBy("Created", false)
          .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id' , 'ApprobateurV4Id')
          .get();
          console.log(DemandeIDs)

          if (DemandeIDs.length > 0){
            if (DemandeIDs[0].ApprobateurV3Id[0] === currentUserID) {
              console.log(DemandeIDs[0].ApprobateurV3Id[0])
              this.setState({ currentApprobateurOrder:3 });
            }
          }else {
            const DemandeIDs = await Web(this.props.url)
            .lists.getByTitle("WorkflowApprobation")
            .items.filter(`
              ( 
                (ApprobateurV4Id/Id eq ${currentUserID} and (StatusApprobateurV4 eq 'En cours' or StatusApprobateurV4 eq 'Approuvée' or StatusApprobateurV4 eq 'Rejetée' or StatusApprobateurV4 eq 'A modifier' or StatusApprobateurV4 eq ''))
              )
            `)
            .top(2000)
            .orderBy("Created", false)
            .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id' , 'ApprobateurV4Id')
            .get();
            console.log(DemandeIDs)

            if (DemandeIDs.length > 0){
              if (DemandeIDs[0].ApprobateurV4Id[0] === currentUserID) {
                console.log(DemandeIDs[0].ApprobateurV4Id[0])
                this.setState({ currentApprobateurOrder:4 });
              }
            }
          }
        }
      }
    }else {
      const DemandeIDs = await Web(this.props.url)
      .lists.getByTitle("WorkflowApprobation")
      .items.filter(`
        ( 
          (ApprobateurV2Id/Id eq ${currentUserID} and (StatusApprobateurV2 eq 'En cours' or StatusApprobateurV2 eq 'Approuvée' or StatusApprobateurV2 eq 'Rejetée' or StatusApprobateurV2 eq 'A modifier' or StatusApprobateurV2 eq ''))
        )
      `)
      .top(2000)
      .orderBy("Created", false)
      .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id', 'ApprobateurV4Id')
      .get();
      console.log(DemandeIDs)
      if (DemandeIDs.length > 0){
        if (DemandeIDs[0].ApprobateurV2Id[0] === currentUserID) {
          console.log(DemandeIDs[0].ApprobateurV2Id[0])
          this.setState({ currentApprobateurOrder:2 });
        }else {
          const DemandeIDs = await Web(this.props.url)
          .lists.getByTitle("WorkflowApprobation")
          .items.filter(`
            ( 
              (ApprobateurV3Id/Id eq ${currentUserID} and (StatusApprobateurV3 eq 'En cours' or StatusApprobateurV3 eq 'Approuvée' or StatusApprobateurV3 eq 'Rejetée' or StatusApprobateurV3 eq 'A modifier' or StatusApprobateurV3 eq ''))
            )
          `)
          .top(2000)
          .orderBy("Created", false)
          .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id' , 'ApprobateurV4Id')
          .get();
          console.log(DemandeIDs)

          if (DemandeIDs.length > 0){
            if (DemandeIDs[0].ApprobateurV3Id[0] === currentUserID) {
              console.log(DemandeIDs[0].ApprobateurV3Id[0])
              this.setState({ currentApprobateurOrder:3 });
            }
          }else {
            const DemandeIDs = await Web(this.props.url)
            .lists.getByTitle("WorkflowApprobation")
            .items.filter(`
              ( 
                (ApprobateurV4Id/Id eq ${currentUserID} and (StatusApprobateurV4 eq 'En cours' or StatusApprobateurV4 eq 'Approuvée' or StatusApprobateurV4 eq 'Rejetée' or StatusApprobateurV4 eq 'A modifier' or StatusApprobateurV4 eq ''))
              )
            `)
            .top(2000)
            .orderBy("Created", false)
            .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id' , 'ApprobateurV4Id')
            .get();
            console.log(DemandeIDs)

            if (DemandeIDs.length > 0){
              if (DemandeIDs[0].ApprobateurV4Id[0] === currentUserID) {
                console.log(DemandeIDs[0].ApprobateurV4Id[0])
                this.setState({ currentApprobateurOrder:4 });
              }
            }
          }
        }
      }else {
        const DemandeIDs = await Web(this.props.url)
        .lists.getByTitle("WorkflowApprobation")
        .items.filter(`
          ( 
            (ApprobateurV3Id/Id eq ${currentUserID} and (StatusApprobateurV3 eq 'En cours' or StatusApprobateurV3 eq 'Approuvée' or StatusApprobateurV3 eq 'Rejetée' or StatusApprobateurV3 eq 'A modifier' or StatusApprobateurV3 eq ''))
          )
        `)
        .top(2000)
        .orderBy("Created", false)
        .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id' , 'ApprobateurV4Id')
        .get();
        console.log(DemandeIDs)

        if (DemandeIDs.length > 0){
          if (DemandeIDs[0].ApprobateurV3Id[0] === currentUserID) {
            console.log(DemandeIDs[0].ApprobateurV3Id[0])
            this.setState({ currentApprobateurOrder:3 });
          }else {
            const DemandeIDs = await Web(this.props.url)
            .lists.getByTitle("WorkflowApprobation")
            .items.filter(`
              ( 
                (ApprobateurV4Id/Id eq ${currentUserID} and (StatusApprobateurV4 eq 'En cours' or StatusApprobateurV4 eq 'Approuvée' or StatusApprobateurV4 eq 'Rejetée' or StatusApprobateurV4 eq 'A modifier' or StatusApprobateurV4 eq ''))
              )
            `)
            .top(2000)
            .orderBy("Created", false)
            .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id' , 'ApprobateurV4Id')
            .get();
            console.log(DemandeIDs)

            if (DemandeIDs.length > 0){
              if (DemandeIDs[0].ApprobateurV4Id[0] === currentUserID) {
                console.log(DemandeIDs[0].ApprobateurV4Id[0])
                this.setState({ currentApprobateurOrder:4 });
              }
            }
          }
        }else {
          const DemandeIDs = await Web(this.props.url)
          .lists.getByTitle("WorkflowApprobation")
          .items.filter(`
            ( 
              (ApprobateurV4Id/Id eq ${currentUserID} and (StatusApprobateurV4 eq 'En cours' or StatusApprobateurV4 eq 'Approuvée' or StatusApprobateurV4 eq 'Rejetée' or StatusApprobateurV4 eq 'A modifier' or StatusApprobateurV4 eq ''))
            )
          `)
          .top(2000)
          .orderBy("Created", false)
          .select('DemandeID', 'StatusApprobateurV2', 'ApprobateurV1Id', 'ApprobateurV2Id', 'ApprobateurV3Id' , 'ApprobateurV4Id')
          .get();
          console.log(DemandeIDs)

          if (DemandeIDs.length > 0){
            if (DemandeIDs[0].ApprobateurV4Id[0] === currentUserID) {
              console.log(DemandeIDs[0].ApprobateurV4Id[0])
              this.setState({ currentApprobateurOrder:4 });
            }
          }
        }
      }
    }
  }


  // Get attachement files from item by her ID
  private getAttachementFileName = async(demandeID) => {
    const attachmentFiles = await Web(this.props.url).lists.getByTitle('DemandeAchat').items.getById(demandeID).attachmentFiles.get();

    // Extract file names from the attachment files
    const fileNames = attachmentFiles.map((attachment) => attachment.FileName);
    return fileNames
  }

  // When user click to open the detail popup
  private openDetailsDiv = async (demandeID: any) => {
    const selectedDemande = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeID).get();
    console.log(selectedDemande)
    const historiqueDemande = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.filter(`DemandeID eq '${demandeID}'`).get(); 
    var historiqueActions
    if (historiqueDemande.length === 1){
      historiqueActions = JSON.parse(historiqueDemande[0].Actions)
    }
    this.setState({openDetailsDiv: true, detailsListDemande:selectedDemande, historiqueDemande:historiqueActions})

    const filenames = await this.getAttachementFileName(demandeID)
    this.setState({openDetailsDiv: true, detailsListDemande:selectedDemande, historiqueDemande:historiqueActions, filenames:filenames})
  }


  // Get all demandes in list 
  private getAllDemandeListData = async() => {
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
      .top(2000)
      .orderBy("Created", false)
      .select('DemandeID','StatusApprobateurV1','StatusApprobateurV2','StatusApprobateurV3','StatusApprobateurV4')
      .get();
    console.log(DemandeIDs)
    const listDemandeDataPromises = DemandeIDs.map(async (demande) => {
      return await Web(this.props.url).lists.getByTitle("DemandeAchat").items
        .top(2000)
        .orderBy("Created", false)
        .expand("Ecole")
        .select("Attachments", "AuthorId", "DelaiLivraisionSouhaite", "DemandeurId", "DemandeurStringId", "DescriptionTechnique", "Ecole/Title", "Ecole/Ecole", "FamilleProduit", "ID", "Prix", "PrixTotal", "Produit", "Quantite", "SousFamilleProduit", "StatusDemande", "Title", "CentreDeGestion")
        .getById(demande.DemandeID)();
    });
    
    // Wait for all promises to resolve
    const listDemandeData = await Promise.all(listDemandeDataPromises);
    console.log(listDemandeData)
    this.setState({listDemandeData})
  }


  // function to get demande of current user
  private getDemandeListData = async () => {
    var listData = [];
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;
    const DemandeIDs = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
      .filter(`( (ApprobateurV1/Id eq ${currentUserID} and StatusApprobateurV1 eq 'En cours') or (ApprobateurV2/Id eq ${currentUserID} and StatusApprobateurV2 eq 'En cours') or (ApprobateurV3/Id eq ${currentUserID} and StatusApprobateurV3 eq 'En cours') or (ApprobateurV4/Id eq ${currentUserID} and StatusApprobateurV4 eq 'En cours') )`)
      .top(2000)
      .orderBy("Created", false)
      .get();
    if (DemandeIDs.length > 0) {
      for (const demandeID of DemandeIDs) {
        listData.push(parseInt(demandeID.DemandeID));
      }
    }
    console.log(listData)
    this.setState({listDemandeDataForCurrentUser:listData})
  };


  
  // Clear button in filter
  private clearFilterButton = () => {
    this.setState({StatusFilter:'', DemandeurFilter: ''});
  }



  // Function to transform the historique result with JSON format to String format
  public getDateFormListJSON = (produits: any) => {
    var listProduits = JSON.parse(produits)
    return listProduits
  }


  // En cours
  private sendDemandeToErp = async(demandeID) => {
    const demande = await Web(this.props.url).lists.getByTitle('DemandeAchat').items.select('*,Demandeur/Title,Demandeur/EMail').expand('Demandeur').filter(`ID eq ${demandeID}`).get();
    const user = await this._graphService.getUserId(demande[0].Demandeur['EMail']); 
    const ArticleFileName = JSON.parse(demande[0].Produit)[0].ArticleFileData.name ;
    var dataFromERP

    console.log(ArticleFileName)     
    console.log(demande[0].FileBase64)

    if (demande[0].FileBase64.length > 0){
      dataFromERP = await sendPerchaseRequest(
        user["employeeId"],
        demande[0].CreerPar,
        demande[0].CentreDeGestion,
        demande[0].FamilleProduitREF,
        convertProductListSchema(JSON.parse(demande[0].Produit)),
        ArticleFileName.toString(),
        demande[0].FileBase64
      )
    }else {
      dataFromERP = await sendPerchaseRequest(
        user["employeeId"],
        demande[0].CreerPar,
        demande[0].CentreDeGestion,
        demande[0].FamilleProduitREF,
        convertProductListSchema(JSON.parse(demande[0].Produit)),
        "",
        ""
      )
    }
    return dataFromERP
  }



  // Function fo approuve a demande and make changes in workflowApprobation and historique list
  public ApprouveValidation = async() => {
    var DemandeID = this.state.detailsListDemande.ID
    var UserDisplayName = ""
    var UserDisplayName2 = ""
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;


    const Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
    .filter(`( (ApprobateurV1/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV2/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV3/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV4/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) )`)
    .get();
    if (Demande[0].ApprobateurV3Id === null){
      if(Demande[0].ApprobateurV1Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
        

        if (Demande[0].ApprobateurV2Id.length > 1){
          await Promise.all(
            Demande[0].ApprobateurV2Id.map(async (approbateur) => {
              try {
                const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                const UserDisplayName2Title = user.Title;
  
                if (UserDisplayName2.length === 0) {
                  UserDisplayName2 = UserDisplayName2Title;
                } else {
                  UserDisplayName2 = UserDisplayName2 + " Ou " + UserDisplayName2Title;
                }
              } catch (error) {
                console.error(`Error retrieving user information for ${approbateur}:`, error);
              }
            })
          );
        }else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV2Id[0]).get();
          UserDisplayName2 = user.Title;
        }
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "En cours de " + UserDisplayName2,
          StatusDemandeV1:"Approuvée",
          StatusDemandeV2:"En cours"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Approuvée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Demande En cours de l'approbation de "+ UserDisplayName2 + " a partir de " + getCurrentDate());
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV1: "Approuvée",
          CommentaireApprobateurV1: this.state.commentAction,
          StatusApprobateurV2: "En cours",
        });
  
        
  
      }else if (Demande[0].ApprobateurV2Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;

        if (Demande[0].ApprobateurV4Id.length > 1){
          await Promise.all(
            Demande[0].ApprobateurV4Id.map(async (approbateur) => {
              try {
                const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                const UserDisplayName2Title = user.Title;
  
                if (UserDisplayName2.length === 0) {
                  UserDisplayName2 = UserDisplayName2Title;
                } else {
                  UserDisplayName2 = UserDisplayName2 + " Ou " + UserDisplayName2Title;
                }
              } catch (error) {
                console.error(`Error retrieving user information for ${approbateur}:`, error);
              }
            })
          );
        }else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV4Id[0]).get();
          UserDisplayName2 = user.Title;
        }
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "En cours de " + UserDisplayName2,
          StatusDemandeV2:"Approuvée",
          StatusDemandeV4:"En cours"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Approuvée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Demande En cours de l'approbation de "+ UserDisplayName2 + " a partir de " + getCurrentDate());
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV2: "Approuvée",
          CommentaireApprobateurV2: this.state.commentAction,
          StatusApprobateurV4: "En cours"
        });
  
  
      }else if (Demande[0].ApprobateurV4Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Approuvée par " + UserDisplayName,
          StatusDemandeV4:"Approuvée",
          StatusEquipeFinance: "En cours"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Approuvée par "+UserDisplayName + " le " + getCurrentDate());
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV4: "Approuvée",
          CommentaireApprobateurV4: this.state.commentAction,
        });

        const sendDemandeToErp = await this.sendDemandeToErp(DemandeID) ;
        console.log(sendDemandeToErp)
        if(sendDemandeToErp['Status'] === "200"){
          const demandeData = await Web(this.props.url).lists.getByTitle('DemandeAchat').items.filter(`ID eq ${DemandeID}`).get();
          const savePurshaseRequestNumber = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeData[0].ID).update({
            ReferenceDemande: sendDemandeToErp['PurchaseRequestNo']
          });
        }
      }
    }else {
      if(Demande[0].ApprobateurV1Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
        if (Demande[0].ApprobateurV2Id.length > 1){
          await Promise.all(
            Demande[0].ApprobateurV2Id.map(async (approbateur) => {
              try {
                const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                const UserDisplayName2Title = user.Title;
  
                if (UserDisplayName2.length === 0) {
                  UserDisplayName2 = UserDisplayName2Title;
                } else {
                  UserDisplayName2 = UserDisplayName2 + " Ou " + UserDisplayName2Title;
                }
              } catch (error) {
                console.error(`Error retrieving user information for ${approbateur}:`, error);
              }
            })
          );
        }else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV2Id[0]).get();
          UserDisplayName2 = user.Title;
        }

        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "En cours de " + UserDisplayName2,
          StatusDemandeV1:"Approuvée",
          StatusDemandeV2:"En cours"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Approuvée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Demande En cours de l'approbation de "+ UserDisplayName2 + " a partir de " + getCurrentDate());
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV1: "Approuvée",
          CommentaireApprobateurV1: this.state.commentAction,
          StatusApprobateurV2: "En cours",
        });
  
        window.location.reload()
  
      }else if (Demande[0].ApprobateurV2Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
        if (Demande[0].ApprobateurV3Id.length > 1){
          await Promise.all(
            Demande[0].ApprobateurV3Id.map(async (approbateur) => {
              try {
                const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                const UserDisplayName2Title = user.Title;
  
                if (UserDisplayName2.length === 0) {
                  UserDisplayName2 = UserDisplayName2Title;
                } else {
                  UserDisplayName2 = UserDisplayName2 + " Ou " + UserDisplayName2Title;
                }
              } catch (error) {
                console.error(`Error retrieving user information for ${approbateur}:`, error);
              }
            })
          );
        }else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV3Id[0]).get();
          UserDisplayName2 = user.Title;
        }
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "En cours de " + UserDisplayName2,
          StatusDemandeV2:"Approuvée",
          StatusDemandeV3:"En cours"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Approuvée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Demande En cours de l'approbation de "+ UserDisplayName2 + " a partir de " + getCurrentDate());
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV2: "Approuvée",
          CommentaireApprobateurV2: this.state.commentAction,
          StatusApprobateurV3: "En cours"
        });
  
  
      }else if (Demande[0].ApprobateurV3Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
        if (Demande[0].ApprobateurV4Id.length > 1){
          await Promise.all(
            Demande[0].ApprobateurV4Id.map(async (approbateur) => {
              try {
                const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
                const UserDisplayName2Title = user.Title;
  
                if (UserDisplayName2.length === 0) {
                  UserDisplayName2 = UserDisplayName2Title;
                } else {
                  UserDisplayName2 = UserDisplayName2 + " Ou " + UserDisplayName2Title;
                }
              } catch (error) {
                console.error(`Error retrieving user information for ${approbateur}:`, error);
              }
            })
          );
        }else {
          const user = await Web(this.props.url).siteUsers.getById(Demande[0].ApprobateurV4Id[0]).get();
          UserDisplayName2 = user.Title;
        }

        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "En cours de " + UserDisplayName2,
          StatusDemandeV3:"Approuver",
          StatusDemandeV4:"En cours"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Approuver par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Demande En cours de l'approbation de "+ UserDisplayName2 + " a partir de " + getCurrentDate());
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV3: "Approuver",
          CommentaireApprobateurV3: this.state.commentAction,
          StatusApprobateurV4: "En cours"
        });
  
  
      }else if (Demande[0].ApprobateurV4Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Approuvée par " + UserDisplayName,
          StatusDemandeV4:"Approuvée",
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Approuvée par "+UserDisplayName + " le " + getCurrentDate());
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };

        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV4: "Approuvée",
          CommentaireApprobateurV4: this.state.commentAction,
        });


        
        const sendDemandeToErp = await this.sendDemandeToErp(DemandeID) ;
        console.log(sendDemandeToErp)
        if(sendDemandeToErp['Status'] === "200"){
          const demandeData = await Web(this.props.url).lists.getByTitle('DemandeAchat').items.filter(`ID eq ${DemandeID}`).get();
          const savePurshaseRequestNumber = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(demandeData[0].ID).update({
            ReferenceDemande: sendDemandeToErp['PurchaseRequestNo']
          });
        }
  
      }
    }
    this.setState({showApprobationPopUp: true})
  }



  // Function fo Reject a demande and make changes in workflowApprobation and historique list
  public RejectValidation = async() => {
    var DemandeID = this.state.detailsListDemande.ID
    var UserDisplayName = ""
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;


    const Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
    .filter(`( (ApprobateurV1/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV2/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV3/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV4/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) )`)
    .get();

    if(Demande[0].ApprobateurV3Id === null){
      if(Demande[0].ApprobateurV1Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Rejetée par "+UserDisplayName,
          StatusDemandeV1: "Rejetée"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Rejetée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV1: "Rejetée",
          CommentaireApprobateurV1: this.state.commentAction
        });
  
  
      }else if (Demande[0].ApprobateurV2Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Rejetée par "+UserDisplayName,
          StatusDemandeV2: "Rejetée"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Rejetée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV2: "Rejetée",
          CommentaireApprobateurV2: this.state.commentAction
        });
  
  
      }else if (Demande[0].ApprobateurV4Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Rejetée par "+UserDisplayName,
          StatusDemandeV4: "Rejetée"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Rejetée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV4: "Rejetée",
          CommentaireApprobateurV4: this.state.commentAction
        });
  
  
      }  
    }else {
      if(Demande[0].ApprobateurV1Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Rejetée par "+UserDisplayName,
          StatusDemandeV1: "Rejetée"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Rejetée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV1: "Rejetée",
          CommentaireApprobateurV1: this.state.commentAction
        });
  
  
      }else if (Demande[0].ApprobateurV2Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Rejetée par "+UserDisplayName,
          StatusDemandeV2: "Rejetée"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Rejetée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV2: "Rejetée",
          CommentaireApprobateurV2: this.state.commentAction
        });
  
  
      }else if (Demande[0].ApprobateurV3Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Rejetée par "+UserDisplayName,
          StatusDemandeV3: "Rejetée"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Rejetée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV3: "Rejetée",
          CommentaireApprobateurV3: this.state.commentAction
        });
  
  
      }else if (Demande[0].ApprobateurV4Id.includes(currentUserID)){
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "Rejetée par "+UserDisplayName,
          StatusDemandeV4: "Rejetée"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande Rejetée par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV4: "Rejetée",
          CommentaireApprobateurV4: this.state.commentAction
        });
  
  
      }  
    }
 
    this.setState({showRejectionPopUp: true})
  }



  // Function fo Update a demande and make changes in workflowApprobation and historique list
  public ModifierValidation = async() => {
    var DemandeID = this.state.detailsListDemande.ID
    var UserDisplayName = ""
    const currentUserID = (await Web(this.props.url).currentUser.get()).Id;


    const Demande = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
    .filter(`( (ApprobateurV1/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV2/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV3/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) or (ApprobateurV4/Id eq ${currentUserID} and DemandeID eq ${DemandeID}) )`)
    .get();

    if (Demande[0].ApprobateurV3Id === null){
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
          resultArray.push("A modifier par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV1: "A modifier",
          Notif: "",
          CommentaireApprobateurV1: this.state.commentAction
        });
  
  
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
          resultArray.push("Demande A modifier par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
  
  
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV2: "A modifier",
          Notif: "",
          CommentaireApprobateurV2: this.state.commentAction
        });
  
  
      }else if (Demande[0].ApprobateurV4Id.includes(currentUserID)){
  
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "A modifier par "+UserDisplayName,
          StatusDemandeV4: "A modifier"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande A modifier par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV4: "A modifier",
          Notif: "",
          CommentaireApprobateurV4: this.state.commentAction
        });
  
      }
    }else {
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
          resultArray.push("A modifier par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV1: "A modifier",
          Notif: "",
          CommentaireApprobateurV1: this.state.commentAction
        });
  
  
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
          resultArray.push("Demande A modifier par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
  
  
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV2: "A modifier",
          Notif: "",
          CommentaireApprobateurV2: this.state.commentAction
        });
  
  
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
          resultArray.push("Demande A modifier par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV3: "A modifier",
          Notif: "",
          CommentaireApprobateurV3: this.state.commentAction
        });
  
      }else if (Demande[0].ApprobateurV4Id.includes(currentUserID)){
  
        UserDisplayName = (await Web(this.props.url).siteUsers.getById(currentUserID).get()).Title ;
  
        const updateDemandeAchat = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.getById(DemandeID).update({
          StatusDemande: "A modifier par "+UserDisplayName,
          StatusDemandeV4: "A modifier"
        })
        // Save historique block
        const historyData = await Web(this.props.url).lists.getByTitle('HistoriqueDemande').items.filter(`DemandeID eq ${DemandeID}`).get();
        
        if (historyData.length > 0){
          var resultArray = JSON.parse(historyData[0].Actions);
          resultArray.push("Demande A modifier par "+UserDisplayName + " le " + getCurrentDate());
          resultArray.push("Commentaire : " + this.state.commentAction);
          const saveHistorique = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items.getById(historyData[0].ID).update({
            Actions: JSON.stringify(resultArray)
          });
        };
  
        const updateWorkFlowApprobation = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(Demande[0].ID).update({
          StatusApprobateurV4: "A modifier",
          Notif: "",
          CommentaireApprobateurV4: this.state.commentAction
        });
  
      }
    }

    this.setState({showModificationPopUp: true})
  }


  toggleAccordion = (Accordionindex) => {
    var isStatePrev = this.state.isOpen
    console.log(Accordionindex)

    this.setState({isOpen: !isStatePrev, currentAccordion:Accordionindex})
  };


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

  
  private selectedDate = (year, month, day, startOrEndDate) => {
    if (startOrEndDate){
      const date = year.toString() + "-" + month.toString() + "-" + day.toString();
      const newDateFormat = new Date(date);
      this.setState({startDate: newDateFormat})
    }else {
      const date = year.toString() + "-" + month.toString() + "-" + day.toString();
      const newDateFormat = new Date(date);
      console.log('new Date format',newDateFormat)
      this.setState({endDate: newDateFormat})
    }
  }


  // get new user when we change a new user in "Remplacé Par" 
  public _getPeoplePickerItems = async (items: any[]) => {
    if (items.length > 0) {
      if (items[0].id && items[0].text && items[0].secondaryText){
        let replacedUserData = {ID:items[0].id,name:items[0].text,email:items[0].secondaryText}
        this.setState({replacedBy:[replacedUserData]})
        this.setState({replacedByUserName:items[0].text})
      }
    }else {
      this.setState({replacedBy:[]})
      this.setState({replacedByUserName:""})
    }
  }


  private checkUserActions = async() => {
    const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
    const now: string = new Date().toISOString(); // Format the current date to ISO 8601
    const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
    .filter(`DemandeurId eq ${currentUserID} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'AP'`)
    .orderBy('Created', false)
    .top(1)
    .get();

    if (remplacantTest.length > 0) {
      this.setState({checkActionCurrentUser : false, checkActionCurrentUserPopUp: true});
    }
  }


  // Check if the current user in list of remplaçant if true get the list of demands of the other demander
  private checkRemplacantDemandes = async (): Promise<any[]> => {
    try {
      const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
      const now: string = new Date().toISOString(); // Format the current date to ISO 8601
      const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
      .filter(`RemplacantId eq ${currentUserID} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'AP'`)
      .orderBy('Created', false)
      .top(1)
      .select("Demandeur/Title", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
      .expand("Demandeur")
      .get();

      console.log(remplacantTest);
      return remplacantTest;

    } catch (error) {
      console.error("Error checking remplacant demandes:", error);
      return [];
    }
  }


  private ajouterAutreApprobateur = async() => {
    const currentUser = (await Web(this.props.url).currentUser.get()).Id ;
    const remplacant = this.state.replacedBy[0].ID ;
    const startDate = this.state.startDate ;
    const endDate = this.state.endDate ;


    // Save data in Remplacant Module Achat list
    const data = await Web(this.props.url).lists.getByTitle("RemplacantsModuleAchat").items.add({
      "DemandeurId": currentUser ,
      "RemplacantId": remplacant,
      "DateDeDebut": startDate,
      "DateDeFin": endDate,
      "TypeRemplacement": "AP"
    });

    const fieldName = `ApprobateurV${this.state.currentApprobateurOrder}Id`;

    // Fetch items based on the current approver order
    const demandes = await Web(this.props.url).lists.getByTitle('WorkflowApprobation').items.filter(`${fieldName} eq ${currentUser}`).get();

    console.log(demandes);
    if (demandes.length > 0) {
      // Niveau 1
      if (demandes[0].ApprobateurV1Id[0] === currentUser) {
        for (const demande of demandes) {
          try {
            await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(demande.ID).update({
              ApprobateurV1Id: {
                results: [demande.ApprobateurV1Id[0], remplacant]
              }
            });
            console.log(`Updated item with ID ${demande.ID}`);
          } catch (error) {
            console.error(`Error updating item with ID ${demande.ID}:`, error);
          }
        }
        // Niveau 2
      } else if (demandes[0].ApprobateurV2Id[0] === currentUser) {
        for (const demande of demandes) {
          try {
            await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(demande.ID).update({
              ApprobateurV2Id: {
                results: [demande.ApprobateurV2Id[0], remplacant]
              }
            });
            console.log(`Updated item with ID ${demande.ID}`);
          } catch (error) {
            console.error(`Error updating item with ID ${demande.ID}:`, error);
          }
        }
        // Niveau 3
      }else if (demandes[0].ApprobateurV3Id[0] === currentUser) {
        for (const demande of demandes) {
          try {
            await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(demande.ID).update({
              ApprobateurV3Id: {
                results: [demande.ApprobateurV3Id[0], remplacant]
              }
            });
            console.log(`Updated item with ID ${demande.ID}`);
          } catch (error) {
            console.error(`Error updating item with ID ${demande.ID}:`, error);
          }
        }
      }else if (demandes[0].ApprobateurV4Id[0] === currentUser) {
        for (const demande of demandes) {
          try {
            await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items.getById(demande.ID).update({
              ApprobateurV4Id: {
                results: [demande.ApprobateurV4Id[0], remplacant]
              }
            });
            console.log(`Updated item with ID ${demande.ID}`);
          } catch (error) {
            console.error(`Error updating item with ID ${demande.ID}:`, error);
          }
        }
      }
    }
    
    this.setState({RemplacantPoUp: false, showValidationPopUpRemplaçant: true})  
  }


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
 
         // Now 'result' holds the demands grouped by DemandeurID
         console.log(result);
         return result;
    } catch (error) {
        console.error("Error fetching demandes:", error);
    }
  }



  async componentDidMount() {

    // Check the permissions of current user
    this.checkUserActions() ;
    // Check if user have remplacant or not
    const checkTestRemplacant = await this.checkRemplacantDemandes() ;
    if (checkTestRemplacant.length > 0){
      this.setState({checkRemplacant: true, showAnotePopUp: true, remplacantName: checkTestRemplacant[0].Demandeur.Title, remplacantID:checkTestRemplacant[0].DemandeurId})
    }

    const demandeurs = await this.getAllDemandeurs()
    console.log(demandeurs)
    this.setState({demandeurs})
    this.getApprobateurOrder() ;
    this.getAllDemandeListData() ;
    this.getDemandeListData() ;
    setTimeout(() => {
      this.setState({ showSpinner: false});
    }, 4000);
  }


  public render(): React.ReactElement<IApprobateurDashboardProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };
    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });
    const { currentPage, itemsPerPage, listDemandeData, DemandeurFilter, StatusFilter } = this.state;
    var filteredData
    if(DemandeurFilter.length > 0 || StatusFilter.length > 0){
      console.log(DemandeurFilter)
      console.log(StatusFilter)
      filteredData = listDemandeData.filter((item:any) => {
        return item.DemandeurId.toString().toLowerCase().includes(DemandeurFilter.toLowerCase()) && item.StatusDemande.toString().includes(StatusFilter);
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
                { key: 'En cours', text: 'En cours' },
                { key: 'Rejetée', text: 'Rejetée' },
                { key: 'A modifier', text: 'A modifier' },
                { key: 'Approuvée', text: 'Approuvée' },
              ]}
              defaultSelectedKey={this.state.StatusFilter}
              onChanged={(value) => this.setState({StatusFilter:value.key , currentPage: 1})}
              style={{ width: '189.84px' }} // Specify the width you desire
            />
          </div>
          <div className={styles.statusWrapper}>
            <button className={styles.btnRef} onClick={() => this.clearFilterButton()}>Rafraichir</button>
          </div>
            <button className={styles.btnRef} onClick={() => this.setState({RemplacantPoUp: !this.state.RemplacantPoUp})}>Choisir un remplaçant</button>        
          </div>
        <div className={styles.paginations} style={{ textAlign: 'center' }}>
          {this.state.showSpinner && <span className={styles.loader}></span>}
        </div>        
        {(listDemandeData.length === 0 && !this.state.showSpinner) && <div style={{textAlign:'center'}}><h4>Aucune données trouvées</h4></div>}
        {(listDemandeData.length > 0 && !this.state.showSpinner) && 
          <div id="spListContainer"> 
            <table style={{borderCollapse: "collapse", width:"100%"}}>
              <tr><th className={styles.textCenter}>#</th> <th>Demandeur</th> <th>Centre de gestion</th> <th>Date de la Demande</th><th>Status de la demande</th><th>Détail</th></tr>
              {currentItems.map((demande:any) =>
                <tr>
                  <td>
                    {demande.Attachments && <svg onClick={() => this.openAttachementFile(demande.ID)} version="1.1" className="icon_03c0be98" id="file162" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{"height":"14px", "cursor":"pointer"}} xmlSpace="preserve">
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
                  <td>{demande.CreerPar}</td>
                  <td>{demande.CentreDeGestion}</td>
                  {console.log(demande)}
                  <td>{convertDateFormat(demande.Created)}</td>
                  <td className={styles.statut}>
                  {this.state.currentApprobateurOrder === 1 && (
                    <>
                    {console.log(demande.StatusDemandeV1)} 
                      {demande.StatusDemandeV1.includes("En cours") && (
                        <>
                          <div className={styles.cercleBleu}></div>
                          &nbsp;{demande.StatusDemandeV1}
                        </>
                      )}
                      {demande.StatusDemandeV1.includes("Rejetée") && (
                        <>
                          <div className={styles.cercleRouge}></div>
                          &nbsp;{demande.StatusDemandeV1}
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
                          &nbsp;{demande.StatusDemandeV1}
                        </>
                      )}
                      {demande.StatusDemandeV1.includes("Approuvée") && (
                        <>
                          <div className={styles.cercleYellow}></div>
                          &nbsp;{demande.StatusDemandeV1}
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
                        &nbsp;{demande.StatusDemandeV2}
                      </>
                    )}
                    {demande.StatusDemandeV2.includes("Rejetée") && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{demande.StatusDemandeV2}
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
                        &nbsp;{demande.StatusDemandeV2}
                      </>
                    )}
                    {demande.StatusDemandeV2.includes("Approuvée") && (
                      <>
                        <div className={styles.cercleYellow}></div>
                        &nbsp;{demande.StatusDemandeV2}
                      </>
                    )}
                  </>
                  )}
                  {(this.state.currentApprobateurOrder === 3) && (
                    <>
                    {demande.StatusDemandeV3.includes("En cours") && (
                      <>
                        <div className={styles.cercleBleu}></div>
                        &nbsp;{demande.StatusDemandeV3}
                      </>
                    )}
                    {demande.StatusDemandeV3.includes("Rejetée") && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{demande.StatusDemandeV3}
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
                        &nbsp;{demande.StatusDemandeV3}
                      </>
                    )}
                    {demande.StatusDemandeV3.includes("Approuvée") && (
                      <>
                        <div className={styles.cercleYellow}></div>
                        &nbsp;{demande.StatusDemandeV3}
                      </>
                    )}
                  </>
                  )}
                  {this.state.currentApprobateurOrder === 4 && (
                    <>
                    {demande.StatusDemandeV4.includes("En cours") && (
                      <>
                        <div className={styles.cercleBleu}></div>
                        &nbsp;{demande.StatusDemandeV4}
                      </>
                    )}
                    {demande.StatusDemandeV4.includes("Rejetée") && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{demande.StatusDemandeV4}
                      </>
                    )}
                    {demande.StatusDemandeV4.includes("Annuler") && (
                      <>
                        <div className={styles.cercleRouge}></div>
                        &nbsp;{demande.StatusDemandeV4} par le demandeur
                      </>
                    )}
                    {demande.StatusDemandeV4.includes("A modifier") && (
                      <>
                        <div className={styles.cercleVert}></div>
                        &nbsp;{demande.StatusDemandeV4}
                      </>
                    )}
                    {demande.StatusDemandeV4.includes("Approuvée") && (
                      <>
                        <div className={styles.cercleYellow}></div>
                        &nbsp;{demande.StatusDemandeV4}
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
        }
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
                  <td >Centre de Gestion :</td>
                  <td className={styles.value}>{this.state.detailsListDemande.CentreDeGestion}</td>
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
                        <p className={styles.value}><b>Prix total: </b>{(parseInt(produit.quantité) * parseInt(produit.Prix)).toString()} DT</p>
                        <p className={styles.value}><b>Délais de livraison souhaité : </b>{produit.DelaiLivraisionSouhaite} Jours</p>
                      </div>
                    </div>)}
                  </td>
                </tr>
                <tr>
                <td>Prix unitaire estimatif Total :</td>
                  <td className={styles.value}>{this.state.detailsListDemande.PrixTotal} DT</td>
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
                  <td >Statut actuel :</td>
                  {console.log("Status :",this.state.detailsListDemande.StatusDemande)}
                  { (this.state.detailsListDemande.StatusDemande.includes("En cours")) && <td className={styles.value}><div className={styles.cercleBleu}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("Approuvée")) && <td className={styles.value}><div className={styles.cercleVert}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("Annuler" )) && <td className={styles.value}><div className={styles.cercleRouge}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("Rejetée")) && <td className={styles.value}><div className={styles.cercleRouge}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                  { (this.state.detailsListDemande.StatusDemande.includes("A modifier" )) && <td className={styles.value}><div className={styles.cercleYellow}></div> &nbsp; {this.state.detailsListDemande.StatusDemande}</td>}
                </tr>
                <tr>
                  <td>Historique de la demande :</td>
                  {this.state.historiqueDemande.length < 4 ? (
                    <div>
                      <td className={styles.value}>
                        {this.state.historiqueDemande.map((action, index) => (
                          <span style={{'color':"black"}} key={index}>- {action} <br /></span>
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
                <br></br>
                {this.state.checkActionCurrentUser && this.state.listDemandeDataForCurrentUser.includes(this.state.detailsListDemande.ID) && (
                  <>
                    <tr>
                      <td>Commentaire</td>
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
                        <button style={{ backgroundColor: "green"}} className={styles.btnRef} onClick={() => this.ApprouveValidation()}>                          
                          Approuvée
                        </button>
                        &nbsp;
                        <button style={{ backgroundColor: this.state.commentAction.length > 0 ? "red" : "gray" }} className={styles.btnRef} onClick={() => this.RejectValidation()} disabled={this.state.commentAction.length > 0 ? false : true}>                          
                          Rejetée
                        </button>
                        &nbsp;
                        <button style={{ backgroundColor: this.state.commentAction.length > 0 ? "blue" : "gray" }} className={styles.btnRef} onClick={() => this.ModifierValidation()} disabled={this.state.commentAction.length > 0 ? false : true}>                          
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
        {this.state.RemplacantPoUp && <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span id="close" className={styles.close} onClick={() => this.setState({RemplacantPoUp: false})}>&times;</span>
            <h2 style={{color:"#7d2935"}}> Voulez-vous vraiment Ajouter un remplaçant ?</h2>
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
                    placeholder="date de debut"
                    ariaLabel="date de debut"
                    value={this.state.startDate}
                    onSelectDate={(e) => { this.selectedDate(e.getFullYear(), e.getMonth() + 1, e.getDate(), true)}}
                    minDate={new Date()}
                  />
                </tr>
                <br></br>
                <tr>
                  <td>Date de fin</td>
                  <DatePicker
                    className={controlClass.TextField}
                    placeholder="date de fin"
                    ariaLabel="date de fin"
                    value={this.state.endDate}
                    onSelectDate={(e) => { this.selectedDate(e.getFullYear(), e.getMonth() + 1, e.getDate(), false)}}
                    minDate={this.state.startDate}
                  />
                </tr>
                <br></br>
                <tr>
                  <td>
                    <button style={{ backgroundColor: "#7d2935", textAlign:"center" }}className={styles.btnRef} onClick={() => this.ajouterAutreApprobateur()}>                          
                      Envoyer
                    </button>
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
              {(() => {
                  const pageButtons = []
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
        }

        
        
        {this.state.showAnotePopUp && (
          <div className={styles2.demandeurDashboard}>
            <div className={styles2.modal}>
              <div className={styles2.modalContent}>
                <span className={styles2.close} onClick={() => this.setState({showAnotePopUp:false})}>&times;</span>
                <h3>À noter</h3>
                <ul>
                    <li>
                      Monsieur/Madame, vous avez été ajouté(e) en tant que remplaçant(e) de {this.state.remplacantName}, donc vous avez l'accès pour ajouter des demandes à sa place.
                      <br></br>
                      Vous avez également le droit de gérer toutes les anciennes et futures demandes.
                    </li>
                </ul>
                <p> =&gt; Vous avez le droit d'effectuer des actions jusqu'à ce que la période de remplacement soit terminée.</p>
              </div>
            </div>
          </div>
        )}


        {this.state.checkActionCurrentUserPopUp && (
          <div className={styles2.demandeurDashboard}>
            <div className={styles2.modal}>
              <div className={styles2.modalContent}>
                <span className={styles2.close} onClick={() => this.setState({checkActionCurrentUserPopUp:false})}>&times;</span>
                <h3>À noter</h3>
                <ul>
                    <li>
                      Monsieur/Madame, vous n'avez pas de faire des actions sur des demandes d'achat car vous avez déja un remplaçant
                    </li>
                </ul>
                <p> =&gt; Vous avez le droit d'effectuer des actions quand la période de remplacement est terminée.</p>
              </div>
            </div>
          </div>
        )}

        <SweetAlert2
          allowOutsideClick={false}
          show={this.state.showValidationPopUpRemplaçant} 
          title="Ajouter un remplaçant d'approbation" 
          text="Votre demande d'ajouter un remplaçant d'approbation est enregistrer avec succés"
          imageUrl={img}
          confirmButtonColor='#7D2935'
          onConfirm={() => window.location.reload()}
          imageWidth="150"
          imageHeight="150"
        />

        {/* PopUp Approuver demande */}
        <SweetAlert2
          allowOutsideClick={false}
          show={this.state.showApprobationPopUp} 
          title="Approbation d'une demande" 
          text="Votre action est enregistrer avec succés."
          imageUrl={img}
          confirmButtonColor='#7D2935'
          onConfirm={() => window.location.reload()}
          imageWidth="150"
          imageHeight="150"
        />

        {/* PopUp Modifier demande */}
        <SweetAlert2
          allowOutsideClick={false}
          show={this.state.showModificationPopUp} 
          title="Demande de modification d'une demande" 
          text="Votre action est enregistrer avec succés."
          imageUrl={img}
          confirmButtonColor='#7D2935'
          onConfirm={() => window.location.reload()}
          imageWidth="150"
          imageHeight="150"
        />

        {/* PopUp rejeter demande */}
        <SweetAlert2
          allowOutsideClick={false}
          show={this.state.showRejectionPopUp} 
          title="Rejeter d'une demande" 
          text="Votre action est enregistrer avec succés."
          imageUrl={img}
          confirmButtonColor='#7D2935'
          onConfirm={() => window.location.reload()}
          imageWidth="150"
          imageHeight="150"
        />
      </div>
    );
  }
}