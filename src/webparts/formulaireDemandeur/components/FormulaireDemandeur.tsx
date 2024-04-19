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
import { checkIfAxeExists, checkRodondanceApprouvers, getApprobateurNiveau, getCurrentDate } from '../../../tools/FunctionTools';
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
      ArticleSelected: [] as any,
      BeneficiareSelected : [] as any,
      Comment: "",
      quantity: "",
      price: "" ,
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
    showPopUpApprouver4: false
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
      formData: updatedFormData
    });
    (document.getElementById('uploadFile') as HTMLInputElement).value = "";
  }


  private checkUserActions = async() => {
    const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
    const now: string = new Date().toISOString(); // Format the current date to ISO 8601
    const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
    .filter(`DemandeurId eq ${currentUserID} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'D'`)
    .orderBy('Created', false)
    .top(1)
    .get();

    if (remplacantTest.length > 0) {
      this.setState({checkActionCurrentUser : false, checkActionCurrentUserPopUp: true});
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


  public addFile = (content: any) => {
    console.log(this.state.counterProducts);
  
    const fileName = content.target.files[0].name;
    const extension = fileName.split('.').pop();
    const encodedFileName = `${fileName.split('.').slice(0, -1).join('.')}.${extension}`;
  
    const newFile = new File([content.target.files[0]], encodedFileName, { type: content.target.files[0].type });
  
    const updatedFormData = [...this.state.formData];
    updatedFormData[this.state.counterProducts - 1].fileName = fileName; // Store the original file name
    updatedFormData[this.state.counterProducts - 1].fileData = newFile;
  
    this.setState({
      formData: updatedFormData
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

    console.log(index)
    this.setState({
      formData: updatedFormData,
      SousFamilleID: event.key,
      ArticleID: "",
      articles: [],
      // axePerBuget: this.state.axePerBuget.slice(index, 1)
    });
    console.log(event.key)
    console.log(this.state.userRespCenter)

    var items
    if (this.state.demandeAffectation === "me"){
      items = await getProduct(event.key, this.state.userRespCenter) ;
      console.log(items)
    }else {
      items = await getProduct(event.key, this.state.RemplacantRespCenter) ;
      console.log(items)
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
    this.setState({articles:listArticles})
  }


  private handleChangeArticleDropdown = (event: any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index - 1].ArticleSelected = [event];
  
    // if (this.state.axePerBuget.some(obj => obj.Axe === x))
    var newAxeList = []
    updatedFormData.forEach(article => {
      if (!this.state.axePerBuget.some(obj => obj.Axe === article.ArticleSelected[0].Axe)) {
        newAxeList.push({
          "Axe": article.ArticleSelected[0].Axe,
          "BudgetAnnualAllocated": article.ArticleSelected[0].BudgetAnnualAllocated,
          "BudgetAnnualRemaining": article.ArticleSelected[0].BudgetAnnualRemaining,
          "BudgetAnnualUsed": article.ArticleSelected[0].BudgetAnnualUsed,
        });
      }else {
        newAxeList = this.state.axePerBuget
      }
    });
  
    this.setState({
      formData: updatedFormData,
      axePerBuget: newAxeList
    });

    

    // if (this.state.axePerBuget.length === 0 ){
    //   const listAxes = [{
    //     Axe: event.Axe,
    //     BudgetAnnualAllocated: event.BudgetAnnualAllocated,
    //     BudgetAnnualRemaining: event.BudgetAnnualRemaining,
    //     BudgetAnnualUsed: event.BudgetAnnualUsed
    //   }]
    //   this.setState({
    //     axePerBuget:listAxes,
    //   })
    // }else {
    //   console.log(index)

    //   if (checkIfAxeExists(this.state.axePerBuget,event.Axe) === false) {
    //     const newAxeObject = {
    //       Axe: event.Axe,
    //       BudgetAnnualAllocated: event.BudgetAnnualAllocated,
    //       BudgetAnnualRemaining: event.BudgetAnnualRemaining,
    //       BudgetAnnualUsed: event.BudgetAnnualUsed
    //     }
    //     // console.log('axe',this.state.axePerBuget)
    //     const updatedAxePerBudget = [...this.state.axePerBuget]
    //     updatedAxePerBudget.push(newAxeObject)
    //     this.setState({
    //       axePerBuget: updatedAxePerBudget
    //     })
    //   }
    // }
  }


  private handleChangeDestinataireDropdown = (event:any, index: any) => {
    const updatedFormData = [...this.state.formData];
    updatedFormData[index-1].BeneficiareSelected = [event]
    this.setState({
      formData: updatedFormData
    });
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
      ArticleSelected: []as any,
      BeneficiareSelected: []as any,
      Comment: "",
      quantity:"",
      price:"",
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


  private disabledSubmitButton = () => {
    return this.state.formData.some(formData => (
      formData.FamilleSelected.length === 0 ||
      formData.SousFamilleSelected.length === 0 ||
      formData.ArticleSelected.length === 0 ||
      formData.quantity.length === 0 ||
      formData.price.length === 0 ||
      formData.Comment.length === 0 || 
      formData.numberOfDays.length === 0
    ));
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


  private _onChange = (ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption) => {
    console.log(option)
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


  private submitFormData = async () => {
    const disabledSubmit = this.disabledSubmitButton();
    const currentUser = await Web(this.props.url).currentUser.get() ;
    var ArticleList = [];
    var prixTotal = 0;
    // var checkApprobateur4 = false

    if (!disabledSubmit) {

      this.setState({spinnerShow : true}) ;

      var listApprouvers
      if (this.state.demandeAffectation === "me"){
        listApprouvers = await this.getUserApprouvers(this.state.SousFamilleID, this.state.userRespCenter)
      }else {
        listApprouvers = await this.getUserApprouvers(this.state.SousFamilleID, this.state.RemplacantRespCenter)
      }



      console.log(listApprouvers)
      if (listApprouvers['Status'] === "200") {
        var getProbateurs = [] ;

        const promises = listApprouvers['approvalsList'].map(async approuver => {
          const approbateurV1Id = await this.getUserByEmail(approuver.NameApp1);
          const approbateurV2Id = await this.getUserByEmail(approuver.NameApp2);
          const approbateurV3Id = approuver.NameApp3 !== "" ? await this.getUserByEmail(approuver.NameApp3) : null;
          const approbateurV4Id = await this.getUserByEmail(approuver.NameApp4);
      
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
        const approuversResponse = await this.checkApprouverRemplacant(getProbateurs[0].ApprobateurV1Id[0], getProbateurs[0].ApprobateurV2Id[0], getProbateurs[0].ApprobateurV3Id !== null ? getProbateurs[0].ApprobateurV3Id[0] : null, getProbateurs[0].ApprobateurV4Id[0]);

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

        const data = this.state.formData;
        console.log('all Data:', data)  
        data.map(Article => {
          console.log("Article", Article)
          prixTotal = prixTotal + parseInt(Article.price);
          ArticleList.push({
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
                "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
              }
            }else if (this.state.checkRemplacant && this.state.condition === 1) {
              formData = {
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
            }else {
              formData = {
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
                "CentreDeGestion": this.state.userRespCenter
              }
            }
            
          }else {
            if (this.state.checkRemplacant && this.state.condition === 2){
              formData = {
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
                "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
              }
            }else if (this.state.checkRemplacant && this.state.condition === 1){
              formData = {
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
                "CentreDeGestion": this.state.RemplacantRespCenter
              }
            }
            else {
              formData = {
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
                "CentreDeGestion": this.state.userRespCenter
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
              const checkUserNiveau = getApprobateurNiveau(currentUser.Id ,getProbateurs)
              console.log(checkUserNiveau)
              if (checkUserNiveau === 0){
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }else if (checkUserNiveau === 1){
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }else if (checkUserNiveau === 2){
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }else if (checkUserNiveau === 4){
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }
            }

          }else {
            console.log("test with approbateur 3")
            if (this.state.checkRemplacant && this.state.condition === 2){
              const checkUserNiveau = getApprobateurNiveau(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,getProbateurs) ;
              if (checkUserNiveau === 0) {
                formData = {
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
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 1) {
                formData = {
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
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 2) {
                formData = {
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
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 3) {
                formData = {
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
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 4) {
                formData = {
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
                  "CentreDeGestion": this.state.demandeAffectation === "me" ? this.state.userRespCenter : this.state.RemplacantRespCenter
                }
              }
              
            }else if(this.state.checkRemplacant && this.state.condition === 1){
              const checkUserNiveau = getApprobateurNiveau(this.state.remplacantID,getProbateurs) ;
              if (checkUserNiveau === 0) {
                formData = {
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
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 1) {
                formData = {
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
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 2) {
                formData = {
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
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 3) {
                formData = {
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
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }else if (checkUserNiveau === 4) {
                formData = {
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
                  "CentreDeGestion": this.state.RemplacantRespCenter
                }
              }

            } else {
              const checkUserNiveau = getApprobateurNiveau(currentUser.Id ,getProbateurs) ;
              console.log(checkUserNiveau)
              if (checkUserNiveau === 0) {
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }else if (checkUserNiveau === 1) {
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }else if (checkUserNiveau === 2) {
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }else if (checkUserNiveau === 3) {
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
                }
              }else if (checkUserNiveau === 4) {
                formData = {
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
                  "CentreDeGestion": this.state.userRespCenter
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
      }
    }
  }


  // Check if the current user in list of remplaçant if true get the list of demands of the other demander
  private checkRemplacantDemandes = async () => {
    try {
      const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
      const now: string = new Date().toISOString(); // Format the current date to ISO 8601
      const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
      .filter(`RemplacantId eq ${currentUserID} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'D'`)
      .orderBy('Created', false)
      .top(1)
      .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
      .expand("Demandeur")
      .get();

      console.log(remplacantTest);
      return remplacantTest;

    } catch (error) {
      console.error("Error checking remplacant demandes:", error);
      return [];
    }
  }


  // En cours ....
  // private getApprobateurIdByUCTemail = async(approbateurEmail) => {
  //   const userInfo = await Web(this.props.url).ensureUser(approbateurEmail);
  //   return userInfo.data.Id;
  // }


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
    if(permissions['Status'] !== "200"){
      window.location.href = REDIRECTION_URL;
    }else {
      if (permissions['StatusAll'] === true){
        this.setState({DisabledBenef: false})
      }else {
        this.setState({DisabledBenef: true})
      }
    }
  }

  public async getUserByEmail(userDisplayName){
    try {
        const userEmailMSgraph = await this._graphService.getUserEmailByDisplayName(userDisplayName)
        const user = await Web(this.props.url).ensureUser(userEmailMSgraph);
        return user.data.Id;
    } catch (error) {
        throw error; // Re-throw the error
    }
  }


  private checkApprouverRemplacant = async(Approuver1, Approuver2, Approuver3, Approuver4) => {
    try {
      if (Approuver3 !== null){
        const now: string = new Date().toISOString(); // Format the current date to ISO 8601
        const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
        .filter(`DemandeurId eq ${Approuver1} or DemandeurId eq ${Approuver2} DemandeurId eq ${Approuver3} or DemandeurId eq ${Approuver4} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'AP'`)
        .orderBy('Created', false)
        .top(1)
        .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
        .expand("Demandeur")
        .get();
  
        console.log(remplacantTest);
        return remplacantTest;
      }else {
        const now: string = new Date().toISOString(); // Format the current date to ISO 8601
        const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
        .filter(`DemandeurId eq ${Approuver1} or DemandeurId eq ${Approuver2} or DemandeurId eq ${Approuver4} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'AP'`)
        .orderBy('Created', false)
        .top(1)
        .select("Demandeur/Title", "Demandeur/EMail", "DemandeurId", "RemplacantId", "DateDeDebut", "DateDeFin")
        .expand("Demandeur")
        .get();
        return remplacantTest;
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
          this.setState({userRespCenter:RemplacantUserDataFromERP[0]['RespCenter']})
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
          if (currentUserDataFromERP.length > 0){
            this.setState({userRespCenter:currentUserDataFromERP[0]['RespCenter']})
          }
          // console.log(currentUserDataFromERP)
        } else {
          // Redirect to Home
          window.location.href = REDIRECTION_URL;
        }
      }

    


      // // Check if user have remplacant or not
      // const checkTestRemplacant = await this.checkRemplacantDemandes() ;
      // if (checkTestRemplacant.length > 0){
      //   console.log(checkTestRemplacant)

      //   // Get status All in form by demandeur data
      //   await this.checkUserPermissionsPerchaseModule(checkTestRemplacant[0]['Demandeur']['EMail'])
      //   this.setState({checkRemplacant: true, showAnotePopUp: true, remplacantName: checkTestRemplacant[0].Demandeur.Title, remplacantID:checkTestRemplacant[0].DemandeurId})
      // }else {
      //   // Get status All in form by remplacant data
      //   await this.checkUserPermissionsPerchaseModule(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
      // }

      await this.checkUserActions() ;

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
  }
  






  public render(): React.ReactElement<IFormulaireDemandeurProps> {

    const dropdownStyles: Partial<IDropdownStyles> = {
      title: { backgroundColor: "white" },
    };

    const controlClass = mergeStyleSets({
      TextField: { backgroundColor: "white", }
    });

    const disabledSubmit = this.disabledSubmitButton()



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
              <div className='productsDiv'>
                <div className={stylescustom.row}>
                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Famille</p>
                    {index > 1 ? (
                      <label className={stylescustom.btn}>{this.state.formData[0].FamilleSelected[0].text}</label>
                    ) : (
                      <Dropdown
                        defaultValue={this.state.formData[index - 1]?.FamilleSelected?.[0]?.key || ""}
                        styles={dropdownStyles}
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
                      options={this.state.articles}                       
                      onChanged={(value) => this.handleChangeArticleDropdown(value, index)}
                      style={{ width: '200px' }} // Specify the width you desire
                    />
                  </div>


                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>Bénificaire / Déstinataire</p>
                    <Dropdown
                      disabled={!this.state.DisabledBenef}
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
                  </div>
                </div>


                <div className={stylescustom.row}>
                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Quantité demandée :</p>
                    <TextField 
                      className={controlClass.TextField} 
                      type='number'
                      onChange={(e) => this.handleChangeQuantity(e, index)}
                      min={0}
                      value={ this.state.formData[index - 1]["quantity"] && this.state.formData[index - 1]["quantity"] ? this.state.formData[index - 1]["quantity"] : ""} 
                    />
                  </div>

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}>* Prix estimatifs :</p>
                    <TextField 
                      type='number'
                      min={0}
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

                  <div className={stylescustom.data}>
                    <p className={stylescustom.title}> Piéce jointe :</p>
                    <label htmlFor="uploadFile" className={stylescustom.btn}>Choisir un élément</label>
                    <input type="file" id="uploadFile" style={{ display: 'none' }}
                      accept=".jpg, .jpeg, .png , .pdf , .doc ,.docx"
                      onChange={(e) => { 
                        this.addFile(e); 
                        this.setState({ errors: { ...this.state.errors, file: "" } });}} 
                      />
                    {this.state.formData[index - 1].fileData && <span style={{ marginLeft: 10, fontSize: 14 }}>{this.state.formData[index - 1].fileName} <span style={{ cursor: 'pointer' }} onClick={() => { this.initImage(index); }}>&#10006;</span></span>}
                    <span style={{ color: "rgb(168, 0, 0)", fontSize: 12, fontWeight: 400, display: 'block' }}>
                      {this.state.errors.file !== "" ? this.state.errors.file : ""}
                    </span>
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
            )}


            <table className={stylescustom.ad}>
              <thead>
                <th className={stylescustom.title} >Autres détails</th>
              </thead>
              <tbody className={stylescustom.tbody}>
                {console.log(this.state.formData)}
                {this.state.axePerBuget.map((article, index) =>
                  article &&
                  <>
                    {console.log("Axe data:",this.state.axePerBuget)}
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel alloué</td>
                      <td className={stylescustom.value}>{article.BudgetAnnualAllocated}</td>
                    </tr>
                    <tr>
                      <td className={stylescustom.key}>Le montant du budget annuel restant</td>
                      <td className={stylescustom.value}>{article.BudgetAnnualRemaining}</td>
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
                <button disabled={disabledSubmit} className={stylescustom.btn} onClick={() => this.addArticle()}>AJOUTER UNE AUTRE ARTICLE</button>
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
                <span className={styles.close} onClick={() => this.setState({checkActionCurrentUserPopUp:false})}>&times;</span>
                <h3>À noter</h3>
                <ul>
                    <li>
                      Monsieur/Madame, vous n'avez de creer des demandes d'achat car vous avez déja un remplaçant
                    </li>
                </ul>
                <p> =&gt; Vous avez le droit d'effectuer des actions quand la période de remplacement est terminée.</p>
              </div>
            </div>
          </div>
        )}
      </Fabric>
    );
  }
}
