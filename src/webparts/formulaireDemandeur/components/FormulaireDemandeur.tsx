import * as React from 'react';
import stylescustom from './FormulaireDemandeur.module.scss';
import styles from '../../demandeurDashboard/components/DemandeurDashboard.module.scss'; 
import { IFormulaireDemandeurProps } from './IFormulaireDemandeurProps';
import { Dropdown, IDropdownOption, IDropdownProps, IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IDatePickerStrings } from 'office-ui-fabric-react/lib/DatePicker';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import SweetAlert2 from 'react-sweetalert2';
var img = require('../../../image/UCT_image.png');
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import {
  Fabric,
  loadTheme
} from "office-ui-fabric-react";
import { getTheme } from "@uifabric/styling";
import { Web } from '@pnp/sp/webs';
import { IItemAddResult } from '@pnp/sp/items';
import GraphService from '../../../services/GraphServices';
import { checkIfAxeExists, checkRodondanceApprouvers, convertFileToBase64, convertStringToNumber, getAllArticles, getApprobateurNiveau, getCurrentDate, removeDuplicates2 } from '../../../tools/FunctionTools';
import { getUserInfo } from "../../../services/getUserInfo" ;
import { getSubFamily } from "../../../services/getProductsSubFamily" ;
import { getFamily } from "../../../services/getAllProductFamily" ;
import { getProduct } from "../../../services/getProducts" ;
import { getApprouverList } from "../../../services/getApprouveurs" ;
import { getBenefList } from "../../../services/getListBenefPermissions" ;
import { APPROUVER_V4 } from '../../../API_END_POINTS/userApprouverV4';
import { REDIRECTION_URL } from '../../../API_END_POINTS/redirectionURL';

loadTheme({
  palette: {
  },
  semanticColors: {
    bodyBackground: "white",
    inputBackground: "white",
    disabledBackground: "#7D2935",
    disabledText: "white"
  }
});
const theme = getTheme();


export const DatePickerStrings: IDatePickerStrings = {
  months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  shortMonths: ['Jan', 'Feb', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
  days: ['Diamanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  shortDays: ['DI', 'LU', 'MA', 'ME', 'JE', 'VE', 'SA'],
  goToToday: "Aller à aujourd'hui",
  prevMonthAriaLabel: 'Aller au mois précédent',
  nextMonthAriaLabel: 'Aller au mois prochain',
  prevYearAriaLabel: "Aller à l'année précédente",
  nextYearAriaLabel: "Aller à l'année prochaine",
  invalidInputErrorMessage: 'Invalid date format.'
};


export const FormatDate = (date: any): string => {
  var date1 = new Date(date);
  var year = date1.getFullYear();
  var month = (1 + date1.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date1.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return day + '/' + month + '/' + year;
};



export const FormatDateERP = (date: any): string => {
  var date1 = new Date(date);
  var year = date1.getFullYear();
  var month = (1 + date1.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date1.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return year + '-' + month + '-' + day;
};



export default class FormulaireDemandeur extends React.Component<IFormulaireDemandeurProps, {}> {

  // State variables of webpart 
  public state = {

    formData : [{
      FamilleSelected: [] as any,
      SousFamilleSelected : [] as any,
      AllArticleData: [] as any,
      ArticleSelected: [] as any,
      BeneficiareSelected : [] as any,
      Comment: "",
      quantity: "1",
      price: "0.0" ,
      DateSouhaite: new Date() ,
      numberOfDays: "",
      fileData: "" as any,
      fileName: "",
    }],

    familyProducts: [],
    subFamilyProducts: [],
    articles: [],
    // axePerBuget: [{Axe: "", BudgetAnnualAllocated: "", BudgetAnnualRemaining: "", BudgetAnnualUsed: ""}],
    axePerBuget: [],


    FamilleID : "",
    SousFamilleID : "" ,
    ArticleID : "" ,

    ID: 0,
    userUPN: "",
    userId: "",
    userRegistrationNumber:"",
    userEstablishment:"",
    userName: "",
    userEmail: "",
    JobTitle: "",
    userRespCenter: "",

    RemplacantID: 0,
    RemplacantUserUPN: "",
    RemplacantUserId: "",
    RemplacantUserRegistrationNumber:"",
    RemplacantUserEstablishment:"",
    RemplacantUserName: "",
    RemplacantUserEmail: "",
    RemplacantJobTitle: "",
    RemplacantRespCenter: "",

    file: "" as null,
    loadingFile: false,
    fileName: "",
    MontantAlloue: 0 ,
    MontantConsommer: 0 ,
    MontantRestant: 0 ,
    counterProducts: 1 ,
    showValidationPopUp:false,
    errors: { file: "" },

    showOnConfirmButtonPopUp : true,
    spinnerShow: false,

    checkRemplacant: false,
    showAnotePopUp: false,
    remplacantName: "",
    remplacantID: 0,
    demandeAffectation: "me",

    checkActionCurrentUser: true,
    checkActionCurrentUserPopUp: false,
    DisabledBenef: true,
    condition: 0,    
    showPopUpApprouver4: false,
    totalPrixErrorMessage: 0,
    fileBase64: "",
    axeBudgets: [],
    popUpApprobateurs: false
  };  
  private _graphService = new GraphService(this.props.context);


  // private dropdownOptionsListFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsListSousFamille: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsRefArticles: { key: string, text: string, data: any }[] = [];
  // private dropdownOptionsBeneficiaire: { key: string, text: string, data: any }[] = [];

  

  public initDisableCommentsWrapper() {
    let CommentsWrapper = document.getElementById('CommentsWrapper');
    CommentsWrapper.innerHTML = "";
  }
  

  private onRenderOption(option: IDropdownOption): JSX.Element {
    return (
      <div>
        {option.data && option.data.icon && (
          <Icon style={{ marginRight: '8px', color: option.data.colorName }} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />
        )}
        <span>{option.text}</span>
      </div>
    );
  }


  private onRenderCaretDown(props: IDropdownProps): JSX.Element {
    return <Icon iconName="CirclePlus" />;
  }


  private onSelectionChanged(ev: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void { }


  public initImage(index: any) {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].fileData = null
    updatedFormData[index-1].fileName = null
    this.setState({
      formData: updatedFormData,
      fileBase64: ""
    });
    (document.getElementById('uploadFile') as HTMLInputElement).value = "";
  }


  private checkUserActions = async() => {

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
          this.setState({checkActionCurrentUser : false, checkActionCurrentUserPopUp: true});
        } else {
          console.log(`Now (${now}) is NOT within the range of start date (${dateDeDebut}) and end date (${dateDeFin}).`);
        }
        

      }
    }
  }


  private getUserInfo = async(establishment, registrationNumber) => {
    const data = await getUserInfo(establishment, registrationNumber) ;
    return data
  }


  private handleChangeQuantity = (event: any, index: any) => {
    const inputValue = event.target.value;
    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].quantity = inputValue;
      this.setState({
        formData: updatedFormData
      });
    }
  }


  public addFile = async (content: any) => {
    console.log(this.state.counterProducts);
  
    const fileName = content.target.files[0].name;
    const extension = fileName.split('.').pop();
    const encodedFileName = `${fileName.split('.').slice(0, -1).join('.')}.${extension}`;
  
    const newFile = new File([content.target.files[0]], encodedFileName, { type: content.target.files[0].type });
  
    const updatedFormData = [...this.state.formData];
    updatedFormData[0].fileName = fileName; // Store the original file name
    updatedFormData[0].fileData = newFile;

    const data = await convertFileToBase64(newFile)
  
    const base64Data = data.split(',')[1];

    this.setState({
      formData: updatedFormData,
      fileBase64: base64Data
    });
  };



  private onRenderTitle(options: IDropdownOption[]): JSX.Element {
    const option = options[0];

    return (
      <div>
        {option.data && option.data.icon && (
          <Icon style={{ marginRight: '8px', color: option.data.colorName }} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />
        )}
        <span>{option.text} </span>
      </div>
    );
  }


  private handleChangePrice = (event: any, index: any) => {
    const inputValue = event.target.value;
  
    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].price = inputValue;
  
      this.setState({
        formData: updatedFormData
      });
    }
  }
  


  private handleChangeComment = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].Comment = event.target.value
    this.setState({
      formData: updatedFormData
    });
  }

  
  private handleChangeFamilleDropdown = async (event:any, index:any) => {
    console.log(event)
    const updatedFormData = [...this.state.formData];
    console.log(updatedFormData)
    updatedFormData[index-1].FamilleSelected = [event] ;
    updatedFormData[index-1].ArticleSelected = [] ;

    this.setState({
      formData: updatedFormData,
      FamilleID: event.key,
      SousFamilleID: "",
      ArticleID: "",
      articles: [],
      // axePerBuget: []
      // updatedFormData[index - 1]["ArticleSelected"][0].key : ""
    });
    await this.getSubFamilyData(event.key)
  }


  private handleChangeSousFamilleDropdown = async(event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].SousFamilleSelected = [event]
    updatedFormData[index-1].ArticleSelected = [] ;
    

    var items
    if (!this.state.DisabledBenef){
      items = await getProduct(event.key, updatedFormData[index - 1].BeneficiareSelected[0].text) ;
      console.log(items)
    }else {
      if (this.state.demandeAffectation === "me"){
        items = await getProduct(event.key, this.state.userRespCenter) ;
        console.log(items)
      }else {
        items = await getProduct(event.key, this.state.RemplacantRespCenter) ;
        console.log(items)
      }
    }

    const listArticles = items.Items.map(item => ({
      key: item.RefItem, 
      LatestPurchasePrice: item.LatestPurchasePrice,
      text: item.DesignationItem, 
      BudgetAnnualUsed: item.BudgetAnnualUsed,
      BudgetAnnualRemaining: item.BudgetAnnualRemaining, 
      BudgetAnnualAllocated: item.BudgetAnnualAllocated, 
      Axe: item.Axe,  
    }));

    console.log(index)
    console.log(updatedFormData)
    updatedFormData[index-1].AllArticleData = listArticles
    this.setState({
      formData: updatedFormData,
      SousFamilleID: event.key,
      // ArticleID: "",
      // articles: [],
      // axePerBuget: this.state.axePerBuget.slice(index, 1)
    });
    console.log(event.key)
    console.log(this.state.userRespCenter)
    this.setState({articles:listArticles})
  }


  private handleChangeArticleDropdown = (event: any, index: any) => {
    console.log(event)
    const updatedFormData = [...this.state.formData];
    updatedFormData[index - 1].ArticleSelected = [event];
  
    this.setState({
      formData: updatedFormData,
      // axePerBuget: newAxeList
    });
  }


  private handleChangeDestinataireDropdown = async (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].BeneficiareSelected = [event]
    this.setState({
      formData: updatedFormData
    });

    // Get all famille products
    const listFamilleProduit = [] ;
    const familyProducts = await getFamily() ;
    familyProducts.Families.map(famille => {
      listFamilleProduit.push({
        key: famille.IdFamily,
        text: famille.DescFamily,

      })
    })
    this.setState({familyProducts:listFamilleProduit})
  }



  private intToList(number: number): number[] {
    const result: number[] = [];
    for (let i = 1; i <= number; i++) {
      result.push(i);
    }
    return result;
  }



  private addArticle = () => {
    const nullObject = {
      FamilleSelected: this.state.formData[0].FamilleSelected,
      SousFamilleSelected: []as any,
      AllArticleData: [],
      ArticleSelected: []as any,
      BeneficiareSelected: []as any,
      Comment: "",
      quantity:"1",
      price:"0.0",
      numberOfDays: "",
      DateSouhaite: new Date(),
      fileData: "" as null,
      fileName: "",
    };

    const updatedFormData = [...this.state.formData];

    updatedFormData.push(nullObject);

    this.setState({
      formData: updatedFormData,
      counterProducts: this.state.counterProducts + 1,
    })
  }

  private deleteArticle = (index: number) => {
    // Make a copy of the current formData array
    const updatedFormData = [...this.state.formData];
    
    // Remove the article at the specified index
    updatedFormData.splice(index, 1);
  
    // Update the state with the new formData array and decrement the counterProducts
    this.setState({
      formData: updatedFormData,
      counterProducts: this.state.counterProducts - 1,
    });
  }


  private disabledSubmitButton = () => {
    if (this.state.DisabledBenef){
      return this.state.formData.some(formData => (
        formData.FamilleSelected.length === 0 ||
        formData.SousFamilleSelected.length === 0 ||
        formData.ArticleSelected.length === 0 ||
        formData.quantity.length === 0 ||
        formData.price.length === 0 ||
        formData.Comment.length === 0 || 
        formData.numberOfDays.length === 0
      ));
    }else {
      return this.state.formData.some(formData => (
        formData.FamilleSelected.length === 0 ||
        formData.SousFamilleSelected.length === 0 ||
        formData.BeneficiareSelected.length === 0 ||
        formData.ArticleSelected.length === 0 ||
        formData.quantity.length === 0 ||
        formData.price.length === 0 ||
        formData.Comment.length === 0 || 
        formData.numberOfDays.length === 0
      ));
    }
  }


  // Function to read file info
  public readFile = (fileContent: any) => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([fileContent]);
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };


  
  private attachFileToItem = async (itemId: any) => {
    try {
      for (let index = 0; index < this.state.counterProducts; index++) {
        const formData = this.state.formData[index];
        console.log(formData)
        if (formData.fileName){
          const fileContent: any = await this.readFile(formData.fileData);
          const fileName = formData.fileName; // Use the original file name
          console.log("Original File Name:", fileName);
          console.log("File Content:", fileContent);
          const response = await Web(this.props.url)
            .lists.getByTitle("DemandeAchat")
            .items.getById(itemId)
            .attachmentFiles.add(fileName, fileContent);
          console.log("File attached to item successfully:", response);
        }
      }
    } catch (error) {
      console.log("Error attaching file to item:", error);
    }
  };



  private getSubFamilyData = async(FamilleID) => {
    var sousFamilles = []
    const sousFamilyData = await getSubFamily(FamilleID.toString()) ;
    sousFamilyData.SubFamilies.map(sousFamily => {
      sousFamilles.push({
        key: sousFamily.IdSubFamily,
        text: sousFamily.DescSubFamily,
        FamilleKey: sousFamily.IdFamily,

      })
    })
    this.setState({subFamilyProducts:sousFamilles})
  }
  

  private getBeneficaire = () => {
    var listBenef = [{
      key: "COM",
      text: "COM",
    },
    {
      key: "AAC_TUNIS",
      text: "AAC TUNIS",
    },
    {
      key: "IMSET_TUNIS",
      text: "IMSET TUNIS",
    },
    {
      key: "SIEGE",
      text: "SIEGE",
    },
    {
      key: "AAC_NABEUL",
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
      key: "IMSET_NABEUL",
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
      key: "IMSET_SFAX",
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


  private handleSpinnerButtonClick = () => {
    
    this.setState({spinnerShow:true})

    setTimeout(() => {
      this.setState({spinnerShow:false})
    }, 3000);
  };


  private _onChange = async (ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption) => {
    console.log(option)
    if (option.key === "me"){
      await this.checkUserPermissionsPerchaseModule(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);
    }else {
      const checkTestRemplacant = await this.checkRemplacantDemandes();
      const remplacantEmail = checkTestRemplacant[0]['Demandeur']['EMail'];
      await this.checkUserPermissionsPerchaseModule(remplacantEmail);
    }
    this.setState({demandeAffectation:option.key})
  }


  public async getUserEmailById(userId: number){
    try {
        const user = await Web(this.props.url).getUserById(userId);
        console.log(user)
    } catch (error) {
        throw error;
    }
  }


  // public checkApprouver = async(approuverID) => {
  //   const result = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items.filter(`DemandeurID eq ${approuverID}`).get();

  //   if (result.length > 0) {
  //     const demandeurName =  (await Web(this.props.url).siteUsers.getById(result[0].DemandeurID).get()).Title;
  //     const remplacantName = (await Web(this.props.url).siteUsers.getById(result[0].RemplacantID).get()).Title;
  //     return { demandeurName, remplacantName };
  //   } 
  // }


  private submitFormData = async () => {
    const disabledSubmit = this.disabledSubmitButton();
    const currentUser = await Web(this.props.url).currentUser.get() ;
    var ArticleList = [];
    var prixTotal = 0;

    if (!disabledSubmit) {

      this.setState({spinnerShow : true}) ;

      var listApprouvers
      const data = this.state.formData;
      if (!this.state.DisabledBenef && data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0){
        listApprouvers = await this.getUserApprouvers(this.state.SousFamilleID, data[0].BeneficiareSelected[0].text)
      }else {
        if (this.state.demandeAffectation === "me"){
          listApprouvers = await this.getUserApprouvers(this.state.SousFamilleID, this.state.userRespCenter)
        }else {
          listApprouvers = await this.getUserApprouvers(this.state.SousFamilleID, this.state.RemplacantRespCenter)
        }
      }
      



      console.log(listApprouvers['approvalsList'][0].MailApp1)
      if (listApprouvers['Status'] === "200" && listApprouvers['approvalsList'][0].MailApp1 !== "") {
        var getProbateurs = [] ;

        // const promises = listApprouvers['approvalsList'].map(async approuver => {
        //   const approbateurV1Id = await this.getUserByEmail(approuver.NameApp1.trim().replace(/\s+/g, ' '));
        //   const approbateurV2Id = await this.getUserByEmail(approuver.NameApp2.trim().replace(/\s+/g, ' '));
        //   const approbateurV3Id = approuver.NameApp3 !== "" ? await this.getUserByEmail(approuver.NameApp3.trim().replace(/\s+/g, ' ')) : null;
        //   const approbateurV4Id = await this.getUserByEmail(approuver.NameApp4.trim().replace(/\s+/g, ' '));
      
        //   return {
        //       ApprobateurV1Id: [approbateurV1Id],
        //       UserDisplayNameV1: approuver.NameApp1,
        //       ApprobateurV2Id: [approbateurV2Id],
        //       UserDisplayNameV2: approuver.NameApp2,
        //       ApprobateurV3Id: approbateurV3Id !== null ? [approbateurV3Id] : null,
        //       UserDisplayNameV3: approuver.NameApp3 !== "" ? approuver.NameApp3 : null,
        //       ApprobateurV4Id: [approbateurV4Id],
        //       UserDisplayNameV4: approuver.NameApp4,
        //   };
        // });

        const promises = listApprouvers['approvalsList'].map(async approuver => {
          var approbateurV1Id, approbateurV2Id, approbateurV3Id, approbateurV4Id
          try {
            approbateurV1Id = await this.getUserByEmail2(approuver.MailApp1);
            approbateurV2Id = await this.getUserByEmail2(approuver.MailApp2);
            approbateurV3Id = approuver.NameApp3 !== "" ? await this.getUserByEmail2(approuver.MailApp3) : null;
            approbateurV4Id = await this.getUserByEmail2(approuver.MailApp4);
          } catch (error) {
            this.setState({popUpApprobateurs: true})
          }

      
          return {
              ApprobateurV1Id: [approbateurV1Id],
              UserDisplayNameV1: approuver.NameApp1,
              ApprobateurV2Id: [approbateurV2Id],
              UserDisplayNameV2: approuver.NameApp2,
              ApprobateurV3Id: approbateurV3Id !== null ? [approbateurV3Id] : null,
              UserDisplayNameV3: approuver.NameApp3 !== "" ? approuver.NameApp3 : null,
              ApprobateurV4Id: [approbateurV4Id],
              UserDisplayNameV4: approuver.NameApp4,
          };
        });
      
        getProbateurs = await Promise.all(promises);
        var currentUserID = this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID
        if (getProbateurs[0].ApprobateurV4Id.includes(currentUserID)){
          this.setState({showPopUpApprouver4: true})
          return
        }
        const approuversResponse = await this.checkApprouvet(getProbateurs[0].ApprobateurV1Id[0], getProbateurs[0].ApprobateurV2Id[0], getProbateurs[0].ApprobateurV3Id !== null ? getProbateurs[0].ApprobateurV3Id[0] : null, getProbateurs[0].ApprobateurV4Id[0]);

        if (approuversResponse.length > 0) {
          const demandeurId = approuversResponse[0].DemandeurId;
          const RemplacantId = approuversResponse[0].RemplacantId;
          
          console.log(demandeurId)
          if (getProbateurs[0].ApprobateurV1Id[0] === demandeurId) {
            console.log(1)
            getProbateurs[0].ApprobateurV1Id.push(RemplacantId);
          } else if (getProbateurs[0].ApprobateurV2Id[0] === demandeurId) {
            console.log(2)
            getProbateurs[0].ApprobateurV2Id.push(RemplacantId);
          } else if (getProbateurs[0].ApprobateurV3Id !== null && getProbateurs[0].ApprobateurV3Id[0] === demandeurId) {
            console.log(3)
            getProbateurs[0].ApprobateurV3Id.push(RemplacantId);
          } else if (getProbateurs[0].ApprobateurV4Id[0] === demandeurId) {
            console.log(4)
            getProbateurs[0].ApprobateurV4Id.push(RemplacantId);
          }
        }

        console.log('all Data:', data)  
        data.map(Article => {
          console.log("Article", Article)
          prixTotal = prixTotal + (parseFloat(Article.price) * parseInt(Article.quantity));
          ArticleList.push({
            "SousFamille":Article.SousFamilleSelected[0].text,
            "SousFamilleID":Article.SousFamilleSelected[0].key,
            "Beneficiaire": !this.state.DisabledBenef && Article.BeneficiareSelected[0]?.text 
            ? Article.BeneficiareSelected[0].text 
            : (this.state.demandeAffectation === "me" 
              ? this.state.userRespCenter 
              : this.state.RemplacantRespCenter),            
            "BeneficiaireID":!this.state.DisabledBenef && Article.BeneficiareSelected[0]?.key 
            ? Article.BeneficiareSelected[0].text 
            : (this.state.demandeAffectation === "me" 
              ? this.state.userRespCenter 
              : this.state.RemplacantRespCenter),
            "DelaiLivraisionSouhaite": Article.numberOfDays,
            "comment": Article.Comment,
            "Prix": Article.price,
            "quantité": Article.quantity,
            "DescriptionTechnique": Article.ArticleSelected[0].text,
            "ArticleREF": Article.ArticleSelected[0].key,
            "ArticleFileName": Article.fileName,
            "Axe":  Article.ArticleSelected[0].Axe,
            "BudgetAnnualAllocated": Article.ArticleSelected[0].BudgetAnnualAllocated,
            "BudgetAnnualRemaining": Article.ArticleSelected[0].BudgetAnnualRemaining,
            "BudgetAnnualUsed": Article.ArticleSelected[0].BudgetAnnualUsed,
            "LatestPurchasePrice": Article.ArticleSelected[0].LatestPurchasePrice,
            "ArticleFileData": {
              "name": Article.fileData.name,
              "size": Article.fileData.size,
              "type": Article.fileData.type,
              // "lastModified": Article.fileData.lastModified,
              // "lastModifiedDate": Article.fileData.lastModifiedDate,
              "webkitRelativePath": Article.fileData.webkitRelativePath,
            }
          });
        });

        if (getProbateurs[0].ApprobateurV1Id.length > 1){
          console.log("test 1")
          if (getProbateurs[0].ApprobateurV3Id === null){
            if (this.state.checkRemplacant && this.state.condition === 2){
              formData = {
                "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "StatusDemandeV3":"***",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": this.state.remplacantName,
                "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter,
                "FileBase64":this.state.fileBase64
              }
            }else if (this.state.checkRemplacant && this.state.condition === 1) {
              formData = {
                "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                "AuthorId": this.state.remplacantID,
                "DemandeurId": this.state.remplacantID,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "StatusDemandeV3":"***",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": this.state.remplacantName,
                "CentreDeGestion": this.state.RemplacantRespCenter,
                "FileBase64":this.state.fileBase64
              }
            }else {
              formData = {
                "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                "AuthorId": currentUser.Id,
                "DemandeurId":currentUser.Id ,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "StatusDemandeV3":"***",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": currentUser.Title,
                "CentreDeGestion": this.state.userRespCenter,
                "FileBase64":this.state.fileBase64
              }
            }
            
          }else {
            if (this.state.checkRemplacant && this.state.condition === 2){
              formData = {
                "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": this.state.remplacantName,
                "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter,
                "FileBase64":this.state.fileBase64
              }
            }else if (this.state.checkRemplacant && this.state.condition === 1){
              formData = {
                "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                "AuthorId": this.state.remplacantID,
                "DemandeurId": this.state.remplacantID,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": this.state.remplacantName,
                "CentreDeGestion": this.state.RemplacantRespCenter,
                "FileBase64":this.state.fileBase64
              }
            }
            else {
              formData = {
                "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                "AuthorId": currentUser.Id ,
                "DemandeurId":currentUser.Id ,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "StatusDemandeV3":"***",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": currentUser.Title,
                "CentreDeGestion": this.state.userRespCenter,
                "FileBase64":this.state.fileBase64
              }
            }
          }

          
          const sendData = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.add(formData);
            
          
          ArticleList.map(async articleData => {
            await this.attachFileToItem(sendData.data.ID)
          })
    
          const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
          .add({
            "DemandeID": sendData.data.ID.toString(),
            "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV1 + " a partir de "+getCurrentDate()])
          });

          if (getProbateurs[0].ApprobateurV3Id === null){
            const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
            .add({
              "DemandeID": sendData.data.ID.toString(),
              "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
              "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
              "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
              "StatusApprobateurV1": "En cours",
              "StatusApprobateurV2": "",
              "StatusApprobateurV4": "",
              "StatusApprobateurV3": "***",
              "CommentaireApprobateurV1": "",
              "CommentaireApprobateurV2": "",
              "CommentaireApprobateurV4": "",
              "CommentaireApprobateurV3": "***",
            });
          }else {
            const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
            .add({
              "DemandeID": sendData.data.ID.toString(),
              "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
              "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
              "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
              "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
              "StatusApprobateurV1": "En cours",
              "StatusApprobateurV2": "",
              "StatusApprobateurV3": "",
              "StatusApprobateurV4": "",
              "CommentaireApprobateurV1": "",
              "CommentaireApprobateurV2": "",
              "CommentaireApprobateurV3": "",
              "CommentaireApprobateurV4": "",
            });
          }

        }else {
          console.log("test 2")
          var formData
          console.log(getProbateurs)
          console.log(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID)
          if (getProbateurs[0].ApprobateurV3Id === null){
            console.log('test with approbateur with approbateur 3 null')
            console.log(this.state.condition, this.state.checkRemplacant)
            if (this.state.checkRemplacant && this.state.condition === 2){
              const checkUserNiveau = getApprobateurNiveau(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID, getProbateurs)
              console.log(checkUserNiveau)
              if (checkUserNiveau === 0){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 1){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 2){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV4":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 4){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuvée par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV4":"Approuvée",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }
              
            }else if (this.state.checkRemplacant && this.state.condition === 1){
              const checkUserNiveau = getApprobateurNiveau(this.state.remplacantID, getProbateurs)
              console.log(checkUserNiveau)
              if (checkUserNiveau === 0){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 1){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 2){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV4":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 4){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuvée par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV4":"Approuvée",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }
            }else {
              console.log(currentUser.Id)
              const checkUserNiveau = getApprobateurNiveau(currentUser.Id ,getProbateurs)
              console.log(checkUserNiveau)
              if (checkUserNiveau === 0){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 1){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 2){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV4":"En cours",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 4){
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuvée par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV4":"Approuvée",
                  "StatusDemandeV3":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }
            }

          }else {
            console.log("test with approbateur 3")
            if (this.state.checkRemplacant && this.state.condition === 2){
              const checkUserNiveau = getApprobateurNiveau(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,getProbateurs) ;
              if (checkUserNiveau === 0) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 1) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 2) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 3) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV3":"Approuvée",
                  "StatusDemandeV4":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 4) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuvée par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV3":"Approuvée",
                  "StatusDemandeV4":"Approuvée",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.demandeAffectation === "me" ? currentUser.Title : this.state.remplacantName,
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }
              
            }else if(this.state.checkRemplacant && this.state.condition === 1){
              const checkUserNiveau = getApprobateurNiveau(this.state.remplacantID,getProbateurs) ;
              if (checkUserNiveau === 0) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 1) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 2) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 3) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV3":"Approuvée",
                  "StatusDemandeV4":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 4) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": this.state.remplacantID,
                  "DemandeurId": this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuvée par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV3":"Approuvée",
                  "StatusDemandeV4":"Approuvée",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName,
                  "CentreDeGestion": this.state.RemplacantRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }

            } else {
              const checkUserNiveau = getApprobateurNiveau(currentUser.Id ,getProbateurs) ;
              console.log(checkUserNiveau)
              if (checkUserNiveau === 0) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 1) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 2) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 3) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV3":"Approuvée",
                  "StatusDemandeV4":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }else if (checkUserNiveau === 4) {
                formData = {
                  "StatusBeneficiaire": this.state.DisabledBenef.toString(),
                  "AuthorId": currentUser.Id ,
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].text : "",
                  "BeneficiaireID": data[0].BeneficiareSelected && data[0].BeneficiareSelected.length > 0 ? data[0].BeneficiareSelected[0].key : "",
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuvée par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuvée",
                  "StatusDemandeV2":"Approuvée",
                  "StatusDemandeV3":"Approuvée",
                  "StatusDemandeV4":"Approuvée",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title,
                  "CentreDeGestion": this.state.userRespCenter,
                  "FileBase64":this.state.fileBase64
                }
              }
            }
          }

          const sendData: IItemAddResult = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.add(formData);
    
          ArticleList.map(async articleData => {
            await this.attachFileToItem(sendData.data.ID)
          })
    
          
    
          console.log('testtt',getProbateurs)
          if (getProbateurs[0].ApprobateurV3Id === null){
            const checkUserNiveau = getApprobateurNiveau(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,getProbateurs) ;

            if (checkUserNiveau === 0){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV1 + " a partir de " + getCurrentDate()])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "En cours",
                "StatusApprobateurV2": "",
                "StatusApprobateurV4": "",
                "StatusApprobateurV3": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV4": "",
                "CommentaireApprobateurV3": "***",
                "Step": "one"
              });
              console.log(sendApprobateursData)


            }else if (checkUserNiveau === 1){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV2 + " a partir de " + getCurrentDate()])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "Approuvée",
                "StatusApprobateurV2": "En cours",
                "StatusApprobateurV4": "",
                "StatusApprobateurV3": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV4": "",
                "CommentaireApprobateurV3": "***",
                "Step": "two"
              });
              console.log(sendApprobateursData)



            }else if (checkUserNiveau === 2){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV3 + " a partir de " + getCurrentDate()])
              });


              const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "Approuvée",
                "StatusApprobateurV2": "Approuvée",
                "StatusApprobateurV4": "En cours",
                "StatusApprobateurV3": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV4": "",
                "CommentaireApprobateurV3": "***",
                "Step": "three"
              });
              console.log(sendApprobateursData)



            }else if (checkUserNiveau === 4){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "Demande approuver car le demandeur est un approbateur de niveau 3"])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "Approuvée",
                "StatusApprobateurV2": "Approuvée",
                "StatusApprobateurV4": "Approuvée",
                "StatusApprobateurV3": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV4": "",
                "CommentaireApprobateurV3": "***",
                "Step": "four"
              });
              console.log(sendApprobateursData)
            }
            
          }else {
            console.log(getProbateurs)
            const checkUserNiveau = getApprobateurNiveau(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,getProbateurs) ;

            if (checkUserNiveau === 0){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV1 + " a partir de " + getCurrentDate()])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url)
              .lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "En cours",
                "StatusApprobateurV2": "",
                "StatusApprobateurV3": "",
                "StatusApprobateurV4": "",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "",
                "Step": "one"
              });

              console.log(sendApprobateursData)
            }else if (checkUserNiveau === 1){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV2 + " a partir de " + getCurrentDate()])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url)
              .lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "Approuvée",
                "StatusApprobateurV2": "En cours",
                "StatusApprobateurV3": "",
                "StatusApprobateurV4": "",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "",
                "Step": "two"
              });

              console.log(sendApprobateursData)
            }else if (checkUserNiveau === 2){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV3 + " a partir de " + getCurrentDate()])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url)
              .lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "Approuvée",
                "StatusApprobateurV2": "Approuvée",
                "StatusApprobateurV3": "En cours",
                "StatusApprobateurV4": "",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "",
                "Step": "three"
              });

              console.log(sendApprobateursData)
            }else if (checkUserNiveau === 3){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "En cours de l'approbation de " + getProbateurs[0].UserDisplayNameV4 + " a partir de " + getCurrentDate()])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url)
              .lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "Approuvée",
                "StatusApprobateurV2": "Approuvée",
                "StatusApprobateurV3": "Approuvée",
                "StatusApprobateurV4": "En cours",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "",
                "Step": "four"
              });

              console.log(sendApprobateursData)
            }else if (checkUserNiveau === 4){
              const sendHistoryActions: IItemAddResult = await Web(this.props.url).lists.getByTitle("HistoriqueDemande").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "Actions": JSON.stringify(["Creation de la demande le "+getCurrentDate(), "Demande approuver car le demandeur est un approbateur de niveau 4"])
              });

              const sendApprobateursData: IItemAddResult = await Web(this.props.url)
              .lists.getByTitle("WorkflowApprobation").items
              .add({
                "DemandeID": sendData.data.ID.toString(),
                "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
                "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "ApprobateurV4Id": { results: getProbateurs[0].ApprobateurV4Id },
                "StatusApprobateurV1": "Approuvée",
                "StatusApprobateurV2": "Approuvée",
                "StatusApprobateurV3": "Approuvée",
                "StatusApprobateurV4": "Approuvée",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "",
                "Step": "five"
              });

              console.log(sendApprobateursData)
            }
            
          }
        }
        this.setState({showValidationPopUp:true, spinnerShow : false})
      }else {
        this.setState({popUpApprobateurs: true})
      }
    }
  }


  // Check if the current user in list of remplaçant if true get the list of demands of the other demander
  private checkRemplacantDemandes = async () => {
    try {
      const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to midnight      
      const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
      .filter(`RemplacantId eq ${currentUserID} and TypeRemplacement eq 'D'`)
      .orderBy('Created', false)
      .top(1)
      .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
      .expand("Demandeur")
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
          }else {
            return []
          }
        }else{
          return []
        }
      }else return []
    } catch (error) {
      console.error("Error checking remplacant demandes:", error);
      return [];
    }
  }


  private handleInputChange = (event: any, index: any) => {
    const inputValue = event.target.value;
  
    // Check if inputValue is a valid number
    if (!isNaN(inputValue) && inputValue !== '') {
      const updatedFormData = [...this.state.formData];
      updatedFormData[index - 1].numberOfDays = inputValue;
  
      this.setState({
        formData: updatedFormData
      });
    }
  }


  private getUserApprouvers = async(IdSubFamily, respCenter) => {
    const approuverList = await getApprouverList(IdSubFamily, respCenter)
    return approuverList
  }
  
  

  private async loadUserInfo() {
    try {
      console.log(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);
      
      const user = await this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);
      
      console.log(user);
      
      this.setState({
          userName: user["displayName"],
          userEmail: user["mail"],
          userRegistrationNumber: user["employeeId"],
          userEstablishment: user["companyName"],
          JobTitle: user["jobTitle"],
      });
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  }


  private async loadRemplacantUserRemplacant(userPrincipalName) {
    try {
      console.log(userPrincipalName);
      
      const user = await this._graphService.getUserId(userPrincipalName);
      
      console.log(user);
      
      this.setState({
        RemplacantUserName: user["displayName"],
        RemplacantUserEmail: user["mail"],
        RemplacantUserRegistrationNumber: user["employeeId"],
        RemplacantUserEstablishment: user["companyName"],
        RemplacantJobTitle: user["jobTitle"],
      });
    } catch (error) {
      console.error("Error loading remplacant user info:", error);
    }
  }

  private getDemandeurAcces = async(userPrincipalName) => {
    const userInfo = await this._graphService.getUserId(userPrincipalName) ;
    const permissions = await getBenefList(userInfo["employeeId"]) ;
    if(permissions['Status'] !== "200"){
      return -1 ;
    }else return 0 ;
  }


  private checkUserPermissionsPerchaseModule = async(userPrincipalName) => {
    const userInfo = await this._graphService.getUserId(userPrincipalName)
    const permissions = await getBenefList(userInfo["employeeId"])
    console.log(permissions['StatusAll'])
    if(permissions['Status'] !== "200"){
      window.location.href = REDIRECTION_URL;
    }else {
      if (permissions['StatusAll'] === "True"){
        this.setState({DisabledBenef: false})
      }else {
        this.setState({DisabledBenef: true})
      }
    }
  }



  public async getUserByEmail(userDisplayName){
    try {
      console.log(userDisplayName)
      const userEmailMSgraph = await this._graphService.getUserEmailByDisplayName(userDisplayName)
      console.log(userEmailMSgraph)
      const user = await Web(this.props.url).ensureUser(userEmailMSgraph);
      console.log(user)
      return user.data.Id;
    } catch (error) {
      throw error; // Re-throw the error
    }
  }

  public async getUserByEmail2(userEmail){
    try {
      const user = await Web(this.props.url).ensureUser(userEmail);
      console.log(user)
      return user.data.Id;
    } catch (error) {
      throw error; // Re-throw the error
    }
  }


  private checkApprouvet = async(Approuver1, Approuver2, Approuver3, Approuver4) => {
    try {
      if (Approuver3 !== null){
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to midnight
        const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
        .filter(`DemandeurId eq ${Approuver1} or DemandeurId eq ${Approuver2} DemandeurId eq ${Approuver3} or DemandeurId eq ${Approuver4} and TypeRemplacement eq 'AP'`)
        .orderBy('Created', false)
        .top(1)
        .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
        .expand("Demandeur")
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
        }else return []

      }else {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to midnight
        const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
        .filter(`DemandeurId eq ${Approuver1} or DemandeurId eq ${Approuver2} or DemandeurId eq ${Approuver4} and TypeRemplacement eq 'AP'`)
        .orderBy('Created', false)
        .top(1)
        .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
        .expand("Demandeur")
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
              return remplacantTest;
            } else {
              return []
            }
    
          }else return []
        }else return []

      }
      

    } catch (error) {
      console.error("Error checking remplacant demandes:", error);
      return [];
    }
  }


  async componentDidMount() {
    
    // Get user info
    await this.loadUserInfo();

    if(APPROUVER_V4 === this.state.userRegistrationNumber){
      window.location.href = REDIRECTION_URL;
    }else {

      const DemandeurAcces = await this.getDemandeurAcces(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);
      const checkTestRemplacant = await this.checkRemplacantDemandes();

      if (checkTestRemplacant.length > 0) {
        if (DemandeurAcces === -1) {
          // Get status All in form by demandeur data
          console.log('condition 1');
          const remplacantEmail = checkTestRemplacant[0]['Demandeur']['EMail'];
          await this.checkUserPermissionsPerchaseModule(remplacantEmail);
          this.setState({
            checkRemplacant: true,
            showAnotePopUp: true,
            remplacantName: checkTestRemplacant[0].Demandeur.Title,
            remplacantID: checkTestRemplacant[0].DemandeurId,
            condition: 1
          });
          await this.loadRemplacantUserRemplacant(checkTestRemplacant[0]['Demandeur']['EMail']);
          
          // Get Resp Centre of Remplacant user
          const RemplacantUserDataFromERP = await this.getUserInfo(this.state.RemplacantUserEstablishment,this.state.RemplacantUserRegistrationNumber)
          this.setState({RemplacantRespCenter:RemplacantUserDataFromERP[0]['RespCenter']})
          console.log(RemplacantUserDataFromERP[0]['RespCenter'])
        } else if (DemandeurAcces === 0) {

          // Add both the demandeur and the remplaçant
          console.log('condition 2');
          this.setState({ 
            condition: 2,
            checkRemplacant: true,
            remplacantName: checkTestRemplacant[0].Demandeur.Title,
            remplacantID: checkTestRemplacant[0].DemandeurId,
          });
          await this.checkUserPermissionsPerchaseModule(checkTestRemplacant[0]['Demandeur']['EMail'])
          await this.loadRemplacantUserRemplacant(checkTestRemplacant[0]['Demandeur']['EMail']);

          // Get Resp Centre of current user
          const currentUserDataFromERP = await getUserInfo(this.state.userEstablishment,this.state.userRegistrationNumber)
          if (currentUserDataFromERP.length > 0){
            this.setState({userRespCenter:currentUserDataFromERP[0]['RespCenter']})
          }

          // Get Resp Centre of Remplacant user  
          const RemplacantUserDataFromERP = await this.getUserInfo(this.state.RemplacantUserEstablishment,this.state.RemplacantUserRegistrationNumber)
          this.setState({RemplacantRespCenter:RemplacantUserDataFromERP[0]['RespCenter']})

          console.log(RemplacantUserDataFromERP[0]['RespCenter'])
        }
      } else {
        if (DemandeurAcces === 0) {
          // Only add the demandeur
          console.log('condition 3');
          await this.checkUserPermissionsPerchaseModule(this.props.context.pageContext.legacyPageContext["userPrincipalName"]);
          this.setState({ condition: 3 });

          // Get Resp Centre of current user
          const currentUserDataFromERP = await getUserInfo(this.state.userEstablishment,this.state.userRegistrationNumber)
          console.log("User infoooooooooooooooooooooooo:  ",currentUserDataFromERP)
          if (currentUserDataFromERP.length > 0){
            this.setState({userRespCenter:currentUserDataFromERP[0]['RespCenter']})
          }
          // console.log(currentUserDataFromERP)
        } else {
          // Redirect to Home
          window.location.href = REDIRECTION_URL;
        }
      }

      if (this.state.DisabledBenef){
        // Get all famille products
        const listFamilleProduit = [] ;
        const familyProducts = await getFamily() ;
        familyProducts.Families.map(famille => {
          listFamilleProduit.push({
            key: famille.IdFamily,
            text: famille.DescFamily,
          })
        })
        this.setState({familyProducts:listFamilleProduit})
      }
      

      await this.checkUserActions() ;
    }
  }
  






  public render(): React.ReactElement<IFormulaireDemandeurProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      dropdown: { width: 300 },
      title: { backgroundColor: "white" },
    };

    const dropdownStylesFamilleDropdown: Partial<IDropdownStyles> = {
      callout: { minWidth: 300, maxwidth: 600 }, //Fix #2 alternative
      title: { backgroundColor: "white" },
    };
    

    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white"}
    });

    const disabledSubmit = this.disabledSubmitButton();
    
    // Created but not implemented
    var AllArticleData = getAllArticles(this.state.formData)
    const uniqueArray = removeDuplicates2(AllArticleData);
    console.log(uniqueArray);



    return (
      <Fabric
        className="App"
        style={{ background: theme.semanticColors.bodyBackground, color: theme.semanticColors.bodyText }}
      >
        <div className={stylescustom.formulaireDemandeur}>
          <div className={stylescustom.DC}>
            <p className={stylescustom.datenow}>Date : <span className="date-time">{FormatDate(new Date())}</span></p>
            <div className={stylescustom.titleh1}>Demande d'achat </div>
            <div className={stylescustom.line}></div>
            <div className={stylescustom.row}>
              <div className={stylescustom.col}>
                <table className={stylescustom.table}>
                  <tbody>
                    <tr>
                      <td className={stylescustom.key}>Nom de l'employé</td>
                      <td className={stylescustom.value}>{this.state.userName}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Adresse email de l'organisation</td>
                      <td className={stylescustom.value}>{this.state.userEmail}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Matricule employé</td>
                      <td className={stylescustom.value}>{this.state.userRegistrationNumber}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Entité professionnelle</td>
                      <td className={stylescustom.value}>{this.state.userEstablishment}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Post</td>
                      <td className={stylescustom.value}>{this.state.JobTitle}</td>
                    </tr>

                    {(this.state.checkRemplacant && this.state.condition === 2) && <tr>
                        <td className={stylescustom.key}>Vous êtes le remplaçant de {this.state.remplacantName}, donc pour qui choisir cette demande ?</td>
                        <td className={stylescustom.value}>
                          <ChoiceGroup 
                            defaultSelectedKey={this.state.demandeAffectation}
                            defaultValue={'Pour Moi'}
                            options={[
                              { key: 'me', text: 'Pour Moi'},
                              { key: this.state.remplacantID.toString(), text: `Pour ${this.state.remplacantName}` },
                            ]}
                            onChange={this._onChange} 
                            required={true} 
                          />
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
            <p className={stylescustom.indique}>* Indique un champ obligatoire</p>

            {this.intToList(this.state.counterProducts).map((index) => 
              <div>
                { (this.state.counterProducts  > 1) && (index !== 1) && 
                  <p className={stylescustom.indique}>
                    <button style={{float:"right"}} className={stylescustom.btn} onClick={() => this.deleteArticle(index - 1)}>-</button>
                  </p>
                }
                <div className='productsDiv'>
                  <div className={stylescustom.row}>
                    {!this.state.DisabledBenef && <div className={stylescustom.data}>
                      <p className={stylescustom.title}>Bénificaire / Déstinataire</p>
                      <Dropdown
                        styles={dropdownStyles}
                        defaultSelectedKey={this.state.formData[index - 1]["BeneficiareSelected"] && this.state.formData[index - 1]["BeneficiareSelected"][0] ? this.state.formData[index - 1]["BeneficiareSelected"][0].key : ""}
                        onChange={this.onSelectionChanged}
                        onRenderTitle={this.onRenderTitle}
                        onRenderOption={this.onRenderOption}
                        onRenderCaretDown={this.onRenderCaretDown}
                        options={this.getBeneficaire()}                      
                        onChanged={(value) => this.handleChangeDestinataireDropdown(value, index)}
                        style={{ width: '200px' }} // Specify the width you desire
                      />
                    </div>}
                    


                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* Famille</p>
                      {index > 1 ? (
                        <label className={stylescustom.btn} style={{width: '180px'}}>{this.state.formData[0].FamilleSelected[0].text}</label>
                      ) : (
                        <Dropdown
                          defaultValue={this.state.formData[index - 1]?.FamilleSelected?.[0]?.key || ""}
                          styles={dropdownStylesFamilleDropdown}
                          onRenderTitle={this.onRenderTitle}
                          onRenderOption={this.onRenderOption}
                          onRenderCaretDown={this.onRenderCaretDown}
                          options={this.state.familyProducts}
                          onChanged={(value) => this.handleChangeFamilleDropdown(value, index)}
                          defaultSelectedKey={this.state.formData[index - 1]?.FamilleSelected?.[0]?.key || ""}
                          style={{ width: '200px' }}
                        />
                      )}
                    </div>


                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* Sous famille</p>
                      <Dropdown
                        defaultSelectedKey={this.state.formData[index - 1]['SousFamilleSelected'] && this.state.formData[index - 1]['SousFamilleSelected'][0] ? this.state.formData[index - 1]['SousFamilleSelected'][0].key : ""}
                        styles={dropdownStyles}
                        onRenderTitle={this.onRenderTitle}
                        onRenderOption={this.onRenderOption}
                        onRenderCaretDown={this.onRenderCaretDown}
                        options={this.state.subFamilyProducts}                      
                        onChanged={(value) => this.handleChangeSousFamilleDropdown(value, index)}
                        style={{ width: '200px' }}
                      />
                    </div>



                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* Réference de l'article</p>
                      <Dropdown
                        styles={dropdownStyles}
                        defaultValue={this.state.formData[index - 1]?.ArticleSelected?.[0]?.key || ""}
                        defaultSelectedKey={this.state.formData[index - 1]["ArticleSelected"] && this.state.formData[index - 1]["ArticleSelected"][0] ? this.state.formData[index - 1]["ArticleSelected"][0].key : ""}
                        onChange={this.onSelectionChanged}
                        onRenderTitle={this.onRenderTitle}
                        onRenderOption={this.onRenderOption}
                        onRenderCaretDown={this.onRenderCaretDown}
                        options={this.state.formData[index - 1].AllArticleData}                       
                        onChanged={(value) => this.handleChangeArticleDropdown(value, index)}
                        style={{ width: '200px' }} // Specify the width you desire
                      />
                    </div>
                  </div>


                  <div className={stylescustom.row}>
                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* Quantité demandée :</p>
                      <TextField 
                        className={controlClass.TextField} 
                        type='number'
                        onChange={(e) => this.handleChangeQuantity(e, index)}
                        min={1}
                        value={ this.state.formData[index - 1]["quantity"] && this.state.formData[index - 1]["quantity"] ? this.state.formData[index - 1]["quantity"] : ""} 
                      />
                    </div>

                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* prix unitaire estimatif :</p>
                      <TextField 
                        type='number'
                        min={0.1}
                        step="0.1" // Allows float values
                        className={controlClass.TextField} 
                        onChange={(e) => this.handleChangePrice(e, index)}
                        value={this.state.formData[index - 1]["price"]} 
                      />
                    </div>


                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* Delai le livraison souhaité :</p>
                      <TextField 
                        type='number'
                        min={0}
                        value={String(this.state.formData[index - 1]["numberOfDays"])} 
                        onChange={(e) => this.handleInputChange(e, index)}
                      />
                    </div>
                  </div>


                  <div className={stylescustom.row}>
                    <div className={stylescustom.comment}>
                      <p className={stylescustom.title}>* Description :</p>
                      <TextField 
                        className={controlClass.TextField} 
                        value={this.state.formData[index - 1]["Comment"]} 
                        multiline 
                        onChange={(e) => this.handleChangeComment(e, index)}
                      />
                    </div>
                  </div>
                </div>
                <br></br>
                {this.state.counterProducts > 1 && <div className={stylescustom.line}></div>}
              </div>
            )}
  
            {
              !this.state.DisabledBenef 
                ? this.state.formData.map((article, index) => {
                    if (article.ArticleSelected.length > 0 && article) {
                      console.log(parseFloat(article.price) * parseInt(article.quantity))
                      console.log(article.ArticleSelected[0].BudgetAnnualAllocated)
                      if ((parseFloat(article.price) * parseInt(article.quantity)) > convertStringToNumber(article.ArticleSelected[0].BudgetAnnualRemaining)) {
                        return (
                          <p key={index} className={stylescustom.indique}>
                            - <b style={{color:"#7d2935"}}>Prévenez</b>, le coût de l'article {article.ArticleSelected[0].text} pour le bénéficiaire {article.BeneficiareSelected[0].text} de votre demande dépasse la limite budgétaire fixée.
                          </p>
                        );
                      }
                    }
                    return null;
                  })
                : this.state.formData.map((article, index) => {
                    if (article.ArticleSelected.length > 0 && article) {
                      if (parseFloat(article.price) * parseInt(article.quantity) > convertStringToNumber(article.ArticleSelected[0].BudgetAnnualRemaining)) {
                        return (
                          <div key={index}>
                            <p className={stylescustom.indique}>
                              - <b style={{color:"#7d2935"}}>Prévenez</b>, le coût de l'article {article.ArticleSelected[0].text} de votre demande dépasse la limite budgétaire fixée.
                            </p>
                          </div>
                        );
                      }
                    }
                    return null;})
            }

            
            <div className={stylescustom.row}>
              <div className={stylescustom.data}>
                <p className={stylescustom.title}> Piéce jointe :</p>
                <label htmlFor="uploadFile" className={stylescustom.btn}>Choisir un élément</label>
                <input type="file" id="uploadFile" style={{ display: 'none' }}
                  accept=".jpg, .jpeg, .png , .pdf , .doc ,.docx"
                  onChange={(e) => { 
                    this.addFile(e); 
                    this.setState({ errors: { ...this.state.errors, file: "" } });}} 
                  />
                {this.state.formData[0].fileData && <span style={{ marginLeft: 10, fontSize: 16, whiteSpace:"pre" }}>{this.state.formData[0].fileName} <span style={{ cursor: 'pointer' }} onClick={() => { this.initImage(1); }}>&#10006;</span></span>}
                <span style={{ color: "rgb(168, 0, 0)", fontSize: 12, fontWeight: 400, display: 'block' }}>
                  {this.state.errors.file !== "" ? this.state.errors.file : ""}
                </span>
              </div>
            </div>
                    

            <table className={stylescustom.ad}>
              <thead>
                <th className={stylescustom.title} >Autres détails</th>
              </thead>
              <tbody className={stylescustom.tbody}>
                {console.log(this.state.formData)}
                {console.log(this.state.formData)}
                {console.log(this.state.DisabledBenef)}
                {(this.state.DisabledBenef === false) && this.state.formData.map((article, index) =>
                  article.ArticleSelected.length > 0 && article &&
                  <>
                    {console.log("Axe data:",this.state.axePerBuget)}
                    {console.log(article)}
                    <tr>
                      <td className={stylescustom.key}>- Déstinataire: </td>
                      <td className={stylescustom.value}>{article.BeneficiareSelected.length > 0 && article.BeneficiareSelected[0].text}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le budget de l'article: </td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].text}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel alloué</td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].BudgetAnnualAllocated}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel restant</td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].BudgetAnnualRemaining}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel utilisé</td>
                      <td className={stylescustom.value}>{article.ArticleSelected.length > 0 && article.ArticleSelected[0].BudgetAnnualUsed}</td>
                    </tr>
                  </>
                )}
                {(this.state.DisabledBenef === true) && uniqueArray.map((article, index) =>
                  <>
                    {console.log(article)}
                    {console.log(parseInt(this.state.formData[this.state.counterProducts - 1].quantity))}
                    {console.log(parseFloat(this.state.formData[this.state.counterProducts - 1].price))}
                    <tr>
                      <td className={stylescustom.key}>Le budget de l'article: </td>
                      <td className={stylescustom.value}>{article.text}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel alloué</td>
                      <td className={stylescustom.value}>{article.BudgetAnnualAllocated}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel restant</td>
                      <td className={stylescustom.value}>
                        {article.BudgetAnnualRemaining}
                      </td>                  
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel utilisé</td>
                      <td className={stylescustom.value}>{article.BudgetAnnualUsed}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>


            {this.state.checkActionCurrentUser && 
              <div className={stylescustom.btncont}>
                <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.addArticle()}>AJOUTER UN ARTICLE</button>
                <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.submitFormData()}>soumettre la demande</button>
              </div>
            }

            
            <SweetAlert2
              allowOutsideClick={false}
              show={this.state.showValidationPopUp} 
              title="Demande des Articles" 
              text="Demande envoyée"
              imageUrl={img}
              confirmButtonColor='#7D2935'
              onConfirm={() => window.open(this.props.url + "/SitePages/DashboardDemandeur.aspx", "_self")}
              imageWidth="150"
              imageHeight="150"
            />


            <SweetAlert2
              allowOutsideClick={false}
              show={this.state.showPopUpApprouver4} 
              title="Demande des Articles" 
              text="Désole Mr/Mme vous n'avez le droit de créer des demandes d'achat car vous étes un Controlleur de gestion"
              imageUrl={img}
              confirmButtonColor='#7D2935'
              onConfirm={() => window.open(this.props.url + "/SitePages/DashboardDemandeur.aspx", "_self")}
              imageWidth="150"
              imageHeight="150"
            />
          </div>



          {this.state.spinnerShow && 
            <div className={stylescustom.modal}>
              <div className={stylescustom.modalContent}>
                <div className={stylescustom.paginations} style={{ textAlign: 'center', paddingTop:"30%" }}>
                  {this.state.spinnerShow && <span className={stylescustom.loader}></span>}
                </div>              
              </div>
            </div>
          }
        </div>

        {this.state.showAnotePopUp && (
          <div className={styles.demandeurDashboard}>
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <span className={styles.close} onClick={() => this.setState({showAnotePopUp:false})}>&times;</span>
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
          <div className={styles.demandeurDashboard}>
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <span className={styles.close} onClick={() => this.setState({checkActionCurrentUserPopUp: false})}>&times;</span>
                <h3>À noter</h3>
                <ul>
                    <li>
                      Monsieur/Madame, vous n'avez pas le droit de créer des demandes d'achat car vous avez déja un remplaçant
                    </li>
                </ul>
                <p> =&gt; Vous avez le droit d'effectuer des actions quand la période de remplacement est terminée.</p>
              </div>
            </div>
          </div>
        )}



        {this.state.popUpApprobateurs && (
          <div className={styles.demandeurDashboard}>
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <span className={styles.close} onClick={() => location.reload()}>&times;</span>
                <h3>À noter</h3>
                <ul>
                    <li>
                      Je vous prie de m'excuser, Monsieur/Madame. Nous n'avons pas de liste d'approbateurs pour cette demande.
                    </li>
                </ul>

                <p> =&gt; Veuillez fournir d'autres données.</p>
              </div>
            </div>
          </div>
        )}
      </Fabric>
    );
  }
}
