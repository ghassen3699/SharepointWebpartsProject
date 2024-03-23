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
import { checkIfAxeExists, getApprobateurNiveau, getCurrentDate } from '../../../tools/FunctionTools';
import { getUserInfo } from "../../../services/getUserInfo" ;
import { getSubFamily } from "../../../services/getProductsSubFamily" ;
import { getFamily } from "../../../services/getAllProductFamily" ;
import { getProduct } from "../../../services/getProducts" ;
import { getApprouverList } from "../../../services/getApprouveurs" ;
import { getBenefList } from "../../../services/getListBenefPermissions" ;

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
    DisabledBenef: true
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

    // const items = await getProduct(event.key, this.state.userEstablishment) ;
    const items = await getProduct("01001", "HEALTH") ;
    const listArticles = items.Items.map(item => ({
      key: item.RefItem, 
      LatestPurchasePrice: item.LatestPurchasePrice,
      text: item.DesignationItem, 
      BudgetAnnualUsed: item.BudgetAnnualUsed,
      BudgetAnnualRemaining: item.BudgetAnnualRemaining, 
      BudgetAnnualAllocated: item.BudgetAnnualAllocated, 
      Axe: item.Axe, 
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } 
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
      formData.BeneficiareSelected.length === 0 ||
      formData.quantity.length === 0 ||
      formData.price.length === 0 ||
      formData.Comment.length === 0 || 
      formData.numberOfDays.length === 0
    ));
  }

  // private SendArticleToSharepointList = (data: any) => {
    
  // }

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


  private getFamilleProduit = () => {
    var listFamilleProduit = []
    if (this.state.familyProducts.length > 0){
      const familyProducts = this.state.familyProducts[0].Families

      familyProducts.map(famille => {
        listFamilleProduit.push({
          key: famille.IdFamily,
          text: famille.DescFamily,
          data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
        })
      })
    }
    // var listFamilleProduit = [
    // {
    //   key: "CARBURANT",
    //   text: "CARBURANT",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // },{
    //   key: "CONSOMMABLE LABO/STUDIO",
    //   text: "CONSOMMABLE LABO/STUDIO",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // },{
    //   key: "CONSTRUCTION ET AMENAGEMENT",
    //   text: "CONSTRUCTION ET AMENAGEMENT",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // },{
    //   key: "DOCUMENTS IMPRIMABLE",
    //   text: "DOCUMENTS IMPRIMABLE",
    //   data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    // }]
    return listFamilleProduit
  }


  private getSubFamilyData = async(FamilleID) => {
    var sousFamilles = []
    const sousFamilyData = await getSubFamily(FamilleID.toString()) ;
    sousFamilyData.SubFamilies.map(sousFamily => {
      sousFamilles.push({
        key: sousFamily.IdSubFamily,
        text: sousFamily.DescSubFamily,
        FamilleKey: sousFamily.IdFamily,
        data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
      })
    })
    this.setState({subFamilyProducts:sousFamilles})
  }


  // private getSousFamilleProduit = () => {

  //   var listSousFamilleProduit = [{
  //     key: "CARBURANT",
  //     text: "CARBURANT",
  //     FamilleKey: "CARBURANT",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "ART & DECORATION",
  //     text: "ART & DECORATION",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "AUDIOVISUEL",
  //     text: "AUDIOVISUEL",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "BIOLOGIE",
  //     text: "BIOLOGIE",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "CONSOMMABLES PROTHESE",
  //     text: "CONSOMMABLES PROTHESE",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "NURSING",
  //     text: "NURSING",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "OPTIQUES ET LUNETTERIES",
  //     text: "OPTIQUES ET LUNETTERIES",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "TOPOGRAPHIQUE ET GEOLOGIQUE",
  //     text: "TOPOGRAPHIQUE ET GEOLOGIQUE",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "ELECTROMECANIQUE",
  //     text: "ELECTROMECANIQUE",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "VERRERIES",
  //     text: "VERRERIES",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "PRODUITS CHIMIQUES",
  //     text: "PRODUITS CHIMIQUES",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "SOUDURE",
  //     text: "SOUDURE",
  //     FamilleKey: "CONSOMMABLE LABO/STUDIO",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "AGENCEMENT ET AMENAGEMENT",
  //     text: "AGENCEMENT ET AMENAGEMENT",
  //     FamilleKey: "CONSTRUCTION ET AMENAGEMENT",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   },
  //   {
  //     key: "DOCUMENTS IMPRIMABLE",
  //     text: "DOCUMENTS IMPRIMABLE",
  //     FamilleKey: "DOCUMENTS IMPRIMABLE",
  //     data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
  //   }]
  //   return listSousFamilleProduit
  // }


  getArticle = () => {
    var listProduit = [
      { key: "CHAUSSETTE_BASKET", text: "CHAUSSETTE BASKET", sousFamilleKey: "CARBURANT", Axe: "Fuel", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "BALLON", text: "BALLON", sousFamilleKey: "CARBURANT", Axe: "Fuel", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "LOCATION_TERRAIN", text: "LOCATION TERRAIN", sousFamilleKey: "CARBURANT", Axe: "Fuel", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "TENUE", text: "TENUE", sousFamilleKey: "ART & DECORATION", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "GASOIL", text: "GASOIL", sousFamilleKey: "AUDIOVISUEL", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "SERVICE_GASOIL", text: "SERVICE GASOIL", sousFamilleKey: "BIOLOGIE", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CARTE_PAYAGE", text: "CARTE PAYAGE", sousFamilleKey: "BIOLOGIE", Axe: "Lab furniture", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_ART", text: "CONSOMMABLE ART", sousFamilleKey: "CONSOMMABLES PROTHESE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMABLES_AUDIOVISUEL", text: "CONSOMABLES AUDIOVISUEL", sousFamilleKey: "NURSING", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "PRODUITS_CHIMIQUE", text: "PRODUITS CHIMIQUE", sousFamilleKey: "OPTIQUES ET LUNETTERIES", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLES_BCP", text: "CONSOMMABLES BCP", sousFamilleKey: "TOPOGRAPHIQUE ET GEOLOGIQUE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_PROTHESE", text: "CONSOMMABLE PROTHESE", sousFamilleKey: "ELECTROMECANIQUE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_NURSING", text: "CONSOMMABLE NURSING", sousFamilleKey: "VERRERIES", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomables_OPTIQUES_ET_LUNETTERIES", text: "Consomables OPTIQUES ET LUNETTERIES", sousFamilleKey: "PRODUITS CHIMIQUES", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMABLES_TOPOGRAPHIQUE_ET_GEOLOGIQUE", text: "CONSOMABLES TOPOGRAPHIQUE ET GEOLOGIQUE", sousFamilleKey: "SOUDURE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLE_ELECTROMECANIQUE", text: "CONSOMMABLE ELECTROMECANIQUE", sousFamilleKey: "SOUDURE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMABLES_VERRERIES", text: "CONSOMABLES VERRERIES", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CONSOMMABLES_PRODUITS_CHIMIQUES", text: "CONSOMMABLES PRODUITS CHIMIQUES", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomable_SOUDURE", text: "Consomable SOUDURE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomables_PHYSIOTHERAPIE", text: "Consomables PHYSIOTHERAPIE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "Consomables_Climatisation", text: "Consomables Climatisation", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: {icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "FOURNITURE_ET_POSE", text: "FOURNITURE ET POSE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "REAMENAGEMENT", text: "REAMENAGEMENT", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "PEINTURE_GENERALE", text: "PEINTURE GENERALE", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CLIMATISATION", text: "CLIMATISATION", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ENSEIGNES", text: "ENSEIGNES", sousFamilleKey: "AGENCEMENT ET AMENAGEMENT", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ETUDES", text: "ETUDES", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "AMENAGEMENT", text: "AMENAGEMENT", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "RIDEAUX", text: "RIDEAUX", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "CLIMATISEURS", text: "CLIMATISEURS", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "TRAVAUX_AMENAGEMENT_ET_INSTALLATION_ELECTRICITE", text: "TRAVAUX AMENAGEMENT ET INSTALLATION ELECTRICITE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "REGLEMENT_INTERIEUR", text: "REGLEMENT INTERIEUR", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "FORMULAIRE_DINSCRIPTION", text: "FORMULAIRE D'INSCRIPTION", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "JOURNAL_DE_STAGE", text: "JOURNAL DE STAGE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "RAPPORT_DE_STAGE", text: "RAPPORT DE STAGE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "FEUILLE_DE_EXAMEN", text: "FEUILLE D'EXAMEN", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "PAPIER_EN_TETE", text: "PAPIER EN TETE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "IMPRIME_DE_DIPLOME", text: "IMPRIME DE DIPLÔME", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ATTESTATION", text: "ATTESTATION", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "BLOC_NOTE", text: "BLOC NOTE", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
      { key: "ETIQUETTES", text: "ETIQUETTES", sousFamilleKey: "DOCUMENTS IMPRIMABLE", Axe: "", data: { icon: 'CircleShapeSolid', colorName: "#ff0000" } },
    ];
    return listProduit;
  };
  

  private getBeneficaire = () => {
    var listBenef = [{
      key: "COM",
      text: "COM",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "AAC_TUNIS",
      text: "AAC TUNIS",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "IMSET_TUNIS",
      text: "IMSET TUNIS",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "SIEGE",
      text: "SIEGE",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "AAC_NABEUL",
      text: "AAC NABEUL",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "POLYTECH",
      text: "POLYTECH",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "CLC",
      text: "CLC",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "HEALTH",
      text: "HEALTH",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "DG",
      text: "DG",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "EXECUTIVE",
      text: "EXECUTIVE",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "IT",
      text: "IT",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "DSP",
      text: "DSP",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "IMSET_NABEUL",
      text: "IMSET NABEUL",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "IMSET GABES",
      text: "IMSET GABES",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "IMSET SOUSSE",
      text: "IMSET SOUSSE",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "IMSET_SFAX",
      text: "IMSET SFAX",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },
    {
      key: "CC",
      text: "CC",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
    },{
      key: "MSC",
      text: "MSC",
      data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
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


  private submitFormData = async () => {
    const disabledSubmit = this.disabledSubmitButton();
    const currentUser = await Web(this.props.url).currentUser.get() ;
    var ArticleList = []
    var prixTotal = 0


    if (!disabledSubmit) {

      this.setState({spinnerShow : true}) ;

      // const listApprouvers = await this.getUserApprouvers(this.state.SousFamilleID, this.state.userEstablishment)
      const listApprouvers = await this.getUserApprouvers("01002", "AAC NABEUL") ;
      console.log(listApprouvers)
      if (listApprouvers['Status'] === "200") {
        var getProbateurs = [] ;
        
        listApprouvers['approvalsList'].map(approuver => {
          getProbateurs.push({
            "ApprobateurV1Id": [111], 
            "UserDisplayNameV1": approuver.NameApp1,
            "ApprobateurV2Id": [112], 
            "UserDisplayNameV2": approuver.NameApp2,
            "ApprobateurV3Id": [6],
            "UserDisplayNameV3": approuver.NameApp3,
            "ApprobateurV4Id": null,
            "UserDisplayNameV4": null,
          })
        })

      
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

        // const getProbateurs = await Web(this.props.url).lists.getByTitle("ValidateurParEcole").items.filter("Ecole eq 'Ecole 3'").top(2000).orderBy("Created", false).get(); 
        // console.log("Appppp:",getProbateurs)

        if (getProbateurs[0].ApprobateurV1Id.length > 1){
          console.log("test 1")
          // let UserDisplayNameV1 = "";
          // await Promise.all(
          //   getProbateurs[0].ApprobateurV1Id.map(async (approbateur) => {
          //     try {
          //       const user = await Web(this.props.url).siteUsers.getById(approbateur).get();
          //       const UserDisplayNameV1Title = user.Title;

          //       if (UserDisplayNameV1.length === 0) {
          //         UserDisplayNameV1 = UserDisplayNameV1Title;
          //       } else {
          //         UserDisplayNameV1 = UserDisplayNameV1 + " Ou " + UserDisplayNameV1Title;
          //       }
          //     } catch (error) {
          //       console.error(`Error retrieving user information for ${approbateur}:`, error);
          //     }
          //   })
          // );
          
          if (getProbateurs[0].ApprobateurV4Id === null){
            if (this.state.checkRemplacant){
              formData = {
                "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected[0].text,
                "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "StatusDemandeV4":"***",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": this.state.remplacantName
              }
            }else {
              formData = {
                "DemandeurId":currentUser.Id ,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected[0].text,
                "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "StatusDemandeV4":"***",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": currentUser.Title
              }
            }
            
          }else {
            if (this.state.checkRemplacant){
              formData = {
                "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected[0].text,
                "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": this.state.remplacantName
              }
            }else {
              formData = {
                "DemandeurId":currentUser.Id ,
                "EcoleId":getProbateurs[0].ID ,
                "FamilleProduit": data[0].FamilleSelected[0].text,
                "FamilleProduitREF": data[0].FamilleSelected[0].key,
                "Beneficiaire": data[0].BeneficiareSelected[0].text,
                "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                "PrixTotal":prixTotal.toString(),
                "DelaiLivraisionSouhaite":data[0].numberOfDays,
                "Prix": "test ...." ,
                "Quantite": "test ....",
                "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                "StatusDemandeV1":"En cours",
                "StatusDemandeV4":"***",
                "Produit": JSON.stringify(ArticleList),
                "CreerPar": currentUser.Title
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

          if (getProbateurs[0].ApprobateurV4Id === null){
            const sendApprobateursData: IItemAddResult = await Web(this.props.url).lists.getByTitle("WorkflowApprobation").items
            .add({
              "DemandeID": sendData.data.ID.toString(),
              "ApprobateurV1Id": { results: getProbateurs[0].ApprobateurV1Id },
              "ApprobateurV2Id": { results: getProbateurs[0].ApprobateurV2Id },
              "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
              "StatusApprobateurV1": "En cours",
              "StatusApprobateurV2": "",
              "StatusApprobateurV3": "",
              "StatusApprobateurV4": "***",
              "CommentaireApprobateurV1": "",
              "CommentaireApprobateurV2": "",
              "CommentaireApprobateurV3": "",
              "CommentaireApprobateurV4": "***",
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
          if (getProbateurs[0].ApprobateurV4Id === null){
            if (this.state.checkRemplacant){
              const checkUserNiveau = getApprobateurNiveau(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,getProbateurs)
              if (checkUserNiveau === 0){
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }else if (checkUserNiveau === 1){
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }else if (checkUserNiveau === 2){
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"En cours",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }else if (checkUserNiveau === 3){
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuver par " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"Approuver",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }
              
            }else {
              const checkUserNiveau = getApprobateurNiveau(currentUser.Id ,getProbateurs)
              console.log(checkUserNiveau)
              if (checkUserNiveau === 0){
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }else if (checkUserNiveau === 1){
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }else if (checkUserNiveau === 2){
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"En cours",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }else if (checkUserNiveau === 3){
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuver par " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"Approuver",
                  "StatusDemandeV4":"***",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }
            }

          }else {
            if (this.state.checkRemplacant){
              const checkUserNiveau = getApprobateurNiveau(this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,getProbateurs) ;
              if (checkUserNiveau === 0) {
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }else if (checkUserNiveau === 1) {
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }else if (checkUserNiveau === 2) {
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }else if (checkUserNiveau === 3) {
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"Approuver",
                  "StatusDemandeV4":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }else if (checkUserNiveau === 4) {
                formData = {
                  "DemandeurId": this.state.demandeAffectation === "me" ? currentUser.Id : this.state.remplacantID,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuver par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"Approuver",
                  "StatusDemandeV4":"Approuver",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": this.state.remplacantName
                }
              }
              
            }else {
              const checkUserNiveau = getApprobateurNiveau(currentUser.Id ,getProbateurs) ;
              if (checkUserNiveau === 0) {
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV1,
                  "StatusDemandeV1":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }else if (checkUserNiveau === 1) {
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV2,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }else if (checkUserNiveau === 2) {
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV3,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"En cours",
                  "StatusDemandeV3":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }else if (checkUserNiveau === 3) {
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "En cours de " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"Approuver",
                  "StatusDemandeV4":"En cours",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }else if (checkUserNiveau === 4) {
                formData = {
                  "DemandeurId":currentUser.Id ,
                  "EcoleId":getProbateurs[0].ID ,
                  "FamilleProduit": data[0].FamilleSelected[0].text,
                  "FamilleProduitREF": data[0].FamilleSelected[0].key,
                  "Beneficiaire": data[0].BeneficiareSelected[0].text,
                  "BeneficiaireID": data[0].BeneficiareSelected[0].key,
                  "PrixTotal":prixTotal.toString(),
                  "DelaiLivraisionSouhaite":data[0].numberOfDays,
                  "Prix": "test ...." ,
                  "Quantite": "test ....",
                  "SousFamilleProduit": data[0].SousFamilleSelected[0].text,
                  "SousFamilleProduitREF": data[0].SousFamilleSelected[0].key,
                  "StatusDemande": "Approuver par " + getProbateurs[0].UserDisplayNameV4,
                  "StatusDemandeV1":"Approuver",
                  "StatusDemandeV2":"Approuver",
                  "StatusDemandeV3":"Approuver",
                  "StatusDemandeV4":"Approuver",
                  "Produit": JSON.stringify(ArticleList),
                  "CreerPar": currentUser.Title
                }
              }
            }
          }
          
          const sendData: IItemAddResult = await Web(this.props.url).lists.getByTitle("DemandeAchat").items.add(formData);
    
          ArticleList.map(async articleData => {
            await this.attachFileToItem(sendData.data.ID)
          })
    
          
    
          console.log('testtt',getProbateurs)
          if (getProbateurs[0].ApprobateurV4Id === null){
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
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "StatusApprobateurV1": "En cours",
                "StatusApprobateurV2": "",
                "StatusApprobateurV3": "",
                "StatusApprobateurV4": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "***",
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
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "StatusApprobateurV1": "Approuver",
                "StatusApprobateurV2": "En cours",
                "StatusApprobateurV3": "",
                "StatusApprobateurV4": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "***",
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
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "StatusApprobateurV1": "Approuver",
                "StatusApprobateurV2": "Approuver",
                "StatusApprobateurV3": "En cours",
                "StatusApprobateurV4": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "***",
                "Step": "three"
              });
              console.log(sendApprobateursData)



            }else if (checkUserNiveau === 3){
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
                "ApprobateurV3Id": { results: getProbateurs[0].ApprobateurV3Id },
                "StatusApprobateurV1": "Approuver",
                "StatusApprobateurV2": "Approuver",
                "StatusApprobateurV3": "Approuver",
                "StatusApprobateurV4": "***",
                "CommentaireApprobateurV1": "",
                "CommentaireApprobateurV2": "",
                "CommentaireApprobateurV3": "",
                "CommentaireApprobateurV4": "***",
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
                "StatusApprobateurV1": "Approuver",
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
                "StatusApprobateurV1": "Approuver",
                "StatusApprobateurV2": "Approuver",
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
                "StatusApprobateurV1": "Approuver",
                "StatusApprobateurV2": "Approuver",
                "StatusApprobateurV3": "Approuver",
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
                "StatusApprobateurV1": "Approuver",
                "StatusApprobateurV2": "Approuver",
                "StatusApprobateurV3": "Approuver",
                "StatusApprobateurV4": "Approuver",
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
  private checkRemplacantDemandes = async (): Promise<any[]> => {
    try {
      const currentUserID: number = (await Web(this.props.url).currentUser.get()).Id;
      const now: string = new Date().toISOString(); // Format the current date to ISO 8601
      const remplacantTest = await Web(this.props.url).lists.getByTitle('RemplacantsModuleAchat').items
      .filter(`RemplacantId eq ${currentUserID} and DateDeDebut lt '${now}' and DateDeFin gt '${now}' and TypeRemplacement eq 'D'`)
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
  
  

  private loadUserInfo() {
    console.log(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
    this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
      .then(user => {
        console.log(user)
        this.setState({
          userName:user["displayName"],
          userEmail:user["mail"],
          userRegistrationNumber:user["employeeId"],
          userEstablishment:user["companyName"],
          JobTitle:user["jobTitle"],
        })
      });
  }


  private checkUserPermissionsPerchaseModule = async() => {
    const userInfo = await this._graphService.getUserId(this.props.context.pageContext.legacyPageContext["userPrincipalName"])
    // const permissions = await getBenefList(userInfo["employeeId"])
    const permissions = await getBenefList("1017")
    if(permissions['Status'] !== "200"){
      window.location.href = "https://universitecentrale.sharepoint.com/sites/Intranet-preprod";
    }else {
      if (permissions['StatusAll'] === true){
        this.setState({DisabledBenef: false})
      }else {
        this.setState({DisabledBenef: true})
      }
    }
  }


  async componentDidMount() {

    // const listApprouvers = await this.getUserApprouvers("01002", "AAC NABEUL") ;
    // console.log(listApprouvers)

    await this.checkUserPermissionsPerchaseModule()
    await this.checkUserActions() ;

    // Get user info
    this.loadUserInfo();
    
    console.log(this.state.userRegistrationNumber)

    // Check if user have remplacant or not
    const checkTestRemplacant = await this.checkRemplacantDemandes() ;
    if (checkTestRemplacant.length > 0){
      this.setState({checkRemplacant: true, showAnotePopUp: true, remplacantName: checkTestRemplacant[0].Demandeur.Title, remplacantID:checkTestRemplacant[0].DemandeurId})
    }

    // Get all famille products
    const listFamilleProduit = [] ;
    const familyProducts = await getFamily() ;
    familyProducts.Families.map(famille => {
      listFamilleProduit.push({
        key: famille.IdFamily,
        text: famille.DescFamily,
        data: { icon: 'CircleShapeSolid', colorName: "#ff0000" }
      })
    })
    this.setState({familyProducts:listFamilleProduit})
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
                    {this.state.checkRemplacant && <tr>
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


                  {this.state.DisabledBenef && 
                    <div className={stylescustom.data}>
                      <p className={stylescustom.title}>* Bénificaire / Déstinataire</p>
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
                    </div>
                  }
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


            {this.state.checkActionCurrentUser && <div className={stylescustom.btncont}>
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
